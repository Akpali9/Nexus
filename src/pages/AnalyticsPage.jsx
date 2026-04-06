import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Eye, Heart, Users, ArrowUpRight } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import Sidebar from '../components/layout/Sidebar';

const WEEKLY_DATA = [
  { day: 'Mon', views: 1240, likes: 89, followers: 12 },
  { day: 'Tue', views: 980, likes: 64, followers: 8 },
  { day: 'Wed', views: 1680, likes: 124, followers: 21 },
  { day: 'Thu', views: 2100, likes: 189, followers: 34 },
  { day: 'Fri', views: 3200, likes: 241, followers: 48 },
  { day: 'Sat', views: 2800, likes: 198, followers: 29 },
  { day: 'Sun', views: 1900, likes: 142, followers: 19 },
];

function SparkBar({ data, dataKey, color }) {
  const max = Math.max(...data.map(d => d[dataKey]));
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 60 }}>
      {data.map((d, i) => (
        <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: '100%', borderRadius: '3px 3px 0 0',
            height: `${Math.max((d[dataKey] / max) * 100, 5)}%`,
            background: i === data.length - 2 ? color : `${color}55`,
            transition: 'height 0.5s ease',
          }} />
          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{d.day[0]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user, profile } = useAuthStore();
  const [stats, setStats] = useState({ views: '—', likes: '—', followers: '—', engagement: '—' });
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      // Get follower count, post count, like count from real tables
      const [{ count: followers }, { count: posts }, { count: likes }] = await Promise.all([
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', user.id),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('likes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      setPostCount(posts || 0);
      setStats({
        views: `${((posts || 0) * 24).toLocaleString()}`,
        likes: `${(likes || 0).toLocaleString()}`,
        followers: `${(followers || 0).toLocaleString()}`,
        engagement: followers > 0 ? `${((likes / followers) * 100).toFixed(1)}%` : '0%',
      });
    };
    fetchStats();

    // Real-time follower count updates
    const sub = supabase
      .channel('analytics-follows')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'follows' }, (payload) => {
        if (payload.new.following_id === user.id) {
          setStats(prev => ({ ...prev, followers: `${parseInt(prev.followers.replace(/,/g, '')) + 1}` }));
        }
      })
      .subscribe();

    return () => sub.unsubscribe();
  }, [user]);

  const statCards = [
    { label: 'Profile Views', value: stats.views, change: '+12%', up: true, icon: Eye, color: '#7c5cfc', dataKey: 'views' },
    { label: 'Total Likes', value: stats.likes, change: '+8%', up: true, icon: Heart, color: '#f472b6', dataKey: 'likes' },
    { label: 'Followers', value: stats.followers, change: '+23%', up: true, icon: Users, color: '#22d3a5', dataKey: 'followers' },
    { label: 'Engagement', value: stats.engagement, change: '-2%', up: false, icon: TrendingUp, color: '#fbbf24', dataKey: 'likes' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 'var(--sidebar-width)', padding: '24px', maxWidth: 900 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 24 }}>
          <span className="gradient-text">Analytics</span>
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          {statCards.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={s.color} />
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 12, color: s.up ? '#22d3a5' : '#f87171', display: 'flex', alignItems: 'center', gap: 2, fontWeight: 600 }}>
                    {s.up ? <ArrowUpRight size={12} /> : <TrendingDown size={12} />}
                    {s.change}
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>{s.value}</p>
                <SparkBar data={WEEKLY_DATA} dataKey={s.dataKey} color={s.color} />
              </div>
            );
          })}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Weekly Activity</h2>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120 }}>
            {WEEKLY_DATA.map((d, i) => {
              const max = Math.max(...WEEKLY_DATA.map(x => x.views));
              return (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%', borderRadius: '4px 4px 0 0',
                    height: `${Math.max((d.views / max) * 100, 4)}%`,
                    background: i === 4 ? 'var(--accent-primary)' : 'var(--accent-glow)',
                    border: '1px solid var(--border-accent)',
                  }} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
