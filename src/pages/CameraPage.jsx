import { useState, useRef } from 'react'
import { Camera, RotateCcw, Download, Share2, Sparkles, Sun, Contrast, Droplets, Zap } from 'lucide-react'

const FILTERS = [
  { id: 'none', name: 'Original', css: 'none' },
  { id: 'vivid', name: 'Vivid', css: 'saturate(1.8) contrast(1.1)' },
  { id: 'mono', name: 'Mono', css: 'grayscale(1) contrast(1.2)' },
  { id: 'fade', name: 'Fade', css: 'brightness(1.1) saturate(0.7) contrast(0.9)' },
  { id: 'neon', name: 'Neon', css: 'saturate(2) brightness(0.9) hue-rotate(20deg)' },
  { id: 'warm', name: 'Warm', css: 'sepia(0.4) saturate(1.4) brightness(1.05)' },
  { id: 'cool', name: 'Cool', css: 'hue-rotate(180deg) saturate(1.2) brightness(0.95)' },
  { id: 'dramatic', name: 'Dramatic', css: 'contrast(1.5) saturate(1.3) brightness(0.85)' },
]

const OVERLAYS = [
  { id: 'none', name: 'None', emoji: '✕' },
  { id: 'sparkle', name: 'Sparkle', emoji: '✨' },
  { id: 'heart', name: 'Hearts', emoji: '❤️' },
  { id: 'fire', name: 'Fire', emoji: '🔥' },
  { id: 'stars', name: 'Stars', emoji: '⭐' },
]

export default function CameraPage() {
  const [filter, setFilter] = useState('none')
  const [overlay, setOverlay] = useState('none')
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [captured, setCaptured] = useState(false)
  const [tab, setTab] = useState('filters')

  const activeFilter = FILTERS.find(f => f.id === filter)
  const adjustments = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
  const combinedFilter = activeFilter.css !== 'none' ? `${activeFilter.css} ${adjustments}` : adjustments

  const overlayEmoji = OVERLAYS.find(o => o.id === overlay)?.emoji

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 24 }}>
        <span className="gradient-text">Camera</span> Studio
      </h1>

      {/* Viewfinder */}
      <div style={{
        width: '100%', aspectRatio: '3/4', borderRadius: 24,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        position: 'relative', overflow: 'hidden', marginBottom: 16,
        border: '1px solid var(--border-default)',
        filter: combinedFilter,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Simulated camera feed */}
        <div style={{ textAlign: 'center' }}>
          <div className="avatar-placeholder" style={{ width: 120, height: 120, fontSize: 42, margin: '0 auto 16px', border: '3px solid rgba(255,255,255,0.1)' }}>YO</div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Camera Preview</p>
        </div>

        {/* Overlay */}
        {overlay !== 'none' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ fontSize: 60, opacity: 0.7, animation: 'pulseLive 2s infinite' }}>{overlayEmoji}</div>
          </div>
        )}

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '33.33% 33.33%',
          pointerEvents: 'none',
        }} />

        {/* Top controls */}
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn-icon" style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none' }}>
            <RotateCcw size={16} />
          </button>
          <button className="btn-icon" style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none' }}>
            <Sparkles size={16} />
          </button>
        </div>

        {captured && (
          <div className="fade-in" style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.9)',
          }}>
            <p style={{ fontSize: 18, color: '#333', fontWeight: 700 }}>📸 Captured!</p>
          </div>
        )}
      </div>

      {/* Capture button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, gap: 16 }}>
        <button style={{
          width: 70, height: 70, borderRadius: '50%',
          background: 'white', border: '4px solid var(--border-strong)', cursor: 'pointer',
          transition: 'transform 150ms, box-shadow 150ms',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; setCaptured(true); setTimeout(() => setCaptured(false), 1000) }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 16 }}>
        {['filters', 'overlays', 'adjust'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: tab === t ? 600 : 400,
            background: tab === t ? 'var(--bg-card)' : 'transparent',
            color: tab === t ? 'var(--accent-primary)' : 'var(--text-muted)',
            border: 'none', cursor: 'pointer', transition: 'all 150ms', textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      {/* Filters */}
      {tab === 'filters' && (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
          {FILTERS.map(f => (
            <div key={f.id} onClick={() => setFilter(f.id)} style={{ flexShrink: 0, cursor: 'pointer', textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 12,
                background: 'linear-gradient(135deg, #7c5cfc, #f472b6)',
                filter: f.css !== 'none' ? f.css : 'none',
                border: filter === f.id ? '3px solid var(--accent-primary)' : '3px solid transparent',
                transition: 'border 150ms',
                marginBottom: 6,
              }} />
              <p style={{ fontSize: 11, color: filter === f.id ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: filter === f.id ? 600 : 400 }}>{f.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Overlays */}
      {tab === 'overlays' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {OVERLAYS.map(o => (
            <button key={o.id} onClick={() => setOverlay(o.id)} style={{
              padding: '10px 16px', borderRadius: 'var(--radius-md)',
              background: overlay === o.id ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
              border: overlay === o.id ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
              color: overlay === o.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{o.emoji}</span> {o.name}
            </button>
          ))}
        </div>
      )}

      {/* Adjust */}
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
              <input type="range" min={min} max={max} value={value} onChange={e => setter(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
            </div>
          ))}
          <button onClick={() => { setBrightness(100); setContrast(100); setSaturation(100) }} className="btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 13 }}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
          <Download size={16} /> Save
        </button>
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
          <Share2 size={16} /> Share to Feed
        </button>
      </div>
    </div>
  )
}
