import { useState, useEffect } from 'react';
import { Radio, Eye, StopCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../services/supabase';

const S = {
  page: { padding: '28px 32px' },
  h1: { fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 },
  sub: { fontSize: 13, color: '#5a5a72', marginBottom: 24 },
  card: { background: '#0d0d18', border: '1px solid #1e1e2e', borderRadius: 14 },
  th: { padding: '10px 14px', fontSize: 11, color: '#5a5a72', textAlign: 'left', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #1e1e2e' },
  td: { padding: '12px 14px', fontSize: 13, color: '#c2c2d4', borderBottom: '1px solid #13131e', verticalAlign: 'middle' },
};

export default function AdminLive() {
  const [streams, setStreams] = useState([]);
  const [tab, setTab] = useState('live');
  const [loading, setLoading] = useState(true);

  const fetchStreams = async () => {
    setLoading(true);
    const query = supabase.from('live_streams')
      .select('*, user:profiles(display_name, username)')
      .order('started_at', { ascending: false });

    if (tab === 'live') query.eq('status', 'live');
    else if (tab === 'ended') query.eq('status', 'ended');

    const { data } = await query;
    setStreams(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStreams(); }, [tab]);

  useEffect(() => {
    const sub = supabase.channel('admin-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, fetchStreams)
      .subscribe();
    return () => sub.unsubscribe();
  }, [tab]);

  const endStream = async (id) => {
    await supabase.from('live_streams').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', id);
    setStreams(prev => prev.filter(s => s.id !== id));
  };

  const deleteStream = async (id) => {
    if (!confirm('Delete this stream record?')) return;
    await supabase.from('live_streams').delete().eq('id', id);
    setStreams(prev => prev.filter(s => s.id !== id));
  };

  const TABS = [{ id: 'live', label: 'Live Now' }, { id: 'ended', label: 'Ended' }, { id: 'all', label: 'All' }];

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Live Stream Management</h1>
      <p style={S.sub}>Monitor and control active streams</p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: tab === t.id ? '#7c5cfc' : '#0d0d18', color: tab === t.id ? '#fff' : '#7a7a90' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={S.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Streamer', 'Title', 'Category', 'Viewers', 'Peak', 'Started', 'Status', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ ...S.td, textAlign: 'center', color: '#5a5a72', padding: 40 }}>Loading...</td></tr>
              : streams.length === 0 ? <tr><td colSpan={8} style={{ ...S.td, textAlign: 'center', color: '#5a5a72', padding: 40 }}>No streams found</td></tr>
              : streams.map(s => (
                <tr key={s.id}>
                  <td style={S.td}>
                    <p style={{ fontWeight: 600, color: '#e2e2e9' }}>{s.user?.display_name}</p>
                    <p style={{ fontSize: 11, color: '#5a5a72' }}>@{s.user?.username}</p>
                  </td>
                  <td style={{ ...S.td, maxWidth: 200 }}>
                    <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</p>
                  </td>
                  <td style={S.td}><span style={{ fontSize: 11, background: '#7c5cfc20', color: '#7c5cfc', padding: '2px 8px', borderRadius: 99 }}>{s.category || '—'}</span></td>
                  <td style={{ ...S.td, display: 'flex', alignItems: 'center', gap: 5 }}><Eye size={12} style={{ color: '#60a5fa' }} />{s.viewer_count || 0}</td>
                  <td style={S.td}>{s.peak_viewers || 0}</td>
                  <td style={{ ...S.td, color: '#5a5a72', whiteSpace: 'nowrap' }}>{s.started_at ? new Date(s.started_at).toLocaleString() : '—'}</td>
                  <td style={S.td}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: s.status === 'live' ? '#f87171' : '#5a5a72', color: '#fff' }}>
                      {s.status?.toUpperCase()}
                    </span>
                  </td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {s.status === 'live' && (
                        <button onClick={() => endStream(s.id)} title="End stream"
                          style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: 'transparent', color: '#5a5a72', transition: 'all 120ms' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fbbf2420'; e.currentTarget.style.color = '#fbbf24'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5a5a72'; }}>
                          <StopCircle size={14} />
                        </button>
                      )}
                      <button onClick={() => deleteStream(s.id)} title="Delete"
                        style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: 'transparent', color: '#5a5a72', transition: 'all 120ms' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f8717120'; e.currentTarget.style.color = '#f87171'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5a5a72'; }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
