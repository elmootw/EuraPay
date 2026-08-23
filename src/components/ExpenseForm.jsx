import React, { useState } from 'react';
import { MEMBER_EMOJI } from '../utils/balance';

const inputClass =
  'w-full rounded-lg border border-milktea-300 bg-white px-4 py-2.5 text-milktea-950 placeholder:text-milktea-600 focus:border-milktea-500 focus:outline-none focus:ring-2 focus:ring-milktea-500/30';

const labelClass = 'mb-2 block text-xs font-medium tracking-wide text-milktea-900';

// 保留真正的 radio input 以維持鍵盤與讀螢幕行為，外觀用 peer-checked 做成分段按鈕
function SegmentedOption({ name, value, checked, onChange, children }) {
  return (
    <label className="flex-1">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="block cursor-pointer rounded-lg px-3 py-2 text-center text-sm text-milktea-900 ring-1 ring-milktea-300 transition hover:bg-milktea-100 peer-checked:bg-milktea-600 peer-checked:font-medium peer-checked:text-white peer-checked:ring-milktea-600 peer-focus-visible:ring-2 peer-focus-visible:ring-milktea-500">
        {children}
      </span>
    </label>
  );
}

function ExpenseForm({ onSubmit, onCancel }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState('Elmo');
  const [splitType, setSplitType] = useState('full');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedAmount = Math.round(Number(amount));
    if (!description.trim()) {
      setError('請填寫項目名稱');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('金額請填寫大於 0 的數字');
      return;
    }

    setError('');
    setIsSaving(true);

    // 識別碼交給 Firebase 的 push key，避免同一毫秒新增時撞號
    const newExpense = {
      amount: parsedAmount,
      description: description.trim(),
      paidBy,
      timestamp: new Date().toISOString(),
      type: 'EXPENSE',
      splitType: splitType
    };

    try {
      await onSubmit(newExpense);
      setAmount('');
      setDescription('');
      setPaidBy('Elmo');
      setSplitType('full');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-milktea-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-milktea-200">
        <h2 className="mb-6 text-xl font-semibold text-milktea-950">新增帳目</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass} htmlFor="expense-amount">金額</label>
            <input
              id="expense-amount"
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className={`${inputClass} text-lg tabular-nums`}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="expense-description">項目</label>
            <input
              id="expense-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例：午餐、電影票"
              className={inputClass}
            />
          </div>

          <div>
            <span className={labelClass}>由誰付款</span>
            <div className="flex gap-2">
              <SegmentedOption
                name="paidBy"
                value="Elmo"
                checked={paidBy === 'Elmo'}
                onChange={(e) => setPaidBy(e.target.value)}
              >
                {MEMBER_EMOJI.Elmo} Elmo
              </SegmentedOption>
              <SegmentedOption
                name="paidBy"
                value="Eura"
                checked={paidBy === 'Eura'}
                onChange={(e) => setPaidBy(e.target.value)}
              >
                {MEMBER_EMOJI.Eura} Eura
              </SegmentedOption>
            </div>
          </div>

          <div>
            <span className={labelClass}>分攤方式</span>
            <div className="flex gap-2">
              <SegmentedOption
                name="splitType"
                value="full"
                checked={splitType === 'full'}
                onChange={(e) => setSplitType(e.target.value)}
              >
                全額記帳
              </SegmentedOption>
              <SegmentedOption
                name="splitType"
                value="split"
                checked={splitType === 'split'}
                onChange={(e) => setSplitType(e.target.value)}
              >
                平分
              </SegmentedOption>
            </div>
            <p className="mt-2 text-xs text-milktea-800">
              {splitType === 'split'
                ? '對方只算一半，付款人自己負擔另一半'
                : '對方欠全額'}
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-clay-50 px-4 py-3 text-sm text-clay-700 ring-1 ring-clay-200">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-lg bg-milktea-600 px-4 py-2.5 font-semibold text-white transition hover:bg-milktea-700 disabled:bg-milktea-300"
            >
              {isSaving ? '儲存中…' : '確認'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="rounded-lg px-4 py-2.5 font-medium text-milktea-900 ring-1 ring-milktea-300 transition hover:bg-milktea-100 disabled:opacity-60"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;
