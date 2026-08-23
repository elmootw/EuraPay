import React, { useMemo } from 'react';
import BalanceCard from '../components/BalanceCard';
import ExpenseList from '../components/ExpenseList';
import { calculateBalance, getActiveExpenses } from '../utils/balance';

function Dashboard({ expenses, onAddClick, onClear }) {
  const balanceInfo = useMemo(() => calculateBalance(expenses), [expenses]);
  const activeCount = useMemo(() => getActiveExpenses(expenses).length, [expenses]);

  const handleClearClick = () => {
    const message = balanceInfo.debtor
      ? `結清後會記下一筆「${balanceInfo.debtor} 支付 ${balanceInfo.creditor} $${Math.round(balanceInfo.amount)}」，之前的帳目會保留在歷史紀錄中。確認結清嗎？`
      : '目前已無未結帳目，確認要記錄一筆結清嗎？';

    if (window.confirm(message)) {
      onClear();
    }
  };

  return (
    <div className="space-y-6">
      {/* 淨額卡片 */}
      <BalanceCard balanceInfo={balanceInfo} />

      {/* 操作按鈕 */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <button
          onClick={onAddClick}
          className="flex-1 bg-milktea-500 hover:bg-milktea-600 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          ➕ 新增帳目
        </button>
        <button
          onClick={handleClearClick}
          disabled={activeCount === 0}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition"
        >
          🧹 結清帳務
        </button>
      </div>

      {/* 帳務紀錄列表 */}
      <ExpenseList expenses={expenses} />
    </div>
  );
}

export default Dashboard;
