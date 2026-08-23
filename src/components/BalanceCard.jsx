import React from 'react';
import { formatAmount, MEMBER_EMOJI } from '../utils/balance';

function BalanceCard({ balanceInfo, activeCount = 0, viewer = null }) {
  if (!balanceInfo.debtor) {
    return (
      <section className="rounded-2xl bg-matcha-50 ring-1 ring-matcha-200 px-6 py-8 text-center">
        <p className="text-xs font-medium tracking-wide text-matcha-600">目前結餘</p>
        <p className="mt-3 text-2xl font-semibold text-matcha-800">帳務已結清</p>
        <p className="mt-2 text-xs text-matcha-600">沒有待結清的帳目</p>
      </section>
    );
  }

  const { debtor, creditor, amount } = balanceInfo;
  // 用「你」稱呼登入者，方向一眼就懂；未知登入者則直接顯示雙方名字
  const payerLabel = viewer === debtor ? '你' : debtor;
  const receiverLabel = viewer === creditor ? '你' : creditor;
  const payable = Math.round(amount);

  return (
    <section className="rounded-2xl bg-white ring-1 ring-milktea-200 px-6 py-8 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-milktea-800">目前結餘</p>

      {/* 一句話講完誰付給誰，取代原本方向不明的箭頭 */}
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-lg">
        <span className="font-semibold text-milktea-950">
          {MEMBER_EMOJI[debtor]} {payerLabel}
        </span>
        <span className="text-sm font-normal text-milktea-900">要付給</span>
        <span className="font-semibold text-milktea-950">
          {MEMBER_EMOJI[creditor]} {receiverLabel}
        </span>
      </p>

      <p className="mt-2 text-5xl font-bold tabular-nums tracking-tight text-clay-600">
        ${formatAmount(amount)}
      </p>

      <p className="mt-4 text-xs text-milktea-800">
        {activeCount} 筆未結清帳目
        {!Number.isInteger(amount) && ` · 結清時取整為 $${payable}`}
      </p>
    </section>
  );
}

export default BalanceCard;
