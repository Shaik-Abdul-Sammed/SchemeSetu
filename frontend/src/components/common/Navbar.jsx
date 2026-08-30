import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import { usePWA } from '../../context/PWAContext';
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
  Radio,
  FileCheck,
  Mic,
  Users,
  MessageSquare,
  Settings,
  Download
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, changeLanguage, t, availableLanguages } = useLanguage();
  const { location, nearbyPartners } = useLocation();
  const { isInstalled, triggerInstall } = usePWA();
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
        <div className="navbar-inner">
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
            <NavLink to="/input" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Mic size={16} /> {t('voiceAssistant')}
            </NavLink>
            <NavLink to="/schemes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Building2 size={16} /> {t('exploreSchemes')}
            </NavLink>

            <NavLink to="/applications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <FileCheck size={16} /> {t('applications')}
            </NavLink>

            <NavLink to="/community" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <MessageSquare size={16} /> {t('community')}
            </NavLink>

            <NavLink to="/vle" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Users size={16} /> {t('vle')}
            </NavLink>

            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Settings size={16} /> {t('admin')}
            </NavLink>

            {/* Location Setup Badge */}
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
              title="Open Location Radar & Partner Map"
            >
              <Radio size={14} style={{ color: '#38BDF8' }} />
              <span style={{ fontSize: '0.82rem' }}>
                📍 {location.district || location.state || 'Location'} ({nearbyPartners.length})
              </span>
            </button>

            {/* All 8 Languages Selector */}
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
                     l === 'ML' ? 'മലയാളം (ML)' :
                     l === 'BN' ? 'বাংলা (BN)' :
                     'मराठी (MR)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Install App Button */}
            {!isInstalled && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  triggerInstall();
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  borderColor: '#F59E0B',
                  color: '#F59E0B',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 600
                }}
                title="Install SchemeSetu Web App"
                aria-label="Install SchemeSetu App"
              >
                <Download size={14} />
                <span style={{ fontSize: '0.82rem' }}>{t('installAppBtn', 'Install App')}</span>
              </button>
            )}

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

      <SnapchatLocationPicker
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </>
  );
}
