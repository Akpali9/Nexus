import { useState } from 'react'
import { Plus, X, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { MOCK_STORIES, MOCK_USERS } from '../../store/appStore'

function StoryRing({ story, onClick }) {
  const colors = ['#7c5cfc', '#f472b6', '#22d3a5', '#fbbf24', '#60a5fa']
  const color = colors[parseInt(story.id) % colors.length]
  return (
    <div onClick={() => onClick(story)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        padding: 2,
        background: story.viewed ? 'var(--border-strong)' : `conic-gradient(${color}, ${color}80, ${color})`,
        transition: 'transform 150ms ease',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: 'var(--bg-secondary)', padding: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="avatar-placeholder" style={{ width: '100%', height: '100%', fontSize: 16 }}>
            {story.user.initials}
          </div>
        </div>
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)', maxWidth: 64, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {story.user.display_name.split(' ')[0]}
      </span>
    </div>
  )
}

function StoryViewer({ story, onClose }) {
  const [reacted, setReacted] = useState(false)
  const gradients = [
    'linear-gradient(135deg, #7c5cfc, #f472b6)',
    'linear-gradient(135deg, #22d3a5, #60a5fa)',
    'linear-gradient(135deg, #fbbf24, #f87171)',
    'linear-gradient(135deg, #f472b6, #fbbf24)',
  ]
  const bg = gradients[parseInt(story.id) % gradients.length]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 380, height: 680, borderRadius: 24,
        background: bg, position: 'relative', overflow: 'hidden',
      }}>
        {/* Progress bar */}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 1 }}>
          <div style={{ width: '60%', height: '100%', background: 'white', borderRadius: 1 }} />
        </div>

        {/* Header */}
        <div style={{ position: 'absolute', top: 24, left: 16, right: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: 13, flexShrink: 0 }}>{story.user.initials}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{story.user.display_name}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>2 hours ago</p>
          </div>
          <button onClick={onClose} style={{ color: 'white', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'white', textAlign: 'center', padding: 32, textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
            {story.user.display_name}'s Story ✨
          </p>
        </div>

        {/* Reactions */}
        <div style={{ position: 'absolute', bottom: 24, left: 16, right: 16 }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {['❤️', '🔥', '😍', '👏', '😂'].map(emoji => (
              <button key={emoji} onClick={() => setReacted(emoji)}
                style={{
                  fontSize: 24, background: reacted === emoji ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                  border: 'none', borderRadius: '50%', width: 44, height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 150ms, background 150ms', cursor: 'pointer',
                  transform: reacted === emoji ? 'scale(1.2)' : 'scale(1)',
                }}>
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StoriesBar() {
  const [activeStory, setActiveStory] = useState(null)

  return (
    <>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)', padding: '16px',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {/* Add story */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              border: '2px dashed var(--border-strong)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-tertiary)', transition: 'all 150ms',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.background = 'var(--accent-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-tertiary)' }}
            >
              <Plus size={24} color="var(--accent-primary)" />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Add Story</span>
          </div>

          {MOCK_STORIES.map(story => (
            <StoryRing key={story.id} story={story} onClick={setActiveStory} />
          ))}
        </div>
      </div>

      {activeStory && <StoryViewer story={activeStory} onClose={() => setActiveStory(null)} />}
    </>
  )
}
