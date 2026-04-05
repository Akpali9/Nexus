import { useState } from 'react'
import { Heart, MessageCircle, UserPlus, Radio, Gift, CheckCircle, Bell, BellOff, Zap } from 'lucide-react'
import { MOCK_USERS } from '../store/appStore'

const NOTIFICATIONS = [
  { id: '1', type: 'like', user: MOCK_USERS[0], content: 'liked your post', target: '"Just dropped a new track 🎵"', time: '2m ago', read: false },
  { id: '2', type: 'follow', user: MOCK_USERS[2], content: 'started following you', target: null, time: '15m ago', read: false },
  { id: '3', type: 'comment', user: MOCK_USERS[3], content: 'commented on your post', target: '"Love this energy! 🔥"', time: '34m ago', read: false },
  { id: '4', type: 'live', user: MOCK_USERS[4], content: 'went live', target: 'Music Production Session', time: '1h ago', read: true },
  { id: '5', type: 'mention', user: MOCK_USERS[1], content: 'mentioned you in a post', target: '@your_handle check this out!', time: '2h ago', read: true },
  { id: '6', type: 'gift', user: MOCK_USERS[0], content: 'sent you a gift', target: '🎁 Super Star × 5', time: '3h ago', read: true },
  { id: '7', type: 'follow', user: MOCK_USERS[3], content: 'started following you', target: null, time: '5h ago', read: true },
  { id: '8', type: 'like', user: MOCK_USERS[2], content: 'liked your comment', target: '"That bassline tho 😍"', time: '1d ago', read: true },
]

const TYPE_CONFIG = {
  like: { icon: Heart, color: '#f87171', bg: 'rgba(248,113,113,0.15)', label: 'Like' },
  follow: { icon: UserPlus, color: '#22d3a5', bg: 'rgba(34,211,165,0.15)', label: 'Follow' },
  comment: { icon: MessageCircle, color: '#7c5cfc', bg: 'rgba(124,92,252,0.15)', label: 'Comment' },
  live: { icon: Radio, color: '#f87171', bg: 'rgba(248,113,113,0.15)', label: 'Live' },
  mention: { icon: Zap, color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', label: 'Mention' },
  gift: { icon: Gift, color: '#f472b6', bg: 'rgba(244,114,182,0.15)', label: 'Gift' },
}

function NotifCard({ notif, onRead }) {
  const config = TYPE_CONFIG[notif.type]
  const Icon = config.icon

  return (
    <div onClick={() => onRead(notif.id)} style={{
      display: 'flex', gap: 12, padding: '14px 16px',
      background: notif.read ? 'transparent' : 'rgba(124,92,252,0.04)',
      borderRadius: 'var(--radius-md)', cursor: 'pointer',
      borderLeft: notif.read ? '3px solid transparent' : '3px solid var(--accent-primary)',
      transition: 'background 150ms', position: 'relative',
    }}
      onMouseEnter={e => e.currentTarget.style.background = notif.read ? 'var(--bg-hover)' : 'rgba(124,92,252,0.08)'}
      onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(124,92,252,0.04)'}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div className="avatar-placeholder" style={{ width: 44, height: 44, fontSize: 15 }}>{notif.user.initials}</div>
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: 20, height: 20, borderRadius: '50%',
          background: config.bg, border: '2px solid var(--bg-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={10} color={config.color} fill={notif.type === 'like' ? config.color : 'none'} />
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 2 }}>
          <span style={{ fontWeight: 600 }}>{notif.user.display_name}</span>
          {' '}<span style={{ color: 'var(--text-secondary)' }}>{notif.content}</span>
          {notif.target && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}> · {notif.target}</span>}
        </p>
        <p style={{ fontSize: 12, color: 'var(--accent-secondary)' }}>{notif.time}</p>
      </div>
      {!notif.read && (
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0, marginTop: 6 }} />
      )}
      {notif.type === 'follow' && (
        <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 12px', flexShrink: 0, alignSelf: 'center' }} onClick={e => e.stopPropagation()}>
          Follow back
        </button>
      )}
    </div>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const [filter, setFilter] = useState('all')

  const unread = notifications.filter(n => !n.read)
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'likes', label: 'Likes', types: ['like'] },
    { id: 'follows', label: 'Follows', types: ['follow'] },
    { id: 'comments', label: 'Comments', types: ['comment', 'mention'] },
    { id: 'activity', label: 'Activity', types: ['live', 'gift'] },
  ]

  const filtered = notifications.filter(n => {
    const f = filters.find(f => f.id === filter)
    return f.types ? f.types.includes(n.type) : true
  })

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26 }}>
            Notifications
          </h1>
          {unread.length > 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {unread.length} unread notifications
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unread.length > 0 && (
            <button onClick={markAllRead} style={{ fontSize: 13, color: 'var(--accent-primary)', background: 'var(--accent-glow)', border: '1px solid var(--border-accent)', padding: '7px 14px', borderRadius: 999, cursor: 'pointer' }}>
              <CheckCircle size={13} style={{ display: 'inline', marginRight: 5 }} />
              Mark all read
            </button>
          )}
          <button className="btn-icon"><Bell size={16} /></button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: filter === f.id ? 600 : 400,
            background: filter === f.id ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            color: filter === f.id ? 'white' : 'var(--text-secondary)',
            border: 'none', cursor: 'pointer', transition: 'all 150ms', flexShrink: 0,
          }}>{f.label}</button>
        ))}
      </div>

      {/* Unread section */}
      {filter === 'all' && unread.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>NEW</p>
          <div className="card" style={{ overflow: 'hidden' }}>
            {unread.map((n, i) => (
              <div key={n.id}>
                <NotifCard notif={n} onRead={markRead} />
                {i < unread.length - 1 && <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 16px' }} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Earlier */}
      <div>
        {filter === 'all' && notifications.some(n => n.read) && (
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>EARLIER</p>
        )}
        <div className="card" style={{ overflow: 'hidden' }}>
          {filtered.filter(n => filter === 'all' ? n.read : true).map((n, i, arr) => (
            <div key={n.id}>
              <NotifCard notif={n} onRead={markRead} />
              {i < arr.length - 1 && <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 16px' }} />}
            </div>
          ))}
          {filtered.filter(n => filter === 'all' ? n.read : true).length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <BellOff size={32} style={{ color: 'var(--text-disabled)', marginBottom: 12 }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No notifications here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
