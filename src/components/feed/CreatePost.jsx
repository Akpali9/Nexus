import { useState } from 'react';
import { Image, Video, MapPin, Smile } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CreatePost({ onPost }) {
  const { profile } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !media) return;
    await onPost({ content, media });
    setContent('');
    setMedia(null);
  };

  return (
    <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div className="avatar-placeholder" style={{ width: '40px', height: '40px' }}>
          {profile?.display_name?.[0] || 'U'}
        </div>
        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
          <textarea
            className="input-field"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            style={{ resize: 'none' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-icon"><Image size={18} /></button>
              <button type="button" className="btn-icon"><Video size={18} /></button>
              <button type="button" className="btn-icon"><MapPin size={18} /></button>
              <button type="button" className="btn-icon"><Smile size={18} /></button>
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '6px 20px' }}>
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
