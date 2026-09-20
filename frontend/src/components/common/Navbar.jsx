import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import LanguageSelectorIcon from './LanguageSelectorIcon';
import SnapchatLocationPicker from '../location/SnapchatLocationPicker';
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
  UserCheck
} from 'lucide-react';

export default function Navbar({ onOpenVoiceAssistant }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, t } = useLanguage();
  const { location, locationStatus } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
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
      if (window.innerWidth > 1260) setMobileOpen(false);
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
            <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMobile} end>
              {t('home', 'Home')}
            </NavLink>

            <NavLink to="/schemes" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
              <Building2 size={14} aria-hidden="true" />
              {t('exploreSchemes', 'Schemes')}
            </NavLink>

            <NavLink to="/applications" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
              <FileCheck size={14} aria-hidden="true" />
              {t('applications', 'Apply')}
            </NavLink>

            <NavLink to="/locations" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
              <MapPin size={14} aria-hidden="true" />
              {t('partners', 'Centers')}
            </NavLink>

            <NavLink to="/input" className={({ isActive }) => `nav-link nav-link-agent${isActive ? ' active' : ''}`} onClick={closeMobile}>
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

                <NavLink to="/results" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
                  <Calculator size={14} aria-hidden="true" />
                  {t('calculator', 'Calculator')}
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
          </nav>

          {/* ── 3. RIGHT CONTROLS (location, voice, language, hamburger) ── */}
          <div className="nav-controls">

            {/* GPS Location pill */}
            <button
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
            <LanguageSelectorIcon />

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
    </>
  );
}
