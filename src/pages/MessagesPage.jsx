import { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import { useRealtimeStore } from '../stores/realtimeStore';
import { Send, MessageCircle } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const { newMessages, clearNewMessages } = useRealtimeStore();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const fetchConvs = async () => {
      const { data: parts } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);
      if (!parts?.length) return;
      const ids = parts.map(p => p.conversation_id);
      const { data } = await supabase
        .from('conversations')
        .select('*, participants:conversation_participants(user:profiles(*))')
        .in('id', ids)
        .order('last_message_at', { ascending: false });
      if (data) setConversations(data);
    };
    fetchConvs();
  }, [user]);

  useEffect(() => {
    if (!activeConv) return;
    supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('conversation_id', activeConv.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(prev => ({ ...prev, [activeConv.id]: data }));
      });
  }, [activeConv]);

  useEffect(() => {
    if (!newMessages.length || !activeConv) return;
    const relevant = newMessages.filter(m => m.conversation_id === activeConv.id);
    if (relevant.length) {
      setMessages(prev => ({
        ...prev,
        [activeConv.id]: [...(prev[activeConv.id] || []), ...relevant],
      }));
    }
    clearNewMessages();
  }, [newMessages, activeConv, clearNewMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConv]);

  const handleSend = async () => {
    if (!input.trim() || sending || !activeConv) return;
    setSending(true);
    const { data } = await supabase
      .from('messages')
      .insert({ conversation_id: activeConv.id, sender_id: user.id, content: input })
      .select('*, sender:profiles(*)')
      .single();
    if (data) {
      setMessages(prev => ({ ...prev, [activeConv.id]: [...(prev[activeConv.id] || []), data] }));
      setInput('');
      // Update conversation last message
      await supabase.from('conversations').update({ last_message: data.content, last_message_at: data.created_at }).eq('id', activeConv.id);
    }
    setSending(false);
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find(p => p.user?.id !== user?.id)?.user;
  };

  const currentMsgs = activeConv ? (messages[activeConv.id] || []) : [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', height: '100vh' }}>
        {/* Conversations list */}
        <div style={{ width: 300, borderRight: '1px solid var(--border-subtle)', overflowY: 'auto', background: 'var(--bg-secondary)' }}>
          <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px' }}>Messages</h2>
          </div>
          {conversations.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 14 }}>No conversations yet</div>
          ) : (
            conversations.map(conv => {
              const other = getOtherParticipant(conv);
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  style={{
                    padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center',
                    background: activeConv?.id === conv.id ? 'var(--bg-hover)' : 'transparent',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="avatar-placeholder" style={{ width: 40, height: 40, flexShrink: 0 }}>
                    {other?.display_name?.[0] || conv.name?.[0] || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{other?.display_name || conv.name || 'Group'}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.last_message || 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!activeConv ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: 12 }}>
              <MessageCircle size={48} style={{ opacity: 0.3 }} />
              <p>Select a conversation</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                <h3 style={{ fontWeight: 600 }}>{getOtherParticipant(activeConv)?.display_name || activeConv.name}</h3>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {currentMsgs.map(msg => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                      <div style={{
                        maxWidth: '70%', padding: '10px 14px', borderRadius: 16,
                        background: isMine ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                        color: isMine ? '#fff' : 'var(--text-primary)',
                        fontSize: 14, lineHeight: 1.5,
                      }}>
                        {!isMine && <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, opacity: 0.7 }}>{msg.sender?.display_name}</p>}
                        {msg.content}
                        <p style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10 }}>
                <input
                  className="input-field"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type a message..."
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" onClick={handleSend} disabled={sending || !input.trim()} style={{ padding: '0 16px' }}>
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
