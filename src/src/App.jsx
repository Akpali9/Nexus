import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useAdminStore } from './admin/adminStore';
import { initRealtimeSubscriptions } from './stores/realtimeStore';

// App pages
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import AnalyticsPage from './pages/AnalyticsPage';
import CameraPage from './pages/CameraPage';
import ExplorePage from './pages/ExplorePage';
import GroupsPage from './pages/GroupsPage';
import LivePage from './pages/LivePage';
import MessagesPage from './pages/MessagesPage';
import MonetizePage from './pages/MonetizePage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

// Admin pages
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminUsers from './admin/pages/AdminUsers';
import AdminContent from './admin/pages/AdminContent';
import AdminReports from './admin/pages/AdminReports';
import AdminStreams from './admin/pages/AdminStreams';
import AdminFinancials from './admin/pages/AdminFinancials';
import AdminAudit from './admin/pages/AdminAudit';

import './index.css';

function AdminGuard({ children }) {
  const { isAdmin, adminChecked } = useAdminStore();
  if (!adminChecked) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#6b6b7a', fontSize: 14 }}>Checking permissions...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuthStore();
  const { checkAdmin } = useAdminStore();

  useEffect(() => {
    if (user?.id) {
      initRealtimeSubscriptions(user.id);
      checkAdmin(user.id);
    }
  }, [user?.id]);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#6b6b7a', fontSize: 14 }}>Loading...</div>;
  if (!user) return <AuthPage />;

  return (
    <Routes>
      {/* App routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/camera" element={<CameraPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/groups" element={<GroupsPage />} />
      <Route path="/live" element={<LivePage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/monetize" element={<MonetizePage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* Admin routes — gated */}
      <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
      <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
      <Route path="/admin/content" element={<AdminGuard><AdminContent /></AdminGuard>} />
      <Route path="/admin/reports" element={<AdminGuard><AdminReports /></AdminGuard>} />
      <Route path="/admin/streams" element={<AdminGuard><AdminStreams /></AdminGuard>} />
      <Route path="/admin/financials" element={<AdminGuard><AdminFinancials /></AdminGuard>} />
      <Route path="/admin/audit" element={<AdminGuard><AdminAudit /></AdminGuard>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
