import React, { useState } from 'react';

function ExpenseForm({ onSubmit, onCancel }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState('Elmo');
  const [splitType, setSplitType] = useState('full');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !description) {
      alert('請填寫所有欄位');
      return;
    }

    const newExpense = {
      id: Date.now(),
      amount: Math.round(parseInt(amount, 10)),
      description,
      paidBy,
      timestamp: new Date().toISOString(),
      type: 'EXPENSE',
      splitType: splitType
    };

    onSubmit(newExpense);
    setAmount('');
    setDescription('');
    setPaidBy('Elmo');
    setSplitType('full');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold text-milktea-700 mb-6">新增帳目</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 金額輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 金額
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="輸入金額"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-milktea-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* 項目描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 項目
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例：午餐、電影票"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-milktea-500 focus:border-transparent"
            />
          </div>

          {/* 付款人選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👤 由誰付款
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="Elmo"
                  checked={paidBy === 'Elmo'}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="mr-2"
                />
                <span>🤡 Elmo</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="Eura"
                  checked={paidBy === 'Eura'}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="mr-2"
                />
                <span>😺 Eura</span>
              </label>
            </div>
          </div>

          {/* 分攤方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔀 分攤方式
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="full"
                  checked={splitType === 'full'}
                  onChange={(e) => setSplitType(e.target.value)}
                  className="mr-2"
                />
                <span>全額記帳</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="split"
                  checked={splitType === 'split'}
                  onChange={(e) => setSplitType(e.target.value)}
                  className="mr-2"
                />
                <span>平分</span>
              </label>
            </div>
          </div>

          {/* 按鈕 */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-milktea-500 hover:bg-milktea-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              ✅ 確認
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
            >
              ❌ 取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;
