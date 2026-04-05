import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import MobileNav from './components/layout/MobileNav'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import MessagesPage from './pages/MessagesPage'
import LivePage from './pages/LivePage'
import CameraPage from './pages/CameraPage'
import ProfilePage from './pages/ProfilePage'
import GroupsPage from './pages/GroupsPage'
import NotificationsPage from './pages/NotificationsPage'
import MonetizePage from './pages/MonetizePage'
import AnalyticsPage from './pages/AnalyticsPage'
import { useAppStore } from './store/appStore'

const FULL_PAGES = ['/messages', '/groups']

function AppLayout() {
  const location = useLocation()
  const isFull = FULL_PAGES.some(p => location.pathname.startsWith(p))

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{
        overflow: isFull ? 'hidden' : 'auto',
        height: isFull ? '100vh' : 'auto',
      }}>
        <Routes>
          <Route path="/" element={
            <div style={{ padding: '0 0 0 24px' }}>
              <HomePage />
            </div>
          } />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/live" element={<LivePage />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/monetize" element={<MonetizePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
              <span style={{ fontSize: 64 }}>🌌</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24 }}>Page not found</h2>
              <p style={{ color: 'var(--text-muted)' }}>This page does not exist yet.</p>
            </div>
          } />
        </Routes>
      </main>
      <MobileNav />
    </div>
  )
}

export default function App() {
  useEffect(() => {
    const saved = localStorage.getItem('nexus-theme')
    if (saved && saved !== 'dark') {
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
