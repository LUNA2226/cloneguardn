import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { LanguageSwitcher } from '../../LanguageSwitcher';
import { supabase } from '../../../lib/supabase';

export function LoginPage({
  onRegister,
  onForgotPassword,
  onLogin
}) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        onLogin();
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-6 rounded-lg">
        <div className="flex flex-col items-center">
          <div className="bg-cyan-400/10 p-3 rounded-full">
            <ShieldIcon className="h-8 w-8 text-cyan-400" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">
            {t('auth.login.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {t('auth.login.subtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                {t('auth.login.email')}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                {t('auth.login.password')}
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                {t('auth.login.remember')}
              </label>
            </div>

            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
              {t('auth.login.forgot')}
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('auth.login.submit')}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            {t('auth.login.noAccount')}{' '}
            <button
              onClick={onRegister}
              className="font-medium text-cyan-400 hover:text-cyan-300"
            >
              {t('auth.login.register')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}