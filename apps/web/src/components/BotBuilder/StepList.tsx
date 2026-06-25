import { BotStep, StepType } from '../../types/bot';
import { GripVertical, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';

interface StepListProps {
  steps: BotStep[];
  selectedStepId: string | null;
  onSelectStep: (id: string) => void;
  onAddStep: (type: StepType) => void;
  onDeleteStep: (id: string) => void;
  onMoveStep: (index: number, direction: 'up' | 'down') => void;
}

const STEP_TYPES: { type: StepType; label: string }[] = [
  { type: 'OPEN_URL', label: 'Open URL' },
  { type: 'CLICK', label: 'Click Element' },
  { type: 'TYPE', label: 'Type Text' },
  { type: 'WAIT', label: 'Wait' },
  { type: 'SCROLL', label: 'Scroll' },
  { type: 'EXTRACT_TEXT', label: 'Extract Text' },
  { type: 'EXTRACT_LINKS', label: 'Extract Links' },
  { type: 'EXTRACT_ATTRIBUTE', label: 'Extract Attribute' },
  { type: 'EXTRACT_LIST', label: 'Extract List/Grid' },
  { type: 'SAVE_RECORD', label: 'Save Record' },
  { type: 'DOWNLOAD_FILE', label: 'Download File' },
  { type: 'LOOP_LINKS', label: 'Loop Links' },
  { type: 'PAGINATION', label: 'Pagination' },
  { type: 'GO_TO_LINK', label: 'Go To Link' }
];

export default function StepList({
  steps,
  selectedStepId,
  onSelectStep,
  onAddStep,
  onDeleteStep,
  onMoveStep
}: StepListProps) {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const getStepTitle = (step: BotStep) => {
    switch (step.type) {
      case 'OPEN_URL': return step.url ? `Open ${step.url}` : 'Open URL';
      case 'CLICK': return step.selector ? `Click ${step.selector}` : 'Click Element';
      case 'TYPE': return step.selector ? `Type in ${step.selector}` : 'Type Text';
      case 'WAIT': return `Wait ${step.duration_ms}ms`;
      case 'SCROLL': return `Scroll ${step.direction}`;
      case 'EXTRACT_TEXT': return step.field_name ? `Extract ${step.field_name}` : 'Extract Text';
      case 'EXTRACT_LINKS': return step.field_name ? `Extract links as ${step.field_name}` : 'Extract Links';
      case 'EXTRACT_ATTRIBUTE': return step.field_name ? `Extract attr ${step.attribute || 'src'} as ${step.field_name}` : 'Extract Attribute';
      case 'EXTRACT_LIST': return step.item_selector ? `Extract list from ${step.item_selector}` : 'Extract List/Grid';
      case 'SAVE_RECORD': return 'Save Record';
      case 'DOWNLOAD_FILE': return step.field_name ? `Download ${step.field_name}` : 'Download File';
      case 'LOOP_LINKS': return step.source_field ? `Loop over ${step.source_field}` : 'Loop Links';
      case 'PAGINATION': return step.next_selector ? `Paginate via ${step.next_selector}` : 'Pagination';
      case 'GO_TO_LINK': return step.url_field ? `Go to ${step.url_field}` : 'Go To Link';
      default: return 'Unknown Step';
    }
  };

  // Helper to visually flag invalid steps
  const isStepInvalid = (step: BotStep) => {
    switch (step.type) {
      case 'OPEN_URL': return !step.url?.trim();
      case 'CLICK': return !step.selector?.trim();
      case 'TYPE': return !step.selector?.trim() || !step.value?.trim();
      case 'WAIT': return !step.duration_ms || step.duration_ms <= 0;
      case 'EXTRACT_TEXT': return !step.field_name?.trim() || !step.selector?.trim();
      case 'EXTRACT_LINKS': return !step.field_name?.trim() || !step.selector?.trim();
      case 'EXTRACT_ATTRIBUTE': return !step.field_name?.trim() || !step.selector?.trim() || !step.attribute?.trim();
      case 'EXTRACT_LIST': return !step.item_selector?.trim() || !step.fields || step.fields.length === 0;
      case 'DOWNLOAD_FILE': return !step.selector?.trim() || !step.field_name?.trim() || !step.allowed_extensions?.trim();
      case 'LOOP_LINKS': return !step.source_field?.trim();
      case 'PAGINATION': return !step.next_selector?.trim();
      case 'GO_TO_LINK': return !step.url_field?.trim();
      default: return false; // Scroll and Save Record have defaults/no requirements
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b bg-white flex justify-between items-center shrink-0">
        <h2 className="font-medium text-gray-900">Bot Steps</h2>
        <div className="text-sm text-gray-500">{steps.length} steps</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {steps.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No steps yet. Add one below.
          </div>
        ) : (
          steps.map((step, index) => {
            const isSelected = selectedStepId === step.id;
            const invalid = isStepInvalid(step);

            return (
              <div
                key={step.id}
                onClick={() => onSelectStep(step.id)}
                className={`group flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : invalid 
                      ? 'bg-red-50 border-red-200 hover:bg-red-100'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="cursor-grab text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {step.type}
                    </span>
                    {invalid && (
                      <span className="text-[10px] text-red-600 font-medium">Incomplete</span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 truncate ${invalid ? 'text-red-700' : 'text-gray-700'}`}>
                    {getStepTitle(step)}
                  </p>
                </div>

                <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    disabled={index === 0}
                    onClick={(e) => { e.stopPropagation(); onMoveStep(index, 'up'); }}
                    className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={index === steps.length - 1}
                    onClick={(e) => { e.stopPropagation(); onMoveStep(index, 'down'); }}
                    className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteStep(step.id); }}
                  className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-white border-t relative shrink-0">
        {isAddMenuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg border border-gray-100 p-2 grid grid-cols-2 gap-1 z-10">
            {STEP_TYPES.map((t) => (
              <button
                key={t.type}
                onClick={() => {
                  onAddStep(t.type);
                  setIsAddMenuOpen(false);
                }}
                className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium text-sm">Add Step</span>
        </button>
      </div>
    </div>
  );
}
