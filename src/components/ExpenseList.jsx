import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

function ExpenseList({ expenses }) {
  const displayExpenses = [...expenses].reverse();

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold text-milktea-700 mb-4">📋 帳務紀錄</h3>
      
      {displayExpenses.length === 0 ? (
        <div className="bg-milktea-100 rounded-lg p-6 text-center text-gray-600">
          <p>暫無帳務紀錄</p>
        </div>
      ) : (
        displayExpenses.map((expense) => {
          if (expense.type === 'CLEAR') {
            return (
              <div key={expense.id} className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-yellow-700 font-bold">🧹 {expense.description}</p>
                    <p className="text-sm text-yellow-600">
                      {formatDistanceToNow(new Date(expense.timestamp), {
                        addSuffix: true,
                        locale: zhTW
                      })}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      {format(new Date(expense.timestamp), 'yyyy-MM-dd HH:mm:ss', { locale: zhTW })}
                    </p>
                  </div>
                  {expense.amount > 0 && (
                    <p className="text-2xl font-bold text-yellow-600">
                      ${expense.amount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            );
          }

          const displayAmount = expense.splitType === 'split' 
            ? (expense.amount / 2).toFixed(2) 
            : expense.amount.toFixed(2);

          return (
            <div
              key={expense.id}
              className="bg-white border-l-4 border-milktea-400 rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-gray-800">{expense.description}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(expense.timestamp), {
                      addSuffix: true,
                      locale: zhTW
                    })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(expense.timestamp), 'yyyy-MM-dd HH:mm:ss', { locale: zhTW })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-milktea-600">
                    ${displayAmount}
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {expense.paidBy === 'Elmo' ? '🤡 Elmo 付款' : '😺 Eura 付款'}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default ExpenseList;
