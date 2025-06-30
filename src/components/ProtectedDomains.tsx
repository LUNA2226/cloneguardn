import React, { useState } from 'react';
import { ShieldIcon, PlusIcon, AlertCircleIcon } from 'lucide-react';
import { AddDomainModal } from './AddDomainModal';
import { ProtectionModal } from './ProtectionModal';
export function ProtectedDomains() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProtectionModalOpen, setIsProtectionModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const domains = [{
    id: 1,
    domain: 'minhapagina.com.br',
    status: 'protected',
    lastCheck: '2 min atrás',
    threats: 0
  }, {
    id: 2,
    domain: 'ofertaespecial.com',
    status: 'alert',
    lastCheck: '5 min atrás',
    threats: 3
  }, {
    id: 3,
    domain: 'cursoonline.net',
    status: 'protected',
    lastCheck: '1 hora atrás',
    threats: 0
  }];
  const handleProtectionClick = domain => {
    setSelectedDomain(domain);
    setIsProtectionModalOpen(true);
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
                3/5 protected domains
              </span>
            </div>
            <span className="text-xs text-gray-500">Premium Plan</span>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                Domain
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                Last Check
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                Threats
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
                    {domain.status === 'protected' ? 'Protected' : 'Alert'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {domain.lastCheck}
                </td>
                <td className="px-4 py-3 text-sm">
                  {domain.threats > 0 ? <div className="flex items-center text-red-400">
                      <AlertCircleIcon size={16} className="mr-1" />
                      {domain.threats} detected
                    </div> : <span className="text-gray-400">None</span>}
                </td>
                <td className="px-4 py-3 text-sm">
                  <button onClick={() => handleProtectionClick(domain)} className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500">
                    Protection
                  </button>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
      {isAddModalOpen && <AddDomainModal onClose={() => setIsAddModalOpen(false)} />}
      {isProtectionModalOpen && <ProtectionModal domain={selectedDomain} onClose={() => setIsProtectionModalOpen(false)} />}
    </div>;
}