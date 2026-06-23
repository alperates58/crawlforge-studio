import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';
import { BotStep, StepType } from '../types/bot';
import { toast } from 'sonner';
import { ArrowLeft, Save, Play } from 'lucide-react';
import StepList from '../components/BotBuilder/StepList';
import StepEditor from '../components/BotBuilder/StepEditor';
import RecorderTab from '../components/RecorderTab';

export default function BotBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bot, setBot] = useState<any>(null);
  const [steps, setSteps] = useState<BotStep[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'builder' | 'recorder' | 'json' | 'schedule'>('builder');
  const [schedule, setSchedule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBot();
  }, [id]);

  const fetchBot = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/bots/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBot(response.data);
      
      try {
        const scheduleResponse = await axios.get(`${API_BASE_URL}/bots/${id}/schedule`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (scheduleResponse.data) {
          setSchedule(scheduleResponse.data);
        } else {
          setSchedule({ type: 'manual', timezone: 'Europe/Istanbul', isActive: false, cronExpression: '' });
        }
      } catch (err) {
        console.error('Failed to load schedule', err);
        setSchedule({ type: 'manual', timezone: 'Europe/Istanbul', isActive: false, cronExpression: '' });
      }
      
      // Parse steps if they exist
      if (response.data.stepsJson) {
        try {
          const parsedSteps = typeof response.data.stepsJson === 'string' 
            ? JSON.parse(response.data.stepsJson) 
            : response.data.stepsJson;
          
          // Ensure each step has an ID for drag and drop
          const stepsWithIds = (Array.isArray(parsedSteps) ? parsedSteps : []).map(s => ({
            ...s,
            id: s.id || crypto.randomUUID()
          }));
          
          setSteps(stepsWithIds);
        } catch (e) {
          console.error('Failed to parse steps JSON', e);
          setSteps([]);
        }
      }
    } catch (error) {
      toast.error('Failed to load bot details');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/bots/${id}`, {
        ...bot,
        stepsJson: JSON.stringify(steps)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (schedule) {
        await axios.put(`${API_BASE_URL}/bots/${id}/schedule`, schedule, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      toast.success('Bot saved successfully');
    } catch (error) {
      toast.error('Failed to save bot steps');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRun = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/bots/${id}/run`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Bot run queued successfully');
      navigate(`/runs/${response.data.id}`);
    } catch (error) {
      toast.error('Failed to start bot run');
      console.error(error);
    }
  };

  const handleAddStep = (type: StepType) => {
    const newStep: any = { id: crypto.randomUUID(), type };
    
    // Add default fields based on type
    if (type === 'OPEN_URL') newStep.url = '';
    if (type === 'CLICK' || type === 'TYPE') newStep.selector = '';
    if (type === 'TYPE') newStep.value = '';
    if (type === 'WAIT') newStep.duration_ms = 1000;
    if (type === 'SCROLL') newStep.direction = 'down';
    if (type === 'EXTRACT_TEXT') newStep.field_name = '';
    if (type === 'EXTRACT_LINKS') { newStep.field_name = ''; newStep.selector = ''; }
    if (type === 'SAVE_RECORD') newStep.dataset_id = '';
    if (type === 'DOWNLOAD_FILE') { newStep.selector = ''; newStep.field_name = ''; newStep.allowed_extensions = 'pdf,docx,xlsx,png,jpg'; }
    if (type === 'LOOP_LINKS') { newStep.source_field = ''; newStep.max_items = 50; newStep.steps = []; }
    if (type === 'PAGINATION') { newStep.next_selector = ''; newStep.max_pages = 10; newStep.stop_when_selector_missing = true; newStep.steps_per_page = []; }
    if (type === 'GO_TO_LINK') newStep.url_field = '';
    
    setSteps([...steps, newStep]);
    setSelectedStepId(newStep.id);
  };

  const handleDeleteStep = (stepId: string) => {
    setSteps(steps.filter(s => s.id !== stepId));
    if (selectedStepId === stepId) setSelectedStepId(null);
  };

  const handleUpdateStep = (stepId: string, updates: Partial<BotStep>) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, ...updates } as BotStep : s));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newSteps = [...steps];
      [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
      setSteps(newSteps);
    } else if (direction === 'down' && index < steps.length - 1) {
      const newSteps = [...steps];
      [newSteps[index + 1], newSteps[index]] = [newSteps[index], newSteps[index + 1]];
      setSteps(newSteps);
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!bot) return <div className="p-8">Bot not found</div>;

  const selectedStep = steps.find(s => s.id === selectedStepId);

  // Strip internal 'id' before showing/saving JSON to match schema docs
  const cleanStepsForJson = steps.map(({id, ...rest}) => rest);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-8">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/bots')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{bot.name}</h1>
            <p className="text-sm text-gray-500">{bot.description || 'No description'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRun}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Run Bot
          </button>
          
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'builder' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Builder
            </button>
            <button 
              onClick={() => setActiveTab('recorder')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'recorder' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Recorder
            </button>
            <button 
              onClick={() => setActiveTab('json')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'json' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              JSON Preview
            </button>
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'schedule' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Schedule
            </button>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex bg-gray-50">
        {activeTab === 'builder' ? (
          <>
            {/* Left Panel: Step List */}
            <div className="w-1/3 min-w-[350px] max-w-[450px] border-r bg-gray-50 flex flex-col h-full overflow-hidden">
              <StepList 
                steps={steps}
                selectedStepId={selectedStepId}
                onSelectStep={setSelectedStepId}
                onAddStep={handleAddStep}
                onDeleteStep={handleDeleteStep}
                onMoveStep={moveStep}
              />
            </div>
            
            {/* Right Panel: Step Editor */}
            <div className="flex-1 bg-white overflow-y-auto p-6">
              {selectedStep ? (
                <StepEditor 
                  step={selectedStep} 
                  onChange={(updates) => handleUpdateStep(selectedStep.id, updates)} 
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Select a step from the list to edit its properties
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'recorder' ? (
          <div className="flex-1 p-6 overflow-y-auto">
            <RecorderTab 
              botId={id as string} 
              onAppendSteps={(recordedSteps) => {
                setSteps([...steps, ...recordedSteps]);
                toast.success('Steps appended successfully');
                setActiveTab('builder');
              }}
              onReplaceSteps={(recordedSteps) => {
                setSteps(recordedSteps);
                toast.success('Steps replaced successfully');
                setActiveTab('builder');
              }}
            />
          </div>
        ) : activeTab === 'json' ? (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="bg-gray-900 rounded-lg p-6 shadow-inner h-full overflow-auto">
              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                {JSON.stringify(cleanStepsForJson, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex justify-center">
            <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-6">Bot Schedule</h2>
              {schedule && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="isActive" 
                      checked={schedule.isActive} 
                      onChange={e => setSchedule({...schedule, isActive: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="isActive" className="font-medium text-gray-700">Enable Schedule</label>
                  </div>

                  {schedule.isActive && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
                        <select 
                          value={schedule.type}
                          onChange={e => {
                            const newType = e.target.value;
                            let cronExpr = schedule.cronExpression;
                            if (newType === 'hourly') cronExpr = '0 * * * *';
                            if (newType === 'daily') cronExpr = '0 0 * * *';
                            if (newType === 'weekly') cronExpr = '0 0 * * 0';
                            if (newType === 'monthly') cronExpr = '0 0 1 * *';
                            setSchedule({...schedule, type: newType, cronExpression: cronExpr});
                          }}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="manual">Manual Only</option>
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="custom_cron">Custom Cron</option>
                        </select>
                      </div>

                      {schedule.type !== 'manual' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cron Expression</label>
                            <input 
                              type="text" 
                              value={schedule.cronExpression || ''}
                              onChange={e => setSchedule({...schedule, cronExpression: e.target.value})}
                              disabled={schedule.type !== 'custom_cron'}
                              className="w-full p-2 border rounded-md disabled:bg-gray-100 font-mono text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                            <input 
                              type="text" 
                              value={schedule.timezone || ''}
                              onChange={e => setSchedule({...schedule, timezone: e.target.value})}
                              placeholder="Europe/Istanbul"
                              className="w-full p-2 border rounded-md"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {schedule.nextRunAt && (
                    <div className="pt-6 border-t border-gray-100 text-sm text-gray-600">
                      <p><strong>Next Run:</strong> {new Date(schedule.nextRunAt).toLocaleString()}</p>
                      {schedule.lastRunAt && <p className="mt-1"><strong>Last Run:</strong> {new Date(schedule.lastRunAt).toLocaleString()}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
