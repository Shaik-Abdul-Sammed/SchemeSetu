import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Send, 
  X, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Phone,
  Navigation,
  Clock,
  Compass
} from 'lucide-react';
import AudioWaveform from './AudioWaveform';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { api } from '../../services/api';
import { mockSchemes } from '../../data/mock/schemes';
import { formatIndianCurrency } from '../../utils/numberValidator';
import { parseUserInput } from '../../utils/voiceAssistantEngine';
import { detectLanguage, askChatGptVoiceAssistant } from '../../utils/voiceChatGptEngine';

// Web Audio API Beep Synthesizer for mic activation feedback
const playTone = (freq = 600, duration = 0.15) => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio context optional
  }
};

export default function VoiceAssistantModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { lang, changeLanguage, availableLanguages, t } = useLanguage();
  const { user } = useAuth();
  const { location } = useLocation();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [contextSchemes, setContextSchemes] = useState([]);
  const [autoDetectedLang, setAutoDetectedLang] = useState(null);
  const [isMuted, setIsMuted] = useState(false);       // mute TTS output
  const [interimText, setInterimText] = useState('');  // live transcript preview

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const noSpeechRetriesRef = useRef(0);  // auto-retry counter for no-speech

  const activeLangCode = typeof lang === 'string' ? lang : (lang?.code || 'EN');

  // Helper to render bold markdown and clean formatted lines like ChatGPT
  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Helper for voice locales by language code
  const getVoiceLocaleForCode = (code) => {
    switch (code) {
      case 'HI': return 'hi-IN';
      case 'TE': return 'te-IN';
      case 'TA': return 'ta-IN';
      case 'KN': return 'kn-IN';
      case 'ML': return 'ml-IN';
      case 'BN': return 'bn-IN';
      case 'MR': return 'mr-IN';
      case 'GON': return 'hi-IN'; // Gondi phonetic fallback
      case 'BHI': return 'hi-IN'; // Bhili phonetic fallback
      case 'EN':
      default: return 'en-IN';
    }
  };

  // Language mapping to speech locales
  const getVoiceLocale = () => {
    return getVoiceLocaleForCode(activeLangCode);
  };

  // Handle explicit language switch inside Voice Assistant
  const handleLanguageChange = (newCode) => {
    stopSpeaking();
    stopListening();
    if (changeLanguage) {
      changeLanguage(newCode);
    }

    let greeting = `Language switched to ${newCode}. How can I help you today?`;
    if (newCode === 'HI') greeting = "भाषा बदलकर हिंदी की गई है। मैं आपकी कैसे मदद कर सकता हूँ?";
    else if (newCode === 'TE') greeting = "భాష తెలుగులోకి మార్చబడింది. నేను మీకు ఎలా సహాయపడగలను?";
    else if (newCode === 'TA') greeting = "மொழி தமிழுக்கு மாற்றப்பட்டது. நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?";
    else if (newCode === 'KN') greeting = "ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?";
    else if (newCode === 'ML') greeting = "ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി. ഞാൻ എങ്ങനെ സഹായിക്കണം?";
    else if (newCode === 'BN') greeting = "ভাষা বাংলায় পরিবর্তিত হয়েছে। আপনাকে কীভাবে সাহায্য করতে পারি?";
    else if (newCode === 'MR') greeting = "भाषा मराठीत बदलली आहे. मी तुम्हाला कशी मदत करू शकतो?";
    else if (newCode === 'GON') greeting = "गोंडी भाषा चुन ली गई। मोसे सवाल पूछा।";
    else if (newCode === 'BHI') greeting = "भीली भाषा चुन ली गई। मने पूछो।";

    const msg = { sender: 'bot', text: greeting, timestamp: new Date(), isGreeting: true };
    setMessages(prev => [...prev, msg]);

    const targetLocale = getVoiceLocaleForCode(newCode);
    setTimeout(() => {
      speakText(greeting, targetLocale);
    }, 150);
  };

  // Sample prompt suggestion pills per language (ChatGPT conversational style)
  const getSamplePrompts = () => {
    switch (activeLangCode) {
      case 'HI':
        return ['सब्सिडी क्या होती है आसान शब्दों में?', 'किराना दुकान खोलने के लिए लोन', '₹5 लाख मुद्रा लोन बिना गारंटी', 'दलित बंधु ₹10 लाख सरकारी सहायता'];
      case 'TE':
        return ['సబ్సిడీ అంటే ఏమిటి సులభంగా?', 'కిరాణా షాపు కోసం లోన్', 'రూ. 5 లక్షల ముద్రా లోన్ వివరాలు', 'దళిత బంధు ₹10లక్షల ఉచిత గ్రాంట్'];
      case 'TA':
        return ['மானிய உதவி என்றால் என்ன?', '₹5 லட்சம் முத்ரா கடன்', 'தேவையான ஆவணங்கள்', 'அருகிலுள்ள வங்கி'];
      case 'KN':
        return ['ಸಬ್ಸಿಡಿ ಎಂದರೇನು ಸುಲಭವಾಗಿ?', '₹5 ಲಕ್ಷ ಮುದ್ರಾ ಸಾಲ', 'ಅಗತ್ಯ ದಾಖಲೆಗಳು', 'ಹತ್ತಿರದ ಬ್ಯಾಂಕ್'];
      case 'ML':
        return ['സബ്‌സിഡി എന്നാൽ എന്താണ്?', '₹5 ലക്ഷം മുദ്ര വായ്പ', 'ആവശ്യമായ രേഖകൾ', 'സമീപത്തെ ബാങ്ക്'];
      case 'BN':
        return ['ভর্তুকি বলতে কী বোঝায়?', '₹৫ লাখ মুদ্রা ঋণ', 'প্রয়োজনীয় নথি', 'নিকটস্থ ব্যাংক'];
      case 'MR':
        return ['सब्सिडी म्हणजे काय सोप्या भाषेत?', '₹५ लाख मुद्रा कर्ज', 'आवश्यक कागदपत्रे', 'जवळील बँक'];
      case 'GON':
        return ['सब्सिडी काय आय?', '₹5 लाख लोन सवाल', 'सरकारी सहायता', 'पास के बैंक'];
      case 'BHI':
        return ['सब्सिडी शुं छे?', '₹5 लाख लोन पूछो', 'सरकारी योजना', 'नजीक बैंक'];
      case 'EN':
      default:
        return ['What is subsidy in simple words?', 'Loan for opening grocery shop', '₹5L MUDRA collateral-free', 'Dalit Bandhu ₹10L grant'];
    }
  };

  // Initial welcome message in selected language
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let welcome = "Hello! I am SchemeSetu AI Voice Assistant. Ask me about government welfare schemes, loans, eligibility, or application steps.";
      if (activeLangCode === 'HI') welcome = "नमस्ते! मैं स्कीमसेतू एआई आवाज़ सहायक हूँ। मुझसे सरकारी योजनाओं, लोन, पात्रता या आवेदन नियमों के बारे में पूछें।";
      else if (activeLangCode === 'TE') welcome = "నమస్కారం! నేను స్కీమ్‌సేతు AI వాయిస్ అసిస్టెంట్‌ని. ప్రభుత్వ సంక్షేమ పథకాలు, లోన్లు మరియు అర్హతల గురించి నన్ను అడగండి.";
      else if (activeLangCode === 'TA') welcome = "வணக்கம்! நான் SchemeSetu AI குரல் உதவியாளர். அரசு நலத்திட்டங்கள் மற்றும் கடன்கள் குறித்து என்னிடம் கேளுங்கள்.";
      else if (activeLangCode === 'KN') welcome = "ನಮಸ್ಕಾರ! ನಾನು SchemeSetu AI ಧ್ವನಿ ಸಹಾಯಕ. ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಾಲಗಳ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ.";
      else if (activeLangCode === 'ML') welcome = "നമസ്കാരം! ഞാൻ സ്കീംസേതു AI വോയ്‌സ് അസിസ്റ്റന്റാണ്. സർക്കാർ പദ്ധതികളെക്കുറിച്ച് എന്നോട് ചോദിക്കുക.";
      else if (activeLangCode === 'BN') welcome = "নমস্কার! আমি স্কিমসেতু এআই ভয়েস সহকারী। সরকারী প্রকল্প এবং ঋণের বিষয়ে আমাকে জিজ্ঞাসা করুন।";
      else if (activeLangCode === 'MR') welcome = "नमस्कार! मी स्कीमसेतू एआय व्हॉइस असिस्टंट आहे. मला सरकारी योजना, कर्ज आणि पात्रतेबद्दल विचारा.";
      else if (activeLangCode === 'GON') welcome = "सेवा जोहार! मैं स्कीमसेतू आवाज सहायक आय। सरकारी योजना अउर लोन बर मोसे सवाल पूछा।";
      else if (activeLangCode === 'BHI') welcome = "राम राम! हुं स्कीमसेतू आवाज सहायक छुं। सरकारी योजना अणे लोन बाबत मने पूछो।";

      const initialMsg = { sender: 'bot', text: welcome, timestamp: new Date() };
      setMessages([initialMsg]);
      speakText(welcome);
    }
  }, [isOpen, activeLangCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Synthesis Helper: Get best matching voice for the target locale
  const getBestVoice = (targetLocale) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      if (!voices.length) return null;
      // Exact locale match (e.g. 'hi-IN', 'te-IN')
      let match = voices.find(v => v.lang === targetLocale || v.lang.replace('_', '-') === targetLocale);
      if (match) return match;
      // Language prefix match (e.g. 'hi', 'te', 'ta')
      const prefix = targetLocale.split('-')[0].toLowerCase();
      match = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
      if (match) return match;
      // Indian English / regional fallback
      match = voices.find(v => v.lang === 'en-IN' || v.lang.toLowerCase().includes('india'));
      if (match) return match;
      return voices[0] || null;
    } catch (e) {
      return null;
    }
  };

  // Helper to chunk long text into sentence segments (<=160 chars) to prevent Chrome speech truncation
  const chunkText = (text, maxLength = 160) => {
    if (!text) return [];
    // Split on sentence terminators: full-stops, question marks, exclamation marks, Hindi danda '।', or newlines
    const rawSentences = text.match(/[^.!?\n।]+[.!?\n।]*/g) || [text];
    const chunks = [];
    for (const s of rawSentences) {
      const trimmed = s.trim();
      if (!trimmed) continue;
      if (trimmed.length <= maxLength) {
        chunks.push(trimmed);
      } else {
        const words = trimmed.split(/\s+/);
        let current = '';
        for (const w of words) {
          if ((current + ' ' + w).trim().length <= maxLength) {
            current = (current + ' ' + w).trim();
          } else {
            if (current) chunks.push(current);
            current = w;
          }
        }
        if (current) chunks.push(current);
      }
    }
    return chunks;
  };

  // Speech Synthesis with chunking to prevent Chrome >180-char freeze
  const speakText = (text, customLocale = null) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const locale = customLocale || getVoiceLocale();
      const voice = getBestVoice(locale);
      const chunks = chunkText(text, 160);
      if (!chunks.length) return;

      setIsSpeaking(true);
      chunks.forEach((chunk, index) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = locale;
        if (voice) utterance.voice = voice;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        if (index === chunks.length - 1) {
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
        }
        window.speechSynthesis.speak(utterance);
      });
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Speech Recognition — continuous with live interim transcript and auto-retry
  const startListening = () => {
    setVoiceError(null);
    setInterimText('');
    stopSpeaking();
    playTone(880, 0.12);
    noSpeechRetriesRef.current = 0;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError(t('speechNotSupported', 'Browser speech recognition not available. Please type your query below.'));
      return;
    }

    const launchRecognition = (lang) => {
      try {
        // Stop previous session if any
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch(e) {}
          recognitionRef.current = null;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang || getVoiceLocale();
        recognition.continuous = true;         // keep mic open until user taps stop
        recognition.interimResults = true;     // show live transcript as user speaks
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setInterimText('');
        };

        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          // Show live preview of what's being spoken
          if (interimTranscript) setInterimText(interimTranscript);

          // When a final utterance is captured, send it
          if (finalTranscript.trim()) {
            setInterimText('');
            noSpeechRetriesRef.current = 0; // reset retry counter on successful speech
            playTone(440, 0.15);

            // Auto-detect language and restart recognition in that language if changed
            const detectedLocale = getVoiceLocaleForCode(detectLanguage(finalTranscript, activeLangCode));
            const currentLocale = recognition.lang;

            handleSendMessage(finalTranscript.trim());

            // If language changed, restart recognition in new language
            if (detectedLocale !== currentLocale) {
              try { recognition.lang = detectedLocale; } catch(e) {}
            }
          }
        };

        recognition.onerror = (event) => {
          if (event.error === 'no-speech') {
            // Auto-retry up to 2 times on silence
            if (noSpeechRetriesRef.current < 2) {
              noSpeechRetriesRef.current++;
              try { recognition.start(); } catch(e) {}
              return;
            }
            setInterimText('');
            setIsListening(false);
          } else if (event.error === 'aborted') {
            setIsListening(false);
            setInterimText('');
          } else {
            setIsListening(false);
            setInterimText('');
            setVoiceError('Microphone issue. Please tap the mic button to try again, or type below.');
          }
        };

        recognition.onend = () => {
          // Only mark as not listening if we truly stopped (not mid-sentence)
          if (!interimText) setIsListening(false);
          setInterimText('');
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        setIsListening(false);
        setVoiceError('Could not start microphone. Please type your query below.');
      }
    };

    launchRecognition(getVoiceLocale());
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
    playTone(440, 0.15);
  };

  // Local Intent & Knowledge Base Engine
  const processQuery = (rawQuery) => {
    const q = rawQuery.toLowerCase();

    // Check if user is referencing contextual schemes
    if ((q.includes('second') || q.includes('2nd') || q.includes('दूसरा') || q.includes('రెండవ')) && contextSchemes.length >= 2) {
      const target = contextSchemes[1];
      return generateSchemeDetailResponse(target);
    }
    if ((q.includes('first') || q.includes('1st') || q.includes('पहला') || q.includes('మొదటి')) && contextSchemes.length >= 1) {
      const target = contextSchemes[0];
      return generateSchemeDetailResponse(target);
    }
    if ((q.includes('third') || q.includes('3rd') || q.includes('तीसरा')) && contextSchemes.length >= 3) {
      const target = contextSchemes[2];
      return generateSchemeDetailResponse(target);
    }

    // Specific scheme query check
    const matchedScheme = mockSchemes.find(s => 
      q.includes(s.id) || 
      q.includes(s.name.toLowerCase()) || 
      (s.shortName && q.includes(s.shortName.toLowerCase())) ||
      (q.includes('mudra') && s.id.includes('mudra')) ||
      (q.includes('kisan') && s.id === 'pm-kisan') ||
      (q.includes('ayushman') && s.id === 'ayushman-bharat') ||
      (q.includes('stand up') && s.id === 'stand-up-india') ||
      (q.includes('vishwakarma') && s.id === 'pm-vishwakarma') ||
      (q.includes('dalit bandhu') && s.id === 'dalit-bandhu') ||
      (q.includes('pmegp') && s.id === 'pmegp')
    );

    if (matchedScheme) {
      setContextSchemes([matchedScheme]);
      return generateSchemeDetailResponse(matchedScheme);
    }

    // SC Priority / Dalit Bandhu / Stand Up India
    if (q.includes('sc') || q.includes('dalit') || q.includes('scheduled caste') || q.includes('अनुसूचित जाति')) {
      const scSchemes = mockSchemes.filter(s => s.id === 'dalit-bandhu' || s.id === 'stand-up-india' || s.id === 'pmegp');
      setContextSchemes(scSchemes);
      if (activeLangCode === 'HI') {
        return {
          text: `अनुसूचित जाति (SC) उद्यमियों के लिए मुख्य योजनाएं हैं: 1. स्टैंड-अप इंडिया (₹10 लाख से ₹1 करोड़ लोन), 2. दलित बंधु (₹10 लाख सीधी सरकारी सहायता), 3. PMEGP (35% विशेष सब्सिडी)। क्या आप इनमें से किसी का विवरण जानना चाहते हैं?`,
          schemes: scSchemes
        };
      } else if (activeLangCode === 'TE') {
        return {
          text: `SC వర్గాల కోసం ప్రధాన పథకాలు: 1. స్టాండ్-అప్ ఇండియా (₹10L - ₹1Cr), 2. దళిత బంధు (₹10 లక్షల ఉచిత గ్రాంట్), 3. PMEGP (35% సబ్సిడీ). వీటి వివరాలు కావాలా?`,
          schemes: scSchemes
        };
      }
      return {
        text: `Key schemes for Scheduled Caste (SC) entrepreneurs: 1. Stand-Up India (₹10L to ₹1Cr), 2. Dalit Bandhu (₹10L direct grant in Telangana), 3. PMEGP (up to 35% margin subsidy). Would you like details on any of these?`,
        schemes: scSchemes
      };
    }

    // Loan / Financial limit query
    if (q.includes('loan') || q.includes('limit') || q.includes('ऋण') || q.includes('लोन') || q.includes('సాల') || q.includes('5 lakh') || q.includes('10 lakh') || q.includes('crore')) {
      const loanSchemes = mockSchemes.filter(s => s.maxLoan && s.maxLoan >= 500000);
      setContextSchemes(loanSchemes.slice(0, 3));
      if (activeLangCode === 'HI') {
        return {
          text: `स्कीमसेतू पर बिजनेस लोन योजनाएं: मुद्रा योजना (₹50,000 से ₹20 लाख तक बिना गारंटी), PMEGP (₹50 लाख तक 35% सब्सिडी के साथ), और स्टैंड-अप इंडिया (₹10 लाख से ₹1 करोड़)।`,
          schemes: loanSchemes.slice(0, 3)
        };
      } else if (activeLangCode === 'TE') {
        return {
          text: `వ్యాపార రుణ పథకాలు: ముద్రా యోజన (₹20 లక్షల వరకు పూచీకత్తు లేకుండా), PMEGP (₹50 లక్షల వరకు 35% సబ్సిడీ), స్టాండ్-అప్ ఇండియా (₹1 కోటి వరకు).`,
          schemes: loanSchemes.slice(0, 3)
        };
      }
      return {
        text: `Business credit schemes available in SchemeSetu: PM MUDRA (up to ₹20 Lakhs collateral-free), PMEGP (up to ₹50 Lakhs with 35% subsidy), and Stand-Up India (₹10 Lakhs to ₹1 Crore).`,
        schemes: loanSchemes.slice(0, 3)
      };
    }

    // Required Documents Query
    if (q.includes('document') || q.includes('कागज') || q.includes('दस्तावेज') || q.includes('పత్రాలు') || q.includes('proof')) {
      if (activeLangCode === 'HI') {
        return {
          text: `सरकारी योजनाओं के लिए सामान्यतः आवश्यक दस्तावेज हैं: 1. आधार कार्ड, 2. बैंक पासबुक (आधार लिंक), 3. आय प्रमाण पत्र, 4. जाति प्रमाण पत्र (SC/ST/OBC के लिए), 5. व्यवसाय कोटेशन / प्रोजेक्ट रिपोर्ट।`
        };
      } else if (activeLangCode === 'TE') {
        return {
          text: `సాధారణంగా అవసరమైన పత్రాలు: 1. ఆధార్ కార్డు, 2. బ్యాంక్ పాస్‌బుక్, 3. ఆదాయ ధృవీకరణ పత్రం, 4. కుల ధృవీకరణ పత్రం, 5. ప్రాజెక్ట్ రిపోర్ట్.`
        };
      }
      return {
        text: `Standard required documents across welfare schemes: 1. Aadhaar Card, 2. Aadhaar-linked Bank Passbook, 3. Annual Income Certificate, 4. Caste/Community Certificate (for SC/ST/OBC), 5. Business Project Quotation.`
      };
    }

    // Default: List top recommended schemes
    const topSchemes = mockSchemes.slice(0, 3);
    setContextSchemes(topSchemes);

    if (activeLangCode === 'HI') {
      return {
        text: `वर्तमान में उपलब्ध प्रमुख सरकारी योजनाएं हैं: 1. ${topSchemes[0].name}, 2. ${topSchemes[1].name}, 3. ${topSchemes[2].name}। आप पात्रता जांचने के लिए 'पात्रता' विकल्प पर जा सकते हैं।`,
        schemes: topSchemes
      };
    } else if (activeLangCode === 'TE') {
      return {
        text: `అందుబాటులో ఉన్న ముఖ్య పథకాలు: 1. ${topSchemes[0].name}, 2. ${topSchemes[1].name}, 3. ${topSchemes[2].name}. మరిన్ని వివరాలకు నన్ను అడగండి.`,
        schemes: topSchemes
      };
    }

    return {
      text: `Top featured schemes in SchemeSetu: 1. ${topSchemes[0].name}, 2. ${topSchemes[1].name}, and 3. ${topSchemes[2].name}. You can ask me for eligibility or document details on any scheme!`,
      schemes: topSchemes
    };
  };

  const generateSchemeDetailResponse = (scheme) => {
    const loanText = scheme.maxLoan ? `Maximum loan limit is ${formatIndianCurrency(scheme.maxLoan)}.` : (scheme.maxBenefit ? `Benefit is ${formatIndianCurrency(scheme.maxBenefit)}.` : 'Financial limit not specified in available data.');
    
    let text = `${scheme.name}: ${scheme.summary} ${loanText} Required age: ${scheme.minAge}-${scheme.maxAge} years. Income ceiling: ₹${scheme.maxIncome.toLocaleString('en-IN')}.`;
    
    if (activeLangCode === 'HI') {
      text = `${scheme.name}: ${scheme.summary} ${scheme.maxLoan ? `अधिकतम लोन सीमा ${formatIndianCurrency(scheme.maxLoan)} है।` : ''} आयु सीमा ${scheme.minAge} से ${scheme.maxAge} वर्ष है।`;
    } else if (activeLangCode === 'TE') {
      text = `${scheme.name}: ${scheme.summary} ${scheme.maxLoan ? `గరిష్ట రుణం ${formatIndianCurrency(scheme.maxLoan)}.` : ''} వయోపరిమితి: ${scheme.minAge}-${scheme.maxAge} సంవత్సరాలు.`;
    }

    return {
      text,
      schemes: [scheme]
    };
  };

  const handleSendMessage = async (textToSend) => {
    const userText = textToSend || inputText;
    if (!userText || !userText.trim()) return;

    const detected = detectLanguage(userText.trim(), activeLangCode);
    if (detected !== activeLangCode) {
      setAutoDetectedLang(detected);
    }

    const userMsg = { sender: 'user', text: userText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      // 1. Unified backend query via /api/v1/voice/parse with real user GPS coordinates, detected language, and profile
      let backendRes = null;
      try {
        backendRes = await api.post('/voice/parse', {
          transcript: userText.trim(),
          lang: detected,
          lat: location?.lat,
          lng: location?.lng,
          userProfile: user || {}
        });
      } catch (err) {
        console.warn('[VoiceAssistantModal] Backend voice parse fallback:', err.message);
      }

      if (backendRes && backendRes.responseText) {
        // Find matched schemes if returned or contextual
        let matched = backendRes.matchedSchemes || [];
        if (!matched.length && backendRes.verifiedFact?.schemeId) {
          matched = mockSchemes.filter(s => s.id === backendRes.verifiedFact.schemeId);
        }

        const effectiveLang = backendRes.detectedLang || detected;
        if (effectiveLang !== activeLangCode) {
          setAutoDetectedLang(effectiveLang);
        }

        const botMsg = { 
          sender: 'bot', 
          text: backendRes.responseText, 
          schemes: matched,
          bankResults: backendRes.bankResults || [],
          verifiedFact: backendRes.verifiedFact || null,
          targetPage: backendRes.targetPage || null,
          quickFollowUps: backendRes.quickFollowUps || [],
          detectedLang: effectiveLang,
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, botMsg]);
        speakText(backendRes.responseText, getVoiceLocaleForCode(effectiveLang));
      } else {
        // Seamless high-intelligence client-side ChatGPT engine fallback
        const response = askChatGptVoiceAssistant(userText, detected, location, user);
        const effectiveLang = response.detectedLang || detected;
        const botMsg = { 
          sender: 'bot', 
          text: response.text, 
          schemes: response.schemes || [], 
          bankResults: response.bankResults || [],
          verifiedFact: response.verifiedFact || null,
          targetPage: response.targetPage || null,
          quickFollowUps: response.quickFollowUps || [],
          detectedLang: effectiveLang,
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, botMsg]);
        speakText(response.text, getVoiceLocaleForCode(effectiveLang));
      }
    } catch (e) {
      const response = askChatGptVoiceAssistant(userText, detected, location, user);
      const effectiveLang = response.detectedLang || detected;
      const botMsg = { 
        sender: 'bot', 
        text: response.text, 
        schemes: response.schemes || [], 
        bankResults: response.bankResults || [],
        verifiedFact: response.verifiedFact || null,
        targetPage: response.targetPage || null,
        quickFollowUps: response.quickFollowUps || [],
        detectedLang: effectiveLang,
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
      speakText(response.text, getVoiceLocaleForCode(effectiveLang));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem'
    }}>
      <div className="card" style={{
        maxWidth: '680px',
        width: '100%',
        height: '85vh',
        maxHeight: '720px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #E2E8F0',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#0B192C',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B192C' }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>{t('voiceAssistant', 'SchemeSetu AI Voice Assistant')}</span>
                <span className="badge" style={{ backgroundColor: '#F59E0B', color: '#0F172A', fontSize: '0.72rem', fontWeight: 800 }}>
                  {activeLangCode}
                </span>
                {autoDetectedLang && autoDetectedLang !== activeLangCode && (
                  <span className="badge" style={{ backgroundColor: '#10B981', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Sparkles size={11} /> Auto: {autoDetectedLang}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                {autoDetectedLang && autoDetectedLang !== activeLangCode ? `Language auto-detected as ${autoDetectedLang}` : `Real-time scheme intelligence & voice responses in ${activeLangCode}`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <select
              value={activeLangCode}
              onChange={(e) => handleLanguageChange(e.target.value)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FCD34D',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                borderRadius: '8px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none'
              }}
              aria-label="Select Voice Assistant Language"
            >
              <option value="EN" style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>🇬🇧 English (EN)</option>
              <option value="HI" style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>🇮🇳 हिंदी (HI)</option>
              <option value="TE" style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>🇮🇳 తెలుగు (TE)</option>
              <option value="TA" style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>🇮🇳 தமிழ் (TA)</option>
              <option value="KN" style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>🇮🇳 ಕನ್ನಡ (KN)</option>
              <option value="ML" style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>🇮🇳 മലയാളം (ML)</option>
              <option value="BN" style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>🇮🇳 বাংলা (BN)</option>
              <option value="MR" style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>🇮🇳 मराठी (MR)</option>
              <option value="GON" style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>🔀 गोंडी (GON)</option>
              <option value="BHI" style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>🔀 भीली (BHI)</option>
            </select>

            <button 
              onClick={() => { stopSpeaking(); stopListening(); onClose(); }}
              className="btn btn-sm btn-outline"
              style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.5rem' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Language Switcher Bar */}
        <div style={{
          padding: '0.4rem 1.25rem',
          backgroundColor: '#0F172A',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, flexShrink: 0, marginRight: '0.2rem' }}>Voice Language:</span>
          {[
            { code: 'EN', flag: '🇬🇧', label: 'English' },
            { code: 'HI', flag: '🇮🇳', label: 'हिंदी' },
            { code: 'TE', flag: '🇮🇳', label: 'తెలుగు' },
            { code: 'TA', flag: '🇮🇳', label: 'தமிழ்' },
            { code: 'KN', flag: '🇮🇳', label: 'ಕನ್ನಡ' },
            { code: 'ML', flag: '🇮🇳', label: 'മലയാളം' },
            { code: 'BN', flag: '🇮🇳', label: 'বাংলা' },
            { code: 'MR', flag: '🇮🇳', label: 'मराठी' },
            { code: 'GON', flag: '🔀', label: 'गोंडी' },
            { code: 'BHI', flag: '🔀', label: 'भीली' }
          ].map((item) => {
            const isSelected = item.code === activeLangCode;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleLanguageChange(item.code)}
                style={{
                  backgroundColor: isSelected ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#0F172A' : '#CBD5E1',
                  border: isSelected ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.73rem',
                  fontWeight: isSelected ? 800 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{item.flag}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Voice Control Bar & Audio Waveform Visualizer */}
        <div style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`btn btn-sm ${isListening ? 'btn-danger' : 'btn-primary'}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              <span>{isListening ? t('stopListening', 'Stop Listening') : t('startListening', 'Speak Query')}</span>
            </button>

            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="btn btn-outline btn-sm"
                style={{ color: '#DC2626', borderColor: '#FECACA' }}
              >
                <VolumeX size={15} /> {t('stopSpeaking', 'Stop Voice')}
              </button>
            )}
          </div>

          {/* Audio Waveform Equalizer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AudioWaveform isActive={isListening || isSpeaking} />
            <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {isListening && <span className="animate-pulse" style={{ color: '#DC2626', fontWeight: 700 }}>● Listening...</span>}
              {isSpeaking && <span style={{ color: '#059669', fontWeight: 600 }}>🔊 Speaking response...</span>}
            </div>
          </div>

          {/* Live Interim Transcript Preview */}
          {interimText && (
            <div style={{
              margin: '0.4rem 0 0 0',
              padding: '0.5rem 0.9rem',
              background: 'rgba(100,116,139,0.08)',
              borderRadius: '12px',
              border: '1px dashed #CBD5E1',
              fontSize: '0.88rem',
              color: '#64748B',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <span style={{ fontSize: '0.75rem' }}>🎤</span>
              <span>{interimText}</span>
            </div>
          )}
        </div>

        {/* Quick Voice Prompt Pills */}
        <div style={{ padding: '0.5rem 1.5rem', backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Quick Voice Prompts:</span>
          {getSamplePrompts().map((promptText, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={() => handleSendMessage(promptText)}
              style={{
                fontSize: '0.75rem',
                backgroundColor: '#FFFFFF',
                color: '#0369A1',
                border: '1px solid #BAE6FD',
                borderRadius: '12px',
                padding: '0.2rem 0.6rem',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
            >
              🎤 "{promptText}"
            </button>
          ))}
        </div>

        {/* Voice Notice if any */}
        {voiceError && (
          <div style={{ padding: '0.5rem 1.5rem', backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '0.8rem', borderBottom: '1px solid #FDE68A' }}>
            {voiceError}
          </div>
        )}

        {/* Message Stream */}
        <div style={{ flexGrow: 1, padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              style={{
                display: 'flex',
                gap: '0.65rem',
                alignItems: 'flex-start',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {msg.sender === 'bot' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0284C7', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0, marginTop: '2px' }}>
                  <Bot size={16} />
                </div>
              )}

              <div>
                <div style={{
                  padding: '0.85rem 1.1rem',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  backgroundColor: msg.sender === 'user' ? '#0284C7' : '#F1F5F9',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                  {renderFormattedText(msg.text)}

                  {/* Optional Scheme Cards Preview */}
                  {msg.schemes && msg.schemes.length > 0 && (
                    <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {msg.schemes.map(s => (
                        <div 
                          key={s.id}
                          onClick={() => { onClose(); navigate(`/schemes/${s.id}`); }}
                          style={{
                            padding: '0.65rem 0.85rem',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0369A1' }}>{s.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                            {s.maxLoan ? `Max Loan: ${formatIndianCurrency(s.maxLoan)}` : (s.maxBenefit ? `Benefit: ${formatIndianCurrency(s.maxBenefit)}` : 'Welfare Grant')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Enhanced Bank Results Display */}
                  {msg.bankResults && msg.bankResults.length > 0 && (
                    <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Building2 size={16} style={{ color: '#0284C7' }} />
                          <span>{t('nearbyBranches', 'Verified Nearby Bank Branches')}:</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { onClose(); navigate('/locations'); }}
                          style={{ background: 'none', border: 'none', color: '#0284C7', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'underline' }}
                        >
                          View All on Radar →
                        </button>
                      </div>
                      {msg.bankResults.map((bank, bIdx) => {
                        const dirUrl = (bank.coordinates?.lat && bank.coordinates?.lng)
                          ? `https://www.google.com/maps/dir/?api=1&destination=${bank.coordinates.lat},${bank.coordinates.lng}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bank.name + ' ' + (bank.address || ''))}`;
                        return (
                          <div 
                            key={bIdx}
                            style={{
                              padding: '0.75rem 0.9rem',
                              backgroundColor: '#FFFFFF',
                              borderRadius: '10px',
                              border: '1px solid #BAE6FD',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.45rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>{bank.name}</div>
                                <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '0.68rem', marginTop: '0.2rem', padding: '0.15rem 0.45rem' }}>
                                  {bank.type || 'Public Sector Bank'}
                                </span>
                              </div>
                              {bank.distanceText && (
                                <span className="badge" style={{ backgroundColor: '#E0F2FE', color: '#0284C7', fontWeight: 800, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                  <Compass size={11} style={{ display: 'inline', marginRight: '2px' }} />
                                  {bank.distanceText}
                                </span>
                              )}
                            </div>

                            <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '0.3rem', lineHeight: 1.35 }}>
                              <MapPin size={13} style={{ color: '#D97706', shrink: 0, marginTop: '2px' }} />
                              <span>{bank.address || bank.district || 'Branch Service Center'}</span>
                            </div>

                            {bank.timing && (
                              <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Clock size={12} style={{ color: '#059669', shrink: 0 }} />
                                <span>{bank.timing}</span>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem', paddingTop: '0.45rem', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap' }}>
                              <a
                                href={dirUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem', color: '#0369A1', borderColor: '#BAE6FD', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <Navigation size={12} /> Directions
                              </a>
                              {bank.phone && (
                                <a
                                  href={`tel:${bank.phone.replace(/[^+\d]/g, '')}`}
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem', color: '#065F46', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                >
                                  <Phone size={12} /> Call {bank.phone}
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Optional Verified Fact Source Link */}
                  {msg.verifiedFact && msg.verifiedFact.source && (
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: '#ECFDF5', borderRadius: '8px', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#065F46', fontWeight: 700 }}>
                        <ShieldCheck size={16} style={{ color: '#059669', flexShrink: 0 }} />
                        <span>{msg.verifiedFact.source.title || 'Official Government Source'}</span>
                      </div>
                      {msg.verifiedFact.source.url && (
                        <a
                          href={msg.verifiedFact.source.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '0.75rem', color: '#0284C7', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', fontWeight: 700 }}
                        >
                          <span>.gov.in</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Interactive ChatGPT Follow-up Chips */}
                  {msg.quickFollowUps && msg.quickFollowUps.length > 0 && (
                    <div style={{ marginTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {msg.quickFollowUps.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => handleSendMessage(chip)}
                          style={{
                            fontSize: '0.75rem',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            border: '1px solid #BFDBFE',
                            borderRadius: '14px',
                            padding: '0.25rem 0.65rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#DBEAFE'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#EFF6FF'; }}
                        >
                          <Sparkles size={11} style={{ color: '#2563EB' }} />
                          <span>{chip}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'bot' && (
                  <button
                    type="button"
                    onClick={() => speakText(msg.text, getVoiceLocaleForCode(msg.detectedLang || activeLangCode))}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem' }}
                  >
                    <Volume2 size={13} /> {t('replayAudio', 'Replay Voice')}
                  </button>
                )}
              </div>

              {msg.sender === 'user' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0B192C', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0, marginTop: '2px' }}>
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', alignSelf: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0284C7', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={16} />
              </div>
              <div style={{ padding: '0.6rem 1rem', borderRadius: '14px', backgroundColor: '#F1F5F9', color: '#64748B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="animate-pulse" style={{ color: '#0284C7' }}>●</span>
                <span>{t('processingQuery', 'Analyzing government schemes...')}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Footer */}
        <div style={{ padding: '1rem 1.5rem', backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            style={{ display: 'flex', gap: '0.5rem' }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask in ${lang} (e.g. "What loan can I get for manufacturing?")...`}
              style={{
                flexGrow: 1,
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.25rem' }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
