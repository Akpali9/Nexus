import { useEffect } from 'react';
import { DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAdminStore } from '../adminStore';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../services/supabase';
import AdminLayout from '../components/AdminLayout';
import AdminTable from '../components/AdminTable';

const STATUS_STYLE = {
  pending: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', icon: Clock },
  processing: { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', icon: Clock },
  completed: { bg: 'rgba(34,211,165,0.12)', color: '#22d3a5', icon: CheckCircle },
  failed: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', icon: XCircle },
};

export default function AdminFinancials() {
  const { user } = useAuthStore();
  const { withdrawals, fetchWithdrawals, processWithdrawal, stats } = useAdminStore();

  useEffect(() => {
    fetchWithdrawals();
    const sub = supabase.channel('admin-withdrawals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, fetchWithdrawals)
      .subscribe();
    return () => sub.unsubscribe();
  }, []);

  const pending = withdrawals.filter(w => w.status === 'pending');
  const totalPending = pending.reduce((s, w) => s + (w.amount || 0), 0);

  const columns = [
    {
      key: 'user', label: 'Creator',
      render: w => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#7c5cfc', flexShrink: 0 }}>
            {w.user?.display_name?.[0] || '?'}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e2e9' }}>{w.user?.display_name}</p>
            <p style={{ fontSize: 11, color: '#4a4a57' }}>@{w.user?.username}</p>
          </div>
        </div>
      )
    },
    { key: 'amount', label: 'Amount', align: 'right', render: w => <span style={{ fontWeight: 700, fontSize: 14, color: '#22d3a5' }}>${(w.amount || 0).toFixed(2)}</span> },
    { key: 'payment_method', label: 'Method', render: w => <span style={{ fontSize: 12, color: '#8e8e99' }}>{w.payment_method || 'Bank Transfer'}</span> },
    { key: 'created_at', label: 'Requested', render: w => <span style={{ fontSize: 11, color: '#4a4a57' }}>{new Date(w.created_at).toLocaleDateString()}</span> },
    {
      key: 'status', label: 'Status',
      render: w => {
        const s = STATUS_STYLE[w.status] || STATUS_STYLE.pending;
        const Icon = s.icon;
        return <span style={{ fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, padding: '3px 9px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon size={10} /> {w.status}</span>;
      }
    },
    {
      key: 'actions', label: '', align: 'right',
      render: w => w.status === 'pending' ? (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button onClick={() => processWithdrawal(w.id, 'completed', user.id)} style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.3)', color: '#22d3a5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
            <CheckCircle size={11} /> Approve
          </button>
          <button onClick={() => processWithdrawal(w.id, 'failed', user.id)} style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
            <XCircle size={11} /> Reject
          </button>
        </div>
      ) : null
    },
  ];

  return (
    <AdminLayout title="Financials" subtitle={`${pending.length} pending withdrawals · $${totalPending.toFixed(2)} queued`}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toFixed(2)}`, color: '#22d3a5' },
          { label: 'Pending Payouts', value: `$${totalPending.toFixed(2)}`, color: '#fbbf24' },
          { label: 'Withdrawal Requests', value: pending.length, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 10, padding: '16px 20px' }}>
            <p style={{ fontWeight: 800, fontSize: 24, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 12, color: '#6b6b7a', marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>
      <AdminTable columns={columns} rows={withdrawals} emptyMsg="No withdrawal requests" />
    </AdminLayout>
  );
}
