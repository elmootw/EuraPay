import React, { useMemo, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import {
  groupBySettlement,
  getSharedAmount,
  formatAmount,
  MEMBER_EMOJI,
} from '../utils/balance';

// 刪除鈕：不可逆的動作，樣式壓到最低，避免和「新增／結清」搶視線
function DeleteButton({ onClick, label, tone = 'milktea' }) {
  const styles = tone === 'matcha'
    ? 'text-matcha-700 hover:bg-matcha-200 focus-visible:ring-matcha-500'
    : 'text-milktea-800 hover:bg-milktea-100 focus-visible:ring-milktea-500';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`-mr-1 shrink-0 rounded p-1 transition hover:text-clay-700 focus:outline-none focus-visible:ring-2 ${styles}`}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M8 2h4a1 1 0 0 1 1 1v1h3.5a.75.75 0 0 1 0 1.5h-.6l-.7 10.1A2 2 0 0 1 13.2 18H6.8a2 2 0 0 1-2-1.9L4.1 5.5h-.6a.75.75 0 0 1 0-1.5H7V3a1 1 0 0 1 1-1zm0 3h4V3.5H8V5zM8.25 7.5a.75.75 0 0 0-.75.75v6a.75.75 0 0 0 1.5 0v-6a.75.75 0 0 0-.75-.75zm3.5 0a.75.75 0 0 0-.75.75v6a.75.75 0 0 0 1.5 0v-6a.75.75 0 0 0-.75-.75z" />
      </svg>
    </button>
  );
}

// 建檔資訊：誰填的、什麼時候填的。與帳務內容分屬不同層次，因此獨立成一行
// 刪除鈕併在同一行右側 —— 它作用在「這筆紀錄」上，和建檔資訊是同一個層次
function RecordMeta({ createdBy, timestamp, tone = 'milktea', action }) {
  const date = new Date(timestamp);
  const styles = tone === 'matcha'
    ? 'border-matcha-200 text-matcha-700'
    : 'border-milktea-100 text-milktea-800';

  return (
    <div className={`mt-2 flex items-center justify-between gap-2 border-t pt-2 text-xs ${styles}`}>
      <p className="min-w-0 truncate">
        {createdBy && `${createdBy} 記錄 · `}
        {formatDistanceToNow(date, { addSuffix: true, locale: zhTW })}
        {' · '}
        {format(date, 'yyyy/MM/dd HH:mm', { locale: zhTW })}
      </p>
      {action}
    </div>
  );
}

function ExpenseRow({ expense, settled, onDelete }) {
  const handleDelete = () => {
    const shared = formatAmount(getSharedAmount(expense));
    if (window.confirm(`確定刪除「${expense.description}」（$${shared}）嗎？刪除後無法復原，結餘會立刻重算。`)) {
      onDelete(expense);
    }
  };

  return (
    <article
      className={`rounded-xl border-l-4 bg-white px-4 py-3 ${
        settled
          ? 'border-milktea-200 ring-1 ring-milktea-100 opacity-70'
          : 'border-milktea-400 ring-1 ring-milktea-200'
      }`}
    >
      {/* 帳務內容：名目、金額、誰付錢、分攤方式 */}
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-milktea-950">{expense.description}</p>
          <p className="mt-1 text-xs text-milktea-800">
            {MEMBER_EMOJI[expense.paidBy]} {expense.paidBy} 付款
            {expense.splitType === 'split' ? ` · 平分 $${expense.amount}` : ' · 全額'}
          </p>
        </div>
        <p className="shrink-0 text-lg font-semibold tabular-nums text-milktea-800">
          ${formatAmount(getSharedAmount(expense))}
        </p>
      </div>

      <RecordMeta
        createdBy={expense.createdBy}
        timestamp={expense.timestamp}
        action={<DeleteButton onClick={handleDelete} label={`刪除 ${expense.description}`} />}
      />
    </article>
  );
}

// 結清紀錄同時是該次結清明細的收合開關，預設收起
function SettledGroup({ settlement, expenses, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasDetails = expenses.length > 0;
  const panelId = `settlement-${settlement.id}`;

  // 刪掉結清紀錄等於拆掉一道分隔線，它之前的帳目會重新併回當期結餘
  const handleDelete = () => {
    const warning = hasDetails
      ? `刪除這筆結清後，它底下的 ${expenses.length} 筆帳目會重新併入未結清結餘。`
      : '刪除後無法復原。';
    if (window.confirm(`確定刪除結清紀錄「${settlement.description}」嗎？${warning}`)) {
      onDelete(settlement);
    }
  };

  const summary = (
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-semibold text-matcha-800">
          <span className="shrink-0 rounded bg-matcha-200 px-1.5 py-0.5 text-xs font-medium text-matcha-800">
            結清
          </span>
          <span className="truncate">{settlement.description}</span>
        </p>
        {hasDetails && (
          <p className="mt-1 text-xs text-matcha-700">{expenses.length} 筆明細</p>
        )}
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
      {/* 收合開關只包住摘要那一塊：建檔資訊那行帶著刪除鈕，不能塞進 button 裡 */}
      <div className="rounded-xl bg-matcha-50 px-4 py-3 ring-1 ring-matcha-200">
        {hasDetails ? (
          <button
            type="button"
            onClick={() => setIsOpen(open => !open)}
            aria-expanded={isOpen}
            aria-controls={panelId}
            className="-mx-2 block w-[calc(100%+1rem)] rounded-lg px-2 py-1 text-left transition hover:bg-matcha-100"
          >
            {summary}
          </button>
        ) : (
          summary
        )}

        <RecordMeta
          createdBy={settlement.createdBy}
          timestamp={settlement.timestamp}
          tone="matcha"
          action={
            <DeleteButton
              onClick={handleDelete}
              label={`刪除結清紀錄 ${settlement.description}`}
              tone="matcha"
            />
          }
        />
      </div>

      {hasDetails && isOpen && (
        <div id={panelId} className="ml-4 space-y-2">
          {[...expenses].reverse().map(expense => (
            <ExpenseRow key={expense.id} expense={expense} settled onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExpenseList({ expenses, onDelete }) {
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
            <ExpenseRow key={expense.id} expense={expense} onDelete={onDelete} />
          ))}

          {settledGroups.map(group => (
            <SettledGroup
              key={group.settlement.id}
              settlement={group.settlement}
              expenses={group.expenses}
              onDelete={onDelete}
            />
          ))}
        </>
      )}
    </section>
  );
}

export default ExpenseList;
