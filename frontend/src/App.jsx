import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminResetTokens from './pages/AdminResetTokens';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import MyTasks from './pages/MyTasks';
import KanbanBoard from './pages/KanbanBoard';
import Settings from './pages/Settings';
import ProjectBoard from './pages/ProjectBoard';
import ProjectDetails from './pages/ProjectDetails';
import IssueDetail from './pages/IssueDetail';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-pulse text-brand-600 font-medium">Loading...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-pulse text-brand-600 font-medium">Loading...</div>
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/forgot-password" element={<PublicOnly><ForgotPassword /></PublicOnly>} />
      <Route path="/reset-password" element={<PublicOnly><ResetPassword /></PublicOnly>} />
      <Route path="/admin/reset-tokens" element={<AdminResetTokens />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="my-tasks" element={<MyTasks />} />
        <Route path="kanban" element={<KanbanBoard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="project/:projectId" element={<ProjectBoard />} />
        <Route path="project/:projectId/details" element={<ProjectDetails />} />
        <Route path="project/:projectId/issue/:issueId" element={<IssueDetail />} />
        <Route path="issue/:issueId" element={<IssueDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
