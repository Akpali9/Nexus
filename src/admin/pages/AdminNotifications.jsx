import { useState } from 'react';
import { Bell, Send, Users, CheckCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';

const S = {
  page: { padding: '28px 32px' },
  h1: { fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 },
  sub: { fontSize: 13, color: '#5a5a72', marginBottom: 24 },
  card: { background: '#0d0d18', border: '1px solid #1e1e2e', borderRadius: 14, padding: 24, marginBottom: 20 },
  label: { fontSize: 12, color: '#7a7a90', marginBottom: 8, display: 'block', fontWeight: 500 },
};

export default function AdminNotifications() {
  const [content, setContent] = useState('');
  const [type, setType] = useState('system');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendNotification = async () => {
    if (!content.trim()) return;
    setSending(true);

    // Fetch target user IDs
    let userIds = [];
    if (target === 'all') {
      const { data } = await supabase.from('profiles').select('id');
      userIds = (data || []).map(u => u.id);
    } else if (target === 'premium') {
      const { data } = await supabase.from('profiles').select('id').eq('premium', true);
      userIds = (data || []).map(u => u.id);
    }

    if (userIds.length > 0) {
      const notifications = userIds.map(uid => ({ user_id: uid, type, content, read: false }));
      // Insert in batches of 100
      for (let i = 0; i < notifications.length; i += 100) {
        await supabase.from('notifications').insert(notifications.slice(i, i + 100));
      }
    }

    setSent(true);
    setContent('');
    setSending(false);
    setTimeout(() => setSent(false), 3000);
  };

  const TYPES = [
    { id: 'system', label: 'System' },
    { id: 'live', label: 'Live Event' },
    { id: 'payment', label: 'Payment' },
  ];

  const TARGETS = [
    { id: 'all', label: 'All Users', icon: Users },
    { id: 'premium', label: 'Premium Users', icon: Bell },
  ];

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Broadcast Notifications</h1>
      <p style={S.sub}>Send platform-wide announcements to users</p>

      <div style={S.card}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>New Broadcast</h2>

        <div style={{ marginBottom: 18 }}>
          <label style={S.label}>Message</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Enter your notification message..."
            style={{ width: '100%', padding: '12px 14px', background: '#16162a', border: '1px solid #1e1e2e', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 100, fontFamily: 'inherit', lineHeight: 1.5 }} />
          <p style={{ fontSize: 11, color: '#5a5a72', marginTop: 4 }}>{content.length} characters</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={S.label}>Notification Type</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t.id)}
                  style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: `1px solid ${type === t.id ? '#7c5cfc' : '#1e1e2e'}`, cursor: 'pointer', background: type === t.id ? '#7c5cfc20' : 'transparent', color: type === t.id ? '#7c5cfc' : '#7a7a90' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={S.label}>Target Audience</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {TARGETS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTarget(id)}
                  style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: `1px solid ${target === id ? '#7c5cfc' : '#1e1e2e'}`, cursor: 'pointer', background: target === id ? '#7c5cfc20' : 'transparent', color: target === id ? '#7c5cfc' : '#7a7a90', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={sendNotification} disabled={!content.trim() || sending}
          style={{ padding: '10px 24px', borderRadius: 10, background: sent ? '#22d3a5' : '#7c5cfc', color: '#fff', border: 'none', cursor: content.trim() && !sending ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, opacity: content.trim() && !sending ? 1 : 0.5, transition: 'all 200ms' }}>
          {sent ? <><CheckCircle size={16} /> Sent!</> : sending ? 'Sending...' : <><Send size={16} /> Send Broadcast</>}
        </button>
      </div>
    </div>
  );
}
