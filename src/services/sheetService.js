// 設定您的 Google Sheets ID 和 API 金鑰
const SHEET_ID = process.env.REACT_APP_SHEET_ID;

// 使用 Google Sheets API v4（需要 API 金鑰）
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

let doc;
let sheet;

const initializeSheet = async () => {
  if (doc) return;

  try {
    doc = new GoogleSpreadsheet(SHEET_ID);
    
    await doc.useServiceAccountAuth({
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo();
    sheet = doc.sheetsByIndex[0];
  } catch (error) {
    console.error('Google Sheets 初始化失敗:', error);
    throw error;
  }
};

const SCRIPT_URL = process.env.REACT_APP_SCRIPT_URL;

const callScript = async (payload, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log('📤 發送請求:', payload);
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'no-cors'
      });
      
      // no-cors 模式下無法讀取響應，改用 text 模式
      const text = await response.text();
      console.log('📥 收到回應:', text);
      return JSON.parse(text);
    } catch (error) {
      console.warn(`⚠️ 第 ${i + 1} 次嘗試失敗:`, error);
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
};

export const loadExpenses = async () => {
  try {
    console.log('🔄 從 Google Sheet 載入帳務中...');
    const result = await callScript({ action: 'get' });
    if (Array.isArray(result)) {
      console.log('✅ 載入成功，共', result.length, '筆');
      localStorage.setItem('eurapay_expenses', JSON.stringify(result));
      return result;
    }
    throw new Error('無效的響應格式');
  } catch (error) {
    console.warn('⚠️ 無法從 Google Sheet 載入，使用本地存儲:', error);
    const localData = localStorage.getItem('eurapay_expenses');
    return localData ? JSON.parse(localData) : [];
  }
};

export const saveExpenses = async (expenses) => {
  try {
    console.log('💾 保存帳務中，共', expenses.length, '筆');
    localStorage.setItem('eurapay_expenses', JSON.stringify(expenses));
    
    console.log('🗑️ 清空 Google Sheet...');
    await callScript({ action: 'clear' });
    
    for (let expense of expenses) {
      console.log('➕ 新增:', expense.description);
      await callScript({
        action: 'add',
        id: expense.id,
        timestamp: expense.timestamp,
        description: expense.description,
        amount: expense.amount,
        paidBy: expense.paidBy,
        type: expense.type,
        splitType: expense.splitType || 'full'
      });
    }
    
    console.log('✅ 已成功保存到 Google Sheet');
  } catch (error) {
    console.warn('❌ 無法保存到 Google Sheet:', error);
  }
};
