import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export default function AudioReaderButton({ textToRead, label }) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);

  const getLanguageLocale = () => {
    switch (lang) {
      case 'HI': return 'hi-IN';
      case 'TE': return 'te-IN';
      case 'TA': return 'ta-IN';
      case 'KN': return 'kn-IN';
      case 'ML': return 'ml-IN';
      case 'BN': return 'bn-IN';
      case 'MR': return 'mr-IN';
      case 'GON': return 'hi-IN';
      case 'BHI': return 'hi-IN';
      case 'EN':
      default: return 'en-IN';
    }
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      showToast(t('voiceUnsupported', 'Text-to-Speech audio reader is not supported in this browser.'), 'warning');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = textToRead ? textToRead.replace(/<[^>]*>?/gm, '') : '';
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = getLanguageLocale();
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={toggleSpeech}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-sm ${
        isPlaying
          ? 'bg-amber-500 text-slate-950 font-bold animate-pulse'
          : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
      }`}
      title={isPlaying ? t('stopAloud', 'Stop Audio') : t('readAloud', 'Listen to Scheme Details')}
      aria-label={isPlaying ? t('stopAloud', 'Stop Audio') : t('readAloud', 'Listen to Scheme Details')}
    >
      {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      <span>{isPlaying ? t('stopAloud', 'Stop Audio') : (label || t('readAloud', 'Read Aloud'))}</span>
    </button>
  );
}
