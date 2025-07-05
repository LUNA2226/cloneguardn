import React, { useState } from 'react';
import { ArrowLeftIcon, GlobeIcon, ShieldIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AddDomainPageProps {
  onBack: () => void;
}

export function AddDomainPage({ onBack }: AddDomainPageProps) {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);
    
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

      setSuccess(true);
      setDomain('');

      // Redirect back after a short delay
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (err: any) {
      console.error('Error adding domain:', err);
      setError(err.message || 'Failed to add domain. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Domain Added Successfully!
            </h2>
            <p className="text-gray-300 mb-6">
              Your domain has been added and protection script has been generated.
              You will be redirected back to the dashboard shortly.
            </p>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-3 p-2 rounded-full hover:bg-gray-700">
          <ArrowLeftIcon size={20} />
        </button>
        <h1 className="text-2xl font-bold">Add New Domain</h1>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Domain Input Section */}
        <section className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <GlobeIcon className="text-cyan-400 mr-2" size={24} />
            <h2 className="text-lg font-semibold">Domain Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
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

            <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start space-x-3">
                <AlertCircleIcon size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-200">
                    Important
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Make sure you have access to your website's source code to add the protection script later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Default Settings Info */}
        <section className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <ShieldIcon className="text-cyan-400 mr-2" size={24} />
            <h2 className="text-lg font-semibold">Default Protection Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-3 bg-gray-750 rounded-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
              <div>
                <span className="font-medium text-gray-200">Automatic Redirect</span>
                <p className="text-xs text-gray-400">Redirect clone visitors to original site</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-750 rounded-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
              <div>
                <span className="font-medium text-gray-200">Link Replacement</span>
                <p className="text-xs text-gray-400">Replace checkout links with correct ones</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-750 rounded-lg">
              <div className="w-3 h-3 bg-gray-600 rounded-full mr-3"></div>
              <div>
                <span className="font-medium text-gray-400">Visual Sabotage</span>
                <p className="text-xs text-gray-400">Disabled by default</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-750 rounded-lg">
              <div className="w-3 h-3 bg-gray-600 rounded-full mr-3"></div>
              <div>
                <span className="font-medium text-gray-400">Image Replacement</span>
                <p className="text-xs text-gray-400">Disabled by default</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              💡 You can customize these settings later in the domain configuration page.
            </p>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !domain.trim()}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding Domain...' : 'Add Domain'}
          </button>
        </div>
      </div>
    </div>
  );
}