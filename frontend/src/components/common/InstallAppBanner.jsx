import React, { useState } from 'react';
import { Download, X, Smartphone, CheckCircle, Sparkles } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';
import { useLanguage } from '../../context/LanguageContext';

export default function InstallAppBanner() {
  const { t } = useLanguage();
  const { isInstalled, triggerInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  // If app is already installed or dismissed for this session, hide the top banner
  if (isInstalled || dismissed) return null;

  return (
    <div
      className="pwa-install-banner"
      style={{
        backgroundColor: '#0B192C',
        color: '#FFFFFF',
        fontSize: '0.82rem',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        zIndex: 50
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '0.35rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Smartphone size={16} style={{ color: '#F59E0B' }} />
        </div>
        <div>
          <span style={{ fontWeight: 700, color: '#FCD34D', marginRight: '0.4rem' }}>
            {t('installBannerTitle', 'Install SchemeSetu App')}
          </span>
          <span className="pwa-banner-subtext" style={{ color: '#CBD5E1', fontSize: '0.78rem' }}>
            — {t('installBannerDesc', 'Fast access, offline mode & voice assistant on your home screen.')}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <button
          onClick={triggerInstall}
          style={{
            backgroundColor: '#F59E0B',
            color: '#0B192C',
            border: 'none',
            padding: '0.35rem 0.85rem',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          aria-label="Install SchemeSetu App"
        >
          <Download size={13} />
          <span>{t('installAppBtn', 'Install App')}</span>
        </button>

        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '0.2rem',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Dismiss"
          aria-label="Dismiss banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
