import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldIcon, EyeIcon, EyeOffIcon, MailIcon, CheckCircleIcon } from 'lucide-react';
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
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

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
        // Check if user exists in users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError && userError.code === 'PGRST116') {
          // User doesn't exist in users table, create record
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              nome: data.user.user_metadata?.full_name || '',
              plano: 'starter'
            });

          if (insertError) {
            console.error('Error creating user record:', insertError);
            // Don't block login even if there's an error
          }
        }

        onLogin();
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Translate common error messages to English
      let errorMessage = err.message;
      
      if (err.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (err.message.includes('Email not confirmed')) {
        errorMessage = 'Email not confirmed. Please check your inbox and confirm your email.';
      } else if (err.message.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
      } else if (err.message.includes('User not found')) {
        errorMessage = 'User not found. Please check your email or create a new account.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setResetEmailSent(true);
    } catch (err) {
      console.error('Error sending recovery email:', err);
      
      let errorMessage = err.message;
      
      if (err.message.includes('User not found')) {
        errorMessage = 'Email not found. Please check the email address or create a new account.';
      } else if (err.message.includes('Email rate limit exceeded')) {
        errorMessage = 'Email rate limit exceeded. Please wait a few minutes before trying again.';
      }
      
      setResetError(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  const resetForgotPasswordForm = () => {
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setResetEmail('');
    setResetError('');
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
            {showForgotPassword ? 'Reset Password' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {showForgotPassword 
              ? 'Enter your email to receive password reset instructions'
              : 'Sign in to your account to continue'
            }
          </p>
        </div>

        {/* Password Recovery Form */}
        {showForgotPassword && (
          <>
            {resetEmailSent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircleIcon className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Email Sent!
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    We've sent password reset instructions to <strong>{resetEmail}</strong>. 
                    Please check your inbox and follow the instructions to reset your password.
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Didn't receive the email? Check your spam folder or try again in a few minutes.
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setResetEmailSent(false);
                      setResetEmail('');
                    }}
                    className="w-full py-2 px-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Send again
                  </button>
                  <button
                    onClick={resetForgotPasswordForm}
                    className="w-full py-2 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            ) : (
              <>
                {resetError && (
                  <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">
                    {resetError}
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleForgotPassword}>
                  <div>
                    <label htmlFor="reset-email" className="block text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="reset-email"
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="you@example.com"
                      />
                      <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resetLoading ? 'Sending...' : 'Send Instructions'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={resetForgotPasswordForm}
                      className="w-full py-2 px-4 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              </>
            )}
          </>
        )}

        {/* Login Form */}
        {!showForgotPassword && (
          <>
            {error && (
              <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      placeholder="you@example.com"
                    />
                    <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
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
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={onRegister}
                  className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}