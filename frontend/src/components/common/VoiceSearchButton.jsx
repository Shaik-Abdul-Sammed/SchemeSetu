/**
 * VoiceSearchButton v2 — Production-grade voice input button
 *
 * Uses useVoiceRecognition hook. Improvements over v1:
 *  - Proper VOICE_STATES state machine (not boolean isListening)
 *  - Shows interim live transcript
 *  - Confidence-based fallback messaging
 *  - Silence timeout (4s) + hard cap (15s) — no infinite listening
 *  - Permission-denied specific guidance
 *  - Retry button on error
 *  - No alert() calls
 *  - Accessible: aria-live region for status
 */
import React from 'react';
import { Mic, MicOff, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import useVoiceRecognition, { VOICE_STATES, VOICE_ERRORS } from '../../hooks/useVoiceRecognition';
import { normalizeTranscript, isTranscriptMeaningful } from '../../utils/voiceUtils';

export default function VoiceSearchButton({ onResult, onError }) {
  const { lang, t } = useLanguage();

  const { state, isListening, isProcessing, isRequesting, hasError, isSupported,
          interimTranscript, errorInfo, startListening, stopListening, clearError, toggle } =
    useVoiceRecognition({
      lang,
      onResult: (transcript, confidence) => {
        const normalized = normalizeTranscript(transcript);
        if (isTranscriptMeaningful(normalized) && onResult) {
          onResult(normalized);
        }
      },
      onError: (type, message) => {
        if (onError) onError(message);
      },
    });

  const isActive = isListening || isRequesting;

  const getStatusLabel = () => {
    switch (state) {
      case VOICE_STATES.REQUESTING: return t('voiceRequesting', 'Requesting mic...');
      case VOICE_STATES.LISTENING:  return t('voiceListening', 'Listening...');
      case VOICE_STATES.PROCESSING: return t('voiceProcessing', 'Processing...');
      case VOICE_STATES.ERROR:      return '';
      default:                      return t('voiceSearch', 'Voice search');
    }
  };

  const getButtonColor = () => {
    if (hasError) return { bg: '#FFF1F2', border: '#FCA5A5', color: '#DC2626' };
    if (isListening) return { bg: '#FEF2F2', border: '#EF4444', color: '#DC2626' };
    if (isRequesting || isProcessing) return { bg: '#EFF6FF', border: '#93C5FD', color: '#3B82F6' };
    return { bg: '#F8FAFC', border: '#CBD5E1', color: '#475569' };
  };

  const colors = getButtonColor();

  if (!isSupported) {
    return (
      <div
        title={t('voiceUnsupported', 'Voice search requires Chrome or Edge browser')}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '42px', height: '42px', borderRadius: '10px',
          border: '1px dashed #CBD5E1', backgroundColor: '#F8FAFC',
          color: '#94A3B8', opacity: 0.6, cursor: 'not-allowed' }}
        aria-label={t('voiceUnsupported', 'Voice search not supported in this browser')}
        aria-disabled="true"
      >
        <MicOff size={18} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Main mic button */}
      <button
        type="button"
        onClick={() => {
          if (hasError) { clearError(); return; }
          toggle();
        }}
        aria-label={isActive
          ? t('voiceStop', 'Stop listening')
          : hasError
            ? t('voiceRetry', 'Retry voice search')
            : t('voiceSearch', 'Search by voice')}
        aria-pressed={isActive}
        aria-busy={isProcessing || isRequesting}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '42px', height: '42px', borderRadius: '10px',
          border: `1.5px solid ${colors.border}`,
          backgroundColor: colors.bg, color: colors.color,
          cursor: 'pointer',
          transition: 'all 200ms ease',
          boxShadow: isListening ? `0 0 0 3px rgba(220,38,38,0.2)` : 'none',
          position: 'relative', overflow: 'visible',
        }}
      >
        {/* Pulse ring when listening */}
        {isListening && (
          <span style={{
            position: 'absolute', inset: '-4px', borderRadius: '14px',
            border: '2px solid rgba(220,38,38,0.35)',
            animation: 'pulse 1.5s ease-out infinite',
            pointerEvents: 'none',
          }} aria-hidden="true" />
        )}

        {isProcessing || isRequesting
          ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          : hasError
            ? <RefreshCw size={18} />
            : isListening
              ? <MicOff size={19} />
              : <Mic size={19} />
        }
      </button>

      {/* Aria live region — announces state to screen readers */}
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        {getStatusLabel()}
      </span>

      {/* Listening tooltip */}
      {isActive && (
        <span style={{
          position: 'absolute', bottom: '100%', right: 0,
          marginBottom: '6px', backgroundColor: '#DC2626', color: '#fff',
          fontSize: '0.72rem', fontWeight: 700,
          padding: '0.25rem 0.6rem', borderRadius: '6px',
          whiteSpace: 'nowrap', zIndex: 60,
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          pointerEvents: 'none',
        }} aria-hidden="true">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 1s infinite' }} />
          {getStatusLabel()}
        </span>
      )}

      {/* Interim transcript preview */}
      {isListening && interimTranscript && (
        <div style={{
          position: 'absolute', top: '100%', right: 0,
          marginTop: '6px', background: '#FEF9C3', border: '1px dashed #FCD34D',
          borderRadius: '8px', padding: '0.4rem 0.65rem',
          fontSize: '0.75rem', color: '#78350F', maxWidth: '220px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 60,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }} aria-live="off" aria-hidden="true">
          💬 {interimTranscript}
        </div>
      )}

      {/* Error message */}
      {hasError && errorInfo && (
        <div style={{
          position: 'absolute', top: '100%', right: 0,
          marginTop: '6px', background: '#FEF2F2',
          border: '1px solid #FCA5A5', borderRadius: '8px',
          padding: '0.5rem 0.75rem', width: '240px',
          fontSize: '0.78rem', color: '#991B1B',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 60,
          display: 'flex', alignItems: 'flex-start', gap: '0.4rem',
        }} role="alert">
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            {errorInfo.type === VOICE_ERRORS.PERMISSION_DENIED ? (
              <>
                <strong>Mic access blocked.</strong>
                {' '}Click the lock icon in your address bar → allow microphone.
              </>
            ) : (
              errorInfo.message
            )}
            <button
              type="button"
              onClick={clearError}
              style={{ display: 'block', marginTop: '4px', background: 'none',
                border: 'none', color: '#7F1D1D', fontSize: '0.72rem',
                fontWeight: 700, cursor: 'pointer', padding: 0,
                textDecoration: 'underline' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
