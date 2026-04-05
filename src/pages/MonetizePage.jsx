import { useState } from 'react'
import { DollarSign, TrendingUp, Users, Eye, CreditCard, Gift, Star, Zap, ArrowUpRight, ArrowDownRight, BarChart3, CheckCircle } from 'lucide-react'

const EARNINGS_DATA = [
  { month: 'Oct', amount: 820 },
  { month: 'Nov', amount: 1240 },
  { month: 'Dec', amount: 980 },
  { month: 'Jan', amount: 1680 },
  { month: 'Feb', amount: 2100 },
  { month: 'Mar', amount: 2440 },
]

const REVENUE_SOURCES = [
  { name: 'Live Gifts', amount: 1240, pct: 51, color: '#f472b6', icon: Gift },
  { name: 'Subscriptions', amount: 680, pct: 28, color: '#7c5cfc', icon: Star },
  { name: 'Creator Fund', amount: 320, pct: 13, color: '#22d3a5', icon: Zap },
  { name: 'Paid Posts', amount: 200, pct: 8, color: '#fbbf24', icon: DollarSign },
]

const PLANS = [
  {
    name: 'Creator', price: 0, color: 'var(--text-secondary)',
    features: ['Up to 1K followers monetized', 'Basic analytics', 'Gift receiving', 'Creator fund eligible'],
    current: false,
  },
  {
    name: 'Pro Creator', price: 9.99, color: '#7c5cfc',
    features: ['Unlimited follower monetization', 'Advanced analytics', '80% gift revenue share', 'Priority in explore', 'Verified badge eligible', 'Subscription tiers'],
    current: true,
  },
  {
    name: 'Studio', price: 29.99, color: '#f472b6',
    features: ['Everything in Pro', '90% revenue share', 'Dedicated support', 'Custom brand integration', 'API access', 'Team collaboration'],
    current: false,
  },
]

function MiniBarChart({ data }) {
  const max = Math.max(...data.map(d => d.amount))
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80 }}>
      {data.map((d, i) => (
        <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: '100%', borderRadius: '4px 4px 0 0',
            height: `${(d.amount / max) * 100}%`,
            background: i === data.length - 1 ? 'var(--accent-primary)' : 'var(--bg-active)',
            transition: 'height 0.5s ease', minHeight: 4,
          }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.month}</span>
        </div>
      ))}
    </div>
  )
}

