import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, Bell, MessageCircle, User } from 'lucide-react'
import { useAppStore } from '../store/appStore'

const NAV = [
  { icon: Home, path: '/', label: 'Home' },
  { icon: Search, path: '/explore', label: 'Explore' },
  { icon: Bell, path: '/notifications', label: 'Alerts', badge: true },
  { icon: MessageCircle, path: '/messages', label: 'Messages' },
  { icon: User, path: '/profile', label: 'Profile' },
]

export default function MobileNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { unreadCount } = useAppStore()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)',
      display: 'none', // shown via media query
      justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 0 20px',
      zIndex: 100,
    }} className="mobile-nav">
      {NAV.map(({ icon: Icon, path, label, badge }) => {
        const active = location.pathname === path
        return (
          <button key={path} onClick={() => navigate(path)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
            position: 'relative', padding: '4px 12px',
          }}>
            <Icon size={22} fill={active ? 'var(--accent-primary)' : 'none'} strokeWidth={active ? 2.5 : 1.5} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>
            {badge && unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: 8,
                background: 'var(--accent-primary)', color: 'white',
                fontSize: 9, fontWeight: 700, borderRadius: 999,
                padding: '1px 5px', minWidth: 16, textAlign: 'center',
                border: '2px solid var(--bg-secondary)',
              }}>{unreadCount}</span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
