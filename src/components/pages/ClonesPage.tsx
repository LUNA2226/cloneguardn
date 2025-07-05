import React, { useState, useEffect } from 'react';
import { CloneTable } from '../CloneTable';
import { GlobeIcon, ShieldIcon, AlertCircleIcon, SearchIcon, FilterIcon, DownloadIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

interface CloneStats {
  totalClones: number;
  blockedClones: number;
  activeThreats: number;
}

export function ClonesPage() {
  const [detections, setDetections] = useState<CloneDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [stats, setStats] = useState<CloneStats>({
    totalClones: 0,
    blockedClones: 0,
    activeThreats: 0
  });

  const itemsPerPage = 10;

  useEffect(() => {
    loadDetections();
  }, [currentPage, searchQuery, statusFilter]);

  const loadDetections = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's protected domains first
      const { data: protectedDomains } = await supabase
        .from('protected_domains')
        .select('id, domain, settings')
        .eq('user_id', user.id);

      if (!protectedDomains?.length) {
        setDetections([]);
        setStats({ totalClones: 0, blockedClones: 0, activeThreats: 0 });
        setLoading(false);
        return;
      }

      const domainIds = protectedDomains.map(d => d.id);

      // Build query for clone detections
      let query = supabase
        .from('clone_detections')
        .select('*')
        .in('protected_domain_id', domainIds)
        .order('detected_at', { ascending: false });

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.ilike('clone_domain', `%${searchQuery.trim()}%`);
      }

      // Apply status filter
      if (statusFilter === 'blocked') {
        query = query.contains('actions_taken', ['redirect']);
      } else if (statusFilter === 'active') {
        query = query.not('actions_taken', 'cs', ['redirect', 'visual_sabotage']);
      }

      // Get total count for pagination
      const { count } = await query.select('*', { count: 'exact', head: true });
      const total = count || 0;
      setTotalResults(total);
      setTotalPages(Math.ceil(total / itemsPerPage));

      // Get paginated results
      const { data: detectionsData, error } = await query
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) {
        console.error('Error loading detections:', error);
        return;
      }

      // Enhance detections with protected domain info
      const enhancedDetections = (detectionsData || []).map(detection => ({
        ...detection,
        protected_domain: protectedDomains.find(d => d.id === detection.protected_domain_id)
      }));

      setDetections(enhancedDetections);

      // Calculate stats
      const allDetectionsQuery = supabase
        .from('clone_detections')
        .select('actions_taken')
        .in('protected_domain_id', domainIds);

      const { data: allDetections } = await allDetectionsQuery;
      
      if (allDetections) {
        const totalClones = allDetections.length;
        const blockedClones = allDetections.filter(d => 
          d.actions_taken?.includes('redirect') || d.actions_taken?.includes('visual_sabotage')
        ).length;
        const activeThreats = totalClones - blockedClones;

        setStats({
          totalClones,
          blockedClones,
          activeThreats
        });
      }

    } catch (error) {
      console.error('Error loading clone detections:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportDetections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: protectedDomains } = await supabase
        .from('protected_domains')
        .select('id, domain')
        .eq('user_id', user.id);

      if (!protectedDomains?.length) return;

      const domainIds = protectedDomains.map(d => d.id);

      const { data: allDetections } = await supabase
        .from('clone_detections')
        .select('*')
        .in('protected_domain_id', domainIds)
        .order('detected_at', { ascending: false });

      if (allDetections) {
        const exportData = allDetections.map(detection => ({
          'Clone Domain': detection.clone_domain,
          'Original Domain': protectedDomains.find(d => d.id === detection.protected_domain_id)?.domain || 'Unknown',
          'Visitor IP': detection.visitor_ip,
          'User Agent': detection.user_agent,
          'Page URL': detection.page_url,
          'Time on Page (seconds)': detection.time_on_page,
          'Actions Taken': detection.actions_taken?.join(', ') || 'None',
          'Detected At': new Date(detection.detected_at).toLocaleString()
        }));

        const csvContent = [
          Object.keys(exportData[0]).join(','),
          ...exportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clone-detections-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting detections:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const statsCards = [
    {
      title: 'Total Clones',
      value: stats.totalClones.toString(),
      icon: <GlobeIcon size={20} />,
      color: 'text-cyan-400'
    },
    {
      title: 'Blocked Clones',
      value: stats.blockedClones.toString(),
      icon: <ShieldIcon size={20} />,
      color: 'text-green-400'
    },
    {
      title: 'Active Threats',
      value: stats.activeThreats.toString(),
      icon: <AlertCircleIcon size={20} />,
      color: 'text-red-400'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-1">Clone Sites</h1>
          <p className="text-gray-400 text-sm">
            Monitor and manage sites that have cloned your pages
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportDetections}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 flex items-center"
          >
            <DownloadIcon size={16} className="mr-2" />
            Export List
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-lg bg-gray-700 ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by domain or IP..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-gray-200"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 flex items-center">
              <FilterIcon size={16} className="mr-2" />
              Filters
            </button>
            <select 
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="blocked">Blocked</option>
              <option value="active">Active Threats</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-transparent">
        <CloneTable 
          detections={detections}
          loading={loading}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-lg">
          <div className="flex items-center text-sm text-gray-400">
            Showing <span className="font-medium mx-1">{((currentPage - 1) * itemsPerPage) + 1}</span> to
            <span className="font-medium mx-1">{Math.min(currentPage * itemsPerPage, totalResults)}</span> of
            <span className="font-medium mx-1">{totalResults}</span> results
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}