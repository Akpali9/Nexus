import { useState, useEffect } from 'react'
import { Radio, Users, Heart, Gift, MessageCircle, X, Settings, Share2, Eye, Mic, MicOff, VideoIcon, VideoOff, Monitor, Volume2 } from 'lucide-react'
import { MOCK_LIVE_STREAMS, MOCK_USERS } from '../store/appStore'

const LIVE_CHAT_MSGS = [
  { user: 'aria_chen', msg: 'This is insane 🔥', color: '#7c5cfc', time: 0 },
  { user: 'zara_art', msg: 'Love the energy!!', color: '#f472b6', time: 2 },
  { user: 'nx_kai', msg: 'First time watching, amazing 👏', color: '#22d3a5', time: 4 },
  { user: 'luna_beats', msg: 'That bassline tho 😍', color: '#fbbf24', time: 6 },
  { user: 'dev_marcos', msg: 'Quality is top tier 💯', color: '#60a5fa', time: 8 },
  { user: 'viewer_x', msg: 'More of this please!!', color: '#f87171', time: 10 },
]

function LiveChatMessage({ msg }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        background: msg.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700, color: 'white',
      }}>
        {msg.user[0].toUpperCase()}
      </div>
      <div>
        <span style={{ fontSize: 12, fontWeight: 600, color: msg.color }}>{msg.user} </span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{msg.msg}</span>
      </div>
    </div>
  )
}

