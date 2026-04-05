import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Eye, Heart, Users, ArrowUpRight } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const WEEKLY_DATA = [
  { day: 'Mon', views: 1240, likes: 89, followers: 12 },
  { day: 'Tue', views: 980, likes: 64, followers: 8 },
  { day: 'Wed', views: 1680, likes: 124, followers: 21 },
  { day: 'Thu', views: 2100, likes: 189, followers: 34 },
  { day: 'Fri', views: 3200, likes: 241, followers: 48 },
  { day: 'Sat', views: 2800, likes: 198, followers: 29 },
  { day: 'Sun', views: 1900, likes: 142, followers: 19 },
];

function SparkBar({ data, key2, color }) {
  const max = Math.max(...data.map(d => d[key2]));
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 60 }}>
      {data.map((d, i) => (
        <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: '100%', borderRadius: '3px 3px 0 0',
            height: `${Math.max((d[key2] / max) * 100, 5)}%`,
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
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    views: '0',
    likes: '0',
    followers: '+0',
    engagement: '0%'
  });

  useEffect(() => {
    if (!profile) return;
    const fetchStats = async () => {
      // Simulate fetching aggregated stats from RPC
      const { data } = await supabase.rpc('get_user_analytics', { user_id: profile.id });
      if (data) {
        setStats({
          views: `${(data.views / 1000).toFixed(1)}K`,
          likes: `${(data.likes / 1000).toFixed(1)}K`,
          followers: `+${data.new_followers}`,
          engagement: `${data.engagement_rate}%`,
        });
      }
    };
    fetchStats();

    // Real-time updates via subscription (e.g., new follower)
    const followersSub = supabase
      .channel('analytics-followers')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'follows' }, (payload) => {
        if (payload.new.following_id === profile.id) {
          setStats(prev => ({
            ...prev,
            followers: `+${parseInt(prev.followers.replace('+', '')) + 1}`
          }));
        }
      })
      .subscribe();
    return () => followersSub.unsubscribe();
  }, [profile]);

  const statCards = [
    { label: 'Profile Views', value: stats.views, change: '+12%', up: true, icon: Eye, color: '#7c5cfc', dataKey: 'views' },
    { label: 'Total Likes', value: stats.likes, change: '+8%', up: true, icon: Heart, color: '#f472b6', dataKey: 'likes' },
    { label: 'New Followers', value: stats.followers, change: '+23%', up: true, icon: Users, color: '#22d3a5', dataKey: 'followers' },
    { label: 'Engagement Rate', value: stats.engagement, change: '-2%', up: false, icon: TrendingUp, color: '#fbbf24', dataKey: 'likes' },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
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
              <SparkBar data={WEEKLY_DATA} key2={s.dataKey} color={s.color} />
            </div>
          );
        })}
      </div>
      {/* Additional sections (top posts, audience age, location) can be added similarly using real data from Supabase */}
    </div>
  );
}
