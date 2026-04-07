import { useEffect, useState } from 'react';
import { Users, FileText, Flag, DollarSign, Radio, TrendingUp, UserPlus, AlertTriangle, Clock, Activity } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAdminStore } from '../adminStore';
import { useAuthStore } from '../../stores/authStore';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';

const COLORS = { purple: '#7c5cfc', green: '#22d3a5', red: '#ef4444', amber: '#fbbf24', blue: '#60a5fa', pink: '#f472b6' };

function MiniChart({ data, color }) {
  if (!data?.length) return null;
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 40 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, borderRadius: '2px 2px 0 0', background: i === data.length - 1 ? color : `${color}44`, height: `${Math.max((v / max) * 100, 6)}%`, transition: 'height 0.4s ease' }} />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { stats, fetchStats, auditLogs, fetchAuditLogs } = useAdminStore();
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    fetchStats();
    fetchAuditLogs();

    // Recent users
    supabase.from('profiles').select('id, display_name, username, created_at, is_admin, is_banned').order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setRecentUsers(data || []));

    // Recent posts
    supabase.from('posts').select('id, content, created_at, like_count, user:profiles(display_name)').order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setRecentPosts(data || []));

    // Live streams count
    supabase.from('live_streams').select('id', { count: 'exact', head: true }).eq('status', 'live')
      .then(({ count }) => setLiveCount(count || 0));

    // Real-time: new users
    const sub = supabase.channel('admin-dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        setRecentUsers(prev => [payload.new, ...prev.slice(0, 4)]);
        fetchStats();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, ({ new: s }) => {
        supabase.from('live_streams').select('id', { count: 'exact', head: true }).eq('status', 'live').then(({ count }) => setLiveCount(count || 0));
      })
      .subscribe();

    return () => sub.unsubscribe();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() ?? '—', sub: `+${stats?.newUsers ?? 0} this week`, icon: Users, color: COLORS.purple, change: 12 },
    { label: 'Total Posts', value: stats?.totalPosts?.toLocaleString() ?? '—', icon: FileText, color: COLORS.blue, change: 8 },
    { label: 'Live Now', value: liveCount, icon: Radio, color: COLORS.green },
    { label: 'Pending Reports', value: stats?.pendingReports ?? '—', icon: Flag, color: COLORS.red },
    { label: 'Pending Payouts', value: stats?.pendingWithdrawals ?? '—', icon: DollarSign, color: COLORS.amber },
    { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toFixed(2)}`, icon: TrendingUp, color: COLORS.pink, change: 23 },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle={`Overview as of ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Two column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Recent Users */}
        <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Recent Sign-ups</h3>
            <UserPlus size={14} color="#7c5cfc" />
          </div>
          {recentUsers.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7c5cfc44, #f472b644)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#7c5cfc', flexShrink: 0 }}>
                {u.display_name?.[0] || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e2e9' }}>{u.display_name}</p>
                <p style={{ fontSize: 11, color: '#4a4a57' }}>@{u.username}</p>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {u.is_admin && <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '2px 7px', borderRadius: 999, fontWeight: 700 }}>Admin</span>}
                {u.is_banned && <span style={{ fontSize: 10, background: 'rgba(248,113,113,0.15)', color: '#f87171', padding: '2px 7px', borderRadius: 999 }}>Banned</span>}
              </div>
              <p style={{ fontSize: 10, color: '#4a4a57', whiteSpace: 'nowrap' }}>{new Date(u.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>

        {/* Recent Posts */}
        <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Recent Posts</h3>
            <FileText size={14} color="#60a5fa" />
          </div>
          {recentPosts.map(p => (
            <div key={p.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #16161f' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#7c5cfc' }}>{p.user?.display_name}</span>
                <span style={{ fontSize: 10, color: '#4a4a57' }}>{new Date(p.created_at).toLocaleString()}</span>
              </div>
              <p style={{ fontSize: 12, color: '#8e8e99', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.content}</p>
              <p style={{ fontSize: 11, color: '#4a4a57', marginTop: 2 }}>❤️ {p.like_count || 0} likes</p>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log */}
      <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Activity size={14} color="#7c5cfc" />
          <h3 style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Recent Admin Activity</h3>
        </div>
        {auditLogs.slice(0, 8).map(log => (
          <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #16161f' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={12} color="#6b6b7a" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: '#c8c8d4' }}>
                <strong style={{ color: '#7c5cfc' }}>{log.admin?.display_name || 'Admin'}</strong>{' '}
                {log.action.replace(/_/g, ' ')}
                {log.target_type && <span style={{ color: '#4a4a57' }}> ({log.target_type})</span>}
              </p>
            </div>
            <p style={{ fontSize: 10, color: '#4a4a57', whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleTimeString()}</p>
          </div>
        ))}
        {auditLogs.length === 0 && <p style={{ color: '#4a4a57', fontSize: 13 }}>No admin actions yet</p>}
      </div>
    </AdminLayout>
  );
}
