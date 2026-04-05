import { useState } from 'react'
import { Search, TrendingUp, Hash, Users, Video, Image, Filter, X, CheckCircle } from 'lucide-react'
import { MOCK_USERS, MOCK_POSTS, MOCK_LIVE_STREAMS } from '../store/appStore'

const CATEGORIES = ['All', 'People', 'Posts', 'Live', 'Tags', 'Media']

const TRENDING_TAGS = [
  { tag: 'NexusLive', posts: '48.2K', color: '#7c5cfc' },
  { tag: 'DigitalArt', posts: '32.1K', color: '#f472b6' },
  { tag: 'WebDev2025', posts: '28.9K', color: '#22d3a5' },
  { tag: 'MusicProducer', posts: '21.4K', color: '#fbbf24' },
  { tag: 'CreatorEconomy', posts: '18.7K', color: '#60a5fa' },
  { tag: 'NFTArt', posts: '15.2K', color: '#f87171' },
  { tag: 'OpenSource', posts: '12.8K', color: '#a78bfa' },
  { tag: 'Streaming', posts: '11.3K', color: '#4adebd' },
]

function UserResult({ user }) {
  const [following, setFollowing] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)', transition: 'border-color 150ms',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div className="avatar-placeholder" style={{ width: 48, height: 48, fontSize: 16 }}>{user.initials}</div>
        {user.online && <span className="online-indicator" />}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{user.display_name}</span>
          {user.verified && <CheckCircle size={13} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />}
          {user.premium && <span style={{ fontSize: 10, background: 'rgba(251,191,36,0.15)', color: 'var(--accent-amber)', padding: '1px 6px', borderRadius: 999, fontWeight: 700 }}>PRO</span>}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{user.username} · {(user.followers / 1000).toFixed(1)}k followers</p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }} className="truncate">{user.bio}</p>
      </div>
      <button onClick={() => setFollowing(!following)} style={{
        padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
        background: following ? 'transparent' : 'var(--accent-primary)',
        color: following ? 'var(--text-secondary)' : 'white',
        border: following ? '1px solid var(--border-default)' : 'none',
        cursor: 'pointer', transition: 'all 150ms', flexShrink: 0,
      }}>
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

function PostResult({ post }) {
  const [liked, setLiked] = useState(false)
  return (
    <div style={{
      padding: '14px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
        <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: 12, flexShrink: 0 }}>{post.user.initials}</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{post.user.display_name}</span>
            {post.user.verified && <CheckCircle size={12} style={{ color: 'var(--accent-primary)' }} />}
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {post.time}</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }} className="line-clamp-2">{post.content}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, paddingLeft: 46 }}>
        <button onClick={() => setLiked(!liked)} style={{
          fontSize: 12, color: liked ? '#f87171' : 'var(--text-muted)',
          background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          ❤️ {post.likes.toLocaleString()}
        </button>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>💬 {post.comments}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🔁 {post.shares}</span>
      </div>
    </div>
  )
}

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [searching, setSearching] = useState(false)

  const handleSearch = (q) => {
    setQuery(q)
    setSearching(q.length > 0)
  }

  const filteredUsers = MOCK_USERS.filter(u =>
    u.display_name.toLowerCase().includes(query.toLowerCase()) ||
    u.username.toLowerCase().includes(query.toLowerCase())
  )
  const filteredPosts = MOCK_POSTS.filter(p =>
    p.content.toLowerCase().includes(query.toLowerCase()) ||
    p.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="input-field"
          placeholder="Search people, posts, tags..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          style={{ paddingLeft: 48, paddingRight: 44, borderRadius: 999, fontSize: 15, padding: '14px 44px 14px 48px' }}
          autoFocus
        />
        {query && (
          <button onClick={() => handleSearch('')} style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            background: 'var(--bg-hover)', border: 'none', borderRadius: '50%',
            width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)',
          }}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 24 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: category === cat ? 600 : 400,
            background: category === cat ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            color: category === cat ? 'white' : 'var(--text-secondary)',
            border: 'none', cursor: 'pointer', transition: 'all 150ms', flexShrink: 0,
          }}>{cat}</button>
        ))}
      </div>

      {!searching ? (
        <>
          {/* Trending tags */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} /> Trending Now
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {TRENDING_TAGS.map((t, i) => (
                <div key={t.tag} onClick={() => handleSearch(t.tag)} style={{
                  padding: '14px 16px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  cursor: 'pointer', transition: 'all 150ms',
                  borderLeft: `3px solid ${t.color}`,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>#{i + 1} TRENDING</span>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: t.color }}>#{t.tag}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t.posts} posts</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested people */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} style={{ color: 'var(--accent-primary)' }} /> People to Follow
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MOCK_USERS.map(user => <UserResult key={user.id} user={user} />)}
            </div>
          </div>

          {/* Featured posts */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Hash size={18} style={{ color: 'var(--accent-primary)' }} /> Featured Posts
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MOCK_POSTS.slice(0, 3).map(post => <PostResult key={post.id} post={post} />)}
            </div>
          </div>
        </>
      ) : (
        <div className="fade-in">
          {(category === 'All' || category === 'People') && filteredUsers.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>People</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredUsers.map(u => <UserResult key={u.id} user={u} />)}
              </div>
            </div>
          )}
          {(category === 'All' || category === 'Posts') && filteredPosts.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Posts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredPosts.map(p => <PostResult key={p.id} post={p} />)}
              </div>
            </div>
          )}
          {filteredUsers.length === 0 && filteredPosts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No results for "{query}"</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Try different keywords or browse trending topics</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
