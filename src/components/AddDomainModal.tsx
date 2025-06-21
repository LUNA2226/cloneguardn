import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
export function AddDomainModal({
  onClose
}) {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validateDomain = domain => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };
  const handleSubmit = async () => {
    setError('');
    if (!domain) {
      setError('Please enter a domain');
      return;
    }
    if (!validateDomain(domain)) {
      setError('Please enter a valid domain');
      return;
    }
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClose();
    } catch (err) {
      setError('Failed to add domain. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Domain</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Domain URL
            </label>
            <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="mydomain.com" className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />
            <p className="mt-1 text-xs text-gray-400">
              Enter the main domain you want to protect
            </p>
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center text-sm text-gray-300">
              <div className="mr-3">
                <span className="block font-medium">Premium Plan</span>
                <span className="text-xs text-gray-400">
                  2 domains remaining
                </span>
              </div>
              <div className="ml-auto">
                <span className="text-cyan-400">3/5</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-300 hover:text-white" disabled={isSubmitting}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Adding...' : 'Add Domain'}
            </button>
          </div>
        </div>
      </div>
    </div>;
}