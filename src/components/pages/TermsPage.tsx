import React from 'react';
import { ArrowLeftIcon, ScaleIcon } from 'lucide-react';
export function TermsPage({
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
            <ScaleIcon className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold">Terms of Service – ANTICLONE</h1>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-8 space-y-8">
          <p className="text-gray-400">Last updated: {lastUpdate}</p>
          {/* Permitted Use */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              1. Permitted Use
            </h2>
            <p className="text-gray-300 leading-relaxed">
              The AntiClone tool is designed to protect legitimate pages from
              cloning. By using it, you declare that you are the legal owner of
              the registered domain.
            </p>
          </section>
          {/* User Responsibility */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              2. User Responsibility
            </h2>
            <p className="text-gray-300 leading-relaxed">
              It is prohibited to use the scripts to harm third parties or
              interfere with sites that are not your property. Improper use may
              result in account blocking and legal liability.
            </p>
          </section>
          {/* Disclaimer */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">3. Disclaimer</h2>
            <p className="text-gray-300 leading-relaxed">
              The AntiClone team is not responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Improper redirects</li>
              <li>Unauthorized sabotage</li>
              <li>Damages caused by improper use</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              All use of the tool is at the user's own risk.
            </p>
          </section>
          {/* Intellectual Property */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              4. Intellectual Property
            </h2>
            <p className="text-gray-300 leading-relaxed">
              The codes, scripts, and AntiClone technology are the property of
              the tool developer. Resale or redistribution without authorization
              is prohibited.
            </p>
          </section>
          {/* Updates */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">5. Updates</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this policy at any time. Continued use of the
              platform indicates agreement with the new terms.
            </p>
          </section>
          {/* Consent */}
          <section className="mt-8 p-6 bg-gray-750 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              📌 Consent
            </h2>
            <p className="text-gray-300 leading-relaxed">
              By using AntiClone, you agree to this Privacy Policy and Terms of
              Service. If you do not agree, do not use the scripts generated by
              the tool.
            </p>
          </section>
        </div>
      </div>
    </div>;
}