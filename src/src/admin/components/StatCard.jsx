export default function StatCard({ label, value, change, changeLabel, icon: Icon, color = '#7c5cfc', sub }) {
  const isPositive = change > 0;
  return (
    <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
        {change !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 700, color: isPositive ? '#22d3a5' : '#f87171', background: isPositive ? 'rgba(34,211,165,0.12)' : 'rgba(248,113,113,0.12)', padding: '3px 8px', borderRadius: 999 }}>
            {isPositive ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p style={{ fontWeight: 800, fontSize: 28, color: '#fff', lineHeight: 1, marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 12, color: '#6b6b7a' }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: '#4a4a57', marginTop: 4 }}>{sub}</p>}
    </div>
  );
}
