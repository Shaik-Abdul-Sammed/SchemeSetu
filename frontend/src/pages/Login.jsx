import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem' }}>
      <div style={{ maxWidth: '440px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '2.25rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#1D4ED8', marginBottom: '0.75rem' }}>
              <ShieldCheck size={28} />
            </div>
            <h1 style={{ fontSize: '1.6rem', color: '#0B192C', marginBottom: '0.25rem' }}>Citizen Portal Login</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Access saved schemes and tracked applications</p>
          </div>

          {error && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="ramesh@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              {loading ? 'Logging in...' : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#64748B' }}>
            Don't have an account? <Link to="/register" style={{ color: '#D97706', fontWeight: 600 }}>Register as Citizen</Link>
          </div>

          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '6px', fontSize: '0.8rem', color: '#475569' }}>
            💡 Demo Credentials:<br />
            Email: <strong>ramesh@example.com</strong> | Password: <strong>password123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
