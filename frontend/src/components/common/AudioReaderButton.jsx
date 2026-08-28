import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioReaderButton({ textToRead, label = 'Listen' }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech audio reader is not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any active utterance
    const cleanText = textToRead ? textToRead.replace(/<[^>]*>?/gm, '') : '';
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
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
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm ${
        isPlaying
          ? 'bg-amber-500 text-slate-950 font-bold animate-pulse'
          : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
      }`}
      title={isPlaying ? 'Stop Audio' : 'Listen to Scheme Details'}
    >
      {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      <span>{isPlaying ? 'Stop Audio' : label}</span>
    </button>
  );
}
