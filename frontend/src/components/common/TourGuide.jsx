import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Compass, 
  Check, 
  HelpCircle,
  Building2,
  FileCheck,
  MapPin,
  Calculator,
  Bot,
  Mic,
  Globe
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import useTextToSpeech from '../../hooks/useTextToSpeech';

export const TOUR_STEPS = [
  {
    targetId: 'tour-home',
    icon: '🏠',
    title: {
      en: 'Home — Welfare Portal',
      te: 'హోమ్ — సంక్షేమ పోర్టల్',
      hi: 'होम — कल्याण पोर्टल'
    },
    desc: {
      en: 'Your central hub to discover government schemes, check your ₹5.00L income eligibility, and access one-tap emergency micro-loans.',
      te: 'ప్రభుత్వ సంక్షేమ పథకాలు, ₹5.00 లక్షల ఆదాయ అర్హత తనిఖీ మరియు ఒకే ట్యాప్‌తో తక్షణ రుణాలను పొందే ప్రధాన కేంద్రం.',
      hi: 'सरकारी कल्याणकारी योजनाओं की खोज, ₹5.00 लाख आय पात्रता सत्यापन और त्वरित माइक्रो-ऋण प्राप्त करने का मुख्य केंद्र।'
    }
  },
  {
    targetId: 'tour-schemes',
    icon: '🏛️',
    title: {
      en: 'Explore Schemes',
      te: 'అన్ని పథకాలు అన్వేషించండి',
      hi: 'सभी योजनाएं देखें'
    },
    desc: {
      en: 'Browse 100+ concessional lending schemes tailored for SC beneficiaries covering small trades, tractors, higher education, and women enterprises.',
      te: 'చిన్న వ్యాపారాలు, ట్రాక్టర్లు, ఉన్నత విద్య మరియు మహిళా సాధికారత కోసం 100 కంటే ఎక్కువ రాయితీ రుణ పథకాలను చూడండి.',
      hi: 'छोटे व्यवसाय, ट्रैक्टर, उच्च शिक्षा और महिला उद्यमों के लिए 100 से अधिक रियायती ऋण योजनाओं को खोजें और जानें।'
    }
  },
  {
    targetId: 'tour-applications',
    icon: '📝',
    title: {
      en: 'Track & Apply',
      te: 'దరఖాస్తు & ట్రాకింగ్',
      hi: 'आवेदन व ट्रैकिंग'
    },
    desc: {
      en: 'Generate official universal application slips with QR codes and track your ongoing application status with branch channel partners.',
      te: 'క్యూఆర్ కోడ్‌తో అధికారిక దరఖాస్తు స్లిప్‌లను రూపొందించండి మరియు మీ లోన్ దరఖాస్తు పురోగతిని పర్యవేక్షించండి.',
      hi: 'क्यूआर कोड के साथ आधिकारिक आवेदन पर्ची बनाएं और अपने बैंक चैनल पार्टनर के साथ आवेदन की स्थिति ट्रैक करें।'
    }
  },
  {
    targetId: 'tour-locations',
    icon: '📍',
    title: {
      en: 'Partner Locator & Centers',
      te: 'సహాయ కేంద్రాలు & బ్యాంకులు',
      hi: 'सहायता केंद्र व बैंक लोकेटर'
    },
    desc: {
      en: 'Find nearest eligible SCAs, Banks, and CSCs using landmark navigation (e.g. Near Bus Stand), walking routes, and live bank opening hours.',
      te: 'బస్టాండ్ లేదా పంచాయతీ కార్యాలయం వంటి ల్యాండ్‌మార్క్‌లతో సమీపంలోని అర్హత గల బ్యాంకులు మరియు సంక్షేమ కేంద్రాలను కనుగొనండి.',
      hi: 'बस स्टैंड या पंचायत कार्यालय जैसे नजदीकी लैंडमार्क, पैदल मार्ग और लाइव बैंक खुलने के समय के साथ निकटतम चैनल पार्टनर खोजें।'
    }
  },
  {
    targetId: 'tour-calculator',
    icon: '🧮',
    title: {
      en: 'Financial EMI & Moratorium Calculator',
      te: 'ఈఎంఐ & మొరటోరియం కాలిక్యులేటర్',
      hi: 'ईएमआई व मोराटोरियम कैलकुलेटर'
    },
    desc: {
      en: 'Model 90% Govt concessional funding, your 10% margin money, and 3-12 months moratorium grace periods showing huge commercial savings.',
      te: '90% ప్రభుత్వ రాయితీ రుణం, 10% మీ వాటా మరియు 3 నుండి 12 నెలల మొరటోరియం గ్రేస్ పీరియడ్‌తో నెలవారీ ఈఎంఐ లెక్కించండి.',
      hi: '90% सरकारी रियायती ऋण, 10% अपनी मार्जिन राशि और 3 से 12 महीने के मोराटोरियम अवकाश के साथ मासिक ईएमआई व बचत की गणना करें।'
    }
  },
  {
    targetId: 'tour-agent',
    icon: '🤖',
    title: {
      en: 'Agent Mode (VLE Assistance)',
      te: 'ఏజెంట్ మోడ్ (గ్రామ వాలంటీర్ సేవ)',
      hi: 'एजेंट मोड (ग्राम सहायक सेवा)'
    },
    desc: {
      en: 'Fast-track intake form for CSC VLEs and village field volunteers to evaluate citizen eligibility and submit verified applications.',
      te: 'గ్రామ వాలంటీర్లు మరియు సీఎస్‌సీ ఆపరేటర్లు పౌరుల అర్హతను త్వరగా నమోదు చేసి దరఖాస్తులను సమర్పించడానికి సాధనం.',
      hi: 'सीएससी ऑपरेटरों और ग्राम सहायकों के लिए नागरिकों की पात्रता जांचने और सत्यापित आवेदन दर्ज करने का त्वरित फॉर्म।'
    }
  },
  {
    targetId: 'tour-sahaj',
    icon: '🎨',
    title: {
      en: 'Sahaj Audio-Visual Mode',
      te: 'సహజ్ ఆడియో & బొమ్మల మోడ్',
      hi: 'सहज चित्र-आवाज मोड'
    },
    desc: {
      en: 'Designed for low-literacy and tribal citizens: large pictorial scheme cards, 1-tap native speech audio, and volunteer doorstep callback support.',
      te: 'నిరక్షరాస్యులు మరియు గిరిజనుల కోసం పెద్ద బొమ్మలు, స్థానిక వాయిస్ ఆడియో మరియు ఉచిత వాలంటీర్ సహాయం అందించే ప్రత్యేక మోడ్.',
      hi: 'कम पढ़े-लिखे और आदिवासी नागरिकों के लिए बड़े चित्र कार्ड, 1-टैप आवाज ऑडियो और निःशुल्क सहायक सहायता मोड।'
    }
  },
  {
    targetId: 'tour-location-pill',
    icon: '🧭',
    title: {
      en: 'GPS Location Selector',
      te: 'జీపీఎస్ ప్రాంతం ఎంపిక',
      hi: 'जीपीएस स्थान चयन'
    },
    desc: {
      en: 'Detects your real GPS location or lets you select your district so only active, low-NPA branches in your area are recommended.',
      te: 'మీ నిజమైన జీపీఎస్ లొకేషన్‌ను గుర్తిస్తుంది లేదా మీ జిల్లాను ఎంచుకోవడానికి సహాయపడుతుంది.',
      hi: 'आपके वास्तविक जीपीएस स्थान का पता लगाता है या आपके जिले के अनुसार केवल सक्रिय व गैर-एनपीए बैंक शाखाएं दिखाता है।'
    }
  },
  {
    targetId: 'tour-voice',
    icon: '🎙️',
    title: {
      en: 'AI Voice Assistant',
      te: 'వాయిస్ అసిస్టెంట్ (మాట్లాడండి)',
      hi: 'आवाज सहायक (बोलकर पूछें)'
    },
    desc: {
      en: 'Just tap and speak in Telugu, Hindi, English, Gondi, Tamil, or Kannada! Automatically recognizes your language and speaks back.',
      te: 'మైక్ నొక్కి తెలుగు, హిందీ లేదా ఇంగ్లీషులో మాట్లాడండి! మీ భాషను స్వయంచాలకంగా గుర్తించి సరైన సమాధానం చెబుతుంది.',
      hi: 'माइक दबाकर हिंदी, तेलुगु या अंग्रेजी में बोलें! यह स्वतः आपकी भाषा पहचानकर आवाज में मार्गदर्शन देगा।'
    }
  },
  {
    targetId: 'tour-language',
    icon: '🌐',
    title: {
      en: 'Language Switcher',
      te: 'భాష మార్పు',
      hi: 'भाषा परिवर्तन'
    },
    desc: {
      en: 'Instantly change the entire portal interface into 10+ Indian languages including Telugu, Hindi, Tamil, Kannada, and Tribal dialects.',
      te: 'మొత్తం పోర్టల్‌ను తెలుగు, హిందీ, ఇంగ్లీష్ లేదా గిరిజన మాండలికాలతో సహా 10 కంటే ఎక్కువ భారతీయ భాషల్లోకి మార్చుకోండి.',
      hi: 'पूरे पोर्टल को हिंदी, तेलुगु, अंग्रेजी या आदिवासी बोलियों सहित 10 से अधिक भारतीय भाषाओं में कभी भी बदलें।'
    }
  }
];

