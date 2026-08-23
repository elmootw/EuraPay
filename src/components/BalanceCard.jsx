import React from 'react';
import { formatAmount, MEMBER_EMOJI } from '../utils/balance';

const TONES = {
  // 應收：別人欠他
  positive: {
    card: 'bg-matcha-50 ring-matcha-200',
    amount: 'text-matcha-700',
    label: 'text-matcha-700',
    text: '應收',
  },
  // 應付：他要付出去
  negative: {
    card: 'bg-clay-50 ring-clay-200',
    amount: 'text-clay-600',
    label: 'text-clay-700',
    text: '應付',
  },
  zero: {
    card: 'bg-white ring-milktea-200',
    amount: 'text-milktea-800',
    label: 'text-milktea-800',
    text: '已結清',
  },
};

function MemberCard({ member, amount, isViewer }) {
  const tone = amount > 0 ? TONES.positive : amount < 0 ? TONES.negative : TONES.zero;
  // 正負號要明講，只給數字讀不出是應收還是應付
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : '';

  return (
    <div className={`rounded-2xl px-4 py-5 ring-1 ${tone.card}`}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-sm font-medium text-milktea-950">
          {MEMBER_EMOJI[member]} {member}
        </p>
        {isViewer && (
          <span className="shrink-0 rounded bg-milktea-200 px-1.5 py-0.5 text-xs font-medium text-milktea-950">
            你
          </span>
        )}
      </div>

      <p className={`mt-3 text-3xl font-bold tabular-nums tracking-tight ${tone.amount}`}>
        {sign}${formatAmount(Math.abs(amount))}
      </p>
      <p className={`mt-1 text-xs font-medium ${tone.label}`}>{tone.text}</p>
    </div>
  );
}

function BalanceCard({ balanceInfo, memberBalances, activeCount = 0, viewer = null }) {
  const isSettled = !balanceInfo.debtor;
  const payable = Math.round(balanceInfo.amount);

  return (
    <section>
      <p className="mb-3 text-xs font-medium tracking-wide text-milktea-800">目前結餘</p>

      <div className="grid grid-cols-2 gap-3">
        {memberBalances.map(({ member, amount }) => (
          <MemberCard
            key={member}
            member={member}
            amount={amount}
            isViewer={viewer === member}
          />
        ))}
      </div>

      <p className="mt-3 text-xs text-milktea-800">
        {isSettled ? (
          '帳務已結清，沒有待結清的帳目'
        ) : (
          <>
            {activeCount} 筆未結清帳目
            {!Number.isInteger(balanceInfo.amount) && ` · 結清時取整為 $${payable}`}
          </>
        )}
      </p>
    </section>
  );
}

export default BalanceCard;
