import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Entity } from '../types/entity';
import { API_BASE_URL } from '../lib/api';
import { Loader2, ArrowLeft, Database, FileText, Activity } from 'lucide-react';

export default function EntityDetail() {
  const { id } = useParams<{ id: string }>();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'relations' | 'sources' | 'ai-jobs'>('relations');

  useEffect(() => {
    const fetchEntity = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/entities/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          setEntity(await res.json());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEntity();
  }, [id]);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  if (!entity) {
    return <div className="p-8 text-center text-gray-500">Entity not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/entities" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{entity.entityName}</h1>
          <p className="text-sm text-gray-500 capitalize">{entity.entityType}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('relations')}
            className={`${
              activeTab === 'relations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Relations
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`${
              activeTab === 'sources'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Sources
          </button>
          <button
            onClick={() => setActiveTab('ai-jobs')}
            className={`${
              activeTab === 'ai-jobs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            AI Jobs
          </button>
        </nav>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        {activeTab === 'relations' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Outgoing Relations</h3>
            <ul className="divide-y divide-gray-200 border rounded-md">
              {entity.sourceRelations?.map(rel => (
                <li key={rel.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-500 uppercase">{rel.relationType}</span>
                  <Link to={`/entities/${rel.targetEntityId}`} className="text-blue-600 hover:underline">
                    {rel.targetEntity?.entityName} <span className="text-gray-400 text-xs">({rel.targetEntity?.entityType})</span>
                  </Link>
                </li>
              ))}
              {(!entity.sourceRelations || entity.sourceRelations.length === 0) && (
                <li className="p-4 text-sm text-gray-500">No outgoing relations.</li>
              )}
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mt-8">Incoming Relations</h3>
            <ul className="divide-y divide-gray-200 border rounded-md">
              {entity.targetRelations?.map(rel => (
                <li key={rel.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <Link to={`/entities/${rel.sourceEntityId}`} className="text-blue-600 hover:underline">
                    {rel.sourceEntity?.entityName} <span className="text-gray-400 text-xs">({rel.sourceEntity?.entityType})</span>
                  </Link>
                  <span className="text-sm font-medium text-gray-500 uppercase">{rel.relationType}</span>
                </li>
              ))}
              {(!entity.targetRelations || entity.targetRelations.length === 0) && (
                <li className="p-4 text-sm text-gray-500">No incoming relations.</li>
              )}
            </ul>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="space-y-4">
             <ul className="divide-y divide-gray-200 border rounded-md">
              {entity.sources?.filter(s => s.datasetId || s.documentId).map(src => (
                <li key={src.id} className="p-4 flex items-center space-x-4 hover:bg-gray-50">
                  {src.datasetId && (
                    <>
                      <Database className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Dataset Source</p>
                        <p className="text-xs text-gray-500">{src.datasetId}</p>
                      </div>
                    </>
                  )}
                  {src.documentId && (
                    <>
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Document Source</p>
                        <p className="text-xs text-gray-500">{src.documentId}</p>
                      </div>
                    </>
                  )}
                </li>
              ))}
              {(!entity.sources || entity.sources.filter(s => s.datasetId || s.documentId).length === 0) && (
                <li className="p-4 text-sm text-gray-500">No dataset or document sources found.</li>
              )}
            </ul>
          </div>
        )}

        {activeTab === 'ai-jobs' && (
          <div className="space-y-4">
            <ul className="divide-y divide-gray-200 border rounded-md">
              {entity.sources?.filter(s => s.aiJobId).map(src => (
                <li key={src.id} className="p-4 flex items-center space-x-4 hover:bg-gray-50">
                  <Activity className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">AI Job Extraction</p>
                    <p className="text-xs text-gray-500">Job ID: {src.aiJobId}</p>
                  </div>
                </li>
              ))}
               {(!entity.sources || entity.sources.filter(s => s.aiJobId).length === 0) && (
                <li className="p-4 text-sm text-gray-500">No AI jobs associated.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
