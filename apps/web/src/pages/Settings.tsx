import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Database, MessageSquare, Play, Key } from 'lucide-react';
import { AiSettingType, ExtractionSchemaType, PromptTemplateType } from '../types/ai';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('ai_settings');

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings & AI Foundation</h1>
      </div>

      <div className="bg-white shadow rounded-lg border border-border flex flex-col min-h-[700px]">
        <div className="flex border-b border-border bg-gray-50 rounded-t-lg">
          <TabButton id="ai_settings" active={activeTab} setActive={setActiveTab} icon={<SettingsIcon className="w-4 h-4 mr-2" />} label="AI Provider" />
          <TabButton id="schemas" active={activeTab} setActive={setActiveTab} icon={<Database className="w-4 h-4 mr-2" />} label="Schemas" />
          <TabButton id="prompts" active={activeTab} setActive={setActiveTab} icon={<MessageSquare className="w-4 h-4 mr-2" />} label="Prompt Templates" />
          <TabButton id="playground" active={activeTab} setActive={setActiveTab} icon={<Play className="w-4 h-4 mr-2" />} label="AI Playground" />
        </div>
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'ai_settings' && <AiSettingsTab />}
          {activeTab === 'schemas' && <SchemasTab />}
          {activeTab === 'prompts' && <PromptsTab />}
          {activeTab === 'playground' && <PlaygroundTab />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ id, active, setActive, icon, label }: any) {
  return (
    <button
      onClick={() => setActive(id)}
      className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center ${active === id ? 'border-indigo-500 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
    >
      {icon}
      {label}
    </button>
  );
}

// -------------------------------------------------------------
// AI Settings Tab
// -------------------------------------------------------------
function AiSettingsTab() {
  const [setting, setSetting] = useState<AiSettingType>({
    providerName: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: '',
    model: 'deepseek-v4-flash',
    temperature: 0.1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/settings/ai`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data) {
          setSetting({
            ...res.data,
            apiKey: '' // clear input
          });
        }
      } catch (e) {
        toast.error('Failed to load AI settings');
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/settings/ai`, setting, { headers: { Authorization: `Bearer ${token}` } });
      setSetting({
        ...res.data,
        apiKey: '' // clear on save success
      });
      toast.success('AI Settings saved successfully');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">AI Provider Configuration</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Provider Name</label>
          <input type="text" value={setting.providerName} onChange={e => setSetting({...setting, providerName: e.target.value})} className="mt-1 block w-full rounded-md border-border border p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Base URL (OpenAI-compatible)</label>
          <input type="text" value={setting.baseUrl} onChange={e => setSetting({...setting, baseUrl: e.target.value})} className="mt-1 block w-full rounded-md border-border border p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">API Key</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-4 w-4 text-gray-400" />
            </div>
            <input type="password" placeholder={setting.apiKeyMasked ? `Currently: ${setting.apiKeyMasked}` : 'Enter new API key'} value={setting.apiKey} onChange={e => setSetting({...setting, apiKey: e.target.value})} className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-border border p-2 rounded-md" />
          </div>
          <p className="mt-1 text-xs text-gray-500">Stored using AES-256-CBC encryption.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Model Name</label>
          <input type="text" value={setting.model} onChange={e => setSetting({...setting, model: e.target.value})} className="mt-1 block w-full rounded-md border-border border p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Temperature</label>
          <input type="number" step="0.1" min="0" max="2" value={setting.temperature} onChange={e => setSetting({...setting, temperature: parseFloat(e.target.value)})} className="mt-1 block w-full rounded-md border-border border p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div className="pt-4">
          <button onClick={handleSave} disabled={loading || !setting.apiKey && !setting.apiKeyMasked} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Schemas Tab
// -------------------------------------------------------------
function SchemasTab() {
  const [schemas, setSchemas] = useState<ExtractionSchemaType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/extraction-schemas`, { headers: { Authorization: `Bearer ${token}` } });
        setSchemas(res.data);
      } catch (e) {
        toast.error('Failed to load schemas');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Extraction Schemas</h3>
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-cols-1 gap-4">
          {schemas.map(s => (
            <div key={s.id} className="border border-border p-4 rounded-md bg-gray-50">
              <h4 className="font-bold text-gray-900">{s.name}</h4>
              <p className="text-sm text-gray-500 mb-2">{s.description}</p>
              <pre className="text-xs bg-white p-2 border rounded max-h-40 overflow-auto">{s.schemaJson}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Prompts Tab
// -------------------------------------------------------------
function PromptsTab() {
  const [templates, setTemplates] = useState<PromptTemplateType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/prompt-templates`, { headers: { Authorization: `Bearer ${token}` } });
        setTemplates(res.data);
      } catch (e) {
        toast.error('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Prompt Templates</h3>
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-cols-1 gap-4">
          {templates.map(t => (
            <div key={t.id} className="border border-border p-4 rounded-md bg-gray-50">
              <h4 className="font-bold text-gray-900">{t.name}</h4>
              <div className="mt-2 text-xs bg-white p-2 border rounded">
                <strong>System:</strong> {t.systemPrompt}
              </div>
              <div className="mt-2 text-xs bg-white p-2 border rounded">
                <strong>User:</strong> {t.userPromptTemplate}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Playground Tab
// -------------------------------------------------------------
function PlaygroundTab() {
  const [schemas, setSchemas] = useState<ExtractionSchemaType[]>([]);
  const [templates, setTemplates] = useState<PromptTemplateType[]>([]);
  const [text, setText] = useState('');
  const [schemaId, setSchemaId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      const [sRes, tRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/extraction-schemas`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/prompt-templates`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSchemas(sRes.data);
      setTemplates(tRes.data);
      if (sRes.data.length > 0) setSchemaId(sRes.data[0].id);
      if (tRes.data.length > 0) setTemplateId(tRes.data[0].id);
    };
    load();
  }, []);

  const handleRun = async () => {
    if (!text || !schemaId || !templateId) {
      toast.error('Fill all fields');
      return;
    }
    try {
      setLoading(true);
      setResult(null);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/ai/playground`, { text, schemaId, promptTemplateId: templateId }, { headers: { Authorization: `Bearer ${token}` } });
      setResult(res.data);
    } catch (e: any) {
      toast.error('AI execution failed');
      setResult({ error: e.response?.data?.details || e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 space-y-4 flex flex-col">
        <div>
          <label className="block text-sm font-medium text-gray-700">Raw Text Input</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={10} className="mt-1 block w-full rounded-md border-border border p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono text-xs" placeholder="Paste unstructured data here..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Schema</label>
            <select value={schemaId} onChange={e => setSchemaId(e.target.value)} className="mt-1 block w-full rounded-md border-border border p-2 sm:text-sm">
              {schemas.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Prompt Template</label>
            <select value={templateId} onChange={e => setTemplateId(e.target.value)} className="mt-1 block w-full rounded-md border-border border p-2 sm:text-sm">
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <div className="pt-2">
          <button onClick={handleRun} disabled={loading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Running AI...' : 'Run Extraction'}
          </button>
        </div>
      </div>
      <div className="flex-1 bg-gray-50 border border-border rounded-md p-4 flex flex-col">
        <h3 className="text-sm font-bold text-gray-700 mb-2">AI Response</h3>
        {result ? (
          <div className="overflow-auto flex-1 text-xs font-mono">
            {result.error && <div className="text-red-600 mb-2">Error: {result.error}</div>}
            {result.needsReview && <div className="text-red-600 mb-2 font-bold uppercase border border-red-400 bg-red-50 p-2 rounded">Needs Review: Validation Failed</div>}
            
            {result.confidenceScore !== undefined && (
              <div className="mb-2 text-gray-500">Confidence: {(result.confidenceScore * 100).toFixed(1)}% | Tokens: {result.tokenCount}</div>
            )}
            
            {result.validationErrors && (
              <div className="mb-4 text-red-600 bg-red-50 p-2 rounded">
                <strong>Validation Errors:</strong>
                <pre>{JSON.stringify(result.validationErrors, null, 2)}</pre>
              </div>
            )}

            {result.json && (
              <div className="mb-4">
                <strong className="text-green-600 block mb-1">Parsed JSON:</strong>
                <pre className="bg-white p-2 border rounded text-gray-800">{JSON.stringify(result.json, null, 2)}</pre>
              </div>
            )}

            {result.rawResponse && (
              <div>
                <strong className="text-gray-500 block mb-1">Raw Output:</strong>
                <pre className="bg-white p-2 border rounded text-gray-500">{result.rawResponse}</pre>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 text-sm flex items-center justify-center h-full italic">Results will appear here</div>
        )}
      </div>
    </div>
  );
}
