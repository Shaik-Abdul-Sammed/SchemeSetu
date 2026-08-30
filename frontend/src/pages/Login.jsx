import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LogIn, ShieldCheck, AlertCircle, Zap, UserCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('loginSubtitle', 'Please enter both email address and password.'));
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

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login initialization failed. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem' }}>
      <div style={{ maxWidth: '440px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '2.25rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#1D4ED8', marginBottom: '0.75rem' }}>
              <ShieldCheck size={28} />
            </div>
            <h1 style={{ fontSize: '1.6rem', color: '#0B192C', marginBottom: '0.25rem', fontWeight: 800 }}>{t('loginTitle', 'Citizen Login')}</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>{t('loginSubtitle', 'Sign in to access your saved schemes and applications')}</p>
          </div>

          {/* ⚡ 1-CLICK DEMO LOGIN BUTTON (SIH 2026) */}
          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
              ⚡ SIH 2026 Demonstration
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                fontWeight: 800,
                fontSize: '0.95rem',
                backgroundColor: '#D97706',
                borderColor: '#B45309',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Zap size={18} />
              <span>{demoLoading ? 'Launching Demo...' : t('demoLoginBtn', '⚡ 1-Click Demo Login')}</span>
            </button>
            <div style={{ fontSize: '0.78rem', color: '#78350F', marginTop: '0.4rem', fontWeight: 500 }}>
              {t('demoLoginSubtitle', 'Instant access with preloaded sample citizen profile & applications')}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>or sign in manually</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
          </div>

          {error && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('emailAddress', 'Email Address')}</label>
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
              <label className="form-label">{t('passwordLabel', 'Password')}</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}>
              {loading ? t('signingIn', 'Signing In...') : <><LogIn size={16} /> {t('signIn', 'Sign In')}</>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#64748B' }}>
            {t('noAccount', "Don't have an account?")} <Link to="/register" style={{ color: '#D97706', fontWeight: 700 }}>{t('registerLink', 'Register as Citizen')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
