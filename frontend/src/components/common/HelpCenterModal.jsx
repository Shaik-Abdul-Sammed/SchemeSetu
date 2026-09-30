import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Mic, 
  Globe, 
  Sparkles, 
  Compass, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Calculator, 
  PhoneCall, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import useTextToSpeech from '../../hooks/useTextToSpeech';

export default function HelpCenterModal({ isOpen, onClose, onStartTour }) {
  const { lang, t } = useLanguage();
  const { speak, stop, isSpeaking } = useTextToSpeech({ lang });
  const [activeTab, setActiveTab] = useState('voice');

  if (!isOpen) return null;

  const handleSpeak = (text) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  const tabs = [
    { id: 'voice', icon: <Mic size={16} />, label: lang === 'te' ? 'వాయిస్ గైడ్' : (lang === 'hi' ? 'आवाज सहायता' : 'Voice Assistant') },
    { id: 'multilingual', icon: <Globe size={16} />, label: lang === 'te' ? 'బహుళ భాషలు' : (lang === 'hi' ? 'भाषा समर्थन' : 'Multilingual & Dialects') },
    { id: 'sahaj', icon: <span>🎨</span>, label: lang === 'te' ? 'సహజ్ మోడ్' : (lang === 'hi' ? 'सहज मोड' : 'Sahaj Tribal Mode') },
    { id: 'locator', icon: <MapPin size={16} />, label: lang === 'te' ? 'బ్యాంక్ రూటింగ్' : (lang === 'hi' ? 'बैंक लोकेटर' : 'Partner Locator') },
    { id: 'calculator', icon: <Calculator size={16} />, label: lang === 'te' ? 'రుణ లెక్కలు' : (lang === 'hi' ? 'ऋण कैलकुलेटर' : 'Concessional Loans') },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 12, 27, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '820px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0'
        }}
      >
        {/* Header */}
        <div style={{
          backgroundColor: '#0B192C',
          color: '#FFFFFF',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1E2D45'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#F59E0B', color: '#0B192C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HelpCircle size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                {lang === 'te' ? 'స్కీమ్‌సేతు సహాయ కేంద్రం & గైడ్' : (lang === 'hi' ? 'स्कीमसेतु सहायता केंद्र व मार्गदर्शिका' : 'SchemeSetu Help & User Guide')}
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '0.15rem 0 0' }}>
                Voice-first, multilingual, and low-literacy assistance instructions
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => { onClose(); if (onStartTour) onStartTour(); }}
              className="btn btn-sm"
              style={{
                backgroundColor: '#F59E0B',
                color: '#0F172A',
                fontWeight: 800,
                fontSize: '0.78rem',
                borderRadius: '12px',
                padding: '0.4rem 0.8rem',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
            >
              <Sparkles size={14} /> Start Interactive Tour
            </button>
            <button
              onClick={() => { stop(); onClose(); }}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.35rem' }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Pills */}
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          padding: '0.75rem 1.25rem',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { stop(); setActiveTab(tab.id); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 800 : 600,
                  backgroundColor: isActive ? '#0B192C' : '#FFFFFF',
                  color: isActive ? '#FCD34D' : '#475569',
                  border: isActive ? '1px solid #0B192C' : '1px solid #CBD5E1',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1, color: '#1E293B' }}>
          
          {/* TAB 1: VOICE ASSISTANT */}
          {activeTab === 'voice' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0B192C', margin: 0 }}>
                    🎙️ How to Use the AI Voice Assistant
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                    Speak naturally in your mother tongue without typing.
                  </p>
                </div>
                <button
                  onClick={() => handleSpeak("You can use SchemeSetu completely through voice. Tap the microphone icon in the top navbar or on any screen. Speak in Telugu, Hindi, English, Gondi, Tamil, or Kannada. The assistant automatically recognizes your dialect and responds in clear spoken audio.")}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#059669', borderColor: '#A7F3D0' }}
                >
                  {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{isSpeaking ? 'Stop Voice' : 'Listen'}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', marginBottom: '0.35rem' }}>1. Tap Microphone</div>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                    Click the microphone button in the top navbar or floating bottom button to activate listening.
                  </p>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', marginBottom: '0.35rem' }}>2. Speak Any Query</div>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                    Ask about loans, grocery shops, cattle, tractors, interest rates, or nearest bank branches.
                  </p>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', marginBottom: '0.35rem' }}>3. Auto Language Reply</div>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                    The system detects whether you spoke in Telugu, Hindi, or English and responds in your language.
                  </p>
                </div>
              </div>

              <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '1rem 1.25rem', borderRadius: '14px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#065F46', marginBottom: '0.5rem' }}>
                  🗣️ Example Voice Queries You Can Try:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.84rem', color: '#047857', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li><strong>Telugu:</strong> "నాకు పాడి గేదెల కోసం లోన్ కావాలి, ఎంత వడ్డీ?"</li>
                  <li><strong>Hindi:</strong> "किराना दुकान शुरू करने के लिए 1.4 लाख का रियायती ऋण कैसे मिलेगा?"</li>
                  <li><strong>English:</strong> "Find the nearest channelizing bank for an education loan."</li>
                  <li><strong>Gondi / Bhili:</strong> "ढोर-डांगर व दूध डेयरी योजना बारे जानकारी।"</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: MULTILINGUAL */}
          {activeTab === 'multilingual' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0B192C', margin: 0 }}>
                    🌐 Multilingual & Regional Dialect Support
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                    SchemeSetu supports 10+ major Indian languages and tribal dialects.
                  </p>
                </div>
                <button
                  onClick={() => handleSpeak("SchemeSetu supports 10 languages including Telugu, Hindi, English, Tamil, Kannada, Marathi, and tribal dialects like Gondi and Bhili. You can switch languages anytime using the globe icon in the top navbar.")}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#059669', borderColor: '#A7F3D0' }}
                >
                  {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{isSpeaking ? 'Stop Voice' : 'Listen'}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem', marginBottom: '1.25rem' }}>
                {[
                  { name: 'Telugu', native: 'తెలుగు' },
                  { name: 'Hindi', native: 'हिंदी' },
                  { name: 'English', native: 'English' },
                  { name: 'Tamil', native: 'தமிழ்' },
                  { name: 'Kannada', native: 'ಕನ್ನಡ' },
                  { name: 'Marathi', native: 'मराठी' },
                  { name: 'Malayalam', native: 'മലയാളം' },
                  { name: 'Bengali', native: 'বাংলা' },
                  { name: 'Gondi', native: 'గోండీ / गोंडी' },
                  { name: 'Bhili', native: 'भीली' }
                ].map((l, i) => (
                  <div key={i} style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', padding: '0.65rem 0.85rem', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{l.native}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{l.name}</div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                ✨ <strong>Zero External Script Freezes:</strong> All translations use high-speed native reactive dictionaries, ensuring instantaneous screen updates and zero page flickering.
              </p>
            </div>
          )}

          {/* TAB 3: SAHAJ TRIBAL MODE */}
          {activeTab === 'sahaj' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0B192C', margin: 0 }}>
                    🎨 Sahaj Audio-Visual & Tribal Mode
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                    Tailored specifically for non-literate and rural tribal beneficiaries.
                  </p>
                </div>
                <button
                  onClick={() => handleSpeak("Sahaj mode provides large pictorial cards for cows, tractors, tailoring, and small stores. It includes 1-tap voice readouts and lets you request a village volunteer to come to your home or guide you to the nearest bank.")}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#059669', borderColor: '#A7F3D0' }}
                >
                  {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{isSpeaking ? 'Stop Voice' : 'Listen'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 800, color: '#92400E', fontSize: '0.92rem', marginBottom: '0.25rem' }}>
                    🖼️ 6 Pictorial Livelihood Categories
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#B45309', margin: 0 }}>
                    Select from Dairy Farming 🐄, Tractor & Agriculture 🚜, Tailoring 🧵, Kirana 🛒, Education 🎓, and Auto 🛺 with 1-tap audio narration.
                  </p>
                </div>

                <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 800, color: '#065F46', fontSize: '0.92rem', marginBottom: '0.25rem' }}>
                    📊 90% Govt vs 10% Citizen Money Graphic
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#047857', margin: 0 }}>
                    Visual colored money split showing that the government provides 90% at 6.5% concessional interest, and you only contribute 10% margin money.
                  </p>
                </div>

                <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 800, color: '#1E40AF', fontSize: '0.92rem', marginBottom: '0.25rem' }}>
                    🤝 Free "Sahayak" Doorstep Volunteer Assistance
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#1D4ED8', margin: 0 }}>
                    Enter your phone number and a trained local Seva Kendra volunteer will call you back to help you walk to the bank and fill paperwork.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PARTNER LOCATOR */}
          {activeTab === 'locator' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0B192C', margin: 0 }}>
                    📍 Channel Partner Routing & Landmark Directions
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                    Ensure applications reach eligible, low-NPA bank branches and SCAs.
                  </p>
                </div>
                <button
                  onClick={() => handleSpeak("Our locator automatically filters out high-NPA and locked branches. It gives you concrete landmark directions like Opposite Bus Stand, walking and auto travel times, real-time open status, and direct phone calling.")}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#059669', borderColor: '#A7F3D0' }}
                >
                  {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{isSpeaking ? 'Stop Voice' : 'Listen'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.86rem' }}>
                <div style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <strong>🏛️ Over 100 Channel Partners:</strong> State Channelizing Agencies (SCAs), Public Sector Banks (PSBs), Regional Rural Banks (RRBs), and NBFC-MFIs.
                </div>
                <div style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <strong>🛡️ High-NPA Filtering:</strong> Never sends applications to branches with high non-performing assets or overdue disbursement locks.
                </div>
                <div style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <strong>🚶 Landmark & Transit Advice:</strong> "Opposite Old RTC Bus Stand & Beside Mandal Revenue Office", with 1-tap Walking (`🚶 Walk`) and Driving (`🚗 Drive`) routes.
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0B192C', margin: 0 }}>
                    🧮 Concessional Financial Calculator Guidelines
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                    Understanding NSFDC loan brackets and moratorium grace periods.
                  </p>
                </div>
                <button
                  onClick={() => handleSpeak("Beneficiaries with family income up to 5 lakh rupees qualify for 90 percent concessional loans at 6.5 to 8 percent interest. During the moratorium period of 3 to 12 months, no principal repayment is required.")}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#059669', borderColor: '#A7F3D0' }}
                >
                  {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{isSpeaking ? 'Stop Voice' : 'Listen'}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065F46', textTransform: 'uppercase' }}>Micro Finance Scheme</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#047857' }}>Up to ₹1.40 Lakh</div>
                  <div style={{ fontSize: '0.78rem', color: '#059669' }}>6.5% interest • 3m Moratorium</div>
                </div>

                <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>Term Loan Scheme</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1D4ED8' }}>Up to ₹50.00 Lakh</div>
                  <div style={{ fontSize: '0.78rem', color: '#2563EB' }}>7.5% interest • 6-12m Moratorium</div>
                </div>

                <div style={{ backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B21A8', textTransform: 'uppercase' }}>Educational Loan</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7E22CE' }}>Up to ₹30.00 Lakh</div>
                  <div style={{ fontSize: '0.78rem', color: '#9333EA' }}>6.5% interest • 12m Post-Study</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.84rem', color: '#92400E' }}>
                💡 <strong>What is a Moratorium?</strong> It is a principal payment holiday. For the first 3 to 12 months, you do not pay principal EMI, allowing your shop, farm, or education to start producing income first!
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '0.85rem 1.5rem',
          backgroundColor: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
            SchemeSetu AI Support • Built for MoSJE & NSFDC Citizen Empowerment
          </span>

          <button
            onClick={() => { stop(); onClose(); }}
            className="btn btn-primary btn-sm"
            style={{ backgroundColor: '#0B192C', borderColor: '#0B192C' }}
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
