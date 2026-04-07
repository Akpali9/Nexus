import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Bell, MessageCircle, Video } from 'lucide-react';
import { useRealtimeStore } from '../../stores/realtimeStore';

const NAV_ITEMS = [
  { icon: Home, path: '/' },
  { icon: Search, path: '/explore' },
  { icon: Bell, path: '/notifications', badge: 'notifications' },
  { icon: MessageCircle, path: '/messages', badge: 'messages' },
  { icon: Video, path: '/live' },
];

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { newNotifications, newMessages } = useRealtimeStore();
  const badges = { notifications: newNotifications.length, messages: newMessages.length };

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)',
      display: 'flex', padding: '8px 0', zIndex: 100,
    }}>
      {NAV_ITEMS.map(({ icon: Icon, path, badge }) => {
        const isActive = location.pathname === path;
        const count = badge ? badges[badge] : 0;
        return (
          <button key={path} onClick={() => navigate(path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)', position: 'relative', padding: '4px 0' }}>
            <Icon size={22} />
            {count > 0 && <span style={{ position: 'absolute', top: 0, right: '20%', background: 'var(--accent-primary)', color: 'white', fontSize: 9, fontWeight: 700, borderRadius: 999, padding: '1px 4px' }}>{count > 9 ? '9+' : count}</span>}
          </button>
        );
      })}
    </nav>
  );
}
