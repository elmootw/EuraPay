import React, { useMemo, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import {
  groupBySettlement,
  getSharedAmount,
  formatAmount,
  MEMBER_EMOJI,
} from '../utils/balance';

const timeLabel = (timestamp) => {
  const date = new Date(timestamp);
  return `${formatDistanceToNow(date, { addSuffix: true, locale: zhTW })} · ${format(date, 'yyyy/MM/dd HH:mm', { locale: zhTW })}`;
};

function ExpenseRow({ expense, settled }) {
  return (
    <article
      className={`rounded-xl border-l-4 bg-white px-4 py-3 ${
        settled
          ? 'border-milktea-200 ring-1 ring-milktea-100 opacity-70'
          : 'border-milktea-400 ring-1 ring-milktea-200'
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-milktea-950">{expense.description}</p>
          <p className="mt-1 text-xs text-milktea-800">
            {MEMBER_EMOJI[expense.paidBy]} {expense.paidBy} 付款
            {expense.splitType === 'split' && ` · 平分 $${expense.amount}`}
            {expense.createdBy && expense.createdBy !== expense.paidBy &&
              ` · 由 ${expense.createdBy} 記錄`}
          </p>
          <p className="mt-0.5 text-xs text-milktea-800">{timeLabel(expense.timestamp)}</p>
        </div>
        <p className="shrink-0 text-lg font-semibold tabular-nums text-milktea-800">
          ${formatAmount(getSharedAmount(expense))}
        </p>
      </div>
    </article>
  );
}

// 結清紀錄同時是該次結清明細的收合開關，預設收起
function SettledGroup({ settlement, expenses }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasDetails = expenses.length > 0;
  const panelId = `settlement-${settlement.id}`;

  const header = (
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-semibold text-matcha-800">
          <span className="shrink-0 rounded bg-matcha-200 px-1.5 py-0.5 text-xs font-medium text-matcha-800">
            結清
          </span>
          <span className="truncate">{settlement.description}</span>
        </p>
        <p className="mt-1 text-xs text-matcha-700">
          {timeLabel(settlement.timestamp)}
          {settlement.createdBy && ` · 由 ${settlement.createdBy} 結清`}
          {hasDetails && ` · ${expenses.length} 筆明細`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {settlement.amount > 0 && (
          <p className="text-lg font-semibold tabular-nums text-matcha-700">
            ${settlement.amount}
          </p>
        )}
        {hasDetails && (
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className={`h-4 w-4 text-matcha-700 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            fill="currentColor"
          >
            <path d="M7 5l6 5-6 5V5z" />
          </svg>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      {hasDetails ? (
        <button
          type="button"
          onClick={() => setIsOpen(open => !open)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="w-full rounded-xl bg-matcha-50 px-4 py-3 text-left ring-1 ring-matcha-200 transition hover:bg-matcha-100"
        >
          {header}
        </button>
      ) : (
        <div className="rounded-xl bg-matcha-50 px-4 py-3 ring-1 ring-matcha-200">{header}</div>
      )}

      {hasDetails && isOpen && (
        <div id={panelId} className="ml-4 space-y-2">
          {[...expenses].reverse().map(expense => (
            <ExpenseRow key={expense.id} expense={expense} settled />
          ))}
        </div>
      )}
    </div>
  );
}

function ExpenseList({ expenses }) {
  const groups = useMemo(() => groupBySettlement(expenses), [expenses]);
  const active = groups[groups.length - 1];
  const settledGroups = useMemo(() => groups.slice(0, -1).reverse(), [groups]);

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium tracking-wide text-milktea-800">帳務紀錄</h2>

      {expenses.length === 0 ? (
        <div className="rounded-xl bg-milktea-100 px-6 py-8 text-center text-sm text-milktea-900">
          還沒有任何帳目
        </div>
      ) : (
        <>
          {[...active.expenses].reverse().map(expense => (
            <ExpenseRow key={expense.id} expense={expense} />
          ))}

          {settledGroups.map(group => (
            <SettledGroup
              key={group.settlement.id}
              settlement={group.settlement}
              expenses={group.expenses}
            />
          ))}
        </>
      )}
    </section>
  );
}

export default ExpenseList;
