import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Check, X, Save, FileJson } from 'lucide-react';
import { Dataset } from '../types/dataset';

export default function DatasetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<'pretty' | 'raw'>('pretty');
  const [rawJson, setRawJson] = useState('');

  const fetchDataset = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/datasets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDataset(res.data);
      if (res.data.dataJson) {
        setRawJson(JSON.stringify(JSON.parse(res.data.dataJson), null, 2));
      }
    } catch (error) {
      toast.error('Failed to fetch dataset details');
      navigate('/datasets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataset();
  }, [id]);

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    const isConfirmed = window.confirm(`Are you sure you want to mark this dataset as ${status}?`);
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      const action = status === 'approved' ? 'approve' : 'reject';
      await axios.post(`${API_BASE_URL}/datasets/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Dataset ${status}`);
      fetchDataset();
    } catch (error) {
      toast.error(`Failed to update status`);
    }
  };

  const handleSaveJson = async () => {
    try {
      // Validate JSON
      JSON.parse(rawJson);
    } catch (e) {
      toast.error('Invalid JSON format. Please fix errors before saving.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/datasets/${id}`, {
        dataJson: rawJson
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Dataset JSON updated');
      fetchDataset();
    } catch (error) {
      toast.error('Failed to update JSON');
    }
  };

  if (loading) return <div className="p-6 text-gray-500 text-center">Loading...</div>;
  if (!dataset) return null;

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/datasets')} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Dataset Details</h1>
        </div>
        <div className="flex items-center space-x-3">
          {dataset.status !== 'approved' && (
            <button
              onClick={() => handleUpdateStatus('approved')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </button>
          )}
          {dataset.status !== 'rejected' && (
            <button
              onClick={() => handleUpdateStatus('rejected')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
            >
              <X className="w-4 h-4 mr-2" />
              Reject (Soft Delete)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white shadow rounded-lg border border-border p-5 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Properties</h3>
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase">ID</span>
              <span className="block text-sm text-gray-900 font-mono mt-1">{dataset.id}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase">Project</span>
              <span className="block text-sm text-gray-900 mt-1">{dataset.project?.name || 'Unknown'}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase">Bot</span>
              <span className="block text-sm text-gray-900 mt-1">{dataset.bot?.name || 'Unknown'}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase">Run ID</span>
              <span className="block text-sm text-gray-900 font-mono mt-1 truncate" title={dataset.runId || ''}>
                {dataset.runId || 'N/A'}
              </span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase">Status</span>
              <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                {dataset.status}
              </span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase">Source URL</span>
              <a href={dataset.sourceUrl || '#'} target="_blank" rel="noreferrer" className="block text-sm text-indigo-600 hover:underline mt-1 break-all">
                {dataset.sourceUrl || 'N/A'}
              </a>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase">Created At</span>
              <span className="block text-sm text-gray-900 mt-1">{new Date(dataset.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase">Updated At</span>
              <span className="block text-sm text-gray-900 mt-1">{new Date(dataset.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white shadow rounded-lg border border-border flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50 rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileJson className="w-5 h-5 mr-2 text-gray-500" />
                Data Payload
              </h3>
              <div className="flex bg-gray-200 rounded-md p-0.5">
                <button
                  onClick={() => setViewMode('pretty')}
                  className={`px-3 py-1 text-sm font-medium rounded-sm ${viewMode === 'pretty' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Pretty
                </button>
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-3 py-1 text-sm font-medium rounded-sm ${viewMode === 'raw' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Raw Edit
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 flex flex-col">
              {viewMode === 'pretty' ? (
                <div className="bg-gray-900 rounded-md p-4 flex-1 overflow-auto">
                  <pre className="text-sm text-gray-100 font-mono">
                    {rawJson ? rawJson : '{}'}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col flex-1 space-y-4">
                  <textarea
                    value={rawJson}
                    onChange={(e) => setRawJson(e.target.value)}
                    className="flex-1 w-full p-4 border border-border rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="{}"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveJson}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save JSON
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
