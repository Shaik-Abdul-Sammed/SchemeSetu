/**
 * VoiceLanguageBar — Compact status bar for InputHub
 * Shows: detected language, confidence, location, voice state
 * Allows: language selector, location display
 */
import React, { useState } from 'react';
import { Globe, MapPin, ChevronDown, Check, Info } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../data/stateLanguageMap';

const LANG_OPTIONS = [
  { code: 'AUTO', label: '🌐 Auto Detect' },
  { code: 'EN',   label: '🇬🇧 English' },
  { code: 'HI',   label: '🇮🇳 हिन्दी (Hindi)' },
  { code: 'TE',   label: '🇮🇳 తెలుగు (Telugu)' },
  { code: 'TA',   label: '🇮🇳 தமிழ் (Tamil)' },
  { code: 'KN',   label: '🇮🇳 ಕನ್ನಡ (Kannada)' },
  { code: 'ML',   label: '🇮🇳 മലയാളം (Malayalam)' },
  { code: 'BN',   label: '🇮🇳 বাংলা (Bengali)' },
  { code: 'MR',   label: '🇮🇳 मराठी (Marathi)' },
];

const CONFIDENCE_COLORS = {
  high:   { bg: '#ECFDF5', border: '#6EE7B7', text: '#065F46' },
  medium: { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E' },
  low:    { bg: '#FFF1F2', border: '#FCA5A5', text: '#991B1B' },
};

export default function VoiceLanguageBar({
  explicitLang,        // 'AUTO' | lang code
  detectionResult,     // from useLanguageDetection
  displayLabel,        // e.g. 'Telugu' or 'Telugu-English'
  stateDefaultLang,    // e.g. 'TE'
  locationState,       // e.g. 'Andhra Pradesh'
  locationDistrict,    // e.g. 'Tirupati'
  onLanguageChange,    // (langCode) => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const confidence = detectionResult?.confidence || 0;
  const confLevel = confidence >= 0.75 ? 'high' : confidence >= 0.5 ? 'medium' : 'low';
  const colors = CONFIDENCE_COLORS[confLevel];
  const isMixed = detectionResult?.isMixed;

  const locationLabel = locationDistrict
    ? `${locationDistrict}, ${locationState}`
    : locationState || 'India';

  return (
    <div
      role="region"
      aria-label="Language and location status"
      style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        gap: '0.5rem', padding: '0.6rem 1rem',
        background: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)',
        borderBottom: '1px solid #E2E8F0',
        fontSize: '0.8rem', fontWeight: 600,
        position: 'relative',
      }}
    >
      {/* Language selector */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            background: '#fff', border: '1px solid #CBD5E1',
            borderRadius: '8px', padding: '0.3rem 0.65rem',
            color: '#1E3E62', fontWeight: 700, cursor: 'pointer',
            fontSize: '0.78rem', transition: 'border-color 150ms',
            minHeight: '32px',
          }}
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          aria-label={`Language: ${displayLabel}. Click to change.`}
        >
          <Globe size={13} aria-hidden="true" />
          <span>{explicitLang === 'AUTO' ? '🌐 Auto' : displayLabel}</span>
          {detectionResult && explicitLang === 'AUTO' && (
            <span
              style={{
                background: colors.bg, color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px', padding: '0 0.4rem', fontSize: '0.68rem',
                fontWeight: 800,
              }}
              aria-label={`Detection confidence: ${Math.round(confidence * 100)}%`}
            >
              {Math.round(confidence * 100)}%
            </span>
          )}
          <ChevronDown size={12} aria-hidden="true" style={{ marginLeft: '2px' }} />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div
            role="listbox"
            aria-label="Select language"
            style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 200,
              background: '#fff', border: '1px solid #CBD5E1',
              borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: '210px', overflow: 'hidden',
            }}
          >
            {LANG_OPTIONS.map(({ code, label }) => {
              const isSelected = explicitLang === code ||
                (code === 'AUTO' && explicitLang === 'AUTO');
              return (
                <button
                  key={code}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => { onLanguageChange(code); setDropdownOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '0.6rem 0.9rem',
                    background: isSelected ? '#EFF6FF' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: '0.82rem', fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#1E3E62' : '#374151',
                    borderBottom: '1px solid #F1F5F9',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#F8FAFC'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{label}</span>
                  {isSelected && <Check size={14} style={{ color: '#1E3E62', flexShrink: 0 }} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detected language info (only in AUTO mode with a result) */}
      {explicitLang === 'AUTO' && detectionResult && detectionResult.detectedLang !== 'EN' && (
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            background: colors.bg, border: `1px solid ${colors.border}`,
            color: colors.text, borderRadius: '8px', padding: '0.2rem 0.55rem',
            fontSize: '0.73rem', fontWeight: 700,
          }}
          title={`Detected via: ${detectionResult.method}${isMixed ? ' (mixed language)' : ''}`}
        >
          <Info size={11} aria-hidden="true" />
          {isMixed ? `Mixed: ${displayLabel}` : `Detected: ${displayLabel}`}
        </span>
      )}

      {/* State default note */}
      {stateDefaultLang && stateDefaultLang !== 'EN' && explicitLang === 'AUTO' && !detectionResult && (
        <span style={{ color: '#64748B', fontSize: '0.73rem' }}>
          Default for {locationState}: {SUPPORTED_LANGUAGES[stateDefaultLang]?.displayName}
        </span>
      )}

      {/* Divider */}
      <span style={{ color: '#CBD5E1', fontWeight: 300, userSelect: 'none' }}>|</span>

      {/* Location */}
      <span
        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#475569' }}
        title="Your approximate location"
      >
        <MapPin size={13} aria-hidden="true" style={{ color: '#D97706' }} />
        <span>{locationLabel}</span>
      </span>

      {/* Close dropdown on outside click */}
      {dropdownOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 199 }}
          onClick={() => setDropdownOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
