/**
 * TextToSpeech v2 — Uses useTextToSpeech hook
 * Fixes: Chrome 200-char cutoff, alert() UX, no voice selection, no state export
 */
import React from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export default function TextToSpeech({ text }) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
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
      case 'GON': return 'hi-IN';
      case 'BHI': return 'hi-IN';
      case 'EN':
      default: return 'en-IN';
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      showToast(t('voiceUnsupported', 'Text-to-speech is not supported in this browser.'), 'warning');
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
import useTextToSpeech from '../../hooks/useTextToSpeech';

export default function TextToSpeech({ text }) {
  const { lang, t } = useLanguage();
  const { speak, stop, toggle, isSpeaking, isSupported } = useTextToSpeech({ lang });

  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        className="btn btn-sm btn-outline"
        style={{ opacity: 0.5, cursor: 'not-allowed' }}
        title={t('voiceUnsupported', 'Text-to-speech not supported in this browser')}
        aria-disabled="true"
      >
        <VolumeX size={14} aria-hidden="true" />
        <span>{t('readAloud', 'Listen')}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(text)}
      className={`btn btn-sm ${isSpeaking ? 'btn-green' : 'btn-outline'}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
      title={isSpeaking ? t('stopAloud', 'Stop reading') : t('readAloud', 'Read aloud')}
      aria-label={isSpeaking ? t('stopAloud', 'Stop reading') : t('readAloud', 'Read aloud')}
      aria-pressed={isSpeaking}
    >
      {isSpeaking
        ? <VolumeX size={14} aria-hidden="true" />
        : <Volume2 size={14} aria-hidden="true" />
      }
      <span>{isSpeaking ? t('stopAloud', 'Stop') : t('readAloud', 'Listen')}</span>
    </button>
  );
}
