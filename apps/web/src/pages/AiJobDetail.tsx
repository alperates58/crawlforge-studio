import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, CheckCircle, XCircle } from 'lucide-react';

export default function AiJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/ai-jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJob(res.data);
    } catch (e) {
      toast.error('Failed to load AI Job detail');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/ai-jobs/${id}/run`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Job queued for execution');
      loadJob();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to run job');
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this result?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/ai-jobs/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Result approved');
      loadJob();
    } catch (e) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this result?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/ai-jobs/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Result rejected');
      loadJob();
    } catch (e) {
      toast.error('Failed to reject');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!job) return <div className="p-8 text-center text-gray-500">Job not found</div>;

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <button onClick={() => navigate('/ai-jobs')} className="text-sm text-gray-500 hover:text-gray-900 mb-2">← Back to AI Jobs</button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Job: {job.id.substring(0,8)}
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${job.status === 'completed' ? 'bg-green-100 text-green-800' : job.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {job.status}
            </span>
          </h1>
        </div>
        <div className="flex gap-2">
          {job.status === 'pending' || job.status === 'failed' ? (
            <button onClick={handleRun} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium">
              <Play className="w-4 h-4" /> Run Job
            </button>
          ) : (
            <button onClick={loadJob} className="text-sm bg-white border border-gray-300 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">
              Refresh Status
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-border flex flex-col min-h-[500px]">
        <div className="flex border-b border-border bg-gray-50 rounded-t-lg">
          <TabButton id="overview" active={activeTab} setActive={setActiveTab} label="Overview" />
          <TabButton id="raw" active={activeTab} setActive={setActiveTab} label="Raw Response" />
          <TabButton id="json" active={activeTab} setActive={setActiveTab} label="Structured JSON" />
          <TabButton id="validation" active={activeTab} setActive={setActiveTab} label="Validation" />
        </div>
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border p-4 rounded bg-gray-50">
                  <h4 className="font-semibold text-gray-700 text-sm mb-1">Provider & Model</h4>
                  <p className="text-sm">{job.providerName} - {job.model}</p>
                </div>
                <div className="border p-4 rounded bg-gray-50">
                  <h4 className="font-semibold text-gray-700 text-sm mb-1">Source</h4>
                  <p className="text-sm">
                    {job.documentId ? `Document: ${job.documentId}` : job.datasetId ? `Dataset: ${job.datasetId}` : 'None'}
                  </p>
                </div>
                <div className="border p-4 rounded bg-gray-50">
                  <h4 className="font-semibold text-gray-700 text-sm mb-1">Timing</h4>
                  <p className="text-sm">Created: {new Date(job.createdAt).toLocaleString()}</p>
                  <p className="text-sm">Started: {job.startedAt ? new Date(job.startedAt).toLocaleString() : '-'}</p>
                  <p className="text-sm">Finished: {job.finishedAt ? new Date(job.finishedAt).toLocaleString() : '-'}</p>
                </div>
                <div className="border p-4 rounded bg-gray-50">
                  <h4 className="font-semibold text-gray-700 text-sm mb-1">Tokens</h4>
                  <p className="text-sm">{job.tokenCount || '0'}</p>
                </div>
              </div>

              {job.extractionResult && (
                <div className="mt-8 p-6 border rounded-lg bg-indigo-50 border-indigo-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-indigo-900 mb-1">Review Status: {job.extractionResult.reviewStatus}</h3>
                    <p className="text-sm text-indigo-700">Confidence Score: {job.extractionResult.confidenceScore ? (job.extractionResult.confidenceScore * 100).toFixed(1) + '%' : '-'}</p>
                  </div>
                  {job.extractionResult.reviewStatus === 'needs_review' && (
                    <div className="flex gap-3">
                      <button onClick={handleReject} className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">
                        <XCircle className="w-4 h-4"/> Reject
                      </button>
                      <button onClick={handleApprove} className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                        <CheckCircle className="w-4 h-4"/> Approve
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {activeTab === 'raw' && (
            <div className="h-full">
              <pre className="bg-gray-100 p-4 rounded text-sm font-mono whitespace-pre-wrap">{job.rawResponse || 'No response yet'}</pre>
            </div>
          )}
          {activeTab === 'json' && (
            <div className="h-full">
              <pre className="bg-gray-100 p-4 rounded text-sm font-mono whitespace-pre-wrap">{job.structuredJson ? JSON.stringify(JSON.parse(job.structuredJson), null, 2) : 'No JSON yet'}</pre>
            </div>
          )}
          {activeTab === 'validation' && (
            <div className="h-full">
              {job.validationErrors ? (
                <pre className="bg-red-50 text-red-800 p-4 rounded text-sm font-mono whitespace-pre-wrap border border-red-200">
                  {JSON.stringify(JSON.parse(job.validationErrors), null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">No validation errors.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ id, active, setActive, label }: any) {
  return (
    <button
      onClick={() => setActive(id)}
      className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center ${active === id ? 'border-indigo-500 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
    >
      {label}
    </button>
  );
}
