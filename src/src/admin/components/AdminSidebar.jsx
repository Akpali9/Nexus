import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Flag, Radio, DollarSign, ScrollText, Shield, LogOut, Zap, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: FileText, label: 'Content', path: '/admin/content' },
  { icon: Flag, label: 'Reports', path: '/admin/reports', accent: true },
  { icon: Radio, label: 'Live Streams', path: '/admin/streams' },
  { icon: DollarSign, label: 'Financials', path: '/admin/financials' },
  { icon: ScrollText, label: 'Audit Log', path: '/admin/audit' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuthStore();

  return (
    <aside style={{
      width: 220,
      height: '100vh',
      position: 'fixed',
      left: 0, top: 0,
      background: '#0d0d14',
      borderRight: '1px solid #1e1e2e',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #1e1e2e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={16} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 14, letterSpacing: '-0.3px', color: '#fff' }}>NEXUS</p>
            <p style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, letterSpacing: '1px' }}>ADMIN</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV.map(({ icon: Icon, label, path, accent }) => {
          const active = location.pathname === path;
          return (
            <button key={path}
              onClick={() => navigate(path)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                background: active ? (accent ? 'rgba(239,68,68,0.15)' : 'rgba(124,92,252,0.15)') : 'transparent',
                color: active ? (accent ? '#ef4444' : '#7c5cfc') : '#8e8e99',
                fontSize: 13, fontWeight: active ? 600 : 400,
                border: active ? `1px solid ${accent ? 'rgba(239,68,68,0.3)' : 'rgba(124,92,252,0.3)'}` : '1px solid transparent',
                cursor: 'pointer', transition: 'all 120ms',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#1a1a24'; e.currentTarget.style.color = '#fff'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8e8e99'; } }}
            >
              <Icon size={15} />
              <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
            </button>
          );
        })}

        <div style={{ height: 1, background: '#1e1e2e', margin: '12px 0' }} />

        <button
          onClick={() => navigate('/')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'transparent', color: '#8e8e99', fontSize: 13, border: '1px solid transparent', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1a1a24'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8e8e99'; }}
        >
          <Zap size={15} />
          <span>Back to App</span>
        </button>
      </nav>

      {/* User */}
      <div style={{ padding: '12px', borderTop: '1px solid #1e1e2e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7c5cfc, #f472b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {profile?.display_name?.[0] || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.display_name}</p>
            <p style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>Administrator</p>
          </div>
        </div>
        <button onClick={signOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, background: 'transparent', color: '#6b6b7a', fontSize: 12, border: '1px solid transparent', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b6b7a'; }}
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
