import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Download, FileText, Database } from 'lucide-react';
import { DocumentType } from '../types/document';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState<DocumentType | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'metadata' | 'extracted'>('metadata');

  const fetchDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3001/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocument(res.data);
    } catch (error) {
      toast.error('Failed to fetch document details');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  if (loading) return <div className="p-6 text-gray-500 text-center">Loading...</div>;
  if (!document) return null;

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/documents')} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 truncate max-w-lg" title={document.filename}>
            {document.filename}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {document.downloadUrl && (
            <a
              href={document.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Original
            </a>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-border flex flex-col h-full min-h-[600px]">
        {/* Tabs */}
        <div className="flex items-center border-b border-border bg-gray-50 rounded-t-lg">
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center ${activeTab === 'metadata' ? 'border-indigo-500 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <Database className="w-4 h-4 mr-2" />
            Metadata
          </button>
          <button
            onClick={() => setActiveTab('extracted')}
            className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center ${activeTab === 'extracted' ? 'border-indigo-500 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Extracted Text
          </button>
        </div>

        <div className="flex-1 p-6">
          {activeTab === 'metadata' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Core Information</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase">Document ID</span>
                      <span className="block text-sm text-gray-900 font-mono mt-1">{document.id}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase">Status</span>
                      <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                        document.status === 'ready' ? 'bg-green-100 text-green-800' : 
                        document.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {document.status}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase">File Name</span>
                      <span className="block text-sm text-gray-900 mt-1 break-all">{document.filename}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase">Original Name</span>
                      <span className="block text-sm text-gray-900 mt-1 break-all">{document.originalFilename || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase">MIME Type</span>
                      <span className="block text-sm text-gray-900 mt-1">{document.mimeType || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase">Size</span>
                      <span className="block text-sm text-gray-900 mt-1">{formatBytes(document.sizeBytes)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Origins & Relations</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase">Project</span>
                      <span className="block text-sm text-gray-900 mt-1">{document.project?.name || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase">Dataset ID</span>
                      <span className="block text-sm text-gray-900 mt-1">{document.datasetId || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase">Source URL</span>
                      {document.sourceUrl ? (
                        <a href={document.sourceUrl} target="_blank" rel="noreferrer" className="block text-sm text-indigo-600 hover:underline mt-1 break-all">
                          {document.sourceUrl}
                        </a>
                      ) : <span className="block text-sm text-gray-900 mt-1">-</span>}
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase">Original URL</span>
                      {document.originalUrl ? (
                        <a href={document.originalUrl} target="_blank" rel="noreferrer" className="block text-sm text-indigo-600 hover:underline mt-1 break-all">
                          {document.originalUrl}
                        </a>
                      ) : <span className="block text-sm text-gray-900 mt-1">-</span>}
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase">Created At</span>
                      <span className="block text-sm text-gray-900 mt-1">{new Date(document.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'extracted' && (
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Raw text content extracted directly from the document. This is a read-only view.
                </p>
              </div>
              <div className="bg-gray-50 rounded-md border border-gray-200 p-4 flex-1 overflow-auto max-h-[500px]">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                  {document.extractedText || <span className="text-gray-400 italic">No text extracted or unsupported format.</span>}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
