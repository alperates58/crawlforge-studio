import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';
import { Plus } from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

interface Bot {
  id: string;
  name: string;
  startUrl: string;
  status: string;
  project: {
    name: string;
  };
}

export default function Bots() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotStartUrl, setNewBotStartUrl] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const navigate = useNavigate();

  const fetchBotsAndProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const [botsRes, projectsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/bots`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setBots(botsRes.data);
      setProjects(projectsRes.data);
      if (projectsRes.data.length > 0) {
        setSelectedProjectId(projectsRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createBot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/bots`, {
        name: newBotName,
        projectId: selectedProjectId,
        startUrl: newBotStartUrl,
        description: '',
        stepsJson: '[]'
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setShowModal(false);
      navigate(`/bots/${res.data.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBotsAndProjects();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bots</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Bot
        </button>
      </div>

      <div className="bg-white shadow rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : bots.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No bots found. Create one to get started.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bots.map((bot) => (
                <tr 
                  key={bot.id} 
                  onClick={() => navigate(`/bots/${bot.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bot.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bot.project?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bot.startUrl || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bot.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {bot.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Bot</h2>
            <form onSubmit={createBot}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  required
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="E.g., Price Monitor"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start URL</label>
                <input
                  type="url"
                  required
                  value={newBotStartUrl}
                  onChange={(e) => setNewBotStartUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600"
                >
                  Create Bot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
