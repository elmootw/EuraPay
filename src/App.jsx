import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import LoginForm from './components/LoginForm';
import { subscribeExpenses, addExpense, addSettlement } from './services/sheetService';
import { buildSettlementRecord, normalizeMember, MEMBER_EMOJI } from './utils/balance';
import { auth, logoutUser } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const readViewer = () => normalizeMember(localStorage.getItem('eurapay_username'));

function App() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewer, setViewer] = useState(readViewer);
  const [error, setError] = useState('');

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(Boolean(user));
      if (user) {
        setViewer(readViewer());
      } else {
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

  // 記錄者只在已知登入者時附上，Firebase 不接受值為 undefined 的欄位
  const withCreator = (record) => (viewer ? { ...record, createdBy: viewer } : record);

  const handleAddExpense = async (newExpense) => {
    try {
      await addExpense(withCreator(newExpense));
      setShowForm(false);
    } catch (addError) {
      console.error('新增帳目失敗:', addError);
      setError('新增帳目失敗，請確認網路連線後再試');
    }
  };

  const handleClearExpenses = async () => {
    try {
      const settlement = withCreator(buildSettlementRecord(expenses));
      await addSettlement(settlement);
      console.log('✅ 帳務已結清:', settlement.description);
    } catch (settleError) {
      console.error('結清失敗:', settleError);
      setError('結清失敗，請確認網路連線後再試');
    }
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-milktea-50">
      <header className="sticky top-0 z-40 border-b border-milktea-200 bg-milktea-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div className="flex items-baseline gap-2">
            <span aria-hidden="true" className="text-xl">🍵</span>
            <h1 className="text-lg font-semibold tracking-tight text-milktea-950">EuraPay</h1>
            <p className="text-xs text-milktea-800">Elmo &amp; Eura</p>
          </div>
          <div className="flex items-center gap-3">
            {viewer && (
              <p className="text-sm font-medium text-milktea-950">
                {MEMBER_EMOJI[viewer]} {viewer}
              </p>
            )}
            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-milktea-900 ring-1 ring-milktea-300 transition hover:bg-milktea-100"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg bg-clay-50 px-4 py-3 text-sm text-clay-700 ring-1 ring-clay-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-16 text-center text-sm text-milktea-800">載入中…</p>
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
    </div>
  );
}

export default App;
