import React, { useState, useEffect } from 'react';
import { 
  BarChart3Icon, 
  EyeIcon, 
  MousePointerClickIcon, 
  AlertTriangleIcon, 
  GlobeIcon, 
  ClockIcon,
  TrendingUpIcon,
  UsersIcon,
  ActivityIcon,
  DownloadIcon,
  CalendarIcon,
  MapPinIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AnalyticsData {
  totalDetections: number;
  totalViews: number;
  totalClicks: number;
  avgTimeOnPage: number;
  uniqueVisitors: number;
  recentDetections: Array<{
    id: string;
    clone_domain: string;
    visitor_ip: string;
    user_agent: string;
    detected_at: string;
    time_on_page: number;
    page_url: string;
    actions_taken: string[];
  }>;
  topCloneDomains: Array<{
    domain: string;
    count: number;
    lastSeen: string;
  }>;
  dailyStats: Array<{
    date: string;
    detections: number;
    views: number;
    clicks: number;
    uniqueVisitors: number;
  }>;
  topCountries: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
  deviceStats: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  hourlyActivity: Array<{
    hour: number;
    activity: number;
  }>;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const daysAgo = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar domínios protegidos do usuário
      const { data: protectedDomains } = await supabase
        .from('protected_domains')
        .select('id')
        .eq('user_id', user.id);

      if (!protectedDomains?.length) {
        setAnalytics({
          totalDetections: 0,
          totalViews: 0,
          totalClicks: 0,
          avgTimeOnPage: 0,
          uniqueVisitors: 0,
          recentDetections: [],
          topCloneDomains: [],
          dailyStats: [],
          topCountries: [],
          deviceStats: [],
          hourlyActivity: []
        });
        setLoading(false);
        return;
      }

      const domainIds = protectedDomains.map(d => d.id);

      // Buscar detecções
      const { data: detections } = await supabase
        .from('clone_detections')
        .select('*')
        .in('protected_domain_id', domainIds)
        .gte('detected_at', startDate.toISOString())
        .order('detected_at', { ascending: false });

      // Buscar analytics
      const { data: analyticsData } = await supabase
        .from('script_analytics')
        .select('*')
        .in('protected_domain_id', domainIds)
        .gte('created_at', startDate.toISOString());

      // Processar dados
      const totalDetections = detections?.length || 0;
      const totalViews = analyticsData?.filter(a => a.event_type === 'page_view').length || 0;
      const totalClicks = analyticsData?.filter(a => a.event_type === 'click').length || 0;

      // Calcular tempo médio na página
      const sessionEnds = analyticsData?.filter(a => a.event_type === 'session_end') || [];
      const avgTimeOnPage = sessionEnds.length > 0 
        ? Math.round(sessionEnds.reduce((sum, s) => sum + (s.event_data?.timeOnPage || 0), 0) / sessionEnds.length)
        : 0;

      // Visitantes únicos (baseado em IP)
      const uniqueIPs = new Set(detections?.map(d => d.visitor_ip).filter(Boolean));
      const uniqueVisitors = uniqueIPs.size;

      // Top domínios clonadores
      const domainCounts: { [key: string]: { count: number; lastSeen: string } } = {};
      detections?.forEach(d => {
        if (!domainCounts[d.clone_domain]) {
          domainCounts[d.clone_domain] = { count: 0, lastSeen: d.detected_at };
        }
        domainCounts[d.clone_domain].count++;
        if (new Date(d.detected_at) > new Date(domainCounts[d.clone_domain].lastSeen)) {
          domainCounts[d.clone_domain].lastSeen = d.detected_at;
        }
      });

      const topCloneDomains = Object.entries(domainCounts)
        .map(([domain, data]) => ({ domain, count: data.count, lastSeen: data.lastSeen }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Estatísticas diárias
      const dailyStats: { [key: string]: { detections: number; views: number; clicks: number; uniqueVisitors: Set<string> } } = {};
      
      // Processar detecções por dia
      detections?.forEach(d => {
        const date = new Date(d.detected_at).toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { detections: 0, views: 0, clicks: 0, uniqueVisitors: new Set() };
        }
        dailyStats[date].detections++;
        if (d.visitor_ip) dailyStats[date].uniqueVisitors.add(d.visitor_ip);
      });

      // Processar analytics por dia
      analyticsData?.forEach(a => {
        const date = new Date(a.created_at).toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { detections: 0, views: 0, clicks: 0, uniqueVisitors: new Set() };
        }
        if (a.event_type === 'page_view') dailyStats[date].views++;
        if (a.event_type === 'click') dailyStats[date].clicks++;
        if (a.visitor_ip) dailyStats[date].uniqueVisitors.add(a.visitor_ip);
      });

      const dailyStatsArray = Object.entries(dailyStats)
        .map(([date, stats]) => ({ 
          date, 
          detections: stats.detections,
          views: stats.views,
          clicks: stats.clicks,
          uniqueVisitors: stats.uniqueVisitors.size
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Análise de países (simulada baseada em IP)
      const countryCounts: { [key: string]: number } = {};
      detections?.forEach(d => {
        // Simulação simples de geolocalização baseada em IP
        const country = getCountryFromIP(d.visitor_ip);
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      });

      const totalCountryDetections = Object.values(countryCounts).reduce((sum, count) => sum + count, 0);
      const topCountries = Object.entries(countryCounts)
        .map(([country, count]) => ({ 
          country, 
          count, 
          percentage: Math.round((count / totalCountryDetections) * 100) 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Análise de dispositivos
      const deviceCounts: { [key: string]: number } = {};
      detections?.forEach(d => {
        const device = getDeviceFromUserAgent(d.user_agent);
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });

      const totalDeviceDetections = Object.values(deviceCounts).reduce((sum, count) => sum + count, 0);
      const deviceStats = Object.entries(deviceCounts)
        .map(([device, count]) => ({ 
          device, 
          count, 
          percentage: Math.round((count / totalDeviceDetections) * 100) 
        }))
        .sort((a, b) => b.count - a.count);

      // Atividade por hora
      const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
        const activity = detections?.filter(d => 
          new Date(d.detected_at).getHours() === hour
        ).length || 0;
        return { hour, activity };
      });

      setAnalytics({
        totalDetections,
        totalViews,
        totalClicks,
        avgTimeOnPage,
        uniqueVisitors,
        recentDetections: detections?.slice(0, 10) || [],
        topCloneDomains,
        dailyStats: dailyStatsArray,
        topCountries,
        deviceStats,
        hourlyActivity
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!analytics) return;

    const reportData = {
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      summary: {
        totalDetections: analytics.totalDetections,
        totalViews: analytics.totalViews,
        totalClicks: analytics.totalClicks,
        avgTimeOnPage: analytics.avgTimeOnPage,
        uniqueVisitors: analytics.uniqueVisitors
      },
      topCloneDomains: analytics.topCloneDomains,
      dailyStats: analytics.dailyStats,
      topCountries: analytics.topCountries,
      deviceStats: analytics.deviceStats,
      recentDetections: analytics.recentDetections
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400">Carregando analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="text-center text-gray-400">
          Erro ao carregar dados de analytics
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: <BarChart3Icon size={18} /> },
    { id: 'detections', label: 'Detecções', icon: <AlertTriangleIcon size={18} /> },
    { id: 'traffic', label: 'Tráfego', icon: <TrendingUpIcon size={18} /> },
    { id: 'geography', label: 'Geografia', icon: <MapPinIcon size={18} /> }
  ];

  return (
    <div className="space-y-6 mb-6">
      {/* Header com Controles */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Analytics Completo</h2>
            <p className="text-gray-400">
              Monitore detecções de clonagem, visualizações, cliques e comportamento dos visitantes
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
            
            <button
              onClick={exportReport}
              className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
            >
              <DownloadIcon size={16} className="mr-2" />
              Exportar Relatório
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
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
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Clones Detectados</p>
              <h3 className="text-2xl font-bold text-red-400">{analytics.totalDetections}</h3>
            </div>
            <div className="p-2 bg-red-900/30 rounded-lg">
              <AlertTriangleIcon size={20} className="text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Visualizações</p>
              <h3 className="text-2xl font-bold text-blue-400">{analytics.totalViews}</h3>
            </div>
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <EyeIcon size={20} className="text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Cliques</p>
              <h3 className="text-2xl font-bold text-green-400">{analytics.totalClicks}</h3>
            </div>
            <div className="p-2 bg-green-900/30 rounded-lg">
              <MousePointerClickIcon size={20} className="text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tempo Médio</p>
              <h3 className="text-2xl font-bold text-purple-400">{analytics.avgTimeOnPage}s</h3>
            </div>
            <div className="p-2 bg-purple-900/30 rounded-lg">
              <ClockIcon size={20} className="text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Visitantes Únicos</p>
              <h3 className="text-2xl font-bold text-cyan-400">{analytics.uniqueVisitors}</h3>
            </div>
            <div className="p-2 bg-cyan-900/30 rounded-lg">
              <UsersIcon size={20} className="text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Atividade Diária */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3Icon className="mr-2 text-cyan-400" size={20} />
              Atividade Diária
            </h3>
            
            <div className="h-64 flex items-end justify-between px-2">
              {analytics.dailyStats.length > 0 ? (
                analytics.dailyStats.map((stat, index) => {
                  const maxValue = Math.max(...analytics.dailyStats.map(s => s.detections + s.views + s.clicks));
                  const totalHeight = 200;
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className="flex flex-col items-center mb-2">
                        <div
                          className="w-6 bg-red-500 rounded-t"
                          style={{ height: `${maxValue > 0 ? (stat.detections / maxValue) * totalHeight : 0}px` }}
                          title={`${stat.detections} detecções`}
                        />
                        <div
                          className="w-6 bg-blue-500"
                          style={{ height: `${maxValue > 0 ? (stat.views / maxValue) * totalHeight : 0}px` }}
                          title={`${stat.views} visualizações`}
                        />
                        <div
                          className="w-6 bg-green-500 rounded-b"
                          style={{ height: `${maxValue > 0 ? (stat.clicks / maxValue) * totalHeight : 0}px` }}
                          title={`${stat.clicks} cliques`}
                        />
                      </div>
                      <span className="text-xs text-gray-400 transform rotate-45 origin-left">
                        {new Date(stat.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Nenhum dado disponível
                </div>
              )}
            </div>
            
            <div className="flex justify-center mt-4 space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                <span className="text-gray-400">Detecções</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-gray-400">Visualizações</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-gray-400">Cliques</span>
              </div>
            </div>
          </div>

          {/* Atividade por Hora */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ActivityIcon className="mr-2 text-cyan-400" size={20} />
              Atividade por Hora
            </h3>
            
            <div className="h-64 flex items-end justify-between">
              {analytics.hourlyActivity.map((hour, index) => {
                const maxActivity = Math.max(...analytics.hourlyActivity.map(h => h.activity));
                const height = maxActivity > 0 ? (hour.activity / maxActivity) * 200 : 0;
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-4 bg-cyan-500 rounded-t mb-2"
                      style={{ height: `${height}px` }}
                      title={`${hour.activity} atividades às ${hour.hour}h`}
                    />
                    <span className="text-xs text-gray-400">
                      {hour.hour.toString().padStart(2, '0')}h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'detections' && (
        <div className="space-y-6">
          {/* Top Domínios Clonadores */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <GlobeIcon className="mr-2 text-cyan-400" size={20} />
              Top Domínios Clonadores
            </h3>
            
            <div className="space-y-3">
              {analytics.topCloneDomains.length > 0 ? (
                analytics.topCloneDomains.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <span className="font-medium">{item.domain}</span>
                        <p className="text-xs text-gray-400">
                          Última detecção: {new Date(item.lastSeen).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <span className="text-red-400 font-bold">{item.count}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <GlobeIcon size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhum clone detectado ainda</p>
                </div>
              )}
            </div>
          </div>

          {/* Detecções Recentes */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Detecções Recentes</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Domínio Clone</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">IP Visitante</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">User Agent</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Tempo na Página</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Ações</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Detectado em</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentDetections.length > 0 ? (
                    analytics.recentDetections.map((detection) => (
                      <tr key={detection.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="py-3 px-4 font-medium">{detection.clone_domain}</td>
                        <td className="py-3 px-4 text-gray-400">{detection.visitor_ip}</td>
                        <td className="py-3 px-4 text-gray-400 max-w-xs truncate" title={detection.user_agent}>
                          {detection.user_agent ? detection.user_agent.substring(0, 50) + '...' : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {detection.time_on_page ? `${detection.time_on_page}s` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {detection.actions_taken?.map((action, idx) => (
                              <span key={idx} className="px-2 py-1 bg-cyan-900/30 text-cyan-400 rounded text-xs">
                                {action}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(detection.detected_at).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        Nenhuma detecção recente
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'traffic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estatísticas de Dispositivos */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Dispositivos</h3>
            
            <div className="space-y-3">
              {analytics.deviceStats.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-cyan-500 rounded mr-3"></div>
                    <span className="font-medium">{device.device}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">{device.count}</span>
                    <span className="text-cyan-400 font-bold">{device.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visitantes Únicos por Dia */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Visitantes Únicos por Dia</h3>
            
            <div className="h-48 flex items-end justify-between">
              {analytics.dailyStats.map((stat, index) => {
                const maxVisitors = Math.max(...analytics.dailyStats.map(s => s.uniqueVisitors));
                const height = maxVisitors > 0 ? (stat.uniqueVisitors / maxVisitors) * 150 : 0;
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-6 bg-purple-500 rounded-t mb-2"
                      style={{ height: `${height}px` }}
                      title={`${stat.uniqueVisitors} visitantes únicos`}
                    />
                    <span className="text-xs text-gray-400 transform rotate-45 origin-left">
                      {new Date(stat.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'geography' && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MapPinIcon className="mr-2 text-cyan-400" size={20} />
            Países de Origem
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.topCountries.length > 0 ? (
              analytics.topCountries.map((country, index) => (
                <div key={index} className="bg-gray-750 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{country.country}</span>
                    <span className="text-cyan-400 font-bold">{country.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-cyan-500 h-2 rounded-full" 
                      style={{ width: `${country.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{country.count} detecções</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">
                <MapPinIcon size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nenhum dado geográfico disponível</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Funções auxiliares para análise de dados
function getCountryFromIP(ip: string): string {
  if (!ip || ip === 'unknown') return 'Desconhecido';
  
  // Simulação simples baseada em ranges de IP
  const ipParts = ip.split('.').map(Number);
  const firstOctet = ipParts[0];
  
  if (firstOctet >= 177 && firstOctet <= 191) return 'Brasil';
  if (firstOctet >= 80 && firstOctet <= 95) return 'Portugal';
  if (firstOctet >= 200 && firstOctet <= 201) return 'Argentina';
  if (firstOctet >= 190 && firstOctet <= 191) return 'México';
  if (firstOctet >= 8 && firstOctet <= 15) return 'Estados Unidos';
  
  return 'Outros';
}

function getDeviceFromUserAgent(userAgent: string): string {
  if (!userAgent) return 'Desconhecido';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile') || ua.includes('android')) return 'Mobile';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  if (ua.includes('tablet')) return 'Tablet';
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac')) return 'Mac';
  if (ua.includes('linux')) return 'Linux';
  
  return 'Desktop';
}