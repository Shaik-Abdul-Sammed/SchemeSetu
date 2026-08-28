import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function TextToSpeech({ text, lang = 'en-IN' }) {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={handleSpeak}
      className={`btn btn-sm ${speaking ? 'btn-green' : 'btn-outline'}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.55rem', fontSize: '0.78rem' }}
      title="Listen aloud (Text-To-Speech)"
    >
      {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
      <span>{speaking ? 'Stop' : 'Listen'}</span>
    </button>
  );
}
