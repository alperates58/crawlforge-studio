import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { ShieldCheck, HardDrive, Database, Layers, FileText, Bot, BrainCircuit } from 'lucide-react';

export default function SystemSettings() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/system/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        toast.error('Failed to load system stats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return <div className="p-8">Loading System Stats...</div>;

  const statCards = [
    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: Layers, color: 'text-blue-500' },
    { label: 'Total Bots', value: stats?.totalBots || 0, icon: Bot, color: 'text-indigo-500' },
    { label: 'Total Datasets', value: stats?.totalDatasets || 0, icon: Database, color: 'text-purple-500' },
    { label: 'Total Documents', value: stats?.totalDocuments || 0, icon: FileText, color: 'text-orange-500' },
    { label: 'Total AI Jobs', value: stats?.totalAiJobs || 0, icon: BrainCircuit, color: 'text-pink-500' },
    { label: 'Storage Size', value: stats?.storageSize || '0 B', icon: HardDrive, color: 'text-gray-600' },
    { label: 'Database Status', value: stats?.databaseStatus || 'Unknown', icon: ShieldCheck, color: 'text-green-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500">Monitor database limits, storage space, and overall platform health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start space-x-4">
              <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup & Maintenance</h2>
        <p className="text-gray-600 text-sm mb-4">
          Automated backups are currently configured at the infrastructure level (e.g., Coolify).
          Manual backup triggers via this interface are planned for a future update.
        </p>
        <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded-md font-medium cursor-not-allowed">
          Trigger Manual Backup
        </button>
      </div>
    </div>
  );
}
