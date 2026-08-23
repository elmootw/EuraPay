import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import LoginForm from './components/LoginForm';
import { subscribeExpenses, addExpense, addSettlement } from './services/sheetService';
import { buildSettlementRecord } from './utils/balance';
import { auth, logoutUser } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(Boolean(user));
      if (!user) {
        setExpenses([]);
        setLoading(false);
      }
    });
  }, []);

  // 登入後持續監聽，另一台裝置的變動會即時反映
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    setLoading(true);
    return subscribeExpenses(
      (data) => {
        setExpenses(data);
        setError('');
        setLoading(false);
      },
      (syncError, cached) => {
        setExpenses(cached);
        setError('目前無法連線，顯示的是本地備份資料，新增的帳目不會被儲存');
        setLoading(false);
      }
    );
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (logoutError) {
      console.error('登出失敗:', logoutError);
    }
  };

  const handleAddExpense = async (newExpense) => {
    try {
      await addExpense(newExpense);
      setShowForm(false);
    } catch (addError) {
      console.error('新增帳目失敗:', addError);
      setError('新增帳目失敗，請確認網路連線後再試');
    }
  };

  const handleClearExpenses = async () => {
    try {
      const settlement = buildSettlementRecord(expenses);
      await addSettlement(settlement);
      console.log('✅ 帳務已結清:', settlement.description);
    } catch (settleError) {
      console.error('結清失敗:', settleError);
      setError('結清失敗，請確認網路連線後再試');
    }
  };

  return (
    <div className="min-h-screen bg-milktea-50">
      {!isAuthenticated ? (
        <LoginForm />
      ) : (
        <>
          <header className="bg-milktea-600 text-white shadow-lg">
            <div className="max-w-2xl mx-auto px-4 py-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">🍵 EuraPay</h1>
                <p className="text-milktea-100">Elmo & Eura 分帳系統</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-milktea-700 hover:bg-milktea-800 text-white px-4 py-2 rounded-lg transition"
              >
                登出
              </button>
            </div>
          </header>

          <main className="max-w-2xl mx-auto px-4 py-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">載入中...</p>
              </div>
            ) : (
              <>
                <Dashboard
                  expenses={expenses}
                  onAddClick={() => setShowForm(!showForm)}
                  onClear={handleClearExpenses}
                />

                {showForm && (
                  <ExpenseForm
                    onSubmit={handleAddExpense}
                    onCancel={() => setShowForm(false)}
                  />
                )}
              </>
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
