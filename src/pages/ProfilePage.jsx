import { useState, useEffect } from 'react';
import { Edit3, CheckCircle, Star, Camera, Link2, MapPin, Calendar, Settings, Grid, Bookmark, Heart } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';

export default function ProfilePage() {
  const { user, profile: authProfile } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0, earned: 0 });
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) { setProfile(data); setEditBio(data.bio || ''); }
    };
    const fetchStatsAndPosts = async () => {
      const { count: postsCount } = await supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: followersCount } = await supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', user.id);
      const { count: followingCount } = await supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', user.id);
      const { data: gifts } = await supabase.from('gifts').select('amount').eq('to_user_id', user.id);
      const totalEarned = gifts?.reduce((sum, g) => sum + g.amount, 0) || 0;
      const { data: posts } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setStats({ posts: postsCount || 0, followers: followersCount || 0, following: followingCount || 0, earned: totalEarned });
      setUserPosts(posts || []);
    };
    fetchProfile();
    fetchStatsAndPosts();
    const postsSub = supabase.channel('profile-posts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
      if (payload.new.user_id === user.id) { setUserPosts((prev) => [payload.new, ...prev]); setStats((prev) => ({ ...prev, posts: prev.posts + 1 })); }
    }).subscribe();
    return () => postsSub.unsubscribe();
  }, [user]);

  const updateProfile = async () => {
    await supabase.from('profiles').update({ bio: editBio }).eq('id', user.id);
    setProfile((prev) => ({ ...prev, bio: editBio }));
    setEditing(false);
  };

  if (!profile) return <div className="loading">Loading profile...</div>;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ height: 180, borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-pink), var(--accent-blue))', marginBottom: -50, position: 'relative', overflow: 'hidden' }}>
        <button style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.4)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', padding: '6px 12px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Camera size={14} /> Edit Cover</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingLeft: 20, marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <div className="avatar-placeholder" style={{ width: 96, height: 96, fontSize: 32, border: '4px solid var(--bg-primary)', boxShadow: '0 0 0 2px var(--accent-primary)' }}>{profile.display_name?.[0] || profile.username?.[0]}</div>
          <button style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-primary)', border: '2px solid var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Camera size={12} color="white" /></button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setEditing(true)} className="btn-ghost" style={{ fontSize: 13 }}><Edit3 size={14} /> Edit Profile</button>
          <button className="btn-icon"><Settings size={16} /></button>
        </div>
      </div>
      <div style={{ paddingLeft: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>{profile.display_name}</h1>
          {profile.is_verified && <CheckCircle size={18} style={{ color: 'var(--accent-primary)' }} />}
          {profile.is_premium && <span className="badge badge-premium"><Star size={10} /> PRO</span>}
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 10 }}>@{profile.username}</p>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{profile.bio || 'No bio yet.'}</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {profile.location && <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {profile.location}</span>}
          <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> Joined {new Date(profile.created_at).getFullYear()}</span>
          {profile.website && <span style={{ fontSize: 13, color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}><Link2 size={13} /> {profile.website}</span>}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
        {[{ label: 'Posts', value: stats.posts }, { label: 'Followers', value: stats.followers.toLocaleString() }, { label: 'Following', value: stats.following.toLocaleString() }, { label: 'Earned', value: `$${stats.earned}` }].map((s) => (
          <div key={s.label} style={{ background: 'var(--bg-card)', padding: '16px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, marginBottom: 2 }}>{s.label === 'Earned' ? <span className="gradient-text">{s.value}</span> : s.value}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-subtle)', marginBottom: 20 }}>
        {[{ id: 'posts', icon: Grid, label: 'Posts' }, { id: 'saved', icon: Bookmark, label: 'Saved' }, { id: 'liked', icon: Heart, label: 'Liked' }].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: activeTab === id ? 'var(--accent-primary)' : 'var(--text-muted)', borderBottom: activeTab === id ? '2px solid var(--accent-primary)' : '2px solid transparent', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === id ? 600 : 400 }}><Icon size={15} /> {label}</button>
        ))}
      </div>
      {activeTab === 'posts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {userPosts.map((post, idx) => (
            <div key={post.id} style={{ aspectRatio: '1', borderRadius: 'var(--radius-md)', background: `linear-gradient(${idx * 60 + 180}deg, hsl(${idx * 40 + 240}deg, 60%, 20%), hsl(${idx * 40 + 280}deg, 60%, 30%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 28, position: 'relative', overflow: 'hidden' }}>
              {post.media_url ? '📷' : '📝'}
              <div className="post-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0, transition: 'opacity 150ms' }}><span style={{ color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={14} fill="white" /> {post.likes_count}</span></div>
            </div>
          ))}
        </div>
      )}
      {activeTab !== 'posts' && <div className="card" style={{ padding: 40, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>Coming soon</p></div>}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditing(false)}>
          <div onClick={(e) => e.stopPropagation()} className="card fade-in" style={{ width: 480, padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Edit Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Display Name</label><input className="input-field" defaultValue={profile.display_name} /></div>
              <div><label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Username</label><input className="input-field" defaultValue={profile.username} /></div>
              <div><label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Bio</label><textarea className="input-field" rows={3} value={editBio} onChange={(e) => setEditBio(e.target.value)} style={{ resize: 'none' }} /><p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{160 - editBio.length} characters remaining</p></div>
              <div><label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Location</label><input className="input-field" defaultValue={profile.location || ''} /></div>
              <div><label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Website</label><input className="input-field" defaultValue={profile.website || ''} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setEditing(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={updateProfile} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
