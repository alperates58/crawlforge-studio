import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, WS_BASE_URL } from '../lib/api';
import { toast } from 'sonner';
import { Play, Square, MousePointer2, Keyboard, Clock, RefreshCw, AlertCircle, Plus, Replace } from 'lucide-react';

interface RecorderTabProps {
  botId: string;
  onAppendSteps: (steps: any[]) => void;
  onReplaceSteps: (steps: any[]) => void;
}

export default function RecorderTab({ botId, onAppendSteps, onReplaceSteps }: RecorderTabProps) {
  const [startUrl, setStartUrl] = useState('https://example.com');
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'starting' | 'running' | 'stopped'>('idle');
  const [recordedSteps, setRecordedSteps] = useState<any[]>([]);
  const [typeText, setTypeText] = useState('');
  const [waitMs, setWaitMs] = useState(1000);
  
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const startSession = async () => {
    try {
      setStatus('starting');
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/recorder/sessions`, 
        { botId, startUrl },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setSession(res.data);
      connectWebSocket(res.data.id);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start recording');
      setStatus('idle');
    }
  };

  const connectWebSocket = (sessionId: string) => {
    const ws = new WebSocket(`${WS_BASE_URL}?sessionId=${sessionId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('running');
      toast.success('Connected to remote browser');
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'frame') {
        renderFrame(msg.data);
      } else if (msg.type === 'steps_sync') {
        setRecordedSteps(msg.steps);
      }
    };

    ws.onclose = () => {
      setStatus('stopped');
    };
  };

  const renderFrame = (base64Data: string) => {
    if (!imageRef.current) {
      (imageRef as any).current = new Image();
    }
    if (imageRef.current) {
      imageRef.current.onload = () => {
        const canvas = canvasRef.current;
        if (canvas && imageRef.current) {
          const ctx = canvas.getContext('2d');
          canvas.width = imageRef.current.width;
          canvas.height = imageRef.current.height;
          ctx?.drawImage(imageRef.current, 0, 0);
        }
      };
      imageRef.current.src = `data:image/jpeg;base64,${base64Data}`;
    }
  };

  const stopSession = async () => {
    if (!session) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/recorder/sessions/${session.id}/stop`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (wsRef.current) {
        wsRef.current.close();
      }
      setStatus('stopped');
      toast.info('Recording stopped');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (status !== 'running' || !wsRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    wsRef.current.send(JSON.stringify({ action: 'click', x, y }));
  };

  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (status !== 'running' || !wsRef.current) return;
    // Debounce or send directly
    wsRef.current.send(JSON.stringify({ action: 'scroll', deltaY: e.deltaY }));
  };

  const handleSendType = () => {
    if (status !== 'running' || !wsRef.current || !typeText) return;
    wsRef.current.send(JSON.stringify({ action: 'type', text: typeText }));
    setTypeText('');
  };

  const handleSendWait = () => {
    if (status !== 'running' || !wsRef.current || !waitMs) return;
    wsRef.current.send(JSON.stringify({ action: 'wait', duration: waitMs }));
  };

  return (
    <div className="flex h-[calc(100vh-200px)] border rounded-xl overflow-hidden bg-gray-50">
      {/* Remote Browser Area */}
      <div className="flex-1 bg-gray-900 flex flex-col relative">
        <div className="h-14 bg-gray-800 flex items-center px-4 border-b border-gray-700 justify-between">
          <div className="flex space-x-2 w-full max-w-2xl">
            <input 
              type="text" 
              value={startUrl}
              onChange={(e) => setStartUrl(e.target.value)}
              disabled={status !== 'idle' && status !== 'stopped'}
              className="flex-1 bg-gray-700 text-white rounded px-3 py-1.5 text-sm outline-none"
              placeholder="https://..."
            />
            {status === 'idle' || status === 'stopped' ? (
              <button onClick={startSession} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-sm flex items-center">
                <Play className="w-4 h-4 mr-2" /> Start Recording
              </button>
            ) : (
              <button onClick={stopSession} className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded text-sm flex items-center">
                <Square className="w-4 h-4 mr-2" /> Stop
              </button>
            )}
          </div>
          {status === 'running' && <span className="text-red-400 text-xs font-bold animate-pulse flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>REC</span>}
        </div>
        
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          {status === 'idle' || status === 'stopped' ? (
            <div className="text-gray-500 flex flex-col items-center">
              <Monitor className="w-12 h-12 mb-2 opacity-50" />
              <p>Enter a URL and Start Recording to view remote browser.</p>
            </div>
          ) : (
            <canvas 
              ref={canvasRef} 
              onClick={handleCanvasClick}
              onWheel={handleCanvasWheel}
              className="max-w-full max-h-full object-contain cursor-crosshair shadow-2xl rounded"
              style={{ minWidth: '800px', minHeight: '600px', backgroundColor: '#fff' }}
            />
          )}
        </div>
      </div>

      {/* Sidebar Tools & Steps */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-sm mb-4">Manual Actions</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Type Text</label>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={typeText}
                  onChange={(e) => setTypeText(e.target.value)}
                  className="flex-1 border rounded px-2 py-1 text-sm"
                  placeholder="Enter text..."
                />
                <button onClick={handleSendType} className="bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-700">
                  <Keyboard className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Wait (ms)</label>
              <div className="flex space-x-2">
                <input 
                  type="number" 
                  value={waitMs}
                  onChange={(e) => setWaitMs(parseInt(e.target.value))}
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button onClick={handleSendWait} className="bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-700">
                  <Clock className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <h3 className="font-semibold text-sm mb-3">Recorded Steps ({recordedSteps.length})</h3>
          <div className="space-y-2">
            {recordedSteps.map((step, idx) => (
              <div key={step.id || idx} className="text-xs border rounded p-2 bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-700 flex items-center">
                    {step.type === 'CLICK' && <MousePointer2 className="w-3 h-3 mr-1" />}
                    {step.type === 'TYPE' && <Keyboard className="w-3 h-3 mr-1" />}
                    {step.type === 'OPEN_URL' && <RefreshCw className="w-3 h-3 mr-1" />}
                    {step.type}
                  </span>
                  {step.weakSelector && (
                    <span className="text-red-500 flex items-center" title="Weak Selector (CSS Fallback)">
                      <AlertCircle className="w-3 h-3 mr-1" /> Weak
                    </span>
                  )}
                </div>
                {step.parameters?.selector && <div className="truncate text-gray-500 font-mono" title={step.parameters.selector}>{step.parameters.selector}</div>}
                {step.parameters?.text && <div className="truncate text-blue-600">"{step.parameters.text}"</div>}
                {step.parameters?.url && <div className="truncate text-blue-600">{step.parameters.url}</div>}
                {step.parameters?.durationMs && <div className="text-orange-600">{step.parameters.durationMs}ms</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
          <button 
            onClick={() => onAppendSteps(recordedSteps)}
            disabled={recordedSteps.length === 0}
            className="w-full py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded text-sm font-medium flex items-center justify-center disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" /> Append to Bot Steps
          </button>
          <button 
            onClick={() => onReplaceSteps(recordedSteps)}
            disabled={recordedSteps.length === 0}
            className="w-full py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded text-sm font-medium flex items-center justify-center disabled:opacity-50"
          >
            <Replace className="w-4 h-4 mr-2" /> Replace Bot Steps
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline fallback icon to avoid import issues
function Monitor(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}
