import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import { usePWA } from '../../context/PWAContext';
import LanguageSelectorIcon from './LanguageSelectorIcon';
import SnapchatLocationPicker from '../location/SnapchatLocationPicker';
import { 
  Building2, 
  Sparkles, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard,
  FileCheck,
  Mic,
  Users,
  MessageSquare,
  Settings,
  Download,
  ChevronDown,
  MapPin,
  Navigation
} from 'lucide-react';

export default function Navbar({ onOpenVoiceAssistant }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, t } = useLanguage();
  const { location, locationStatus, detectCurrentGPSLocation } = useLocation();
  const { isInstalled, triggerInstall } = usePWA();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLocationDisplayText = () => {
    if (locationStatus === 'detecting') {
      return t('detectingLocation', 'Detecting GPS...');
    }
    if (location.district) {
      return location.district;
    }
    if (location.state) {
      return location.state;
    }
    return t('selectLocation', 'Set Location');
  };

  return (
    <>
      <div className="gov-tricolor-bar" />
      <header className="navbar">
        <div className="navbar-inner">
          
          {/* 1. BRAND LOGO */}
          <Link to="/" className="brand-logo" aria-label="SchemeSetu Home">
            <div className="brand-emblem" aria-hidden="true">
              <span>से</span>
            </div>
            <div>
              <span className="brand-title">{t('brandTitle', 'SchemeSetu')}</span>
              <span className="brand-subtitle">{t('brandSubtitle', 'AI Citizen Welfare Platform')}</span>
            </div>
          </Link>

          {/* 2. NAVBAR CONTROLS (DESKTOP & MOBILE HEADER RIGHT) */}
          <div className="nav-controls-right" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            
            {/* Direct Visible Location / GPS Badge */}
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="navbar-location-btn"
              title={location.address ? `Location: ${location.address}` : 'Click to update current location or GPS'}
              aria-label={`Current Location: ${getLocationDisplayText()}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: location.isGPS ? 'rgba(5, 150, 105, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: location.isGPS ? '#34D399' : '#CBD5E1',
                border: `1px solid ${location.isGPS ? '#059669' : 'rgba(255, 255, 255, 0.2)'}`,
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {locationStatus === 'detecting' ? (
                <Navigation size={14} className="animate-spin" style={{ color: '#38BDF8' }} />
              ) : (
                <MapPin size={14} style={{ color: location.isGPS ? '#34D399' : '#F59E0B' }} />
              )}
              <span className="navbar-location-text">{getLocationDisplayText()}</span>
              {location.isGPS && (
                <span 
                  style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    backgroundColor: '#10B981',
                    display: 'inline-block' 
                  }} 
                  title="GPS Active"
                />
              )}
            </button>

            {/* Mobile-Only Language Icon */}
            <div className="mobile-only-lang">
              <LanguageSelectorIcon />
            </div>

            {/* Mobile Menu Toggle Button */}
            <button 
              className="mobile-menu-btn" 
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* 3. DESKTOP & MOBILE NAVIGATION LINKS */}
          <nav className={`nav-links ${mobileOpen ? 'open' : ''}`} aria-label="Main Navigation">
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
              onClick={() => setMobileOpen(false)}
            >
              {t('home', 'Home')}
            </NavLink>

            <NavLink 
              to="/schemes" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
              onClick={() => setMobileOpen(false)}
            >
              <Building2 size={16} /> {t('exploreSchemes', 'Schemes')}
            </NavLink>

            <NavLink 
              to="/eligibility" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
              onClick={() => setMobileOpen(false)}
            >
              <Sparkles size={16} /> {t('checkEligibility', 'Eligibility')}
            </NavLink>

            <button 
              type="button"
              onClick={() => {
                setMobileOpen(false);
                if (onOpenVoiceAssistant) onOpenVoiceAssistant();
                else navigate('/input');
              }} 
              className="nav-link nav-link-voice"
              title="Open Voice Assistant"
              aria-label="Open SchemeSetu AI Voice Assistant"
            >
              <Mic size={16} style={{ color: '#F59E0B' }} /> {t('voiceAssistant', 'Voice AI')}
            </button>

            <NavLink 
              to="/compare" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
              onClick={() => setMobileOpen(false)}
            >
              {t('compare', 'Compare')}
            </NavLink>

            <NavLink 
              to="/applications" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
              onClick={() => setMobileOpen(false)}
            >
              <FileCheck size={16} /> {t('applications', 'Applications')}
            </NavLink>

            <NavLink 
              to="/locations" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
              onClick={() => setMobileOpen(false)}
            >
              <MapPin size={16} /> {t('partners', 'Locations')}
            </NavLink>

            {/* Desktop More Menu for Secondary Portals */}
            <div className="more-menu-container" style={{ position: 'relative' }} ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                aria-expanded={moreOpen}
                aria-haspopup="true"
                aria-label="More Navigation Options"
              >
                <span>{t('moreMenu', 'More')}</span>
                <ChevronDown size={14} style={{ transform: moreOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {moreOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    zIndex: 9999,
                    minWidth: '200px',
                    padding: '0.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                  role="menu"
                >
                  <NavLink
                    to="/community"
                    className="nav-link"
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => { setMoreOpen(false); setMobileOpen(false); }}
                    role="menuitem"
                  >
                    <MessageSquare size={16} style={{ color: '#38BDF8' }} /> {t('community', 'Community Forum')}
                  </NavLink>

                  <NavLink
                    to="/vle"
                    className="nav-link"
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => { setMoreOpen(false); setMobileOpen(false); }}
                    role="menuitem"
                  >
                    <Users size={16} style={{ color: '#4ADE80' }} /> {t('vle', 'VLE Agent Portal')}
                  </NavLink>

                  <NavLink
                    to="/admin"
                    className="nav-link"
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => { setMoreOpen(false); setMobileOpen(false); }}
                    role="menuitem"
                  >
                    <Settings size={16} style={{ color: '#CBD5E1' }} /> {t('admin', 'Admin Portal')}
                  </NavLink>
                </div>
              )}
            </div>

            {/* Desktop Language Selector */}
            <div className="desktop-only-lang">
              <LanguageSelectorIcon />
            </div>

            {/* Install App Button */}
            {!isInstalled && (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  triggerInstall();
                }}
                className="btn btn-secondary btn-sm navbar-install-btn"
                title="Install SchemeSetu Web App"
                aria-label="Install SchemeSetu App"
              >
                <Download size={14} />
                <span style={{ fontSize: '0.82rem' }}>{t('installAppBtn', 'Install App')}</span>
              </button>
            )}

            {/* Auth Login / Dashboard */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard size={16} /> {t('dashboard', 'Dashboard')}
                </NavLink>
                <button 
                  type="button"
                  onClick={handleLogout} 
                  className="btn btn-secondary btn-sm" 
                  style={{ padding: '0.35rem 0.65rem' }} 
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Link 
                  to="/login" 
                  className="btn btn-secondary btn-sm" 
                  style={{ padding: '0.35rem 0.75rem' }} 
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn size={14} /> {t('login', 'Login')}
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary btn-sm" 
                  style={{ padding: '0.35rem 0.75rem' }} 
                  onClick={() => setMobileOpen(false)}
                >
                  {t('register', 'Register')}
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Snapchat Location Setup Radar Modal */}
      {locationModalOpen && (
        <SnapchatLocationPicker onClose={() => setLocationModalOpen(false)} />
      )}
    </>
  );
}
