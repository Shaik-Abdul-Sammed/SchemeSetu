/**
 * AudioReaderButton v2 — Uses useTextToSpeech hook
 * Fixes: alert() usage, no chunking, tailwind class refs
 */
import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import useTextToSpeech from '../../hooks/useTextToSpeech';

export default function AudioReaderButton({ textToRead, label }) {
  const { lang, t } = useLanguage();
  const { toggle, isSpeaking, isSupported } = useTextToSpeech({ lang });

  const cleanText = textToRead ? textToRead.replace(/<[^>]*>/g, '').trim() : '';

  if (!isSupported) {
    return null; // Silently hide if TTS not supported — no alert
  }

  return (
    <button
      type="button"
      onClick={() => toggle(cleanText)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '0.4rem 0.9rem', borderRadius: '10px',
        fontSize: '0.78rem', fontWeight: 700,
        background: isSpeaking ? 'var(--gold-500, #D97706)' : '#1E293B',
        color: isSpeaking ? '#fff' : '#F59E0B',
        border: `1px solid ${isSpeaking ? 'transparent' : '#334155'}`,
        cursor: cleanText ? 'pointer' : 'not-allowed',
        opacity: cleanText ? 1 : 0.5,
        transition: 'all 200ms ease',
        minHeight: '36px',
      }}
      title={isSpeaking ? t('stopAloud', 'Stop Audio') : t('readAloud', 'Listen to Scheme Details')}
      aria-label={isSpeaking ? t('stopAloud', 'Stop Audio') : t('readAloud', 'Listen to Scheme Details')}
      aria-pressed={isSpeaking}
      disabled={!cleanText}
    >
      {isSpeaking ? <VolumeX size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
      <span>{isSpeaking ? t('stopAloud', 'Stop Audio') : (label || t('readAloud', 'Read Aloud'))}</span>
    </button>
  );
}
