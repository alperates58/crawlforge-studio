import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Bots from './pages/Bots';
import BotBuilder from './pages/BotBuilder';
import Datasets from './pages/Datasets';
import DatasetDetail from './pages/DatasetDetail';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Settings from './pages/Settings';
import SystemSettings from './pages/SystemSettings';
import Runs from './pages/Runs';
import RunDetail from './pages/RunDetail';
import Schedules from './pages/Schedules';
import AiJobs from './pages/AiJobs';
import AiJobDetail from './pages/AiJobDetail';
import Entities from './pages/Entities';
import EntityDetail from './pages/EntityDetail';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="bots" element={<Bots />} />
            <Route path="bots/:id" element={<BotBuilder />} />
            <Route path="schedules" element={<Schedules />} />
            <Route path="runs" element={<Runs />} />
            <Route path="runs/:id" element={<RunDetail />} />
            <Route path="datasets" element={<Datasets />} />
            <Route path="datasets/:id" element={<DatasetDetail />} />
            <Route path="documents" element={<Documents />} />
            <Route path="documents/:id" element={<DocumentDetail />} />
            <Route path="ai-jobs" element={<AiJobs />} />
            <Route path="ai-jobs/:id" element={<AiJobDetail />} />
            <Route path="entities" element={<Entities />} />
            <Route path="entities/:id" element={<EntityDetail />} />
            <Route path="settings" element={<Settings />} />
            <Route path="system-settings" element={<SystemSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
