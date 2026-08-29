import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, PhoneCall, HelpCircle, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Shield style={{ color: '#D97706' }} size={24} />
              <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', margin: 0 }}>SchemeSetu Portal</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.6 }}>
              {t('portalDescription', 'SchemeSetu is a dedicated Government Digital Service platform enabling citizens to discover, check eligibility, and apply for Central and State Government welfare schemes across India.')}
            </p>
          </div>

          <div>
            <h4 className="footer-title">{t('quickLinks', 'Quick Links')}</h4>
            <ul className="footer-links">
              <li><Link to="/">{t('home', 'Home')}</Link></li>
              <li><Link to="/schemes">{t('exploreSchemes', 'Find Schemes')}</Link></li>
              <li><Link to="/eligibility">{t('checkEligibility', 'Check My Eligibility')}</Link></li>
              <li><Link to="/login">{t('login', 'Citizen Login')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">{t('categoriesFooter', 'Categories')}</h4>
            <ul className="footer-links">
              <li><Link to="/schemes?category=Agriculture+%26+Farmers">Agriculture & Farmers</Link></li>
              <li><Link to="/schemes?category=Healthcare+%26+Health+Insurance">Healthcare & Insurance</Link></li>
              <li><Link to="/schemes?category=Financial+Services+%26+Micro-Loans">Micro-Loans & MUDRA</Link></li>
              <li><Link to="/schemes?category=Education+%26+Scholarships">Education & Scholarships</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">{t('citizenHelpdesk', 'Citizen Helpdesk')}</h4>
            <div style={{ fontSize: '0.88rem', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PhoneCall size={16} style={{ color: '#059669' }} />
                <span>{t('tollFreeHelpline', 'Toll-Free Helpline: 1800-11-2026')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={16} style={{ color: '#D97706' }} />
                <span>Email: <strong>support@schemesetu.gov.in</strong></span>
              </div>
              <p style={{ marginTop: '0.4rem', fontSize: '0.8rem' }}>
                {t('operationalHours', 'Operational Hours: Mon - Sat (9:00 AM to 6:00 PM IST)')}
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t('allRightsReserved', '© 2026 SchemeSetu Platform. All Rights Reserved. Government Digital Services.')}</p>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem' }}>{t('privacyPolicy', 'Privacy Policy')}</span>
            <span style={{ fontSize: '0.85rem' }}>{t('termsOfService', 'Terms of Service')}</span>
            <span style={{ fontSize: '0.85rem' }}>{t('accessibilityStatement', 'Accessibility Statement')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
