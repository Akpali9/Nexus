import { useState, useRef, useEffect } from 'react'
import { Send, Phone, Video, MoreHorizontal, Bot, Search, Plus, Circle } from 'lucide-react'
import { MOCK_MESSAGES, MOCK_USERS } from '../store/appStore'

const AI_WELCOME = { id: 'ai-1', role: 'assistant', content: "Hey! I'm Nexus AI, your intelligent assistant. I can help with content ideas, answer questions, help draft posts, and much more. What's on your mind? ✨", time: 'now' }

function ConversationItem({ conv, active, onClick }) {
  return (
    <div onClick={() => onClick(conv)} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      cursor: 'pointer', borderRadius: 'var(--radius-md)',
      background: active ? 'var(--accent-glow)' : 'transparent',
      border: active ? '1px solid var(--border-accent)' : '1px solid transparent',
      transition: 'all 150ms', marginBottom: 2,
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {conv.isAI ? (
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-pink))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={20} color="white" />
          </div>
        ) : (
          <div className="avatar-placeholder" style={{ width: 44, height: 44, fontSize: 15 }}>{conv.user.initials}</div>
        )}
        {!conv.isAI && conv.user.online && <span className="online-indicator" />}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: conv.unread > 0 ? 600 : 400 }}>
            {conv.isAI ? 'Nexus AI' : conv.user.display_name}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{conv.time}</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMsg}</p>
      </div>
      {conv.unread > 0 && (
        <span style={{
          background: 'var(--accent-primary)', color: 'white', fontSize: 11, fontWeight: 700,
          borderRadius: 999, padding: '2px 6px', minWidth: 18, textAlign: 'center', flexShrink: 0,
        }}>{conv.unread}</span>
      )}
    </div>
  )
}

function Message({ msg, isOwn, isAI }) {
  return (
    <div style={{ display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row', gap: 8, marginBottom: 12 }}>
      {!isOwn && (
        isAI ? (
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-pink))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={15} color="white" />
          </div>
        ) : (
          <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: 11, flexShrink: 0 }}>
            {msg.initials || 'U'}
          </div>
        )
      )}
      <div style={{
        maxWidth: '70%',
        background: isOwn ? 'var(--accent-primary)' : isAI ? 'var(--bg-tertiary)' : 'var(--bg-tertiary)',
        borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '10px 14px',
        border: isAI && !isOwn ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
      }}>
        <p style={{ fontSize: 14, lineHeight: 1.5, color: isOwn ? 'white' : 'var(--text-primary)' }}>{msg.content}</p>
        <p style={{ fontSize: 10, color: isOwn ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', marginTop: 4 }}>{msg.time}</p>
      </div>
    </div>
  )
}

const CONV_LIST = [
  { id: 'ai', isAI: true, lastMsg: 'How can I help you today?', time: 'now', unread: 0 },
  ...MOCK_MESSAGES,
]

const SAMPLE_REPLIES = {
  'ai': [
    "That's a great question! I can help you craft engaging content for your audience.",
    "Here are some ideas for your next post: 1) Behind-the-scenes content, 2) Q&A sessions, 3) Tutorial videos 🎯",
    "Based on your profile, your audience is most active between 6-9 PM. Best time to post! 📊",
  ],
  'default': ["That sounds great! 🔥", "Can't wait to see it!", "Let's collab sometime 🤝"],
}

export default function MessagesPage() {
  const [activeConv, setActiveConv] = useState(CONV_LIST[0])
  const [messages, setMessages] = useState({ ai: [AI_WELCOME] })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeConv])

  const activeMessages = messages[activeConv.id] || [
    { id: '1', role: 'other', content: activeConv.lastMsg, time: activeConv.time, initials: activeConv.user?.initials }
  ]

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = { id: Date.now().toString(), role: 'user', content: input, time: 'now' }
    const convId = activeConv.id

    setMessages(prev => ({ ...prev, [convId]: [...(prev[convId] || []), userMsg] }))
    setInput('')
    setLoading(true)

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600))

    const replies = SAMPLE_REPLIES[convId === 'ai' ? 'ai' : 'default']
    const reply = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: replies[Math.floor(Math.random() * replies.length)],
      time: 'now',
      initials: activeConv.user?.initials,
    }
    setMessages(prev => ({ ...prev, [convId]: [...(prev[convId] || []), reply] }))
    setLoading(false)
  }

  const filteredConvs = CONV_LIST.filter(c =>
    c.isAI ? 'nexus ai'.includes(search.toLowerCase()) :
    c.user.display_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>
      {/* Conv list */}
      <div style={{ width: 320, borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Messages</h2>
            <button className="btn-icon"><Plus size={16} /></button>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input-field" placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filteredConvs.map(conv => (
            <ConversationItem key={conv.id} conv={conv} active={activeConv.id === conv.id} onClick={setActiveConv} />
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {activeConv.isAI ? (
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-pink))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={20} color="white" />
            </div>
          ) : (
            <div className="avatar-placeholder" style={{ width: 40, height: 40, fontSize: 14, position: 'relative' }}>
              {activeConv.user.initials}
              {activeConv.user.online && <span className="online-indicator" />}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: 15 }}>
              {activeConv.isAI ? 'Nexus AI' : activeConv.user.display_name}
            </p>
            <p style={{ fontSize: 12, color: 'var(--accent-green)' }}>
              {activeConv.isAI ? '🤖 AI Assistant · Always available' : activeConv.user.online ? 'Online now' : 'Last seen recently'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!activeConv.isAI && <>
              <button className="btn-icon"><Phone size={16} /></button>
              <button className="btn-icon"><Video size={16} /></button>
            </>}
            <button className="btn-icon"><MoreHorizontal size={16} /></button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          {activeMessages.map(msg => (
            <Message key={msg.id} msg={msg} isOwn={msg.role === 'user'} isAI={activeConv.isAI} />
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-pink))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Bot size={15} color="white" />
              </div>
              <div style={{
                padding: '12px 16px', background: 'var(--bg-tertiary)',
                borderRadius: '18px 18px 18px 4px', border: '1px solid var(--border-accent)',
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)',
                    animation: 'pulseLive 1.4s infinite', animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                className="input-field"
                placeholder={activeConv.isAI ? 'Ask Nexus AI anything...' : 'Send a message...'}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                style={{ borderRadius: 999, paddingRight: 50 }}
              />
            </div>
            <button onClick={handleSend} disabled={!input.trim() || loading} style={{
              width: 42, height: 42, borderRadius: '50%',
              background: input.trim() ? 'var(--accent-primary)' : 'var(--bg-active)',
              border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 150ms', flexShrink: 0,
            }}>
              <Send size={16} color={input.trim() ? 'white' : 'var(--text-muted)'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
