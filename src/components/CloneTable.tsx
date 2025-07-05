import React, { useState } from 'react';
import { GlobeIcon, SmartphoneIcon, MonitorIcon, ExternalLinkIcon, TabletIcon } from 'lucide-react';
import { CloneActionsModal } from './CloneActionsModal';

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

interface CloneTableProps {
  detections: CloneDetection[];
  loading: boolean;
}

export function CloneTable({ detections, loading }: CloneTableProps) {
  const [selectedClone, setSelectedClone] = useState<CloneDetection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewActions = (detection: CloneDetection) => {
    setSelectedClone(detection);
    setIsModalOpen(true);
  };

  const getDeviceIcon = (userAgent: string) => {
    if (!userAgent) return <MonitorIcon size={16} className="mr-1" />;
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android')) {
      return <SmartphoneIcon size={16} className="mr-1" />;
    }
    if (ua.includes('iphone') || ua.includes('ipad')) {
      return <SmartphoneIcon size={16} className="mr-1" />;
    }
    if (ua.includes('tablet')) {
      return <TabletIcon size={16} className="mr-1" />;
    }
    
    return <MonitorIcon size={16} className="mr-1" />;
  };

  const getDeviceType = (userAgent: string): string => {
    if (!userAgent) return 'Unknown';
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('iphone')) return 'iPhone';
    if (ua.includes('ipad')) return 'iPad';
    if (ua.includes('android') && ua.includes('mobile')) return 'Android';
    if (ua.includes('android')) return 'Android Tablet';
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac')) return 'Mac';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('mobile')) return 'Mobile';
    if (ua.includes('tablet')) return 'Tablet';
    
    return 'Desktop';
  };

  const formatActionsTaken = (actions: string[]): string => {
    if (!actions || actions.length === 0) return 'None';
    
    const actionMap: { [key: string]: string } = {
      'redirect': 'Redirected',
      'visual_sabotage': 'Visual Sabotage',
      'replace_links': 'Links Replaced',
      'replace_images': 'Images Replaced',
      'visual_interference': 'Visual Interference',
      'clone_detected': 'Detected'
    };
    
    return actions.map(action => actionMap[action] || action).join(', ');
  };

  const getLocationFromIP = (ip: string): string => {
    // Simple IP-based location simulation
    if (!ip || ip === 'unknown') return 'Unknown';
    
    const ipParts = ip.split('.').map(Number);
    const firstOctet = ipParts[0];
    
    if (firstOctet >= 177 && firstOctet <= 191) return 'Brazil';
    if (firstOctet >= 80 && firstOctet <= 95) return 'Portugal';
    if (firstOctet >= 200 && firstOctet <= 201) return 'Argentina';
    if (firstOctet >= 190 && firstOctet <= 191) return 'Mexico';
    if (firstOctet >= 8 && firstOctet <= 15) return 'United States';
    
    return 'Other';
  };

  if (loading) {
    return (
      <div className="w-full bg-gray-800 rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mr-3"></div>
          <span className="text-gray-400">Loading clone detections...</span>
        </div>
      </div>
    );
  }

  if (detections.length === 0) {
    return (
      <div className="w-full bg-gray-800 rounded-lg p-8">
        <div className="text-center">
          <GlobeIcon size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Clone Detections Found</h3>
          <p className="text-gray-400">
            No cloning attempts have been detected yet. Your protection scripts are monitoring for any unauthorized copies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-lg bg-gray-800">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                Clone Domain
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                IP / Location
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                Device
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                Time on Page
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                Actions Taken
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                Detected
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {detections.map(detection => (
              <tr key={detection.id} className="hover:bg-gray-750">
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <GlobeIcon size={16} className="text-cyan-400 mr-2" />
                    <div>
                      <span className="font-medium">{detection.clone_domain}</span>
                      {detection.protected_domain && (
                        <div className="text-xs text-gray-400">
                          Original: {detection.protected_domain.domain}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div>
                    <span className="text-gray-400">{detection.visitor_ip || 'Unknown'}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {getLocationFromIP(detection.visitor_ip)}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    {getDeviceIcon(detection.user_agent)}
                    <span>{getDeviceType(detection.user_agent)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {detection.time_on_page ? `${detection.time_on_page}s` : '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {detection.actions_taken && detection.actions_taken.length > 0 ? (
                      detection.actions_taken.map((action, idx) => (
                        <span 
                          key={idx} 
                          className={`px-2 py-1 rounded text-xs ${
                            action === 'redirect' ? 'bg-blue-900/30 text-blue-400' :
                            action === 'visual_sabotage' ? 'bg-red-900/30 text-red-400' :
                            action === 'replace_links' ? 'bg-yellow-900/30 text-yellow-400' :
                            action === 'replace_images' ? 'bg-purple-900/30 text-purple-400' :
                            'bg-gray-900/30 text-gray-400'
                          }`}
                        >
                          {action.replace('_', ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">None</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {new Date(detection.detected_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <button 
                    onClick={() => handleViewActions(detection)} 
                    className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500 flex items-center"
                  >
                    <ExternalLinkIcon size={14} className="mr-1" />
                    Actions
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedClone && (
        <CloneActionsModal 
          clone={selectedClone} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}