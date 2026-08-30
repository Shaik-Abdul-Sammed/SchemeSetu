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
  Radio,
  FileCheck,
  Mic,
  Users,
  MessageSquare,
  Settings,
  Download,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ onOpenVoiceAssistant }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, t } = useLanguage();
  const { location, nearbyPartners } = useLocation();
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
              <span className="brand-title">{t('brandTitle', 'SchemeSetu')}</span>
              <span className="brand-subtitle">{t('brandSubtitle', 'AI Citizen Welfare Platform')}</span>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="mobile-only-lang">
              <LanguageSelectorIcon />
            </div>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <nav className={`nav-links ${mobileOpen ? 'open' : ''}`}>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              {t('home', 'Home')}
            </NavLink>

            <NavLink to="/schemes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Building2 size={16} /> {t('exploreSchemes', 'Schemes')}
            </NavLink>

            <button 
              type="button"
              onClick={() => {
                setMobileOpen(false);
                if (onOpenVoiceAssistant) onOpenVoiceAssistant();
                else navigate('/input');
              }} 
              className="nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FCD34D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Mic size={16} style={{ color: '#F59E0B' }} /> {t('voiceAssistant', 'Voice AI')}
            </button>

            <NavLink to="/eligibility" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Sparkles size={16} /> {t('checkEligibility', 'Eligibility')}
            </NavLink>

            <NavLink to="/compare" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              {t('compare', 'Compare')}
            </NavLink>

            <NavLink to="/applications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <FileCheck size={16} /> {t('applications', 'Applications')}
            </NavLink>

            {/* Desktop More Menu for Secondary Portals */}
            <div className="more-menu-container" style={{ position: 'relative' }} ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                aria-expanded={moreOpen}
              >
                <span>More</span>
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
                >
                  <NavLink
                    to="/community"
                    className="nav-link"
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => { setMoreOpen(false); setMobileOpen(false); }}
                  >
                    <MessageSquare size={16} style={{ color: '#38BDF8' }} /> {t('community', 'Community Forum')}
                  </NavLink>

                  <NavLink
                    to="/vle"
                    className="nav-link"
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => { setMoreOpen(false); setMobileOpen(false); }}
                  >
                    <Users size={16} style={{ color: '#4ADE80' }} /> {t('vle', 'VLE Agent Portal')}
                  </NavLink>

                  <NavLink
                    to="/admin"
                    className="nav-link"
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => { setMoreOpen(false); setMobileOpen(false); }}
                  >
                    <Settings size={16} style={{ color: '#CBD5E1' }} /> {t('admin', 'Admin Portal')}
                  </NavLink>

                  <button
                    onClick={() => {
                      setMoreOpen(false);
                      setMobileOpen(false);
                      setLocationModalOpen(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#38BDF8',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      textAlign: 'left'
                    }}
                  >
                    <Radio size={16} />
                    <span>
                      {location.isDemo 
                        ? `📍 Demo: ${location.district}`
                        : location.isGPS 
                          ? `📍 GPS: ${location.district}`
                          : location.state 
                            ? `📍 ${location.district || location.state}`
                            : '📍 Location Radar'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Icon-Only Language Selector (Desktop) */}
            <div className="desktop-only-lang">
              <LanguageSelectorIcon />
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
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
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
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard size={16} /> {t('dashboard', 'Dashboard')}
                </NavLink>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem' }} aria-label="Logout">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.75rem' }} onClick={() => setMobileOpen(false)}>
                  <LogIn size={14} /> {t('login', 'Login')}
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.75rem' }} onClick={() => setMobileOpen(false)}>
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
