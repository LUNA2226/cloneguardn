import React from 'react';
import { ArrowLeftIcon, ShieldIcon } from 'lucide-react';
export function PrivacyPage({
  onBack
}) {
  const lastUpdate = 'May 27, 2025';
  return <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <ShieldIcon className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold">Privacy Policy – ANTICLONE</h1>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-8 space-y-8">
          <p className="text-gray-400">Last updated: {lastUpdate}</p>
          <p className="text-gray-300 leading-relaxed">
            We, the AntiClone team, respect your privacy and are committed to
            protecting all information provided by you when using our platform.
          </p>
          {/* Data Collection */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              1. Data Collection
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We only collect basic information provided voluntarily, such as
              name, email, and domain. We do not store sensitive data from
              visitors of sites protected by our scripts.
            </p>
          </section>
          {/* Information Usage */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              2. Information Usage
            </h2>
            <p className="text-gray-300 leading-relaxed">
              The information provided is used exclusively for:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Generating personalized protection scripts</li>
              <li>Improving platform experience</li>
              <li>Ensuring tool security and functionality</li>
            </ul>
          </section>
          {/* Data Sharing */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              3. Data Sharing
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We do not sell, rent, or share your data with third parties. We
              only use essential services (such as hosting and security).
            </p>
          </section>
          {/* Cookies */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">4. Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies only for basic system functionality. You can
              disable them in your browser settings.
            </p>
          </section>
          {/* Security */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">5. Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We apply technical and organizational security measures. However,
              no technology is 100% secure, and we cannot guarantee absolute
              protection.
            </p>
          </section>
          {/* Contact Info Box */}
          <section className="mt-8 p-6 bg-gray-750 rounded-xl border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <ShieldIcon className="w-6 h-6 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">
                Questions about Privacy?
              </h2>
            </div>
            <p className="text-gray-300">
              If you have any questions about this Privacy Policy, please
              contact our support team. We're here to help ensure your data
              remains protected.
            </p>
          </section>
        </div>
      </div>
    </div>;
}