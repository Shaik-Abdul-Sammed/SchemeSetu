/**
 * useTextToSpeech — Reliable TTS hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixes known issues:
 *  - Chrome silently cuts off utterances > ~200 chars → chunked speaking
 *  - No voice selection (uses system default) → picks best available voice
 *  - alert() on unsupported → graceful state instead
 *  - No speaking state exported → now returns isSpeaking
 *  - Stale synthesis state if page hidden → pauses on visibilitychange
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { LANG_LOCALE_MAP } from './useVoiceRecognition';

const CHUNK_SIZE = 180; // Stay under Chrome's ~200-char limit

function chunkText(text) {
  if (!text || typeof text !== 'string') return [];
  const cleaned = text.replace(/<[^>]*>/g, '').trim();
  if (cleaned.length <= CHUNK_SIZE) return [cleaned];

  // Split on sentence boundaries first
  const sentences = cleaned.match(/[^.!?]+[.!?]*/g) || [cleaned];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length <= CHUNK_SIZE) {
      current += sentence;
    } else {
      if (current) chunks.push(current.trim());
      // If single sentence > CHUNK_SIZE, split on comma/space
      if (sentence.length > CHUNK_SIZE) {
        const parts = sentence.match(/.{1,180}(?:\s|$)/g) || [sentence];
        chunks.push(...parts.map((p) => p.trim()));
        current = '';
      } else {
        current = sentence;
      }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

function getBestVoice(locale) {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // 1. Exact locale match
  let voice = voices.find((v) => v.lang === locale);
  // 2. Language prefix match (e.g. "hi" for "hi-IN")
  if (!voice) {
    const prefix = locale.split('-')[0];
    voice = voices.find((v) => v.lang.startsWith(prefix));
  }
  // 3. Fallback to English (en-IN or en-US)
  if (!voice) {
    voice = voices.find((v) => v.lang === 'en-IN') || voices.find((v) => v.lang.startsWith('en'));
  }
  return voice || null;
}

/**
 * @param {object} options
 * @param {string} options.lang - App language code (e.g. 'EN')
 * @param {number} [options.rate=0.92] - Speech rate (0.1–2)
 * @param {number} [options.pitch=1.0] - Pitch (0–2)
 */
export default function useTextToSpeech({ lang = 'EN', rate = 0.92, pitch = 1.0 } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);
  const queueRef = useRef([]);
  const currentIndexRef = useRef(0);
  const activeRef = useRef(false);
  const utteranceRef = useRef(null);
  const voiceRef = useRef(null);

  // Load voices (Chrome loads them asynchronously)
  useEffect(() => {
    if (!isSupported) return;
    const loadVoices = () => {
      voiceRef.current = getBestVoice(LANG_LOCALE_MAP[lang] || 'en-IN');
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [isSupported, lang]);

  // Pause on page hidden, resume on visible (Chrome requirement)
  useEffect(() => {
    if (!isSupported) return;
    const handleVisibility = () => {
      if (document.hidden && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
      } else if (!document.hidden && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isSupported]);

  function _speakChunk(chunks, index, onDone) {
    if (!activeRef.current || index >= chunks.length) {
      activeRef.current = false;
      setIsSpeaking(false);
      if (onDone) onDone();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.lang = LANG_LOCALE_MAP[lang] || 'en-IN';
    utterance.rate = rate;
    utterance.pitch = pitch;
    if (voiceRef.current) utterance.voice = voiceRef.current;

    utterance.onend = () => {
      currentIndexRef.current = index + 1;
      _speakChunk(chunks, index + 1, onDone);
    };

    utterance.onerror = (e) => {
      // 'interrupted' is not a real error (just cancellation)
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      activeRef.current = false;
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Speak text. Cancels any ongoing speech first.
   * @param {string} text
   * @param {function} [onDone] - Called when speech finishes
   */
  const speak = useCallback((text, onDone) => {
    if (!isSupported || !text) return;

    // Cancel any ongoing speech
    stop();

    const chunks = chunkText(text);
    if (!chunks.length) return;

    queueRef.current = chunks;
    currentIndexRef.current = 0;
    activeRef.current = true;
    setIsSpeaking(true);

    // Small delay to let cancel() settle in Chrome
    setTimeout(() => {
      if (activeRef.current) {
        _speakChunk(chunks, 0, onDone);
      }
    }, 80);
  }, [isSupported, lang, rate, pitch]);

  /**
   * Stop all speech immediately.
   */
  const stop = useCallback(() => {
    activeRef.current = false;
    queueRef.current = [];
    currentIndexRef.current = 0;
    if (isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [isSupported]);

  /**
   * Toggle speak/stop.
   */
  const toggle = useCallback((text) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  }, [isSpeaking, speak, stop]);

  return { speak, stop, toggle, isSpeaking, isSupported };
}
