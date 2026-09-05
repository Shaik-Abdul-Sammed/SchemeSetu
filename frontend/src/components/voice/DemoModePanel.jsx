/**
 * DemoModePanel — SIH presentation overlay
 * Shows the full voice pipeline: Transcript → Language → Intent → Action
 * Includes pre-loaded demo test buttons for each language
 */
import React, { useState } from 'react';
import { Mic, ChevronDown, ChevronUp, Play, X, Activity } from 'lucide-react';

// Demo commands for SIH presentation
const DEMO_COMMANDS = [
  {
    lang: 'EN', flag: '🇬🇧', label: 'English',
    commands: [
      { text: 'Show me farming schemes', desc: 'DISCOVER_SCHEMES' },
      { text: 'Check my application status', desc: 'CHECK_STATUS' },
      { text: 'Find a bank near me', desc: 'FIND_NEAREST_BANK' },
      { text: 'I need a five lakh business loan', desc: 'DISCOVER_SCHEMES + slots' },
    ],
  },
  {
    lang: 'TE', flag: '🇮🇳', label: 'Telugu',
    commands: [
      { text: 'నాకు వ్యవసాయ పథకాలు చూపించండి', desc: 'DISCOVER_SCHEMES (Telugu)' },
      { text: 'నా అప్లికేషన్ స్టేటస్ చెప్పండి', desc: 'CHECK_STATUS (Telugu)' },
      { text: 'నా దగ్గర బ్యాంక్ ఎక్కడ ఉంది', desc: 'FIND_NEAREST_BANK (Telugu)' },
      { text: 'నాకు ఐదు లక్షల బిజినెస్ లోన్ కావాలి', desc: 'DISCOVER_SCHEMES + amount=500000' },
    ],
  },
  {
    lang: 'HI', flag: '🇮🇳', label: 'Hindi',
    commands: [
      { text: 'मुझे कृषि योजनाएं दिखाइए', desc: 'DISCOVER_SCHEMES (Hindi)' },
      { text: 'मेरे आवेदन की स्थिति बताइए', desc: 'CHECK_STATUS (Hindi)' },
      { text: 'मेरे पास बैंक कहां है', desc: 'FIND_NEAREST_BANK (Hindi)' },
      { text: 'मुझे पांच लाख का बिजनेस लोन चाहिए', desc: 'DISCOVER_SCHEMES + amount=500000' },
    ],
  },
  {
    lang: 'MX', flag: '🔀', label: 'Mixed',
    commands: [
      { text: 'Naaku farming loan kavali', desc: 'DISCOVER_SCHEMES (Tanglish)' },
      { text: 'Mujhe business loan chahiye', desc: 'DISCOVER_SCHEMES (Hinglish)' },
      { text: 'నా application status చెప్పండి', desc: 'CHECK_STATUS (Telugu-English)' },
    ],
  },
];

const PILL_COLORS = {
  EN: { bg: '#DBEAFE', text: '#1E40AF' },
  HI: { bg: '#FEF9C3', text: '#713F12' },
  TE: { bg: '#D1FAE5', text: '#065F46' },
  MX: { bg: '#F3E8FF', text: '#5B21B6' },
};

