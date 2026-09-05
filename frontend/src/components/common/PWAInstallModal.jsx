import React from 'react';
import { X, Smartphone, Download, Share2, PlusSquare, CheckCircle2, Globe } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';
import { useLanguage } from '../../context/LanguageContext';

export default function PWAInstallModal() {
  const { showInstructionsModal, setShowInstructionsModal, isIOS } = usePWA();
  const { t } = useLanguage();

  if (!showInstructionsModal) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={() => setShowInstructionsModal(false)}
    >
      <div
        className="modal-card"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ backgroundColor: '#0B192C', padding: '1.25rem 1.5rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0B192C', fontSize: '1.2rem' }}>
              से
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                {t('installSchemeSetuTitle', 'Install SchemeSetu App')}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
                {t('installSchemeSetuSubtitle', 'Instant access to Bharat welfare schemes')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInstructionsModal(false)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.25rem' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', backgroundColor: '#F0FDF4', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
            <CheckCircle2 size={20} style={{ color: '#16A34A', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.82rem', color: '#15803D', margin: 0, lineHeight: 1.4 }}>
              <strong>{t('pwaOfflineBadge', '100% Free & Lightweight')}:</strong> {t('pwaOfflineDesc', 'Works offline, loads instantaneously without taking up device storage space.')}
            </p>
          </div>

          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
            {isIOS
              ? t('pwaIosInstructionsTitle', 'How to install on iPhone & iPad (Safari):')
              : t('pwaAndroidInstructionsTitle', 'How to install on Mobile & Desktop:')}
          </h4>

          {isIOS ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                  1
                </div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                  {t('pwaIosStep1', 'Tap the')} <strong>{t('pwaShareIcon', 'Share button')}</strong> <Share2 size={15} style={{ display: 'inline', verticalAlign: 'middle', color: '#2563EB' }} /> {t('pwaIosStep1End', 'in Safari toolbar (bottom or top).')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                  2
                </div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                  {t('pwaIosStep2', 'Scroll down and select')} <strong>{t('pwaAddToHome', '"Add to Home Screen"')}</strong> <PlusSquare size={15} style={{ display: 'inline', verticalAlign: 'middle', color: '#0F172A' }} />.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                  3
                </div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                  {t('pwaIosStep3', 'Tap')} <strong>{t('pwaAddBtn', '"Add"')}</strong> {t('pwaIosStep3End', 'in the top-right corner.')}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                  1
                </div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                  {t('pwaAndroidStep1', 'Tap the browser menu (⋮) in Chrome/Edge or the install icon (⊕) in the address bar.')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                  2
                </div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                  {t('pwaAndroidStep2', 'Select')} <strong>{t('pwaInstallAction', '"Install App"')}</strong> {t('pwaOr', 'or')} <strong>{t('pwaAddToHome', '"Add to Home screen"')}</strong>.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                  3
                </div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                  {t('pwaAndroidStep3', 'Confirm installation to access SchemeSetu like a native mobile application!')}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowInstructionsModal(false)}
              style={{
                backgroundColor: '#0B192C',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              {t('gotIt', 'Got It')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
