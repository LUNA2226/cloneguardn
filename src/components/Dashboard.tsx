import React from 'react';
import { MetricCard } from './MetricCard';
import { CloneTable } from './CloneTable';
import { GlobeIcon, DollarSignIcon, ExternalLinkIcon, AlertTriangleIcon } from 'lucide-react';
import { DashboardCharts } from './DashboardCharts';

export function Dashboard({
  onViewActions,
  onAddDomain
}) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-sm bg-gray-800 rounded-lg hover:bg-gray-700">
            Export Report
          </button>
          <button onClick={onAddDomain} className="px-4 py-2 text-sm bg-cyan-600 rounded-lg hover:bg-cyan-500">
            Add Domain
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          title="Cloned Sites" 
          value="27" 
          icon={<GlobeIcon size={20} />} 
          change="12% since yesterday" 
          changeType="negative" 
        />
        <MetricCard 
          title="Recovered Traffic" 
          value="$5,842" 
          icon={<DollarSignIcon size={20} />} 
          change="8% this week" 
          changeType="positive" 
        />
        <MetricCard 
          title="Redirects" 
          value="1,254" 
          icon={<ExternalLinkIcon size={20} />} 
          change="23% this month" 
          changeType="positive" 
        />
        <MetricCard 
          title="Real-time Cloning" 
          value="3 active" 
          icon={<AlertTriangleIcon size={20} />} 
          isActive={true} 
        />
      </div>

      <DashboardCharts />

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Clone Sites</h2>
          <button onClick={() => onViewActions(null)} className="text-sm text-cyan-400 hover:text-cyan-300">
            View all
          </button>
        </div>
        <CloneTable limit={5} onViewActions={onViewActions} />
      </div>
    </div>
  );
}