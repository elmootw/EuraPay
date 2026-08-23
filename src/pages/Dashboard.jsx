import React, { useMemo } from 'react';
import BalanceCard from '../components/BalanceCard';
import ExpenseList from '../components/ExpenseList';
import { calculateBalance } from '../utils/balance';

function Dashboard({ expenses, onAddClick, onClear }) {
  const balanceInfo = useMemo(() => calculateBalance(expenses), [expenses]);

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
          onClick={() => {
            if (window.confirm('確認要清除所有帳務紀錄嗎？')) {
              onClear();
            }
          }}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition"
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
