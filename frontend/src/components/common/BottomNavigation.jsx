import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Building2, Sparkles, FileText, Grid } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function BottomNavigation() {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { key: 'home', label: t('home', 'Home'), path: '/', icon: Home },
    { key: 'schemes', label: t('exploreSchemes', 'Schemes'), path: '/schemes', icon: Building2 },
    { key: 'check', label: t('checkEligibility', 'Check'), path: '/eligibility', icon: Sparkles, highlight: true },
    { key: 'applications', label: t('applications', 'Applications'), path: '/applications', icon: FileText },
    { key: 'more', label: t('moreMenu', 'More'), path: '/more', icon: Grid }
  ];

  return (
    <nav className="mobile-bottom-nav-shell" aria-label="Mobile Bottom Navigation">
      <div className="mobile-bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={`mobile-nav-btn ${isActive ? 'active' : ''} ${item.highlight ? 'highlight-btn' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="mobile-nav-icon-box">
                <Icon size={20} />
              </div>
              <span className="mobile-nav-text">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
