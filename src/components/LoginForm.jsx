import React, { useState } from 'react';
import { loginUser } from '../config/firebase';
import { normalizeMember } from '../utils/balance';

export default function LoginForm() {
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

      const member = normalizeMember(username);
      if (!member) {
        setError('使用者名稱或密碼錯誤');
        setUsername('');
        setPassword('');
        setIsLoading(false);
        return;
      }

      // 登入成功後由 App 的 onAuthStateChanged 接手切換畫面
      await loginUser(username, password);
      localStorage.setItem('eurapay_username', member);
    } catch (loginError) {
      if (loginError.code === 'auth/too-many-requests') {
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

  const inputClass =
    'w-full rounded-lg border border-milktea-300 bg-white px-4 py-2.5 text-milktea-950 placeholder:text-milktea-600 focus:border-milktea-500 focus:outline-none focus:ring-2 focus:ring-milktea-500/30 disabled:bg-milktea-100';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-milktea-100 via-milktea-50 to-milktea-200 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-milktea-200">
        <div className="mb-8 text-center">
          <span aria-hidden="true" className="text-3xl">🍵</span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-milktea-950">EuraPay</h1>
          <p className="mt-1 text-xs text-milktea-800">Elmo &amp; Eura 分帳系統</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium tracking-wide text-milktea-900" htmlFor="login-username">
              使用者名稱
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Elmo 或 Eura"
              className={inputClass}
              disabled={isLoading}
              autoFocus
              autoCapitalize="none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium tracking-wide text-milktea-900" htmlFor="login-password">
              密碼
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="輸入密碼"
              className={inputClass}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-clay-50 px-4 py-3 text-sm text-clay-700 ring-1 ring-clay-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full rounded-lg bg-milktea-600 px-4 py-2.5 font-semibold text-white transition hover:bg-milktea-700 disabled:bg-milktea-300"
          >
            {isLoading ? '登入中…' : '登入'}
          </button>
        </form>
      </div>
    </div>
  );
}
