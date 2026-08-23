import React, { useMemo } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import {
  getLastSettledAt,
  getSharedAmount,
  formatAmount,
  isSettled,
  MEMBER_EMOJI,
} from '../utils/balance';

function ExpenseList({ expenses }) {
  const lastSettledAt = useMemo(() => getLastSettledAt(expenses), [expenses]);
  const displayExpenses = useMemo(() => [...expenses].reverse(), [expenses]);

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium tracking-wide text-milktea-800">帳務紀錄</h2>

      {displayExpenses.length === 0 ? (
        <div className="rounded-xl bg-milktea-100 px-6 py-8 text-center text-sm text-milktea-900">
          還沒有任何帳目
        </div>
      ) : (
        displayExpenses.map((expense) => {
          // 結清紀錄同時也是視覺上的分隔線：它以下的帳目都已結清
          if (expense.type === 'CLEAR') {
            return (
              <article
                key={expense.id}
                className="rounded-xl bg-matcha-50 px-4 py-3 ring-1 ring-matcha-200"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-matcha-800">
                      <span className="rounded bg-matcha-200 px-1.5 py-0.5 text-xs font-medium text-matcha-800">
                        結清
                      </span>
                      <span className="truncate">{expense.description}</span>
                    </p>
                    <p className="mt-1 text-xs text-matcha-600">
                      {formatDistanceToNow(new Date(expense.timestamp), { addSuffix: true, locale: zhTW })}
                      {' · '}
                      {format(new Date(expense.timestamp), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                    </p>
                  </div>
                  {expense.amount > 0 && (
                    <p className="shrink-0 text-lg font-semibold tabular-nums text-matcha-700">
                      ${expense.amount}
                    </p>
                  )}
                </div>
              </article>
            );
          }

          const settled = isSettled(expense, lastSettledAt);

          return (
            <article
              key={expense.id}
              className={`rounded-xl border-l-4 bg-white px-4 py-3 transition ${
                settled
                  ? 'border-milktea-200 ring-1 ring-milktea-100 opacity-60'
                  : 'border-milktea-400 ring-1 ring-milktea-200'
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-milktea-950">
                    <span className="truncate">{expense.description}</span>
                    {settled && (
                      <span className="shrink-0 rounded bg-milktea-100 px-1.5 py-0.5 text-xs font-normal text-milktea-900">
                        已結清
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-milktea-800">
                    {MEMBER_EMOJI[expense.paidBy]} {expense.paidBy} 付款
                    {expense.splitType === 'split' && ` · 平分 $${expense.amount}`}
                  </p>
                  <p className="mt-0.5 text-xs text-milktea-800">
                    {formatDistanceToNow(new Date(expense.timestamp), { addSuffix: true, locale: zhTW })}
                    {' · '}
                    {format(new Date(expense.timestamp), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                  </p>
                </div>
                <p className="shrink-0 text-lg font-semibold tabular-nums text-milktea-800">
                  ${formatAmount(getSharedAmount(expense))}
                </p>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}

export default ExpenseList;
