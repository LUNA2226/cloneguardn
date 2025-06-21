import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldIcon, ArrowLeftIcon } from 'lucide-react';
import { LanguageSwitcher } from '../../LanguageSwitcher';
export function ForgotPasswordPage({
  onBack
}) {
  const {
    t
  } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSent(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-6 rounded-lg">
        <div className="flex flex-col items-center">
          <div className="bg-cyan-400/10 p-3 rounded-full">
            <ShieldIcon className="h-8 w-8 text-cyan-400" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">
            {t('auth.forgot.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-400 text-center">
            {!isSent ? t('auth.forgot.subtitle') : t('auth.forgot.success')}
          </p>
        </div>
        {error && <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>}
        {!isSent ? <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                {t('auth.forgot.email')}
              </label>
              <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" placeholder="you@example.com" />
            </div>
            <div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? t('common.loading') : t('auth.forgot.submit')}
              </button>
            </div>
          </form> : <div className="mt-8">
            <button type="button" onClick={() => setIsSent(false)} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
              {t('auth.forgot.tryAgain')}
            </button>
          </div>}
        <div className="text-center">
          <button onClick={onBack} className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300">
            <ArrowLeftIcon size={16} className="mr-2" />
            {t('auth.forgot.back')}
          </button>
        </div>
      </div>
    </div>;
}