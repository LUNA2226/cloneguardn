import React, { useState } from 'react';
import { XIcon, ShieldIcon, ImageIcon, RefreshCwIcon, LinkIcon, EyeIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProtectedDomain {
  id: string;
  domain: string;
  script_id: string;
  settings: {
    redirect: boolean;
    visual_sabotage: boolean;
    replace_links: boolean;
    replace_images: boolean;
    visual_interference: boolean;
    redirect_url: string;
    replacement_image_url: string;
    checkout_url: string;
  };
  is_active: boolean;
  created_at: string;
}

interface ProtectionModalProps {
  domain: ProtectedDomain;
  onClose: () => void;
  onSave?: () => void;
}

export function ProtectionModal({ domain, onClose, onSave }: ProtectionModalProps) {
  const [activeTab, setActiveTab] = useState('protection');
  const [settings, setSettings] = useState(domain.settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleSetting = (setting: keyof typeof settings) => {
    if (typeof settings[setting] === 'boolean') {
      setSettings(prev => ({
        ...prev,
        [setting]: !prev[setting]
      }));
    }
  };

  const updateTextSetting = (setting: keyof typeof settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Update settings via the script-generator function
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator`;

      const response = await fetch(functionUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          scriptId: domain.script_id,
          settings: settings
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update settings');
      }

      // Call the onSave callback if provided
      if (onSave) {
        onSave();
      }

      onClose();
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    {
      id: 'protection',
      label: 'Protection',
      icon: <ShieldIcon size={18} />
    },
    {
      id: 'images',
      label: 'Images',
      icon: <ImageIcon size={18} />
    },
    {
      id: 'checkout',
      label: 'Checkout',
      icon: <RefreshCwIcon size={18} />
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <ShieldIcon className="text-cyan-400 mr-2" size={24} />
            <div>
              <h2 className="text-xl font-semibold">Configure Protection</h2>
              <p className="text-sm text-gray-400">{domain.domain}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-400 hover:text-white transition-colors">
            <XIcon size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="border-b border-gray-700 mb-6">
          <div className="flex space-x-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 -mb-px ${
                  activeTab === tab.id
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'protection' && (
          <div className="space-y-4">
            {[
              {
                id: 'redirect',
                title: 'Automatic Redirect',
                description: 'Redirect visitors to the original site',
                icon: <RefreshCwIcon size={20} />,
                hasInput: true,
                inputValue: settings.redirect_url,
                inputPlaceholder: 'https://yoursite.com'
              },
              {
                id: 'visual_sabotage',
                title: 'Visual Sabotage',
                description: 'Enable visual sabotage effects on the cloned page',
                icon: <ImageIcon size={20} />
              },
              {
                id: 'replace_links',
                title: 'Replace Checkout Links',
                description: 'Change checkout links to the correct ones',
                icon: <LinkIcon size={20} />,
                hasInput: true,
                inputValue: settings.checkout_url,
                inputPlaceholder: 'https://yoursite.com/checkout'
              },
              {
                id: 'replace_images',
                title: 'Replace Images',
                description: 'Replace all images with a custom image',
                icon: <ImageIcon size={20} />,
                hasInput: true,
                inputValue: settings.replacement_image_url,
                inputPlaceholder: 'https://example.com/warning.jpg'
              },
              {
                id: 'visual_interference',
                title: 'Visual Interference',
                description: 'Apply effects that make the clone difficult to use',
                icon: <EyeIcon size={20} />
              }
            ].map(setting => (
              <div key={setting.id} className="flex items-start justify-between p-4 bg-gray-750 rounded-lg">
                <div className="flex items-start flex-1">
                  <div className={`p-2 rounded-lg mr-3 ${settings[setting.id as keyof typeof settings] ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-700 text-gray-300'}`}>
                    {setting.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{setting.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {setting.description}
                    </p>
                    {setting.hasInput && settings[setting.id as keyof typeof settings] && (
                      <input
                        type="url"
                        value={setting.inputValue}
                        onChange={(e) => {
                          if (setting.id === 'redirect') {
                            updateTextSetting('redirect_url', e.target.value);
                          } else if (setting.id === 'replace_links') {
                            updateTextSetting('checkout_url', e.target.value);
                          } else if (setting.id === 'replace_images') {
                            updateTextSetting('replacement_image_url', e.target.value);
                          }
                        }}
                        placeholder={setting.inputPlaceholder}
                        className="mt-2 w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                      />
                    )}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={settings[setting.id as keyof typeof settings] as boolean}
                    onChange={() => toggleSetting(setting.id as keyof typeof settings)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-6">
            <div className="bg-gray-750 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Image Replacement</h3>
              <p className="text-sm text-gray-400 mb-4">
                Provide the URL of the image that will replace all images on the
                cloned site. We recommend using an image that clearly identifies
                the site as a clone.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={settings.replacement_image_url}
                    onChange={(e) => updateTextSetting('replacement_image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                {settings.replacement_image_url && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Preview:
                    </label>
                    <div className="bg-gray-700 rounded-lg p-8 flex items-center justify-center">
                      <div className="relative w-48 h-48 bg-gray-600 rounded-lg overflow-hidden">
                        <img
                          src={settings.replacement_image_url}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checkout' && (
          <div className="space-y-6">
            <div className="bg-gray-750 rounded-lg p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Original Checkout Link
                  </label>
                  <input
                    type="url"
                    value={settings.checkout_url}
                    onChange={(e) => updateTextSetting('checkout_url', e.target.value)}
                    placeholder="https://checkout.yoursite.com"
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    This is the link where traffic will be redirected
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-300 hover:text-white">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}