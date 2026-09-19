import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  IndianRupee, 
  MapPin, 
  Mic, 
  Calculator, 
  FileCheck, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  HelpCircle,
  Briefcase,
  GraduationCap,
  Scale
} from 'lucide-react';
import { schemeService } from '../services/schemeService';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import SchemeCard from '../components/scheme/SchemeCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function Home({ onOpenVoiceAssistant }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { location } = useLocation();

  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await schemeService.getSchemes({ limit: 4 });
        setFeaturedSchemes(res.data || []);
      } catch (err) {
        console.error('Error loading schemes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const actionCards = [
    {
      title: t('checkEligibility', 'Check Eligibility'),
      desc: t('card1Desc', 'Instant rule-based eligibility evaluation for SC beneficiaries'),
      icon: Sparkles,
      color: '#059669',
      bg: 'rgba(5, 150, 105, 0.12)',
      border: '#A7F3D0',
      to: '/eligibility',
      primary: true
    },
    {
      title: t('exploreSchemes', 'Find a Scheme'),
      desc: t('card2Desc', 'Explore concessional credit, term loans, & education grants'),
      icon: Building2,
      color: '#2563EB',
      bg: 'rgba(37, 99, 235, 0.12)',
      border: '#BFDBFE',
      to: '/schemes'
    },
    {
      title: t('calculator', 'Calculate EMI'),
      desc: t('card3Desc', 'Model reducing interest, tenure, & grace period moratorium'),
      icon: Calculator,
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.12)',
      border: '#DDD6FE',
      to: '/results'
    },
    {
      title: t('partners', 'Assistance Locator'),
      desc: t('card4Desc', 'Locate nearest CSC Seva Kendra & lead district bank branch'),
      icon: MapPin,
      color: '#D97706',
      bg: 'rgba(217, 119, 6, 0.12)',
      border: '#FDE68A',
      to: '/locations'
    }
  ];

  const workflowSteps = [
    { step: '1', title: t('workflowStep1Title', 'Tell us about yourself'), desc: t('workflowStep1Desc', 'Category, income, age, & project requirement') },
    { step: '2', title: t('workflowStep2Title', 'Evaluate schemes'), desc: t('workflowStep2Desc', 'Deterministic matching against MoSJE criteria') },
    { step: '3', title: t('workflowStep3Title', 'Check eligibility'), desc: t('workflowStep3Desc', 'Transparent breakdown of eligibility score & rules') },
    { step: '4', title: t('workflowStep4Title', 'Channel Partner Desk'), desc: t('workflowStep4Desc', 'Route to nearest SCA, PSB, or RRB branch') },
    { step: '5', title: t('workflowStep5Title', 'Track Application'), desc: t('workflowStep5Desc', 'Real-time status updates & document verification') }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      
      {/* 1. MOBILE HERO HEADER & GREETING */}
      <section style={{ 
        backgroundColor: '#0F172A', 
        color: '#FFFFFF', 
        padding: '2.25rem 1.25rem 2.5rem', 
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
        borderBottom: '1px solid #1E293B'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            padding: '0.3rem 0.75rem', 
            borderRadius: '20px', 
            backgroundColor: 'rgba(16, 185, 129, 0.15)', 
            color: '#34D399', 
            fontSize: '0.78rem',
            fontWeight: 700,
            marginBottom: '0.85rem',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <ShieldCheck size={14} /> {t('officialPortalBadge', 'Official Citizen Scheme Discovery Portal')}
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 0.5rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            {t('heroTitle', 'Find financial schemes that fit your needs.')}
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.92rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            {t('heroSubtitle', 'Concessional credit assistance, term loans, education support, & margin subsidies for SC entrepreneurs & citizens up to ₹5.00L annual income.')}
          </p>

          {/* Location Bar Pill */}
          {location && (location.district || location.state) && (
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.8rem', 
              color: '#CBD5E1', 
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: '0.35rem 0.75rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.12)'
            }}>
              <MapPin size={14} style={{ color: '#F59E0B' }} />
              <span>{t('locationLabel', 'Location:')} <strong>{location.district || location.state}</strong></span>
            </div>
          )}
        </div>
      </section>

      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* 2. PRIMARY ACTION CARDS GRID */}
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {actionCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(card.to)}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    backgroundColor: card.primary ? '#ECFDF5' : '#FFFFFF',
                    borderRadius: '16px',
                    border: `1.5px solid ${card.primary ? '#059669' : '#E2E8F0'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    boxShadow: card.primary ? '0 4px 12px rgba(5, 150, 105, 0.15)' : '0 2px 4px rgba(0,0,0,0.03)'
                  }}
                >
                  <div>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: card.bg,
                      color: card.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.85rem'
                    }}>
                      <Icon size={22} />
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>
                      {card.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                      {card.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: card.color, fontWeight: 700, fontSize: '0.82rem' }}>
                    <span>{t('getStarted', 'Get Started')}</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. HOW SCHEMESETU WORKS */}
        <section className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('guidedWorkflow', 'Guided Workflow')}</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0 0' }}>{t('howItWorks', 'How SchemeSetu Works')}</h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {workflowSteps.map((ws, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  backgroundColor: '#0F172A', 
                  color: '#F59E0B', 
                  fontWeight: 900, 
                  fontSize: '0.88rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0 
                }}>
                  {ws.step}
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{ws.title}</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.15rem', lineHeight: 1.3 }}>{ws.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. POPULAR RELEVANT SCHEMES */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{t('featuredTitle', 'Featured Schemes')}</h2>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{t('featuredSub', 'Verified MoSJE & NSFDC Concessional Credit Schemes')}</span>
            </div>
            <Link to="/schemes" className="btn btn-outline btn-sm" style={{ fontSize: '0.8rem' }}>
              {t('viewAll', 'View All')} <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {featuredSchemes.map(scheme => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>
          )}
        </section>

        {/* 5. AI VOICE ASSISTANT QUICK PROMPT BANNER */}
        <section className="card" style={{ 
          padding: '1.25rem 1.5rem', 
          backgroundColor: '#0F172A', 
          color: '#FFFFFF', 
          borderRadius: '16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#F59E0B', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mic size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>{t('voiceTitle', 'Ask SchemeSetu Voice AI')}</div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.15rem' }}>{t('voiceSubtitle', 'Speak in Hindi, Telugu, Tamil, English, Gondi, or Chenchu')}</div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onOpenVoiceAssistant}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem' }}
          >
            <Mic size={16} /> {t('speakQueryNow', 'Speak Query Now')}
          </button>
        </section>

      </div>
    </div>
  );
}
