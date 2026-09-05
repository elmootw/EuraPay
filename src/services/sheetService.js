import { database } from '../config/firebase';
import { ref, push, onValue, update } from 'firebase/database';

const STORAGE_KEY = 'eurapay_expenses';
const EXPENSES_PATH = 'expenses';

const readCache = () => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.warn('⚠️ 本地備份讀取失敗:', error);
    return [];
  }
};

// Firebase 的 key 就是每筆帳目的識別碼；舊資料自帶 id 則沿用
// 一律依 timestamp 排序，不依賴 key 的排序規則
//
// `path` 一律是 Firebase 的 key，刪除時只認它：舊資料的 `id` 可能與 key 不同，
// 拿 `id` 去組路徑會刪到不存在的節點（或別人的節點）
const normalize = (value) =>
  Object.entries(value || {})
    .map(([key, expense]) => ({ ...expense, id: expense?.id ?? key, path: key }))
    .filter(expense => expense && expense.timestamp)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

// 訂閱帳務變動，另一台裝置新增的帳目會自動出現。回傳取消訂閱的函式
export const subscribeExpenses = (onChange, onError) => {
  console.log('🔄 開始監聽 Firebase 帳務...');

  return onValue(
    ref(database, EXPENSES_PATH),
    (snapshot) => {
      const expenses = normalize(snapshot.val());
      console.log('✅ 同步完成，共', expenses.length, '筆');
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      } catch (error) {
        console.warn('⚠️ 本地備份寫入失敗:', error);
      }
      onChange(expenses);
    },
    (error) => {
      console.warn('⚠️ 無法從 Firebase 載入，改用本地備份:', error);
      if (onError) onError(error, readCache());
    }
  );
};

// 單筆新增，不動到其他帳目，兩人同時記帳也不會互相覆蓋
const appendRecord = async (record) => {
  const created = await push(ref(database, EXPENSES_PATH), record);
  return created.key;
};

export const addExpense = (expense) => appendRecord(expense);

// 結清只是再記一筆結算紀錄，之前的帳目保留在歷史中
export const addSettlement = (settlement) => appendRecord(settlement);

// 刪除紀錄（記錯帳、清測試資料用）。硬刪除，不留 tombstone —— 兩人共用
// 一份資料且沒有稽核需求，留著反而要在每個計算點過濾
//
// 一律走多路徑 update：已結清的那批帳目必須連同結清紀錄一起消失，
// 中途失敗會留下一張對不起來的結清單。update 是原子的，全成或全不成
export const deleteRecords = (paths) => {
  const targets = (paths || []).filter(Boolean);
  if (targets.length === 0) throw new Error('缺少要刪除的紀錄識別碼');

  const updates = {};
  targets.forEach(path => { updates[path] = null; });
  return update(ref(database, EXPENSES_PATH), updates);
};
