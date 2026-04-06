import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Gift, Star, CreditCard, ArrowUpRight } from 'lucide-react';
import { supabase } from '../../services/supabase';

const S = {
  page: { padding: '28px 32px' },
  h1: { fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 },
  sub: { fontSize: 13, color: '#5a5a72', marginBottom: 24 },
  card: { background: '#0d0d18', border: '1px solid #1e1e2e', borderRadius: 14, padding: 20 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  th: { padding: '10px 14px', fontSize: 11, color: '#5a5a72', textAlign: 'left', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #1e1e2e' },
  td: { padding: '12px 14px', fontSize: 13, color: '#c2c2d4', borderBottom: '1px solid #13131e', verticalAlign: 'middle' },
};

export default function AdminRevenue() {
  const [data, setData] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [subs, setSubs] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [
        { data: allGifts },
        { data: allSubs },
        { data: allWithdrawals },
        { count: activeSubs },
      ] = await Promise.all([
        supabase.from('gifts').select('amount,platform_fee,creator_earnings,created_at,gift_type,sender:profiles(display_name),recipient:profiles(display_name)').order('created_at', { ascending: false }).limit(10),
        supabase.from('subscriptions').select('amount,platform_fee,creator_earnings,tier,status,started_at,subscriber:profiles(display_name),creator:profiles(display_name)').order('started_at', { ascending: false }).limit(10),
        supabase.from('withdrawals').select('amount,status,created_at,user:profiles(display_name)').order('created_at', { ascending: false }).limit(10),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      const totalGiftRevenue = allGifts?.reduce((s, g) => s + (g.platform_fee || 0), 0) || 0;
      const totalSubRevenue = allSubs?.reduce((s, g) => s + (g.platform_fee || 0), 0) || 0;
      const pendingWithdrawals = allWithdrawals?.filter(w => w.status === 'pending').reduce((s, w) => s + (w.amount || 0), 0) || 0;

      setData({
        giftRevenue: totalGiftRevenue.toFixed(2),
        subRevenue: totalSubRevenue.toFixed(2),
        totalRevenue: (totalGiftRevenue + totalSubRevenue).toFixed(2),
        activeSubs: activeSubs || 0,
        pendingWithdrawals: pendingWithdrawals.toFixed(2),
      });
      setGifts(allGifts || []);
      setSubs(allSubs || []);
      setWithdrawals(allWithdrawals || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const approveWithdrawal = async (id) => {
    await supabase.from('withdrawals').update({ status: 'processing', processed_at: new Date().toISOString() }).eq('id', id);
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'processing' } : w));
  };

  const STATUS_COLOR = { pending: '#fbbf24', processing: '#60a5fa', completed: '#22d3a5', failed: '#f87171' };
  const TIER_COLOR = { basic: '#5a5a72', standard: '#7c5cfc', premium: '#fbbf24' };

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Revenue & Payments</h1>
      <p style={S.sub}>Platform earnings overview</p>

      <div style={S.grid3}>
        {[
          { icon: DollarSign, label: 'Total Platform Revenue', value: `$${data?.totalRevenue || '—'}`, color: '#22d3a5' },
          { icon: Gift, label: 'Gift Revenue', value: `$${data?.giftRevenue || '—'}`, color: '#fbbf24' },
          { icon: Star, label: 'Subscription Revenue', value: `$${data?.subRevenue || '—'}`, color: '#7c5cfc' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={S.card}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon size={17} color={color} />
            </div>
            <p style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 11, color: '#5a5a72', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={S.grid2}>
        {/* Recent Gifts */}
        <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Gift size={15} color="#fbbf24" />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Recent Gifts</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['From → To', 'Type', 'Amount', 'Platform Cut'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={4} style={{ ...S.td, textAlign: 'center', color: '#5a5a72', padding: 30 }}>Loading...</td></tr>
                : gifts.map((g, i) => (
                  <tr key={i}>
                    <td style={S.td}>
                      <p style={{ fontSize: 12, color: '#e2e2e9' }}>{g.sender?.display_name}</p>
                      <p style={{ fontSize: 11, color: '#5a5a72' }}>→ {g.recipient?.display_name}</p>
                    </td>
                    <td style={{ ...S.td, fontSize: 11 }}>{g.gift_type}</td>
                    <td style={{ ...S.td, color: '#22d3a5', fontWeight: 600 }}>${g.amount?.toFixed(2)}</td>
                    <td style={{ ...S.td, color: '#fbbf24', fontWeight: 600 }}>${g.platform_fee?.toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Withdrawals */}
        <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={15} color="#60a5fa" />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Withdrawal Requests</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['User', 'Amount', 'Status', 'Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={4} style={{ ...S.td, textAlign: 'center', color: '#5a5a72', padding: 30 }}>Loading...</td></tr>
                : withdrawals.map((w, i) => (
                  <tr key={i}>
                    <td style={S.td}>
                      <p style={{ fontSize: 13, color: '#e2e2e9' }}>{w.user?.display_name}</p>
                      <p style={{ fontSize: 11, color: '#5a5a72' }}>{new Date(w.created_at).toLocaleDateString()}</p>
                    </td>
                    <td style={{ ...S.td, color: '#e2e2e9', fontWeight: 600 }}>${w.amount?.toFixed(2)}</td>
                    <td style={S.td}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: `${STATUS_COLOR[w.status] || '#5a5a72'}20`, color: STATUS_COLOR[w.status] || '#5a5a72' }}>
                        {w.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={S.td}>
                      {w.status === 'pending' && (
                        <button onClick={() => approveWithdrawal(w.id)}
                          style={{ fontSize: 11, padding: '5px 12px', borderRadius: 7, background: '#22d3a520', color: '#22d3a5', border: '1px solid #22d3a540', cursor: 'pointer', fontWeight: 600 }}>
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
