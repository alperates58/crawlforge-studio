import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';

interface StepLog {
  id: string;
  stepIndex: number;
  stepType: string;
  status: string;
  message: string | null;
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
  const [loading, setLoading] = useState(true);

  const fetchRun = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3001/api/runs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRun(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRun();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!run) return <div className="p-8">Run not found</div>;

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
                <li key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {log.status === 'succeeded' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        Step {log.stepIndex + 1}: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded ml-1">{log.stepType}</span>
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
    </div>
  );
}
