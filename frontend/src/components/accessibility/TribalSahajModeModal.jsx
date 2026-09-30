import React, { useState, useEffect } from 'react';
import { 
  X, Volume2, VolumeX, PhoneCall, Navigation, Footprints, 
  MapPin, CheckCircle2, ShieldCheck, Clock, Building2, 
  Sparkles, HeartHandshake, ArrowRight, Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import useTextToSpeech from '../../hooks/useTextToSpeech';
import { 
  openDirectionsInMaps, 
  isPartnerOpenNow, 
  getAudioDirectionsText 
} from '../../utils/mapUtils';

export default function TribalSahajModeModal({ isOpen, onClose }) {
  const { lang, setLang, t } = useLanguage();
  const { location, nearbyPartners } = useLocation();
  const { speak, stop, isSpeaking } = useTextToSpeech({ lang });

  const [selectedSchemeId, setSelectedSchemeId] = useState('dairy');
  const [requestHelpOpen, setRequestHelpOpen] = useState(false);
  const [helpPhone, setHelpPhone] = useState('');
  const [helpSubmitted, setHelpSubmitted] = useState(false);

  // Stop speech on unmount or close
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  if (!isOpen) return null;

  // Language options with native names and audio-friendly hints
  const languageOptions = [
    { code: 'TE', label: 'తెలుగు (Telugu)', hint: 'ఆడియో & బొమ్మలు' },
    { code: 'HI', label: 'हिंदी (Hindi)', hint: 'चित्र व आवाज' },
    { code: 'GON', label: 'గోండీ / गोंडी (Gondi)', hint: 'గిరిజన భాష' },
    { code: 'BHI', label: 'भीली (Bhili)', hint: 'आदिवासी बोली' },
    { code: 'TA', label: 'தமிழ் (Tamil)', hint: 'ஒலி மற்றும் படம்' },
    { code: 'KN', label: 'ಕನ್ನಡ (Kannada)', hint: 'ಧ್ವನಿ ಮತ್ತು ಚಿತ್ರ' },
    { code: 'MR', label: 'मराठी (Marathi)', hint: 'आवाज व चित्र' },
    { code: 'EN', label: 'English', hint: 'Voice & Visual' }
  ];

  // Pictorial schemes tailored for SC & Tribal beneficiaries under NSFDC concessional lending
  const schemes = [
    {
      id: 'dairy',
      icon: '🐄',
      titleTe: 'పశువుల పెంపకం (గేదెలు, ఆవులు, మేకలు)',
      titleHi: 'पशुपालन व डेयरी (गाय, भैंस, बकरी)',
      titleGon: 'పశువుల పెంపకం / గొర్రెల మంద',
      titleBhi: 'ढोर-डांगर व दूध डेयरी',
      titleEn: 'Dairy & Animal Husbandry (Cows, Buffaloes, Goats)',
      category: 'Micro-Finance (₹1.40 Lakh)',
      projectCost: 140000,
      govtShare: 126000, // 90%
      userShare: 14000,  // 10%
      interestRate: '6.5% p.a.',
      monthlyEmi: 1520,
      speechTe: 'పశువుల పెంపకం పథకం. గేదెలు, ఆవులు లేదా మేకల కొనుగోలుకు లక్ష నలభై వేల రూపాయల వరకు రుణం లభిస్తుంది. ఇందులో ప్రభుత్వం తొంభై శాతం, అంటే లక్షా ఇరవై ఆరు వేల రూపాయలు ఇస్తుంది. మీ వాటా కేవలం పద్నాలుగు వేల రూపాయలు. నెలకు సుమారు వెయ్యి ఐదు వందల రూపాయల కిస్తు ఉంటుంది. కింద ఉన్న ఆకుపచ్చ బటన్ నొక్కి సమీప బ్యాంక్ మేనేజర్‌తో మాట్లాడండి.',
      speechHi: 'पशुपालन व डेयरी योजना। गाय, भैंस या बकरी खरीदने के लिए एक लाख चालीस हजार रुपये तक का रियायती ऋण मिलता है। इसमें सरकार नब्बे प्रतिशत यानी एक लाख छब्बीस हजार रुपये देती है। आपका अंशदान केवल चौदह हजार रुपये है। हर महीने लगभग पंद्रह सौ रुपये की किस्त होगी। नीचे दिए गए हरे बटन को दबाकर बैंक अधिकारी से बात करें।',
      speechGon: 'పశువుల పెంపకం సహాయం. ఆవులు, గేదెలు, మేకల కొనుగోలుకు ప్రభుత్వం తొంభై శాతం రుణం ఇస్తుంది. మీ వాటా పది శాతం మాత్రమే. నెలకు సుమారు పదిహేను వందల కిస్తు ఉంటుంది. అధికారికి ఫోన్ చేయడానికి ఆకుపచ్చ బటన్ నొక్కండి.',
      speechBhi: 'ढोर-डांगर व डेयरी योजना। गाय-भैंस वास्ते एक लाख चालीस हजार नो लोण मळे छे। सरकार ९० टका यानी एक लाख छब्बीस हजार आपे छे। थारो हिस्सो खाली चौदह हजार छे। बात करवा लीलो बटन दबाओ.',
      speechEn: 'Dairy and animal farming loan. Get up to 1.40 lakh rupees for buying cows, buffaloes, or goats. Government provides 90 percent assistance, that is 1 lakh 26 thousand rupees. Your share is only 14 thousand rupees. Monthly repayment is around 1,520 rupees. Tap call button below to speak with your branch manager.'
    },
    {
      id: 'tractor',
      icon: '🚜',
      titleTe: 'వ్యవసాయం & ట్రాక్టర్ (సాగు పరికరాలు)',
      titleHi: 'खेती व ट्रैक्टर (कृषि यंत्र व बोरवेल)',
      titleGon: 'ట్రాక్టర్ & వ్యవసాయ సాగు',
      titleBhi: 'खेती वास्ते ट्रैक्टर व मशीन',
      titleEn: 'Tractor & Agriculture Equipment',
      category: 'Term Loan (Up to ₹50.00 Lakh)',
      projectCost: 800000,
      govtShare: 720000, // 90%
      userShare: 80000,  // 10%
      interestRate: '6.5% - 8% p.a.',
      monthlyEmi: 8650,
      speechTe: 'వ్యవసాయం మరియు ట్రాక్టర్ కొనుగోలు రుణ పథకం. ట్రాక్టర్, వ్యవసాయ పనిముట్లకు తొంభై శాతం వరకు ప్రభుత్వం రాయితీతో కూడిన రుణం అందిస్తుంది. ఎనిమిది లక్షల రూపాయల ప్రాజెక్టుకు ప్రభుత్వం ఏడు లక్షల ఇరవై వేల రూపాయలు ఇస్తుంది. మీ వాటా ఎనభై వేలు. మొదటి ఆరు నుండి పన్నెండు నెలల వరకు మారటోరియం వెసులుబాటు ఉంటుంది.',
      speechHi: 'खेती और ट्रैक्टर योजना। ट्रैक्टर और कृषि यंत्रों के लिए सरकार नब्बे प्रतिशत तक रियायती ऋण देती है। आठ लाख के प्रोजेक्ट में सरकार सात लाख बीस हजार रुपये देगी। आपको छह से बारह महीने की ग्रेस अवधि भी मिलती है।',
      speechGon: 'ట్రాక్టర్ మరియు సాగు పథకం. సాగు పనిముట్లకు తొంభై శాతం ప్రభుత్వం రుణం ఇస్తుంది. దరఖాస్తు కోసం సమీప బ్యాంకును సంప్రదించండి.',
      speechBhi: 'खेती वास्ते ट्रैक्टर योजना। सरकार नब्बे टका तक सहायता आपे छे। अरजी करवा बैंक मां फोन लगाओ.',
      speechEn: 'Tractor and farm equipment loan. Up to 90 percent project cost funded at concessional 6.5 to 8 percent interest rate with 6 to 12 months grace period.'
    },
    {
      id: 'tailoring',
      icon: '🧵',
      titleTe: 'టైలరింగ్ & కుట్టు మిషన్ (మహిళా సమృద్ధి)',
      titleHi: 'सिलाई मशीन व महिला उद्योग',
      titleGon: 'కుట్టు మిషన్ & బట్టల దుకాణం',
      titleBhi: 'सिलाई मशीन व जनाना काम',
      titleEn: 'Tailoring & Garment Unit (Mahila Samriddhi)',
      category: 'Micro-Credit (₹1.40 Lakh)',
      projectCost: 100000,
      govtShare: 90000, // 90%
      userShare: 10000, // 10%
      interestRate: '4% p.a. (Special Women Rate)',
      monthlyEmi: 1100,
      speechTe: 'మహిళా సమృద్ధి టైలరింగ్ పథకం. కుట్టు మిషన్లు, బట్టల వ్యాపారానికి లక్ష రూపాయల వరకు రుణం. ప్రభుత్వం తొంభై వేల రూపాయలు ఇస్తుంది, మీ వాటా పది వేల రూపాయలు. మహిళలకు కేవలం నాలుగు శాతం ప్రత్యేక వడ్డీ మాత్రమే. నెలకు పదకొండు వందల రూపాయల కిస్తు.',
      speechHi: 'महिला समृद्धि सिलाई योजना। सिलाई मशीन और कपड़े के काम के लिए एक लाख रुपये का ऋण। सरकार नब्बे हजार रुपये देती है, आपका अंश केवल दस हजार है। महिलाओं के लिए केवल चार प्रतिशत की बहुत कम ब्याज दर है।',
      speechGon: 'కుట్టు మిషన్ సహాయం. మహిళలకు నాలుగు శాతం తక్కువ వడ్డీతో తొంభై శాతం రుణం దొరుకుతుంది.',
      speechBhi: 'सिलाई मशीन योजना। बाईयां वास्ते खाली चार टका ब्याज दर छे। सरकार नब्बे हजार आपे छे.',
      speechEn: 'Mahila Samriddhi tailoring loan for women. Get 90 percent funding up to 1.40 lakh rupees at a special concessional interest rate of only 4 percent per year.'
    },
    {
      id: 'kirana',
      icon: '🛒',
      titleTe: 'చిన్న కిరాణా & గ్రామీణ దుకాణం',
      titleHi: 'ग्रामीण किराना व छोटी दुकान',
      titleGon: 'కిరాణా దుకాణం / నిత్యావసరాలు',
      titleBhi: 'किराना व राशन दुकान',
      titleEn: 'Kirana & Village Retail Shop',
      category: 'Micro-Credit (₹1.40 Lakh)',
      projectCost: 140000,
      govtShare: 126000,
      userShare: 14000,
      interestRate: '6.5% p.a.',
      monthlyEmi: 1520,
      speechTe: 'గ్రామీణ కిరాణా మరియు చిన్న దుకాణం పథకం. నిత్యావసరాల దుకాణం, టీ కొట్టు లేదా కూరగాయల వ్యాపారానికి లక్షా నలభై వేల రూపాయల వరకు రుణం. ప్రభుత్వం తొంభై శాతం నిధులు ఇస్తుంది. సులభ వాయిదాలలో చెల్లించవచ్చు.',
      speechHi: 'ग्रामीण किराना व छोटी दुकान योजना। किराना, चाय की दुकान या फल-सब्जी के लिए एक लाख चालीस हजार रुपये का ऋण। सरकार नब्बे प्रतिशत सहायता देती है।',
      speechGon: 'గ్రామీణ కిరాణా పథకం. చిన్న వ్యాపారానికి ప్రభుత్వం తొంభై శాతం ఆర్థిక సాయం చేస్తుంది.',
      speechBhi: 'किराना दुकान योजना। गांव मां दुकान वास्ते सरकार ९० टका लोण आपे छे.',
      speechEn: 'Village grocery and kirana shop loan. Up to 1.40 lakh rupees with 90 percent government financing for retail shops, tea stalls, and general merchandise.'
    },
    {
      id: 'education',
      icon: '🎓',
      titleTe: 'పిల్లల ఉన్నత చదువు & కాలేజీ',
      titleHi: 'बच्चों की उच्च शिक्षा व कॉलेज',
      titleGon: 'పిల్లల కాలేజీ చదువు',
      titleBhi: 'टाबरिया नी पढ़ाई व कॉलेज',
      titleEn: 'Children Higher Education & College',
      category: 'Education Loan (Up to ₹30.00 Lakh)',
      projectCost: 1000000,
      govtShare: 900000,
      userShare: 100000,
      interestRate: '4% p.a. (3.5% for Girls)',
      monthlyEmi: 0, // Moratorium during study
      speechTe: 'షెడ్యూల్డ్ కులాల విద్యార్థుల విద్యా రుణ పథకం. డిగ్రీ, ఇంజనీరింగ్, మెడిసిన్ లేదా నర్సింగ్ చదువులకు ముప్పై లక్షల రూపాయల వరకు రుణం. కేవలం నాలుగు శాతం వడ్డీ, బాలికలకు మూడున్నర శాతం వడ్డీ. చదువు పూర్తయ్యే వరకు ఎలాంటి కిస్తు కట్టనవసరం లేదు.',
      speechHi: 'अनुसूचित जाति उच्च शिक्षा ऋण योजना। डिग्री, इंजीनियरिंग, मेडिकल या नर्सिंग के लिए तीस लाख रुपये तक का रियायती ऋण। केवल चार प्रतिशत ब्याज दर, बालिकाओं के लिए साढ़े तीन प्रतिशत। पढ़ाई के दौरान कोई किस्त नहीं देनी होती।',
      speechGon: 'పిల్లల చదువుల రుణం. కాలేజీ చదువులకు నాలుగు శాతం తక్కువ వడ్డీతో ప్రభుత్వం రుణం ఇస్తుంది.',
      speechBhi: 'पढ़ाई वास्ते लोण। कॉलेज नी फीस वास्ते सरकार खाली चार टका ब्याज पर लोण आपे छे.',
      speechEn: 'Concessional educational loan scheme for SC students. Up to 30 lakh rupees at 4 percent interest rate, and 3.5 percent for girls. No repayments required during course duration.'
    },
    {
      id: 'transport',
      icon: '🛺',
      titleTe: 'ఆటో రిక్షా & రవాణా వాహనం',
      titleHi: 'पैसेंजर ऑटो व सवारी गाड़ी',
      titleGon: 'ఆటో & రవాణా బండి',
      titleBhi: 'सवारी ऑटो व गाड़ी',
      titleEn: 'Passenger Auto & Transport Vehicle',
      category: 'Term Loan (Up to ₹5.00 Lakh)',
      projectCost: 350000,
      govtShare: 315000,
      userShare: 35000,
      interestRate: '7% p.a.',
      monthlyEmi: 3750,
      speechTe: 'ఆటో రిక్షా మరియు ప్రయాణికుల వాహన పథకం. ప్యాసింజర్ ఆటో లేదా డెలివరీ వాహనం కొనుగోలుకు మూడున్నర లక్షల రూపాయల ప్రాజెక్టులో ప్రభుత్వం మూడు లక్షల పదిహేను వేల రూపాయలు ఇస్తుంది. మీ వాటా కేవలం ముప్పై ఐదు వేల రూపాయలు.',
      speechHi: 'पैसेंजर ऑटो व गाड़ी योजना। सवारी ऑटो या मालवाहक गाड़ी खरीदने के लिए सरकार नब्बे प्रतिशत सहायता देती है। साढ़े तीन लाख की गाड़ी में सरकार तीन लाख पंद्रह हजार देगी।',
      speechGon: 'ఆటో కొనుగోలు రుణం. ప్రభుత్వం తొంభై శాతం రుణం ఇస్తుంది. మీ వాటా పది శాతం.',
      speechBhi: 'ऑटो रिक्शा योजना। गाड़ी वास्ते सरकार तीन लाख पंद्रह हजार आपे छे.',
      speechEn: 'Auto-rickshaw and commercial transport loan. 90 percent government financing up to 5 lakh rupees for purchasing passenger autos and goods vehicles.'
    }
  ];

  const currentScheme = schemes.find(s => s.id === selectedSchemeId) || schemes[0];

  // Get single nearest low-NPA partner
  const nearestPartner = nearbyPartners.find(p => p.fundAvailable && p.npaStatus !== 'high') || nearbyPartners[0];
  const partnerOpen = nearestPartner ? isPartnerOpenNow(nearestPartner) : null;

  const getSchemeTitle = (s) => {
    if (lang === 'TE') return s.titleTe;
    if (lang === 'HI') return s.titleHi;
    if (lang === 'GON') return s.titleGon;
    if (lang === 'BHI') return s.titleBhi;
    return s.titleEn;
  };

  const getSchemeSpeech = (s) => {
    if (lang === 'TE') return s.speechTe;
    if (lang === 'HI') return s.speechHi;
    if (lang === 'GON') return s.speechGon;
    if (lang === 'BHI') return s.speechBhi;
    return s.speechEn;
  };

  const handlePlaySchemeSpeech = (s) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(getSchemeSpeech(s));
    }
  };

  const handlePlayPartnerSpeech = () => {
    if (!nearestPartner) return;
    if (isSpeaking) {
      stop();
    } else {
      const speech = getAudioDirectionsText(nearestPartner, location, lang);
      speak(speech);
    }
  };

  const handleHelpSubmit = (e) => {
    e.preventDefault();
    if (!helpPhone.trim()) return;
    setHelpSubmitted(true);
    setTimeout(() => {
      setRequestHelpOpen(false);
      setHelpSubmitted(false);
      setHelpPhone('');
    }, 3000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 12, 27, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
        zIndex: 100008
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6)',
          border: '2px solid #F59E0B',
          overflow: 'hidden'
        }}
      >
        {/* Tricolor Header Strip */}
        <div style={{ height: '6px', background: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)' }} />

        {/* Modal Top Bar */}
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🎨</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  backgroundColor: '#D97706',
                  color: '#FFFFFF',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '6px',
                  letterSpacing: '0.04em'
                }}>
                  SAHAJ MODE
                </span>
                <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 700 }}>
                  ✓ {lang === 'TE' ? 'ఆడియో & బొమ్మల మోడ్' : (lang === 'HI' ? 'चित्र व आवाज मोड' : 'Audio-Visual Tribal Interface')}
                </span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', margin: '0.2rem 0 0 0' }}>
                {lang === 'TE' ? 'గ్రామీణ & గిరిజన సులభ సహాయం' : (lang === 'HI' ? 'ग्रामीण व आदिवासी सहज सहायता' : 'Gramin & Tribal Assisted Welfare')}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Audio Toggle Indicator */}
            <button
              type="button"
              onClick={() => handlePlaySchemeSpeech(currentScheme)}
              style={{
                backgroundColor: isSpeaking ? '#DC2626' : '#059669',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.45rem 0.95rem',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)'
              }}
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isSpeaking ? (lang === 'TE' ? 'ఆపండి' : 'रोकें') : (lang === 'TE' ? 'వినండి' : 'सुनें')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer'
              }}
              aria-label="Close Sahaj Mode"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Language Selection Quick Pills (Accessible) */}
        <div style={{
          backgroundColor: '#F8FAFC',
          padding: '0.65rem 1rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {languageOptions.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => {
                setLang(opt.code);
                stop();
              }}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: lang === opt.code ? 900 : 700,
                backgroundColor: lang === opt.code ? '#0F172A' : '#FFFFFF',
                color: lang === opt.code ? '#FCD34D' : '#334155',
                border: `1.5px solid ${lang === opt.code ? '#0F172A' : '#CBD5E1'}`,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <span>{opt.label}</span>
              {lang === opt.code && <Check size={13} style={{ color: '#FCD34D' }} />}
            </button>
          ))}
        </div>

        {/* Scrollable Main Interactive Canvas */}
        <div style={{
          padding: '1.25rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          backgroundColor: '#F8FAFC'
        }}>
          {/* Audio Instruction Bar */}
          <div style={{
            backgroundColor: '#FEF3C7',
            border: '1.5px solid #FCD34D',
            borderRadius: '16px',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📢</span>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#92400E', textTransform: 'uppercase' }}>
                  {lang === 'TE' ? 'సులభ మార్గదర్శకత్వం' : (lang === 'HI' ? 'सहज मार्गदर्शन' : 'Simple Visual Steps')}
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#78350F' }}>
                  {lang === 'TE' 
                    ? 'మీకు కావలసిన పనిని క్రింద ఉన్న బొమ్మపై నొక్కండి — ఆడియో స్వయంగా వినబడుతుంది!'
                    : (lang === 'HI'
                      ? 'अपनी आवश्यकता वाले चित्र पर क्लिक करें — आवाज अपने आप सुनाई देगी!'
                      : 'Tap on what you want to do — hear the audio guidance instantly!')}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handlePlaySchemeSpeech(currentScheme)}
              style={{
                backgroundColor: isSpeaking ? '#DC2626' : '#B45309',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '0.45rem 0.95rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Volume2 size={16} />
              <span>{lang === 'TE' ? 'ఈ పథకం వినండి' : (lang === 'HI' ? 'यह योजना सुनें' : 'Listen')}</span>
            </button>
          </div>

          {/* Pictorial Grid of Schemes */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {lang === 'TE' ? '1. మీ ఉపాధి లేదా అవసరాన్ని ఎంచుకోండి:' : (lang === 'HI' ? '1. अपनी जरूरत या काम चुनें:' : '1. Select Your Requirement:')}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.85rem'
            }}>
              {schemes.map((s) => {
                const isSelected = selectedSchemeId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedSchemeId(s.id);
                      if (isSpeaking) stop();
                    }}
                    style={{
                      padding: '1rem',
                      borderRadius: '18px',
                      backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                      border: `2.5px solid ${isSelected ? '#2563EB' : '#E2E8F0'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 8px 20px rgba(37, 99, 235, 0.15)' : '0 2px 5px rgba(0,0,0,0.03)',
                      transform: isSelected ? 'scale(1.02)' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '2.5rem' }}>{s.icon}</span>
                        {isSelected && (
                          <span style={{
                            backgroundColor: '#2563EB',
                            color: '#FFFFFF',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Check size={15} />
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.3, marginBottom: '0.25rem' }}>
                        {getSchemeTitle(s)}
                      </div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#2563EB' }}>
                        {s.category}
                      </div>
                    </div>

                    <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669' }}>
                        ₹{(s.govtShare / 100000).toFixed(2)}L Govt Loan
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSchemeId(s.id);
                          handlePlaySchemeSpeech(s);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#B45309',
                          cursor: 'pointer',
                          padding: '0.2rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Listen to this scheme"
                      >
                        <Volume2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual 90% Govt vs 10% Beneficiary Money Split Display */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            border: '1.5px solid #CBD5E1',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  {lang === 'TE' ? '2. నిధుల పంపిణీ (ప్రభుత్వ 90% సహాయం)' : (lang === 'HI' ? '2. सरकारी सहायता (९०% ऋण)' : '2. Concessional Funding Breakdown (90% Govt Coverage)')}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', marginTop: '0.15rem' }}>
                  {getSchemeTitle(currentScheme)}
                </div>
              </div>

              <div style={{
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                padding: '0.35rem 0.85rem',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 800
              }}>
                {lang === 'TE' ? `వడ్డీ: ${currentScheme.interestRate}` : (lang === 'HI' ? `ब्याज: ${currentScheme.interestRate}` : `Interest: ${currentScheme.interestRate}`)}
              </div>
            </div>

            {/* Split Graphic Bar */}
            <div>
              <div style={{
                height: '32px',
                borderRadius: '10px',
                display: 'flex',
                overflow: 'hidden',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: '90%',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 900
                }}>
                  {lang === 'TE' ? 'ప్రభుత్వ వాటా (90%)' : (lang === 'HI' ? 'सरकार देगी (९०%)' : 'Govt Share (90%)')}
                </div>
                <div style={{
                  width: '10%',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 900
                }}>
                  10%
                </div>
              </div>

              {/* Exact Amounts */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.55rem', fontSize: '0.88rem' }}>
                <div style={{ color: '#065F46', fontWeight: 800 }}>
                  🟩 {lang === 'TE' ? 'ప్రభుత్వ సహాయం:' : (lang === 'HI' ? 'सरकारी ऋण:' : 'Government Loan:')}{' '}
                  <span style={{ fontSize: '1.05rem', color: '#059669' }}>₹{currentScheme.govtShare.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ color: '#1E40AF', fontWeight: 800 }}>
                  🟦 {lang === 'TE' ? 'మీ వాటా:' : (lang === 'HI' ? 'आपका अंश:' : 'Your Share:')}{' '}
                  <span style={{ fontSize: '1.05rem', color: '#2563EB' }}>₹{currentScheme.userShare.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {currentScheme.monthlyEmi > 0 && (
                <div style={{ marginTop: '0.5rem', backgroundColor: '#F0FDF4', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #BBF7D0', fontSize: '0.82rem', color: '#166534', fontWeight: 700 }}>
                  🪙 {lang === 'TE' ? `నెలకు సుమారు కిస్తు: ₹${currentScheme.monthlyEmi.toLocaleString('en-IN')}` : (lang === 'HI' ? `मासिक अनुमानित किस्त: ₹${currentScheme.monthlyEmi.toLocaleString('en-IN')}` : `Estimated Monthly Return (EMI): ₹${currentScheme.monthlyEmi.toLocaleString('en-IN')}`)}
                </div>
              )}
            </div>
          </div>

          {/* Nearest Assistance Center / Channel Partner Card */}
          {nearestPartner && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '2px solid #059669',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 6px 18px rgba(5, 150, 105, 0.12)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 900, backgroundColor: '#059669', color: '#FFFFFF', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                      {nearestPartner.type}
                    </span>
                    {partnerOpen && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: partnerOpen.color, backgroundColor: partnerOpen.badgeBg, padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                        ● {partnerOpen.statusText}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0B192C', margin: '0.2rem 0' }}>
                    {nearestPartner.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handlePlayPartnerSpeech}
                  style={{
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    border: '1.5px solid #FCD34D',
                    borderRadius: '10px',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Volume2 size={16} />
                  <span>{lang === 'TE' ? 'దారి వినండి' : (lang === 'HI' ? 'रास्ता सुनें' : 'Listen Route')}</span>
                </button>
              </div>

              {/* Landmark Callout */}
              <div style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem'
              }}>
                <MapPin size={20} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#92400E', textTransform: 'uppercase' }}>
                    {lang === 'TE' ? 'ప్రధాన గుర్తు (ల్యాండ్‌మార్క్)' : (lang === 'HI' ? 'पहचान / लैंडमार्क' : 'Landmark & Location')}
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#78350F', marginTop: '0.15rem' }}>
                    {lang === 'TE' && nearestPartner.landmarkTe ? nearestPartner.landmarkTe : (nearestPartner.landmark || nearestPartner.address)}
                  </div>
                  {nearestPartner.transitAdvice && (
                    <div style={{ fontSize: '0.8rem', color: '#B45309', marginTop: '0.25rem' }}>
                      🚌 {nearestPartner.transitAdvice}
                    </div>
                  )}
                </div>
              </div>

              {/* 1-Tap Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {/* 1-Tap Call */}
                {nearestPartner.phone && (
                  <a
                    href={`tel:${nearestPartner.phone.replace(/[^+\d]/g, '')}`}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '12px',
                      backgroundColor: '#16A34A',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      fontWeight: 900,
                      fontSize: '0.92rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                    }}
                  >
                    <PhoneCall size={18} />
                    <span>{lang === 'TE' ? 'అధికారికి ఫోన్ చేయండి' : (lang === 'HI' ? 'अधिकारी को फोन करें' : 'Call Officer')}</span>
                  </a>
                )}

                {/* 1-Tap Walking Navigation */}
                <button
                  type="button"
                  onClick={() => openDirectionsInMaps(nearestPartner, location, 'walking')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    color: '#0369A1',
                    border: '2px solid #BAE6FD',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <Footprints size={18} />
                  <span>{lang === 'TE' ? 'నడక దారి (Google Maps)' : (lang === 'HI' ? 'पैदल रास्ता' : 'Walk Route')}</span>
                </button>

                {/* 1-Tap Driving Navigation */}
                <button
                  type="button"
                  onClick={() => openDirectionsInMaps(nearestPartner, location, 'driving')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <Navigation size={18} />
                  <span>{lang === 'TE' ? 'వాహనం దారి (Maps)' : (lang === 'HI' ? 'गाड़ी का रास्ता' : 'Drive Route')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Assisted Seva Request Box */}
          <div style={{
            backgroundColor: '#F0FDF4',
            borderRadius: '16px',
            border: '1.5px dashed #86EFAC',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <HeartHandshake size={24} style={{ color: '#059669', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#064E3B' }}>
                  {lang === 'TE' ? 'చదవడంలో లేదా వెళ్లడంలో ఇబ్బందా? వాలంటీర్ సహాయం పొందండి' : (lang === 'HI' ? 'पढ़ने या जाने में कठिनाई? सहायक से बात करें' : 'Need In-Person Help? Request a Volunteer Call')}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '0.15rem' }}>
                  {lang === 'TE' ? 'గ్రామీణ సేవక్ మీకు నేరుగా ఫోన్ చేసి బ్యాంకుకు తీసుకెళ్లే మార్గాన్ని వివరిస్తారు.' : 'Local VLE Sahayak will call you back to assist in visiting.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRequestHelpOpen(true)}
              style={{
                backgroundColor: '#059669',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '0.55rem 1.15rem',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)'
              }}
            >
              <PhoneCall size={15} />
              <span>{lang === 'TE' ? 'నాకు సహాయం చేయండి' : (lang === 'HI' ? 'मुझे सहायता चाहिए' : 'Request Sahayak')}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
            {lang === 'TE' ? 'భారత ప్రభుత్వ సామాజిక న్యాయం & సాధికారత మంత్రిత్వ శాఖ మార్గదర్శకాలు' : 'MoSJE & NSFDC Concessional Welfare Lending Guidelines'}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.45rem 1.25rem',
              borderRadius: '10px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {lang === 'TE' ? 'పూర్తయింది (Close)' : (lang === 'HI' ? 'बंद करें (Close)' : 'Done')}
          </button>
        </div>

        {/* Help Callback Dialog */}
        {requestHelpOpen && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            zIndex: 100010
          }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '1.75rem',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1.5px solid #CBD5E1'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <HeartHandshake size={20} style={{ color: '#059669' }} />
                  {lang === 'TE' ? 'సహాయక్ కాల్ అభ్యర్థన' : (lang === 'HI' ? 'सहायक कॉल अनुरोध' : 'Gramin Sahayak Assistance')}
                </h3>
                <button
                  type="button"
                  onClick={() => setRequestHelpOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={20} />
                </button>
              </div>

              {helpSubmitted ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <CheckCircle2 size={48} style={{ color: '#059669', margin: '0 auto 0.75rem' }} />
                  <h4 style={{ fontSize: '1.1rem', color: '#065F46', fontWeight: 800, margin: '0 0 0.35rem' }}>
                    {lang === 'TE' ? 'ధన్యవాదాలు! అభ్యర్థన నమోదైంది' : (lang === 'HI' ? 'धन्यवाद! अनुरोध दर्ज हुआ' : 'Request Received!')}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>
                    {lang === 'TE' 
                      ? 'మా గ్రామీణ సంక్షేమ మిత్రుడు 2 గంటల్లో మీకు ఫోన్ చేసి సహాయం చేస్తారు.' 
                      : 'Our local field officer will call you within 2 hours to guide you.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleHelpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontSize: '0.86rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                    {lang === 'TE'
                      ? 'మీ ఫోన్ నంబర్ ఇవ్వండి, అధికారి మీకు ఫోన్ చేసి పథకం వివరాలు మరియు బ్యాంక్ చిరునామా చెప్తారు.'
                      : (lang === 'HI'
                        ? 'अपना फोन नंबर दर्ज करें, अधिकारी आपको कॉल करके पूरी जानकारी देंगे।'
                        : 'Enter your phone number. A local volunteer will call to explain the scheme and guide you.')}
                  </p>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                      {lang === 'TE' ? 'మొబైల్ నంబర్' : (lang === 'HI' ? 'मोबाइल नंबर' : 'Phone Number')}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={helpPhone}
                      onChange={(e) => setHelpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '1.15rem',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        letterSpacing: '0.1em',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setRequestHelpOpen(false)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#F8FAFC',
                        color: '#475569',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {lang === 'TE' ? 'రద్దు' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={helpPhone.length < 10}
                      style={{
                        flex: 2,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: helpPhone.length === 10 ? '#059669' : '#94A3B8',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        cursor: helpPhone.length === 10 ? 'pointer' : 'not-allowed',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                      }}
                    >
                      {lang === 'TE' ? 'కాల్ చేయమనండి' : (lang === 'HI' ? 'कॉल करवाएं' : 'Submit')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
