import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Curriculum from './pages/Curriculum';
import Focus from './pages/Focus';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssistant';
import Friends from './pages/Friends';
import Login from './pages/Login';
import { StudyProvider } from './context/StudyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const RequireAuth = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
               <Route index element={<Navigate to="/dashboard" replace />} />
               <Route path="dashboard" element={<Dashboard />} />
               <Route path="subjects" element={<Curriculum />} />
               <Route path="focus" element={<Focus />} />
               <Route path="ai-tools" element={<AIAssistant />} />
               <Route path="friends" element={<Friends />} />
               <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </HashRouter>
      </StudyProvider>
    </AuthProvider>
  )
}
