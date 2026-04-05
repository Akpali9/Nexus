import { useState, useEffect } from 'react';
import { Users, Plus, Search, Video, Phone, MessageCircle, Lock, Send, X } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import { useRealtimeStore, initRealtimeSubscriptions } from '../stores/realtimeStore';

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
  return (
    <div className="card" style={{ cursor: 'pointer', overflow: 'hidden' }} onClick={() => onClick(group)}>
      <div style={{ height: 80, background: `linear-gradient(135deg, ${group.color}33, ${group.color}11)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 12px' }}>
        <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, borderRadius: 14, background: `${group.color}22`, border: `2px solid ${group.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{group.icon}</div>
        {group.is_private && <span style={{ background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: 10, padding: '3px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={9} /> Private</span>}
      </div>
      <div style={{ padding: '12px 16px 16px' }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{group.name}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.4 }}>{group.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> {group.member_count} members</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {joined && <button onClick={(e) => { e.stopPropagation(); onClick(group); }} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, background: 'var(--accent-glow)', color: 'var(--accent-primary)', border: '1px solid var(--border-accent)', cursor: 'pointer' }}><MessageCircle size={12} /> Open</button>}
            <button onClick={handleJoin} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, background: joined ? 'transparent' : 'var(--accent-primary)', color: joined ? 'var(--text-muted)' : 'white', border: joined ? '1px solid var(--border-default)' : 'none', cursor: 'pointer' }}>{joined ? 'Joined' : group.is_private ? '🔒 Request' : 'Join'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupChat({ group, onClose }) {
  const { user } = useAuthStore();
  const groupMessages = useRealtimeStore((state) => state.groupMessages);
  const emit = useRealtimeStore((state) => state.emit);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showCall, setShowCall] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase.from('group_messages').select('*, user:profiles(*)').eq('group_id', group.id).order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();
  }, [group.id]);

  useEffect(() => {
    const newMsgs = groupMessages[group.id] || [];
    if (newMsgs.length) setMessages((prev) => [...prev, ...newMsgs]);
  }, [groupMessages, group.id]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const { data, error } = await supabase.from('group_messages').insert({ group_id: group.id, user_id: user.id, content: input }).select('*, user:profiles(*)').single();
    if (data) {
      setMessages((prev) => [...prev, data]);
      emit('new_group_message', data);
      setInput('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${group.color}22`, border: `1px solid ${group.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{group.icon}</div>
        <div style={{ flex: 1 }}><p style={{ fontWeight: 700 }}>{group.name}</p><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{group.member_count} members</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowCall(true)} className="btn-icon"><Video size={16} /></button>
          <button className="btn-icon"><Phone size={16} /></button>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', gap: 10 }}>
            <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: 12 }}>{msg.user?.display_name?.[0]}</div>
            <div><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><span style={{ fontWeight: 600, fontSize: 13 }}>{msg.user?.display_name}</span><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(msg.created_at).toLocaleTimeString()}</span></div><p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{msg.content}</p></div>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input-field" placeholder={`Message ${group.name}...`} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} style={{ borderRadius: 999 }} />
          <button onClick={handleSend} className="btn-primary" style={{ width: 38, height: 38, borderRadius: '50%', padding: 0, justifyContent: 'center' }}><Send size={15} /></button>
        </div>
      </div>
      {showCall && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCall(false)}>
          <div className="card" style={{ padding: 24, textAlign: 'center' }}><p>Group call feature coming soon</p><button onClick={() => setShowCall(false)} className="btn-primary" style={{ marginTop: 16 }}>Close</button></div>
        </div>
      )}
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
    initRealtimeSubscriptions(user.id);
    const fetchGroups = async () => {
      const { data: allGroups } = await supabase.from('groups').select('*, group_members(user_id)').order('created_at', { ascending: false });
      if (allGroups) {
        const { data: myMemberships } = await supabase.from('group_members').select('group_id').eq('user_id', user.id);
        const joinedIds = new Set(myMemberships?.map((m) => m.group_id) || []);
        const enriched = allGroups.map((g) => ({ ...g, member_count: g.group_members?.length || 0, joined: joinedIds.has(g.id), currentUserId: user.id, icon: g.icon || '👥', color: g.color || '#7c5cfc' }));
        setGroups(enriched);
      }
    };
    fetchGroups();
    const subscription = supabase.channel('groups-channel').on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => fetchGroups()).subscribe();
    return () => subscription.unsubscribe();
  }, [user]);

  const filteredGroups = groups.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    if (tab === 'joined') return matchesSearch && g.joined;
    return matchesSearch;
  });

  const handleJoinToggle = (groupId, joined) => setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, joined } : g)));

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: activeGroup ? '0 0 420px' : '1', display: 'flex', flexDirection: 'column', borderRight: activeGroup ? '1px solid var(--border-subtle)' : 'none', overflow: 'hidden' }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}><span className="gradient-text">Groups</span></h1>
            <button className="btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}><Plus size={15} /> Create</button>
          </div>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input-field" placeholder="Search groups..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
            {['all', 'joined'].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '6px', borderRadius: 6, fontSize: 13, background: tab === t ? 'var(--bg-card)' : 'transparent', color: tab === t ? 'var(--accent-primary)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: tab === t ? 600 : 400, textTransform: 'capitalize' }}>{t === 'all' ? 'Discover' : 'My Groups'}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {activeGroup ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredGroups.map((group) => (
                <div key={group.id} onClick={() => setActiveGroup(group)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: activeGroup?.id === group.id ? 'var(--accent-glow)' : 'transparent', border: activeGroup?.id === group.id ? '1px solid var(--border-accent)' : '1px solid transparent' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${group.color}22`, border: `1px solid ${group.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{group.icon}</div>
                  <div style={{ flex: 1, overflow: 'hidden' }}><p className="truncate" style={{ fontWeight: 600, fontSize: 13 }}>{group.name}</p><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{group.member_count} members</p></div>
                  {group.unread_count > 0 && <span style={{ background: 'var(--accent-primary)', color: 'white', fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '2px 6px' }}>{group.unread_count}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {filteredGroups.map((group) => <GroupCard key={group.id} group={group} onClick={setActiveGroup} onJoinToggle={handleJoinToggle} />)}
            </div>
          )}
        </div>
      </div>
      {activeGroup && <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} className="slide-in-right"><GroupChat group={activeGroup} onClose={() => setActiveGroup(null)} /></div>}
    </div>
  );
}
