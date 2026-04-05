import { useState, useEffect } from 'react';
import { Radio, Eye, Heart, Gift, MessageCircle, X, Mic, MicOff, Volume2, Share2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import { useRealtimeStore, initRealtimeSubscriptions } from '../stores/realtimeStore';

// LiveChatMessage component (same as before)
function LiveChatMessage({ msg }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
      <div className="avatar-placeholder" style={{ width: 24, height: 24, fontSize: 10 }}>
        {msg.user?.display_name?.[0] || '?'}
      </div>
      <div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-primary)' }}>
          {msg.user?.display_name}{' '}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{msg.message}</span>
      </div>
    </div>
  );
}

function StreamCard({ stream, onClick }) {
  const liveViewers = useRealtimeStore((state) => state.liveViewers);
  const viewers = liveViewers[stream.id] ?? stream.viewers;

  return (
    <div onClick={() => onClick(stream)} className="card" style={{ cursor: 'pointer', overflow: 'hidden' }}>
      <div style={{ height: 160, background: `linear-gradient(135deg, hsl(${parseInt(stream.id) * 60 + 200}deg, 70%, 20%), hsl(${parseInt(stream.id) * 60 + 260}deg, 70%, 30%))`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 48 }}>🎥</span>
        <div style={{ position: 'absolute', top: 10, left: 10 }}><span className="badge badge-live">LIVE</span></div>
        <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Eye size={12} /> {viewers}
        </div>
      </div>
      <div style={{ padding: 12 }}>
        <p style={{ fontWeight: 600 }}>{stream.title}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stream.user?.display_name}</p>
      </div>
    </div>
  );
}

function StreamViewer({ stream, onClose }) {
  const { user } = useAuthStore();
  const liveViewers = useRealtimeStore((state) => state.liveViewers);
  const liveChatMessages = useRealtimeStore((state) => state.liveChatMessages);
  const emit = useRealtimeStore((state) => state.emit);
  const [chatMessages, setChatMessages] = useState([]);
  const [viewerCount, setViewerCount] = useState(stream.viewers);
  const [input, setInput] = useState('');
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 500) + 100);

  useEffect(() => {
    setViewerCount(liveViewers[stream.id] ?? stream.viewers);
  }, [liveViewers, stream.id]);

  useEffect(() => {
    setChatMessages((prev) => [...prev, ...liveChatMessages]);
  }, [liveChatMessages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const { data, error } = await supabase
      .from('live_chat_messages')
      .insert({
        stream_id: stream.id,
        user_id: user.id,
        message: input,
      })
      .select('*, user:profiles(*)')
      .single();
    if (data) {
      emit('live_chat_message', data);
      setInput('');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 200, display: 'flex' }} className="fade-in">
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 900, aspectRatio: '16/9', background: `linear-gradient(135deg, hsl(${parseInt(stream.id) * 60 + 200}deg, 70%, 15%), hsl(${parseInt(stream.id) * 60 + 260}deg, 70%, 25%))`, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <span style={{ fontSize: 80 }}>🎥</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-live">LIVE</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: 999 }}>
                  <Eye size={11} /> {viewerCount}
                </div>
              </div>
              <div style={{ flex: 1 }}><p style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{stream.title}</p></div>
              <button onClick={() => setMuted(!muted)} className="btn-icon" style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none' }}>{muted ? <MicOff size={16} /> : <Mic size={16} />}</button>
              <button className="btn-icon" style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none' }}><Volume2 size={16} /></button>
            </div>
          </div>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => { setLiked(!liked); setLikeCount((l) => (liked ? l - 1 : l + 1)); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#f87171' : 'white' }}>
            <Heart size={28} fill={liked ? '#f87171' : 'none'} /><span style={{ fontSize: 11 }}>{likeCount}</span>
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
            <Gift size={28} /><span style={{ fontSize: 11 }}>Gift</span>
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
            <Share2 size={28} /><span style={{ fontSize: 11 }}>Share</span>
          </button>
        </div>
      </div>
      <div style={{ width: 320, background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: 13 }}>{stream.user?.display_name?.[0]}</div>
            <div><p style={{ fontWeight: 600, fontSize: 14 }}>{stream.user?.display_name}</p><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stream.category}</p></div>
            <button className="btn-primary" style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: 12 }}>Follow</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {chatMessages.map((msg) => <LiveChatMessage key={msg.id} msg={msg} />)}
        </div>
        <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
          <input className="input-field" placeholder="Say something..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} style={{ borderRadius: 999 }} />
          <button onClick={handleSend} className="btn-primary" style={{ width: 36, height: 36, borderRadius: '50%', padding: 0, justifyContent: 'center' }}><MessageCircle size={16} /></button>
        </div>
      </div>
    </div>
  );
}

function GoLiveModal({ onClose }) {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [streaming, setStreaming] = useState(false);

  const startStream = async () => {
    if (!title.trim()) return;
    const { data, error } = await supabase.from('live_streams').insert({ user_id: user.id, title, category, viewers: 0, is_live: true }).select('*, user:profiles(*)').single();
    if (data) {
      setStreaming(true);
      setTimeout(() => onClose(), 2000);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="card fade-in" style={{ width: 480, padding: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Go Live</h3>
        <input className="input-field" placeholder="Stream title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 12 }} />
        <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} style={{ marginBottom: 20 }}>
          <option>General</option><option>Music</option><option>Art</option><option>Gaming</option><option>Talk Show</option>
        </select>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button onClick={startStream} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}><Radio size={16} /> Start Stream</button>
        </div>
        {streaming && <p style={{ marginTop: 12, fontSize: 13, color: 'var(--accent-green)' }}>Stream started! Redirecting...</p>}
      </div>
    </div>
  );
}

export default function LivePage() {
  const { user } = useAuthStore();
  const [liveStreams, setLiveStreams] = useState([]);
  const [watchingStream, setWatchingStream] = useState(null);
  const [showGoLive, setShowGoLive] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Initialize real-time subscriptions once
    initRealtimeSubscriptions(user.id);
    const fetchStreams = async () => {
      const { data } = await supabase.from('live_streams').select('*, user:profiles(*)').eq('is_live', true).order('started_at', { ascending: false });
      if (data) setLiveStreams(data);
    };
    fetchStreams();
    const subscription = supabase.channel('live-streams-channel').on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, () => fetchStreams()).subscribe();
    return () => subscription.unsubscribe();
  }, [user]);

  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28 }}>Live <span className="gradient-text">Streams</span></h1>
        <button onClick={() => setShowGoLive(true)} className="btn-primary" style={{ gap: 8 }}><div className="live-dot" /> Go Live</button>
      </div>
      {liveStreams.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No live streams at the moment.</p>
          <button onClick={() => setShowGoLive(true)} className="btn-primary" style={{ marginTop: 16 }}>Start your first stream</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {liveStreams.map((stream) => <StreamCard key={stream.id} stream={stream} onClick={setWatchingStream} />)}
        </div>
      )}
      {watchingStream && <StreamViewer stream={watchingStream} onClose={() => setWatchingStream(null)} />}
      {showGoLive && <GoLiveModal onClose={() => setShowGoLive(false)} />}
    </div>
  );
}
