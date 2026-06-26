import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Check, X, Save, FileJson, Download, FileSpreadsheet } from 'lucide-react';
import { Dataset } from '../types/dataset';

export default function DatasetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [relatedDatasets, setRelatedDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<'pretty' | 'raw' | 'table'>('table');
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

      // Fetch related datasets in the same run/bot
      const paramKey = res.data.runId ? `runId=${res.data.runId}` : `botId=${res.data.botId}`;
      const relatedRes = await axios.get(`${API_BASE_URL}/datasets?${paramKey}&pageSize=500`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRelatedDatasets(relatedRes.data.data || []);
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

  const handleExportRelatedCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const paramKey = dataset?.runId ? `runId=${dataset.runId}` : `botId=${dataset?.botId}`;
      const url = `${API_BASE_URL}/datasets/export/csv?${paramKey}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `dataset_run_${dataset?.runId || dataset?.botId}_${new Date().getTime()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV export started');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const handleExportRelatedExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const paramKey = dataset?.runId ? `runId=${dataset.runId}` : `botId=${dataset?.botId}`;
      const url = `${API_BASE_URL}/datasets/export/excel?${paramKey}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `dataset_run_${dataset?.runId || dataset?.botId}_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel export started');
    } catch (error) {
      toast.error('Failed to export Excel');
    }
  };

  const jsonKeys = Array.from(
    new Set(
      relatedDatasets.flatMap(d => {
        try {
          return d.dataJson ? Object.keys(JSON.parse(d.dataJson)) : [];
        } catch {
          return [];
        }
      })
    )
  );

  if (loading) return <div className="p-6 text-gray-500 text-center">Loading...</div>;
  if (!dataset) return null;

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto space-y-6 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Top Navigation & Action Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/datasets')} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dataset Run Details</h1>
            <p className="text-xs text-gray-500 mt-0.5">View and export all scraped products for this bot execution</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {dataset.status !== 'approved' && (
            <button
              onClick={() => handleUpdateStatus('approved')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </button>
          )}
          {dataset.status !== 'rejected' && (
            <button
              onClick={() => handleUpdateStatus('rejected')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Reject (Soft Delete)
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Metadata Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Project</span>
          <span className="block text-sm font-bold text-gray-900 mt-1 truncate" title={dataset.project?.name || ''}>
            {dataset.project?.name || 'N/A'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Bot</span>
          <span className="block text-sm font-bold text-gray-900 mt-1 truncate" title={dataset.bot?.name || ''}>
            {dataset.bot?.name || 'N/A'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Run ID</span>
          <span className="block text-sm font-mono text-gray-900 mt-1 truncate" title={dataset.runId || ''}>
            {dataset.runId || 'N/A'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</span>
          <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${
            dataset.status === 'approved' ? 'bg-green-100 text-green-800' :
            dataset.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {dataset.status}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Source URL</span>
          {dataset.sourceUrl ? (
            <a
              href={dataset.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="block text-sm font-bold text-indigo-600 hover:text-indigo-900 hover:underline mt-1 truncate"
              title={dataset.sourceUrl}
            >
              Open Link ↗
            </a>
          ) : (
            <span className="block text-sm text-gray-900 mt-1">N/A</span>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Created At</span>
          <span className="block text-sm text-gray-900 mt-1 truncate">
            {new Date(dataset.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Results Panel - Taking up 100% width */}
      <div className="w-full">
        <div className="bg-white shadow-lg rounded-xl border border-border flex flex-col min-h-[500px]">
          {/* Header toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-border bg-gray-50/50 rounded-t-xl">
            <h3 className="text-lg font-semibold text-gray-950 flex items-center">
              <FileJson className="w-5 h-5 mr-2 text-gray-500" />
              {viewMode === 'table' ? `Extracted Data (${relatedDatasets.length} items)` : 'Data Payload'}
            </h3>
            
            <div className="flex items-center gap-3">
              {viewMode === 'table' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportRelatedCSV}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 mr-1 text-gray-500" />
                    Export CSV
                  </button>
                  <button
                    onClick={handleExportRelatedExcel}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                    Export Excel
                  </button>
                </div>
              )}
              
              <div className="flex bg-gray-200 rounded-md p-0.5">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 text-sm font-medium rounded-sm ${viewMode === 'table' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Table
                </button>
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
          </div>

          {/* Body Content */}
          <div className="flex-1 p-6 flex flex-col overflow-hidden">
            {viewMode === 'table' ? (
              <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                    <tr>
                      {jsonKeys.map(key => (
                        <th key={key} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{key}</th>
                      ))}
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source URL</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {relatedDatasets.map(d => (
                      <tr 
                        key={d.id} 
                        className={`hover:bg-gray-50/80 transition-colors ${
                          d.id === dataset.id 
                            ? 'bg-indigo-50/50 border-l-4 border-indigo-500 font-semibold text-gray-950' 
                            : 'even:bg-gray-50/30 text-gray-600'
                        }`}
                      >
                        {jsonKeys.map(key => {
                          let val = '';
                          try {
                            const parsed = d.dataJson ? JSON.parse(d.dataJson) : {};
                            val = parsed[key] !== undefined && parsed[key] !== null ? String(parsed[key]) : '';
                          } catch {}

                          const isImage = val.startsWith('http') && (val.includes('.jpg') || val.includes('.jpeg') || val.includes('.png') || val.includes('.webp') || val.includes('wp-content/uploads'));
                          const isLink = val.startsWith('http') && !isImage;

                          return (
                            <td key={key} className="px-6 py-4 whitespace-nowrap text-sm max-w-xs truncate" title={val}>
                              {isImage ? (
                                <img 
                                  src={val} 
                                  alt="extracted thumbnail" 
                                  className="h-10 w-10 object-cover rounded border border-gray-200 shadow-sm hover:scale-125 transition-transform duration-200" 
                                />
                              ) : isLink ? (
                                <a 
                                  href={val} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-indigo-600 hover:text-indigo-900 hover:underline inline-block truncate max-w-[200px]"
                                >
                                  {val.replace(/https?:\/\/(www\.)?/, '')}
                                </a>
                              ) : (
                                val
                              )}
                            </td>
                          );
                        })}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={d.sourceUrl || ''}>
                          <a href={d.sourceUrl || '#'} target="_blank" rel="noreferrer" className="hover:underline">{d.sourceUrl || 'N/A'}</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : viewMode === 'pretty' ? (
              <div className="bg-gray-900 rounded-lg p-4 flex-1 overflow-auto">
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
  );
}
