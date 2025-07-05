import React, { useState, useEffect } from 'react';
import { GlobeIcon, CopyIcon, CheckIcon, CodeIcon, ShieldIcon, UserIcon, CreditCardIcon } from 'lucide-react';
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

interface UserPlan {
  plano: string;
  nome: string;
  email: string;
}

export function Settings() {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [domains, setDomains] = useState<ProtectedDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [planLimits, setPlanLimits] = useState({ current: 0, max: 0 });

  // Plan limits mapping
  const PLAN_LIMITS = {
    starter: 3,
    pro: 25,
    enterprise: 100
  };

  useEffect(() => {
    loadDomains();
    loadUserPlan();
  }, []);

  useEffect(() => {
    if (domains.length > 0 && !selectedDomain) {
      setSelectedDomain(domains[0].domain);
    }
  }, [domains, selectedDomain]);

  const loadUserPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('plano, nome, email')
        .eq('id', user.id)
        .single();

      if (userData) {
        setUserPlan(userData);
        const maxDomains = PLAN_LIMITS[userData.plano as keyof typeof PLAN_LIMITS] || 3;
        setPlanLimits({ current: domains.length, max: maxDomains });
      }
    } catch (error) {
      console.error('Error loading user plan:', error);
    }
  };

  useEffect(() => {
    if (userPlan) {
      const maxDomains = PLAN_LIMITS[userPlan.plano as keyof typeof PLAN_LIMITS] || 3;
      setPlanLimits({ current: domains.length, max: maxDomains });
    }
  }, [domains.length, userPlan]);

  const loadDomains = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No active session found');
        setLoading(false);
        return;
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator`;

      const response = await fetch(functionUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDomains(data.domains);
      } else {
        const errorText = await response.text();
        console.error('Function response error:', errorText);
        setDomains([]);
      }
    } catch (error) {
      console.error('Error loading domains:', error);
      setDomains([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate obfuscated loader script (WITHOUT sensitive information)
  const generateObfuscatedLoader = (domain?: ProtectedDomain): string => {
    if (domain) {
      // Completely random variables
      const vars = {
        a: Math.random().toString(36).substring(2, 4),
        b: Math.random().toString(36).substring(2, 4),
        c: Math.random().toString(36).substring(2, 4)
      };

      // Minimalist loader WITHOUT references to domain or URLs
      return `(function(){var ${vars.a}='${domain.script_id}';var ${vars.b}=document.createElement('script');${vars.b}.src='${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator?scriptId='+${vars.a};${vars.b}.async=true;document.head.appendChild(${vars.b});})();`;
    } else {
      // For manual configuration domains, create a generic script loader
      const selectedDomainData = domains.find(d => d.domain === selectedDomain);
      if (selectedDomainData) {
        const vars = {
          a: Math.random().toString(36).substring(2, 4),
          b: Math.random().toString(36).substring(2, 4),
          c: Math.random().toString(36).substring(2, 4)
        };

        return `(function(){var ${vars.a}='${selectedDomainData.script_id}';var ${vars.b}=document.createElement('script');${vars.b}.src='${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator?scriptId='+${vars.a};${vars.b}.async=true;document.head.appendChild(${vars.b});})();`;
      }
      
      return '// Select a valid domain to generate the script';
    }
  };

  const handleCopy = () => {
    const selectedDomainData = domains.find(d => d.domain === selectedDomain);
    if (selectedDomainData) {
      const script = generateObfuscatedLoader(selectedDomainData);
      navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPlanDisplayName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'text-blue-400';
      case 'pro': return 'text-purple-400';
      case 'enterprise': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const selectedDomainData = domains.find(d => d.domain === selectedDomain);

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Script Configuration</h1>

      <div className="space-y-6">
        {/* User Plan Information */}
        {userPlan && (
          <section className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <UserIcon className="text-cyan-400 mr-2" size={20} />
                <h2 className="text-lg font-semibold">Account Information</h2>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Current Plan</div>
                  <div className={`font-semibold ${getPlanColor(userPlan.plano)}`}>
                    {getPlanDisplayName(userPlan.plano)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Protected Domains</div>
                  <div className="font-semibold text-cyan-400">
                    {planLimits.current}/{planLimits.max}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <span className="text-gray-400">Name:</span> {userPlan.nome || 'Not set'}
              </div>
              <div>
                <span className="text-gray-400">Email:</span> {userPlan.email}
              </div>
            </div>
          </section>
        )}

        {/* Script Generator Section */}
        <section className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <CodeIcon className="text-cyan-400 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Protection Script Generator</h2>
          </div>

          {domains.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CodeIcon size={48} className="mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">No domains found</h4>
              <p className="text-sm mb-4">Add a domain first to generate protection scripts</p>
              
              {loading && (
                <div className="flex items-center justify-center mt-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mr-2"></div>
                  <span>Loading domains...</span>
                </div>
              )}
              
              {!loading && (
                <button
                  onClick={loadDomains}
                  className="mt-4 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  🔄 Reload Domains
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Domain Selector */}
              <div>
                <div className="flex items-center mb-4">
                  <GlobeIcon className="text-cyan-400 mr-2" size={20} />
                  <h3 className="text-lg font-semibold">Select Domain</h3>
                </div>
                <select 
                  value={selectedDomain} 
                  onChange={e => setSelectedDomain(e.target.value)} 
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-gray-200"
                >
                  {domains.map(domain => (
                    <option key={domain.id} value={domain.domain}>
                      {domain.domain}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Domain Info */}
              {selectedDomainData && (
                <div className="bg-gray-750 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{selectedDomainData.domain}</h4>
                      <p className="text-sm text-gray-400">
                        Script ID: {selectedDomainData.script_id}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedDomainData.is_active 
                        ? 'bg-green-900/30 text-green-400' 
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {selectedDomainData.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Active Settings */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedDomainData.settings.redirect && (
                        <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">
                          Redirect
                        </span>
                      )}
                      {selectedDomainData.settings.visual_sabotage && (
                        <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs">
                          Visual Sabotage
                        </span>
                      )}
                      {selectedDomainData.settings.replace_links && (
                        <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs">
                          Replace Links
                        </span>
                      )}
                      {selectedDomainData.settings.replace_images && (
                        <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-xs">
                          Replace Images
                        </span>
                      )}
                      {selectedDomainData.settings.visual_interference && (
                        <span className="px-2 py-1 bg-orange-900/30 text-orange-400 rounded text-xs">
                          Visual Interference
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Script Display and Copy */}
              <div className="bg-gray-900 rounded-lg p-4 border border-green-500/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm font-medium">Obfuscated Script Loader:</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400">
                      ✓ Maximum Security
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    disabled={!selectedDomain}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {copied ? (
                      <>
                        <CheckIcon size={16} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <CopyIcon size={16} />
                        Copy Script
                      </>
                    )}
                  </button>
                </div>
                
                <pre className="text-gray-300 text-sm overflow-x-auto whitespace-pre-wrap break-all bg-gray-800 p-3 rounded border">
                  {selectedDomain ? generateObfuscatedLoader() : '// Select a domain to generate the script'}
                </pre>
                
                <div className="mt-3 p-3 bg-green-900/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs text-green-400/80">
                    🔐 This loader dynamically loads the obfuscated main script from the server. All URLs and configurations are completely hidden.
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gray-750 rounded-lg p-4">
                <h4 className="text-lg font-medium mb-3 flex items-center">
                  <ShieldIcon className="mr-2 text-cyan-400" size={20} />
                  How to Use Your Protection Script
                </h4>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start space-x-3">
                    <span className="text-cyan-400 mt-1">1.</span>
                    <p>Copy the script above by clicking the "Copy Script" button</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-cyan-400 mt-1">2.</span>
                    <p>Paste it into your website's HTML, preferably just before the closing <code className="bg-gray-600 px-1 py-0.5 rounded">&lt;/body&gt;</code> tag</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-cyan-400 mt-1">3.</span>
                    <p>The script will automatically protect your site and detect any cloning attempts</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                  <p className="text-xs text-blue-300">
                    💡 <strong>Security Note:</strong> The main protection script is dynamically generated and completely obfuscated. No sensitive information is exposed in the source code.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}