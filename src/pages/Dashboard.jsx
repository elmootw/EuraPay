import React, { useMemo } from 'react';
import BalanceCard from '../components/BalanceCard';
import ExpenseList from '../components/ExpenseList';
import { calculateBalance, getActiveExpenses, getMemberBalances } from '../utils/balance';

function Dashboard({ expenses, onAddClick, onClear }) {
  const balanceInfo = useMemo(() => calculateBalance(expenses), [expenses]);
  const activeCount = useMemo(() => getActiveExpenses(expenses).length, [expenses]);
  const memberBalances = useMemo(() => getMemberBalances(expenses), [expenses]);

  const handleClearClick = () => {
    const message = balanceInfo.debtor
      ? `結清後會記下一筆「${balanceInfo.debtor} 支付 ${balanceInfo.creditor} $${Math.round(balanceInfo.amount)}」，之前的帳目會保留在歷史紀錄中。確認結清嗎？`
      : '目前已無未結帳目，確認要記錄一筆結清嗎？';

    if (window.confirm(message)) {
      onClear();
    }
  };

  return (
    <div className="space-y-8">
      <BalanceCard
        balanceInfo={balanceInfo}
        memberBalances={memberBalances}
        activeCount={activeCount}
      />

      {/* 主要動作只有一個：新增。結清是次要動作，樣式退一階 */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onAddClick}
          className="flex-1 rounded-lg bg-milktea-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-milktea-700 focus:outline-none focus:ring-2 focus:ring-milktea-500 focus:ring-offset-2 focus:ring-offset-milktea-50"
        >
          新增帳目
        </button>
        <button
          onClick={handleClearClick}
          disabled={activeCount === 0}
          className="rounded-lg px-6 py-3 font-medium text-milktea-900 ring-1 ring-milktea-300 transition hover:bg-milktea-100 disabled:text-milktea-400 disabled:ring-milktea-200 disabled:hover:bg-transparent"
        >
          結清帳務
        </button>
      </div>

      <ExpenseList expenses={expenses} />
    </div>
  );
}

export default Dashboard;
