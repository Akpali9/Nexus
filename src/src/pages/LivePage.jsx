import { useState, useEffect, useRef } from 'react';
import { Radio, Eye, Heart, Gift, MessageCircle, X, MicOff, Mic, Share2, Users } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import { useRealtimeStore } from '../stores/realtimeStore';
import Sidebar from '../components/layout/Sidebar';
import Peer from 'peerjs';

// ------------------- Chat Message Component -------------------
function LiveChatMessage({ msg }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
      <div className="avatar-placeholder" style={{ width: 24, height: 24, fontSize: 10, flexShrink: 0 }}>
        {msg.user?.display_name?.[0] || '?'}
      </div>
      <div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-primary)' }}>
          {msg.user?.display_name}{' '}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{msg.content}</span>
      </div>
    </div>
  );
}

// ------------------- Stream Card (for listing live streams) -------------------
function StreamCard({ stream, onClick }) {
  const liveViewers = useRealtimeStore(s => s.liveViewers);
  const viewers = liveViewers[stream.id] ?? stream.viewer_count ?? 0;

  return (
    <div onClick={() => onClick(stream)} className="card" style={{ cursor: 'pointer', overflow: 'hidden' }}>
      <div style={{
        height: 160,
        background: `linear-gradient(135deg, hsl(${(stream.title?.charCodeAt(0) || 0) % 360}deg, 70%, 20%), hsl(${(stream.title?.charCodeAt(0) || 0) * 2 % 360}deg, 70%, 30%))`,
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 48 }}>🎥</span>
        <div style={{ position: 'absolute', top: 10, left: 10 }}><span className="badge badge-live">LIVE</span></div>
        <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
          <Eye size={12} /> {viewers}
        </div>
      </div>
      <div style={{ padding: 12 }}>
        <p style={{ fontWeight: 600, marginBottom: 2 }}>{stream.title}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stream.user?.display_name}</p>
        {stream.category && <span style={{ fontSize: 11, color: 'var(--accent-primary)', background: 'var(--accent-glow)', padding: '2px 8px', borderRadius: 999, marginTop: 6, display: 'inline-block' }}>{stream.category}</span>}
      </div>
    </div>
  );
}

