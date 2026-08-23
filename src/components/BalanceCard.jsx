import React from 'react';
import { formatAmount } from '../utils/balance';

function BalanceCard({ balanceInfo }) {
  if (!balanceInfo.debtor) {
    return (
      <div className="bg-green-100 border-2 border-green-400 rounded-lg p-6 text-center shadow-md">
        <p className="text-green-700 font-bold text-2xl">✅ 帳務已結清</p>
      </div>
    );
  }

  const debtorEmoji = balanceInfo.debtor === 'Elmo' ? '🤡' : '😺';
  const creditorEmoji = balanceInfo.creditor === 'Elmo' ? '🤡' : '😺';

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-milktea-500">
      <p className="text-gray-600 text-sm mb-2">結算金額</p>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1">
          <p className="text-gray-800 font-bold text-lg mb-2">
            {debtorEmoji} {balanceInfo.debtor} → {creditorEmoji} {balanceInfo.creditor}
          </p>
          <p className="text-3xl font-bold text-red-500">
            ${formatAmount(balanceInfo.amount)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default BalanceCard;
