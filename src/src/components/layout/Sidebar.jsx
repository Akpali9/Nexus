import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Search, Bell, MessageCircle, Video, Users, Camera,
  TrendingUp, LogOut, DollarSign, Menu, X,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAdminStore } from '../../stores/adminStore';
import { useRealtimeStore } from '../../stores/realtimeStore';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Explore', path: '/explore' },
  { icon: Bell, label: 'Notifications', path: '/notifications', badge: 'notifications' },
  { icon: MessageCircle, label: 'Messages', path: '/messages', badge: 'messages' },
  { icon: Video, label: 'Live', path: '/live' },
  { icon: Camera, label: 'Camera', path: '/camera' },
  { icon: Users, label: 'Groups', path: '/groups' },
  { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
  { icon: DollarSign, label: 'Monetize', path: '/monetize' },
];

export default function Sidebar({ inline = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuthStore();
  const { newNotifications, newMessages } = useRealtimeStore();
  const { isAdmin } = useAdminStore();
  const [collapsed, setCollapsed] = useState(false);

  const badges = {
    notifications: newNotifications.length,
    messages: newMessages.length,
  };

  const toggleSidebar = () => setCollapsed(!collapsed);

  const expandedWidth = 'var(--sidebar-width, 240px)';
  const collapsedWidth = '72px';
  const currentWidth = collapsed ? collapsedWidth : expandedWidth;

  // Base styles (shared)
  const baseStyles = {
    width: currentWidth,
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
    transition: 'width 0.2s ease',
    overflowX: 'hidden',
  };

  // Inline mode (for mobile overlay) – no fixed positioning
  const inlineStyles = {
    ...baseStyles,
    height: '100%',
  };

  // Fixed mode (for desktop) – fixed to viewport
  const fixedStyles = {
    ...baseStyles,
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 100,
  };

  const sidebarStyles = inline ? inlineStyles : fixedStyles;

  return (
    <aside style={sidebarStyles}>
      {/* Logo & Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, paddingLeft: collapsed ? 0 : 12 }}>
        {!collapsed && (
          <h1 style={{ fontFamily: 'var(--font-display, sans-serif)', fontWeight: 900, fontSize: 24 }}>
            <span className="gradient-text">Nexus</span>
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', padding: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginLeft: collapsed ? 0 : 'auto',
          }}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ icon: Icon, label, path, badge }) => {
          const isActive = location.pathname === path;
          const count = badge ? badges[badge] : 0;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10,
                background: isActive ? 'var(--accent-glow, rgba(124,92,252,0.15))' : 'transparent',
                color: isActive ? 'var(--accent-primary, #7c5cfc)' : 'var(--text-secondary, #aaa)',
                border: isActive ? '1px solid var(--border-accent, rgba(124,92,252,0.3))' : '1px solid transparent',
                cursor: 'pointer', fontWeight: isActive ? 600 : 400,
                fontSize: 14, width: '100%', textAlign: 'left',
                transition: 'all 120ms',
                position: 'relative',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <Icon size={18} />
              {!collapsed && label}
              {!collapsed && count > 0 && (
                <span style={{
                  marginLeft: 'auto', background: 'var(--accent-primary, #7c5cfc)',
                  color: 'white', fontSize: 10, fontWeight: 700,
                  borderRadius: 999, padding: '2px 6px', minWidth: 18, textAlign: 'center',
                }}>
                  {count > 9 ? '9+' : count}
                </span>
              )}
              {collapsed && count > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  background: 'var(--accent-primary, #7c5cfc)',
                  color: 'white', fontSize: 8, fontWeight: 700,
                  borderRadius: 999, padding: '2px 4px', minWidth: 14, textAlign: 'center',
                }}>
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile + signout */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
        <button
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '10px 12px', borderRadius: 10,
            background: 'none', border: 'none', cursor: 'pointer',
            textAlign: 'left', justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
            {profile?.display_name?.[0] || '?'}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.display_name || 'You'}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{profile?.username || '...'}</p>
            </div>
          )}
        </button>
        <button
          onClick={signOut}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '8px 12px', borderRadius: 10,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 13,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <LogOut size={16} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}