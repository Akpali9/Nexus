import { useEffect, useState } from 'react';
import { Search, Shield, Ban, CheckCircle, XCircle, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useAdminStore } from '../adminStore';
import { useAuthStore } from '../../stores/authStore';
import AdminLayout from '../components/AdminLayout';
import AdminTable from '../components/AdminTable';

const FILTERS = ['all', 'admin', 'premium', 'banned'];

function BanModal({ user, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 16, padding: 24, width: 420 }}>
        <h3 style={{ fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 6 }}>Ban User</h3>
        <p style={{ fontSize: 13, color: '#8e8e99', marginBottom: 20 }}>You are about to ban <strong style={{ color: '#ef4444' }}>@{user.username}</strong>. This will prevent them from logging in.</p>
        <textarea
          placeholder="Reason for ban..."
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '10px 14px', background: '#0d0d14', border: '1px solid #2e2e3e', borderRadius: 8, color: '#e2e2e9', fontSize: 13, resize: 'none', marginBottom: 16 }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'transparent', border: '1px solid #2e2e3e', color: '#8e8e99', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={() => onConfirm(reason)} disabled={!reason.trim()} style={{ flex: 1, padding: '9px', borderRadius: 8, background: '#ef4444', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: reason.trim() ? 1 : 0.5 }}>Ban User</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { user } = useAuthStore();
  const { users, fetchUsers, banUser, unbanUser, toggleAdmin } = useAdminStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [banTarget, setBanTarget] = useState(null);
  const [actionsFor, setActionsFor] = useState(null);

  useEffect(() => { fetchUsers({ page, search, filter }); }, [page, filter]);
  useEffect(() => {
    const t = setTimeout(() => fetchUsers({ page: 0, search, filter }), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleBan = async (reason) => {
    await banUser(banTarget.id, reason, user.id);
    setBanTarget(null);
  };

  const columns = [
    {
      key: 'user', label: 'User',
      render: u => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #7c5cfc33, #f472b633)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#7c5cfc', flexShrink: 0 }}>
            {u.display_name?.[0] || '?'}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e2e9' }}>{u.display_name}</p>
            <p style={{ fontSize: 11, color: '#4a4a57' }}>@{u.username}</p>
          </div>
        </div>
      )
    },
    { key: 'created_at', label: 'Joined', render: u => <span style={{ color: '#6b6b7a', fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString()}</span> },
    { key: 'follower_count', label: 'Followers', align: 'right', render: u => <span>{(u.follower_count || 0).toLocaleString()}</span> },
    {
      key: 'status', label: 'Status',
      render: u => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {u.is_admin && <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>Admin</span>}
          {u.premium && <span style={{ fontSize: 10, background: 'rgba(124,92,252,0.15)', color: '#7c5cfc', padding: '2px 8px', borderRadius: 999 }}>Pro</span>}
          {u.verified && <span style={{ fontSize: 10, background: 'rgba(34,211,165,0.15)', color: '#22d3a5', padding: '2px 8px', borderRadius: 999 }}>Verified</span>}
          {u.is_banned && <span style={{ fontSize: 10, background: 'rgba(248,113,113,0.15)', color: '#f87171', padding: '2px 8px', borderRadius: 999 }}>Banned</span>}
          {!u.is_admin && !u.is_banned && !u.premium && <span style={{ fontSize: 10, color: '#4a4a57' }}>Member</span>}
        </div>
      )
    },
    {
      key: 'actions', label: '', align: 'right',
      render: u => (
        <div style={{ position: 'relative' }}>
          <button
            onClick={e => { e.stopPropagation(); setActionsFor(actionsFor === u.id ? null : u.id); }}
            style={{ background: 'transparent', border: '1px solid #2e2e3e', borderRadius: 6, padding: '5px 8px', color: '#6b6b7a', cursor: 'pointer' }}
          >
            <MoreHorizontal size={14} />
          </button>
          {actionsFor === u.id && (
            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: '#18181f', border: '1px solid #2e2e3e', borderRadius: 10, padding: '6px', zIndex: 50, minWidth: 170, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
              {[
                { label: u.is_banned ? 'Unban User' : 'Ban User', icon: u.is_banned ? CheckCircle : Ban, color: '#ef4444', onClick: () => { setActionsFor(null); u.is_banned ? unbanUser(u.id, user.id) : setBanTarget(u); } },
                { label: u.is_admin ? 'Revoke Admin' : 'Make Admin', icon: Shield, color: '#7c5cfc', onClick: () => { setActionsFor(null); toggleAdmin(u.id, !u.is_admin, user.id); } },
              ].map(action => (
                <button key={action.label} onClick={action.onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 7, background: 'transparent', border: 'none', color: action.color, fontSize: 13, cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#23232e'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <action.icon size={14} /> {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )
    },
  ];

  return (
    <AdminLayout title="Users" subtitle={`${users.length} results`}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4a4a57' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." style={{ paddingLeft: 32, padding: '7px 12px 7px 32px', background: '#111118', border: '1px solid #2e2e3e', borderRadius: 8, color: '#e2e2e9', fontSize: 13, width: 200 }} />
          </div>
        </div>
      }
    >
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#111118', border: '1px solid #1e1e2e', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(0); }} style={{ padding: '6px 16px', borderRadius: 7, fontSize: 12, fontWeight: filter === f ? 700 : 400, background: filter === f ? '#7c5cfc' : 'transparent', color: filter === f ? '#fff' : '#6b6b7a', border: 'none', cursor: 'pointer', textTransform: 'capitalize' }}>
            {f === 'all' ? 'All Users' : f}
          </button>
        ))}
      </div>

      <AdminTable columns={columns} rows={users} emptyMsg="No users found" />

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '6px 12px', borderRadius: 8, background: 'transparent', border: '1px solid #2e2e3e', color: page === 0 ? '#4a4a57' : '#e2e2e9', cursor: page === 0 ? 'not-allowed' : 'pointer' }}>
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontSize: 13, color: '#6b6b7a' }}>Page {page + 1}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={users.length < 20} style={{ padding: '6px 12px', borderRadius: 8, background: 'transparent', border: '1px solid #2e2e3e', color: users.length < 20 ? '#4a4a57' : '#e2e2e9', cursor: users.length < 20 ? 'not-allowed' : 'pointer' }}>
          <ChevronRight size={14} />
        </button>
      </div>

      {banTarget && <BanModal user={banTarget} onConfirm={handleBan} onClose={() => setBanTarget(null)} />}
      {actionsFor && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setActionsFor(null)} />}
    </AdminLayout>
  );
}
