import { useEffect, useState } from 'react';
import { Search, Trash2, Eye, Heart, MessageCircle } from 'lucide-react';
import { useAdminStore } from '../adminStore';
import { useAuthStore } from '../../stores/authStore';
import AdminLayout from '../components/AdminLayout';
import AdminTable from '../components/AdminTable';

function DeleteConfirm({ post, onConfirm, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#111118', border: '1px solid #2e2e3e', borderRadius: 16, padding: 24, width: 400 }}>
        <h3 style={{ fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 8 }}>Delete Post?</h3>
        <p style={{ fontSize: 13, color: '#8e8e99', marginBottom: 12 }}>This action cannot be undone. The post will be permanently removed.</p>
        <div style={{ background: '#0d0d14', borderRadius: 8, padding: 12, marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: '#c8c8d4', lineHeight: 1.5 }}>{post.content?.slice(0, 120)}{post.content?.length > 120 ? '…' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'transparent', border: '1px solid #2e2e3e', color: '#8e8e99', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '9px', borderRadius: 8, background: '#ef4444', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminContent() {
  const { user } = useAuthStore();
  const { posts, fetchPosts, deletePost } = useAdminStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => { fetchPosts({ page, search }); }, [page]);
  useEffect(() => {
    const t = setTimeout(() => fetchPosts({ page: 0, search }), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async () => {
    await deletePost(deleteTarget.id, user.id);
    setDeleteTarget(null);
  };

  const columns = [
    {
      key: 'author', label: 'Author',
      render: p => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#7c5cfc', flexShrink: 0 }}>
            {p.user?.display_name?.[0] || '?'}
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e2e9' }}>{p.user?.display_name}</p>
            <p style={{ fontSize: 10, color: '#4a4a57' }}>@{p.user?.username}</p>
          </div>
        </div>
      )
    },
    {
      key: 'content', label: 'Content',
      render: p => (
        <p style={{ fontSize: 12, color: '#8e8e99', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
          {p.content}
        </p>
      )
    },
    { key: 'created_at', label: 'Posted', render: p => <span style={{ fontSize: 11, color: '#4a4a57' }}>{new Date(p.created_at).toLocaleDateString()}</span> },
    {
      key: 'stats', label: 'Engagement', align: 'right',
      render: p => (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#6b6b7a' }}><Heart size={11} color="#f472b6" /> {p.like_count || 0}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#6b6b7a' }}><MessageCircle size={11} color="#60a5fa" /> {p.comment_count || 0}</span>
        </div>
      )
    },
    {
      key: 'actions', label: '', align: 'right',
      render: p => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button onClick={() => setPreview(p)} style={{ padding: '5px 10px', borderRadius: 6, background: 'transparent', border: '1px solid #2e2e3e', color: '#6b6b7a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            <Eye size={12} /> View
          </button>
          <button onClick={() => setDeleteTarget(p)} style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )
    },
  ];

  return (
    <AdminLayout
      title="Content Moderation"
      subtitle={`${posts.length} posts shown`}
      actions={
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4a4a57' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." style={{ paddingLeft: 32, padding: '7px 12px 7px 32px', background: '#111118', border: '1px solid #2e2e3e', borderRadius: 8, color: '#e2e2e9', fontSize: 13, width: 220 }} />
        </div>
      }
    >
      <AdminTable columns={columns} rows={posts} emptyMsg="No posts found" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '6px 14px', borderRadius: 8, background: 'transparent', border: '1px solid #2e2e3e', color: page === 0 ? '#4a4a57' : '#e2e2e9', cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: 13 }}>Previous</button>
        <span style={{ fontSize: 12, color: '#6b6b7a' }}>Page {page + 1}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={posts.length < 20} style={{ padding: '6px 14px', borderRadius: 8, background: 'transparent', border: '1px solid #2e2e3e', color: posts.length < 20 ? '#4a4a57' : '#e2e2e9', cursor: posts.length < 20 ? 'not-allowed' : 'pointer', fontSize: 13 }}>Next</button>
      </div>

      {/* Preview modal */}
      {preview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPreview(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111118', border: '1px solid #2e2e3e', borderRadius: 16, padding: 24, width: 480, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#7c5cfc' }}>{preview.user?.display_name?.[0]}</div>
              <div><p style={{ fontWeight: 600, color: '#e2e2e9' }}>{preview.user?.display_name}</p><p style={{ fontSize: 12, color: '#4a4a57' }}>{new Date(preview.created_at).toLocaleString()}</p></div>
            </div>
            <p style={{ fontSize: 14, color: '#c8c8d4', lineHeight: 1.7, marginBottom: 16 }}>{preview.content}</p>
            <div style={{ display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid #1e1e2e' }}>
              <span style={{ fontSize: 12, color: '#6b6b7a', display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={12} color="#f472b6" /> {preview.like_count || 0} likes</span>
              <span style={{ fontSize: 12, color: '#6b6b7a', display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={12} color="#60a5fa" /> {preview.comment_count || 0} comments</span>
            </div>
            <button onClick={() => { setDeleteTarget(preview); setPreview(null); }} style={{ marginTop: 16, width: '100%', padding: '9px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Trash2 size={14} /> Delete This Post
            </button>
          </div>
        </div>
      )}

      {deleteTarget && <DeleteConfirm post={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
    </AdminLayout>
  );
}
