import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';
import { ArrowLeft, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';

interface StepLog {
  id: string;
  stepIndex: number;
  stepType: string;
  status: string;
  message: string | null;
  pageIndex: number | null;
  itemIndex: number | null;
  parentStepIndex: number | null;
  createdAt: string;
}

interface Run {
  id: string;
  botId: string;
  bot: { name: string; stepsJson: string };
  status: string;
  startedAt: string | null;
  durationMs: number | null;
  pagesVisited: number;
  recordsExtracted: number;
  errorMessage: string | null;
  createdAt: string;
  stepLogs: StepLog[];
}

export default function RunDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [run, setRun] = useState<Run | null>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDatasets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/datasets?runId=${id}&pageSize=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDatasets(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch datasets for run', err);
    }
  };

  const fetchRun = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/runs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRun(res.data);
      await fetchDatasets();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRun();

    let intervalId: any = null;
    if (run && (run.status === 'queued' || run.status === 'running')) {
      intervalId = setInterval(() => {
        fetchRun();
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id, run?.status]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!run) return <div className="p-8">Run not found</div>;

  const jsonKeys = Array.from(
    new Set(
      datasets.flatMap(d => {
        try {
          return d.dataJson ? Object.keys(JSON.parse(d.dataJson)) : [];
        } catch {
          return [];
        }
      })
    )
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded': return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'failed': return <XCircle className="w-6 h-6 text-red-500" />;
      case 'running': return <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />;
      default: return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/runs')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Run Details</h1>
          <p className="text-sm text-gray-500">{run.bot.name} • {new Date(run.createdAt).toLocaleString()}</p>
        </div>
        <div className="ml-auto">
          <button 
            onClick={fetchRun}
            className="flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
          <div className="flex items-center gap-2">
            {getStatusIcon(run.status)}
            <span className="text-lg font-semibold capitalize text-gray-900">{run.status}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Duration</div>
          <div className="text-lg font-semibold text-gray-900">
            {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : '-'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Pages Visited</div>
          <div className="text-lg font-semibold text-gray-900">{run.pagesVisited}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Records Extracted</div>
          <div className="text-lg font-semibold text-gray-900">{run.recordsExtracted}</div>
        </div>
      </div>

      {run.errorMessage && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <h3 className="text-red-800 font-medium">Run Failed</h3>
          <p className="text-red-700 text-sm mt-1">{run.errorMessage}</p>
        </div>
      )}

      {/* Execution Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Execution Logs</h2>
        </div>
        <div className="p-0">
          {run.stepLogs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No logs available for this run.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {run.stepLogs.map((log) => (
                <li key={log.id} className="p-4 hover:bg-gray-50 transition-colors" style={{ paddingLeft: log.parentStepIndex != null ? '2rem' : '1rem' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {log.status === 'succeeded' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <span>Step {log.stepIndex + 1}:</span>
                        <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{log.stepType}</span>
                        {log.pageIndex != null && (
                          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full">
                            Page {log.pageIndex}
                          </span>
                        )}
                        {log.itemIndex != null && (
                          <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-full">
                            Item {log.itemIndex}
                          </span>
                        )}
                      </p>
                      {log.message && (
                        <p className="text-sm text-red-600 mt-1">{log.message}</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Extracted Data Table */}
      {datasets.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Extracted Data ({datasets.length} items)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {jsonKeys.map(key => (
                    <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{key}</th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source URL</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {datasets.map(dataset => (
                  <tr key={dataset.id} className="hover:bg-gray-50 transition-colors">
                    {jsonKeys.map(key => {
                      let val = '';
                      try {
                        const parsed = dataset.dataJson ? JSON.parse(dataset.dataJson) : {};
                        val = parsed[key] !== undefined && parsed[key] !== null ? String(parsed[key]) : '';
                      } catch {}

                      const isImage = val.startsWith('http') && (val.includes('.jpg') || val.includes('.jpeg') || val.includes('.png') || val.includes('.webp') || val.includes('wp-content/uploads'));
                      const isLink = val.startsWith('http') && !isImage;

                      return (
                        <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={val}>
                          {isImage ? (
                            <img src={val} alt="extracted" className="h-10 w-10 object-cover rounded border" />
                          ) : isLink ? (
                            <a href={val} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{val}</a>
                          ) : (
                            val
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={dataset.sourceUrl || ''}>
                      <a href={dataset.sourceUrl || '#'} target="_blank" rel="noreferrer" className="hover:underline">{dataset.sourceUrl || 'N/A'}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
