import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Search, Bell, MessageCircle, Video, Users, Camera,
  Settings, TrendingUp, LogOut, DollarSign, Shield, ChevronRight, Star, Zap,
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

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuthStore();
  const { newNotifications, newMessages } = useRealtimeStore();
  const { isAdmin } = useAdminStore();

  const badges = {
    notifications: newNotifications.length,
    messages: newMessages.length,
  };

  return (
    <aside style={{
      width: 'var(--sidebar-width, 240px)',
      height: '100vh',
      position: 'fixed',
      left: 0, top: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      padding: '20px 12px',
    }}>
      {/* Logo */}
      <div style={{ paddingLeft: 12, marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display, sans-serif)', fontWeight: 900, fontSize: 24 }}>
          <span className="gradient-text">Nexus</span>
        </h1>
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
              }}
            >
              <Icon size={18} />
              {label}
              {count > 0 && (
                <span style={{
                  marginLeft: 'auto', background: 'var(--accent-primary, #7c5cfc)',
                  color: 'white', fontSize: 10, fontWeight: 700,
                  borderRadius: 999, padding: '2px 6px', minWidth: 18, textAlign: 'center',
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
        <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
            {profile?.display_name?.[0] || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.display_name || 'You'}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{profile?.username || '...'}</p>
          </div>
        </button>
        <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13 }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
// Note: Admin link is injected via AdminSidebarLink below
