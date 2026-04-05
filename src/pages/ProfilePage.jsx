import { useState } from 'react'
import { Edit3, CheckCircle, Star, Camera, Link2, MapPin, Calendar, Settings, Grid, Bookmark, Heart } from 'lucide-react'
import { MOCK_USERS, MOCK_POSTS } from '../store/appStore'

export default function ProfilePage() {
  const user = { ...MOCK_USERS[0], id: 'me', username: 'your_handle', display_name: 'Your Name', initials: 'YO', verified: false, premium: true }
  const [activeTab, setActiveTab] = useState('posts')
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('Digital creator & content enthusiast ✦ Building in public')
  const [editBio, setEditBio] = useState(bio)

  const stats = [
    { label: 'Posts', value: '142' },
    { label: 'Followers', value: '8.4K' },
    { label: 'Following', value: '312' },
    { label: 'Earned', value: '$2.4K' },
  ]

  const tabs = [
    { id: 'posts', icon: Grid, label: 'Posts' },
    { id: 'saved', icon: Bookmark, label: 'Saved' },
    { id: 'liked', icon: Heart, label: 'Liked' },
  ]

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>
      {/* Cover */}
      <div style={{
        height: 180, borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-pink), var(--accent-blue))',
        marginBottom: -50, position: 'relative', overflow: 'hidden',
      }}>
        <button style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.4)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', padding: '6px 12px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Camera size={14} /> Edit Cover
        </button>
      </div>

      {/* Avatar + actions */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingLeft: 20, marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <div className="avatar-placeholder" style={{
            width: 96, height: 96, fontSize: 32,
            border: '4px solid var(--bg-primary)',
            boxShadow: '0 0 0 2px var(--accent-primary)',
          }}>
            {user.initials}
          </div>
          <button style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--accent-primary)', border: '2px solid var(--bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Camera size={12} color="white" />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setEditing(true)} className="btn-ghost" style={{ fontSize: 13 }}>
            <Edit3 size={14} /> Edit Profile
          </button>
          <button className="btn-icon"><Settings size={16} /></button>
        </div>
      </div>

      {/* User info */}
      <div style={{ paddingLeft: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>{user.display_name}</h1>
          {user.verified && <CheckCircle size={18} style={{ color: 'var(--accent-primary)' }} />}
          {user.premium && <span className="badge badge-premium"><Star size={10} /> PRO</span>}
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 10 }}>@{user.username}</p>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{bio}</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> Lagos, Nigeria</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> Joined 2024</span>
          <span style={{ fontSize: 13, color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}><Link2 size={13} /> nexus.social/you</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
        background: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        border: '1px solid var(--border-subtle)', marginBottom: 20,
      }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{ background: 'var(--bg-card)', padding: '16px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, marginBottom: 2 }}>
              {s.label === 'Earned' ? <span className="gradient-text">{s.value}</span> : s.value}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-subtle)', marginBottom: 20 }}>
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            color: activeTab === id ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === id ? '2px solid var(--accent-primary)' : '2px solid transparent',
            background: 'none', border: 'none', borderBottom: activeTab === id ? '2px solid var(--accent-primary)' : '2px solid transparent',
            cursor: 'pointer', fontSize: 13, fontWeight: activeTab === id ? 600 : 400, transition: 'all 150ms',
          }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
        {MOCK_POSTS.map((post, i) => (
          <div key={post.id} style={{
            aspectRatio: '1', borderRadius: 'var(--radius-md)',
            background: `linear-gradient(${i * 60 + 180}deg, hsl(${i * 40 + 240}deg, 60%, 20%), hsl(${i * 40 + 280}deg, 60%, 30%))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 28, transition: 'opacity 150ms',
            position: 'relative', overflow: 'hidden',
          }}
            onMouseEnter={e => {
              e.currentTarget.querySelector('.post-overlay').style.opacity = '1'
            }}
            onMouseLeave={e => {
              e.currentTarget.querySelector('.post-overlay').style.opacity = '0'
            }}
          >
            {['🎵', '🎨', '🎮', '💻', '🎬'][i % 5]}
            <div className="post-overlay" style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              opacity: 0, transition: 'opacity 150ms',
            }}>
              <span style={{ color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Heart size={14} fill="white" /> {post.likes}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditing(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 480, background: 'var(--bg-card)', borderRadius: 24, padding: 24, border: '1px solid var(--border-default)' }} className="fade-in">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Edit Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Display Name</label>
                <input className="input-field" defaultValue={user.display_name} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Username</label>
                <input className="input-field" defaultValue={user.username} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Bio</label>
                <textarea className="input-field" rows={3} value={editBio} onChange={e => setEditBio(e.target.value)} style={{ resize: 'none' }} />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{160 - editBio.length} characters remaining</p>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Location</label>
                <input className="input-field" defaultValue="Lagos, Nigeria" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Website</label>
                <input className="input-field" defaultValue="nexus.social/you" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setEditing(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={() => { setBio(editBio); setEditing(false) }} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
