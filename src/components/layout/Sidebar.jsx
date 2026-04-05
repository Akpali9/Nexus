import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home, Search, Bell, MessageCircle, Video, Users, Camera,
  Settings, TrendingUp, Zap, LogOut, ChevronRight, Star, DollarSign
} from 'lucide-react'
import { useAppStore } from '../../store/appStore'

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Explore', path: '/explore' },
  { icon: Bell, label: 'Notifications', path: '/notifications', badge: true },
  { icon: MessageCircle, label: 'Messages', path: '/messages' },
  { icon: Video, label: 'Live', path: '/live' },
  { icon: Camera, label: 'Camera', path: '/camera' },
  { icon: Users, label: 'Groups', path: '/groups' },
  { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
  { icon: DollarSign, label: 'Monetize', path: '/monetize' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { unreadCount, theme, setTheme } = useAppStore()
  const [showThemes, setShowThemes] = useState(false)

  const currentUser = {
    display_name: 'You',
    username: 'your_handle',
    initials: 'YO',
    premium: true,
  }

  const themes = [
    { id: 'dark', label: 'Dark', color: '#7c5cfc' },
    { id: 'light', label: 'Light', color: '#a78bfa' },
    { id: 'midnight', label: 'Midnight', color: '#4f8eff' },
    { id: 'forest', label: 'Forest', color: '#22d3a5' },
    { id: 'crimson', label: 'Crimson', color: '#f87171' },
  ]

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0, top: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-pink))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }} className="gradient-text">
            NEXUS
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
        {NAV_ITEMS.map(({ icon: Icon, label, path, badge }) => {
          const active = location.pathname === path
          return (
            <button key={path}
              onClick={() => navigate(path)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                background: active ? 'var(--accent-glow)' : 'transparent',
                color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontSize: 14, fontWeight: active ? 600 : 400,
                transition: 'all 150ms ease', marginBottom: 2,
                border: active ? '1px solid var(--border-accent)' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge && unreadCount > 0 && (
                <span style={{
                  background: 'var(--accent-primary)', color: 'white',
                  fontSize: 10, fontWeight: 700, padding: '2px 6px',
                  borderRadius: 999, minWidth: 18, textAlign: 'center',
                }}>{unreadCount}</span>
              )}
            </button>
          )
        })}

        <div className="divider" />

        {/* Go Live Button */}
        <button onClick={() => navigate('/live')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
          <div className="live-dot" />
          Go Live
        </button>

        {/* Theme switcher */}
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => setShowThemes(!showThemes)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: 'transparent', color: 'var(--text-secondary)',
              fontSize: 14, border: '1px solid transparent',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <Settings size={18} />
            <span style={{ flex: 1 }}>Theme</span>
            <ChevronRight size={14} style={{ transform: showThemes ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }} />
          </button>

          {showThemes && (
            <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 8 }} className="fade-in">
              {themes.map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 10px', borderRadius: 999, fontSize: 12,
                    background: theme === t.id ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                    color: theme === t.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: theme === t.id ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                    transition: 'all 150ms ease',
                  }}>
                  <span style={{ width: 8, height: 8, borderRadius: 50, background: t.color, flexShrink: 0 }} />
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* User profile */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'background 150ms' }}
          onClick={() => navigate('/profile')}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: 13, flexShrink: 0, position: 'relative' }}>
            {currentUser.initials}
            <span className="online-indicator" />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }} className="truncate">{currentUser.display_name}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }} className="truncate">@{currentUser.username}</p>
          </div>
          {currentUser.premium && <Star size={14} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />}
        </div>
      </div>
    </aside>
  )
}
