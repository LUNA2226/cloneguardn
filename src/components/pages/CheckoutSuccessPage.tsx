import React, { useEffect } from 'react';
import { CheckCircleIcon, ArrowRightIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutSuccessPageProps {
  onContinue: () => void;
}

export function CheckoutSuccessPage({ onContinue }: CheckoutSuccessPageProps) {
  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="w-10 h-10 text-green-400" />
        </div>

        {/* Success Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">
            🎉 Payment Successful!
          </h1>
          <p className="text-gray-300 leading-relaxed">
            Welcome to CloneGuard! Your subscription is now active and your websites are protected against cloning.
          </p>
        </div>

        {/* Features List */}
        <div className="bg-gray-750 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            What's included:
          </h3>
          <ul className="text-left space-y-3 text-gray-300">
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
              24/7 monitoring and alerts
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
              Advanced cloning protection
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
              Real-time threat detection
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
              Priority support
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={onContinue}
          className="w-full py-3 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 flex items-center justify-center"
        >
          <span className="mr-2">Get Started</span>
          <ArrowRightIcon className="w-5 h-5" />
        </button>

        <p className="text-gray-400 text-sm mt-4">
          You can manage your subscription anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}