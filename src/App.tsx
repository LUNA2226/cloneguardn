import React, { useEffect, useState } from 'react';
import './i18n';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ClonesPage } from './components/pages/ClonesPage';
import { ActionScreen } from './components/ActionScreen';
import { ProtectedDomains } from './components/ProtectedDomains';
import { Settings } from './components/Settings';
import { AddDomainPage } from './components/pages/AddDomainPage';
import { LoginPage } from './components/pages/auth/LoginPage';
import { RegisterPage } from './components/pages/auth/RegisterPage';
import { ForgotPasswordPage } from './components/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/pages/auth/ResetPasswordPage';
import { SubscriptionPage } from './components/pages/SubscriptionPage';
import { PricingPage } from './components/pages/PricingPage';
import { CancelSubscriptionPage } from './components/pages/CancelSubscriptionPage';
import { ManageSubscriptionPage } from './components/pages/ManageSubscriptionPage';
import { RealTimePage } from './components/pages/RealTimePage';
import { TermsPage } from './components/pages/TermsPage';
import { PrivacyPage } from './components/pages/PrivacyPage';
import { TutorialsPage } from './components/pages/TutorialsPage';
import { CheckoutSuccessPage } from './components/pages/CheckoutSuccessPage';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { supabase } from './lib/supabase';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState('login');
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);

  useEffect(() => {
    // Check for password reset parameters in URL hash (Supabase sends tokens in hash)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');

    // Also check query string as fallback
    const queryParams = new URLSearchParams(window.location.search);
    const queryAccessToken = queryParams.get('access_token');
    const queryRefreshToken = queryParams.get('refresh_token');
    const queryType = queryParams.get('type');

    // Use hash params first, then fallback to query params
    const finalAccessToken = accessToken || queryAccessToken;
    const finalRefreshToken = refreshToken || queryRefreshToken;
    const finalType = type || queryType;

    if (finalType === 'recovery' && finalAccessToken && finalRefreshToken) {
      // Set session for password reset
      supabase.auth.setSession({
        access_token: finalAccessToken,
        refresh_token: finalRefreshToken
      }).then(() => {
        setIsResetPassword(true);
        setLoading(false);
        // Clear URL hash and query params
        window.history.replaceState({}, document.title, window.location.pathname);
      });
      return;
    }

    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setIsResetPassword(false);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Check for success/cancel parameters in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setActiveScreen('checkout-success');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('canceled') === 'true') {
      setActiveScreen('subscription');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setIsResetPassword(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setActiveScreen('dashboard');
  };

  const handleViewActions = (domain) => {
    setSelectedDomain(domain);
    setActiveScreen('actions');
  };

  const handleResetPasswordSuccess = () => {
    setIsResetPassword(false);
    setAuthScreen('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Se é página de reset de senha
  if (isResetPassword) {
    return <ResetPasswordPage onSuccess={handleResetPasswordSuccess} />;
  }

  // If not authenticated, show auth screens
  if (!isAuthenticated) {
    switch (authScreen) {
      case 'register':
        return (
          <RegisterPage
            onLogin={() => setAuthScreen('login')}
            setActiveScreen={setActiveScreen}
          />
        );
      case 'forgot-password':
        return <ForgotPasswordPage onBack={() => setAuthScreen('login')} />;
      default:
        return (
          <LoginPage
            onRegister={() => setAuthScreen('register')}
            onForgotPassword={() => setAuthScreen('forgot-password')}
            onLogin={handleLogin}
          />
        );
    }
  }

  // If authenticated, show main app
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">{renderScreen()}</main>
    </div>
  );

  function renderScreen() {
    switch (activeScreen) {
      case 'dashboard':
        return (
          <Dashboard
            onViewActions={handleViewActions}
            onAddDomain={() => setActiveScreen('add-domain')}
          />
        );
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'clones':
        return <ClonesPage />;
      case 'actions':
        return (
          <ActionScreen
            domain={selectedDomain}
            onBack={() => setActiveScreen('clones')}
          />
        );
      case 'domains':
        return <ProtectedDomains />;
      case 'settings':
        return <Settings />;
      case 'subscription':
        return <PricingPage setActiveScreen={setActiveScreen} />;
      case 'manage-subscription':
        return <ManageSubscriptionPage setActiveScreen={setActiveScreen} />;
      case 'add-domain':
        return <AddDomainPage onBack={() => setActiveScreen('dashboard')} />;
      case 'cancel-subscription':
        return (
          <CancelSubscriptionPage
            onBack={() => setActiveScreen('manage-subscription')}
          />
        );
      case 'realtime':
        return <RealTimePage />;
      case 'terms':
        return <TermsPage onBack={() => setActiveScreen('dashboard')} />;
      case 'privacy':
        return <PrivacyPage onBack={() => setActiveScreen('dashboard')} />;
      case 'tutorials':
        return <TutorialsPage />;
      case 'checkout-success':
        return (
          <CheckoutSuccessPage
            onContinue={() => setActiveScreen('dashboard')}
          />
        );
      default:
        return (
          <Dashboard
            onViewActions={handleViewActions}
            onAddDomain={() => setActiveScreen('add-domain')}
          />
        );
    }
  }
}