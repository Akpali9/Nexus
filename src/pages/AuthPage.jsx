import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, username, displayName);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '24px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', textAlign: 'center', marginBottom: '24px' }}>
          <span className="gradient-text">Nexus</span>
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ marginBottom: '12px' }}
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ marginBottom: '12px' }}
          />
          {!isLogin && (
            <>
              <input
                className="input-field"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ marginBottom: '12px' }}
              />
              <input
                className="input-field"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                style={{ marginBottom: '12px' }}
              />
            </>
          )}
          {error && <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
