import React, { useState, useEffect } from 'react';
import { XIcon, ExternalLinkIcon, ImageIcon, LinkIcon, GlobeIcon, SettingsIcon, SaveIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CloneDetection {
  id: string;
  protected_domain_id: string;
  clone_domain: string;
  visitor_ip: string;
  user_agent: string;
  page_url: string;
  time_on_page: number;
  actions_taken: string[];
  detected_at: string;
  protected_domain?: {
    domain: string;
    settings: any;
  };
}

interface CloneActionsModalProps {
  clone: CloneDetection;
  onClose: () => void;
}

interface ProtectionSettings {
  redirect: boolean;
  visual_sabotage: boolean;
  replace_links: boolean;
  replace_images: boolean;
  visual_interference: boolean;
  redirect_url: string;
  replacement_image_url: string;
  checkout_url: string;
}

export function CloneActionsModal({ clone, onClose }: CloneActionsModalProps) {
  const [settings, setSettings] = useState<ProtectionSettings>({
    redirect: false,
    visual_sabotage: false,
    replace_links: false,
    replace_images: false,
    visual_interference: false,
    redirect_url: '',
    replacement_image_url: '',
    checkout_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProtectionSettings();
  }, [clone.protected_domain_id]);

  const loadProtectionSettings = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: protectedDomain, error: fetchError } = await supabase
        .from('protected_domains')
        .select('settings, script_id')
        .eq('id', clone.protected_domain_id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (protectedDomain?.settings) {
        setSettings(protectedDomain.settings);
      }
    } catch (err: any) {
      console.error('Error loading protection settings:', err);
      setError('Failed to load protection settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError('');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Get the script_id for this protected domain
      const { data: protectedDomain } = await supabase
        .from('protected_domains')
        .select('script_id')
        .eq('id', clone.protected_domain_id)
        .single();

      if (!protectedDomain) {
        throw new Error('Protected domain not found');
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
          scriptId: protectedDomain.script_id,
          settings: settings
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update settings');
      }

      // Close modal on success
      onClose();
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (setting: keyof ProtectionSettings) => {
    if (typeof settings[setting] === 'boolean') {
      setSettings(prev => ({
        ...prev,
        [setting]: !prev[setting]
      }));
    }
  };

  const updateTextSetting = (setting: keyof ProtectionSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const getLocationFromIP = (ip: string): string => {
    if (!ip || ip === 'unknown') return 'Unknown';
    
    const ipParts = ip.split('.').map(Number);
    const firstOctet = ipParts[0];
    
    if (firstOctet >= 177 && firstOctet <= 191) return 'Brazil';
    if (firstOctet >= 80 && firstOctet <= 95) return 'Portugal';
    if (firstOctet >= 200 && firstOctet <= 201) return 'Argentina';
    if (firstOctet >= 190 && firstOctet <= 191) return 'Mexico';
    if (firstOctet >= 8 && firstOctet <= 15) return 'United States';
    
    return 'Other';
  };

  const getDeviceType = (userAgent: string): string => {
    if (!userAgent) return 'Unknown';
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('iphone')) return 'iPhone';
    if (ua.includes('ipad')) return 'iPad';
    if (ua.includes('android') && ua.includes('mobile')) return 'Android';
    if (ua.includes('android')) return 'Android Tablet';
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac')) return 'Mac';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('mobile')) return 'Mobile';
    
    return 'Desktop';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <GlobeIcon className="text-cyan-400 mr-3" size={24} />
            <div>
              <h2 className="text-xl font-semibold">Clone Detection Details</h2>
              <p className="text-sm text-gray-400 mt-1">{clone.clone_domain}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <XIcon size={20} />
          </button>
        </div>

        {/* Clone Information */}
        <div className="bg-gray-750 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-3">Detection Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Clone Domain:</span>
              <div className="font-medium">{clone.clone_domain}</div>
            </div>
            <div>
              <span className="text-gray-400">Original Domain:</span>
              <div className="font-medium">{clone.protected_domain?.domain || 'Unknown'}</div>
            </div>
            <div>
              <span className="text-gray-400">Visitor IP:</span>
              <div className="font-medium">{clone.visitor_ip || 'Unknown'}</div>
            </div>
            <div>
              <span className="text-gray-400">Location:</span>
              <div className="font-medium">{getLocationFromIP(clone.visitor_ip)}</div>
            </div>
            <div>
              <span className="text-gray-400">Device:</span>
              <div className="font-medium">{getDeviceType(clone.user_agent)}</div>
            </div>
            <div>
              <span className="text-gray-400">Time on Page:</span>
              <div className="font-medium">{clone.time_on_page ? `${clone.time_on_page}s` : 'Unknown'}</div>
            </div>
            <div>
              <span className="text-gray-400">Detected:</span>
              <div className="font-medium">{new Date(clone.detected_at).toLocaleString()}</div>
            </div>
            <div>
              <span className="text-gray-400">Actions Taken:</span>
              <div className="font-medium">
                {clone.actions_taken && clone.actions_taken.length > 0 
                  ? clone.actions_taken.join(', ') 
                  : 'None'
                }
              </div>
            </div>
          </div>
          
          {clone.page_url && (
            <div className="mt-4">
              <span className="text-gray-400">Page URL:</span>
              <div className="font-medium break-all">{clone.page_url}</div>
            </div>
          )}
        </div>

        {/* Protection Settings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <SettingsIcon className="mr-2 text-cyan-400" size={20} />
              Protection Settings
            </h3>
            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mr-2"></div>
              <span className="text-gray-400">Loading settings...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Redirect Traffic */}
              <div className="flex items-start justify-between p-4 bg-gray-750 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${settings.redirect ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-700 text-gray-300'}`}>
                    <ExternalLinkIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Redirect Traffic</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Automatically redirect clone visitors to the original site
                    </p>
                    {settings.redirect && (
                      <input
                        type="url"
                        value={settings.redirect_url}
                        onChange={(e) => updateTextSetting('redirect_url', e.target.value)}
                        placeholder="https://yoursite.com"
                        className="mt-2 w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                      />
                    )}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    checked={settings.redirect} 
                    onChange={() => toggleSetting('redirect')} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Visual Sabotage */}
              <div className="flex items-start justify-between p-4 bg-gray-750 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${settings.visual_sabotage ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-700 text-gray-300'}`}>
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium">Visual Sabotage</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Apply visual effects that break the clone's layout
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    checked={settings.visual_sabotage} 
                    onChange={() => toggleSetting('visual_sabotage')} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Replace Links */}
              <div className="flex items-start justify-between p-4 bg-gray-750 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${settings.replace_links ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-700 text-gray-300'}`}>
                    <LinkIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Replace Checkout Links</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Replace all checkout links with the correct ones
                    </p>
                    {settings.replace_links && (
                      <input
                        type="url"
                        value={settings.checkout_url}
                        onChange={(e) => updateTextSetting('checkout_url', e.target.value)}
                        placeholder="https://yoursite.com/checkout"
                        className="mt-2 w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                      />
                    )}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    checked={settings.replace_links} 
                    onChange={() => toggleSetting('replace_links')} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Replace Images */}
              <div className="flex items-start justify-between p-4 bg-gray-750 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${settings.replace_images ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-700 text-gray-300'}`}>
                    <ImageIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Replace Images</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Replace all images with a warning image
                    </p>
                    {settings.replace_images && (
                      <input
                        type="url"
                        value={settings.replacement_image_url}
                        onChange={(e) => updateTextSetting('replacement_image_url', e.target.value)}
                        placeholder="https://example.com/warning-image.jpg"
                        className="mt-2 w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                      />
                    )}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    checked={settings.replace_images} 
                    onChange={() => toggleSetting('replace_images')} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Visual Interference */}
              <div className="flex items-start justify-between p-4 bg-gray-750 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${settings.visual_interference ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-700 text-gray-300'}`}>
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium">Visual Interference</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Apply effects that make the clone difficult to use
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    checked={settings.visual_interference} 
                    onChange={() => toggleSetting('visual_interference')} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm text-gray-300 hover:text-white"
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            onClick={saveSettings}
            disabled={saving || loading}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <SaveIcon size={16} className="mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}