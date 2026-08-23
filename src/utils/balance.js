export const SETTLEMENT_TYPE = 'CLEAR';

// 平分的帳目只有一半算在對方頭上
export const getSharedAmount = (expense) =>
  expense.splitType === 'split' ? expense.amount / 2 : expense.amount;

// 顯示金額：整數不補小數，平分產生的 .5 保留
export const formatAmount = (amount) =>
  Number.isInteger(amount) ? String(amount) : amount.toFixed(1);

export const calculateBalance = (expenses) => {
  let elmoOwes = 0;
  let euraOwes = 0;

  expenses.forEach(expense => {
    if (expense.type === SETTLEMENT_TYPE) return;

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
    id: Date.now(),
    type: SETTLEMENT_TYPE,
    timestamp: new Date().toISOString(),
    description: debtor ? `${debtor} 支付 ${creditor} $${payable}` : '帳務已結清',
    amount: debtor ? payable : 0,
  };
};
