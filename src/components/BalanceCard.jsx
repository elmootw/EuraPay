import React from 'react';

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
      <p className="text-gray-600 text-sm mb-2">{balanceInfo.label}</p>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-red-600 font-bold text-xl">
            {debtorEmoji} {balanceInfo.debtor} 欠
          </p>
          <p className="text-3xl font-bold text-red-500">
            ${balanceInfo.amount}
          </p>
        </div>
        <div className="text-right">
          <p className="text-green-600 font-bold text-xl">
            {creditorEmoji} {balanceInfo.creditor} 被欠
          </p>
          <p className="text-3xl font-bold text-green-500">
            ${balanceInfo.amount}
          </p>
        </div>
      </div>
    </div>
  );
}

export default BalanceCard;
