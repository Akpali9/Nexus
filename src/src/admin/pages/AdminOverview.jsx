import { useState, useEffect } from 'react';
import { Users, FileText, Radio, DollarSign, TrendingUp, TrendingDown, Activity, Eye, Heart, MessageCircle, UserPlus, Zap } from 'lucide-react';
import { supabase } from '../../services/supabase';

const S = {
  page: { padding: '28px 32px' },
  h1: { fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 },
  sub: { fontSize: 13, color: '#5a5a72', marginBottom: 28 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
  card: { background: '#0d0d18', border: '1px solid #1e1e2e', borderRadius: 14, padding: 20 },
  label: { fontSize: 11, color: '#5a5a72', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 },
  bigNum: { fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4 },
  change: (up) => ({ fontSize: 12, fontWeight: 600, color: up ? '#22d3a5' : '#f87171', display: 'flex', alignItems: 'center', gap: 3 }),
};

function StatCard({ icon: Icon, label, value, change, up, color, loading }) {
  return (
    <div style={S.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color={color} />
        </div>
        <span style={S.change(up)}>
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {change}
        </span>
      </div>
      <p style={S.bigNum}>{loading ? '—' : value}</p>
      <p style={S.label}>{label}</p>
    </div>
  );
}

function MiniBar({ value, max, color }) {
  return (
    <div style={{ height: 4, background: '#1e1e2e', borderRadius: 99, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const now = new Date();
      const weekAgo = new Date(now - 7 * 86400000).toISOString();
      const monthAgo = new Date(now - 30 * 86400000).toISOString();

      const [
        { count: totalUsers },
        { count: newUsersWeek },
        { count: totalPosts },
        { count: postsWeek },
        { count: liveNow },
        { count: totalGroups },
        { data: giftData },
        { data: recentU },
        { data: recentP },
        { data: notifications },
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabase.from('live_streams').select('id', { count: 'exact', head: true }).eq('status', 'live'),
        supabase.from('groups').select('id', { count: 'exact', head: true }),
        supabase.from('gifts').select('amount').gte('created_at', monthAgo),
        supabase.from('profiles').select('id,display_name,username,created_at,verified,premium,plan,follower_count').order('created_at', { ascending: false }).limit(6),
        supabase.from('posts').select('id,content,created_at,like_count,comment_count,user:profiles(display_name,username)').order('created_at', { ascending: false }).limit(6),
        supabase.from('notifications').select('id,type,content,created_at,actor:profiles(display_name)').order('created_at', { ascending: false }).limit(10),
      ]);

      const revenue = giftData?.reduce((s, g) => s + (g.amount || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        newUsersWeek: newUsersWeek || 0,
        totalPosts: totalPosts || 0,
        postsWeek: postsWeek || 0,
        liveNow: liveNow || 0,
        totalGroups: totalGroups || 0,
        revenue: revenue.toFixed(2),
      });
      setRecentUsers(recentU || []);
      setRecentPosts(recentP || []);
      setActivityFeed(notifications || []);
      setLoading(false);
    };

    fetch();

    // Live stats updates
    const sub = supabase.channel('admin-overview')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
        setStats(prev => prev ? { ...prev, totalUsers: prev.totalUsers + 1, newUsersWeek: prev.newUsersWeek + 1 } : prev);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        setStats(prev => prev ? { ...prev, totalPosts: prev.totalPosts + 1, postsWeek: prev.postsWeek + 1 } : prev);
        setRecentPosts(prev => [payload.new, ...prev.slice(0, 5)]);
      })
      .subscribe();

    return () => sub.unsubscribe();
  }, []);

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.totalUsers?.toLocaleString(), change: `+${stats?.newUsersWeek} this week`, up: true, color: '#7c5cfc' },
    { icon: FileText, label: 'Total Posts', value: stats?.totalPosts?.toLocaleString(), change: `+${stats?.postsWeek} this week`, up: true, color: '#60a5fa' },
    { icon: Radio, label: 'Live Now', value: stats?.liveNow, change: 'active streams', up: true, color: '#f472b6' },
    { icon: DollarSign, label: 'Revenue (30d)', value: `$${stats?.revenue}`, change: '+18% vs last month', up: true, color: '#22d3a5' },
  ];

  const NOTIF_COLORS = { like: '#f87171', follow: '#7c5cfc', comment: '#60a5fa', live: '#f472b6', gift: '#fbbf24' };

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Dashboard Overview</h1>
      <p style={S.sub}>Real-time platform metrics and activity</p>

      {/* Stat cards */}
      <div style={S.grid4}>
        {statCards.map(c => <StatCard key={c.label} {...c} loading={loading} />)}
      </div>

      <div style={S.grid2}>
        {/* Recent Users */}
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Recent Signups</h2>
            <span style={{ fontSize: 11, color: '#5a5a72' }}>Last joined</span>
          </div>
          {loading ? <p style={{ color: '#5a5a72', fontSize: 13 }}>Loading...</p> : recentUsers.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7c5cfc33, #f472b633)', border: '1px solid #7c5cfc44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#7c5cfc', flexShrink: 0 }}>
                {u.display_name?.[0] || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e2e9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.display_name}</p>
                <p style={{ fontSize: 11, color: '#5a5a72' }}>@{u.username}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {u.premium && <span style={{ fontSize: 9, background: '#7c5cfc22', color: '#7c5cfc', padding: '2px 6px', borderRadius: 99, fontWeight: 700 }}>PRO</span>}
                <p style={{ fontSize: 10, color: '#5a5a72', marginTop: 2 }}>{new Date(u.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Live Activity Feed */}
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22d3a5', boxShadow: '0 0 6px #22d3a5' }} />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Live Activity</h2>
          </div>
          {loading ? <p style={{ color: '#5a5a72', fontSize: 13 }}>Loading...</p> : activityFeed.length === 0 ? (
            <p style={{ color: '#5a5a72', fontSize: 13 }}>No recent activity</p>
          ) : activityFeed.map(n => (
            <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #1e1e2e' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: NOTIF_COLORS[n.type] || '#5a5a72', marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: '#c2c2d4' }}>
                  <strong style={{ color: '#e2e2e9' }}>{n.actor?.display_name || 'User'}</strong>{' '}{n.content}
                </p>
                <p style={{ fontSize: 10, color: '#5a5a72', marginTop: 2 }}>{new Date(n.created_at).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div style={S.card}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Recent Posts</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {loading ? <p style={{ color: '#5a5a72', fontSize: 13 }}>Loading...</p> : recentPosts.map(post => (
            <div key={post.id} style={{ background: '#16162a', border: '1px solid #1e1e2e', borderRadius: 10, padding: 14 }}>
              <p style={{ fontSize: 11, color: '#5a5a72', marginBottom: 6 }}>@{post.user?.username || 'unknown'}</p>
              <p style={{ fontSize: 13, color: '#c2c2d4', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {post.content}
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 11, color: '#5a5a72', display: 'flex', alignItems: 'center', gap: 3 }}><Heart size={10} /> {post.like_count || 0}</span>
                <span style={{ fontSize: 11, color: '#5a5a72', display: 'flex', alignItems: 'center', gap: 3 }}><MessageCircle size={10} /> {post.comment_count || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