function StreamCard({ stream, onClick }) {
  return (
    <div onClick={() => onClick(stream)} style={{
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      border: '1px solid var(--border-subtle)', cursor: 'pointer',
      transition: 'transform 150ms, border-color 150ms',
      background: 'var(--bg-card)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--border-accent)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
    >
      <div style={{
        height: 160, background: `linear-gradient(135deg, hsl(${parseInt(stream.id) * 60 + 200}deg, 70%, 20%), hsl(${parseInt(stream.id) * 60 + 260}deg, 70%, 30%))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        <span style={{ fontSize: 48 }}>{['🎵', '🎨', '🎮'][parseInt(stream.id) - 1]}</span>
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span className="badge badge-live"><div className="live-dot" style={{ width: 6, height: 6 }} /> LIVE</span>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 999 }}>
          <Eye size={11} color="white" />
          <span style={{ fontSize: 11, color: 'white', fontWeight: 600 }}>{stream.viewers.toLocaleString()}</span>
        </div>
      </div>
      <div style={{ padding: '12px' }}>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{stream.title}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="avatar-placeholder" style={{ width: 24, height: 24, fontSize: 9 }}>{stream.user.initials}</div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{stream.user.display_name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{stream.category}</span>
        </div>
      </div>
    </div>
  )
}

function StreamViewer({ stream, onClose }) {
  const [chatMessages, setChatMessages] = useState(LIVE_CHAT_MSGS.slice(0, 3))
  const [input, setInput] = useState('')
  const [muted, setMuted] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 500) + 100)

  useEffect(() => {
    const interval = setInterval(() => {
      const msg = LIVE_CHAT_MSGS[Math.floor(Math.random() * LIVE_CHAT_MSGS.length)]
      setChatMessages(prev => [...prev.slice(-30), { ...msg, id: Date.now() }])
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleSend = () => {
    if (!input.trim()) return
    setChatMessages(prev => [...prev, { user: 'you', msg: input, color: '#7c5cfc', id: Date.now() }])
    setInput('')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 200, display: 'flex' }} className="fade-in">
      {/* Stream */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '100%', maxWidth: 900, aspectRatio: '16/9',
          background: `linear-gradient(135deg, hsl(${parseInt(stream.id) * 60 + 200}deg, 70%, 15%), hsl(${parseInt(stream.id) * 60 + 260}deg, 70%, 25%))`,
          borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <span style={{ fontSize: 80 }}>{['🎵', '🎨', '🎮'][parseInt(stream.id) - 1]}</span>
          {/* Controls overlay */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-live"><div className="live-dot" style={{ width: 6, height: 6 }} /> LIVE</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: 999 }}>
                  <Eye size={11} color="white" />
                  <span style={{ fontSize: 11, color: 'white', fontWeight: 600 }}>{stream.viewers.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{stream.title}</p>
              </div>
              <button onClick={() => setMuted(!muted)} className="btn-icon" style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none' }}>
                {muted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button className="btn-icon" style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none' }}>
                <Volume2 size={16} />
              </button>
            </div>
          </div>
          {/* Close */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none',
            borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => { setLiked(!liked); setLikeCount(l => liked ? l - 1 : l + 1) }} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#f87171' : 'white',
          }}>
            <Heart size={28} fill={liked ? '#f87171' : 'none'} />
            <span style={{ fontSize: 11 }}>{likeCount}</span>
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
            <Gift size={28} />
            <span style={{ fontSize: 11 }}>Gift</span>
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
            <Share2 size={28} />
            <span style={{ fontSize: 11 }}>Share</span>
          </button>
        </div>
      </div>

      {/* Live Chat */}
      <div style={{ width: 320, background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: 13 }}>{stream.user.initials}</div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{stream.user.display_name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stream.category}</p>
            </div>
            <button className="btn-primary" style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: 12 }}>Follow</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {chatMessages.map((msg, i) => <LiveChatMessage key={msg.id || i} msg={msg} />)}
        </div>
        <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
          <input className="input-field" placeholder="Say something..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} style={{ borderRadius: 999 }} />
          <button onClick={handleSend} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MessageCircle size={16} color="white" />
          </button>
        </div>
      </div>
    </div>
  )
}

function GoLiveModal({ onClose }) {
  const [streaming, setStreaming] = useState(false)
  const [title, setTitle] = useState('')
  const [viewers, setViewers] = useState(0)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

  useEffect(() => {
    if (!streaming) return
    const interval = setInterval(() => setViewers(v => v + Math.floor(Math.random() * 5)), 2000)
    return () => clearInterval(interval)
  }, [streaming])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 520, background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-default)', overflow: 'hidden' }} className="fade-in">
        {/* Preview */}
        <div style={{ height: 240, background: 'linear-gradient(135deg, #1a1a2e, #16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {camOn ? (
            <div style={{ textAlign: 'center' }}>
              <div className="avatar-placeholder" style={{ width: 80, height: 80, fontSize: 28, margin: '0 auto 12px' }}>YO</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Camera Preview</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              <VideoOff size={40} />
              <p style={{ marginTop: 8, fontSize: 13 }}>Camera off</p>
            </div>
          )}
          {streaming && (
            <div style={{ position: 'absolute', top: 16, left: 16 }}>
              <span className="badge badge-live"><div className="live-dot" style={{ width: 6, height: 6 }} /> LIVE · {viewers} watching</span>
            </div>
          )}
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {!streaming && (
            <>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Start Streaming</h3>
              <input className="input-field" placeholder="Stream title..." value={title} onChange={e => setTitle(e.target.value)} style={{ marginBottom: 12 }} />
            </>
          )}

          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button onClick={() => setMicOn(!micOn)} style={{
              flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
              background: micOn ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
              color: micOn ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: micOn ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 500,
            }}>
              {micOn ? <Mic size={16} /> : <MicOff size={16} />}
              {micOn ? 'Mic On' : 'Mic Off'}
            </button>
            <button onClick={() => setCamOn(!camOn)} style={{
              flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
              background: camOn ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
              color: camOn ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: camOn ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 500,
            }}>
              {camOn ? <VideoIcon size={16} /> : <VideoOff size={16} />}
              {camOn ? 'Cam On' : 'Cam Off'}
            </button>
            <button style={{
              flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 500,
            }}>
              <Monitor size={16} /> Screen
            </button>
          </div>

          {streaming ? (
            <button onClick={() => setStreaming(false)} style={{
              width: '100%', padding: '12px', borderRadius: 999,
              background: 'rgba(248,113,113,0.2)', color: 'var(--accent-red)',
              border: '1px solid rgba(248,113,113,0.4)', cursor: 'pointer', fontSize: 15, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <div className="live-dot" /> End Stream
            </button>
          ) : (
            <button onClick={() => setStreaming(true)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '12px' }}>
              <Radio size={18} /> Go Live
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LivePage() {
  const [watchingStream, setWatchingStream] = useState(null)
  const [showGoLive, setShowGoLive] = useState(false)

  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28 }}>
          Live <span className="gradient-text">Streams</span>
        </h1>
        <button onClick={() => setShowGoLive(true)} className="btn-primary" style={{ gap: 8 }}>
          <div className="live-dot" /> Go Live
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {MOCK_LIVE_STREAMS.map(stream => (
          <StreamCard key={stream.id} stream={stream} onClick={setWatchingStream} />
        ))}
      </div>

      {watchingStream && <StreamViewer stream={watchingStream} onClose={() => setWatchingStream(null)} />}
      {showGoLive && <GoLiveModal onClose={() => setShowGoLive(false)} />}
    </div>
  )
}
