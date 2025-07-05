import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AddDomainModalProps {
  onClose: () => void;
  onDomainAdded?: () => void;
}

export function AddDomainModal({ onClose, onDomainAdded }: AddDomainModalProps) {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!domain.trim()) {
      setError('Please enter a domain');
      return;
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    if (!validateDomain(cleanDomain)) {
      setError('Please enter a valid domain (e.g., example.com)');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator`;

      const requestBody = {
        domain: cleanDomain,
        settings: {
          redirect: true,
          visual_sabotage: false,
          replace_links: true,
          replace_images: false,
          visual_interference: false,
          redirect_url: `https://${cleanDomain}`,
          replacement_image_url: '',
          checkout_url: `https://${cleanDomain}/checkout`
        }
      };

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to add domain: ${response.status}`);
      }

      const data = await response.json();
      console.log('Domain added successfully:', data);

      // Call the callback to refresh the domain list
      if (onDomainAdded) {
        onDomainAdded();
      }

      onClose();
    } catch (err: any) {
      console.error('Error adding domain:', err);
      setError(err.message || 'Failed to add domain. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-400">
              Enter the main domain you want to protect (without https:// or www)
            </p>
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          </div>

          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center text-sm text-gray-300">
              <div className="mr-3">
                <span className="block font-medium">Protection Features</span>
                <span className="text-xs text-gray-400">
                  Default settings will be applied
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              <ul className="space-y-1">
                <li>• Automatic redirect enabled</li>
                <li>• Link replacement enabled</li>
                <li>• Real-time monitoring</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !domain.trim()}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Domain'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}