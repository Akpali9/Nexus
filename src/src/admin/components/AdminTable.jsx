export default function AdminTable({ columns, rows, emptyMsg = 'No data found' }) {
  return (
    <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
            {columns.map(col => (
              <th key={col.key} style={{ padding: '12px 16px', textAlign: col.align || 'left', fontSize: 11, fontWeight: 700, color: '#6b6b7a', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', background: '#0d0d14' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: '#4a4a57', fontSize: 13 }}>{emptyMsg}</td></tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id || i} style={{ borderBottom: '1px solid #16161f' }}
                onMouseEnter={e => e.currentTarget.style.background = '#13131c'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '12px 16px', fontSize: 13, color: '#c8c8d4', textAlign: col.align || 'left', verticalAlign: 'middle' }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
