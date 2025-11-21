const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const SCRIPT_URL = process.env.REACT_APP_SCRIPT_URL;
const STORAGE_KEY = 'eurapay_expenses';

export const loadExpenses = async () => {
  try {
    console.log('🔄 從 Google Sheet 載入帳務中...');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A:G?key=${API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    const values = data.values || [];
    
    const expenses = values.slice(1).map(row => ({
      id: row[0] ? row[0].toString() : '',
      timestamp: row[1] ? row[1].toString() : '',
      description: row[2] ? row[2].toString() : '',
      amount: parseFloat(row[3]) || 0,
      paidBy: row[4] ? row[4].toString() : '',
      type: row[5] ? row[5].toString() : 'EXPENSE',
      splitType: row[6] ? row[6].toString() : 'full'
    })).filter(e => e.id);
    
    console.log('✅ 載入成功，共', expenses.length, '筆');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    return expenses;
  } catch (error) {
    console.warn('⚠️ 無法從 Google Sheet 載入:', error);
    const localData = localStorage.getItem(STORAGE_KEY);
    return localData ? JSON.parse(localData) : [];
  }
};

export const saveExpenses = async (expenses) => {
  try {
    console.log('💾 保存帳務中，共', expenses.length, '筆');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    
    // 使用 Apps Script 寫入
    console.log('📤 上傳到 Google Sheet...');
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'save',
        expenses: expenses
      })
    });
    
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    
    console.log('✅ 已保存到 Google Sheet');
  } catch (error) {
    console.warn('❌ 保存失敗:', error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }
};
