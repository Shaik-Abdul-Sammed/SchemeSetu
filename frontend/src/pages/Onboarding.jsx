import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Phone, CheckCircle, Globe, Award, HeartHandshake, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { lang, changeLanguage, t, availableLanguages } = useLanguage();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuestAccess = () => {
    localStorage.setItem('schemesetu_is_guest', 'true');
    navigate('/input');
  };

  // One-Click Quick Demo for SIH 2026 Presentation
  const handleQuickDemo = () => {
    const demoCriteria = {
      income: 240000,
      cost: 350000,
      education: '10th pass',
      projectType: 'business',
      occupation: 'Farmer'
    };
    navigate('/results', { state: { criteria: demoCriteria } });
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return;
    setShowOtp(true);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login('guest_user@schemesetu.in', 'dummy_jwt_token_123');
      setLoading(false);
      navigate('/input');
    }, 800);
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="container py-8">
      {/* Top Header Logos & Government Badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Award style={{ color: '#D97706' }} size={20} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('govtOfIndia', 'Govt of India')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <HeartHandshake style={{ color: '#059669' }} size={20} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('mosjeInitiative', 'MoSJE Initiative')}</span>
          </div>
        </div>

        <button
          onClick={handleQuickDemo}
          className="btn btn-secondary btn-sm"
          style={{ borderColor: '#F59E0B', color: '#D97706', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Zap size={15} style={{ color: '#F59E0B' }} />
          <span>Quick Demo Showcase (SIH 2026)</span>
        </button>
      </div>

      {/* Main Onboarding Card */}
      <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }} className="glass-card card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {/* SchemeSetu AI Assistant Avatar */}
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #1E3E62, #0B192C)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 4px 16px rgba(11, 25, 44, 0.3)', border: '3px solid #D97706' }}>
            <Sparkles size={38} style={{ color: '#F59E0B' }} />
          </div>

          <h1 style={{ fontSize: '1.8rem', color: '#0B192C', marginBottom: '0.5rem' }}>
            {t('namasteTitle', 'Namaste! I am SchemeSetu AI Assistant')}
          </h1>
          <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto' }}>
            {t('onboardingSubtitle', 'Your personal AI guide to discover government loan & welfare schemes tailored for you. Free and confidential.')}
          </p>
        </div>

        {/* One-Click Quick Demo Button (SIH 2026 Showcase) */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={handleQuickDemo}
            className="btn btn-green btn-lg"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.1rem', padding: '0.95rem' }}
          >
            <Zap size={22} style={{ color: '#F59E0B' }} />
            <span>{t('quickDemo', '⚡ Quick Demo Showcase (SIH 2026)')}</span>
          </button>
        </div>

        {/* Action 1: Continue as Guest (Primary) */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={handleGuestAccess}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.1rem', padding: '0.95rem' }}
          >
            <span>{t('continueGuest', 'Continue as Guest')}</span>
            <ArrowRight size={20} />
          </button>
          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} style={{ color: '#059669' }} /> {t('noRegRequired', 'No registration required to explore schemes')}
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: '#94A3B8', fontSize: '0.85rem' }}>
          <div style={{ flexGrow: 1, height: '1px', background: '#E2E8F0' }}></div>
          <span style={{ padding: '0 0.85rem', fontWeight: 600 }}>{t('orLoginMobile', 'OR LOGIN WITH MOBILE')}</span>
          <div style={{ flexGrow: 1, height: '1px', background: '#E2E8F0' }}></div>
        </div>

        {/* Action 2: Mobile OTP Login */}
        {!showOtp ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <Phone size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('enterMobilePlaceholder', 'Enter 10-digit mobile number')}
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                maxLength={10}
                required
              />
            </div>
            <button type="submit" className="btn btn-secondary">
              {t('getOtp', 'Get OTP')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 600 }}>
              {t('enterOtpMsg', 'Enter 4-digit OTP sent to +91')} {phone}:
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1234"
                className="form-control"
                maxLength={4}
                required
                autoFocus
              />
              <button type="submit" className="btn btn-green" disabled={loading}>
                {loading ? t('signingIn', 'Verifying...') : t('loginAndContinue', 'Login & Continue')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
