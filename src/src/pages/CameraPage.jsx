import { useState, useEffect, useRef } from 'react';
import { 
  Camera, RotateCcw, Download, Share2, Sparkles, Sun, 
  Contrast, Droplets, RefreshCw, X, AlertCircle 
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';

const FILTERS = [
  { id: 'none', name: 'Original', css: 'none' },
  { id: 'vivid', name: 'Vivid', css: 'saturate(1.8) contrast(1.1)' },
  { id: 'mono', name: 'Mono', css: 'grayscale(1) contrast(1.2)' },
  { id: 'fade', name: 'Fade', css: 'brightness(1.1) saturate(0.7) contrast(0.9)' },
  { id: 'neon', name: 'Neon', css: 'saturate(2) brightness(0.9) hue-rotate(20deg)' },
  { id: 'warm', name: 'Warm', css: 'sepia(0.4) saturate(1.4) brightness(1.05)' },
  { id: 'cool', name: 'Cool', css: 'hue-rotate(180deg) saturate(1.2) brightness(0.95)' },
  { id: 'dramatic', name: 'Dramatic', css: 'contrast(1.5) saturate(1.3) brightness(0.85)' },
];

const OVERLAYS = [
  { id: 'none', name: 'None', emoji: '✕' },
  { id: 'sparkle', name: 'Sparkle', emoji: '✨' },
  { id: 'heart', name: 'Hearts', emoji: '❤️' },
  { id: 'fire', name: 'Fire', emoji: '🔥' },
  { id: 'stars', name: 'Stars', emoji: '⭐' },
];

export default function CameraPage() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('none');
  const [overlay, setOverlay] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [captured, setCaptured] = useState(false);
  const [tab, setTab] = useState('filters');
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [sharing, setSharing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const initRef = useRef(false); // prevent double init in Strict Mode

  const startCamera = async () => {
    // Avoid double initialization
    if (initRef.current) return;
    initRef.current = true;

    setError('');
    setErrorDetails('');
    setCameraActive(false);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Your browser does not support camera access.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Stop any previous stream (cleanup)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      // Ignore AbortError – happens during hot reload or strict mode
      if (err.name === 'AbortError') {
        console.log('Camera stream aborted (normal in dev)');
        return;
      }
      console.error('Camera error:', err);
      let userMessage = 'Could not access camera.';
      let details = '';
      switch (err.name) {
        case 'NotAllowedError':
          userMessage = 'Permission denied.';
          details = 'Click the camera icon in the address bar, allow access, then refresh.';
          break;
        case 'NotFoundError':
          userMessage = 'No camera found.';
          details = 'Make sure your device has a working camera.';
          break;
        case 'NotReadableError':
          userMessage = 'Camera is in use.';
          details = 'Close other apps using your camera (Zoom, OBS, etc.) and try again.';
          break;
        default:
          userMessage = err.message;
      }
      setError(userMessage);
      setErrorDetails(details);
    } finally {
      initRef.current = false;
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const retryCamera = () => {
    initRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    startCamera();
  };

  const switchCamera = async () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    const currentFacing = videoTrack.getSettings().facingMode;
    const newFacing = currentFacing === 'user' ? 'environment' : 'user';
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: newFacing } }
      });
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = newStream;
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }
    } catch (err) {
      setError('Cannot switch camera. Make sure you have multiple cameras.');
    }
  };

  const activeFilter = FILTERS.find(f => f.id === filter);
  const adjustments = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  const combinedFilter = activeFilter.css !== 'none' ? `${activeFilter.css} ${adjustments}` : adjustments;
  const overlayEmoji = OVERLAYS.find(o => o.id === overlay)?.emoji;

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (overlay !== 'none') {
      ctx.font = `${canvas.width * 0.2}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(overlayEmoji, canvas.width / 2, canvas.height / 2);
    }
    const imageDataURL = canvas.toDataURL('image/png');
    setCapturedImage(imageDataURL);
    setShowPreview(true);
    setCaptured(true);
    setTimeout(() => setCaptured(false), 1000);
  };

  const saveImage = () => {
    if (!capturedImage) return;
    const link = document.createElement('a');
    link.download = `nexus-capture-${Date.now()}.png`;
    link.href = capturedImage;
    link.click();
  };

  const dataURLToBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

  const shareToFeed = async () => {
    if (!capturedImage || !user) return;
    setSharing(true);
    try {
      const blob = dataURLToBlob(capturedImage);
      const fileName = `${user.id}/${Date.now()}.png`;
      const filePath = `posts/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, blob, { contentType: 'image/png', cacheControl: '3600' });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
      const mediaUrl = urlData.publicUrl;
      const { error: postError } = await supabase.from('posts').insert({
        user_id: user.id,
        content: caption.trim() || '📸 New photo!',
        media_urls: [mediaUrl],
      });
      if (postError) throw postError;
      setShowShareModal(false);
      setCaption('');
      setShowPreview(false);
      setCapturedImage(null);
      alert('Posted to feed successfully!');
    } catch (err) {
      console.error('Share error:', err);
      alert('Failed to share: ' + err.message);
    } finally {
      setSharing(false);
    }
  };

  const resetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 'var(--sidebar-width)', padding: '24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 480, width: '100%' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 24 }}>
            <span className="gradient-text">Camera</span> Studio
          </h1>

          <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: 24, overflow: 'hidden', marginBottom: 16, border: '1px solid var(--border-default)', background: '#000' }}>
            {!showPreview ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: combinedFilter,
                    display: cameraActive ? 'block' : 'none',
                  }}
                />
                {!cameraActive && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', padding: 20, textAlign: 'center' }}>
                    <AlertCircle size={48} style={{ color: '#f87171', marginBottom: 16 }} />
                    <p style={{ color: '#f87171', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{error || 'Camera not active'}</p>
                    {errorDetails && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>{errorDetails}</p>}
                    <button onClick={retryCamera} className="btn-primary" style={{ gap: 8 }}><RefreshCw size={16} /> Retry Camera</button>
                  </div>
                )}
                {overlay !== 'none' && cameraActive && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: 60, opacity: 0.7 }}>{overlayEmoji}</div>
                  </div>
                )}
                {cameraActive && (
                  <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={switchCamera} className="btn-icon" style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none' }}><RotateCcw size={16} /></button>
                    <button className="btn-icon" style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none' }}><Sparkles size={16} /></button>
                  </div>
                )}
              </>
            ) : (
              <>
                <img src={capturedImage} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                  <button onClick={() => setShowPreview(false)} className="btn-icon" style={{ background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none' }}><RefreshCw size={16} /></button>
                </div>
              </>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <button
              onClick={capturePhoto}
              disabled={!cameraActive || showPreview}
              style={{
                width: 70, height: 70, borderRadius: '50%', background: 'white', border: '4px solid var(--border-strong)',
                cursor: cameraActive && !showPreview ? 'pointer' : 'not-allowed',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)', opacity: cameraActive && !showPreview ? 1 : 0.5
              }}
            />
          </div>

          {captured && <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--accent-primary)', marginTop: -12, marginBottom: 12 }}>📸 Captured!</p>}

          {!showPreview ? (
            <>
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 16 }}>
                {['filters', 'overlays', 'adjust'].map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: tab === t ? 600 : 400, background: tab === t ? 'var(--bg-card)' : 'transparent', color: tab === t ? 'var(--accent-primary)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', textTransform: 'capitalize' }}>{t}</button>
                ))}
              </div>
              {tab === 'filters' && (
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
                  {FILTERS.map(f => (
                    <div key={f.id} onClick={() => setFilter(f.id)} style={{ flexShrink: 0, cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ width: 64, height: 64, borderRadius: 12, background: 'linear-gradient(135deg, #7c5cfc, #f472b6)', filter: f.css !== 'none' ? f.css : 'none', border: filter === f.id ? '3px solid var(--accent-primary)' : '3px solid transparent', marginBottom: 6 }} />
                      <p style={{ fontSize: 11, color: filter === f.id ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: filter === f.id ? 600 : 400 }}>{f.name}</p>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'overlays' && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {OVERLAYS.map(o => (
                    <button key={o.id} onClick={() => setOverlay(o.id)} style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: overlay === o.id ? 'var(--accent-glow)' : 'var(--bg-tertiary)', border: overlay === o.id ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)', color: overlay === o.id ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{o.emoji}</span> {o.name}
                    </button>
                  ))}
                </div>
              )}
              {tab === 'adjust' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Brightness', icon: Sun, value: brightness, setter: setBrightness, min: 50, max: 200 },
                    { label: 'Contrast', icon: Contrast, value: contrast, setter: setContrast, min: 50, max: 200 },
                    { label: 'Saturation', icon: Droplets, value: saturation, setter: setSaturation, min: 0, max: 300 },
                  ].map(({ label, icon: Icon, value, setter, min, max }) => (
                    <div key={label}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Icon size={14} style={{ color: 'var(--accent-primary)' }} />
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{value}%</span>
                      </div>
                      <input type="range" min={min} max={max} value={value} onChange={e => setter(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
                    </div>
                  ))}
                  <button onClick={resetAdjustments} className="btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 13 }}><RotateCcw size={14} /> Reset</button>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={saveImage} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}><Download size={16} /> Save</button>
              <button onClick={() => setShowShareModal(true)} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}><Share2 size={16} /> Share to Feed</button>
            </div>
          )}
        </div>
      </main>

      {showShareModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowShareModal(false)}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: 400, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>Share to Feed</h3>
              <button onClick={() => setShowShareModal(false)} className="btn-icon" style={{ background: 'none' }}><X size={20} /></button>
            </div>
            <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', background: '#f0f0f0', display: 'flex', justifyContent: 'center' }}>
              <img src={capturedImage} alt="Preview" style={{ maxHeight: 200, width: 'auto' }} />
            </div>
            <textarea
              className="input-field"
              placeholder="Write a caption..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={3}
              style={{ marginBottom: 16, resize: 'vertical' }}
            />
            <button onClick={shareToFeed} disabled={sharing} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {sharing ? 'Posting...' : 'Post to Feed'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}