// ------------------- Stream Viewer Component -------------------
function StreamViewer({ stream, onClose }) {
  const { user } = useAuthStore();
  const liveViewers = useRealtimeStore(s => s.liveViewers);
  const liveChatMessages = useRealtimeStore(s => s.liveChatMessages);
  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState('');
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(stream.like_count || 0);
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const chatEndRef = useRef(null);

  const viewers = liveViewers[stream.id] ?? stream.viewer_count ?? 0;

  // Connect to streamer's peer
  useEffect(() => {
    if (!stream.peer_id) {
      console.error('Stream has no peer_id');
      return;
    }
    const peer = new Peer(); // viewer creates own peer (random ID)
    peerRef.current = peer;

    peer.on('open', (viewerId) => {
      console.log('Viewer peer open:', viewerId);
      // Call the streamer's peer ID
      const call = peer.call(stream.peer_id, null); // we don't send our own stream
      call.on('stream', (remoteStream) => {
        console.log('Received remote stream');
        if (videoRef.current) videoRef.current.srcObject = remoteStream;
      });
      call.on('error', (err) => console.error('Call error:', err));
    });

    peer.on('error', (err) => console.error('Peer error:', err));

    return () => {
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [stream.peer_id]);

  // Load existing chat messages
  useEffect(() => {
    supabase
      .from('stream_chat')
      .select('*, user:profiles(*)')
      .eq('stream_id', stream.id)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => { if (data) setChatMessages(data); });
  }, [stream.id]);

  // Append real-time chat messages
  useEffect(() => {
    const relevant = liveChatMessages.filter(m => m.stream_id === stream.id);
    if (relevant.length) setChatMessages(prev => [...prev, ...relevant]);
  }, [liveChatMessages, stream.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const { data } = await supabase
      .from('stream_chat')
      .insert({ stream_id: stream.id, user_id: user.id, content: input })
      .select('*, user:profiles(*)')
      .single();
    if (data) {
      setChatMessages(prev => [...prev, data]);
      setInput('');
    }
  };

  // Increment viewer count (optional: can be done via realtime)
  useEffect(() => {
    const incrementViewer = async () => {
      await supabase.rpc('increment_viewer_count', { stream_id: stream.id });
    };
    incrementViewer();
    return () => {
      // Decrement when leaving
      supabase.rpc('decrement_viewer_count', { stream_id: stream.id });
    };
  }, [stream.id]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 200, display: 'flex' }}>
      {/* Video area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{
          width: '100%', maxWidth: 900, aspectRatio: '16/9',
          background: '#000', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="badge badge-live">LIVE</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: 999, fontSize: 12, color: 'white' }}>
                <Eye size={11} /> {viewers}
              </div>
              <p style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'white' }}>{stream.title}</p>
              <button onClick={() => setMuted(!muted)} className="btn-icon" style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none' }}>
                {muted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>
          </div>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Side action buttons */}
        <div style={{ position: 'absolute', right: 36, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button onClick={() => { setLiked(!liked); setLikeCount(l => liked ? l - 1 : l + 1); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#f87171' : 'white' }}>
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

      {/* Chat sidebar */}
      <div style={{ width: 320, background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar-placeholder" style={{ width: 36, height: 36 }}>{stream.user?.display_name?.[0]}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{stream.user?.display_name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stream.category}</p>
            </div>
            <button className="btn-primary" style={{ padding: '5px 12px', fontSize: 12 }}>Follow</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {chatMessages.map(msg => <LiveChatMessage key={msg.id} msg={msg} />)}
          <div ref={chatEndRef} />
        </div>
        <div style={{ padding: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
          <input
            className="input-field"
            placeholder="Say something..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            style={{ borderRadius: 999 }}
          />
          <button onClick={handleSend} className="btn-primary" style={{ width: 36, height: 36, borderRadius: '50%', padding: 0, justifyContent: 'center', flexShrink: 0 }}>
            <MessageCircle size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- Go Live Modal (Broadcaster) -------------------
function GoLiveModal({ onClose, onStreamStarted }) {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const videoPreviewRef = useRef(null);
  const peerRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Request camera/mic and show preview
  useEffect(() => {
    async function getMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        mediaStreamRef.current = stream;
        if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;
      } catch (err) {
        console.error(err);
        setError('Camera/microphone access denied. Please allow permissions to go live.');
      }
    }
    getMedia();
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startStream = async () => {
    if (!title.trim()) {
      setError('Please enter a stream title');
      return;
    }
    if (!mediaStreamRef.current) {
      setError('No media stream available. Check permissions.');
      return;
    }
    try {
      // Create PeerJS instance for streamer
      const peer = new Peer();
      peerRef.current = peer;

      peer.on('open', async (peerId) => {
        console.log('Streamer peer ID:', peerId);
        // Insert stream into database with peer_id
        const { data, error } = await supabase
          .from('live_streams')
          .insert({
            user_id: user.id,
            title,
            category,
            status: 'live',
            viewer_count: 0,
            started_at: new Date().toISOString(),
            peer_id: peerId,
          })
          .select('*, user:profiles(*)')
          .single();

        if (error) throw error;

        // Answer incoming calls with our media stream
        peer.on('call', (call) => {
          console.log('Incoming call from viewer');
          call.answer(mediaStreamRef.current);
          call.on('stream', (remoteStream) => {
            // optional: we could show that someone connected
          });
        });

        setStreaming(true);
        if (onStreamStarted) onStreamStarted(data);
        setTimeout(() => {
          onClose();
        }, 1500);
      });

      peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        setError('Failed to start stream: ' + err.message);
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ width: 480, padding: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Go Live</h3>
        <div style={{ marginBottom: 16, background: '#000', borderRadius: 12, overflow: 'hidden' }}>
          <video ref={videoPreviewRef} autoPlay playsInline muted style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
        </div>
        <input className="input-field" placeholder="Stream title" value={title} onChange={e => setTitle(e.target.value)} style={{ marginBottom: 12 }} />
        <select className="input-field" value={category} onChange={e => setCategory(e.target.value)} style={{ marginBottom: 20 }}>
          <option>General</option><option>Music</option><option>Art</option><option>Gaming</option><option>Talk Show</option>
        </select>
        {error && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button onClick={startStream} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
            <Radio size={16} /> Start Stream
          </button>
        </div>
        {streaming && <p style={{ marginTop: 12, fontSize: 13, color: '#22d3a5', textAlign: 'center' }}>Stream started! You are live.</p>}
      </div>
    </div>
  );
}

// ------------------- Main LivePage -------------------
export default function LivePage() {
  const { user } = useAuthStore();
  const [liveStreams, setLiveStreams] = useState([]);
  const [watchingStream, setWatchingStream] = useState(null);
  const [showGoLive, setShowGoLive] = useState(false);

  const fetchStreams = async () => {
    const { data } = await supabase
      .from('live_streams')
      .select('*, user:profiles(*)')
      .eq('status', 'live')
      .order('started_at', { ascending: false });
    if (data) setLiveStreams(data);
  };

  useEffect(() => {
    if (!user) return;
    fetchStreams();
    const sub = supabase
      .channel('live-streams-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, fetchStreams)
      .subscribe();
    return () => sub.unsubscribe();
  }, [user]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 'var(--sidebar-width)', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28 }}>
            Live <span className="gradient-text">Streams</span>
          </h1>
          <button onClick={() => setShowGoLive(true)} className="btn-primary" style={{ gap: 8 }}>
            <div className="live-dot" /> Go Live
          </button>
        </div>

        {liveStreams.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <Radio size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No live streams right now</p>
            <button onClick={() => setShowGoLive(true)} className="btn-primary">Start the first stream</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {liveStreams.map(stream => (
              <StreamCard key={stream.id} stream={stream} onClick={setWatchingStream} />
            ))}
          </div>
        )}

        {watchingStream && <StreamViewer stream={watchingStream} onClose={() => setWatchingStream(null)} />}
        {showGoLive && <GoLiveModal onClose={() => { setShowGoLive(false); fetchStreams(); }} />}
      </main>
    </div>
  );
}