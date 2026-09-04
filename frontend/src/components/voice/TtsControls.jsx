import React, { useState } from 'react';
import { Volume2, VolumeX, FastForward, Sliders } from 'lucide-react';

export default function TtsControls({ onSpeechRateChange, onVolumeChange }) {
  const [rate, setRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);

  const handleRate = (e) => {
    const val = parseFloat(e.target.value);
    setRate(val);
    if (onSpeechRateChange) onSpeechRateChange(val);
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (onVolumeChange) onVolumeChange(val);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 my-2 text-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-emerald-400" />
        <span className="font-semibold text-slate-100">Voice Assistant Speech Tuning</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Speed:</span>
          <input
            type="range"
            min="0.75"
            max="1.25"
            step="0.05"
            value={rate}
            onChange={handleRate}
            className="w-20 accent-emerald-500 bg-slate-800 rounded h-1.5 cursor-pointer"
          />
          <span className="font-mono text-emerald-400 w-8">{rate}x</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Volume:</span>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.1"
            value={volume}
            onChange={handleVolume}
            className="w-20 accent-blue-500 bg-slate-800 rounded h-1.5 cursor-pointer"
          />
          <span className="font-mono text-blue-400 w-8">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
