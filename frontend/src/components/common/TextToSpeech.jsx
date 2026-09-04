/**
 * TextToSpeech v2 — Uses useTextToSpeech hook
 * Fixes: Chrome 200-char cutoff, alert() UX, no voice selection, no state export
 */
import React from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
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
