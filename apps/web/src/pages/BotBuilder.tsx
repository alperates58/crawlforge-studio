import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BotStep, StepType } from '../types/bot';
import { toast } from 'sonner';
import { ArrowLeft, Save, Play } from 'lucide-react';
import StepList from '../components/BotBuilder/StepList';
import StepEditor from '../components/BotBuilder/StepEditor';

export default function BotBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bot, setBot] = useState<any>(null);
  const [steps, setSteps] = useState<BotStep[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'builder' | 'json'>('builder');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBot();
  }, [id]);

  const fetchBot = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/bots/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBot(response.data);
      
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
      await axios.put(`http://localhost:3001/api/bots/${id}`, {
        ...bot,
        stepsJson: JSON.stringify(steps)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Bot steps saved successfully');
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
      const response = await axios.post(`http://localhost:3001/api/bots/${id}/run`, {}, {
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
    if (type === 'EXTRACT_TEXT' || type === 'EXTRACT_LINKS') {
      newStep.field_name = '';
      newStep.selector = '';
    }
    
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
              onClick={() => setActiveTab('json')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'json' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              JSON Preview
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
        ) : (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="bg-gray-900 rounded-lg p-6 shadow-inner h-full overflow-auto">
              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                {JSON.stringify(cleanStepsForJson, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
