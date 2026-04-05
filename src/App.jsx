import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { useAuth } from './context/AuthContext';
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
import './styles.css';

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <AuthPage />;
  return (
    <Routes>
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
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </RealtimeProvider>
    </AuthProvider>
  );
}

export default App;
