import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ fontSize: '4rem', fontWeight: 800, color: '#D97706', lineHeight: 1, marginBottom: '1rem' }}>
          404
        </div>
        <h1 style={{ fontSize: '1.5rem', color: '#0B192C', marginBottom: '0.5rem' }}>
          {t('pageNotFound', 'Page Not Found')}
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
          {t('pageNotFoundSub', 'The portal page you are looking for does not exist or has been relocated.')}
        </p>
        <div className="bottom-action-container" style={{ margin: 0 }}>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} /> {t('backToHome', 'Return to Homepage')}
          </Link>
        </div>
      </div>
    </div>
  );
}
