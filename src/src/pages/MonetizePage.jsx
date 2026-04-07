import { useState, useEffect } from 'react';
import { DollarSign, Gift, Star, TrendingUp, CreditCard, ArrowUpRight, Zap } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import Sidebar from '../components/layout/Sidebar';

const PLANS = [
  { id: 'creator', label: 'Creator', price: 0, features: ['Up to $500/mo earnings', 'Basic analytics', 'Gift receiving'], color: '#7c5cfc' },
  { id: 'pro', label: 'Pro', price: 9.99, features: ['Unlimited earnings', 'Advanced analytics', 'Priority support', 'Custom subscription tiers'], color: '#f472b6' },
  { id: 'studio', label: 'Studio', price: 29.99, features: ['Everything in Pro', 'Team management', 'API access', 'Dedicated account manager'], color: '#fbbf24' },
];

export default function MonetizePage() {
  const { user, profile } = useAuthStore();
  const [totalEarned, setTotalEarned] = useState(0);
  const [available, setAvailable] = useState(0);
  const [recentGifts, setRecentGifts] = useState([]);
  const [recentSubs, setRecentSubs] = useState([]);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchEarnings = async () => {
      // Gifts received
      const { data: gifts } = await supabase
        .from('gifts')
        .select('*, sender:profiles(display_name, username)')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Subscriptions
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('*, subscriber:profiles(display_name, username)')
        .eq('creator_id', user.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(5);

      if (gifts) {
        setRecentGifts(gifts);
        const giftTotal = gifts.reduce((s, g) => s + (g.creator_earnings || 0), 0);
        setTotalEarned(giftTotal);
        setAvailable(giftTotal);
      }
      if (subs) setRecentSubs(subs);
    };

    fetchEarnings();

    // Real-time gift notifications
    const giftSub = supabase
      .channel('monetize-gifts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gifts' }, (payload) => {
        if (payload.new.recipient_id === user.id) {
          setTotalEarned(prev => prev + (payload.new.creator_earnings || 0));
          setAvailable(prev => prev + (payload.new.creator_earnings || 0));
          setRecentGifts(prev => [payload.new, ...prev.slice(0, 4)]);
        }
      })
      .subscribe();

    return () => giftSub.unsubscribe();
  }, [user]);

  const handleWithdraw = async () => {
    if (available <= 0) return;
    setWithdrawing(true);
    await supabase.from('withdrawals').insert({
      user_id: user.id,
      amount: available,
      status: 'pending',
      payment_method: 'bank_transfer',
    });
    setAvailable(0);
    setWithdrawing(false);
  };

  const currentPlan = profile?.plan || 'creator';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 'var(--sidebar-width)', padding: '24px', maxWidth: 900 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 24 }}>
          <span className="gradient-text">Monetize</span>
        </h1>

        {/* Balance cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, var(--accent-primary), #a855f7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <DollarSign size={16} color="rgba(255,255,255,0.8)" />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Total Earned</span>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'white' }}>
              ${totalEarned.toFixed(2)}
            </p>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <CreditCard size={16} style={{ color: 'var(--accent-green)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Available</span>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28 }}>${available.toFixed(2)}</p>
            <button
              onClick={handleWithdraw}
              disabled={available <= 0 || withdrawing}
              className="btn-primary"
              style={{ marginTop: 12, padding: '6px 16px', fontSize: 12, width: '100%', justifyContent: 'center' }}
            >
              {withdrawing ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <TrendingUp size={16} style={{ color: '#fbbf24' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Active Subs</span>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28 }}>{recentSubs.length}</p>
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Gift size={14} style={{ color: '#fbbf24' }} /> Recent Gifts
            </h3>
            {recentGifts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No gifts yet</p>
            ) : (
              recentGifts.map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: 11 }}>
                    {g.sender?.display_name?.[0] || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{g.sender?.display_name || 'Anonymous'}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.gift_type}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#22d3a5' }}>+${g.creator_earnings?.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={14} style={{ color: 'var(--accent-primary)' }} /> Subscribers
            </h3>
            {recentSubs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No subscribers yet</p>
            ) : (
              recentSubs.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: 11 }}>
                    {s.subscriber?.display_name?.[0] || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{s.subscriber?.display_name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.tier} tier</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#22d3a5' }}>+${s.creator_earnings?.toFixed(2)}/mo</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Plans */}
        <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Plans</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className="card"
              style={{
                padding: 20,
                border: currentPlan === plan.id ? `2px solid ${plan.color}` : '1px solid var(--border-subtle)',
                position: 'relative',
              }}
            >
              {currentPlan === plan.id && (
                <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 999 }}>
                  CURRENT
                </span>
              )}
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${plan.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Zap size={18} color={plan.color} />
              </div>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{plan.label}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginBottom: 12 }}>
                {plan.price === 0 ? 'Free' : `$${plan.price}/mo`}
              </p>
              {plan.features.map(f => (
                <p key={f} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ArrowUpRight size={11} color={plan.color} /> {f}
                </p>
              ))}
              {currentPlan !== plan.id && (
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16, background: plan.color }}>
                  Upgrade
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