export default function MonetizePage() {
  const [tab, setTab] = useState('overview')
  const [withdrawing, setWithdrawing] = useState(false)

  const stats = [
    { label: 'Total Earned', value: '$2,440', sub: '+16% this month', up: true, icon: DollarSign, color: '#22d3a5' },
    { label: 'Available', value: '$890', sub: 'Ready to withdraw', up: null, icon: CreditCard, color: '#7c5cfc' },
    { label: 'Profile Views', value: '48.2K', sub: '+8% this week', up: true, icon: Eye, color: '#fbbf24' },
    { label: 'New Followers', value: '+341', sub: 'This month', up: true, icon: Users, color: '#f472b6' },
  ]

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, marginBottom: 4 }}>
          <span className="gradient-text">Monetize</span> Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Track your earnings and grow your creator income</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-subtle)', marginBottom: 24 }}>
        {['overview', 'earnings', 'plans'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', fontSize: 14, fontWeight: tab === t ? 600 : 400,
            color: tab === t ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: tab === t ? '2px solid var(--accent-primary)' : '2px solid transparent',
            background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--accent-primary)' : '2px solid transparent',
            cursor: 'pointer', transition: 'all 150ms', textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="fade-in">
          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
            {stats.map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} color={s.color} />
                    </div>
                    {s.up !== null && (
                      <span style={{ fontSize: 12, color: s.up ? '#22d3a5' : '#f87171', display: 'flex', alignItems: 'center', gap: 2 }}>
                        {s.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        {s.sub.split(' ')[0]}
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginBottom: 2 }}>{s.value}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              )
            })}
          </div>

          {/* Earnings chart */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>Earnings Trend</h3>
              <span style={{ fontSize: 12, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ArrowUpRight size={13} /> +16% vs last month
              </span>
            </div>
            <MiniBarChart data={EARNINGS_DATA} />
          </div>

          {/* Revenue breakdown */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Revenue Sources</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {REVENUE_SOURCES.map(s => {
                const Icon = s.icon
                return (
                  <div key={s.name}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={14} color={s.color} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>${s.amount}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>{s.pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-active)', borderRadius: 999 }}>
                      <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: 999, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Withdraw */}
          <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, rgba(124,92,252,0.08), rgba(244,114,182,0.08))' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Available to withdraw</p>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28 }} className="gradient-text">$890.00</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Transfers in 1–3 business days</p>
              </div>
              <button onClick={() => setWithdrawing(true)} className="btn-primary" style={{ padding: '12px 24px', fontSize: 15 }}>
                <CreditCard size={16} /> Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'earnings' && (
        <div className="fade-in">
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>Transaction History</h3>
              <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }}>Export CSV</button>
            </div>
            {[
              { desc: 'Live gifts from stream', amount: '+$124.00', date: 'Mar 15, 2025', type: 'gift', color: '#f472b6' },
              { desc: 'Monthly subscriptions', amount: '+$68.00', date: 'Mar 14, 2025', type: 'sub', color: '#7c5cfc' },
              { desc: 'Creator fund payout', amount: '+$32.00', date: 'Mar 12, 2025', type: 'fund', color: '#22d3a5' },
              { desc: 'Withdrawal to bank', amount: '-$500.00', date: 'Mar 10, 2025', type: 'withdraw', color: '#f87171' },
              { desc: 'Live gifts from stream', amount: '+$89.00', date: 'Mar 8, 2025', type: 'gift', color: '#f472b6' },
              { desc: 'Sponsored post', amount: '+$200.00', date: 'Mar 5, 2025', type: 'sponsor', color: '#fbbf24' },
            ].map((tx, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
                borderBottom: '1px solid var(--border-subtle)', transition: 'background 150ms',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${tx.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {tx.type === 'gift' ? '🎁' : tx.type === 'sub' ? '⭐' : tx.type === 'fund' ? '⚡' : tx.type === 'withdraw' ? '🏦' : '💰'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{tx.desc}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tx.date}</p>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: tx.amount.startsWith('+') ? '#22d3a5' : '#f87171' }}>{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'plans' && (
        <div className="fade-in">
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Upgrade to unlock more revenue tools and higher earning potential.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {PLANS.map(plan => (
              <div key={plan.name} style={{
                background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
                border: plan.current ? `2px solid ${plan.color}` : '1px solid var(--border-subtle)',
                padding: 24, position: 'relative', overflow: 'hidden',
              }}>
                {plan.current && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: plan.color, color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>CURRENT</div>
                )}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{plan.name}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: plan.current ? plan.color : 'var(--text-primary)' }}>
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    {plan.price > 0 && <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span>}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <CheckCircle size={14} style={{ color: plan.current ? plan.color : 'var(--text-muted)', flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button style={{
                  width: '100%', padding: '10px', borderRadius: 999, fontSize: 14, fontWeight: 600,
                  background: plan.current ? 'transparent' : plan.color,
                  color: plan.current ? plan.color : 'white',
                  border: plan.current ? `1px solid ${plan.color}` : 'none',
                  cursor: 'pointer', transition: 'all 150ms',
                }}>
                  {plan.current ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {withdrawing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setWithdrawing(false)}>
          <div onClick={e => e.stopPropagation()} className="card fade-in" style={{ width: 420, padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Withdraw Funds</h3>
            <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Available balance</p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }} className="gradient-text">$890.00</p>
            </div>
            <input className="input-field" placeholder="Amount to withdraw" style={{ marginBottom: 12 }} defaultValue="890.00" />
            <input className="input-field" placeholder="Bank account (ending in 4242)" style={{ marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setWithdrawing(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={() => setWithdrawing(false)} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <CreditCard size={15} /> Withdraw $890
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
