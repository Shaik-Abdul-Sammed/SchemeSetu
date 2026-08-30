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
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { mockSchemes } from '../../data/mock/schemes';
import { formatIndianCurrency } from '../../utils/numberValidator';

export default function VoiceAssistantModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [contextSchemes, setContextSchemes] = useState([]);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Language mapping to speech locales
  const getVoiceLocale = () => {
    switch (lang) {
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

  // Initial welcome message in selected language
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let welcome = "Hello! I am SchemeSetu AI Voice Assistant. Ask me about government welfare schemes, loans, eligibility, or application steps.";
      if (lang === 'HI') welcome = "नमस्ते! मैं स्कीमसेतू एआई आवाज़ सहायक हूँ। मुझसे सरकारी योजनाओं, लोन, पात्रता या आवेदन नियमों के बारे में पूछें।";
      else if (lang === 'TE') welcome = "నమస్కారం! నేను స్కీమ్‌సేతు AI వాయిస్ అసిస్టెంట్‌ని. ప్రభుత్వ సంక్షేమ పథకాలు, లోన్లు మరియు అర్హతల గురించి నన్ను అడగండి.";
      else if (lang === 'TA') welcome = "வணக்கம்! நான் SchemeSetu AI குரல் உதவியாளர். அரசு நலத்திட்டங்கள் மற்றும் கடன்கள் குறித்து என்னிடம் கேளுங்கள்.";
      else if (lang === 'KN') welcome = "ನಮಸ್ಕಾರ! ನಾನು SchemeSetu AI ಧ್ವನಿ ಸಹಾಯಕ. ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಾಲಗಳ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ.";
      else if (lang === 'ML') welcome = "നമസ്കാരം! ഞാൻ സ്കീംസേതു AI വോയ്‌സ് അസിസ്റ്റന്റാണ്. സർക്കാർ പദ്ധതികളെക്കുറിച്ച് എന്നോട് ചോദിക്കുക.";
      else if (lang === 'BN') welcome = "নমস্কার! আমি স্কিমসেতু এআই ভয়েস সহকারী। সরকারী প্রকল্প এবং ঋণের বিষয়ে আমাকে জিজ্ঞাসা করুন।";
      else if (lang === 'MR') welcome = "नमस्कार! मी स्कीमसेतू एआय व्हॉइस असिस्टंट आहे. मला सरकारी योजना, कर्ज आणि पात्रतेबद्दल विचारा.";
      else if (lang === 'GON') welcome = "सेवा जोहार! मैं स्कीमसेतू आवाज सहायक आय। सरकारी योजना अउर लोन बर मोसे सवाल पूछा।";
      else if (lang === 'BHI') welcome = "राम राम! हुं स्कीमसेतू आवाज सहायक छुं। सरकारी योजना अणे लोन बाबत मने पूछो।";

      const initialMsg = { sender: 'bot', text: welcome, timestamp: new Date() };
      setMessages([initialMsg]);
      speakText(welcome);
    }
  }, [isOpen, lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Synthesis
  const speakText = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getVoiceLocale();
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
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

  // Speech Recognition
  const startListening = () => {
    setVoiceError(null);
    stopSpeaking();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError(t('speechNotSupported', 'Browser speech recognition not available. Please type your query below.'));
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = getVoiceLocale();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (transcript && transcript.trim()) {
          handleSendMessage(transcript.trim());
        }
      };
      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setVoiceError('Speech capture note: Voice recognition ended. You can also type below.');
        }
      };
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
      setVoiceError('Microphone initialized in text mode.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
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
      if (lang === 'HI') {
        return {
          text: `अनुसूचित जाति (SC) उद्यमियों के लिए मुख्य योजनाएं हैं: 1. स्टैंड-अप इंडिया (₹10 लाख से ₹1 करोड़ लोन), 2. दलित बंधु (₹10 लाख सीधी सरकारी सहायता), 3. PMEGP (35% विशेष सब्सिडी)। क्या आप इनमें से किसी का विवरण जानना चाहते हैं?`,
          schemes: scSchemes
        };
      } else if (lang === 'TE') {
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
      if (lang === 'HI') {
        return {
          text: `स्कीमसेतू पर बिजनेस लोन योजनाएं: मुद्रा योजना (₹50,000 से ₹20 लाख तक बिना गारंटी), PMEGP (₹50 लाख तक 35% सब्सिडी के साथ), और स्टैंड-अप इंडिया (₹10 लाख से ₹1 करोड़)।`,
          schemes: loanSchemes.slice(0, 3)
        };
      } else if (lang === 'TE') {
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
      if (lang === 'HI') {
        return {
          text: `सरकारी योजनाओं के लिए सामान्यतः आवश्यक दस्तावेज हैं: 1. आधार कार्ड, 2. बैंक पासबुक (आधार लिंक), 3. आय प्रमाण पत्र, 4. जाति प्रमाण पत्र (SC/ST/OBC के लिए), 5. व्यवसाय कोटेशन / प्रोजेक्ट रिपोर्ट।`
        };
      } else if (lang === 'TE') {
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

    if (lang === 'HI') {
      return {
        text: `वर्तमान में उपलब्ध प्रमुख सरकारी योजनाएं हैं: 1. ${topSchemes[0].name}, 2. ${topSchemes[1].name}, 3. ${topSchemes[2].name}। आप पात्रता जांचने के लिए 'पात्रता' विकल्प पर जा सकते हैं।`,
        schemes: topSchemes
      };
    } else if (lang === 'TE') {
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
    
    if (lang === 'HI') {
      text = `${scheme.name}: ${scheme.summary} ${scheme.maxLoan ? `अधिकतम लोन सीमा ${formatIndianCurrency(scheme.maxLoan)} है।` : ''} आयु सीमा ${scheme.minAge} से ${scheme.maxAge} वर्ष है।`;
    } else if (lang === 'TE') {
      text = `${scheme.name}: ${scheme.summary} ${scheme.maxLoan ? `గరిష్ట రుణం ${formatIndianCurrency(scheme.maxLoan)}.` : ''} వయోపరిమితి: ${scheme.minAge}-${scheme.maxAge} సంవత్సరాలు.`;
    }

    return {
      text,
      schemes: [scheme]
    };
  };

  const handleSendMessage = (textToSend) => {
    const userText = textToSend || inputText;
    if (!userText || !userText.trim()) return;

    const userMsg = { sender: 'user', text: userText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      const response = processQuery(userText);
      const botMsg = { 
        sender: 'bot', 
        text: response.text, 
        schemes: response.schemes || [], 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
      speakText(response.text);
    }, 400);
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
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', fontSize: '0.7rem' }}>
                  {lang} Mode
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Real-time scheme intelligence & voice responses in {lang}
              </div>
            </div>
          </div>

          <button 
            onClick={() => { stopSpeaking(); stopListening(); onClose(); }}
            className="btn btn-sm btn-outline"
            style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.5rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Voice Control Bar */}
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

          <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {isListening && <span className="animate-pulse" style={{ color: '#DC2626', fontWeight: 700 }}>● Listening in {lang}...</span>}
            {isSpeaking && <span style={{ color: '#059669', fontWeight: 600 }}>🔊 Speaking response...</span>}
          </div>
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
                  lineHeight: 1.5,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                  {msg.text}

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
                </div>

                {msg.sender === 'bot' && (
                  <button
                    type="button"
                    onClick={() => speakText(msg.text)}
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
