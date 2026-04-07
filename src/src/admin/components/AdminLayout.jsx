import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children, title, subtitle, actions }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080810', color: '#e2e2e9' }}>
      <AdminSidebar />
      <main style={{ flex: 1, marginLeft: 220, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0d0d14', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.3px' }}>{title}</h1>
            {subtitle && <p style={{ fontSize: 13, color: '#6b6b7a', marginTop: 2 }}>{subtitle}</p>}
          </div>
          {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
        </div>
        <div style={{ flex: 1, padding: '24px 28px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
