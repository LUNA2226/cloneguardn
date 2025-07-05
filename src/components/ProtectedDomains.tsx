import React, { useState } from 'react';
import { ShieldIcon, PlusIcon, AlertCircleIcon } from 'lucide-react';
import { AddDomainModal } from './AddDomainModal';
import { ProtectionModal } from './ProtectionModal';
import { supabase } from '../lib/supabase';
export function ProtectedDomains() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProtectionModalOpen, setIsProtectionModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  React.useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDomains(data.domains || []);
      }
    } catch (error) {
      console.error('Error loading domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProtectionClick = domain => {
    setSelectedDomain(domain);
    setIsProtectionModalOpen(true);
  };

  const handleDomainAdded = () => {
    loadDomains();
  };

  return <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Protected Domains</h1>
        <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500 flex items-center">
          <PlusIcon size={18} className="mr-2" />
          Add Domain
        </button>
      </div>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShieldIcon className="text-cyan-400 mr-2" size={20} />
              <span className="text-sm text-gray-400">
                {domains.length}/5 protected domains
              </span>
            </div>
            <span className="text-xs text-gray-500">Premium Plan</span>
          </div>
        </div>
        <table className="w-full">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading domains...</p>
          </div>
        ) : domains.length === 0 ? (
          <div className="p-8 text-center">
            <ShieldIcon size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Protected Domains</h3>
            <p className="text-gray-400 mb-4">Add your first domain to start protecting it against cloning.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500"
            >
              Add Your First Domain
            </button>
          </div>
        ) : (
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                Domain
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                Created
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                Active
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {domains.map(domain => <tr key={domain.id} className="hover:bg-gray-750">
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <span className="font-medium">{domain.domain}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${domain.status === 'protected' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                    {domain.is_active ? 'Protected' : 'Inactive'}
                    domain.is_active 
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {new Date(domain.created_at).toLocaleDateString()}
                </td>
                  <span className={domain.is_active ? 'text-green-400' : 'text-gray-400'}>
                    {domain.is_active ? 'Yes' : 'No'}
                  </span>
                    Protection
                  </button>
                </td>
              </tr>)}
          </tbody>
        </table>
        )}
      </div>
      {isAddModalOpen && <AddDomainModal onClose={() => setIsAddModalOpen(false)} />}
      {isProtectionModalOpen && <ProtectionModal domain={selectedDomain} onClose={() => setIsProtectionModalOpen(false)} />}
        <AddDomainModal 
          onClose={() => setIsAddModalOpen(false)} 
          onDomainAdded={handleDomainAdded}
        />
}