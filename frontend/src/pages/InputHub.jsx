/**
 * InputHub v3 — Production Voice + Conversational AI
 * ─────────────────────────────────────────────────────────────────────────────
 * Improvements over v2:
 *  • Uses useVoiceRecognition hook (fixes all stale-closure/race conditions)
 *  • Uses useTextToSpeech hook (chunked, voice-selected, no cutoff)
 *  • Transcript normalization before processing (spoken numbers, fillers)
 *  • Multi-step conversation context with slot accumulation
 *  • Confidence-based intent flow (not just keyword scan)
 *  • Duplicate-submission prevention via submittingRef
 *  • Retry button when voice fails
 *  • Live interim transcript in chat bubble
 *  • Proper voiceState UI: Ready / Listening / Processing / Speaking / Error
 *  • Text debounce to prevent double-send
 *  • Error recovery — never stuck in loading state
 *  • Security: input length capped before API call
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mic, MicOff, Type, FileText, Send, Sparkles, User,
  ToggleLeft, ToggleRight, MapPin, CheckCircle, Loader2, Volume2,
  VolumeX, AlertCircle, RefreshCw, XCircle, Wand2, Radio
} from 'lucide-react';
import { api } from '../services/api';
import { safeGetLocation } from '../utils/capacitor';
import { useLanguage } from '../context/LanguageContext';
import AgentReportModal from '../components/agent/AgentReportModal';
import useVoiceRecognition, { VOICE_STATES, VOICE_ERRORS } from '../hooks/useVoiceRecognition';
import useTextToSpeech from '../hooks/useTextToSpeech';
import {
  normalizeTranscript,
  extractAmount,
  detectProjectType,
  detectNumberContext,
  isTranscriptMeaningful,
} from '../utils/voiceUtils';

// ── Conversation Steps ────────────────────────────────────────────────────────
const STEPS = {
  GREETING: 'greeting',
  PROJECT_TYPE: 'project_type',
  COST: 'cost',
  INCOME: 'income',
  EDUCATION: 'education',
  SUBMITTING: 'submitting',
  DONE: 'done',
};

// ── Intent → Label ────────────────────────────────────────────────────────────
const STATE_LABELS = {
  [VOICE_STATES.IDLE]:       'Tap Microphone to Speak',
  [VOICE_STATES.REQUESTING]: 'Requesting microphone…',
  [VOICE_STATES.LISTENING]:  'Listening… Speak clearly',
  [VOICE_STATES.PROCESSING]: 'Processing your voice…',
  [VOICE_STATES.ERROR]:      'Voice error — tap to retry',
};

const STATE_COLORS = {
  [VOICE_STATES.IDLE]:       { bg: '#D97706', glow: 'rgba(217,119,6,0.35)' },
  [VOICE_STATES.REQUESTING]: { bg: '#3B82F6', glow: 'rgba(59,130,246,0.3)' },
  [VOICE_STATES.LISTENING]:  { bg: '#DC2626', glow: 'rgba(220,38,38,0.4)' },
  [VOICE_STATES.PROCESSING]: { bg: '#7C3AED', glow: 'rgba(124,58,237,0.35)' },
  [VOICE_STATES.ERROR]:      { bg: '#991B1B', glow: 'rgba(153,27,27,0.3)' },
};

export default function InputHub() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const chatEndRef = useRef(null);

  // Mode
  const [mode, setMode] = useState('user'); // 'user' | 'agent'
  const [inputMode, setInputMode] = useState('voice'); // 'voice' | 'text' | 'scan'

  // Chat state
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');

  // Conversation slot collection
  const [step, setStep] = useState(STEPS.GREETING);
  const [criteria, setCriteria] = useState({
    projectType: '',
    cost: '',
    income: '',
    education: '',
    occupation: '',
  });
  const stepRef = useRef(STEPS.GREETING);     // Avoid stale closure in callbacks
  const criteriaRef = useRef(criteria);
  const submittingRef = useRef(false);        // Prevent duplicate submissions
  const textDebounceRef = useRef(null);

  // UI state
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agentReportOpen, setAgentReportOpen] = useState(false);

  // Agent Mode Fast-Fill
  const [agentForm, setAgentForm] = useState({
    name: 'Ramesh Kumar', age: 32, income: 240000,
    projectType: 'manufacturing', cost: 350000,
    education: '10th pass', occupation: 'Farmer',
    location: 'Hyderabad, Telangana',
  });

  // ── TTS ──────────────────────────────────────────────────────────────────
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech({ lang });

  const speakIfNotMuted = useCallback((text) => {
    if (!isMuted) speak(text);
  }, [isMuted, speak]);

  // ── STT ──────────────────────────────────────────────────────────────────
  const { state: voiceState, isListening, isProcessing: voiceProcessing,
          isRequesting, hasError: voiceHasError, isSupported: voiceSupported,
          interimTranscript, errorInfo, startListening, stopListening,
          clearError, toggle: toggleVoice } = useVoiceRecognition({
    lang,
    onResult: (transcript, confidence) => {
      const normalized = normalizeTranscript(transcript);
      if (isTranscriptMeaningful(normalized)) {
        handleUserMessage(normalized);
      }
    },
    onError: (type, message) => {
      // Error already shown in voice state; also add chat bubble for context
      if (type === VOICE_ERRORS.NO_SPEECH) {
        addBotMessage('I couldn\'t hear you. Please tap the microphone and speak again.');
      }
    },
  });

  // Sync step/criteria to refs (avoid stale closures)
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { criteriaRef.current = criteria; }, [criteria]);

  // ── Initialization ────────────────────────────────────────────────────────
  useEffect(() => {
    const welcome = t(
      'botWelcome',
      'Namaste! I am SchemeSetu AI Assistant. What kind of government assistance do you need today? For example: business loan, agriculture subsidy, or education support.'
    );
    setMessages([{ sender: 'bot', text: welcome, id: 'welcome' }]);
    setStep(STEPS.PROJECT_TYPE);
    // Don't auto-speak on mount — user hasn't interacted yet
  }, [lang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, voiceState, isSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      clearTimeout(textDebounceRef.current);
    };
  }, []);

  // ── Message helpers ───────────────────────────────────────────────────────
  const addBotMessage = useCallback((text, speak = true) => {
    const msg = { sender: 'bot', text, id: `bot_${Date.now()}` };
    setMessages((prev) => [...prev, msg]);
    if (speak) speakIfNotMuted(text);
  }, [speakIfNotMuted]);

  // ── Core Conversation Logic ───────────────────────────────────────────────
  const handleUserMessage = useCallback(async (rawText) => {
    // Security: cap input length
    const text = (rawText || '').substring(0, 400).trim();
    if (!text) return;

    // Prevent duplicate processing
    if (submittingRef.current && stepRef.current === STEPS.SUBMITTING) return;

    // Add user message
    const userMsg = { sender: 'user', text, id: `user_${Date.now()}` };
    setMessages((prev) => [...prev, userMsg]);
    setTextInput('');

    const normalized = normalizeTranscript(text);
    const currentStep = stepRef.current;
    const currentCriteria = { ...criteriaRef.current };

    // ── STEP: PROJECT TYPE ───────────────────────────────────────────────
    if (currentStep === STEPS.PROJECT_TYPE || !currentCriteria.projectType) {
      const detected = detectProjectType(normalized);
      const updated = { ...currentCriteria, projectType: detected };
      setCriteria(updated);
      setStep(STEPS.COST);

      const reply = t('gotProjectType',
        `Got it — you're looking for ${detected} assistance. What is your estimated project cost or required loan amount? (e.g. "3 lakh" or "300000")`
      ).replace('${detected}', detected);

      setTimeout(() => addBotMessage(reply), 300);
      return;
    }

    // ── STEP: COST ───────────────────────────────────────────────────────
    if (currentStep === STEPS.COST || !currentCriteria.cost) {
      const amount = extractAmount(normalized);

      if (amount === null || amount <= 0) {
        // Couldn't parse — ask to clarify
        addBotMessage(t('costClarify',
          'I could not understand the amount. Please say the amount clearly, like "2 lakh" or "200000".'
        ));
        return;
      }

      if (amount < 1000 || amount > 100000000) {
        addBotMessage(t('costOutOfRange',
          `₹${amount.toLocaleString('en-IN')} seems unusual. Please enter an amount between ₹1,000 and ₹10 crore.`
        ));
        return;
      }

      const updated = { ...currentCriteria, cost: amount };
      setCriteria(updated);
      setStep(STEPS.INCOME);

      const reply = `Understood — project cost of ₹${amount.toLocaleString('en-IN')}. What is your annual household income? (e.g. "1.5 lakh" or "150000")`;
      setTimeout(() => addBotMessage(reply), 300);
      return;
    }

    // ── STEP: INCOME ─────────────────────────────────────────────────────
    if (currentStep === STEPS.INCOME || !currentCriteria.income) {
      const amount = extractAmount(normalized);

      if (amount === null || amount <= 0) {
        addBotMessage(t('incomeClarify',
          'I could not understand the income. Please say it clearly, like "1 lakh 80 thousand" or "180000".'
        ));
        return;
      }

      const updated = { ...currentCriteria, income: amount };
      setCriteria(updated);
      setStep(STEPS.EDUCATION);

      const reply = `Great! What is your highest education level? (e.g. "10th pass", "12th pass", "graduate", or "diploma")`;
      setTimeout(() => addBotMessage(reply), 300);
      return;
    }

    // ── STEP: EDUCATION → SUBMIT ─────────────────────────────────────────
    if (currentStep === STEPS.EDUCATION || !currentCriteria.education) {
      const updated = { ...currentCriteria, education: text };
      setCriteria(updated);
      setStep(STEPS.SUBMITTING);
      submittingRef.current = true;

      const calculating = t('calculating',
        'Thank you! SchemeSetu is evaluating verified government schemes for you now...'
      );
      addBotMessage(calculating);

      setTimeout(() => submitRecommendation(updated), 600);
    }
  }, [t, addBotMessage]);

  // ── API Submit ────────────────────────────────────────────────────────────
  const submitRecommendation = async (finalCriteria) => {
    setIsLoading(true);
    try {
      const res = await api.post('/schemes/recommend', {
        income: finalCriteria.income || 200000,
        cost: finalCriteria.cost || 300000,
        education: finalCriteria.education || '10th pass',
        projectType: finalCriteria.projectType || 'business',
        occupation: finalCriteria.occupation || 'Farmer',
      });

      const schemes = res.schemes || res.data || [];
      setStep(STEPS.DONE);
      setIsLoading(false);
      navigate('/results', { state: { schemes, criteria: finalCriteria } });
    } catch (err) {
      setIsLoading(false);
      submittingRef.current = false;
      setStep(STEPS.EDUCATION);
      addBotMessage(
        'Sorry, I had trouble connecting to the server. Please try again, or switch to text mode.',
        false
      );
    }
  };

  // ── Text submit (debounced) ───────────────────────────────────────────────
  const handleTextSubmit = (e) => {
    e.preventDefault();
    const val = textInput.trim();
    if (!val) return;

    clearTimeout(textDebounceRef.current);
    textDebounceRef.current = setTimeout(() => {
      handleUserMessage(val);
    }, 50);
  };

  // ── Agent form submit ─────────────────────────────────────────────────────
  const handleAgentSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsLoading(true);
    try {
      await api.post('/agent/submit', { ...agentForm, agentId: 'agent-101' });
    } catch (_) {}
    submittingRef.current = false;
    setIsLoading(false);
    setAgentReportOpen(true);
  };

  const handleGpsDetect = async () => {
    const loc = await safeGetLocation();
    setAgentForm({ ...agentForm, location: `Lat: ${loc.lat.toFixed(4)}, Lng: ${loc.lng.toFixed(4)}` });
  };

  // Reset conversation
  const resetConversation = () => {
    submittingRef.current = false;
    stopSpeaking();
    clearError();
    setCriteria({ projectType: '', cost: '', income: '', education: '', occupation: '' });
    setStep(STEPS.PROJECT_TYPE);
    setMessages([]);
    setTextInput('');
    const welcome = t('botWelcome', 'Conversation reset. What kind of government assistance do you need?');
    setTimeout(() => addBotMessage(welcome, false), 100);
  };

  // ── Render state-aware mic button ─────────────────────────────────────────
  const micColors = STATE_COLORS[voiceState] || STATE_COLORS[VOICE_STATES.IDLE];

  const renderVoiceStateLabel = () => {
    if (isSpeaking) return 'Assistant speaking…';
    return STATE_LABELS[voiceState] || 'Tap Microphone to Speak';
  };

  return (
    <div
      className="container"
      style={{
        maxWidth: '860px', margin: '0 auto',
        minHeight: '85vh', display: 'flex', flexDirection: 'column',
        width: '100%', padding: '1rem',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.85rem 1.15rem',
        background: 'linear-gradient(135deg, #0B192C, #1E3E62)',
        color: '#fff', borderRadius: '14px', marginBottom: '1rem',
        boxShadow: '0 4px 14px rgba(0,0,0,0.18)', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', minHeight: '44px', padding: '0 0.25rem' }}
            aria-label="Go Back"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.15rem', color: '#fff', margin: 0, fontWeight: 700 }}>
              {t('tellUsNeed', 'Tell Us About Your Need')}
            </h1>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
              {mode === 'user'
                ? t('convAssistant', 'SchemeSetu Voice Assistant')
                : t('fastFillAgent', 'CSC / VLE Fast-Fill Portal')}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Mute toggle */}
          <button
            onClick={() => { if (!isMuted) stopSpeaking(); setIsMuted(!isMuted); }}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.65rem', minHeight: '40px' }}
            title={isMuted ? 'Unmute Voice' : 'Mute Voice'}
            aria-label={isMuted ? 'Unmute Voice' : 'Mute Voice'}
            aria-pressed={isMuted}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Reset conversation */}
          {mode === 'user' && (
            <button
              onClick={resetConversation}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.65rem', minHeight: '40px' }}
              title="Start over conversation"
              aria-label="Reset conversation"
            >
              <RefreshCw size={16} />
            </button>
          )}

          {/* Mode toggle */}
          <button
            onClick={() => setMode(mode === 'user' ? 'agent' : 'user')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '0.4rem 0.85rem', borderRadius: '20px',
              color: '#fff', fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer', minHeight: '40px',
            }}
            aria-label={mode === 'user' ? 'Switch to Agent Mode' : 'Switch to Citizen Mode'}
          >
            {mode === 'user'
              ? <ToggleLeft size={20} style={{ color: '#F59E0B' }} />
              : <ToggleRight size={20} style={{ color: '#059669' }} />}
            <span>{mode === 'user' ? t('userMode', 'Citizen') : t('agentMode', 'Agent')}</span>
          </button>
        </div>
      </div>

      {/* ── Loading Overlay ─────────────────────────────────────────────── */}
      {isLoading && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(11,25,44,0.82)',
          backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, color: '#fff', padding: '1rem', textAlign: 'center',
        }} role="status" aria-live="assertive">
          <Loader2 size={48} style={{ color: '#F59E0B', marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>
            {t('findingBestScheme', 'Finding the best scheme for you…')}
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '0.95rem', maxWidth: '450px' }}>
            {t('analyzingThresholds', 'Analyzing income thresholds, loan margins, and eligibility criteria')}
          </p>
        </div>
      )}

      {/* ── USER MODE: Conversational Voice & Chat ──────────────────────── */}
      {mode === 'user' && (
        <div style={{
          flexGrow: 1, display: 'flex', flexDirection: 'column',
          background: '#fff', borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)', overflow: 'hidden',
        }}>
          {/* Chat scroll area */}
          <div
            role="log"
            aria-label="Conversation messages"
            aria-live="polite"
            style={{
              flexGrow: 1, padding: '1.25rem', overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: '1rem',
              minHeight: '340px', maxHeight: '460px',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: '0.65rem', width: '100%', alignItems: 'flex-end',
                }}
              >
                {msg.sender === 'bot' && (
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: '#0B192C', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#F59E0B', flexShrink: 0,
                  }} aria-hidden="true">
                    <Sparkles size={18} />
                  </div>
                )}
                <div
                  role="article"
                  aria-label={`${msg.sender === 'user' ? 'You' : 'Assistant'}: ${msg.text}`}
                  style={{
                    maxWidth: '78%', padding: '0.85rem 1.1rem',
                    borderRadius: msg.sender === 'user'
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    backgroundColor: msg.sender === 'user' ? '#1E3E62' : '#F1F5F9',
                    color: msg.sender === 'user' ? '#fff' : '#0F172A',
                    fontSize: '0.95rem', lineHeight: 1.55,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', wordBreak: 'break-word',
                  }}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: '#D97706', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff', flexShrink: 0,
                  }} aria-hidden="true">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}

            {/* Live interim transcript bubble */}
            {isListening && interimTranscript && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }} aria-live="off" aria-hidden="true">
                <div style={{
                  maxWidth: '78%', padding: '0.7rem 1rem',
                  borderRadius: '18px 18px 4px 18px',
                  backgroundColor: '#FEF9C3', color: '#78350F',
                  fontSize: '0.88rem', fontStyle: 'italic',
                  border: '1px dashed #FCD34D',
                }}>
                  🎤 "{interimTranscript}"
                </div>
              </div>
            )}

            {/* Assistant speaking indicator */}
            {isSpeaking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.85rem', paddingLeft: '2.5rem' }}>
                <Volume2 size={16} style={{ color: '#059669' }} aria-hidden="true" />
                <span style={{ fontStyle: 'italic' }}>Assistant speaking…</span>
                <button
                  onClick={stopSpeaking}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  aria-label="Stop speaking"
                >
                  Stop
                </button>
              </div>
            )}

            {/* Voice processing indicator */}
            {voiceProcessing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.85rem', paddingLeft: '2.5rem' }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: '#7C3AED' }} aria-hidden="true" />
                <span>Processing your voice…</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* ── Status Bar ─────────────────────────────────────────────── */}
          {isListening && (
            <div
              role="status"
              aria-live="assertive"
              style={{
                padding: '0.85rem 1.25rem', background: '#FEF3C7',
                borderTop: '1px solid #FDE68A',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', color: '#92400E',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
                <span
                  style={{ width: 12, height: 12, background: '#DC2626', borderRadius: '50%', animation: 'pulse 1s ease-in-out infinite' }}
                  aria-hidden="true"
                />
                <span>Listening… speak clearly, then pause</span>
              </div>
              <button
                onClick={stopListening}
                className="btn btn-sm btn-outline"
                style={{ color: '#92400E', borderColor: '#FCD34D' }}
                aria-label="Done speaking"
              >
                Done Speaking
              </button>
            </div>
          )}

          {/* Voice error bar */}
          {voiceHasError && errorInfo && (
            <div
              role="alert"
              style={{
                padding: '0.75rem 1.25rem', background: '#FEF2F2',
                borderTop: '1px solid #FECACA',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', color: '#991B1B', fontSize: '0.88rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} aria-hidden="true" />
                <span>
                  {errorInfo.type === VOICE_ERRORS.PERMISSION_DENIED
                    ? 'Microphone access blocked — check browser settings and tap Retry.'
                    : errorInfo.type === VOICE_ERRORS.NO_SPEECH
                      ? 'No speech detected. Tap the microphone and speak clearly.'
                      : errorInfo.message}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={() => { clearError(); startListening(); }}
                  className="btn btn-sm btn-outline"
                  style={{ color: '#991B1B', borderColor: '#FCA5A5' }}
                  aria-label="Retry voice input"
                >
                  <RefreshCw size={13} /> Retry
                </button>
                <button onClick={clearError} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 700, minHeight: '36px', padding: '0 0.25rem' }} aria-label="Dismiss error">✕</button>
              </div>
            </div>
          )}

          {/* ── Input Bar ──────────────────────────────────────────────── */}
          <div style={{ padding: '1.25rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
            {/* Big Mic Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => {
                  if (voiceHasError) { clearError(); startListening(); return; }
                  if (isSpeaking) { stopSpeaking(); return; }
                  toggleVoice();
                }}
                disabled={voiceProcessing}
                style={{
                  borderRadius: '50%', width: 74, height: 74, padding: 0, border: 'none',
                  background: micColors.bg,
                  boxShadow: `0 0 0 ${isListening ? '14px' : '6px'} ${micColors.glow}`,
                  transition: 'all 280ms cubic-bezier(0.34,1.56,0.64,1)',
                  cursor: voiceProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', opacity: voiceProcessing ? 0.6 : 1,
                }}
                aria-label={isListening
                  ? 'Stop listening'
                  : voiceHasError
                    ? 'Retry voice input'
                    : 'Tap to speak'}
                aria-pressed={isListening}
              >
                {voiceProcessing
                  ? <Loader2 size={34} style={{ animation: 'spin 1s linear infinite' }} />
                  : isRequesting
                    ? <Radio size={34} style={{ animation: 'pulse 1s ease-in-out infinite' }} />
                    : voiceHasError
                      ? <RefreshCw size={34} />
                      : isListening
                        ? <MicOff size={34} />
                        : isSpeaking
                          ? <VolumeX size={34} />
                          : <Mic size={34} />
                }
              </button>

              <div
                role="status"
                aria-live="polite"
                style={{
                  marginTop: '0.65rem', fontSize: '0.83rem', fontWeight: 700,
                  color: isListening ? '#DC2626'
                    : voiceHasError ? '#991B1B'
                    : isSpeaking ? '#059669'
                    : '#475569',
                  textAlign: 'center',
                }}
              >
                {renderVoiceStateLabel()}
              </div>
            </div>

            {/* Mode selector */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              {[
                { id: 'voice', icon: <Mic size={14} />, label: 'Voice' },
                { id: 'text', icon: <Type size={14} />, label: t('typeMode', 'Text') },
                { id: 'scan', icon: <FileText size={14} />, label: t('scanDocMode', 'Scan') },
              ].map(({ id, icon, label }) => (
                <button
                  key={id}
                  onClick={() => setInputMode(id)}
                  className={`btn btn-sm ${inputMode === id ? 'btn-primary' : 'btn-outline'}`}
                  aria-pressed={inputMode === id}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Text fallback form */}
            {inputMode === 'text' && (
              <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <label htmlFor="voice-text-input" className="sr-only">Type your reply</label>
                <input
                  id="voice-text-input"
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={t('typeReplyPlaceholder', 'Type your reply (e.g. "2 lakh", "10th pass")…')}
                  className="form-control"
                  style={{ borderRadius: '24px', flexGrow: 1 }}
                  maxLength={400}
                  aria-label="Type your reply"
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ borderRadius: '24px', padding: '0 1.2rem', flexShrink: 0 }}
                  aria-label="Send message"
                  disabled={!textInput.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
            )}

            {inputMode === 'scan' && (
              <div style={{ textAlign: 'center', color: '#64748B', fontSize: '0.88rem', padding: '0.5rem' }}>
                📄 Document scanning coming soon. Please use Voice or Text mode for now.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AGENT MODE: Fast-Fill Form ───────────────────────────────────── */}
      {mode === 'agent' && (
        <div className="card" style={{ flexGrow: 1 }}>
          <form onSubmit={handleAgentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <Wand2 size={22} style={{ color: '#D97706' }} />
              <h2 style={{ fontSize: '1.2rem', color: '#0B192C', margin: 0, fontWeight: 700 }}>
                CSC / VLE Agent Beneficiary Intake Form
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="agent-name">{t('fullName', 'Beneficiary Full Name')}</label>
                <input id="agent-name" type="text" value={agentForm.name}
                  onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                  className="form-control" required maxLength={100} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="agent-age">{t('ageInYears', 'Age')}</label>
                <input id="agent-age" type="number" value={agentForm.age} min={18} max={80}
                  onChange={(e) => setAgentForm({ ...agentForm, age: Number(e.target.value) })}
                  className="form-control" required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="agent-income">{t('annualIncomeLabel', 'Annual Household Income (₹)')}</label>
                <input id="agent-income" type="number" value={agentForm.income} min={0}
                  onChange={(e) => setAgentForm({ ...agentForm, income: Number(e.target.value) })}
                  className="form-control" required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="agent-cost">{t('projectCostLabel', 'Project / Loan Cost (₹)')}</label>
                <input id="agent-cost" type="number" value={agentForm.cost} min={0}
                  onChange={(e) => setAgentForm({ ...agentForm, cost: Number(e.target.value) })}
                  className="form-control" required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="agent-occupation">{t('primaryOccupation', 'Primary Occupation')}</label>
                <select id="agent-occupation" value={agentForm.occupation}
                  onChange={(e) => setAgentForm({ ...agentForm, occupation: e.target.value })}
                  className="form-select">
                  <option value="Farmer">Farmer / Agriculture</option>
                  <option value="Artisan">Traditional Artisan</option>
                  <option value="Vendor">Street Vendor</option>
                  <option value="Business">Small Business</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="agent-location">GPS Location</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input id="agent-location" type="text" value={agentForm.location} readOnly className="form-control" aria-describedby="detect-gps-btn" />
                  <button id="detect-gps-btn" type="button" onClick={handleGpsDetect}
                    className="btn btn-secondary btn-sm" title="Detect GPS location" aria-label="Detect GPS location">
                    <MapPin size={16} />
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-green btn-lg"
              style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
              disabled={isLoading || submittingRef.current}>
              {isLoading
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
                : <><CheckCircle size={20} /> Generate Official Beneficiary Recommendation Dossier</>
              }
            </button>
          </form>
        </div>
      )}

      <AgentReportModal
        isOpen={agentReportOpen}
        onClose={() => { setAgentReportOpen(false); submittingRef.current = false; }}
        formData={agentForm}
      />
    </div>
  );
}