export default function TourGuide({ isOpen, onClose }) {
  const { lang } = useLanguage();
  const { speak, stop, isSpeaking } = useTextToSpeech({ lang });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const resizeObserverRef = useRef(null);

  const step = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const totalSteps = TOUR_STEPS.length;

  // Resolve localized text
  const getLocalized = (obj) => {
    if (!obj) return '';
    if (lang === 'te' && obj.te) return obj.te;
    if (lang === 'hi' && obj.hi) return obj.hi;
    return obj.en || Object.values(obj)[0] || '';
  };

  const updateTargetPosition = useCallback(() => {
    if (!step?.targetId) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        right: rect.right
      });
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    if (!isOpen) {
      stop();
      return;
    }
    updateTargetPosition();

    const handleResize = () => updateTargetPosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      stop();
    };
  }, [isOpen, currentStepIndex, updateTargetPosition, stop]);

  // Read current tour step via TTS
  const handleSpeakStep = () => {
    if (isSpeaking) {
      stop();
      return;
    }
    const title = getLocalized(step.title);
    const desc = getLocalized(step.desc);
    speak(`${title}. ${desc}`);
  };

  const handleNext = () => {
    stop();
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    stop();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    stop();
    localStorage.setItem('schemesetu_tour_completed', 'true');
    setCurrentStepIndex(0);
    onClose();
  };

  if (!isOpen) return null;

  // Popover card positioning relative to targetRect
  let popoverTop = 90;
  let popoverLeft = 20;
  let arrowLeft = 40;

  if (targetRect) {
    popoverTop = Math.min(window.innerHeight - 340, targetRect.bottom + 16);
    popoverLeft = Math.max(16, Math.min(window.innerWidth - 380, targetRect.left - 40));
    arrowLeft = Math.max(20, Math.min(340, targetRect.left + targetRect.width / 2 - popoverLeft));
  }

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: 'auto',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
      aria-label="Interactive Guided Tour"
    >
      {/* Dimmed backdrop with highlight cutout */}
      <div 
        onClick={handleFinish}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(2, 12, 27, 0.75)',
          backdropFilter: 'blur(3px)',
          transition: 'all 0.3s ease'
        }}
      />

      {/* Target element spotlight frame */}
      {targetRect && (
        <div
          style={{
            position: 'absolute',
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            borderRadius: '12px',
            border: '2.5px solid #F59E0B',
            boxShadow: '0 0 0 9999px rgba(2, 12, 27, 0.75), 0 0 25px rgba(245, 158, 11, 0.9)',
            pointerEvents: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 100000
          }}
        />
      )}

      {/* Floating Tour Popover Box with Directional Arrow */}
      <div
        style={{
          position: 'absolute',
          top: `${popoverTop}px`,
          left: `${popoverLeft}px`,
          width: '360px',
          maxWidth: 'calc(100vw - 32px)',
          backgroundColor: '#0F172A',
          border: '1.5px solid #F59E0B',
          borderRadius: '18px',
          padding: '1.4rem',
          color: '#F8FAFC',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), 0 0 20px rgba(245, 158, 11, 0.3)',
          zIndex: 100001,
          animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Directional Arrow SVG pointing UP towards target */}
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: `${arrowLeft}px`,
            width: '0',
            height: '0',
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderBottom: '12px solid #F59E0B',
            transform: 'translateX(-50%)'
          }}
        />

        {/* Header: Step counter & close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              color: '#F59E0B',
              padding: '0.25rem 0.6rem',
              borderRadius: '12px',
              border: '1px solid rgba(245, 158, 11, 0.4)'
            }}>
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <span style={{ fontSize: '1.3rem' }}>{step.icon}</span>
          </div>

          <button
            onClick={handleFinish}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.2rem',
              borderRadius: '6px'
            }}
            title="Close Tour"
            aria-label="Close Tour"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Title & Spoken Voice Button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', margin: 0, lineHeight: 1.3 }}>
            {getLocalized(step.title)}
          </h4>
          <button
            onClick={handleSpeakStep}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.3rem 0.6rem',
              borderRadius: '12px',
              backgroundColor: isSpeaking ? '#DC2626' : 'rgba(5, 150, 105, 0.25)',
              color: isSpeaking ? '#FFFFFF' : '#34D399',
              border: `1px solid ${isSpeaking ? '#DC2626' : '#059669'}`,
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0
            }}
            title="Listen to this explanation"
          >
            {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span>{isSpeaking ? 'Stop' : 'Voice'}</span>
          </button>
        </div>

        {/* Step Description */}
        <p style={{ fontSize: '0.86rem', color: '#CBD5E1', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
          {getLocalized(step.desc)}
        </p>

        {/* Dots progress indicator */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem', justifyContent: 'center' }}>
          {TOUR_STEPS.map((_, idx) => (
            <div
              key={idx}
              onClick={() => { stop(); setCurrentStepIndex(idx); }}
              style={{
                width: idx === currentStepIndex ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: idx === currentStepIndex ? '#F59E0B' : 'rgba(255,255,255,0.2)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>

        {/* Footer controls: Back, Skip, Next */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: currentStepIndex === 0 ? '#475569' : '#CBD5E1',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            onClick={handleFinish}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Skip
          </button>

          <button
            onClick={handleNext}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              backgroundColor: '#F59E0B',
              color: '#0F172A',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
            }}
          >
            <span>{currentStepIndex === totalSteps - 1 ? 'Finish Tour' : 'Next'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
