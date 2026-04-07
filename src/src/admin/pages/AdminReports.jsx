import { useEffect, useState } from 'react';
import { Flag, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAdminStore } from '../adminStore';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../services/supabase';
import AdminLayout from '../components/AdminLayout';
import AdminTable from '../components/AdminTable';

const STATUS_COLORS = {
  pending: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
  reviewed: { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa' },
  resolved: { bg: 'rgba(34,211,165,0.12)', color: '#22d3a5' },
  dismissed: { bg: 'rgba(107,107,122,0.12)', color: '#6b6b7a' },
};

const FILTERS = ['pending', 'reviewed', 'resolved', 'dismissed', 'all'];

export default function AdminReports() {
  const { user } = useAuthStore();
  const { reports, fetchReports, resolveReport } = useAdminStore();
  const [filter, setFilter] = useState('pending');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    fetchReports({ filter });

    // Real-time new reports
    const sub = supabase.channel('admin-reports')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, () => fetchReports({ filter }))
      .subscribe();
    return () => sub.unsubscribe();
  }, [filter]);

  const columns = [
    {
      key: 'type', label: 'Type',
      render: r => (
        <span style={{ fontSize: 11, fontWeight: 700, background: '#1e1e2e', color: '#c8c8d4', padding: '3px 9px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          {r.target_type}
        </span>
      )
    },
    {
      key: 'reporter', label: 'Reported By',
      render: r => <span style={{ fontSize: 12, color: '#8e8e99' }}>@{r.reporter?.username || 'anonymous'}</span>
    },
    { key: 'reason', label: 'Reason', render: r => <span style={{ fontSize: 12, color: '#c8c8d4' }}>{r.reason}</span> },
    { key: 'created_at', label: 'Reported', render: r => <span style={{ fontSize: 11, color: '#4a4a57' }}>{new Date(r.created_at).toLocaleDateString()}</span> },
    {
      key: 'status', label: 'Status',
      render: r => {
        const s = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
        return <span style={{ fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, padding: '3px 9px', borderRadius: 999, textTransform: 'capitalize' }}>{r.status}</span>;
      }
    },
    {
      key: 'actions', label: '', align: 'right',
      render: r => r.status === 'pending' ? (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button onClick={() => setDetail(r)} style={{ padding: '5px 10px', borderRadius: 6, background: 'transparent', border: '1px solid #2e2e3e', color: '#6b6b7a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            <Eye size={12} /> Review
          </button>
        </div>
      ) : null
    },
  ];

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <AdminLayout title="Reports" subtitle={filter === 'pending' ? `${pendingCount} pending review` : `${reports.length} ${filter} reports`}>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#111118', border: '1px solid #1e1e2e', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 7, fontSize: 12, fontWeight: filter === f ? 700 : 400, background: filter === f ? (f === 'pending' ? '#fbbf24' : '#7c5cfc') : 'transparent', color: filter === f ? (f === 'pending' ? '#000' : '#fff') : '#6b6b7a', border: 'none', cursor: 'pointer', textTransform: 'capitalize' }}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      <AdminTable columns={columns} rows={reports} emptyMsg={`No ${filter} reports`} />

      {/* Detail modal */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setDetail(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111118', border: '1px solid #2e2e3e', borderRadius: 16, padding: 28, width: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Flag size={18} color="#ef4444" /></div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>Report Review</h3>
                <p style={{ fontSize: 12, color: '#6b6b7a' }}>Submitted {new Date(detail.created_at).toLocaleString()}</p>
              </div>
            </div>

            {[['Type', detail.target_type], ['Reported by', `@${detail.reporter?.username || 'anonymous'}`], ['Reason', detail.reason]].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: '#6b6b7a', width: 90, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 13, color: '#c8c8d4', textTransform: label === 'Type' ? 'capitalize' : 'none' }}>{val}</span>
              </div>
            ))}

            {detail.details && (
              <div style={{ background: '#0d0d14', borderRadius: 8, padding: 12, marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: '#8e8e99', lineHeight: 1.6 }}>{detail.details}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { resolveReport(detail.id, 'dismissed', user.id); setDetail(null); }} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'transparent', border: '1px solid #2e2e3e', color: '#6b6b7a', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <XCircle size={14} /> Dismiss
              </button>
              <button onClick={() => { resolveReport(detail.id, 'reviewed', user.id); setDetail(null); }} style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#60a5fa', border: 'none', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Eye size={14} /> Mark Reviewed
              </button>
              <button onClick={() => { resolveReport(detail.id, 'resolved', user.id); setDetail(null); }} style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#22d3a5', border: 'none', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <CheckCircle size={14} /> Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
