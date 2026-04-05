import { useState } from 'react'
import { Image, Video, Smile, X, MapPin, Hash } from 'lucide-react'

export default function CreatePost({ onPost }) {
  const [content, setContent] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [posting, setPosting] = useState(false)

  const handlePost = async () => {
    if (!content.trim()) return
    setPosting(true)
    await new Promise(r => setTimeout(r, 800))
    onPost?.({
      id: Date.now().toString(),
      content,
      likes: 0, comments: 0, shares: 0,
      time: 'just now', liked: false, tags: [],
      user: { id: 'me', display_name: 'You', username: 'your_handle', initials: 'YO', verified: false, premium: true, online: true },
    })
    setContent('')
    setExpanded(false)
    setPosting(false)
  }

  return (
    <div className="card" style={{ padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div className="avatar-placeholder" style={{ width: 40, height: 40, fontSize: 14, flexShrink: 0 }}>YO</div>
        <div style={{ flex: 1 }}>
          <textarea
            className="input-field"
            placeholder="What's happening? Share with your network..."
            value={content}
            onChange={e => { setContent(e.target.value); if (!expanded) setExpanded(true) }}
            onFocus={() => setExpanded(true)}
            rows={expanded ? 4 : 2}
            style={{
              resize: 'none', borderRadius: 'var(--radius-md)',
              transition: 'all 250ms ease',
              lineHeight: 1.6,
            }}
          />

          {expanded && (
            <div className="fade-in" style={{ marginTop: 12 }}>
              {/* Character count */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <span style={{
                  fontSize: 12,
                  color: content.length > 260 ? 'var(--accent-red)' : 'var(--text-muted)',
                }}>{280 - content.length}</span>
              </div>

              {/* Action bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[
                  { icon: Image, label: 'Photo', color: 'var(--accent-blue)' },
                  { icon: Video, label: 'Video', color: 'var(--accent-pink)' },
                  { icon: Smile, label: 'Emoji', color: 'var(--accent-amber)' },
                  { icon: MapPin, label: 'Location', color: 'var(--accent-green)' },
                  { icon: Hash, label: 'Tag', color: 'var(--accent-secondary)' },
                ].map(({ icon: Icon, label, color }) => (
                  <button key={label} title={label} style={{
                    width: 34, height: 34, borderRadius: 'var(--radius-md)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 150ms',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = color }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                  >
                    <Icon size={18} />
                  </button>
                ))}

                <div style={{ flex: 1 }} />

                <button onClick={() => { setExpanded(false); setContent('') }} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>Cancel</button>
                <button onClick={handlePost} className="btn-primary" disabled={!content.trim() || posting} style={{
                  padding: '8px 20px', fontSize: 13, marginLeft: 8,
                  opacity: (!content.trim() || posting) ? 0.5 : 1,
                }}>
                  {posting ? '...' : 'Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
