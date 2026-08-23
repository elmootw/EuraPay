import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import LoginForm from './components/LoginForm';
import { loadExpenses, saveExpenses } from './services/sheetService';
import { buildSettlementRecord } from './utils/balance';
import { auth, logoutUser } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        loadInitialData();
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loadInitialData = async () => {
    try {
      const data = await loadExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('載入資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    loadInitialData();
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setExpenses([]);
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  const handleAddExpense = async (newExpense) => {
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
    setShowForm(false);
  };

  const handleClearExpenses = async () => {
    console.log('🧹 開始結清帳務...');

    const settlement = buildSettlementRecord(expenses);

    // 只附加一筆結算紀錄，之前的帳目保留在歷史中
    const updatedExpenses = [...expenses, settlement];
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
    console.log('✅ 帳務已結清:', settlement.description);
  };

  return (
    <div className="min-h-screen bg-milktea-50">
      {!isAuthenticated ? (
        <LoginForm onLogin={handleLogin} />
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
