import React, { useState, useEffect } from 'react';
import { Globe, Volume2, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const LANGUAGES = [
  { code: 'EN', name: 'English', native: 'English', flag: '🇮🇳', greeting: 'Welcome to SchemeSetu' },
  { code: 'TE', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', greeting: 'స్కీమ్‌సేతుకు స్వాగతం' },
  { code: 'HI', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳', greeting: 'स्कीमसेतु में आपका स्वागत है' },
  { code: 'TA', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', greeting: 'ஸ்கீம்சேதுவிற்கு வரவேற்கிறோம்' },
  { code: 'KN', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', greeting: 'స్కీమ్‌సేతుಗೆ స్వాగత' },
  { code: 'MR', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', greeting: 'स्कीमसेतूमध्ये आपले स्वागत आहे' },
  { code: 'BN', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳', greeting: 'স্কিমসেতুতে আপনাকে স্বাগতম' },
  { code: 'ML', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', greeting: 'സ്കീംസേതുവിലേക്ക് സ്വാഗതം' },
  { code: 'GON', name: 'Gondi', native: 'गोंडी (గోండి)', flag: '🏹', greeting: 'सेवा जोहार! SchemeSetu मय तुमाना स्वागत आय।' },
  { code: 'BHI', name: 'Chenchu / Bhili', native: 'चेन्चू / भीली', flag: '🌲', greeting: 'राम राम! SchemeSetu मा तमारु स्वागत छे।' },
];

export default function LanguageSelectionModal({ isOpen: controlledIsOpen, onClose }) {
  const { lang, changeLanguage } = useLanguage();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState(lang || 'EN');

  useEffect(() => {
    const gatePassed = localStorage.getItem('schemesetu_gate_passed');
    if (!gatePassed) {
      setInternalIsOpen(true);
    }
  }, []);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleClose = () => {
    setInternalIsOpen(false);
    if (onClose) onClose();
  };

  const handleSelectLanguage = (code) => {
    setSelectedCode(code);
    changeLanguage(code);

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const selectedObj = LANGUAGES.find(l => l.code === code);
        if (selectedObj) {
          const utterance = new SpeechSynthesisUtterance(selectedObj.greeting);
          utterance.lang = code === 'HI' ? 'hi-IN' : code === 'TE' ? 'te-IN' : 'en-IN';
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (e) {
      // Audio optional
    }
  };

  const handleConfirm = () => {
    changeLanguage(selectedCode);
    localStorage.setItem('schemesetu_gate_passed', 'true');
    localStorage.setItem('schemesetu_lang_pref', selectedCode);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 12, 27, 0.95)',
        backdropFilter: 'blur(16px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-slate-200 shadow-2xl relative animate-scale-in"
        style={{
          backgroundColor: '#0F192C',
          border: '1px solid #1E2D45',
          borderRadius: '1.5rem',
          maxWidth: '640px',
          width: '100%',
          padding: '1.75rem',
          color: '#E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#34D399',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              marginBottom: '0.75rem'
            }}
          >
            <Sparkles style={{ width: '14px', height: '14px' }} /> Welcome to SchemeSetu AI Platform
          </div>
          <h2
            style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              margin: '0.25rem 0'
            }}
          >
            <Globe style={{ width: '24px', height: '24px', color: '#34D399' }} /> Select Your Preferred Language
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>
            Choose your language to personalize scheme recommendations, voice assistant NLU, & financial tools
          </p>
        </div>

        {/* Languages Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = selectedCode === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                style={{
                  padding: '0.85rem 0.5rem',
                  borderRadius: '1rem',
                  border: isSelected ? '2px solid #10B981' : '1px solid #1E2D45',
                  backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 45, 69, 0.5)',
                  color: isSelected ? '#6EE7B7' : '#CBD5E1',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.35rem',
                  transition: 'all 0.2s ease-out'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{lang.flag}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{lang.native}</span>
                <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontFamily: 'monospace' }}>{lang.name}</span>
                {isSelected && <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10B981', marginTop: '0.25rem' }} />}
              </button>
            );
          })}
        </div>

        {/* Audio Preview Greeting */}
        <div
          style={{
            backgroundColor: 'rgba(30, 45, 69, 0.4)',
            border: '1px solid #1E2D45',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            fontSize: '0.8rem',
            color: '#CBD5E1'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Volume2 style={{ width: '16px', height: '16px', color: '#34D399' }} />
            <span>{LANGUAGES.find(l => l.code === selectedCode)?.greeting}</span>
          </div>
          <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#64748B' }}>Audio Active</span>
        </div>

        {/* Confirm Action */}
        <button
          type="button"
          onClick={handleConfirm}
          style={{
            width: '100%',
            padding: '0.9rem',
            borderRadius: '1rem',
            backgroundColor: '#10B981',
            color: '#020C1B',
            fontWeight: 900,
            fontSize: '0.95rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s ease-out'
          }}
        >
          <span>Enter SchemeSetu Platform</span>
          <ArrowRight style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
    </div>
  );
}
