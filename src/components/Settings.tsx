import React, { useState, useEffect } from 'react';
import { GlobeIcon, ClipboardCopyIcon, CheckIcon, CodeIcon, SettingsIcon, CopyIcon, ShieldIcon, SaveIcon } from 'lucide-react';
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

export function Settings() {
  const [activeTab, setActiveTab] = useState('script');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Script Generator States
  const [domains, setDomains] = useState<ProtectedDomain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [scriptCopied, setScriptCopied] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedScriptDomain, setSelectedScriptDomain] = useState<ProtectedDomain | null>(null);

  useEffect(() => {
    if (activeTab === 'generator') {
      loadDomains();
    }
  }, [activeTab]);

  useEffect(() => {
    if (domains.length > 0 && !selectedDomain) {
      const firstDomain = domains[0];
      setSelectedDomain(firstDomain.domain);
      setCheckoutUrl(firstDomain.settings.checkout_url || `https://${firstDomain.domain}/checkout`);
      setRedirectUrl(firstDomain.settings.redirect_url || `https://${firstDomain.domain}`);
    }
  }, [domains, selectedDomain]);

  const loadDomains = async () => {
    try {
      setLoading(true);
      // Debug environment variables
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No active session found');
        setLoading(false);
        return;
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator`;
      console.log('Calling function URL:', functionUrl);

      const response = await fetch(functionUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Domains loaded:', data.domains?.length || 0);
        setDomains(data.domains);
      } else {
        const errorText = await response.text();
        console.error('Function response error:', errorText);
        setDomains([]);
      }
    } catch (error) {
      console.error('Error loading domains:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setDomains([]);
    } finally {
      setLoading(false);
    }
  };

  const createScript = async () => {
    if (!newDomain.trim()) return;

    setLoading(true);
    try {
      console.log('Creating script for domain:', newDomain.trim());
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No active session found for script creation');
        return;
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator`;
      console.log('Creating script at URL:', functionUrl);

      const requestBody = {
        domain: newDomain.trim(),
        settings: {
          redirect: true,
          visual_sabotage: false,
          replace_links: true,
          replace_images: false,
          visual_interference: false,
          redirect_url: `https://${newDomain.trim()}`,
          replacement_image_url: '',
          checkout_url: `https://${newDomain.trim()}/checkout`
        }
      };
      
      console.log('Request body:', requestBody);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Create script response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Script created successfully:', data);
        setNewDomain('');
        loadDomains();
      } else {
        const errorText = await response.text();
        console.error('Create script error:', errorText);
      }
    } catch (error) {
      console.error('Error creating script:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (domain: ProtectedDomain, newSettings: any) => {
    try {
      console.log('Updating settings for domain:', domain.domain);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No active session found for settings update');
        return;
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator`;
      console.log('Updating settings at URL:', functionUrl);

      const requestBody = {
        scriptId: domain.script_id,
        settings: newSettings
      };
      
      console.log('Update request body:', requestBody);

      const response = await fetch(functionUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Update settings response status:', response.status);

      if (response.ok) {
        console.log('Settings updated successfully');
        loadDomains();
        setShowSettings(false);
      } else {
        const errorText = await response.text();
        console.error('Update settings error:', errorText);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  };

  const saveCurrentDomainSettings = async () => {
    if (!selectedDomain) return;

    setSaving(true);
    try {
      const domain = domains.find(d => d.domain === selectedDomain);
      if (!domain) return;

      const newSettings = {
        ...domain.settings,
        checkout_url: checkoutUrl,
        redirect_url: redirectUrl
      };

      await updateSettings(domain, newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  // Gera script loader minimalista e ofuscado (SEM informações sensíveis)
  const generateObfuscatedLoader = (domain?: ProtectedDomain): string => {
    if (domain) {
      // Variáveis completamente aleatórias
      const vars = {
        a: Math.random().toString(36).substring(2, 4),
        b: Math.random().toString(36).substring(2, 4),
        c: Math.random().toString(36).substring(2, 4)
      };

      // Loader minimalista SEM referências ao domínio ou URLs
      return `(function(){var ${vars.a}='${domain.script_id}';var ${vars.b}=document.createElement('script');${vars.b}.src='${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator?scriptId='+${vars.a};${vars.b}.async=true;document.head.appendChild(${vars.b});})();`;
    } else {
      // Para domínios da configuração manual, criar um script loader genérico
      const selectedDomainData = domains.find(d => d.domain === selectedDomain);
      if (selectedDomainData) {
        const vars = {
          a: Math.random().toString(36).substring(2, 4),
          b: Math.random().toString(36).substring(2, 4),
          c: Math.random().toString(36).substring(2, 4)
        };

        return `(function(){var ${vars.a}='${selectedDomainData.script_id}';var ${vars.b}=document.createElement('script');${vars.b}.src='${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator?scriptId='+${vars.a};${vars.b}.async=true;document.head.appendChild(${vars.b});})();`;
      }
      
      return '// Selecione um domínio válido para gerar o script';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateObfuscatedLoader());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyScript = (domain: ProtectedDomain) => {
    const script = generateObfuscatedLoader(domain);
    navigator.clipboard.writeText(script);
    setScriptCopied(domain.id);
    setTimeout(() => setScriptCopied(null), 2000);
  };

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    const domainData = domains.find(d => d.domain === domain);
    if (domainData) {
      setCheckoutUrl(domainData.settings.checkout_url || `https://${domain}/checkout`);
      setRedirectUrl(domainData.settings.redirect_url || `https://${domain}`);
    }
  };

  const tabs = [
    { id: 'script', label: 'Configuração de Script', icon: <SettingsIcon size={18} /> },
    { id: 'generator', label: 'Gerador de Scripts', icon: <CodeIcon size={18} /> }
  ];

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      {/* Tabs */}
      <div className="border-b border-gray-700 mb-6">
        <div className="flex space-x-8">
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

      {/* Tab Content */}
      {activeTab === 'script' && (
        <div className="space-y-6">
          {/* Domain Selector */}
          <section className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <GlobeIcon className="text-cyan-400 mr-2" size={20} />
              <h2 className="text-lg font-semibold">Selecionar Domínio</h2>
            </div>
            <select 
              value={selectedDomain} 
              onChange={e => handleDomainChange(e.target.value)} 
              className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-gray-200"
            >
              <option value="">Selecione um domínio...</option>
              {domains.map(domain => (
                <option key={domain.id} value={domain.domain}>
                  {domain.domain}
                </option>
              ))}
            </select>
            {domains.length === 0 && (
              <p className="text-gray-400 text-sm mt-2">
                Nenhum domínio encontrado. Crie um domínio na aba "Gerador de Scripts" primeiro.
              </p>
            )}
          </section>

          {selectedDomain && (
            <>
              {/* Instructions Section */}
              <section className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Como usar seu script de proteção
                </h2>
                <p className="text-gray-300 mb-6">
                  Copie o script abaixo e cole na página original do seu site.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <span className="text-cyan-400">🧩</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-200 mb-1">
                        Recomendação:
                      </h3>
                      <p className="text-sm text-gray-400">
                        Insira este código logo antes da tag &lt;/body&gt; ou no &lt;head&gt; do seu HTML.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <span className="text-yellow-400">⚠</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-200 mb-1">
                        Importante:
                      </h3>
                      <p className="text-sm text-gray-400">
                        Esse script carrega dinamicamente a proteção completa do servidor. Todas as URLs e configurações ficam ocultas e ofuscadas.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <span className="text-green-400">🔒</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-200 mb-1">
                        Segurança:
                      </h3>
                      <p className="text-sm text-gray-400">
                        O script principal é gerado dinamicamente e completamente ofuscado. Nenhuma informação sensível fica exposta no código fonte.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Script Block - LOADER OFUSCADO */}
              <section className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Script Loader Ofuscado</h2>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                      ✓ Máxima Segurança
                    </span>
                    <button 
                      onClick={handleCopy} 
                      className="flex items-center px-3 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition-colors"
                    >
                      {copied ? (
                        <>
                          <CheckIcon size={14} className="mr-1" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <ClipboardCopyIcon size={14} className="mr-1" />
                          Copiar Script
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm relative group border-2 border-green-500/30">
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-900/50 text-green-300 border border-green-500/50">
                      SCRIPT LOADER SEGURO
                    </span>
                  </div>
                  
                  <button 
                    onClick={handleCopy} 
                    className="absolute top-3 right-3 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 opacity-100" 
                    title="Copiar Script"
                  >
                    {copied ? (
                      <CheckIcon size={16} className="text-green-400" />
                    ) : (
                      <ClipboardCopyIcon size={16} className="text-cyan-400 hover:text-cyan-300" />
                    )}
                  </button>
                  
                  <pre className="whitespace-pre-wrap text-gray-300 pr-12 pt-8 break-all">
                    {generateObfuscatedLoader()}
                  </pre>
                </div>
                
                <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="text-green-400">🔐</span>
                    </div>
                    <div>
                      <p className="text-sm text-green-300 font-medium">
                        Script loader para: {selectedDomain}
                      </p>
                      <p className="text-xs text-green-400/80 mt-1">
                        Este é apenas um carregador. O script principal com todas as configurações é gerado dinamicamente pelo servidor e completamente ofuscado. Nenhuma URL ou configuração sensível fica exposta.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Configuration Block */}
              <section className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Configurações para {selectedDomain}
                  </h2>
                  <button
                    onClick={saveCurrentDomainSettings}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <SaveIcon size={16} className="mr-2" />
                        Salvar
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Link de Checkout Principal
                    </label>
                    <input 
                      type="url" 
                      value={checkoutUrl} 
                      onChange={e => setCheckoutUrl(e.target.value)} 
                      placeholder="https://seusite.com/checkout" 
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" 
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Esta URL será ofuscada no script principal e usada para substituir links de checkout em clones.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Redirecionar visitante para este domínio
                    </label>
                    <input 
                      type="url" 
                      value={redirectUrl} 
                      onChange={e => setRedirectUrl(e.target.value)} 
                      placeholder="https://seusite.com" 
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" 
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Esta URL será ofuscada no script principal e usada para redirecionar visitantes de clones.
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      )}

      {activeTab === 'generator' && (
        <div className="space-y-6">
          {/* Header com informações de debug */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Gerador de Scripts Anti-Clonagem</h2>
                <p className="text-gray-400">
                  Crie scripts completamente ofuscados para proteger seus domínios contra clonagem
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">
                  Status: {loading ? 'Carregando...' : 'Pronto'}
                </div>
                <div className="text-sm text-gray-400">
                  Domínios: {domains.length}
                </div>
              </div>
            </div>
            
            {/* Debug info */}
            <div className="bg-gray-750 rounded-lg p-3 text-xs text-gray-400">
              <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Configurado' : '✗ Não configurado'}</div>
              <div>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Configurado' : '✗ Não configurado'}</div>
              <div>Função URL: {import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator</div>
            </div>
          </div>

          {/* Criar Novo Script */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CodeIcon className="mr-2 text-cyan-400" size={20} />
              Criar Novo Script de Proteção
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="exemplo.com"
                  className="flex-1 px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  onClick={createScript}
                  disabled={loading || !newDomain.trim()}
                  className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Gerando...' : 'Gerar Script'}
                </button>
              </div>
              
              <div className="text-sm text-gray-400">
                <p>💡 Digite apenas o domínio (ex: meusite.com) sem https:// ou www</p>
                <p>🔒 O script gerado será completamente ofuscado e seguro</p>
              </div>
            </div>
          </div>

          {/* Lista de Domínios Protegidos */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ShieldIcon className="mr-2 text-cyan-400" size={20} />
              Domínios Protegidos ({domains.length})
            </h3>

            {domains.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CodeIcon size={48} className="mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-medium mb-2">Nenhum script criado ainda</h4>
                <p className="text-sm mb-4">Adicione um domínio acima para começar a gerar scripts de proteção</p>
                
                {loading && (
                  <div className="flex items-center justify-center mt-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mr-2"></div>
                    <span>Carregando domínios...</span>
                  </div>
                )}
                
                {!loading && (
                  <button
                    onClick={loadDomains}
                    className="mt-4 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    🔄 Recarregar Domínios
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {domains.map((domain) => (
                  <div key={domain.id} className="bg-gray-750 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">{domain.domain}</h4>
                        <p className="text-sm text-gray-400">
                          Script ID: {domain.script_id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          domain.is_active 
                            ? 'bg-green-900/30 text-green-400' 
                            : 'bg-red-900/30 text-red-400'
                        }`}>
                          {domain.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedScriptDomain(domain);
                            setShowSettings(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <SettingsIcon size={16} className="text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Configurações Ativas */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {domain.settings.redirect && (
                          <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">
                            Redirecionamento
                          </span>
                        )}
                        {domain.settings.visual_sabotage && (
                          <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs">
                            Sabotagem Visual
                          </span>
                        )}
                        {domain.settings.replace_links && (
                          <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs">
                            Substituir Links
                          </span>
                        )}
                        {domain.settings.replace_images && (
                          <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-xs">
                            Substituir Imagens
                          </span>
                        )}
                        {domain.settings.visual_interference && (
                          <span className="px-2 py-1 bg-orange-900/30 text-orange-400 rounded text-xs">
                            Interferência Visual
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Script Loader Ofuscado */}
                    <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm border border-green-500/30">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-xs">Script Loader Ofuscado:</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400">
                            ✓ Máxima Segurança
                          </span>
                        </div>
                        <button
                          onClick={() => copyScript(domain)}
                          className="flex items-center gap-1 px-2 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-xs transition-colors text-white"
                        >
                          {scriptCopied === domain.id ? (
                            <>
                              <CheckIcon size={12} className="text-white" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <CopyIcon size={12} />
                              Copiar Script
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="text-gray-300 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                        {generateObfuscatedLoader(domain)}
                      </pre>
                    </div>
                    
                    <div className="mt-2 p-2 bg-green-900/10 border border-green-500/20 rounded-lg">
                      <p className="text-xs text-green-400/80">
                        🔐 Este loader carrega dinamicamente o script principal ofuscado do servidor. Todas as URLs e configurações ficam completamente ocultas.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal de Configurações */}
          {showSettings && selectedScriptDomain && (
            <SettingsModal
              domain={selectedScriptDomain}
              onClose={() => setShowSettings(false)}
              onSave={(newSettings) => updateSettings(selectedScriptDomain, newSettings)}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface SettingsModalProps {
  domain: ProtectedDomain;
  onClose: () => void;
  onSave: (settings: any) => void;
}

function SettingsModal({ domain, onClose, onSave }: SettingsModalProps) {
  const [settings, setSettings] = useState(domain.settings);

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Configurações de Proteção</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Redirecionamento */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Redirecionamento Automático</h3>
                <p className="text-sm text-gray-400">
                  Redireciona visitantes do clone para o site original
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.redirect}
                  onChange={(e) => setSettings({...settings, redirect: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
            {settings.redirect && (
              <input
                type="url"
                value={settings.redirect_url}
                onChange={(e) => setSettings({...settings, redirect_url: e.target.value})}
                placeholder="https://seusite.com"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            )}
          </div>

          {/* Sabotagem Visual */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Sabotagem Visual</h3>
              <p className="text-sm text-gray-400">
                Aplica efeitos que quebram o layout do clone
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.visual_sabotage}
                onChange={(e) => setSettings({...settings, visual_sabotage: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {/* Substituir Links */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Substituir Links de Checkout</h3>
                <p className="text-sm text-gray-400">
                  Substitui links de compra pelos links corretos
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.replace_links}
                  onChange={(e) => setSettings({...settings, replace_links: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
            {settings.replace_links && (
              <input
                type="url"
                value={settings.checkout_url}
                onChange={(e) => setSettings({...settings, checkout_url: e.target.value})}
                placeholder="https://seusite.com/checkout"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            )}
          </div>

          {/* Substituir Imagens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Substituir Imagens</h3>
                <p className="text-sm text-gray-400">
                  Substitui todas as imagens por uma imagem personalizada
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.replace_images}
                  onChange={(e) => setSettings({...settings, replace_images: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
            {settings.replace_images && (
              <input
                type="url"
                value={settings.replacement_image_url}
                onChange={(e) => setSettings({...settings, replacement_image_url: e.target.value})}
                placeholder="https://exemplo.com/imagem-de-aviso.jpg"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            )}
          </div>

          {/* Interferência Visual */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Interferência Visual</h3>
              <p className="text-sm text-gray-400">
                Aplica efeitos visuais que dificultam o uso do clone
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.visual_interference}
                onChange={(e) => setSettings({...settings, visual_interference: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500"
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}