import React, { useMemo } from 'react';
import BalanceCard from '../components/BalanceCard';
import ExpenseList from '../components/ExpenseList';

function Dashboard({ expenses, onAddClick, onClear }) {
  const balance = useMemo(() => {
    let elmoOwes = 0;
    let euraOwes = 0;

    expenses.forEach(expense => {
      if (expense.type === 'CLEAR') return;
      
      let amount = expense.amount;
      
      // 如果是平分，則每人各佔一半
      if (expense.splitType === 'split') {
        amount = expense.amount / 2;
      }
      
      if (expense.paidBy === 'Elmo') {
        euraOwes += amount;
      } else if (expense.paidBy === 'Eura') {
        elmoOwes += amount;
      }
    });

    return { elmoOwes, euraOwes };
  }, [expenses]);

  const getBalanceInfo = () => {
    const diff = balance.euraOwes - balance.elmoOwes;
    if (diff > 0) {
      return { 
        debtor: 'Eura', 
        amount: diff, 
        creditor: 'Elmo',
        label: 'Eura 欠 Elmo' 
      };
    } else if (diff < 0) {
      return { 
        debtor: 'Elmo', 
        amount: Math.abs(diff), 
        creditor: 'Eura',
        label: 'Elmo 欠 Eura' 
      };
    }
    return { debtor: null, amount: 0, label: '帳務已結清' };
  };

  const balanceInfo = getBalanceInfo();

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
