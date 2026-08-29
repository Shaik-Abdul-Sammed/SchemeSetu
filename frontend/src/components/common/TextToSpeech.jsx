import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function TextToSpeech({ text }) {
  const { lang, t } = useLanguage();
  const [speaking, setSpeaking] = useState(false);

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

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert(t('voiceUnsupported', 'Text-to-speech is not supported in this browser.'));
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageLocale();
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      className={`btn btn-sm ${speaking ? 'btn-green' : 'btn-outline'}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
      title={speaking ? t('stopAloud', 'Stop Listening') : t('readAloud', 'Read Aloud')}
      aria-label={speaking ? t('stopAloud', 'Stop Listening') : t('readAloud', 'Read Aloud')}
    >
      {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
      <span>{speaking ? t('stopAloud', 'Stop') : t('readAloud', 'Listen')}</span>
    </button>
  );
}
