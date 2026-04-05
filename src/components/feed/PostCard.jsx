import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

export default function PostCard({ post }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Check if user liked this post
  useEffect(() => {
    if (!user) return;
    const checkLike = async () => {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single();
      setLiked(!!data);
    };
    checkLike();
  }, [post.id, user]);

  const handleLike = async () => {
    if (!user) return;
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id);
      setLikesCount(prev => prev - 1);
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
      setLikesCount(prev => prev + 1);
      // Create notification
      if (post.user_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          type: 'like',
          actor_id: user.id,
          post_id: post.id,
          content: 'liked your post'
        });
      }
    }
    setLiked(!liked);
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, user:profiles(*)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });
    if (data) setComments(data);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const { data } = await supabase
      .from('comments')
      .insert({ post_id: post.id, user_id: user.id, content: newComment })
      .select('*, user:profiles(*)')
      .single();
    if (data) {
      setComments(prev => [...prev, data]);
      setNewComment('');
      // Update post comments count
      await supabase.rpc('increment_post_comments', { post_id: post.id });
      // Create notification
      if (post.user_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          type: 'comment',
          actor_id: user.id,
          post_id: post.id,
          content: newComment
        });
      }
    }
  };

  return (
    <div className="card" style={{ marginBottom: '16px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="avatar-placeholder" style={{ width: '40px', height: '40px' }}>
          {post.user?.display_name?.[0] || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600 }}>{post.user?.display_name}</span>
            {post.user?.is_verified && <span className="verified-badge">✓</span>}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {new Date(post.created_at).toLocaleString()}
          </span>
        </div>
        <button className="btn-icon"><MoreHorizontal size={16} /></button>
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px 12px' }}>
        <p style={{ marginBottom: '12px' }}>{post.content}</p>
        {post.media_url && (
          <img src={post.media_url} alt="post media" style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '24px' }}>
        <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#f87171' : 'var(--text-muted)' }}>
          <Heart size={18} fill={liked ? '#f87171' : 'none'} /> {likesCount}
        </button>
        <button onClick={() => { setShowComments(!showComments); if (!showComments) loadComments(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <MessageCircle size={18} /> {post.comments_count}
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <Share2 size={18} /> {post.shares_count}
        </button>
        <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <Bookmark size={18} />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
          {comments.map(comment => (
            <div key={comment.id} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div className="avatar-placeholder" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                {comment.user?.display_name?.[0]}
              </div>
              <div>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{comment.user?.display_name}</span>{' '}
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{comment.content}</span>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(comment.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
          <form onSubmit={handleComment} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input
              className="input-field"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '6px 16px' }}>Post</button>
          </form>
        </div>
      )}
    </div>
  );
}
