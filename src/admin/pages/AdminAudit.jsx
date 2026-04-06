import { useEffect } from 'react';
import { ScrollText, RefreshCw } from 'lucide-react';
import { useAdminStore } from '../adminStore';
import { supabase } from '../../services/supabase';
import AdminLayout from '../components/AdminLayout';

const ACTION_COLOR = {
  ban_user: '#ef4444', unban_user: '#22d3a5',
  grant_admin: '#7c5cfc', revoke_admin: '#f472b6',
  delete_post: '#ef4444',
  report_resolved: '#22d3a5', report_dismissed: '#6b6b7a', report_reviewed: '#60a5fa',
  withdrawal_completed: '#22d3a5', withdrawal_failed: '#ef4444',
  end_stream: '#fbbf24',
};

export default function AdminAudit() {
  const { auditLogs, fetchAuditLogs } = useAdminStore();

  useEffect(() => {
    fetchAuditLogs();
    const sub = supabase.channel('admin-audit')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_logs' }, fetchAuditLogs)
      .subscribe();
    return () => sub.unsubscribe();
  }, []);

  return (
    <AdminLayout
      title="Audit Log"
      subtitle={`${auditLogs.length} recorded actions`}
      actions={
        <button onClick={fetchAuditLogs} style={{ padding: '7px 14px', borderRadius: 8, background: '#111118', border: '1px solid #2e2e3e', color: '#8e8e99', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      }
    >
      <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, overflow: 'hidden' }}>
        {auditLogs.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <ScrollText size={32} style={{ margin: '0 auto 12px', color: '#4a4a57' }} />
            <p style={{ color: '#4a4a57', fontSize: 13 }}>No admin actions recorded yet</p>
          </div>
        ) : (
          auditLogs.map((log, i) => {
            const color = ACTION_COLOR[log.action] || '#6b6b7a';
            return (
              <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 20px', borderBottom: i < auditLogs.length - 1 ? '1px solid #16161f' : 'none' }}>
                {/* Timeline dot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}66` }} />
                  {i < auditLogs.length - 1 && <div style={{ width: 1, height: '100%', background: '#1e1e2e', marginTop: 6 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: '#c8c8d4', lineHeight: 1.5 }}>
                    <strong style={{ color: '#7c5cfc' }}>{log.admin?.display_name || 'Admin'}</strong>
                    {' '}
                    <span style={{ color }}>{log.action.replace(/_/g, ' ')}</span>
                    {log.target_type && <span style={{ color: '#4a4a57' }}> · {log.target_type}</span>}
                  </p>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <p style={{ fontSize: 11, color: '#4a4a57', marginTop: 3 }}>
                      {Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                </div>
                <p style={{ fontSize: 11, color: '#4a4a57', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
}
