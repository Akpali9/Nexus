import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

export default function StoriesBar() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const fetchStories = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .limit(10);
      if (data) setStories(data);
    };
    fetchStories();
  }, []);

  return (
    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
      {stories.map((user) => (
        <div key={user.id} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div className="story-ring" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #d62976, #962fbf)', padding: '2px' }}>
            <div className="avatar-placeholder" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>{user.display_name?.[0]}</div>
          </div>
          <p style={{ fontSize: '12px', marginTop: '6px' }}>{user.display_name?.split(' ')[0]}</p>
        </div>
      ))}
    </div>
  );
}
