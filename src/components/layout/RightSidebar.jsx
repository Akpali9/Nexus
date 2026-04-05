import { useState } from 'react'
import { TrendingUp, Radio, Users, CheckCircle, UserPlus } from 'lucide-react'
import { MOCK_USERS, MOCK_LIVE_STREAMS } from '../../store/appStore'

function LiveStreamCard({ stream }) {
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '10px',
      borderRadius: 'var(--radius-md)', cursor: 'pointer',
      transition: 'background 150ms',
      border: '1px solid var(--border-subtle)',
      marginBottom: 8,
      background: 'var(--bg-tertiary)',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div className="avatar-placeholder" style={{ width: 40, height: 40, fontSize: 14 }}>{stream.user.initials}</div>
        <span className="live-dot" style={{ position: 'absolute', bottom: 0, right: 0, border: '2px solid var(--bg-tertiary)' }} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <p style={{ fontSize: 13, fontWeight: 500 }} className="truncate">{stream.title}</p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stream.user.display_name} · {stream.category}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <Users size={11} style={{ color: 'var(--accent-red)' }} />
          <span style={{ fontSize: 11, color: 'var(--accent-red)', fontWeight: 600 }}>{stream.viewers.toLocaleString()} watching</span>
        </div>
      </div>
    </div>
  )
}

function SuggestionCard({ user }) {
  const [following, setFollowing] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
      <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: 13, position: 'relative' }}>
        {user.initials}
        {user.online && <span className="online-indicator" />}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }} className="truncate">{user.display_name}</span>
          {user.verified && <CheckCircle size={12} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(user.followers / 1000).toFixed(1)}k followers</p>
      </div>
      <button onClick={() => setFollowing(!following)}
        style={{
          padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
          background: following ? 'var(--bg-active)' : 'var(--accent-primary)',
          color: following ? 'var(--text-secondary)' : 'white',
          border: following ? '1px solid var(--border-default)' : 'none',
          cursor: 'pointer', transition: 'all 150ms', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
        {following ? 'Following' : <><UserPlus size={11} /> Follow</>}
      </button>
    </div>
  )
}

const TRENDING = [
  { tag: 'NexusLive', posts: '48.2K' },
  { tag: 'DigitalArt', posts: '32.1K' },
  { tag: 'WebDev2025', posts: '28.9K' },
  { tag: 'MusicProducer', posts: '21.4K' },
  { tag: 'CreatorEconomy', posts: '18.7K' },
]

export default function RightSidebar() {
  return (
    <aside style={{
      width: 'var(--right-sidebar-width)',
      position: 'sticky',
      top: 24,
      maxHeight: 'calc(100vh - 48px)',
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      {/* Live Now */}
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="live-dot" />
          Live Now
        </h3>
        {MOCK_LIVE_STREAMS.map(stream => (
          <LiveStreamCard key={stream.id} stream={stream} />
        ))}
      </div>

      {/* Trending */}
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={13} />
          Trending
        </h3>
        {TRENDING.map((t, i) => (
          <div key={t.tag} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
            borderBottom: i < TRENDING.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            cursor: 'pointer',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 16, textAlign: 'right' }}>{i + 1}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-secondary)' }}>#{t.tag}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.posts} posts</p>
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          People to Follow
        </h3>
        {MOCK_USERS.slice(0, 4).map(user => (
          <SuggestionCard key={user.id} user={user} />
        ))}
      </div>

      {/* Footer */}
      <p style={{ fontSize: 11, color: 'var(--text-disabled)', padding: '0 4px', lineHeight: 1.8 }}>
        © 2025 Nexus · <span style={{ cursor: 'pointer' }}>Privacy</span> · <span style={{ cursor: 'pointer' }}>Terms</span> · <span style={{ cursor: 'pointer' }}>Advertise</span>
      </p>
    </aside>
  )
}
