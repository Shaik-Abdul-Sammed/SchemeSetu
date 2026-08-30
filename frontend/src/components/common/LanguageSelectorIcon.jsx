import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, Volume2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSelectorIcon() {
  const { lang, changeLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languageLabels = {
    EN: { label: 'English', native: 'English', greeting: 'Welcome to SchemeSetu.', voiceLang: 'en-IN' },
    HI: { label: 'Hindi', native: 'हिन्दी', greeting: 'नमस्ते! SchemeSetu में आपका स्वागत है।', voiceLang: 'hi-IN' },
    TE: { label: 'Telugu', native: 'తెలుగు', greeting: 'నమస్కారం! SchemeSetu కు స్వాగతం.', voiceLang: 'te-IN' },
    TA: { label: 'Tamil', native: 'தமிழ்', greeting: 'வணக்கம்! SchemeSetu-க்கு வரவேற்கிறோம்.', voiceLang: 'ta-IN' },
    KN: { label: 'Kannada', native: 'ಕನ್ನಡ', greeting: 'ನಮಸ್ಕಾರ! SchemeSetu ಗೆ ಸುಸ್ವಾಗತ.', voiceLang: 'kn-IN' },
    ML: { label: 'Malayalam', native: 'മലയാളം', greeting: 'നമസ്കാരം! SchemeSetu-ലേക്ക് സ്വാగതം.', voiceLang: 'ml-IN' },
    BN: { label: 'Bengali', native: 'বাংলা', greeting: 'নমস্কার! SchemeSetu-তে স্বাগতম।', voiceLang: 'bn-IN' },
    MR: { label: 'Marathi', native: 'मराठी', greeting: 'नमस्कार! SchemeSetu मध्ये आपले स्वागत आहे.', voiceLang: 'mr-IN' }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const speakGreeting = (text, voiceLocale) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLocale || 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const handleSelect = (code) => {
    changeLanguage(code);
    const meta = languageLabels[code];
    if (meta) {
      speakGreeting(meta.greeting, meta.voiceLang);
    }
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '0.35rem 0.65rem',
          color: '#FFFFFF',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '0.85rem',
          fontWeight: 700
        }}
        title="Change Language / भाषा बदलें / భాషను మార్చండి"
        aria-label="Select Language"
      >
        <Globe size={16} style={{ color: '#F59E0B' }} />
        <span style={{ fontSize: '0.82rem', letterSpacing: '0.04em' }}>{lang}</span>
        <ChevronDown size={13} style={{ opacity: 0.8, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            backgroundColor: '#0F172A',
            border: '1px solid #334155',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
            zIndex: 9999,
            minWidth: '185px',
            overflow: 'hidden',
            padding: '0.35rem'
          }}
        >
          <div style={{ padding: '0.4rem 0.65rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8', borderBottom: '1px solid #1E293B', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Volume2 size={13} style={{ color: '#F59E0B' }} /> <span>Voice & Language</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {availableLanguages.map((code) => {
              const isSelected = code === lang;
              const meta = languageLabels[code] || { label: code, native: code };

              return (
                <button
                  key={code}
                  onClick={() => handleSelect(code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: isSelected ? '#FCD34D' : '#E2E8F0',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? 700 : 500,
                    textAlign: 'left',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                    <span style={{ fontSize: '0.88rem' }}>{meta.native}</span>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{meta.label}</span>
                  </div>
                  {isSelected && <Check size={15} style={{ color: '#F59E0B' }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
