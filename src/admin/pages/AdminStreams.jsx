import { useEffect } from 'react';
import { Radio, Eye, StopCircle } from 'lucide-react';
import { useAdminStore } from '../adminStore';
import { useAuthStore } from '../../stores/authStore';
import { useRealtimeStore } from '../../stores/realtimeStore';
import { supabase } from '../../services/supabase';
import AdminLayout from '../components/AdminLayout';
import AdminTable from '../components/AdminTable';

const STATUS_STYLE = {
  live: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  offline: { bg: 'rgba(107,107,122,0.12)', color: '#6b6b7a' },
  ended: { bg: 'rgba(34,211,165,0.12)', color: '#22d3a5' },
};

export default function AdminStreams() {
  const { user } = useAuthStore();
  const { streams, fetchStreams, endStream } = useAdminStore();
  const liveViewers = useRealtimeStore(s => s.liveViewers);

  useEffect(() => {
    fetchStreams();
    const sub = supabase.channel('admin-streams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, fetchStreams)
      .subscribe();
    return () => sub.unsubscribe();
  }, []);

  const liveStreams = streams.filter(s => s.status === 'live');
  const totalViewers = liveStreams.reduce((sum, s) => sum + (liveViewers[s.id] ?? s.viewer_count ?? 0), 0);

  const columns = [
    {
      key: 'streamer', label: 'Streamer',
      render: s => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#7c5cfc', flexShrink: 0 }}>
            {s.user?.display_name?.[0] || '?'}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e2e9' }}>{s.user?.display_name}</p>
            <p style={{ fontSize: 11, color: '#4a4a57' }}>@{s.user?.username}</p>
          </div>
        </div>
      )
    },
    { key: 'title', label: 'Title', render: s => <span style={{ fontSize: 13, color: '#c8c8d4' }}>{s.title}</span> },
    { key: 'category', label: 'Category', render: s => s.category ? <span style={{ fontSize: 11, background: '#1e1e2e', color: '#8e8e99', padding: '2px 8px', borderRadius: 999 }}>{s.category}</span> : '—' },
    {
      key: 'viewers', label: 'Viewers', align: 'right',
      render: s => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', fontSize: 13 }}>
          <Eye size={12} color="#60a5fa" />
          {(liveViewers[s.id] ?? s.viewer_count ?? 0).toLocaleString()}
        </span>
      )
    },
    { key: 'started_at', label: 'Started', render: s => <span style={{ fontSize: 11, color: '#4a4a57' }}>{s.started_at ? new Date(s.started_at).toLocaleString() : '—'}</span> },
    {
      key: 'status', label: 'Status',
      render: s => {
        const st = STATUS_STYLE[s.status] || STATUS_STYLE.offline;
        return (
          <span style={{ fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, padding: '3px 9px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {s.status === 'live' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />}
            {s.status.toUpperCase()}
          </span>
        );
      }
    },
    {
      key: 'actions', label: '', align: 'right',
      render: s => s.status === 'live' ? (
        <button onClick={() => endStream(s.id, user.id)} style={{ padding: '5px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
          <StopCircle size={12} /> End
        </button>
      ) : null
    },
  ];

  return (
    <AdminLayout title="Live Streams" subtitle={`${liveStreams.length} live · ${totalViewers.toLocaleString()} total viewers`}>
      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Live Now', value: liveStreams.length, color: '#ef4444' },
          { label: 'Total Viewers', value: totalViewers.toLocaleString(), color: '#60a5fa' },
          { label: 'Total Streams', value: streams.length, color: '#7c5cfc' },
        ].map(s => (
          <div key={s.label} style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 10, padding: '16px 20px' }}>
            <p style={{ fontWeight: 800, fontSize: 24, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 12, color: '#6b6b7a', marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <AdminTable columns={columns} rows={streams} emptyMsg="No streams found" />
    </AdminLayout>
  );
}
