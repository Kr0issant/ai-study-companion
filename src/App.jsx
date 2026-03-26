import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Curriculum from './pages/Curriculum';
import Focus from './pages/Focus';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssistant';
import { StudyProvider } from './context/StudyContext';
import './App.css';

export default function App() {
  return (
    <StudyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
             <Route index element={<Navigate to="/dashboard" replace />} />
             <Route path="dashboard" element={<Dashboard />} />
             <Route path="subjects" element={<Curriculum />} />
             <Route path="focus" element={<Focus />} />
             <Route path="ai-tools" element={<AIAssistant />} />
             <Route path="settings" element={<Settings />} />
             {/* Other paths will be added as we progress */}
          </Route>
        </Routes>
      </BrowserRouter>
    </StudyProvider>
  )
}
