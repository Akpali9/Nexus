import { useState, useEffect } from 'react';
import { Edit3, CheckCircle, Star, Camera, Link2, MapPin, Calendar, Settings, Grid, Bookmark, Heart } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import Sidebar from '../components/layout/Sidebar';

export default function ProfilePage() {
  const { user, profile: authProfile } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0, earned: 0 });
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', display_name: '', username: '', location: '', website: '' });

  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof) { setProfile(prof); setEditForm({ bio: prof.bio || '', display_name: prof.display_name || '', username: prof.username || '', location: prof.location || '', website: prof.website || '' }); }

      const [{ count: posts }, { count: followers }, { count: following }, { data: gifts }] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', user.id),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', user.id),
        supabase.from('gifts').select('creator_earnings').eq('recipient_id', user.id),
      ]);
      const earned = gifts?.reduce((s, g) => s + (g.creator_earnings || 0), 0) || 0;
      setStats({ posts: posts || 0, followers: followers || 0, following: following || 0, earned });

      const { data: postsData } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setUserPosts(postsData || []);
    };

    fetchAll();

    // Real-time new posts
    const sub = supabase.channel('profile-posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        if (payload.new.user_id === user.id) {
          setUserPosts(prev => [payload.new, ...prev]);
          setStats(prev => ({ ...prev, posts: prev.posts + 1 }));
        }
      }).subscribe();

    return () => sub.unsubscribe();
  }, [user]);

  const saveProfile = async () => {
    const { data } = await supabase.from('profiles').update(editForm).eq('id', user.id).select().single();
    if (data) setProfile(data);
    setEditing(false);
  };

  if (!profile) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="loading" style={{ marginLeft: 'var(--sidebar-width)', flex: 1 }}>Loading profile...</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 'var(--sidebar-width)', maxWidth: 720, padding: '0 24px 24px' }}>
        {/* Cover */}
        <div style={{ height: 180, borderRadius: '0 0 var(--radius-xl) var(--radius-xl)', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-pink), var(--accent-blue))', marginBottom: -50, position: 'relative', overflow: 'hidden' }}>
          <button style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.4)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', padding: '6px 12px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Camera size={14} /> Edit Cover
          </button>
        </div>

        {/* Avatar + actions */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingLeft: 20, marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <div className="avatar-placeholder" style={{ width: 96, height: 96, fontSize: 32, border: '4px solid var(--bg-primary)', boxShadow: '0 0 0 2px var(--accent-primary)' }}>
              {profile.display_name?.[0] || profile.username?.[0]}
            </div>
            <button style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-primary)', border: '2px solid var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Camera size={12} color="white" />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 8 }}>
            <button onClick={() => setEditing(true)} className="btn-ghost" style={{ fontSize: 13 }}><Edit3 size={14} /> Edit Profile</button>
            <button className="btn-icon"><Settings size={16} /></button>
          </div>
        </div>

        {/* Info */}
        <div style={{ paddingLeft: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>{profile.display_name}</h1>
            {profile.verified && <CheckCircle size={18} style={{ color: 'var(--accent-primary)' }} />}
            {profile.premium && <span className="badge badge-premium"><Star size={10} /> PRO</span>}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 10 }}>@{profile.username}</p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{profile.bio || 'No bio yet.'}</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {profile.location && <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {profile.location}</span>}
            <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> Joined {new Date(profile.created_at).getFullYear()}</span>
            {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><Link2 size={13} /> {profile.website}</a>}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
          {[{ label: 'Posts', value: stats.posts }, { label: 'Followers', value: stats.followers.toLocaleString() }, { label: 'Following', value: stats.following.toLocaleString() }, { label: 'Earned', value: `$${stats.earned.toFixed(2)}` }].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', padding: '16px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, marginBottom: 2 }}>
                {s.label === 'Earned' ? <span className="gradient-text">{s.value}</span> : s.value}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-subtle)', marginBottom: 20 }}>
          {[{ id: 'posts', icon: Grid, label: 'Posts' }, { id: 'saved', icon: Bookmark, label: 'Saved' }, { id: 'liked', icon: Heart, label: 'Liked' }].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: activeTab === id ? 'var(--accent-primary)' : 'var(--text-muted)', borderBottom: activeTab === id ? '2px solid var(--accent-primary)' : '2px solid transparent', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === id ? 600 : 400 }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {activeTab === 'posts' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {userPosts.map((post, idx) => (
              <div key={post.id} style={{ aspectRatio: '1', borderRadius: 'var(--radius-md)', background: `linear-gradient(${idx * 60 + 180}deg, hsl(${idx * 40 + 240}deg, 60%, 20%), hsl(${idx * 40 + 280}deg, 60%, 30%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 28 }}>
                {post.media_urls?.length ? '📷' : '📝'}
              </div>
            ))}
            {userPosts.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No posts yet</div>
            )}
          </div>
        )}
        {activeTab !== 'posts' && <div className="card" style={{ padding: 40, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>Coming soon</p></div>}

        {/* Edit modal */}
        {editing && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditing(false)}>
            <div onClick={e => e.stopPropagation()} className="card fade-in" style={{ width: 480, padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Edit Profile</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[['Display Name', 'display_name'], ['Username', 'username'], ['Location', 'location'], ['Website', 'website']].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>{label}</label>
                    <input className="input-field" value={editForm[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Bio</label>
                  <textarea className="input-field" rows={3} value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} style={{ resize: 'none' }} />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{160 - editForm.bio.length} characters remaining</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={() => setEditing(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={saveProfile} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