export default function DemoModePanel({
  transcript,
  detectionResult,
  intent,
  intentConfidence,
  actionTaken,
  locationState,
  effectiveLang,
  onSendCommand,    // (text) => void — injects a command into the voice pipeline
  onClose,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('EN');

  const confidence = detectionResult?.confidence || 0;
  const detectedLabel = detectionResult?.isMixed
    ? `${detectionResult.mixedLangs?.join('-') || 'Mixed'}`
    : detectionResult?.detectedLang || '—';

  return (
    <>
      {/* Float trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Demo Mode Panel"
        aria-expanded={isOpen}
        aria-label="Demo mode panel"
        style={{
          position: 'fixed', bottom: '5.5rem', right: '1.2rem', zIndex: 300,
          background: 'linear-gradient(135deg, #1E3E62, #0A1628)',
          color: '#FFD700', border: '2px solid #FFD700',
          borderRadius: '50px', padding: '0.55rem 1rem',
          fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          transition: 'transform 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
      >
        <Activity size={14} aria-hidden="true" />
        DEMO
        {isOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          role="complementary"
          aria-label="Voice demo mode panel"
          style={{
            position: 'fixed', bottom: '9rem', right: '1.2rem', zIndex: 300,
            width: 'min(420px, 95vw)',
            background: '#0A1628',
            border: '1px solid #FFD700',
            borderRadius: '16px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            overflow: 'hidden', fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1E3E62, #0A1628)',
            padding: '0.8rem 1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mic size={16} style={{ color: '#FFD700' }} aria-hidden="true" />
              <span style={{ color: '#FFD700', fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.05em' }}>
                VOICE DEMO MODE
              </span>
            </div>
            <button
              type="button"
              onClick={() => { setIsOpen(false); onClose?.(); }}
              aria-label="Close demo panel"
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Live pipeline status */}
          <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #1E3E62' }}>
            <div style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              LIVE PIPELINE V4
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem' }}>
              <PipelineRow label="📍 Location" value={locationState || 'Unknown'} />
              <PipelineRow label="🌐 Effective Lang" value={effectiveLang || 'EN'} highlight />
              <PipelineRow label="🎤 Last Transcript" value={transcript ? transcript.substring(0, 25) + (transcript.length > 25 ? '…' : '') : 'Waiting…'} />
              <PipelineRow label="🔍 Detected Lang" value={detectedLabel} />
              <PipelineRow label="🎯 Intent" value={intent || '—'} highlight />
              <PipelineRow
                label="✅ Confidence"
                value={confidence > 0 ? `${Math.round(confidence * 100)}%` : '—'}
                color={confidence >= 0.75 ? '#6EE7B7' : confidence >= 0.5 ? '#FCD34D' : '#FCA5A5'}
              />
              <PipelineRow label="🛡️ Source Hierarchy" value="1. Official Govt Portal (.gov.in)" full color="#6EE7B7" />
              {actionTaken && <PipelineRow label="⚡ Action" value={actionTaken} full />}
            </div>
          </div>

          {/* Demo command tabs */}
          <div>
            {/* Tab bar */}
            <div style={{
              display: 'flex', borderBottom: '1px solid #1E3E62',
              overflowX: 'auto',
            }}>
              {DEMO_COMMANDS.map(({ lang, flag, label }) => (
                <button
                  key={lang}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === lang}
                  onClick={() => setActiveTab(lang)}
                  style={{
                    flex: '0 0 auto', padding: '0.5rem 0.75rem',
                    background: activeTab === lang ? '#1E3E62' : 'transparent',
                    border: 'none', borderBottom: activeTab === lang ? '2px solid #FFD700' : '2px solid transparent',
                    color: activeTab === lang ? '#FFD700' : '#64748B',
                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                    whiteSpace: 'nowrap', transition: 'all 120ms',
                  }}
                >
                  {flag} {label}
                </button>
              ))}
            </div>

            {/* Commands list */}
            <div style={{ padding: '0.6rem', maxHeight: '200px', overflowY: 'auto' }}>
              {DEMO_COMMANDS.find((d) => d.lang === activeTab)?.commands.map((cmd, i) => {
                const colors = PILL_COLORS[activeTab] || PILL_COLORS.EN;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                      gap: '0.5rem', padding: '0.4rem 0.5rem', borderRadius: '8px', marginBottom: '0.3rem',
                      background: '#0F2340',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#E2E8F0', fontSize: '0.78rem', fontWeight: 600, wordBreak: 'break-word' }}>
                        "{cmd.text}"
                      </div>
                      <div style={{
                        display: 'inline-block', marginTop: '0.2rem',
                        background: colors.bg, color: colors.text,
                        borderRadius: '4px', padding: '0.1rem 0.4rem', fontSize: '0.65rem', fontWeight: 700,
                      }}>
                        {cmd.desc}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSendCommand?.(cmd.text)}
                      aria-label={`Try: ${cmd.text}`}
                      style={{
                        background: '#1E3E62', border: 'none', borderRadius: '6px',
                        padding: '0.35rem 0.5rem', cursor: 'pointer', color: '#FFD700',
                        display: 'flex', alignItems: 'center', flexShrink: 0,
                        transition: 'background 120ms',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#2D5A8E'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#1E3E62'; }}
                    >
                      <Play size={13} aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <div style={{
            padding: '0.5rem 1rem',
            borderTop: '1px solid #1E3E62',
            color: '#475569', fontSize: '0.65rem', textAlign: 'center',
          }}>
            Demo data only — bank distances use real Haversine math
          </div>
        </div>
      )}
    </>
  );
}

function PipelineRow({ label, value, highlight, color, full }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      <div style={{ color: '#475569', fontSize: '0.67rem', fontWeight: 600 }}>{label}</div>
      <div style={{
        color: color || (highlight ? '#FFD700' : '#E2E8F0'),
        fontSize: '0.75rem', fontWeight: highlight ? 700 : 500,
        wordBreak: 'break-word', marginTop: '1px',
      }}>
        {value}
      </div>
    </div>
  );
}
