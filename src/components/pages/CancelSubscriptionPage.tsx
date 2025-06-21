import React, { useState } from 'react';
import { ArrowLeftIcon, AlertTriangleIcon, CheckCircleIcon, GiftIcon, StarIcon, ZapIcon, XIcon } from 'lucide-react';
const cancelReasons = [{
  id: 'expensive',
  label: "It's too expensive",
  icon: '💰'
}, {
  id: 'not_using',
  label: "I'm not using it enough",
  icon: '⏰'
}, {
  id: 'found_alternative',
  label: 'I found another solution',
  icon: '🔄'
}, {
  id: 'technical_issues',
  label: 'I had technical issues',
  icon: '⚡'
}, {
  id: 'temporary',
  label: 'Temporary break',
  icon: '⏸️'
}, {
  id: 'other',
  label: 'Other reason',
  icon: '💭'
}];
export function CancelSubscriptionPage({
  onBack
}) {
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const handleCancel = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setShowSuccess(true);
  };
  const handleKeepPlan = () => {
    setStep(3);
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
  return <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[#1F2937]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Cancel Plan</h1>
                <p className="text-cyan-100">Pro Plan - $199/month</p>
              </div>
            </div>
            <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="absolute -right-8 -top-8 w-16 h-16 bg-white/5 rounded-full"></div>
        </div>
        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-750">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map(i => <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${step >= i ? 'bg-cyan-500 text-white' : 'bg-gray-600 text-gray-400'}`}>
                  {i}
                </div>
                {i < 3 && <div className={`w-12 h-1 mx-2 transition-all duration-500 ${step > i ? 'bg-cyan-500' : 'bg-gray-600'}`}></div>}
              </div>)}
          </div>
        </div>
        {/* Content */}
        <div className="p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
          {step === 1 && <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangleIcon className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Before you cancel...
                </h2>
                <p className="text-gray-400">
                  Help us understand why you're leaving
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {cancelReasons.map(reason => <button key={reason.id} onClick={() => setSelectedReason(reason.id)} className={`p-4 rounded-xl border-2 text-left transition-all duration-300 hover:shadow-md ${selectedReason === reason.id ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-600 hover:border-gray-500 bg-gray-750'}`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{reason.icon}</span>
                      <span className="font-medium text-white">
                        {reason.label}
                      </span>
                    </div>
                  </button>)}
              </div>
              <div className="flex space-x-4 pt-4">
                <button onClick={() => setStep(2)} disabled={!selectedReason} className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${selectedReason ? 'bg-red-600 text-white hover:bg-red-500 hover:shadow-lg' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
                  Continue Cancellation
                </button>
                <button onClick={handleKeepPlan} className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all duration-300">
                  Keep Plan
                </button>
              </div>
            </div>}
          {step === 2 && <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Additional Feedback
                </h2>
                <p className="text-gray-400">
                  Your feedback helps us improve (optional)
                </p>
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Tell us more about your experience..." className="w-full p-4 rounded-xl border-2 border-gray-600 bg-gray-750 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none h-32" />
              <div className="bg-yellow-900/20 border-2 border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <strong>Important:</strong> After cancellation, you'll lose
                    access to all premium features, but you'll continue to have
                    access until the end of your billing period.
                  </div>
                </div>
              </div>
              <div className="flex space-x-4">
                <button onClick={() => setStep(1)} className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all duration-300">
                  Back
                </button>
                <button onClick={handleCancel} disabled={isProcessing} className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${isProcessing ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-500 hover:shadow-lg'}`}>
                  {isProcessing ? <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div> : 'Confirm Cancellation'}
                </button>
              </div>
            </div>}
          {step === 3 && <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <GiftIcon className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                How about a special offer?
              </h2>
              <p className="text-gray-400">
                Before you go, we have an irresistible proposal!
              </p>
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <StarIcon className="w-6 h-6" />
                  <span className="text-lg font-bold">Special Offer</span>
                  <StarIcon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold mb-2">50% OFF</p>
                  <p className="text-green-100">for the next 3 months</p>
                  <p className="text-sm text-green-200 mt-2">
                    From $199 to just $99/month
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button onClick={handleCancel} className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all duration-300">
                  No, thanks
                </button>
                <button className="flex-1 py-3 px-6 rounded-xl font-semibold bg-green-600 text-white hover:bg-green-500 hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2">
                  <ZapIcon className="w-4 h-4" />
                  <span>Accept Offer</span>
                </button>
              </div>
            </div>}
        </div>
      </div>
    </div>;
}