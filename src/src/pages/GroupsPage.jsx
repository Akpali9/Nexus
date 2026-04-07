import { useState, useEffect, useRef } from 'react';
import { Users, Plus, Search, Video, Phone, MessageCircle, Lock, Send, X } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import { useRealtimeStore } from '../stores/realtimeStore';
import Sidebar from '../components/layout/Sidebar';

function GroupCard({ group, onClick, onJoinToggle }) {
  const [joined, setJoined] = useState(group.joined);

  const handleJoin = async (e) => {
    e.stopPropagation();
    if (joined) {
      await supabase.from('group_members').delete().eq('group_id', group.id).eq('user_id', group.currentUserId);
      setJoined(false);
      onJoinToggle(group.id, false);
    } else {
      await supabase.from('group_members').insert({ group_id: group.id, user_id: group.currentUserId });
      setJoined(true);
      onJoinToggle(group.id, true);
    }
  };

  const color = '#7c5cfc';
  return (
    <div className="card" style={{ cursor: 'pointer', overflow: 'hidden' }} onClick={() => onClick(group)}>
      <div style={{ height: 80, background: `linear-gradient(135deg, ${color}33, ${color}11)`, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}22`, border: `2px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
          👥
        </div>
        {group.is_private && (
          <span style={{ marginLeft: 'auto', background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: 10, padding: '3px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Lock size={9} /> Private
          </span>
        )}
      </div>
      <div style={{ padding: '12px 16px 16px' }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{group.name}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.4 }}>{group.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={12} /> {group.member_count} members
          </span>
          <button onClick={handleJoin} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, background: joined ? 'transparent' : 'var(--accent-primary)', color: joined ? 'var(--text-muted)' : 'white', border: joined ? '1px solid var(--border-default)' : 'none', cursor: 'pointer' }}>
            {joined ? 'Joined' : group.is_private ? '🔒 Request' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupChat({ group, onClose }) {
  const { user } = useAuthStore();
  const groupMessages = useRealtimeStore(s => s.groupMessages);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    supabase
      .from('group_messages')
      .select('*, user:profiles(*)')
      .eq('group_id', group.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setMessages(data); });
  }, [group.id]);

  useEffect(() => {
    const newMsgs = groupMessages[group.id];
    if (newMsgs?.length) setMessages(prev => [...prev, ...newMsgs]);
  }, [groupMessages, group.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const { data } = await supabase
      .from('group_messages')
      .insert({ group_id: group.id, user_id: user.id, content: input })
      .select('*, user:profiles(*)')
      .single();
    if (data) { setMessages(prev => [...prev, data]); setInput(''); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-glow)', border: '1px solid var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👥</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700 }}>{group.name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{group.member_count} members</p>
        </div>
        <button onClick={onClose} className="btn-icon"><X size={16} /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', gap: 10 }}>
            <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: 12 }}>{msg.user?.display_name?.[0]}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{msg.user?.display_name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(msg.created_at).toLocaleTimeString()}</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
        <input className="input-field" placeholder={`Message ${group.name}...`} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} style={{ borderRadius: 999 }} />
        <button onClick={handleSend} className="btn-primary" style={{ width: 38, height: 38, borderRadius: '50%', padding: 0, justifyContent: 'center', flexShrink: 0 }}><Send size={15} /></button>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  useEffect(() => {
    if (!user) return;
    const fetchGroups = async () => {
      const { data: allGroups } = await supabase.from('groups').select('*, group_members(user_id)').order('created_at', { ascending: false });
      if (allGroups) {
        const { data: myMemberships } = await supabase.from('group_members').select('group_id').eq('user_id', user.id);
        const joinedIds = new Set(myMemberships?.map(m => m.group_id) || []);
        const enriched = allGroups.map(g => ({
          ...g,
          member_count: g.group_members?.length || 0,
          joined: joinedIds.has(g.id),
          currentUserId: user.id,
        }));
        setGroups(enriched);
      }
    };
    fetchGroups();
    const sub = supabase.channel('groups-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, fetchGroups).subscribe();
    return () => sub.unsubscribe();
  }, [user]);

  const filtered = groups.filter(g => {
    const matchesSearch = g.name?.toLowerCase().includes(search.toLowerCase());
    if (tab === 'joined') return matchesSearch && g.joined;
    return matchesSearch;
  });

  const handleJoinToggle = (groupId, joined) =>
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, joined } : g));

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', height: '100vh' }}>
        {/* Groups list */}
        <div style={{ width: activeGroup ? 360 : '100%', borderRight: activeGroup ? '1px solid var(--border-subtle)' : 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}><span className="gradient-text">Groups</span></h1>
              <button className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}><Plus size={14} /> Create</button>
            </div>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input-field" placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
            </div>
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-tertiary)', borderRadius: 8, padding: 3 }}>
              {['all', 'joined'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '6px', borderRadius: 6, fontSize: 13, background: tab === t ? 'var(--bg-card)' : 'transparent', color: tab === t ? 'var(--accent-primary)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: tab === t ? 600 : 400, textTransform: 'capitalize' }}>
                  {t === 'all' ? 'Discover' : 'My Groups'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {activeGroup ? (
              filtered.map(g => (
                <div key={g.id} onClick={() => setActiveGroup(g)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, cursor: 'pointer', background: activeGroup?.id === g.id ? 'var(--accent-glow)' : 'transparent', border: activeGroup?.id === g.id ? '1px solid var(--border-accent)' : '1px solid transparent', marginBottom: 4 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👥</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.member_count} members</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {filtered.map(g => <GroupCard key={g.id} group={g} onClick={setActiveGroup} onJoinToggle={handleJoinToggle} />)}
              </div>
            )}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p>{tab === 'joined' ? "You haven't joined any groups yet" : 'No groups found'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat panel */}
        {activeGroup && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <GroupChat group={activeGroup} onClose={() => setActiveGroup(null)} />
          </div>
        )}
      </main>
    </div>
  );
}
