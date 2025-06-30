import React, { useState, useEffect } from 'react';
import { BarChart3Icon, EyeIcon, MousePointerClickIcon, AlertTriangleIcon, GlobeIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AnalyticsData {
  totalDetections: number;
  totalViews: number;
  totalClicks: number;
  recentDetections: Array<{
    id: string;
    clone_domain: string;
    visitor_ip: string;
    detected_at: string;
    time_on_page: number;
  }>;
  topCloneDomains: Array<{
    domain: string;
    count: number;
  }>;
  dailyStats: Array<{
    date: string;
    detections: number;
    views: number;
  }>;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calcular data de início baseada no período selecionado
      const daysAgo = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Buscar domínios protegidos do usuário
      const { data: protectedDomains } = await supabase
        .from('protected_domains')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (!protectedDomains?.length) {
        setAnalytics({
          totalDetections: 0,
          totalViews: 0,
          totalClicks: 0,
          recentDetections: [],
          topCloneDomains: [],
          dailyStats: []
        });
        setLoading(false);
        return;
      }

      const domainIds = protectedDomains.map(d => d.id);

      // Buscar detecções recentes
      const { data: detections } = await supabase
        .from('clone_detections')
        .select('*')
        .in('protected_domain_id', domainIds)
        .gte('detected_at', startDate.toISOString())
        .order('detected_at', { ascending: false })
        .limit(10);

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

      // Top domínios clonadores
      const domainCounts: { [key: string]: number } = {};
      detections?.forEach(d => {
        domainCounts[d.clone_domain] = (domainCounts[d.clone_domain] || 0) + 1;
      });

      const topCloneDomains = Object.entries(domainCounts)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Estatísticas diárias
      const dailyStats: { [key: string]: { detections: number; views: number } } = {};
      
      detections?.forEach(d => {
        const date = new Date(d.detected_at).toISOString().split('T')[0];
        if (!dailyStats[date]) dailyStats[date] = { detections: 0, views: 0 };
        dailyStats[date].detections++;
      });

      analyticsData?.filter(a => a.event_type === 'page_view').forEach(a => {
        const date = new Date(a.created_at).toISOString().split('T')[0];
        if (!dailyStats[date]) dailyStats[date] = { detections: 0, views: 0 };
        dailyStats[date].views++;
      });

      const dailyStatsArray = Object.entries(dailyStats)
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setAnalytics({
        totalDetections,
        totalViews,
        totalClicks,
        recentDetections: detections || [],
        topCloneDomains,
        dailyStats: dailyStatsArray
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-400">Carregando analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center text-gray-400">
        Erro ao carregar dados de analytics
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Analytics de Proteção</h1>
          <p className="text-gray-400">
            Monitore a atividade de clonagem e proteção dos seus domínios
          </p>
        </div>
        
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        >
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
        </select>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Clones Detectados</p>
              <h3 className="text-2xl font-bold text-red-400">{analytics.totalDetections}</h3>
            </div>
            <div className="p-3 bg-red-900/30 rounded-lg">
              <AlertTriangleIcon size={24} className="text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Visualizações</p>
              <h3 className="text-2xl font-bold text-blue-400">{analytics.totalViews}</h3>
            </div>
            <div className="p-3 bg-blue-900/30 rounded-lg">
              <EyeIcon size={24} className="text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Cliques Rastreados</p>
              <h3 className="text-2xl font-bold text-green-400">{analytics.totalClicks}</h3>
            </div>
            <div className="p-3 bg-green-900/30 rounded-lg">
              <MousePointerClickIcon size={24} className="text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Atividade Diária */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3Icon className="mr-2 text-cyan-400" size={20} />
            Atividade Diária
          </h2>
          
          <div className="h-64 flex items-end justify-between px-2">
            {analytics.dailyStats.length > 0 ? (
              analytics.dailyStats.map((stat, index) => {
                const maxValue = Math.max(...analytics.dailyStats.map(s => s.detections + s.views));
                const height = maxValue > 0 ? ((stat.detections + stat.views) / maxValue) * 200 : 0;
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="flex flex-col items-center mb-2">
                      <div
                        className="w-8 bg-red-500 rounded-t"
                        style={{ height: `${(stat.detections / maxValue) * 200}px` }}
                        title={`${stat.detections} detecções`}
                      />
                      <div
                        className="w-8 bg-blue-500"
                        style={{ height: `${(stat.views / maxValue) * 200}px` }}
                        title={`${stat.views} visualizações`}
                      />
                    </div>
                    <span className="text-xs text-gray-400 transform rotate-45">
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
          </div>
        </div>

        {/* Top Domínios Clonadores */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <GlobeIcon className="mr-2 text-cyan-400" size={20} />
            Top Domínios Clonadores
          </h2>
          
          <div className="space-y-3">
            {analytics.topCloneDomains.length > 0 ? (
              analytics.topCloneDomains.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium">{item.domain}</span>
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
      </div>

      {/* Detecções Recentes */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Detecções Recentes</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Domínio Clone</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">IP Visitante</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Tempo na Página</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Detectado em</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentDetections.length > 0 ? (
                analytics.recentDetections.map((detection) => (
                  <tr key={detection.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-3 px-4 font-medium">{detection.clone_domain}</td>
                    <td className="py-3 px-4 text-gray-400">{detection.visitor_ip}</td>
                    <td className="py-3 px-4 text-gray-400">
                      {detection.time_on_page ? `${detection.time_on_page}s` : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(detection.detected_at).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    Nenhuma detecção recente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}