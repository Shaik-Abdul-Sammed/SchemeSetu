import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceSearchButton({ onResult }) {
  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice Search is not supported on this browser. Please type your query.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onResult && transcript) {
          onResult(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Voice search error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={startVoiceSearch}
      title={isListening ? 'Listening...' : 'Voice Search in English/Hindi'}
      className={`p-2 rounded-xl transition flex items-center justify-center ${
        isListening
          ? 'bg-red-500 text-white animate-pulse shadow-lg'
          : 'bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700'
      }`}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}
