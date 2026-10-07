import { useState } from 'react';
import { Gift, Lock, Mail, User } from 'lucide-react';
import axios from '../../api/client';

export default function Login({ setAuth }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: 'Demo Player', email: 'player@example.com', password: 'password123', floor: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await axios.post(`/auth/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          floor: formData.floor
        });
      }

      const res = await axios.post(`/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      sessionStorage.setItem('cmcc_access_token', res.data.data.access_token);
      sessionStorage.setItem('cmcc_refresh_token', res.data.data.refresh_token);
      setAuth(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top right, #11201a, var(--bg-color))' }}>
      <div className="card animate-in" style={{ width: '100%', maxWidth: '400px', padding: '40px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))', color: 'white', marginBottom: '16px', boxShadow: 'var(--glow-red)' }}>
            <Gift size={28} />
          </div>
          <h2 className="cursive-title" style={{ marginBottom: '8px' }}>Chris Mom & Child</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Sign in to continue to the game</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ paddingLeft: '36px' }}
                    placeholder="Your name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required={isRegister}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Floor</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="input-field" 
                    style={{ paddingLeft: '12px', appearance: 'none', backgroundColor: 'var(--bg-card)', color: 'white' }}
                    value={formData.floor}
                    onChange={e => setFormData({...formData, floor: e.target.value})}
                    required={isRegister}
                  >
                    <option value="" disabled>Select Floor</option>
                    <option value="7th Floor">7th Floor</option>
                    <option value="8th Floor">8th Floor</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input 
                type="email" 
                className="input-field" 
                style={{ paddingLeft: '36px' }}
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input 
                type="password" 
                className="input-field" 
                style={{ paddingLeft: '36px' }}
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          {error && <div style={{ color: 'var(--error)', fontSize: '12px', textAlign: 'center', background: 'rgba(230, 57, 70, 0.1)', padding: '8px', borderRadius: '6px' }}>{error}</div>}

          <button type="submit" className="button-primary" style={{ marginTop: '8px', height: '44px' }} disabled={loading}>
            {loading ? <span className="spinner"></span> : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <button 
            type="button" 
            onClick={() => setFormData({ name: 'Admin', email: 'admin@example.com', password: 'admin' })}
            style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--accent-secondary)', borderRadius: '6px', color: 'var(--accent-secondary)', fontSize: '12px' }}
          >
            Fill Admin
          </button>
          <button 
            type="button" 
            onClick={() => setFormData({ name: 'Demo Mom', email: 'mom@example.com', password: 'user' })}
            style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--accent-primary)', borderRadius: '6px', color: 'var(--accent-primary)', fontSize: '12px' }}
          >
            Fill User
          </button>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          {isRegister ? 'Already have an account? ' : 'Need an account? '}
          <button 
            type="button" 
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ color: 'var(--accent-secondary)', fontWeight: 600, padding: 0, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {isRegister ? 'Sign in' : 'Create one'}
          </button>
        </div>
      </div>
    </div>
  );
}
