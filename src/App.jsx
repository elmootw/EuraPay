import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import LoginForm from './components/LoginForm';
import { loadExpenses, saveExpenses } from './services/sheetService';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 檢查是否已登入
    const authenticated = localStorage.getItem('eurapay_authenticated') === 'true';
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      loadInitialData();
    } else {
      setLoading(false);
    }
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

  const handleLogout = () => {
    localStorage.removeItem('eurapay_authenticated');
    setIsAuthenticated(false);
    setExpenses([]);
  };

  const handleAddExpense = async (newExpense) => {
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
    setShowForm(false);
  };

  const handleClearExpenses = async () => {
    console.log('🧹 開始結清帳務...');
    
    let elmoOwes = 0;
    let euraOwes = 0;

    expenses.forEach(expense => {
      if (expense.type === 'CLEAR') return;
      if (expense.paidBy === 'Elmo') {
        euraOwes += expense.amount;
      } else if (expense.paidBy === 'Eura') {
        elmoOwes += expense.amount;
      }
    });

    const diff = euraOwes - elmoOwes;
    let clearDescription = '帳務已結清';
    let clearAmount = 0;

    if (diff > 0) {
      clearDescription = `Eura 支付 Elmo $${Math.round(diff)}`;
      clearAmount = Math.round(diff);
    } else if (diff < 0) {
      clearDescription = `Elmo 支付 Eura $${Math.round(Math.abs(diff))}`;
      clearAmount = Math.round(Math.abs(diff));
    }

    const clearRecord = {
      id: Date.now(),
      type: 'CLEAR',
      timestamp: new Date().toISOString(),
      description: clearDescription,
      amount: clearAmount
    };
    
    const clearedExpenses = [clearRecord];
    setExpenses(clearedExpenses);
    await saveExpenses(clearedExpenses);
    console.log('✅ 帳務已結清:', clearDescription);
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
