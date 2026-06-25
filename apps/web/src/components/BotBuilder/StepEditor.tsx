import { BotStep, ExtractListStep } from '../../types/bot';

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

      case 'EXTRACT_ATTRIBUTE':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field Name (JSON key)</label>
              <input
                type="text"
                value={step.field_name || ''}
                onChange={(e) => handleChange('field_name', e.target.value)}
                placeholder="e.g. productImage"
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
                placeholder=".product-image img"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!step.selector ? 'border-red-300' : 'border-gray-300'}`}
              />
              {!step.selector && <p className="text-red-500 text-xs mt-1">Selector is required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attribute Name</label>
              <input
                type="text"
                value={step.attribute || ''}
                onChange={(e) => handleChange('attribute', e.target.value)}
                placeholder="src, href, title, etc. (default: src)"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!step.attribute ? 'border-red-300' : 'border-gray-300'}`}
              />
              {!step.attribute && <p className="text-red-500 text-xs mt-1">Attribute name is required</p>}
            </div>
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
          </div>
        );

      case 'EXTRACT_LIST':
        const listStep = step as ExtractListStep;
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Row/Container CSS Selector</label>
              <input
                type="text"
                value={listStep.item_selector || ''}
                onChange={(e) => handleChange('item_selector', e.target.value)}
                placeholder="e.g. .product-card, .e-loop-item"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!listStep.item_selector ? 'border-red-300' : 'border-gray-300'}`}
              />
              {!listStep.item_selector && <p className="text-red-500 text-xs mt-1">Item container selector is required</p>}
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="save_records"
                checked={listStep.save_records || false}
                onChange={(e) => {
                  handleChange('save_records', e.target.checked);
                  if (e.target.checked) handleChange('field_name', undefined);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="save_records" className="text-sm text-gray-700 font-medium">Save directly to Dataset records (creates separate entries for each item)</label>
            </div>

            {!listStep.save_records && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Output Field Name (JSON key for list array)</label>
                <input
                  type="text"
                  value={listStep.field_name || ''}
                  onChange={(e) => handleChange('field_name', e.target.value)}
                  placeholder="e.g. products"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Limit Items (Optional)</label>
              <input
                type="number"
                value={listStep.limit || ''}
                onChange={(e) => handleChange('limit', parseInt(e.target.value) || undefined)}
                placeholder="e.g. 50"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Fields to Extract (relative to container)</h3>
              
              <div className="space-y-3">
                {(listStep.fields || []).map((f: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start border p-3 rounded-lg bg-gray-50 relative">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-0.5">Field Name</label>
                        <input
                          type="text"
                          value={f.field_name || ''}
                          onChange={(e) => {
                            const newFields = [...(listStep.fields || [])];
                            newFields[idx].field_name = e.target.value;
                            handleChange('fields', newFields);
                          }}
                          placeholder="title"
                          className="w-full p-1.5 border rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-0.5">Relative CSS Selector</label>
                        <input
                          type="text"
                          value={f.selector || ''}
                          onChange={(e) => {
                            const newFields = [...(listStep.fields || [])];
                            newFields[idx].selector = e.target.value;
                            handleChange('fields', newFields);
                          }}
                          placeholder="h2"
                          className="w-full p-1.5 border rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-0.5">Extract Type</label>
                        <select
                          value={f.type || 'text'}
                          onChange={(e) => {
                            const newFields = [...(listStep.fields || [])];
                            newFields[idx].type = e.target.value;
                            if (e.target.value === 'attribute' && !newFields[idx].attribute) {
                              newFields[idx].attribute = 'src';
                            }
                            handleChange('fields', newFields);
                          }}
                          className="w-full p-1.5 border rounded text-xs bg-white"
                        >
                          <option value="text">Text Content</option>
                          <option value="attribute">Attribute</option>
                        </select>
                      </div>
                      {f.type === 'attribute' && (
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 block mb-0.5">Attribute</label>
                          <input
                            type="text"
                            value={f.attribute || ''}
                            onChange={(e) => {
                              const newFieldsCopy = [...(listStep.fields || [])];
                              newFieldsCopy[idx].attribute = e.target.value;
                              handleChange('fields', newFieldsCopy);
                            }}
                            placeholder="src"
                            className="w-full p-1.5 border rounded text-xs"
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newFields = (listStep.fields || []).filter((_: any, i: number) => i !== idx);
                        handleChange('fields', newFields);
                      }}
                      className="p-2 hover:bg-gray-200 rounded text-red-500 self-center"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const newFields = [...(listStep.fields || []), { field_name: '', selector: '', type: 'text' }];
                  handleChange('fields', newFields);
                }}
                className="mt-3 text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-100 font-medium"
              >
                + Add relative field
              </button>
            </div>
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

      case 'DOWNLOAD_FILE':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selector (for href/src)</label>
              <input
                type="text"
                value={step.selector || ''}
                onChange={(e) => handleChange('selector', e.target.value)}
                placeholder="a.download-link"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!step.selector ? 'border-red-300' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field Name (for metadata)</label>
              <input
                type="text"
                value={step.field_name || ''}
                onChange={(e) => handleChange('field_name', e.target.value)}
                placeholder="invoiceFile"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!step.field_name ? 'border-red-300' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Extensions (comma separated)</label>
              <input
                type="text"
                value={step.allowed_extensions || ''}
                onChange={(e) => handleChange('allowed_extensions', e.target.value)}
                placeholder="pdf,docx"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case 'LOOP_LINKS':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Field (Array of URLs)</label>
              <input
                type="text"
                value={step.source_field || ''}
                onChange={(e) => handleChange('source_field', e.target.value)}
                placeholder="e.g. productLinks"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!step.source_field ? 'border-red-300' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Items</label>
              <input
                type="number"
                value={step.max_items || 50}
                onChange={(e) => handleChange('max_items', parseInt(e.target.value) || 50)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nested Steps (JSON Editor)</label>
              <textarea
                value={JSON.stringify(step.steps || [], null, 2)}
                onChange={(e) => {
                  try {
                    handleChange('steps', JSON.parse(e.target.value));
                  } catch (err) {}
                }}
                className="w-full p-2 border border-gray-300 rounded-md h-40 font-mono text-sm"
              />
            </div>
          </div>
        );

      case 'PAGINATION':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Button Selector</label>
              <input
                type="text"
                value={step.next_selector || ''}
                onChange={(e) => handleChange('next_selector', e.target.value)}
                placeholder="a.next-page"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!step.next_selector ? 'border-red-300' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Pages</label>
              <input
                type="number"
                value={step.max_pages || 10}
                onChange={(e) => handleChange('max_pages', parseInt(e.target.value) || 10)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="stop_when_selector_missing"
                checked={step.stop_when_selector_missing ?? true}
                onChange={(e) => handleChange('stop_when_selector_missing', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="stop_when_selector_missing" className="text-sm text-gray-700">Stop when selector is missing</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nested Steps per Page (JSON Editor)</label>
              <textarea
                value={JSON.stringify(step.steps_per_page || [], null, 2)}
                onChange={(e) => {
                  try {
                    handleChange('steps_per_page', JSON.parse(e.target.value));
                  } catch (err) {}
                }}
                className="w-full p-2 border border-gray-300 rounded-md h-40 font-mono text-sm"
              />
            </div>
          </div>
        );

      case 'GO_TO_LINK':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Field Name</label>
              <input
                type="text"
                value={step.url_field || ''}
                onChange={(e) => handleChange('url_field', e.target.value)}
                placeholder="e.g. currentItemUrl"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!step.url_field ? 'border-red-300' : 'border-gray-300'}`}
              />
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
