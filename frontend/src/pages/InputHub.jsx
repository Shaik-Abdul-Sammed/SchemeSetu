/**
 * InputHub v4 — Multilingual, Personalized & Verified Voice Assistant
 * ─────────────────────────────────────────────────────────────────────────────
 * Features:
 *  • Integrated useUserProfile hook for progressive user profiling (Name, State, Occupation)
 *  • Integrated ProfileModal for citizen profile editing and data deletion
 *  • Calls backend POST /api/v1/voice/parse with userProfile payload
 *  • Renders Verified Source Cards in chat bubbles with official government links (.gov.in)
 *  • Renders real Haversine distance bank cards for FIND_NEAREST_BANK intent
 *  • Smooth voice TTS playback per response language (EN, TE, HI)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mic, MicOff, Type, FileText, Send, Sparkles, User,
  ToggleLeft, ToggleRight, MapPin, CheckCircle, Loader2, Volume2,
  VolumeX, AlertCircle, RefreshCw, XCircle, Wand2, Radio, Building2,
  ExternalLink, ShieldCheck, Check, Info, Settings
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import AgentReportModal from '../components/agent/AgentReportModal';
import { useUserProfile } from '../context/UserProfileContext';
import ProfileModal from '../components/profile/ProfileModal';
import useVoiceRecognition, { VOICE_STATES, VOICE_ERRORS } from '../hooks/useVoiceRecognition';
import useTextToSpeech from '../hooks/useTextToSpeech';
import useLanguageDetection from '../hooks/useLanguageDetection';
import VoiceLanguageBar from '../components/voice/VoiceLanguageBar';
import DemoModePanel from '../components/voice/DemoModePanel';
import {
  normalizeTranscript,
  extractAmount,
  detectProjectType,
  detectNumberContext,
  isTranscriptMeaningful,
} from '../utils/voiceUtils';
import { parseUserInput, generateAssistantResponse, getMissingFields, FIELD_LABELS } from '../utils/voiceAssistantEngine';
import { validateAgentProfile, evaluateAgentSchemes } from '../utils/agentValidationEngine';
import { formatIndianCurrency } from '../utils/numberValidator';

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
  const { lang, changeLanguage, t } = useLanguage();
  const globalAppLang = lang;
  const { location, locationStatus, detectCurrentGPSLocation } = useLocation();
  const { profile, updateProfile, getNextMissingSlot } = useUserProfile();
  const chatEndRef = useRef(null);

  // Modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [agentReportOpen, setAgentReportOpen] = useState(false);

  // ── Language Detection Hook ───────────────────────────────────────────────
  const {
    explicitLang,
    detectionResult,
    stateDefaultLang,
    effectiveLang,
    effectiveBcp47,
    effectiveGoogleCode,
    displayLabel,
    analyzeTranscript,
    setUserLanguage,
  } = useLanguageDetection({ stateName: location?.state });

  // Mode
  const [mode, setMode] = useState('user'); // 'user' | 'agent'
  const [inputMode, setInputMode] = useState('voice'); // 'voice' | 'text' | 'scan'

  // Chat state
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');

  // Agent Mode State & Evaluation Results
  const [validationErrors, setValidationErrors] = useState([]);
  const [validatedProfile, setValidatedProfile] = useState(null);
  const [topSchemes, setTopSchemes] = useState([]);
  const [rejectedSchemes, setRejectedSchemes] = useState([]);

  // User Profile Input Criteria Collected
  // Pipeline tracking for Demo Mode Panel
  const [pipelineInfo, setPipelineInfo] = useState({
    transcript: '',
    intent: '',
    confidence: 0,
    actionTaken: '',
  });

  // Conversation slot collection
  const [step, setStep] = useState(STEPS.GREETING);
  const [criteria, setCriteria] = useState({
    projectType: '',
    cost: '',
    income: '',
    age: '',
    state: '',
    occupation: '',
    education: '',
  });
  const stepRef = useRef(STEPS.GREETING);     // Avoid stale closure in callbacks
  const criteriaRef = useRef(criteria);
  const submittingRef = useRef(false);        // Prevent duplicate submissions
  const textDebounceRef = useRef(null);

  // UI state
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Agent Mode Fast-Fill
  const [agentForm, setAgentForm] = useState({
    name: 'Ramesh Kumar',
    age: 32,
    casteCategory: 'SC',
    income: 240000,
    projectType: 'Manufacturing',
    cost: 350000,
    loanRequirement: 250000,
    education: '10th pass',
    occupation: 'Small Business',
    location: location?.district && location?.state ? `${location.district}, ${location.state}` : (location?.state || location?.district || ''),
    state: location?.state || '',
  });

  // ── TTS (with per-utterance effectiveLang override) ──────────────────────
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech({ lang: effectiveLang });
  const speakResponse = speak;

  const speakIfNotMuted = useCallback((text, overrideLang) => {
    if (!isMuted) speak(text, undefined, overrideLang || effectiveLang);
  }, [isMuted, speak, effectiveLang]);

  // ── STT ──────────────────────────────────────────────────────────────────
  const { state: voiceState, isListening, isProcessing: voiceProcessing,
          isRequesting, hasError: voiceHasError, isSupported: voiceSupported,
          interimTranscript, errorInfo, startListening, stopListening,
          clearError, toggle: toggleVoice } = useVoiceRecognition({
    lang: effectiveBcp47,
    onResult: (transcript, confidence) => {
      const normalized = normalizeTranscript(transcript);
      if (isTranscriptMeaningful(normalized)) {
        handleUserMessage(transcript);
      }
    },
    onError: (type, message) => {
      if (type === VOICE_ERRORS.NO_SPEECH) {
        addBotMessage('I couldn\'t hear you. Please tap the microphone and speak again.');
      }
    },
  });

  // Sync step/criteria to refs (avoid stale closures)
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { criteriaRef.current = criteria; }, [criteria]);

  const hasSpokenGreetingRef = useRef(false);

  const getGreetingText = (currentLang) => {
    switch (currentLang) {
      case 'HI':
        return 'नमस्ते! मैं SchemeSetu हूँ। मैं सरकारी योजनाएं खोजने में आपकी मदद कर सकता हूँ। बताएं आपको क्या चाहिए।';
      case 'TE':
        return 'నమస్కారం! నేను SchemeSetu. మీకు సరైన ప్రభుత్వ పథకాలను కనుగొనడంలో నేను సహాయపడగలను. మీకు ఏమి కావాలో చెప్పండి.';
      case 'TA':
        return 'வணக்கம்! நான் SchemeSetu. அரசு திட்டங்களை கண்டறிய உங்களுக்கு உதவ முடியும். உங்களுக்கு என்ன தேவை என்று சொல்லுங்கள்.';
      case 'KN':
        return 'ನಮಸ್ಕಾರ! ನಾನು SchemeSetu. ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನಿಮಗೆ ಏನು ಬೇಕು ಎಂದು ತಿಳಿಸಿ.';
      case 'ML':
        return 'നമസ്കാരം! ഞാൻ SchemeSetu. സർക്കാർ പദ്ധതികൾ കണ്ടെത്താൻ എന്നെക്കൊണ്ട് സഹായിക്കാനാകും. നിങ്ങൾക്ക് എന്താണ് ആവശ്യമെന്ന് പറയുക.';
      case 'BN':
        return 'নমস্কার! আমি SchemeSetu। সরকারি স্কিমগুলি খুঁজে পেতে আমি আপনাকে সাহায্য করতে পারি। আপনার কী প্রয়োজন তা বলুন।';
      case 'MR':
        return 'नमस्कार! मी SchemeSetu आहे. मी सरकारी योजना शोधण्यात मदत करू शकतो. आपल्याला काय हवे आहे ते सांगा.';
      case 'EN':
      default:
        return 'Namaste! I am SchemeSetu. I can help you find government schemes. Tell me what you need (e.g. business loan, farming subsidy, education scholarship).';
    }
  };

  // Set initial welcome greeting in selected language
  useEffect(() => {
    const greetingText = getGreetingText(lang);
    setMessages([
      {
        sender: 'bot',
        text: greetingText,
        isGreeting: true
      }
    ]);

    // Speak aloud once if allowed
    if (!hasSpokenGreetingRef.current && !isMuted) {
      hasSpokenGreetingRef.current = true;
      try {
        speakResponse(greetingText);
      } catch (e) {}
    }
  }, [lang]);
  // ── Progressive Initialization ───────────────────────────────────────────
  useEffect(() => {
    let welcome = '';
    if (profile.name) {
      welcome = `Namaste ${profile.name}! I am SchemeSetu AI Assistant. How can I help you today?`;
    } else {
      welcome = 'Namaste! Welcome to SchemeSetu. May I know your name to personalize your guidance?';
    }
    setMessages([{ sender: 'bot', text: welcome, id: 'welcome' }]);
    setStep(STEPS.PROJECT_TYPE);
  }, [globalAppLang, profile.name]);

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
  const addBotMessage = useCallback((text, speak = true, bankCards = null, verifiedFact = null, overrideLang = null) => {
    const msg = { sender: 'bot', text, id: `bot_${Date.now()}`, bankCards, verifiedFact };
    setMessages((prev) => [...prev, msg]);
    if (speak) speakIfNotMuted(text, overrideLang);
  }, [speakIfNotMuted]);

  // ── Core Conversation Logic ───────────────────────────────────────────────
  const handleUserMessage = useCallback(async (rawText) => {
    const text = (rawText || '').substring(0, 400).trim();
    if (!text) return;

    if (submittingRef.current && stepRef.current === STEPS.SUBMITTING) return;

    // 1. Run client-side language detection
    const detResult = analyzeTranscript(text);

    // 2. Parse intent & verify facts via backend POST /api/v1/voice/parse
    let parseRes = null;
    try {
      parseRes = await api.post('/voice/parse', {
        transcript: text,
        lang: effectiveGoogleCode,
        lat: location?.lat,
        lng: location?.lng,
        userProfile: profile,
      });
    } catch (err) {
      console.warn('[InputHub] Voice parse API note:', err.message);
    }

    // Merge updated profile slots if returned by backend
    if (parseRes?.userProfile) {
      updateProfile(parseRes.userProfile);
    }

    const intent = parseRes?.intent || 'GENERAL_QUERY';
    const confidence = parseRes?.confidence || detResult?.confidence || 0.8;
    const actionTaken = parseRes?.action || 'execute';

    setPipelineInfo({
      transcript: text,
      intent,
      confidence,
      actionTaken,
    });

    // Add user message to chat log
    const userMsg = { sender: 'user', text, id: `user_${Date.now()}` };
    setMessages((prev) => [...prev, userMsg]);
    setTextInput('');

    const normalized = normalizeTranscript(text);
    const currentStep = stepRef.current;
    const currentCriteria = { ...criteriaRef.current };

    // ── INTENT: FIND_NEAREST_BANK ────────────────────────────────────────
    if (intent === 'FIND_NEAREST_BANK') {
      const bankResults = parseRes?.bankResults || [];
      const responseText = parseRes?.responseText ||
        (bankResults.length > 0
          ? `Found ${bankResults.length} nearby bank partners.`
          : 'To find nearby banks, please share your location or state.');

      addBotMessage(responseText, true, bankResults.length > 0 ? bankResults : null, parseRes?.verifiedFact, parseRes?.responseLang);
      return;
    }

    // ── INTENT: DIRECT NAVIGATION (e.g. "go to schemes", "my applications") ───
    if (parseRes?.targetPage && actionTaken === 'execute' && parseRes.targetPage !== '/input') {
      const navReply = parseRes.responseText || `Navigating to ${parseRes.targetPage.replace('/', '')}…`;
      addBotMessage(navReply, true, null, parseRes?.verifiedFact, parseRes?.responseLang);
      setTimeout(() => navigate(parseRes.targetPage), 1400);
      return;
    }

    // ── VERIFIED SCHEME QUERY RESPONSE ──────────────────────────────────
    if (parseRes?.verifiedFact && parseRes.verifiedFact.verificationStatus !== 'uncertain') {
      addBotMessage(parseRes.responseText, true, null, parseRes.verifiedFact, parseRes.responseLang);
      return;
    }

    // ── STEP-BY-STEP RECOMMENDATION FLOW ────────────────────────────────
    const activeLang = (effectiveLang || lang || 'EN').toUpperCase();

    // ── STEP: PROJECT TYPE ───────────────────────────────────────────────
    if (currentStep === STEPS.PROJECT_TYPE || !currentCriteria.projectType) {
      const detected = parseRes?.slots?.projectType || detectProjectType(normalized);
      const updated = { ...currentCriteria, projectType: detected };
      setCriteria(updated);
      setStep(STEPS.COST);

      const projectTypeReplies = {
        TE: `అర్థమైంది — మీరు ${detected} సహాయం కోరుతున్నారు. మీ ప్రాజెక్ట్ అంచనా వ్యయం లేదా అవసరమైన రుణ మొత్తం ఎంత? (ఉదా. "3 లక్షలు" లేదా "300000")`,
        HI: `समझ गया — आप ${detected} सहायता की तलाश कर रहे हैं। आपकी अनुमानित परियोजना लागत या आवश्यक ऋण राशि कितनी है? (उदा. "3 लाख" या "300000")`,
        KN: `ಅರ್ಥವಾಯಿತು — ನೀವು ${detected} ನೆರವು ಹುಡುಕುತ್ತಿದ್ದೀರಿ. ನಿಮ್ಮ ಅಂದಾಜು ಯೋಜನೆ ವೆಚ್ಚ ಅಥವಾ ಅಗತ್ಯವಿರುವ ಸಾಲದ ಮೊತ್ತ ಎಷ್ಟು? (ಉದಾ. "3 ಲಕ್ಷ")`,
        TA: `புரிந்தது — நீங்கள் ${detected} உதவி தேடுகிறீர்கள். உங்கள் மதிப்பிடப்பட்ட திட்டச் செலவு அல்லது தேவைப்படும் கடன் தொகை என்ன?`,
        BN: `বুঝতে পেরেছি — আপনি ${detected} সহায়তার খোঁজ করছেন। আপনার আনুমানিক প্রকল্প ব্যয় বা প্রয়োজনীয় ঋণের পরিমাণ কত?`,
        MR: `समजले — तुम्ही ${detected} मदतीच्या शोधात आहात. तुमची अंदाजित प्रकल्प किंमत किंवा आवश्यक कर्ज रक्कम किती आहे?`,
        ML: `മനസ്സിലായി — നിങ്ങൾ ${detected} സഹായം തിരയുകയാണ്. നിങ്ങളുടെ കണക്കാക്കിയ പ്രോജക്റ്റ് ചെലവ് അല്ലെങ്കിൽ ആവശ്യമായ വായ്പ തുക എത്രയാണ്?`,
        EN: `Got it — you're looking for ${detected} assistance. What is your estimated project cost or required loan amount? (e.g. "3 lakh" or "300000")`,
      };

      const reply = projectTypeReplies[activeLang] || projectTypeReplies.EN;
      setTimeout(() => addBotMessage(reply), 300);
      return;
    }

    // ── STEP: COST ───────────────────────────────────────────────────────
    if (currentStep === STEPS.COST || !currentCriteria.cost) {
      const amount = parseRes?.slots?.amount || extractAmount(normalized) || extractAmount(rawText);

      if (amount === null || amount <= 0) {
        const costClarifyReplies = {
          TE: 'మొత్తం నాకు అర్థం కాలేదు. దయచేసి "10 లక్షలు" లేదా "1000000" వంటి మొత్తాన్ని స్పష్టంగా చెప్పండి.',
          HI: 'मुझे राशि समझ नहीं आई। कृपया "10 लाख" या "1000000" की तरह स्पष्ट रूप से कहें।',
          KN: 'ನನಗೆ ಮೊತ್ತ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು "10 ಲಕ್ಷ" ಅಥವಾ "1000000" ನಂತಹ ಮೊತ್ತವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಿ.',
          TA: 'தொகை எனக்கு புரியவில்லை. "10 லட்சம்" அல்லது "1000000" என தெளிவாக சொல்லவும்.',
          BN: 'আমি পরিমাণটি বুঝতে পারিনি। অনুগ্রহ করে "10 লাখ" বা "1000000"-এর মতো স্পষ্টভাবে বলুন।',
          MR: 'मला रक्कम समजली नाही. कृपया "10 लाख" किंवा "1000000" प्रमाणे स्पष्ट सांगा.',
          ML: 'എനിക്ക് തുക മനസ്സിലായില്ല. "10 ലക്ഷം" അല്ലെങ്കിൽ "1000000" പോലെ ദയവായി വ്യക്തമായി പറയുക.',
          EN: 'I could not understand the amount. Please say the amount clearly, like "10 lakh" or "1000000".',
        };
        addBotMessage(costClarifyReplies[activeLang] || costClarifyReplies.EN);
        return;
      }

      if (amount < 1000 || amount > 100000000) {
        const formatted = Number(amount).toLocaleString('en-IN');
        const outOfRangeReplies = {
          TE: `₹${formatted} సాధారణంగా లేదు. దయచేసి ₹1,000 నుండి ₹10 కోట్ల వరకు ఉన్న మొత్తాన్ని నమోదు చేయండి.`,
          HI: `₹${formatted} असामान्य लग रहा है। कृपया ₹1,000 और ₹10 करोड़ के बीच की राशि दर्ज करें।`,
          KN: `₹${formatted} ಅಸಾಮಾನ್ಯವಾಗಿದೆ. ದಯವಿಟ್ಟು ₹1,000 ರಿಂದ ₹10 ಕೋಟಿ ನಡುವಿನ ಮೊತ್ತವನ್ನು ನಮೂದಿಸಿ.`,
          TA: `₹${formatted} வழக்கத்திற்கு மாறானது. ₹1,000 முதல் ₹10 கோடி வரையிலான தொகையை உள்ளிடவும்.`,
          BN: `₹${formatted} অস্বাভাবিক বলে মনে হচ্ছে। অনুগ্রহ করে ₹১,০০০ এবং ₹১০ কোটির মধ্যে একটি পরিমাণ লিখুন।`,
          MR: `₹${formatted} असामान्य वाटते. कृपया ₹१,००० ते ₹१० कोटी दरम्यानची रक्कम प्रविष्ट करा.`,
          ML: `₹${formatted} അസാധാരണമായി തോന്നുന്നു. ₹1,000 നും ₹10 കോടിക്കും ഇടയിലുള്ള തുക നൽകുക.`,
          EN: `₹${formatted} seems unusual. Please enter an amount between ₹1,000 and ₹10 crore.`,
        };

        addBotMessage(outOfRangeReplies[activeLang] || outOfRangeReplies.EN);
        return;
      }

      const updated = { ...currentCriteria, cost: amount };
      setCriteria(updated);
      setStep(STEPS.INCOME);

      const formattedCost = Number(amount).toLocaleString('en-IN');
      const askIncomeReplies = {
        TE: `అర్థమైంది — ప్రాజెక్ట్ ఖర్చు ₹${formattedCost}. మీ వార్షిక కుటుంబ ఆదాయం ఎంత? (ఉదా. "1.5 లక్షలు" లేదా "150000")`,
        HI: `समझ गया — प्रोजेक्ट लागत ₹${formattedCost}। आपकी वार्षिक पारिवारिक आय कितनी है? (उदा. "1.5 लाख" या "150000")`,
        KN: `ಅರ್ಥವಾಯಿತು — ಯೋಜನೆಯ ವೆಚ್ಚ ₹${formattedCost}. ನಿಮ್ಮ ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯ ಎಷ್ಟು? (ಉದಾ. "1.5 ಲಕ್ಷ")`,
        TA: `புரிந்தது — திட்ட செலவு ₹${formattedCost}. உங்கள் ஆண்டு குடும்ப வருமானம் எவ்வளவு?`,
        BN: `বুঝতে পেরেছি — প্রকল্পের খরচ ₹${formattedCost}। আপনার বার্ষিক পারিবারিক আয় কত?`,
        MR: `समजले — प्रकल्प खर्च ₹${formattedCost}. तुमचे वार्षिक कौटुंबिक उत्पन्न किती आहे?`,
        ML: `മനസ്സിലായി — പ്രോജക്റ്റ് ചെലവ് ₹${formattedCost}. നിങ്ങളുടെ വാർഷിക കുടുംബ വരുമാനം എത്രയാണ്?`,
        EN: `Understood — project cost of ₹${formattedCost}. What is your annual household income? (e.g. "1.5 lakh" or "150000")`,
      };

      setTimeout(() => addBotMessage(askIncomeReplies[activeLang] || askIncomeReplies.EN), 300);
      return;
    }

    // ── STEP: INCOME ─────────────────────────────────────────────────────
    if (currentStep === STEPS.INCOME || !currentCriteria.income) {
      const amount = parseRes?.slots?.amount || extractAmount(normalized) || extractAmount(rawText);

      if (amount === null || amount <= 0) {
        const incomeClarifyReplies = {
          TE: 'ఆదాయం నాకు అర్థం కాలేదు. దయచేసి "1 లక్ష 80 వేలు" లేదా "180000" అని స్పష్టంగా చెప్పండి.',
          HI: 'मुझे आय समझ नहीं आई। कृपया "1 लाख 80 हजार" या "180000" की तरह स्पष्ट कहें।',
          KN: 'ಆದಾಯ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು "1 ಲಕ್ಷ 80 ಸಾವಿರ" ಎಂದು ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಿ.',
          TA: 'வருமானம் புரியவில்லை. "1 லட்சம் 80 ஆயிரம்" என தெளிவாக சொல்லவும்.',
          BN: 'আয় বুঝতে পারিনি। অনুগ্রহ করে "১ লাখ ৮০ হাজার" বা "১৮০০০০" স্পষ্ট করে বলুন।',
          MR: 'उत्पन्न समजले नाही. कृपया "१ लाख ८० हजार" स्पष्ट सांगा.',
          ML: 'വരുമാനം മനസ്സിലായില്ല. "1 ലക്ഷം 80 ആയിരം" എന്ന് വ്യക്തമായി പറയുക.',
          EN: 'I could not understand the income. Please say it clearly, like "1 lakh 80 thousand" or "180000".',
        };
        addBotMessage(incomeClarifyReplies[activeLang] || incomeClarifyReplies.EN);
        return;
      }

      const updated = { ...currentCriteria, income: amount };
      setCriteria(updated);
      setStep(STEPS.EDUCATION);

      const askEducationReplies = {
        TE: 'చాలా మంచిది! మీ అత్యధిక విద్యార్హత ఏమిటి? (ఉదా. "10వ తరగతి", "ఇంటర్మీడియట్", "డిగ్రీ", లేదా "డిప్లొమా")',
        HI: 'उत्कृष्ट! आपकी उच्चतम शैक्षणिक योग्यता क्या है? (उदा. "10वीं पास", "12वीं पास", "स्नातक", या "डिप्लोमा")',
        KN: 'ಉತ್ತಮ! ನಿಮ್ಮ ಅತ್ಯುನ್ನತ ಶಿಕ್ಷಣ ಮಟ್ಟ ಏನು? (ಉದಾ. "10ನೇ ತರಗತಿ", "ಪದವಿ")',
        TA: 'மிக நன்று! உங்கள் உயர்ந்த கல்வி தகுதி என்ன? (எ.கா. "10ஆம் வகுப்பு", "பட்டதாரி")',
        BN: 'দারুণ! আপনার সর্বোচ্চ শিক্ষাগত যোগ্যতা কী? (যেমন "১০ম শ্রেণী পাস", "ডিগ্রী")',
        MR: 'छान! तुमची सर्वोच्च शैक्षणिक पात्रता काय आहे? (उदा. "१० वी पास", "पदवी")',
        ML: 'വളരെ നല്ലത്! നിങ്ങളുടെ ഏറ്റവും ഉയർന്ന വിദ്യാഭ്യാസ യോഗ്യത എന്താണ്? (ഉദാ. "10-ാം ക്ലാസ്")',
        EN: 'Great! What is your highest education level? (e.g. "10th pass", "12th pass", "graduate", or "diploma")',
      };

      setTimeout(() => addBotMessage(askEducationReplies[activeLang] || askEducationReplies.EN), 300);
      return;
    }

    // ── STEP: EDUCATION → SUBMIT ─────────────────────────────────────────
    if (currentStep === STEPS.EDUCATION || !currentCriteria.education) {
      const updated = { ...currentCriteria, education: text };
      setCriteria(updated);
      setStep(STEPS.SUBMITTING);
      submittingRef.current = true;

      const calculatingReplies = {
        TE: 'ధన్యవాదాలు! SchemeSetu మీ కోసం ధృవీకరించబడిన ప్రభుత్వ పథకాలను పరిశీలిస్తోంది...',
        HI: 'धन्यवाद! SchemeSetu आपके लिए सत्यापित सरकारी योजनाओं का मूल्यांकन कर रहा है...',
        KN: 'ಧನ್ಯವಾದಗಳು! SchemeSetu ನಿಮಗಾಗಿ ಪರಿಶೀಲಿಸಿದ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡುತ್ತಿದೆ...',
        TA: 'நன்றி! SchemeSetu உங்களுக்கான சரிபார்க்கப்பட்ட அரசு திட்டங்களை மதிப்பிடுகிறது...',
        BN: 'ধন্যবাদ! SchemeSetu আপনার জন্য যাচাইকৃত সরকারি প্রকল্পগুলি মূল্যায়ন করছে...',
        MR: 'धन्यवाद! SchemeSetu तुमच्यासाठी पडताळलेल्या सरकारी योजनांचे मूल्यमापन करत आहे...',
        ML: 'നന്ദി! SchemeSetu നിങ്ങൾക്കായി പരിശോധിച്ച സർക്കാർ പദ്ധതികൾ വിലയിരുത്തുന്നു...',
        EN: 'Thank you! SchemeSetu is evaluating verified government schemes for you now...',
      };

      addBotMessage(calculatingReplies[activeLang] || calculatingReplies.EN);
      setTimeout(() => submitRecommendation(updated), 600);
    }
  }, [t, addBotMessage, analyzeTranscript, effectiveGoogleCode, location, navigate, profile, updateProfile]);

  // ── API Submit ────────────────────────────────────────────────────────────
  const submitRecommendation = async (finalCriteria) => {
    setIsLoading(true);
    try {
      const res = await api.post('/schemes/recommend', {
        income: finalCriteria.income || profile.annualIncome || 200000,
        cost: finalCriteria.cost || 300000,
        education: finalCriteria.education || '10th pass',
        projectType: finalCriteria.projectType || profile.projectType || 'business',
        occupation: finalCriteria.occupation || profile.occupation || 'Farmer',
        state: profile.state || location?.state || 'All India',
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

    const validation = validateAgentProfile(agentForm);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    setValidationErrors([]);
    const evalRes = evaluateAgentSchemes(validation.data);
    setValidatedProfile(validation.data);
    setTopSchemes(evalRes.topSchemes);
    setRejectedSchemes(evalRes.rejectedSchemes);

    try {
      await api.post('/agent/submit', { ...validation.data, agentId: 'agent-101' });
    } catch (err) {
      // Local prototype fallback
    } finally {
      setIsLoading(false);
      setAgentReportOpen(true);
    }
    try {
      await api.post('/agent/submit', { ...agentForm, agentId: 'agent-101' });
    } catch (_) {}
    submittingRef.current = false;
    setIsLoading(false);
    setAgentReportOpen(true);
  };

  useEffect(() => {
    if (location && (location.district || location.state)) {
      const locStr = location.district ? `${location.district}, ${location.state}` : location.state;
      setAgentForm(prev => ({
        ...prev,
        location: locStr,
        state: location.state || prev.state
      }));
    }
  }, [location]);

  const handleGpsDetect = () => {
    detectCurrentGPSLocation();
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
    setPipelineInfo({ transcript: '', intent: '', confidence: 0, actionTaken: '' });
    const welcome = profile.name
      ? `Conversation reset, ${profile.name}. What government assistance do you need today?`
      : 'Conversation reset. What kind of government assistance do you need?';
    setTimeout(() => addBotMessage(welcome, false), 100);
  };

  // ── Render state-aware mic button ─────────────────────────────────────────
  const micColors = STATE_COLORS[voiceState] || STATE_COLORS[VOICE_STATES.IDLE];

  const renderVoiceStateLabel = () => {
    if (isSpeaking) return `Speaking in ${displayLabel}…`;
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
        color: '#fff', borderRadius: '14px', marginBottom: '0.75rem',
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
                ? t('convAssistant', 'SchemeSetu V4 Multilingual & Verified AI')
                : t('fastFillAgent', 'CSC / VLE Fast-Fill Portal')}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* User Profile Button */}
          {mode === 'user' && (
            <button
              onClick={() => setProfileModalOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '20px', padding: '0.35rem 0.75rem', color: '#fff',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', minHeight: '40px',
              }}
              title="View or Edit Your Profile"
              aria-label="View or edit profile"
            >
              <User size={15} style={{ color: '#F59E0B' }} />
              <span>{profile.name || 'Profile'}</span>
            </button>
          )}

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
          position: 'relative',
        }}>
          {/* Live Extracted Entities Bar */}
          {(criteria.projectType || criteria.income || criteria.age || criteria.state || criteria.occupation || criteria.education) && (
            <div style={{ padding: '0.65rem 1rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
              <span style={{ fontWeight: 700, color: '#475569', marginRight: '0.25rem' }}>Captured Profile:</span>
              {criteria.projectType && <span className="badge badge-cat">🎯 {criteria.projectType}</span>}
              {criteria.income && <span className="badge badge-eligible">💰 ₹{Number(criteria.income).toLocaleString('en-IN')}</span>}
              {criteria.age && <span className="badge badge-central">🎂 {criteria.age} yrs</span>}
              {criteria.state && <span className="badge badge-state">📍 {criteria.state}</span>}
              {criteria.occupation && <span className="badge badge-cat">💼 {criteria.occupation}</span>}
              {criteria.education && <span className="badge badge-central">🎓 {criteria.education}</span>}
            </div>
          )}

          {/* ── Voice Language Status Bar ────────────────────────────── */}
          <VoiceLanguageBar
            explicitLang={explicitLang}
            detectionResult={detectionResult}
            displayLabel={displayLabel}
            stateDefaultLang={stateDefaultLang}
            locationState={location?.state}
            locationDistrict={location?.district}
            onLanguageChange={setUserLanguage}
          />

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
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  width: '100%',
                }}
              >
                <div
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
                      display: 'flex', flexDirection: 'column', gap: '0.4rem'
                    }}
                  >
                    <div>{msg.text}</div>
                    {msg.sender === 'bot' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                        <button
                          onClick={() => speakResponse(msg.text)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0284C7',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px'
                          }}
                          title="Listen to this message aloud"
                        >
                          <Volume2 size={13} /> Speak
                        </button>
                      </div>
                    )}
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

                {/* ── VERIFIED SOURCE CARD (rendered when verifiedFact is returned) ── */}
                {msg.verifiedFact && msg.verifiedFact.verificationStatus !== 'uncertain' && (
                  <div
                    style={{
                      marginTop: '0.65rem', marginLeft: '2.5rem', maxWidth: '85%',
                      background: '#ECFDF5', border: '1px solid #6EE7B7',
                      borderRadius: '12px', padding: '0.85rem 1.1rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        background: '#D1FAE5', color: '#065F46', borderRadius: '12px',
                        padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 800,
                      }}>
                        <ShieldCheck size={13} /> Verified Government Source
                      </span>
                      {msg.verifiedFact.source?.url && (
                        <a
                          href={msg.verifiedFact.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.73rem', color: '#047857', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none',
                          }}
                        >
                          Official Portal <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <div style={{ fontWeight: 800, color: '#064E3B', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                      {msg.verifiedFact.schemeName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#047857', marginBottom: '0.5rem' }}>
                      Authority: {msg.verifiedFact.source?.title || 'Govt of India'}
                    </div>

                    {msg.verifiedFact.eligibilitySummary?.matchedCriteria?.length > 0 && (
                      <div style={{ fontSize: '0.78rem', color: '#065F46' }}>
                        {msg.verifiedFact.eligibilitySummary.matchedCriteria.map((c, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                            <Check size={13} style={{ color: '#059669', flexShrink: 0 }} />
                            <span>{c}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bank result card list (rendered on FIND_NEAREST_BANK intent) */}
                {msg.bankCards && Array.isArray(msg.bankCards) && (
                  <div style={{
                    marginTop: '0.65rem', marginLeft: '2.5rem', maxWidth: '85%',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                  }}>
                    {msg.bankCards.map((bank, bIdx) => (
                      <div
                        key={bank.id || bIdx}
                        style={{
                          background: '#F8FAFC', border: '1px solid #CBD5E1',
                          borderRadius: '12px', padding: '0.75rem 1rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <Building2 size={20} style={{ color: '#1E3E62', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                              {bank.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              {bank.address || bank.district || 'Nearby Branch'}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{
                            background: '#DBEAFE', color: '#1E40AF',
                            padding: '0.2rem 0.55rem', borderRadius: '12px',
                            fontWeight: 800, fontSize: '0.75rem', display: 'inline-block',
                          }}>
                            {bank.distanceText || `${bank.distance?.toFixed(1)} km`}
                          </span>
                        </div>
                      </div>
                    ))}
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
                <span style={{ fontStyle: 'italic' }}>Speaking ({displayLabel})…</span>
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
                <span>Analyzing speech & intent ({displayLabel})…</span>
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
                <span>Listening in {displayLabel}… speak clearly</span>
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

              <div style={{ marginTop: '0.65rem', fontSize: '0.85rem', fontWeight: 700, color: voiceState === 'listening' ? '#DC2626' : '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                {voiceState === 'listening' ? (
                  <span>Recording voice input... (Tap when done)</span>
                ) : voiceState === 'processing' ? (
                  <span>Evaluating answer...</span>
                ) : voiceState === 'responding' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>Assistant speaking...</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.speechSynthesis) window.speechSynthesis.cancel();
                        stopSpeaking();
                      }}
                      className="btn btn-secondary btn-xs"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderColor: '#DC2626', color: '#DC2626' }}
                    >
                      <VolumeX size={12} /> Stop
                    </button>
                  </div>
                ) : (
                  <span>Tap Microphone to Speak</span>
                )}

                {/* ⚡ 1-CLICK SIH DEMO VOICE FLOW BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    handleUserMessage('I want a loan for my small business in Andhra Pradesh with annual income three lakh rupees.');
                  }}
                  className="btn btn-secondary btn-xs"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    borderColor: '#F59E0B',
                    color: '#D97706',
                    marginTop: '0.4rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    borderRadius: '20px',
                    padding: '0.25rem 0.75rem'
                  }}
                >
                  <Sparkles size={12} /> ⚡ 1-Click SIH Voice Demo Flow
                </button>
              </div>
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
                  placeholder={t('typeReplyPlaceholder', 'Type your query (e.g. "find bank near me", "2 lakh")…')}
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
              <div style={{ 
                textAlign: 'center', 
                color: '#475569', 
                fontSize: '0.88rem', 
                padding: '1rem', 
                backgroundColor: '#F8FAFC', 
                borderRadius: '12px', 
                border: '1px dashed #CBD5E1',
                margin: '0.5rem 0'
              }}>
                <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <FileText size={18} style={{ color: '#2563EB' }} />
                  <span>Document & Media OCR Intake</span>
                </div>
                <p style={{ margin: '0 0 0.85rem', fontSize: '0.82rem', color: '#64748B', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Extract scheme eligibility details instantly from Aadhaar, Income Certificates, or Caste Certificates via our Media OCR Scanner.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/media')}
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.45rem', 
                    fontSize: '0.84rem', 
                    padding: '0.5rem 1.1rem',
                    borderRadius: '20px'
                  }}
                >
                  <FileText size={15} /> Launch Document Scanner
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AGENT MODE: Fast-Fill Form ───────────────────────────────────── */}
      {mode === 'agent' && (
        <div className="card" style={{ flexGrow: 1 }}>
          <form onSubmit={handleAgentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <Wand2 size={22} style={{ color: '#D97706' }} />
                <h2 style={{ fontSize: '1.2rem', color: '#0B192C', margin: 0, fontWeight: 700 }}>
                  CSC / VLE Agent Beneficiary Intake Form
                </h2>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0' }}>
                All inputs are strictly validated prior to running recommendation algorithms or generating reports.
              </p>
            </div>

            {/* Validation Errors Box */}
            {validationErrors.length > 0 && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5', padding: '1rem 1.25rem', borderRadius: '10px', color: '#991B1B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  <AlertCircle size={18} />
                  <span>Agent Analysis Blocked ({validationErrors.length} issues need correction):</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', lineHeight: 1.4 }}>
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{t('fullName', 'Beneficiary Full Name')} *</label>
                <input
                  type="text"
                  value={agentForm.name}
                  onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Ramesh Kumar"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('ageInYears', 'Age')} (18-100) *</label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={agentForm.age}
                  onChange={(e) => setAgentForm({ ...agentForm, age: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Social Category / Caste *</label>
                <select
                  value={agentForm.casteCategory}
                  onChange={(e) => setAgentForm({ ...agentForm, casteCategory: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="OBC">Other Backward Class (OBC)</option>
                  <option value="General">General Category</option>
                  <option value="EWS">Economically Weaker Section (EWS)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('annualIncomeLabel', 'Annual Household Income (₹)')} *</label>
                <input
                  type="number"
                  min="0"
                  max="10000000"
                  value={agentForm.income}
                  onChange={(e) => setAgentForm({ ...agentForm, income: e.target.value })}
                  className="form-control"
                  placeholder="e.g. 240000"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('projectCostLabel', 'Total Project / Enterprise Cost (₹)')} *</label>
                <input
                  type="number"
                  min="1000"
                  max="50000000"
                  value={agentForm.cost}
                  onChange={(e) => setAgentForm({ ...agentForm, cost: e.target.value })}
                  className="form-control"
                  placeholder="e.g. 350000"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Loan Requirement (₹) *</label>
                <input
                  type="number"
                  min="1000"
                  max="50000000"
                  value={agentForm.loanRequirement}
                  onChange={(e) => setAgentForm({ ...agentForm, loanRequirement: e.target.value })}
                  className="form-control"
                  placeholder="e.g. 250000"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="agent-occupation">{t('primaryOccupation', 'Primary Occupation')} *</label>
                <select
                  id="agent-occupation"
                  value={agentForm.occupation}
                  onChange={(e) => setAgentForm({ ...agentForm, occupation: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="Small Business">Small Business / Enterprise</option>
                  <option value="Farmer">Farmer / Agriculture</option>
                  <option value="Artisan">Traditional Artisan</option>
                  <option value="Vendor">Street Vendor</option>
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Location / State *</label>
                  {locationStatus === 'detecting' && (
                    <span style={{ fontSize: '0.74rem', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Loader2 size={12} className="animate-spin" /> Detecting GPS...
                    </span>
                  )}
                  {locationStatus === 'detected' && location.isGPS && (
                    <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>
                      ✓ GPS Detected
                    </span>
                  )}
                  {locationStatus === 'denied' && (
                    <span style={{ fontSize: '0.74rem', color: '#DC2626' }}>
                      GPS Permission Denied
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <input
                    id="agent-location"
                    type="text"
                    value={agentForm.location}
                    onChange={(e) => setAgentForm({ ...agentForm, location: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Hyderabad, Telangana"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={handleGpsDetect} 
                    className="btn btn-secondary btn-sm" 
                    title="Detect Current GPS Location"
                    style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <MapPin size={15} style={{ color: location.isGPS ? '#059669' : '#D97706' }} />
                    <span style={{ fontSize: '0.8rem' }}>GPS</span>
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-green btn-lg"
              style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
              disabled={isLoading || submittingRef.current}>
              <CheckCircle size={20} />
              Submit Application via Agent Network
            </button>
          </form>
        </div>
      )}

      {/* ── Profile Modal ─────────────────────────────────────────────── */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* ── Demo Mode Panel Overlay ─────────────────────────────────────── */}
      {mode === 'user' && (
        <DemoModePanel
          transcript={pipelineInfo.transcript}
          detectionResult={detectionResult}
          intent={pipelineInfo.intent}
          intentConfidence={pipelineInfo.confidence}
          actionTaken={pipelineInfo.actionTaken}
          locationState={location?.state}
          effectiveLang={effectiveLang}
          onSendCommand={handleUserMessage}
        />
      )}

      {/* Agent Report Modal */}
      {agentReportOpen && (
        <AgentReportModal
          data={agentForm}
          onClose={() => setAgentReportOpen(false)}
        />
      )}
    </div>
  );
}
