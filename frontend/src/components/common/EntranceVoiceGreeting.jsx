import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Globe, Sparkles, Check, ArrowRight, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function EntranceVoiceGreeting() {
  const { lang, changeLanguage, availableLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const languageCards = [
    { code: 'HI', name: 'हिन्दी', sub: 'Hindi', greeting: 'नमस्ते! SchemeSetu में आपका स्वागत है।', voiceLang: 'hi-IN' },
    { code: 'TE', name: 'తెలుగు', sub: 'Telugu', greeting: 'నమస్కారం! SchemeSetu కు స్వాగతం.', voiceLang: 'te-IN' },
    { code: 'TA', name: 'தமிழ்', sub: 'Tamil', greeting: 'வணக்கம்! SchemeSetu-க்கு வரவேற்கிறோம்.', voiceLang: 'ta-IN' },
    { code: 'KN', name: 'ಕನ್ನಡ', sub: 'Kannada', greeting: 'ನಮಸ್ಕಾರ! SchemeSetu ಗೆ ಸುಸ್ವಾಗತ.', voiceLang: 'kn-IN' },
    { code: 'ML', name: 'മലയാളം', sub: 'Malayalam', greeting: 'നമസ്കാരം! SchemeSetu-ലേക്ക് സ്വാഗതം.', voiceLang: 'ml-IN' },
    { code: 'BN', name: 'বাংলা', sub: 'Bengali', greeting: 'নমস্কার! SchemeSetu-তে স্বাগতম।', voiceLang: 'bn-IN' },
    { code: 'MR', name: 'मराठी', sub: 'Marathi', greeting: 'नमस्कार! SchemeSetu मध्ये आपले स्वागत आहे.', voiceLang: 'mr-IN' },
    { code: 'EN', name: 'English', sub: 'Indian English', greeting: 'Welcome to SchemeSetu, India\'s AI Welfare Portal.', voiceLang: 'en-IN' }
  ];

  useEffect(() => {
    // Show on initial session entrance if language selection hasn't been confirmed yet
    const hasSeenGreeting = sessionStorage.getItem('schemesetu_entrance_greeted');
    if (!hasSeenGreeting) {
      setIsOpen(true);
      sessionStorage.setItem('schemesetu_entrance_greeted', 'true');
    }
  }, []);

  const speakText = (text, voiceLocale) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLocale || 'en-IN';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      // Find suitable voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.lang === voiceLocale || v.lang.startsWith(voiceLocale?.split('-')[0]));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  const handleInitialVoicePlay = () => {
    speakText('Namaste! Welcome to SchemeSetu. Please select your preferred language.', 'hi-IN');
  };

  const handleSelectLanguage = (item) => {
    changeLanguage(item.code);
    speakText(item.greeting, item.voiceLang);
    setTimeout(() => {
      setIsOpen(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 25, 44, 0.82)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="modal-card"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header Banner */}
        <div style={{ background: 'linear-gradient(135deg, #0B192C 0%, #1E3E62 100%)', padding: '1.5rem', color: '#FFFFFF', position: 'relative' }}>
          <button
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              setIsOpen(false);
            }}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close language greeting modal"
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B192C', fontWeight: 800, fontSize: '1.3rem' }}>
              से
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                Welcome to SchemeSetu
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0 }}>
                AI-Powered Government Scheme & Welfare Discovery
              </p>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.08)', padding: '0.5rem 0.85rem', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: '#FCD34D', fontWeight: 600 }}>
              🔊 Voice Welcome Greeting
            </span>
            <button
              onClick={handleInitialVoicePlay}
              style={{
                backgroundColor: isSpeaking ? '#DC2626' : '#F59E0B',
                color: isSpeaking ? '#FFFFFF' : '#0B192C',
                border: 'none',
                borderRadius: '6px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isSpeaking ? 'Stop Voice' : 'Play Voice Greeting'}</span>
            </button>
          </div>
        </div>

        {/* Language Grid */}
        <div style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem', textAlign: 'center' }}>
            Select Your Preferred Language / अपनी भाषा चुनें / మీ భాషను ఎంచుకోండి
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748B', textAlign: 'center', marginBottom: '1.25rem' }}>
            SchemeSetu will translate the entire application and speak voice assistance in your chosen language.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {languageCards.map((item) => {
              const isSelected = item.code === lang;
              return (
                <button
                  key={item.code}
                  onClick={() => handleSelectLanguage(item)}
                  style={{
                    backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                    border: `2px solid ${isSelected ? '#2563EB' : '#E2E8F0'}`,
                    borderRadius: '12px',
                    padding: '0.75rem 0.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.2rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = '#94A3B8';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: isSelected ? '#1D4ED8' : '#0F172A' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
                    {item.sub}
                  </span>
                  {isSelected && (
                    <span style={{ marginTop: '0.25rem', backgroundColor: '#2563EB', color: '#FFFFFF', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                setIsOpen(false);
              }}
              className="btn btn-primary"
              style={{ padding: '0.65rem 2rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>Continue to SchemeSetu</span> <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
