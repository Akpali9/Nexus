import { useState } from 'react'
import { Users, Plus, Search, Video, Phone, MessageCircle, Settings, Crown, Shield, Lock, Globe, Hash, Send, X, Mic, MicOff, VideoOff, VideoIcon, UserPlus } from 'lucide-react'
import { MOCK_USERS } from '../store/appStore'

const MOCK_GROUPS = [
  { id: '1', name: 'Creative Collective', description: 'Artists, designers & digital creators', members: 1247, icon: '🎨', color: '#7c5cfc', private: false, joined: true, messages: 89 },
  { id: '2', name: 'Dev Community NG', description: 'Nigerian developers & tech enthusiasts', members: 3891, icon: '💻', color: '#22d3a5', private: false, joined: true, messages: 12 },
  { id: '3', name: 'Music Producers Hub', description: 'Beat makers, singers & sound engineers', members: 654, icon: '🎵', color: '#f472b6', private: true, joined: false, messages: 0 },
  { id: '4', name: 'Nexus Streamers', description: 'Live streamers community', members: 2103, icon: '📡', color: '#fbbf24', private: false, joined: false, messages: 0 },
  { id: '5', name: 'Creator Economy', description: 'Monetize your content & grow revenue', members: 892, icon: '💰', color: '#60a5fa', private: false, joined: true, messages: 34 },
]

const GROUP_MSGS = [
  { id: '1', user: MOCK_USERS[0], content: 'Just dropped my new art series! Check the pinned post 🎨', time: '2m ago' },
  { id: '2', user: MOCK_USERS[1], content: 'Love it! The color palette is insane', time: '3m ago' },
  { id: '3', user: MOCK_USERS[2], content: 'Who else is live streaming tonight?', time: '8m ago' },
  { id: '4', user: MOCK_USERS[3], content: '@zara_art I am! Starting at 9PM', time: '10m ago' },
  { id: '5', user: MOCK_USERS[4], content: 'Collaboration post went live — check it out 🔥', time: '15m ago' },
]

