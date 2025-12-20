import React, { useState } from 'react';
import { loginUser } from '../config/firebase';

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!username || !password) {
        setError('請輸入使用者名稱和密碼');
        setIsLoading(false);
        return;
      }

      const lowerUsername = username.toLowerCase();
      if (lowerUsername !== 'elmo' && lowerUsername !== 'eura') {
        setError('使用者名稱或密碼錯誤');
        setUsername('');
        setPassword('');
        setIsLoading(false);
        return;
      }

      await loginUser(username, password);
      localStorage.setItem('eurapay_username', username);
      onLogin();
    } catch (error) {
      if (error.code === 'auth/too-many-requests') {
        setError('嘗試次數過多，請稍後再試');
      } else {
        setError('使用者名稱或密碼錯誤');
      }
      
      setUsername('');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          EuraPay
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              使用者名稱
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="使用者名稱"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="輸入密碼"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {isLoading ? '登入中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  );
}
