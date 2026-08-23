import React, { useMemo } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { getLastSettledAt, getSharedAmount, formatAmount, isSettled } from '../utils/balance';

function ExpenseList({ expenses }) {
  const lastSettledAt = useMemo(() => getLastSettledAt(expenses), [expenses]);
  const displayExpenses = useMemo(() => [...expenses].reverse(), [expenses]);

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
                      ${expense.amount}
                    </p>
                  )}
                </div>
              </div>
            );
          }

          // 已結清的帳目保留在歷史中，但淡化顯示以區隔當前帳務
          const settled = isSettled(expense, lastSettledAt);

          return (
            <div
              key={expense.id}
              className={`bg-white border-l-4 rounded-lg p-4 shadow-sm transition ${
                settled
                  ? 'border-gray-300 opacity-60'
                  : 'border-milktea-400 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-gray-800">
                    {expense.description}
                    {settled && (
                      <span className="ml-2 align-middle text-xs font-normal bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                        已結清
                      </span>
                    )}
                  </p>
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
                  <p className={`text-2xl font-bold ${settled ? 'text-gray-500' : 'text-milktea-600'}`}>
                    ${formatAmount(getSharedAmount(expense))}
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {expense.paidBy === 'Elmo' ? '🤡 Elmo 付款' : '😺 Eura 付款'}
                  </p>
                  {expense.splitType === 'split' && (
                    <p className="text-xs text-gray-400">
                      平分 ${expense.amount}
                    </p>
                  )}
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
