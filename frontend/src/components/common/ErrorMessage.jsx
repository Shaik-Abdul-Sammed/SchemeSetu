import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ErrorMessage({ title, message, onRetry }) {
  const { t } = useLanguage();

  const displayTitle = title || t('unableToLoad', 'Unable to load data');
  const displayMessage = message || t('somethingWentWrong', 'Something went wrong while fetching schemes from the server.');

  return (
    <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#DC2626', marginBottom: '1rem' }}>
        <AlertCircle size={28} />
      </div>
      <h3 style={{ color: '#991B1B', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{displayTitle}</h3>
      <p style={{ color: '#B91C1C', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 1.25rem' }}>{displayMessage}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline btn-sm" style={{ color: '#991B1B', borderColor: '#FCA5A5' }}>
          <RefreshCw size={14} /> {t('retry', 'Retry Request')}
        </button>
      )}
    </div>
  );
}
