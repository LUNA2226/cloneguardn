import React, { useState, useEffect } from 'react';
import { CopyIcon, CheckIcon, SettingsIcon, CodeIcon, ShieldIcon } from 'lucide-react';
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

export function ScriptGenerator() {
  const [domains, setDomains] = useState<ProtectedDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<ProtectedDomain | null>(null);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDomains(data.domains);
      }
    } catch (error) {
      console.error('Error loading domains:', error);
    }
  };

  const createScript = async () => {
    if (!newDomain.trim()) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
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
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewDomain('');
        loadDomains();
      }
    } catch (error) {
      console.error('Error creating script:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (domain: ProtectedDomain, newSettings: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          scriptId: domain.script_id,
          settings: newSettings
        }),
      });

      if (response.ok) {
        loadDomains();
        setShowSettings(false);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const generateScript = (domain: ProtectedDomain): string => {
    const randomVars = {
      a: Math.random().toString(36).substring(2, 4),
      b: Math.random().toString(36).substring(2, 4),
      c: Math.random().toString(36).substring(2, 4)
    };

    return `(function(){var ${randomVars.a}='${domain.script_id}',${randomVars.b}='${domain.domain}';
if(location.hostname===${randomVars.b}){var ${randomVars.c}=document.createElement('script');
${randomVars.c}.src='${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator?scriptId='+${randomVars.a};
${randomVars.c}.async=true;document.head.appendChild(${randomVars.c});}})();`;
  };

  const copyScript = (domain: ProtectedDomain) => {
    const script = generateScript(domain);
    navigator.clipboard.writeText(script);
    setCopied(domain.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Gerador de Scripts Anti-Clonagem</h1>
          <p className="text-gray-400">
            Crie scripts ofuscados para proteger seus domínios contra clonagem
          </p>
        </div>
      </div>

      {/* Criar Novo Script */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <CodeIcon className="mr-2 text-cyan-400" size={20} />
          Criar Novo Script de Proteção
        </h2>
        
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
      </div>

      {/* Lista de Domínios Protegidos */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <ShieldIcon className="mr-2 text-cyan-400" size={20} />
          Domínios Protegidos ({domains.length})
        </h2>

        {domains.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CodeIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum script criado ainda</p>
            <p className="text-sm">Adicione um domínio acima para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {domains.map((domain) => (
              <div key={domain.id} className="bg-gray-750 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-white">{domain.domain}</h3>
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
                        setSelectedDomain(domain);
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

                {/* Script Ofuscado */}
                <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-400 text-xs">Script Ofuscado (5 linhas):</span>
                    <button
                      onClick={() => copyScript(domain)}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                    >
                      {copied === domain.id ? (
                        <>
                          <CheckIcon size={12} className="text-green-400" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <CopyIcon size={12} />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-gray-300 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                    {generateScript(domain)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Configurações */}
      {showSettings && selectedDomain && (
        <SettingsModal
          domain={selectedDomain}
          onClose={() => setShowSettings(false)}
          onSave={(newSettings) => updateSettings(selectedDomain, newSettings)}
        />
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