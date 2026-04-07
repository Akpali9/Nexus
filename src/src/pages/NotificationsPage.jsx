import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import { useRealtimeStore } from '../stores/realtimeStore';
import { Heart, UserPlus, MessageCircle, Radio, Gift, CheckCircle, BellOff } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';

const ICON_MAP = {
  like: <Heart size={16} style={{ color: '#f87171' }} />,
  follow: <UserPlus size={16} style={{ color: '#60a5fa' }} />,
  comment: <MessageCircle size={16} style={{ color: '#34d399' }} />,
  live: <Radio size={16} style={{ color: '#a78bfa' }} />,
  gift: <Gift size={16} style={{ color: '#fbbf24' }} />,
};

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { newNotifications, clearNewNotifications } = useRealtimeStore();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('notifications')
      .select('*, actor:profiles(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setNotifications(data); });
  }, [user]);

  useEffect(() => {
    if (newNotifications.length) {
      setNotifications(prev => [...newNotifications, ...prev]);
      clearNewNotifications();
    }
  }, [newNotifications, clearNewNotifications]);

  const markRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 'var(--sidebar-width)', padding: '24px', maxWidth: '680px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px' }}>Notifications</h1>
          <button className="btn-ghost" onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <CheckCircle size={14} /> Mark all read
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['all', 'like', 'comment', 'follow', 'live', 'gift'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f ? 'btn-primary' : 'btn-ghost'}
              style={{ fontSize: 12, padding: '6px 14px', borderRadius: 999 }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <BellOff size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>No notifications yet</p>
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className="card"
              style={{
                display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 8,
                padding: '14px 16px', cursor: 'pointer',
                background: notif.read ? 'var(--bg-secondary)' : 'var(--bg-hover)',
                borderLeft: notif.read ? 'none' : '3px solid var(--accent-primary)',
              }}
            >
              <div className="avatar-placeholder" style={{ width: 40, height: 40, flexShrink: 0 }}>
                {notif.actor?.display_name?.[0] || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14 }}>
                  <strong>{notif.actor?.display_name || 'Someone'}</strong>{' '}
                  {notif.content}
                  {notif.target && <span style={{ color: 'var(--text-muted)' }}> — {notif.target}</span>}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {new Date(notif.created_at).toLocaleString()}
                </p>
              </div>
              <div style={{ flexShrink: 0 }}>{ICON_MAP[notif.type]}</div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
