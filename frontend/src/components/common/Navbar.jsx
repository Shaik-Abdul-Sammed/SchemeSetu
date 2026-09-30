import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import LanguageSelectorIcon from './LanguageSelectorIcon';
import SnapchatLocationPicker from '../location/SnapchatLocationPicker';
import TribalSahajModeModal from '../accessibility/TribalSahajModeModal';
import Logo from './Logo';
import {
  Building2,
  Sparkles,
  LogIn,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  FileCheck,
  Bot,
  MapPin,
  Navigation,
  ChevronDown,
  Scale,
  Calculator,
  MessageSquare,
  Users,
  Settings,
  AlertCircle,
  Mic,
  UserCheck,
  HelpCircle
} from 'lucide-react';

export default function Navbar({ onOpenVoiceAssistant, onOpenTour, onOpenHelp }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, t } = useLanguage();
  const { location, locationStatus } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [sahajModalOpen, setSahajModalOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setMoreOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 1300) setMobileOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeMobile = () => setMobileOpen(false);

  const getLocationSourceBadge = () => {
    if (!location.locationSource) return '';
    if (location.locationSource === 'gps') return ' 📡';
    if (location.locationSource === 'network' || location.locationSource === 'cell_tower') return ' 📶';
    if (location.locationSource === 'ip') return ' 🌐';
    return '';
  };

  const getLocationDisplayText = () => {
    if (locationStatus === 'detecting') return t('detectingLocation', 'Detecting…');
    const town = location.city ? location.city.split('(')[0].trim() : '';
    const exactName = town && !location.district.toLowerCase().includes(town.toLowerCase())
      ? `${town}, ${location.district}`
      : location.district;

    if (exactName && location.state) return `${exactName}${getLocationSourceBadge()}`;
    if (exactName) return `${exactName}${getLocationSourceBadge()}`;
    if (location.state) return location.state;
    if (locationStatus === 'denied' || locationStatus === 'unavailable')
      return t('setLocation', 'Set Location');
    return t('detectLocation', 'Location');
  };

  return (
    <>
      {/* India Tricolor Top Accent */}
      <div className="gov-tricolor-bar" />

      {/* Sticky Glassmorphic Navbar */}
      <header className="navbar" role="banner">
        <div className="navbar-inner">

          {/* ── 1. BRAND LOGO ── */}
          <Link to="/" className="navbar-brand" aria-label="SchemeSetu Home">
            <Logo variant="full" size={32} theme="dark" />
          </Link>

          {/* ── 2. PRIMARY NAV LINKS (desktop) ── */}
          <nav
            className={`nav-links${mobileOpen ? ' open' : ''}`}
            aria-label="Main Navigation"
            id="main-nav"
          >
            <NavLink id="tour-home" to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMobile} end>
              {t('home', 'Home')}
            </NavLink>

            <NavLink id="tour-schemes" to="/schemes" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
              <Building2 size={14} aria-hidden="true" />
              {t('exploreSchemes', 'Schemes')}
            </NavLink>

            <NavLink id="tour-applications" to="/applications" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
              <FileCheck size={14} aria-hidden="true" />
              {t('applications', 'Apply')}
            </NavLink>

            <NavLink id="tour-locations" to="/locations" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
              <MapPin size={14} aria-hidden="true" />
              {t('partners', 'Centers')}
            </NavLink>

            <NavLink id="tour-calculator" to="/calculator" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
              <Calculator size={14} aria-hidden="true" />
              {t('calculator', 'Calculator')}
            </NavLink>

            <NavLink id="tour-agent" to="/input" className={({ isActive }) => `nav-link nav-link-agent${isActive ? ' active' : ''}`} onClick={closeMobile}>
              <Bot size={14} aria-hidden="true" />
              {t('agentMode', 'Agent')}
            </NavLink>

            {/* Auth-conditional links */}
            {isAuthenticated ? (
              <>
                <NavLink to="/compare" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
                  <Scale size={14} aria-hidden="true" />
                  {t('compareSchemes', 'Compare')}
                </NavLink>

                {user?.role === 'vle' && (
                  <NavLink to="/vle" className={({ isActive }) => `nav-link nav-link-vle${isActive ? ' active' : ''}`} onClick={closeMobile}>
                    <Users size={14} aria-hidden="true" />
                    {t('vle', 'VLE')}
                  </NavLink>
                )}

                {user?.role === 'admin' && (
                  <NavLink to="/admin" className={({ isActive }) => `nav-link nav-link-admin${isActive ? ' active' : ''}`} onClick={closeMobile}>
                    <Settings size={14} aria-hidden="true" />
                    {t('admin', 'Admin')}
                  </NavLink>
                )}

                {/* User profile dropdown */}
                <div className="more-menu-container" ref={moreRef}>
                  <button
                    type="button"
                    className="navbar-profile-btn"
                    onClick={() => setMoreOpen(!moreOpen)}
                    aria-expanded={moreOpen}
                    aria-haspopup="true"
                    aria-label="User Account Menu"
                  >
                    <span className="navbar-avatar">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                    </span>
                    <span className="navbar-username">
                      {user?.name ? user.name.split(' ')[0] : 'Citizen'}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`navbar-chevron${moreOpen ? ' rotated' : ''}`}
                      aria-hidden="true"
                    />
                  </button>

                  {moreOpen && (
                    <div className="navbar-dropdown" role="menu">
                      {/* Profile header */}
                      <div className="navbar-dropdown-header">
                        <div className="navbar-dropdown-name">{user?.name || 'Beneficiary'}</div>
                        <div className="navbar-dropdown-badge">
                          <UserCheck size={12} aria-hidden="true" />
                          {t('verifiedStatus', 'Verified Citizen')}
                        </div>
                      </div>

                      <NavLink to="/dashboard" className="navbar-dropdown-item" onClick={() => { setMoreOpen(false); closeMobile(); }} role="menuitem">
                        <LayoutDashboard size={14} aria-hidden="true" style={{ color: '#F59E0B' }} />
                        {t('dashboard', 'Dashboard')}
                      </NavLink>

                      <NavLink to="/applications" className="navbar-dropdown-item" onClick={() => { setMoreOpen(false); closeMobile(); }} role="menuitem">
                        <FileCheck size={14} aria-hidden="true" style={{ color: '#38BDF8' }} />
                        {t('applications', 'Track Applications')}
                      </NavLink>

                      <NavLink to="/community" className="navbar-dropdown-item" onClick={() => { setMoreOpen(false); closeMobile(); }} role="menuitem">
                        <MessageSquare size={14} aria-hidden="true" style={{ color: '#34D399' }} />
                        {t('community', 'Community Forum')}
                      </NavLink>

                      <button
                        type="button"
                        className="navbar-dropdown-logout"
                        onClick={() => { setMoreOpen(false); handleLogout(); }}
                        role="menuitem"
                      >
                        <LogOut size={14} aria-hidden="true" />
                        {t('logout', 'Logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Guest links */
              <>
                <NavLink to="/community" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
                  <MessageSquare size={14} aria-hidden="true" />
                  {t('community', 'Community')}
                </NavLink>

                <div className="navbar-auth-btns">
                  <Link to="/login" className="navbar-btn-ghost" onClick={closeMobile}>
                    <LogIn size={14} aria-hidden="true" />
                    {t('login', 'Login')}
                  </Link>
                  <Link to="/register" className="navbar-btn-gold" onClick={closeMobile}>
                    {t('register', 'Register')}
                  </Link>
                </div>
              </>
            )}

            {/* Mobile drawer location selector button */}
            {/* Mobile drawer location selector button */}
            <div className="nav-link-mobile-location">
              <button
                type="button"
                className="btn-mobile-location"
                onClick={() => { setLocationModalOpen(true); closeMobile(); }}
                aria-label="Set Location"
              >
                <MapPin size={16} style={{ color: '#F59E0B' }} aria-hidden="true" />
                <span>
                  {location.district
                    ? `${location.district}, ${location.state}`
                    : location.state || t('setLocation', 'Set Location')}
                </span>
              </button>
            </div>

            {/* Mobile Sahaj Mode Trigger (Drawer Only) */}
            <div className="nav-link-mobile-location" style={{ padding: '0.4rem 1rem' }}>
              <button
                type="button"
                onClick={() => { setSahajModalOpen(true); closeMobile(); }}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  border: '1.5px solid #FCD34D',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>🎨</span>
                <span>{lang === 'TE' ? 'సహజ్ ఆడియో & బొమ్మల మోడ్' : (lang === 'HI' ? 'सहज चित्र-आवाज मोड' : 'Sahaj Audio-Visual Mode')}</span>
              </button>
            </div>
          </nav>

          {/* ── 3. RIGHT CONTROLS (location, voice, language, hamburger) ── */}
          <div className="nav-controls">

            {/* Sahaj Audio-Visual Mode Quick Button */}
            <button
              id="tour-sahaj"
              type="button"
              className="navbar-sahaj-btn"
              onClick={() => setSahajModalOpen(true)}
              title={lang === 'TE' ? 'సహజ్ ఆడియో & బొమ్మల మోడ్' : (lang === 'HI' ? 'सहज चित्र-आवाज मोड' : 'Sahaj Audio-Visual Mode')}
              aria-label="Open Sahaj Audio-Visual Mode"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                border: '1.5px solid #FCD34D',
                borderRadius: '20px',
                padding: '0.32rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: '0.95rem' }}>🎨</span>
              <span>{lang === 'TE' ? 'సహజ్' : (lang === 'HI' ? 'सहज' : 'Sahaj')}</span>
            </button>

            {/* GPS Location pill */}
            <button
              id="tour-location-pill"
              type="button"
              className={`navbar-location-btn${location.isGPS ? ' gps-active' : ''}${locationStatus === 'denied' || locationStatus === 'unavailable' ? ' gps-denied' : ''}`}
              onClick={() => setLocationModalOpen(true)}
              title={location.address ? `Location: ${location.address}` : 'Set Location'}
              aria-label={`Current Location: ${getLocationDisplayText()}`}
            >
              {locationStatus === 'detecting' ? (
                <Navigation size={13} className="animate-spin" aria-hidden="true" />
              ) : locationStatus === 'denied' || locationStatus === 'unavailable' ? (
                <AlertCircle size={13} aria-hidden="true" />
              ) : (
                <MapPin size={13} aria-hidden="true" />
              )}
              <span className="navbar-location-text">{getLocationDisplayText()}</span>
              {location.isGPS && <span className="gps-dot" title="GPS Active" />}
            </button>

            {/* Voice assistant */}
            <button
              id="tour-voice"
              type="button"
              className="navbar-voice-btn"
              onClick={onOpenVoiceAssistant}
              title={t('voiceAssistant', 'AI Voice Assistant')}
              aria-label={t('voiceAssistant', 'AI Voice Assistant')}
            >
              <Mic size={14} aria-hidden="true" />
              <span className="navbar-voice-label">{t('voiceText', 'Voice')}</span>
            </button>

            {/* Language selector */}
            <div id="tour-language" style={{ display: 'inline-flex', flexShrink: 0 }}>
              <LanguageSelectorIcon />
            </div>

            {/* Help & Tour Guide Button */}
            <button
              type="button"
              className="navbar-help-btn"
              onClick={onOpenHelp}
              title={t('helpAndGuide', 'Help Center & Guided Tour')}
              aria-label={t('helpAndGuide', 'Help Center & Guided Tour')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FCD34D',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
            >
              <HelpCircle size={16} />
            </button>

            {/* Mobile hamburger */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-controls="main-nav"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="nav-overlay"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* GPS Location Modal */}
      {locationModalOpen && (
        <SnapchatLocationPicker onClose={() => setLocationModalOpen(false)} />
      )}

      {/* Accessible Tribal & Illiterate Mode Modal */}
      <TribalSahajModeModal
        isOpen={sahajModalOpen}
        onClose={() => setSahajModalOpen(false)}
      />
    </>
  );
}
