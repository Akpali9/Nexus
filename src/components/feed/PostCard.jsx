import { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Send, CheckCircle, Repeat2 } from 'lucide-react'

const POST_GRADIENTS = [
  'linear-gradient(135deg, #7c5cfc22, #f472b622)',
  'linear-gradient(135deg, #22d3a522, #60a5fa22)',
  'linear-gradient(135deg, #fbbf2422, #f8717122)',
]

function AvatarPlaceholder({ user, size = 40 }) {
  return (
    <div className="avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.35, flexShrink: 0, position: 'relative' }}>
      {user.initials}
      {user.online && <span className="online-indicator" />}
    </div>
  )
}

export default function PostCard({ post, onLike }) {
  const [liked, setLiked] = useState(post.liked)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [bookmarked, setBookmarked] = useState(false)
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [comment, setComment] = useState('')

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  const gradientBg = liked ? POST_GRADIENTS[0] : 'transparent'

  return (
    <div className="card fade-in" style={{ marginBottom: 12, overflow: 'hidden' }}>
      {/* Post media placeholder */}
      {post.media === 'art' && (
        <div style={{
          height: 240,
          background: 'linear-gradient(135deg, #7c5cfc, #f472b6, #22d3a5)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 64,
          }}>🎨</div>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)',
          }} />
        </div>
      )}

      <div style={{ padding: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <AvatarPlaceholder user={post.user} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{post.user.display_name}</span>
              {post.user.verified && <CheckCircle size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />}
              {post.user.premium && <span className="badge badge-premium" style={{ fontSize: 9, padding: '2px 6px' }}>PRO</span>}
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>·</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{post.time}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{post.user.username}</p>
          </div>
          <button className="btn-icon" style={{ flexShrink: 0, width: 32, height: 32 }}>
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Content */}
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 12 }}>
          {post.content}
        </p>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {post.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 12, color: 'var(--accent-secondary)',
                background: 'var(--accent-glow)', padding: '3px 10px',
                borderRadius: 999, cursor: 'pointer',
              }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={handleLike} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
            borderRadius: 'var(--radius-md)', background: liked ? 'rgba(248,113,113,0.1)' : 'transparent',
            color: liked ? '#f87171' : 'var(--text-muted)', transition: 'all 150ms', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: liked ? 600 : 400,
          }}>
            <Heart size={16} fill={liked ? '#f87171' : 'none'} />
            {likeCount.toLocaleString()}
          </button>

          <button onClick={() => setShowCommentBox(!showCommentBox)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
            borderRadius: 'var(--radius-md)', background: showCommentBox ? 'var(--accent-glow)' : 'transparent',
            color: showCommentBox ? 'var(--accent-primary)' : 'var(--text-muted)', transition: 'all 150ms', border: 'none', cursor: 'pointer', fontSize: 13,
          }}>
            <MessageCircle size={16} />
            {post.comments}
          </button>

          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
            borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', transition: 'all 150ms',
            border: 'none', cursor: 'pointer', fontSize: 13,
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-green)'; e.currentTarget.style.background = 'rgba(34,211,165,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            <Repeat2 size={16} />
            {post.shares}
          </button>

          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
            borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', transition: 'all 150ms',
            border: 'none', cursor: 'pointer', fontSize: 13,
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-blue)'; e.currentTarget.style.background = 'rgba(96,165,250,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            <Share2 size={16} />
          </button>

          <div style={{ flex: 1 }} />

          <button onClick={() => setBookmarked(!bookmarked)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: bookmarked ? 'rgba(251,191,36,0.1)' : 'transparent',
            color: bookmarked ? 'var(--accent-amber)' : 'var(--text-muted)',
            border: 'none', cursor: 'pointer', transition: 'all 150ms',
          }}>
            <Bookmark size={16} fill={bookmarked ? 'var(--accent-amber)' : 'none'} />
          </button>
        </div>

        {/* Comment box */}
        {showCommentBox && (
          <div className="fade-in" style={{ marginTop: 12, display: 'flex', gap: 10 }}>
            <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: 11, flexShrink: 0 }}>YO</div>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                className="input-field"
                placeholder="Write a comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{ paddingRight: 44, borderRadius: 999 }}
              />
              <button style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                color: comment ? 'var(--accent-primary)' : 'var(--text-muted)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
