import React from 'react';
import { ArrowLeftIcon, ShieldIcon, CreditCardIcon } from 'lucide-react';

interface ManageSubscriptionPageProps {
  setActiveScreen: (screen: string) => void;
}

export function ManageSubscriptionPage({ setActiveScreen }: ManageSubscriptionPageProps) {
  const handleCancelSubscription = () => {
    setActiveScreen('cancel-subscription');
  };

  const handleUpdatePaymentMethod = () => {
    // Handle payment method update logic here
    console.log('Update payment method clicked');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => setActiveScreen('subscription')}
            className="mr-4 p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-white">Manage Subscription</h1>
        </div>

        {/* Current Plan Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldIcon className="w-10 h-10 text-cyan-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Your Current Plan: PRO
          </h2>
          
          <p className="text-gray-400">
            Your subscription is active and will renew on{' '}
            <span className="text-cyan-400 font-semibold">June 15, 2025</span>.
          </p>
        </div>

        {/* Payment Details Section */}
        <div className="bg-gray-750 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CreditCardIcon className="w-5 h-5 mr-2 text-gray-400" />
            Payment Details
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Payment Method:</span>
              <span className="text-gray-300">Credit Card ending in **** 1234</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Amount:</span>
              <span className="text-gray-300">$299.00 / month</span>
            </div>
          </div>
          
          <button 
            onClick={handleUpdatePaymentMethod}
            className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
          >
            Update payment method
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <button 
            onClick={handleCancelSubscription}
            className="py-3 px-6 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-500 transition-all duration-300"
          >
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
}