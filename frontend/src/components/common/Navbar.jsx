import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import SnapchatLocationPicker from '../location/SnapchatLocationPicker';
import { 
  Building2, 
  Sparkles, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard,
  Globe,
  MapPin,
  Radio
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, changeLanguage, t, availableLanguages } = useLanguage();
  const { location, nearbyPartners } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <div className="gov-tricolor-bar" />
      <header className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="brand-logo" aria-label="SchemeSetu Home">
            <div className="brand-emblem">
              <span>से</span>
            </div>
            <div>
              <span className="brand-title">{t('brandTitle')}</span>
              <span className="brand-subtitle">{t('brandSubtitle')}</span>
            </div>
          </Link>

          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`nav-links ${mobileOpen ? 'open' : ''}`}>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              {t('home')}
            </NavLink>
            <NavLink to="/schemes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Building2 size={16} /> {t('exploreSchemes')}
            </NavLink>
            <NavLink to="/eligibility" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Sparkles size={16} /> {t('checkEligibility')}
            </NavLink>

            {/* Snapchat Location Setup Quick Badge */}
            <button
              onClick={() => setLocationModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{
                borderColor: '#0284C7',
                color: '#38BDF8',
                backgroundColor: 'rgba(2, 132, 199, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="Open Snapchat Location Setup & Partner Radar"
            >
              <Radio size={14} style={{ color: '#38BDF8' }} />
              <span style={{ fontSize: '0.82rem' }}>
                📍 {location.district || location.state || 'Location'} ({nearbyPartners.length})
              </span>
            </button>

            {/* Multi-Lingual Language Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
              <Globe size={15} style={{ color: '#F59E0B' }} />
              <select
                value={lang}
                onChange={(e) => changeLanguage(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none'
                }}
                aria-label="Select Language"
              >
                {availableLanguages.map(l => (
                  <option key={l} value={l} style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>
                    {l === 'EN' ? 'English (EN)' :
                     l === 'HI' ? 'हिंदी (HI)' :
                     l === 'TE' ? 'తెలుగు (TE)' :
                     l === 'TA' ? 'தமிழ் (TA)' :
                     l === 'KN' ? 'ಕನ್ನಡ (KN)' :
                     'मराठी (MR)'}
                  </option>
                ))}
              </select>
            </div>

            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard size={16} /> {t('dashboard')}
                </NavLink>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Hi, {user?.name?.split(' ')[0]}</span>
                  <button onClick={handleLogout} className="btn btn-secondary btn-sm" aria-label="Logout">
                    <LogOut size={14} /> {t('logout')}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm" onClick={() => setMobileOpen(false)}>
                  <LogIn size={14} /> {t('login')}
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>
                  {t('register')}
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Snapchat Location Setup Modal */}
      <SnapchatLocationPicker
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </>
  );
}
