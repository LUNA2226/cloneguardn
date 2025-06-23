import React from 'react';
import { XIcon, GiftIcon } from 'lucide-react';

interface SpecialOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

export function SpecialOfferModal({ isOpen, onClose, onAccept, onDecline }: SpecialOfferModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
        >
          <XIcon className="w-6 h-6" />
        </button>

        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20"></div>

        <div className="relative p-8 text-center">
          {/* Gift Icon */}
          <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <GiftIcon className="w-8 h-8 text-cyan-400" />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
              <span className="mr-2">👋</span>
              We'll miss you!
            </h2>
            <p className="text-gray-300">
              Before you go, we want to offer you something special:
            </p>
          </div>

          {/* Special Offer Card */}
          <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl p-6 mb-6">
            <div className="mb-4">
              <span className="text-4xl">🎁</span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">
              Special Offer!
            </h3>
            
            <p className="text-cyan-100 mb-4">
              Stay one more month for just:
            </p>
            
            <div className="flex items-center justify-center space-x-3 mb-4">
              <span className="text-lg text-cyan-200 line-through">$299</span>
              <span className="text-3xl font-bold text-white">$149</span>
            </div>

            <div className="bg-cyan-500/20 rounded-lg p-3">
              <div className="flex items-center justify-center text-cyan-100">
                <span className="mr-2">🔒</span>
                <span className="font-medium">Save $150 this month!</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm mb-8">
            It's a way to continue enjoying all the benefits of your subscription with a discount.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={onAccept}
              className="w-full py-3 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 flex items-center justify-center"
            >
              <span className="mr-2">✨</span>
              YES, I WANT TO STAY
            </button>
            
            <button 
              onClick={onDecline}
              className="w-full py-3 px-6 bg-gray-700 text-gray-300 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
            >
              NO, CONTINUE CANCELLATION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}