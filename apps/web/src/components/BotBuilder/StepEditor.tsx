import { BotStep } from '../../types/bot';

interface StepEditorProps {
  step: BotStep;
  onChange: (updates: Partial<BotStep>) => void;
}

export default function StepEditor({ step, onChange }: StepEditorProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value } as Partial<BotStep>);
  };

  const renderFields = () => {
    switch (step.type) {
      case 'OPEN_URL':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL to open</label>
              <input
                type="url"
                value={step.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://example.com"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!step.url ? 'border-red-300' : 'border-gray-300'}`}
              />
              {!step.url && <p className="text-red-500 text-xs mt-1">URL is required</p>}
            </div>
          </div>
        );

      case 'CLICK':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CSS Selector</label>
              <input
                type="text"
                value={step.selector || ''}
                onChange={(e) => handleChange('selector', e.target.value)}
                placeholder=".submit-button, #login-btn"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!step.selector ? 'border-red-300' : 'border-gray-300'}`}
              />
              {!step.selector && <p className="text-red-500 text-xs mt-1">Selector is required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (ms) <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input
                type="number"
                value={step.timeout_ms || ''}
                onChange={(e) => handleChange('timeout_ms', parseInt(e.target.value) || undefined)}
                placeholder="30000"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case 'TYPE':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CSS Selector</label>
              <input
                type="text"
                value={step.selector || ''}
                onChange={(e) => handleChange('selector', e.target.value)}
                placeholder="input[name='search']"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!step.selector ? 'border-red-300' : 'border-gray-300'}`}
              />
              {!step.selector && <p className="text-red-500 text-xs mt-1">Selector is required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value to Type</label>
              <input
                type="text"
                value={step.value || ''}
                onChange={(e) => handleChange('value', e.target.value)}
                placeholder="Hello World"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!step.value ? 'border-red-300' : 'border-gray-300'}`}
              />
              {!step.value && <p className="text-red-500 text-xs mt-1">Value is required</p>}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="clear_before_type"
                checked={step.clear_before_type || false}
                onChange={(e) => handleChange('clear_before_type', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="clear_before_type" className="text-sm text-gray-700">Clear field before typing</label>
            </div>
          </div>
        );

      case 'WAIT':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (ms)</label>
              <input
                type="number"
                value={step.duration_ms || ''}
                onChange={(e) => handleChange('duration_ms', parseInt(e.target.value) || 0)}
                placeholder="1000"
                min="0"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!step.duration_ms || step.duration_ms <= 0 ? 'border-red-300' : 'border-gray-300'}`}
              />
              {(!step.duration_ms || step.duration_ms <= 0) && <p className="text-red-500 text-xs mt-1">Duration must be greater than 0</p>}
            </div>
          </div>
        );

      case 'SCROLL':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
              <select
                value={step.direction || 'down'}
                onChange={(e) => handleChange('direction', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="down">Down</option>
                <option value="up">Up</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (pixels) <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input
                type="number"
                value={step.amount || ''}
                onChange={(e) => handleChange('amount', parseInt(e.target.value) || undefined)}
                placeholder="e.g. 500"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case 'EXTRACT_TEXT':
      case 'EXTRACT_LINKS':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field Name (JSON key)</label>
              <input
                type="text"
                value={step.field_name || ''}
                onChange={(e) => handleChange('field_name', e.target.value)}
                placeholder="e.g. productTitle"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!step.field_name ? 'border-red-300' : 'border-gray-300'}`}
              />
              {!step.field_name && <p className="text-red-500 text-xs mt-1">Field name is required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CSS Selector</label>
              <input
                type="text"
                value={step.selector || ''}
                onChange={(e) => handleChange('selector', e.target.value)}
                placeholder=".product-title h1"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!step.selector ? 'border-red-300' : 'border-gray-300'}`}
              />
              {!step.selector && <p className="text-red-500 text-xs mt-1">Selector is required</p>}
            </div>
            
            {step.type === 'EXTRACT_TEXT' && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={step.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="required" className="text-sm text-gray-700">Make this field required</label>
              </div>
            )}
            
            {step.type === 'EXTRACT_LINKS' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Limit <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input
                  type="number"
                  value={step.limit || ''}
                  onChange={(e) => handleChange('limit', parseInt(e.target.value) || undefined)}
                  placeholder="e.g. 10"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        );

      case 'SAVE_RECORD':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-100">
              This step takes all currently extracted fields and saves them as a single record in the dataset.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Record Status <span className="text-gray-400 font-normal">(Optional)</span></label>
              <select
                value={step.status || ''}
                onChange={(e) => handleChange('status', e.target.value || undefined)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">(Default: draft)</option>
                <option value="draft">Draft</option>
                <option value="needs_review">Needs Review</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
        );

      default:
        return <div>Unknown step type</div>;
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Step Properties</h2>
        <p className="text-sm text-gray-500">Configure parameters for this {step.type} step.</p>
      </div>

      <div className="bg-white rounded-lg">
        {renderFields()}
      </div>
    </div>
  );
}
