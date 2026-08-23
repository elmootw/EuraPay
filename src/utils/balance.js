export const SETTLEMENT_TYPE = 'CLEAR';

export const MEMBERS = ['Elmo', 'Eura'];

export const MEMBER_EMOJI = { Elmo: '🤡', Eura: '😺' };

// 把任意大小寫的名字對回正式成員名，不是成員則回傳 null
export const normalizeMember = (name) =>
  MEMBERS.find(member => member.toLowerCase() === String(name || '').toLowerCase()) || null;

// 取得最近一次結清的時間點，在那之前的帳目不列入當前結餘
export const getLastSettledAt = (expenses) => {
  let last = null;
  expenses.forEach(expense => {
    if (expense.type !== SETTLEMENT_TYPE || !expense.timestamp) return;
    if (!last || expense.timestamp > last) last = expense.timestamp;
  });
  return last;
};

// 判斷一筆帳目是否已被結清（結清紀錄本身不算）
export const isSettled = (expense, lastSettledAt) =>
  expense.type !== SETTLEMENT_TYPE &&
  Boolean(lastSettledAt) &&
  expense.timestamp <= lastSettledAt;

// 最近一次結清之後、還在計算中的帳目
export const getActiveExpenses = (expenses) => {
  const lastSettledAt = getLastSettledAt(expenses);
  return expenses.filter(expense =>
    expense.type !== SETTLEMENT_TYPE && !isSettled(expense, lastSettledAt)
  );
};

// 依結清紀錄把帳目切成一段一段，最後一段沒有結清紀錄，代表當期未結清
export const groupBySettlement = (expenses) => {
  const ordered = [...expenses].sort((a, b) =>
    String(a.timestamp).localeCompare(String(b.timestamp))
  );

  const groups = [];
  let current = [];

  ordered.forEach(expense => {
    if (expense.type === SETTLEMENT_TYPE) {
      groups.push({ settlement: expense, expenses: current });
      current = [];
    } else {
      current.push(expense);
    }
  });

  groups.push({ settlement: null, expenses: current });
  return groups;
};

// 平分的帳目只有一半算在對方頭上
export const getSharedAmount = (expense) =>
  expense.splitType === 'split' ? expense.amount / 2 : expense.amount;

// 顯示金額：整數不補小數，平分產生的 .5 保留
export const formatAmount = (amount) =>
  Number.isInteger(amount) ? String(amount) : amount.toFixed(1);

export const calculateBalance = (expenses) => {
  let elmoOwes = 0;
  let euraOwes = 0;

  getActiveExpenses(expenses).forEach(expense => {
    const amount = getSharedAmount(expense);
    if (expense.paidBy === 'Elmo') {
      euraOwes += amount;
    } else if (expense.paidBy === 'Eura') {
      elmoOwes += amount;
    }
  });

  const diff = euraOwes - elmoOwes;

  if (diff > 0) {
    return { debtor: 'Eura', creditor: 'Elmo', amount: diff, label: 'Eura 欠 Elmo' };
  }
  if (diff < 0) {
    return { debtor: 'Elmo', creditor: 'Eura', amount: Math.abs(diff), label: 'Elmo 欠 Eura' };
  }
  return { debtor: null, creditor: null, amount: 0, label: '帳務已結清' };
};

// 實際轉帳金額取整數（0.5 元無法轉帳），只在結清時取一次以免累積誤差
export const buildSettlementRecord = (expenses) => {
  const { debtor, creditor, amount } = calculateBalance(expenses);
  const payable = Math.round(amount);

  return {
    type: SETTLEMENT_TYPE,
    timestamp: new Date().toISOString(),
    description: debtor ? `${debtor} 支付 ${creditor} $${payable}` : '帳務已結清',
    amount: debtor ? payable : 0,
  };
};
