import React, { useState } from 'react';
import { ArrowLeftIcon, CheckCircleIcon } from 'lucide-react';

export function CancelSubscriptionPage({
  onBack
}) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCancel = async () => {
    setShowSuccess(true);
  };

  if (showSuccess) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Cancellation Confirmed
          </h2>
          <p className="text-gray-400 mb-6">
            Your plan has been successfully cancelled. You'll continue to have
            access until the end of your billing period.
          </p>
          <button onClick={onBack} className="w-full bg-cyan-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-cyan-500 transition-all duration-300">
            Back to Dashboard
          </button>
        </div>
      </div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center">
        <button onClick={onBack} className="mb-4 p-2 hover:bg-gray-700 rounded-full transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        
        <h1 className="text-2xl font-bold text-white mb-4">Cancel Subscription</h1>
        <p className="text-gray-400 mb-8">
          Are you sure you want to cancel your subscription?
        </p>
        
        <button onClick={handleCancel} className="w-full py-3 px-6 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-500 transition-all duration-300">
          Cancel Plan
        </button>
      </div>
    </div>
  );
}