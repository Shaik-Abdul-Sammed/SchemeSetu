import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function VoiceSearchButton({ onResult, onError }) {
  const { lang, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const recognitionRef = useRef(null);

  // Map app language code to speech recognition locale
  const getLanguageLocale = () => {
    switch (lang) {
      case 'HI': return 'hi-IN';
      case 'TE': return 'te-IN';
      case 'TA': return 'ta-IN';
      case 'KN': return 'kn-IN';
      case 'ML': return 'ml-IN';
      case 'BN': return 'bn-IN';
      case 'MR': return 'mr-IN';
      case 'EN':
      default: return 'en-IN';
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const toggleVoiceSearch = () => {
    setErrorMessage(null);

    // If currently listening, stop
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const msg = t('voiceUnsupported', 'Voice search is not supported in this browser.');
      setErrorMessage(msg);
      if (onError) onError(msg);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = getLanguageLocale();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && onResult) {
          onResult(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        let userMsg = '';
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          userMsg = t('voicePermissionDenied', 'Microphone permission is required for voice search. Please enable microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          userMsg = 'No speech was detected. Please try speaking again.';
        } else {
          userMsg = `Voice recognition error: ${event.error}`;
        }
        setErrorMessage(userMsg);
        if (onError) onError(userMsg);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      const msg = 'Failed to initiate voice recognition.';
      setErrorMessage(msg);
      if (onError) onError(msg);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={toggleVoiceSearch}
        aria-label={isListening ? t('voiceListening', 'Listening... Speak now') : t('voiceSearch', 'Search by voice')}
        title={isListening ? t('voiceStop', 'Stop Listening') : t('voiceSearch', 'Search by voice')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          border: isListening ? '2px solid #EF4444' : '1px solid #CBD5E1',
          backgroundColor: isListening ? '#FEF2F2' : '#F8FAFC',
          color: isListening ? '#DC2626' : '#475569',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none'
        }}
      >
        {isListening ? (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span
              style={{
                position: 'absolute',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.3)',
                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
              }}
            />
            <MicOff size={19} />
          </div>
        ) : (
          <Mic size={19} />
        )}
      </button>

      {/* Inline Tooltip / Status Bubble */}
      {isListening && (
        <span
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: '8px',
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFFFFF', animation: 'pulse 1s infinite' }} />
          {t('voiceListening', 'Listening...')}
        </span>
      )}

      {errorMessage && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            fontSize: '0.78rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            width: '240px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.4rem'
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flexGrow: 1 }}>
            {errorMessage}
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              style={{
                display: 'block',
                marginTop: '4px',
                background: 'none',
                border: 'none',
                color: '#7F1D1D',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
