import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { PlayCircle, PauseCircle } from 'lucide-react';

export default function Schedules() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/schedules', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedules(response.data);
    } catch (error) {
      toast.error('Failed to load schedules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleToggle = async (id: string, currentlyActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = currentlyActive ? 'pause' : 'resume';
      await axios.post(`http://localhost:3001/api/schedules/${id}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Schedule ${currentlyActive ? 'paused' : 'resumed'}`);
      fetchSchedules();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
          <p className="text-gray-500">Manage automated bot executions</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
              <th className="p-4 font-medium">Bot</th>
              <th className="p-4 font-medium">Project</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Last Run</th>
              <th className="p-4 font-medium">Next Run</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schedules.map(schedule => (
              <tr key={schedule.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{schedule.bot?.name || 'Unknown Bot'}</td>
                <td className="p-4 text-gray-500">{schedule.bot?.project?.name || '-'}</td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                    {schedule.type}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${schedule.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {schedule.isActive ? 'Active' : 'Paused'}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {schedule.lastRunAt ? new Date(schedule.lastRunAt).toLocaleString() : 'Never'}
                </td>
                <td className="p-4 text-sm font-medium text-gray-900">
                  {schedule.nextRunAt ? new Date(schedule.nextRunAt).toLocaleString() : '-'}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggle(schedule.id, schedule.isActive)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    title={schedule.isActive ? "Pause" : "Resume"}
                  >
                    {schedule.isActive ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                  </button>
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No schedules found. Enable a schedule from the Bot Builder.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
