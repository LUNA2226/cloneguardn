import React, { useState, useEffect } from 'react';
import { ShieldIcon, PlusIcon, AlertCircleIcon, SettingsIcon, BarChart3Icon, CodeIcon } from 'lucide-react';
import { ScriptGenerator } from './ScriptGenerator';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { supabase } from '../lib/supabase';

interface ProtectedDomain {
  id: string;
  domain: string;
  script_id: string;
  settings: any;
  is_active: boolean;
  created_at: string;
}

export function ProtectedDomains() {
  const [activeTab, setActiveTab] = useState('domains');
  const [domains, setDomains] = useState<ProtectedDomain[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'domains', label: 'Domínios Protegidos', icon: <ShieldIcon size={18} /> },
    { id: 'generator', label: 'Gerador de Scripts', icon: <CodeIcon size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3Icon size={18} /> }
  ];

  return (
    <div className="p-6">
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
      {activeTab === 'domains' && (
        <DomainsTab domains={domains} loading={loading} onRefresh={loadDomains} />
      )}
      
      {activeTab === 'generator' && <ScriptGenerator />}
      
      {activeTab === 'analytics' && <AnalyticsDashboard />}
    </div>
  );
}

interface DomainsTabProps {
  domains: ProtectedDomain[];
  loading: boolean;
  onRefresh: () => void;
}

function DomainsTab({ domains, loading, onRefresh }: DomainsTabProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Carregando domínios...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Domínios Protegidos</h1>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500 flex items-center"
        >
          <PlusIcon size={18} className="mr-2" />
          Atualizar Lista
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShieldIcon className="text-cyan-400 mr-2" size={20} />
              <span className="text-sm text-gray-400">
                {domains.length} domínios protegidos
              </span>
            </div>
          </div>
        </div>

        {domains.length === 0 ? (
          <div className="text-center py-12">
            <ShieldIcon size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Nenhum domínio protegido
            </h3>
            <p className="text-gray-400 mb-6">
              Use o Gerador de Scripts para criar proteção para seus domínios
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                  Domínio
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                  Proteções Ativas
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                  Criado em
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {domains.map(domain => (
                <tr key={domain.id} className="hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className="font-medium">{domain.domain}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      domain.is_active 
                        ? 'bg-green-900/30 text-green-400' 
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {domain.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {domain.settings?.redirect && (
                        <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">
                          Redirect
                        </span>
                      )}
                      {domain.settings?.visual_sabotage && (
                        <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs">
                          Sabotagem
                        </span>
                      )}
                      {domain.settings?.replace_links && (
                        <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs">
                          Links
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {new Date(domain.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500 flex items-center">
                      <SettingsIcon size={14} className="mr-1" />
                      Configurar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}