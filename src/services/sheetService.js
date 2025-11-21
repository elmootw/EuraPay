import { database } from '../config/firebase';
import { ref, get, set, remove } from 'firebase/database';

const STORAGE_KEY = 'eurapay_expenses';

export const loadExpenses = async () => {
  try {
    console.log('🔄 從 Firebase 載入帳務中...');
    const expensesRef = ref(database, 'expenses');
    const snapshot = await get(expensesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const expenses = Object.values(data).filter(e => e);
      console.log('✅ 載入成功，共', expenses.length, '筆');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      return expenses;
    } else {
      console.log('📭 Firebase 中無資料');
      const localData = localStorage.getItem(STORAGE_KEY);
      return localData ? JSON.parse(localData) : [];
    }
  } catch (error) {
    console.warn('⚠️ 無法從 Firebase 載入:', error);
    const localData = localStorage.getItem(STORAGE_KEY);
    return localData ? JSON.parse(localData) : [];
  }
};

export const saveExpenses = async (expenses) => {
  try {
    console.log('💾 保存帳務中，共', expenses.length, '筆');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    
    console.log('📤 上傳到 Firebase...');
    const expensesRef = ref(database, 'expenses');
    
    // 先清空
    await remove(expensesRef);
    
    // 寫入新資料
    const expensesData = {};
    expenses.forEach((expense, index) => {
      expensesData[expense.id || index] = expense;
    });
    await set(expensesRef, expensesData);
    
    console.log('✅ 已保存到 Firebase');
  } catch (error) {
    console.warn('❌ 保存失敗:', error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }
};