function GroupCallModal({ group, onClose }) {
  const [muted, setMuted] = useState(false)
  const [camOn, setCamOn] = useState(true)
  const callParticipants = MOCK_USERS.slice(0, 4)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 300, display: 'flex', flexDirection: 'column' }} className="fade-in">
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 16 }}>{group.icon} {group.name} — Group Call</p>
          <p style={{ fontSize: 13, color: 'var(--accent-green)' }}>● {callParticipants.length} participants</p>
        </div>
        <button onClick={onClose} className="btn-icon"><X size={18} /></button>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, padding: 16, maxWidth: 800, margin: '0 auto', width: '100%' }}>
        {callParticipants.map((user, i) => (
          <div key={user.id} style={{
            borderRadius: 'var(--radius-xl)',
            background: `linear-gradient(135deg, hsl(${i * 70 + 220}deg, 50%, 18%), hsl(${i * 70 + 260}deg, 50%, 25%))`,
            border: i === 0 ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: 180, position: 'relative', overflow: 'hidden',
          }}>
            <div className="avatar-placeholder" style={{ width: 72, height: 72, fontSize: 24, marginBottom: 12 }}>{user.initials}</div>
            <p style={{ fontWeight: 600, fontSize: 14 }}>{user.display_name}</p>
            <p style={{ fontSize: 12, color: 'var(--accent-green)', marginTop: 4 }}>● Speaking</p>
            {i === 0 && (
              <span style={{ position: 'absolute', top: 10, left: 10, background: 'var(--accent-primary)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>YOU</span>
            )}
          </div>
        ))}
      </div>

      {/* Call controls */}
      <div style={{ padding: '20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'center', gap: 16 }}>
        {[
          { icon: muted ? MicOff : Mic, label: muted ? 'Unmute' : 'Mute', action: () => setMuted(!muted), active: !muted, color: 'var(--accent-primary)' },
          { icon: camOn ? VideoIcon : VideoOff, label: camOn ? 'Cam Off' : 'Cam On', action: () => setCamOn(!camOn), active: camOn, color: 'var(--accent-blue)' },
          { icon: UserPlus, label: 'Invite', action: () => {}, active: true, color: 'var(--accent-green)' },
          { icon: X, label: 'Leave', action: onClose, active: false, color: 'var(--accent-red)' },
        ].map(({ icon: Icon, label, action, active, color }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <button onClick={action} style={{
              width: 56, height: 56, borderRadius: '50%',
              background: label === 'Leave' ? 'rgba(248,113,113,0.2)' : active ? `${color}22` : 'var(--bg-tertiary)',
              border: `1px solid ${label === 'Leave' ? 'rgba(248,113,113,0.4)' : active ? `${color}55` : 'var(--border-subtle)'}`,
              color: label === 'Leave' ? 'var(--accent-red)' : active ? color : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 150ms',
            }}>
              <Icon size={22} />
            </button>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function GroupChat({ group, onClose }) {
  const { groupMessages, emit } = useRealtime();
  const [messages, setMessages] = useState(GROUP_MSGS);
  const [input, setInput] = useState('');
  const [showCall, setShowCall] = useState(false);

  useEffect(() => {
    const newGroupMsgs = groupMessages[group.id] || [];
    if (newGroupMsgs.length) {
      setMessages(prev => [...prev, ...newGroupMsgs]);
    }
  }, [groupMessages, group.id]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      user: { initials: 'YO', display_name: 'You', username: 'your_handle' },
      content: input,
      time: 'just now',
    };
    setMessages(prev => [...prev, newMsg]);
    emit('new_group_message', { groupId: group.id, ...newMsg });
    setInput('');
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${group.color}22`, border: `1px solid ${group.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {group.icon}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{group.name}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{group.members.toLocaleString()} members</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowCall(true)} className="btn-icon" title="Group Call"><Video size={16} /></button>
            <button className="btn-icon" title="Voice Call"><Phone size={16} /></button>
            <button onClick={onClose} className="btn-icon"><X size={16} /></button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '4px 12px', borderRadius: 999 }}>Today</span>
          </div>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', gap: 10 }}>
              <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: 12, flexShrink: 0 }}>{msg.user.initials}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{msg.user.display_name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{msg.time}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input className="input-field" placeholder={`Message ${group.name}...`} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} style={{ borderRadius: 999 }} />
            <button onClick={handleSend} style={{ width: 38, height: 38, borderRadius: '50%', background: input.trim() ? 'var(--accent-primary)' : 'var(--bg-active)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 150ms' }}>
              <Send size={15} color={input.trim() ? 'white' : 'var(--text-muted)'} />
            </button>
          </div>
        </div>
      </div>
      {showCall && <GroupCallModal group={group} onClose={() => setShowCall(false)} />}
    </>
  )
}

function GroupCard({ group, onClick }) {
  const [joined, setJoined] = useState(group.joined)

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)', overflow: 'hidden',
      transition: 'transform 150ms, border-color 150ms', cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--border-default)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
    >
      <div style={{ height: 80, background: `linear-gradient(135deg, ${group.color}33, ${group.color}11)`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '12px', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, borderRadius: 14, background: `${group.color}22`, border: `2px solid ${group.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
          {group.icon}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {group.private && <span style={{ background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: 10, padding: '3px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={9} /> Private</span>}
          {group.messages > 0 && <span style={{ background: 'var(--accent-primary)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>{group.messages}</span>}
        </div>
      </div>

      <div style={{ padding: '12px 16px 16px' }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{group.name}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.4 }}>{group.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={12} /> {group.members.toLocaleString()} members
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {joined && (
              <button onClick={e => { e.stopPropagation(); onClick(group) }} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, background: 'var(--accent-glow)', color: 'var(--accent-primary)', border: '1px solid var(--border-accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MessageCircle size={12} /> Open
              </button>
            )}
            <button onClick={e => { e.stopPropagation(); setJoined(!joined) }} style={{
              padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
              background: joined ? 'transparent' : 'var(--accent-primary)',
              color: joined ? 'var(--text-muted)' : 'white',
              border: joined ? '1px solid var(--border-default)' : 'none',
              cursor: 'pointer', transition: 'all 150ms',
            }}>
              {joined ? 'Joined' : group.private ? '🔒 Request' : 'Join'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GroupsPage() {
  const [activeGroup, setActiveGroup] = useState(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')

  const filteredGroups = MOCK_GROUPS.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) &&
    (tab === 'all' || (tab === 'joined' && g.joined))
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Groups list */}
      <div style={{ flex: activeGroup ? '0 0 420px' : '1', display: 'flex', flexDirection: 'column', borderRight: activeGroup ? '1px solid var(--border-subtle)' : 'none', overflow: 'hidden' }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>
              <span className="gradient-text">Groups</span>
            </h1>
            <button className="btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>
              <Plus size={15} /> Create
            </button>
          </div>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input-field" placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
            {['all', 'joined'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '6px', borderRadius: 6, fontSize: 13,
                background: tab === t ? 'var(--bg-card)' : 'transparent',
                color: tab === t ? 'var(--accent-primary)' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer', fontWeight: tab === t ? 600 : 400, textTransform: 'capitalize',
              }}>{t === 'all' ? 'Discover' : 'My Groups'}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {activeGroup ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredGroups.map(group => (
                <div key={group.id} onClick={() => setActiveGroup(group)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: activeGroup?.id === group.id ? 'var(--accent-glow)' : 'transparent',
                  border: activeGroup?.id === group.id ? '1px solid var(--border-accent)' : '1px solid transparent',
                  transition: 'all 150ms',
                }}
                  onMouseEnter={e => { if (activeGroup?.id !== group.id) e.currentTarget.style.background = 'var(--bg-hover)' }}
                  onMouseLeave={e => { if (activeGroup?.id !== group.id) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${group.color}22`, border: `1px solid ${group.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {group.icon}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ fontWeight: 600, fontSize: 13 }} className="truncate">{group.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{group.members.toLocaleString()} members</p>
                  </div>
                  {group.messages > 0 && <span style={{ background: 'var(--accent-primary)', color: 'white', fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '2px 6px', flexShrink: 0 }}>{group.messages}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {filteredGroups.map(group => (
                <GroupCard key={group.id} group={group} onClick={setActiveGroup} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Group chat */}
      {activeGroup && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} className="slide-in-right">
          <GroupChat group={activeGroup} onClose={() => setActiveGroup(null)} />
        </div>
      )}
    </div>
  )
}
