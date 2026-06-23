export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || (typeof window !== 'undefined' ? `${protocol}//${window.location.host}/recorder-ws` : 'ws://localhost:3002/recorder-ws');
