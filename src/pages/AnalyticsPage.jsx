import { useState } from 'react'
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Share2, Users, ArrowUpRight } from 'lucide-react'

const WEEKLY_DATA = [
  { day: 'Mon', views: 1240, likes: 89, followers: 12 },
  { day: 'Tue', views: 980, likes: 64, followers: 8 },
  { day: 'Wed', views: 1680, likes: 124, followers: 21 },
  { day: 'Thu', views: 2100, likes: 189, followers: 34 },
  { day: 'Fri', views: 3200, likes: 241, followers: 48 },
  { day: 'Sat', views: 2800, likes: 198, followers: 29 },
  { day: 'Sun', views: 1900, likes: 142, followers: 19 },
]

const TOP_POSTS = [
  { title: 'New track drop 🎵', views: 12400, likes: 1842, engagement: '14.8%' },
  { title: 'Digital art series preview', views: 9800, likes: 3241, engagement: '33.1%' },
  { title: 'Gaming session highlights', views: 7200, likes: 892, engagement: '12.4%' },
  { title: 'Studio session complete ✓', views: 5600, likes: 2104, engagement: '37.6%' },
]

function SparkBar({ data, key2, color }) {
  const max = Math.max(...data.map(d => d[key2]))
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
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d')

  const statCards = [
    { label: 'Profile Views', value: '48.2K', change: '+12%', up: true, icon: Eye, color: '#7c5cfc', dataKey: 'views' },
    { label: 'Total Likes', value: '11.5K', change: '+8%', up: true, icon: Heart, color: '#f472b6', dataKey: 'likes' },
    { label: 'New Followers', value: '+341', change: '+23%', up: true, icon: Users, color: '#22d3a5', dataKey: 'followers' },
    { label: 'Engagement Rate', value: '7.4%', change: '-2%', up: false, icon: TrendingUp, color: '#fbbf24', dataKey: 'likes' },
  ]

  const audienceData = [
    { label: '18–24', pct: 34, color: '#7c5cfc' },
    { label: '25–34', pct: 41, color: '#f472b6' },
    { label: '35–44', pct: 18, color: '#22d3a5' },
    { label: '45+', pct: 7, color: '#fbbf24' },
  ]

  const locationData = [
    { country: '🇳🇬 Nigeria', pct: 42 },
    { country: '🇬🇧 UK', pct: 18 },
    { country: '🇺🇸 USA', pct: 21 },
    { country: '🇨🇦 Canada', pct: 9 },
    { country: '🌍 Others', pct: 10 },
  ]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28 }}>
          <span className="gradient-text">Analytics</span>
        </h1>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 4 }}>
          {['7d', '30d', '90d'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 13,
              background: period === p ? 'var(--bg-card)' : 'transparent',
              color: period === p ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer', fontWeight: period === p ? 600 : 400,
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        {statCards.map(s => {
          const Icon = s.icon
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
          )
        })}
      </div>

      {/* Top Posts */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontWeight: 700, fontSize: 16 }}>Top Performing Posts</h3>
        </div>
        {TOP_POSTS.map((post, i) => (
          <div key={post.title} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
            borderBottom: i < TOP_POSTS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
          }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-disabled)', width: 20, flexShrink: 0 }}>#{i + 1}</span>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ fontWeight: 500, fontSize: 14 }} className="truncate">{post.title}</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Eye size={11} /> {post.views.toLocaleString()}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Heart size={11} /> {post.likes.toLocaleString()}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#22d3a5' }}>{post.engagement}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>engagement</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Age */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Audience Age</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {audienceData.map(a => (
              <div key={a.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{a.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: a.color }}>{a.pct}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-active)', borderRadius: 999 }}>
                  <div style={{ height: '100%', width: `${a.pct}%`, background: a.color, borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Top Locations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {locationData.map((l, i) => (
              <div key={l.country} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 14 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{l.country}</span>
                <div style={{ width: 60, height: 4, background: 'var(--bg-active)', borderRadius: 999 }}>
                  <div style={{ height: '100%', width: `${l.pct}%`, background: 'var(--accent-primary)', borderRadius: 999 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: 30, textAlign: 'right' }}>{l.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
