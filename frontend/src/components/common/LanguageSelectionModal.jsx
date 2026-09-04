import React, { useState, useEffect } from 'react';
import { Globe, Volume2, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const LANGUAGES = [
  { code: 'EN', name: 'English', native: 'English', flag: '🇮🇳', greeting: 'Welcome to SchemeSetu' },
  { code: 'TE', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', greeting: 'స్కీమ్‌సేతుకు స్వాగతం' },
  { code: 'HI', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳', greeting: 'स्कीमसेतु में आपका स्वागत है' },
  { code: 'TA', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', greeting: 'ஸ்கீம்சேதுவிற்கு வரவேற்கிறோம்' },
  { code: 'KN', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', greeting: 'స్కీమ్‌సేతుಗೆ స్వాగత' },
  { code: 'MR', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', greeting: 'स्कीमसेतूमध्ये आपले स्वागत आहे' },
  { code: 'BN', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳', greeting: 'স্কিমসেতুতে আপনাকে স্বাগতম' },
  { code: 'GU', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳', greeting: 'સ્કીમસેતુમાં આપનું સ્વાગત છે' },
  { code: 'GO', name: 'Gondi', native: 'గోంది / गोंडी', flag: '🏹', greeting: 'స్కీమ్‌సేతుకు స్వాగతం (గోంది)' },
  { code: 'CH', name: 'Chenchu', native: 'చెంచు / चेन्चू', flag: '🌲', greeting: 'స్కీమ్‌సేతుకు స్వాగతం (చెంచు)' },
];

export default function LanguageSelectionModal() {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState(currentLanguage || 'EN');

  useEffect(() => {
    // Show gate on initial entrance if not passed yet
    const gatePassed = localStorage.getItem('schemesetu_gate_passed');
    if (!gatePassed) {
      setIsOpen(true);
    }
  }, []);

  const handleSelectLanguage = (code) => {
    setSelectedCode(code);
    changeLanguage(code);

    // TTS audio playback preview
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const selectedObj = LANGUAGES.find(l => l.code === code);
        if (selectedObj) {
          const utterance = new SpeechSynthesisUtterance(selectedObj.greeting);
          utterance.lang = code === 'HI' ? 'hi-IN' : code === 'TE' ? 'te-IN' : 'en-IN';
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (e) {
      // Audio optional
    }
  };

  const handleConfirm = () => {
    changeLanguage(selectedCode);
    localStorage.setItem('schemesetu_gate_passed', 'true');
    localStorage.setItem('schemesetu_lang_pref', selectedCode);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 text-slate-200 shadow-2xl relative animate-scale-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Welcome to SchemeSetu AI
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 flex items-center justify-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400 animate-spin-slow" /> Select Your Preferred Language
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose your language to personalize scheme recommendations and voice responses
          </p>
        </div>

        {/* Languages Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedCode === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10 scale-105 font-bold'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-xs font-semibold">{lang.native}</span>
                <span className="text-[10px] text-slate-400 font-mono">{lang.name}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1" />}
              </button>
            );
          })}
        </div>

        {/* Audio Preview Greeting */}
        <div className="bg-slate-800/50 border border-slate-800 p-3 rounded-xl flex items-center justify-between mb-6 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{LANGUAGES.find(l => l.code === selectedCode)?.greeting}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Audio Active</span>
        </div>

        {/* Confirm Action */}
        <button
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <span>Enter SchemeSetu Platform</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
