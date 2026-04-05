import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';

export default function RightSidebar() {
  const { profile } = useAuthStore();
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!profile) return;
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .neq('id', profile.id)
        .limit(5);
      if (data) setSuggestedUsers(data);
    };
    fetchSuggestions();
  }, [profile]);

  return (
    <div style={{ width: '280px', position: 'sticky', top: '24px' }}>
      <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '12px' }}>Suggested for you</h3>
        {suggestedUsers.map((user) => (
          <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div className="avatar-placeholder" style={{ width: '32px', height: '32px' }}>{user.display_name?.[0]}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 500 }}>{user.display_name}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{user.username}</p>
            </div>
            <button className="btn-ghost" style={{ fontSize: '12px', padding: '4px 12px' }}>Follow</button>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: '16px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>© 2025 Nexus • Terms • Privacy</p>
      </div>
    </div>
  );
}
