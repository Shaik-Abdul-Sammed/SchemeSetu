import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Building2, Mic, Sparkles, User, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function MobileQuickNav() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { label: t('home', 'Home'), path: '/', icon: Home },
    { label: t('exploreSchemes', 'Schemes'), path: '/schemes', icon: Building2 },
    { label: t('voiceAssistant', 'Voice AI'), path: '/input', icon: Mic, highlight: true },
    { label: t('checkEligibility', 'Eligible'), path: '/eligibility', icon: Sparkles },
    { 
      label: isAuthenticated ? t('dashboard', 'Dashboard') : t('login', 'Login'), 
      path: isAuthenticated ? '/dashboard' : '/login', 
      icon: isAuthenticated ? User : LogIn 
    }
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`mobile-nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="mobile-nav-icon-wrap">
              <Icon size={20} />
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
