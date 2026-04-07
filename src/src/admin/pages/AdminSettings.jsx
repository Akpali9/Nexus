import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';

const S = {
  page: { padding: '28px 32px' },
  h1: { fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 },
  sub: { fontSize: 13, color: '#5a5a72', marginBottom: 24 },
  card: { background: '#0d0d18', border: '1px solid #1e1e2e', borderRadius: 14, padding: 24, marginBottom: 16 },
  label: { fontSize: 12, color: '#7a7a90', marginBottom: 6, display: 'block', fontWeight: 500 },
  input: { width: '100%', padding: '10px 14px', background: '#16162a', border: '1px solid #1e1e2e', borderRadius: 9, color: '#fff', fontSize: 13, outline: 'none' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #1e1e2e' },
};

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: value ? '#7c5cfc' : '#1e1e2e', position: 'relative', cursor: 'pointer', transition: 'background 200ms', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: value ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platform_name: 'Nexus',
    signup_enabled: true,
    live_streaming_enabled: true,
    gifts_enabled: true,
    subscriptions_enabled: true,
    max_post_length: 2000,
    platform_fee_percent: 20,
    min_withdrawal: 10,
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    // In a real app, save to a settings table
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Platform Settings</h1>
      <p style={S.sub}>Configure global platform behaviour</p>

      {/* Feature toggles */}
      <div style={S.card}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Feature Flags</h2>
        <p style={{ fontSize: 12, color: '#5a5a72', marginBottom: 16 }}>Enable or disable platform features globally</p>

        {[
          { key: 'signup_enabled', label: 'New User Signups', desc: 'Allow new users to create accounts' },
          { key: 'live_streaming_enabled', label: 'Live Streaming', desc: 'Allow creators to start live streams' },
          { key: 'gifts_enabled', label: 'Gift System', desc: 'Allow users to send gifts during streams' },
          { key: 'subscriptions_enabled', label: 'Subscriptions', desc: 'Allow paid creator subscriptions' },
        ].map(({ key, label, desc }) => (
          <div key={key} style={{ ...S.row, ':last-child': { borderBottom: 'none' } }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e2e9', marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 12, color: '#5a5a72' }}>{desc}</p>
            </div>
            <Toggle value={settings[key]} onChange={v => set(key, v)} />
          </div>
        ))}
      </div>

      {/* Numeric settings */}
      <div style={S.card}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Platform Parameters</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { key: 'platform_fee_percent', label: 'Platform Fee (%)', type: 'number' },
            { key: 'min_withdrawal', label: 'Minimum Withdrawal ($)', type: 'number' },
            { key: 'max_post_length', label: 'Max Post Length (chars)', type: 'number' },
            { key: 'platform_name', label: 'Platform Name', type: 'text' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label style={S.label}>{label}</label>
              <input type={type} value={settings[key]} onChange={e => set(key, type === 'number' ? Number(e.target.value) : e.target.value)} style={S.input} />
            </div>
          ))}
        </div>
      </div>

      <button onClick={save}
        style={{ padding: '11px 24px', borderRadius: 10, background: saved ? '#22d3a5' : '#7c5cfc', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'background 200ms' }}>
        {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
      </button>
    </div>
  );
}
