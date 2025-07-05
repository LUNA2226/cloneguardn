import React, { useState, useEffect } from 'react';
import { MetricCard } from './MetricCard';
import { CloneTable } from './CloneTable';
import { GlobeIcon, DollarSignIcon, ExternalLinkIcon, AlertTriangleIcon } from 'lucide-react';
import { DashboardCharts } from './DashboardCharts';
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

export function Dashboard({
  onViewActions,
  onAddDomain
}) {
  const [recentDetections, setRecentDetections] = useState<CloneDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClones: 0,
    recoveredTraffic: 0,
    redirects: 0,
    activeThreats: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's protected domains
      const { data: protectedDomains } = await supabase
        .from('protected_domains')
        .select('id, domain, settings')
        .eq('user_id', user.id);

      if (!protectedDomains?.length) {
        setRecentDetections([]);
        setStats({ totalClones: 0, recoveredTraffic: 0, redirects: 0, activeThreats: 0 });
        setLoading(false);
        return;
      }

      const domainIds = protectedDomains.map(d => d.id);

      // Get recent clone detections (last 5)
      const { data: detectionsData } = await supabase
        .from('clone_detections')
        .select('*')
        .in('protected_domain_id', domainIds)
        .order('detected_at', { ascending: false })
        .limit(5);

      // Enhance detections with protected domain info
      const enhancedDetections = (detectionsData || []).map(detection => ({
        ...detection,
        protected_domain: protectedDomains.find(d => d.id === detection.protected_domain_id)
      }));

      setRecentDetections(enhancedDetections);

      // Calculate stats
      const { data: allDetections } = await supabase
        .from('clone_detections')
        .select('actions_taken')
        .in('protected_domain_id', domainIds);

      if (allDetections) {
        const totalClones = allDetections.length;
        const redirects = allDetections.filter(d => 
          d.actions_taken?.includes('redirect')
        ).length;
        const blockedClones = allDetections.filter(d => 
          d.actions_taken?.includes('redirect') || d.actions_taken?.includes('visual_sabotage')
        ).length;
        const activeThreats = totalClones - blockedClones;

        setStats({
          totalClones,
          recoveredTraffic: redirects * 15, // Estimated value per redirect
          redirects,
          activeThreats
        });
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
          value={stats.totalClones.toString()} 
          icon={<GlobeIcon size={20} />} 
          change={stats.totalClones > 0 ? "Active monitoring" : "No clones detected"} 
          changeType={stats.totalClones > 0 ? "negative" : "positive"} 
        />
        <MetricCard 
          title="Recovered Traffic" 
          value={`$${stats.recoveredTraffic}`} 
          icon={<DollarSignIcon size={20} />} 
          change={`${stats.redirects} redirects`} 
          changeType="positive" 
        />
        <MetricCard 
          title="Redirects" 
          value={stats.redirects.toString()} 
          icon={<ExternalLinkIcon size={20} />} 
          change="Automatic protection" 
          changeType="positive" 
        />
        <MetricCard 
          title="Active Threats" 
          value={stats.activeThreats.toString()} 
          icon={<AlertTriangleIcon size={20} />} 
          isActive={stats.activeThreats > 0} 
        />
      </div>

      <DashboardCharts />

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Clone Detections</h2>
          <button onClick={() => onViewActions(null)} className="text-sm text-cyan-400 hover:text-cyan-300">
            View all
          </button>
        </div>
        <CloneTable 
          detections={recentDetections} 
          loading={loading}
        />
      </div>
    </div>
  );
}