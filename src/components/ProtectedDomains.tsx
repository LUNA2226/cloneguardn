import React, { useState, useEffect } from 'react';
import { ShieldIcon, PlusIcon, AlertCircleIcon, EditIcon, TrashIcon, SettingsIcon, CopyIcon, CheckIcon } from 'lucide-react';
import { AddDomainModal } from './AddDomainModal';
import { ProtectionModal } from './ProtectionModal';
import { supabase } from '../lib/supabase';

interface ProtectedDomain {
  id: string;
  domain: string;
  script_id: string;
  settings: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EditDomainModalProps {
  domain: ProtectedDomain;
  onClose: () => void;
  onSave: (updatedDomain: string) => void;
  onDelete: () => void;
}

function EditDomainModal({ domain, onClose, onSave, onDelete }: EditDomainModalProps) {
  const [newDomain, setNewDomain] = useState(domain.domain);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    if (!newDomain.trim()) {
      setError('Domínio não pode estar vazio');
      return;
    }

    if (newDomain === domain.domain) {
      onClose();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('protected_domains')
        .update({ 
          domain: newDomain.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', domain.id);

      if (updateError) {
        throw updateError;
      }

      onSave(newDomain.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar domínio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const { error: deleteError } = await supabase
        .from('protected_domains')
        .delete()
        .eq('id', domain.id);

      if (deleteError) {
        throw deleteError;
      }

      onDelete();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao remover domínio');
    } finally {
      setLoading(false);
    }
  };

  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg w-full max-w-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-400">Confirmar Remoção</h3>
          <p className="text-gray-300 mb-6">
            Tem certeza que deseja remover o domínio <strong>{domain.domain}</strong>? 
            Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={loading}
              className="px-4 py-2 text-gray-300 hover:text-white disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50"
            >
              {loading ? 'Removendo...' : 'Remover Domínio'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Editar Domínio</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Domínio
            </label>
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder="exemplo.com"
              disabled={loading}
            />
            {error && (
              <p className="mt-2 text-xs text-red-400">{error}</p>
            )}
          </div>

          <div className="bg-gray-750 rounded-lg p-3">
            <p className="text-sm text-gray-400">
              <strong>Script ID:</strong> {domain.script_id}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              <strong>Criado em:</strong> {new Date(domain.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50 flex items-center"
            >
              <TrashIcon size={16} className="mr-2" />
              Remover
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-300 hover:text-white disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !newDomain.trim()}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProtectedDomains() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProtectionModalOpen, setIsProtectionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<ProtectedDomain | null>(null);
  const [domains, setDomains] = useState<ProtectedDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Usuário não autenticado');
        return;
      }

      const { data: domainsData, error: fetchError } = await supabase
        .from('protected_domains')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setDomains(domainsData || []);
    } catch (err: any) {
      console.error('Error loading domains:', err);
      setError('Erro ao carregar domínios protegidos');
    } finally {
      setLoading(false);
    }
  };

  const handleProtectionClick = (domain: ProtectedDomain) => {
    setSelectedDomain(domain);
    setIsProtectionModalOpen(true);
  };

  const handleEditClick = (domain: ProtectedDomain) => {
    setSelectedDomain(domain);
    setIsEditModalOpen(true);
  };

  const handleDomainAdded = () => {
    loadDomains();
  };

  const handleDomainUpdated = (domainId: string, newDomainName: string) => {
    setDomains(prev => prev.map(domain => 
      domain.id === domainId 
        ? { ...domain, domain: newDomainName, updated_at: new Date().toISOString() }
        : domain
    ));
  };

  const handleDomainDeleted = (domainId: string) => {
    setDomains(prev => prev.filter(domain => domain.id !== domainId));
  };

  const generateScript = (domain: ProtectedDomain): string => {
    const randomVars = {
      a: Math.random().toString(36).substring(2, 4),
      b: Math.random().toString(36).substring(2, 4),
      c: Math.random().toString(36).substring(2, 4)
    };

    return `(function(){var ${randomVars.a}='${domain.script_id}';var ${randomVars.b}=document.createElement('script');${randomVars.b}.src='${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator?scriptId='+${randomVars.a};${randomVars.b}.async=true;document.head.appendChild(${randomVars.b});})();`;
  };

  const copyScript = (domain: ProtectedDomain) => {
    const script = generateScript(domain);
    navigator.clipboard.writeText(script);
    setCopiedScript(domain.id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const toggleDomainStatus = async (domain: ProtectedDomain) => {
    try {
      const { error: updateError } = await supabase
        .from('protected_domains')
        .update({ 
          is_active: !domain.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', domain.id);

      if (updateError) {
        throw updateError;
      }

      setDomains(prev => prev.map(d => 
        d.id === domain.id 
          ? { ...d, is_active: !d.is_active, updated_at: new Date().toISOString() }
          : d
      ));
    } catch (err: any) {
      console.error('Error toggling domain status:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Meus Domínios Protegidos</h1>
          <p className="text-gray-400 text-sm mt-1">
            Gerencie os domínios protegidos contra clonagem
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500 flex items-center transition-colors"
        >
          <PlusIcon size={18} className="mr-2" />
          Adicionar Domínio
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShieldIcon className="text-cyan-400 mr-2" size={20} />
              <span className="text-sm text-gray-400">
                {domains.length}/25 domínios protegidos
              </span>
            </div>
            <span className="text-xs text-gray-500">Plano Pro</span>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando domínios...</p>
          </div>
        ) : domains.length === 0 ? (
          <div className="p-8 text-center">
            <ShieldIcon size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Nenhum Domínio Protegido</h3>
            <p className="text-gray-400 mb-4">Adicione seu primeiro domínio para começar a protegê-lo contra clonagem.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500"
            >
              Adicionar Primeiro Domínio
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                    Criado
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    Ativo
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {domains.map(domain => (
                  <tr key={domain.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="font-medium">{domain.domain}</span>
                        <button
                          onClick={() => copyScript(domain)}
                          className="ml-2 p-1 text-gray-400 hover:text-cyan-400 transition-colors"
                          title="Copiar script de proteção"
                        >
                          {copiedScript === domain.id ? (
                            <CheckIcon size={14} className="text-green-400" />
                          ) : (
                            <CopyIcon size={14} />
                          )}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {domain.script_id}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        domain.is_active 
                          ? 'bg-green-900/30 text-green-400' 
                          : 'bg-red-900/30 text-red-400'
                      }`}>
                        {domain.is_active ? 'Protegido' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {new Date(domain.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={domain.is_active}
                          onChange={() => toggleDomainStatus(domain)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleProtectionClick(domain)} 
                          className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-gray-700 rounded transition-colors"
                          title="Configurar proteção"
                        >
                          <SettingsIcon size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditClick(domain)} 
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded transition-colors"
                          title="Editar domínio"
                        >
                          <EditIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modais */}
      {isAddModalOpen && (
        <AddDomainModal 
          onClose={() => setIsAddModalOpen(false)} 
          onDomainAdded={handleDomainAdded} 
        />
      )}

      {isProtectionModalOpen && selectedDomain && (
        <ProtectionModal 
          domain={selectedDomain} 
          onClose={() => setIsProtectionModalOpen(false)}
          onSave={loadDomains}
        />
      )}

      {isEditModalOpen && selectedDomain && (
        <EditDomainModal
          domain={selectedDomain}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(newDomain) => handleDomainUpdated(selectedDomain.id, newDomain)}
          onDelete={() => handleDomainDeleted(selectedDomain.id)}
        />
      )}
    </div>
  );
}