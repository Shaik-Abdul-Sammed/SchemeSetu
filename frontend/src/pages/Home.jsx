import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, Sparkles, Building2, ShieldCheck, ArrowRight, 
  Users, IndianRupee, Radio, Navigation, TrendingUp, 
  ChevronRight, Star, Clock, Zap
} from 'lucide-react';
import { schemeService } from '../services/schemeService';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import SnapchatLocationPicker from '../components/location/SnapchatLocationPicker';
import SchemeCard from '../components/scheme/SchemeCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import SearchAutocomplete from '../components/common/SearchAutocomplete';
import VoiceSearchButton from '../components/common/VoiceSearchButton';
import RecentlyViewed from '../components/common/RecentlyViewed';

const STATS = [
  {
    icon: Building2, value: '500+', label: 'Welfare Schemes',
    color: '#1D4ED8', bg: '#EFF6FF', accent: '#3B82F6'
  },
  {
    icon: Users, value: '10M+', label: 'Citizens Benefited',
    color: '#047857', bg: '#ECFDF5', accent: '#10B981'
  },
  {
    icon: IndianRupee, value: '₹50K Cr+', label: 'Direct Benefit Transfer',
    color: '#D97706', bg: '#FEF3C7', accent: '#F59E0B'
  },
  {
    icon: ShieldCheck, value: '100%', label: 'Verified Official Links',
    color: '#7E22CE', bg: '#F5F3FF', accent: '#A855F7'
  }
];

const QUICK_CATEGORIES = [
  { icon: '🌾', label: 'Agriculture', to: '/schemes?category=agriculture', color: '#16A34A' },
  { icon: '🏭', label: 'Manufacturing', to: '/schemes?category=manufacturing', color: '#2563EB' },
  { icon: '👩', label: 'Women', to: '/schemes?gender=Female', color: '#DB2777' },
  { icon: '🎓', label: 'Education', to: '/schemes?category=education', color: '#7C3AED' },
  { icon: '🏥', label: 'Healthcare', to: '/schemes?category=health', color: '#DC2626' },
  { icon: '💡', label: 'Startup', to: '/schemes?category=startup', color: '#D97706' },
];

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { location, nearbyPartners } = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await schemeService.getSchemes({ limit: 3 });
        setFeaturedSchemes(res.data || res.schemes || []);
      } catch (err) {
        console.error('Error loading featured schemes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(searchTerm.trim() ? `/schemes?q=${encodeURIComponent(searchTerm.trim())}` : '/schemes');
  };

  return (
    <div>
      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="hero-section" aria-labelledby="hero-heading">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>

            {/* Badge */}
            <div className="hero-badge" role="note">
              <ShieldCheck size={16} aria-hidden="true" />
              {t('officialPortalBadge', 'Official Citizen Welfare Discovery Portal')}
            </div>

            {/* Title */}
            <h1 id="hero-heading" className="hero-title">
              {t('heroTitlePre', 'Find Government Schemes')}{' '}
              <span className="highlight">{t('heroTitleHighlight', 'You\'re Eligible For')}</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle">
              {t('heroSubtitle', 'SchemeSetu simplifies welfare and business loan discovery across 500+ Central and State Government schemes — in 8 Indian languages.')}
            </p>

            {/* Location Radar */}
            <div className="location-radar" role="region" aria-label="Location radar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', textAlign: 'left' }}>
                <Radio size={20} style={{ color: '#38BDF8', flexShrink: 0 }} aria-hidden="true" />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                    📍 {location.district || location.state}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                    {nearbyPartners.length} {t('nearbyBanks', 'nearby bank branches & CSC partners')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setLocationModalOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ color: '#38BDF8', borderColor: 'rgba(56,189,248,0.3)', fontSize: '0.8rem' }}
                aria-label="Set up location radar to find nearby partners"
              >
                <Navigation size={14} aria-hidden="true" />
                {t('setupLocationRadar', 'Setup Radar')}
              </button>
            </div>

            {/* Search */}
            <form
              onSubmit={handleSearchSubmit}
              role="search"
              aria-label="Search government schemes"
              style={{ maxWidth: '700px', margin: '0 auto 2rem' }}
            >
              <div className="search-bar">
                <Search size={18} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0, marginLeft: '0.25rem' }} aria-hidden="true" />
                <div style={{ flex: 1 }}>
                  <SearchAutocomplete
                    value={searchTerm}
                    onChange={(val) => setSearchTerm(val)}
                    onSelect={(scheme) => navigate(`/schemes/${scheme.id}`)}
                    placeholder={t('searchPlaceholder', 'Search schemes, occupations, categories...')}
                  />
                </div>
                <VoiceSearchButton onResult={(text) => setSearchTerm(text)} />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ borderRadius: '10px', padding: '0.6rem 1.4rem' }}
                  aria-label="Search schemes"
                >
                  {t('searchCriteria', 'Search')}
                </button>
              </div>
            </form>

            {/* CTAs */}
            <div className="hero-ctas" role="group" aria-label="Primary actions">
              <Link to="/eligibility" className="btn btn-primary btn-lg" id="find-schemes-cta">
                <Sparkles size={18} aria-hidden="true" />
                {t('findMySchemes', 'Find My Schemes')}
              </Link>
              <Link to="/schemes" className="btn btn-secondary btn-lg" id="explore-schemes-cta">
                <Building2 size={18} aria-hidden="true" />
                {t('exploreAllSchemes', 'Explore All Schemes')}
              </Link>
              <Link to="/input-hub" className="btn btn-secondary btn-lg" id="chat-ai-cta">
                <Zap size={18} aria-hidden="true" />
                {t('chatWithAI', 'Chat with AI')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ─────────────────────────────────────────────────────── */}
      <section className="stats-overlap" aria-label="Platform statistics">
        <div className="container">
          <div className="grid-4 stagger-children">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="stat-card"
                style={{ '--stat-accent': stat.accent }}
              >
                <div
                  className="stat-icon"
                  style={{ backgroundColor: stat.bg, color: stat.color }}
                  aria-hidden="true"
                >
                  <stat.icon size={24} />
                </div>
                <div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{t(`stat_${stat.label.replace(/\s/g,'_')}`, stat.label)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUICK CATEGORIES ──────────────────────────────────────────────── */}
      <section style={{ padding: '3.5rem 0 1rem' }} aria-label="Browse by category">
        <div className="container">
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="section-label">
              <TrendingUp size={14} aria-hidden="true" /> {t('browseCategory', 'Browse by Category')}
            </div>
            <h2 className="section-title" style={{ fontSize: '1.75rem' }}>
              {t('quickCategories', 'What are you looking for?')}
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '1rem'
            }}
            role="list"
            aria-label="Scheme categories"
          >
            {QUICK_CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                to={cat.to}
                role="listitem"
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '0.65rem', padding: '1.5rem 1rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none', color: 'var(--text-primary)',
                  transition: 'all 250ms cubic-bezier(0, 0, 0.2, 1)',
                  boxShadow: 'var(--shadow-sm)',
                  fontWeight: 600, fontSize: '0.9rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.borderColor = cat.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
                aria-label={`Browse ${cat.label} schemes`}
              >
                <span style={{ fontSize: '2rem', lineHeight: 1 }} aria-hidden="true">{cat.icon}</span>
                <span>{cat.label}</span>
                <ChevronRight size={14} style={{ color: cat.color, opacity: 0.7 }} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED SCHEMES ──────────────────────────────────────────────── */}
      <section style={{ padding: '3rem 0 4rem' }} aria-labelledby="featured-heading">
        <div className="container">
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-end', marginBottom: '2rem',
            flexWrap: 'wrap', gap: '1rem'
          }}>
            <div>
              <div className="section-label">
                <Star size={14} aria-hidden="true" /> {t('featuredLabel', 'Top Picks')}
              </div>
              <h2 id="featured-heading" className="section-title">
                {t('featuredTitle', 'Featured National Schemes')}
              </h2>
              <p className="section-subtitle" style={{ marginTop: '0.4rem' }}>
                {t('featuredSub', 'Popular Central and State schemes empowering entrepreneurs and citizens.')}
              </p>
            </div>
            <Link to="/schemes" className="btn btn-outline" style={{ flexShrink: 0 }}>
              {t('viewAllSchemesCTA', 'View All')} <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div className="grid-3 stagger-children">
              {featuredSchemes.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>
          )}

          {/* Recently Viewed */}
          <div style={{ marginTop: '3.5rem' }}>
            <div className="section-label" style={{ marginBottom: '1rem' }}>
              <Clock size={14} aria-hidden="true" /> {t('recentlyViewedLabel', 'Recently Viewed')}
            </div>
            <RecentlyViewed />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section
        style={{ padding: '4rem 0', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}
        aria-labelledby="how-it-works-heading"
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="section-label" style={{ display: 'inline-flex' }}>
              <Sparkles size={14} aria-hidden="true" /> {t('howLabel', 'Simple Process')}
            </div>
            <h2 id="how-it-works-heading" className="section-title" style={{ marginTop: '0.5rem' }}>
              {t('howTitle', 'How SchemeSetu Works')}
            </h2>
          </div>
          <div className="grid-3 stagger-children">
            {[
              { step: '01', icon: '🎙️', title: t('step1Title', 'Tell Us About You'), desc: t('step1Desc', 'Speak, type, or scan documents. Share your occupation, income, and goals in your language.') },
              { step: '02', icon: '🤖', title: t('step2Title', 'AI Finds Matches'), desc: t('step2Desc', 'Our neuro-symbolic AI evaluates 500+ schemes and ranks the ones you\'re most likely to benefit from.') },
              { step: '03', icon: '✅', title: t('step3Title', 'Apply with Guidance'), desc: t('step3Desc', 'Get step-by-step guidance, document checklist, partner locations, and even EMI calculations.') },
            ].map((item) => (
              <div key={item.step} className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: 1 }} aria-hidden="true">{item.icon}</div>
                <div style={{
                  display: 'inline-block', background: 'var(--gold-500)',
                  color: '#fff', fontSize: '0.7rem', fontWeight: 800,
                  padding: '0.2rem 0.6rem', borderRadius: '4px',
                  letterSpacing: '0.08em', marginBottom: '0.75rem'
                }} aria-label={`Step ${item.step}`}>STEP {item.step}</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.6rem', color: 'var(--text-primary)' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOBILE APP DOWNLOAD ──────────────────────────────────────────── */}
      <section className="app-download-section" aria-labelledby="app-download-heading">
        <div className="container">
          <div className="app-download-card">
            {/* Text */}
            <div className="app-download-text">
              <div className="app-download-badge">{t('mobileAppBadge', 'Now Available on Mobile')}</div>
              <h2 id="app-download-heading" className="app-download-heading">
                {t('mobileAppHeading', 'Take SchemeSetu Everywhere')}
              </h2>
              <p className="app-download-sub">
                {t('mobileAppSub', 'Access 500+ government schemes, track applications, and get AI-powered guidance — right from your phone. Available in 8 Indian languages.')}
              </p>
              <div className="app-download-buttons">
                <a href="#" className="app-store-btn" aria-label="Download SchemeSetu on Google Play" onClick={(e) => e.preventDefault()}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3.18 23.76c.37.21.8.22 1.18.03l12.64-7.04-2.79-2.79-11.03 9.8zm-1.05-20.4A1.5 1.5 0 0 0 2 4.5v15c0 .48.23.9.6 1.17l.08.06 8.4-8.4v-.2L2.13 3.36zm18.12 8.38-2.72-1.52-3.08 3.08 3.08 3.09 2.74-1.53a1.54 1.54 0 0 0 0-2.62v-.5zm-16.4-9.4L15.21 9.8l-2.79 2.79L.37 2.24C.74.96 1.87.25 3.85 2.34z"/>
                  </svg>
                  <div className="app-store-btn-text">
                    <span className="app-store-label">{t('getItOn', 'GET IT ON')}</span>
                    <span className="app-store-name">Google Play</span>
                  </div>
                </a>
                <a href="#" className="app-store-btn" aria-label="Download SchemeSetu on the App Store" onClick={(e) => e.preventDefault()}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.19 1.28-2.17 3.82.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.36 2.76M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="app-store-btn-text">
                    <span className="app-store-label">{t('downloadOn', 'DOWNLOAD ON THE')}</span>
                    <span className="app-store-name">App Store</span>
                  </div>
                </a>
              </div>
              <p className="app-download-note" aria-label="Free, no ads, works offline, all 8 Indian languages">
                🔒 {t('mobileAppNote', 'Free forever · No ads · Works offline · All 8 Indian languages')}
              </p>
            </div>

            {/* Phone Mockup */}
            <div className="app-download-visual" aria-hidden="true">
              <div className="phone-mockup" role="img" aria-label="SchemeSetu mobile app preview">
                <div className="phone-screen">
                  <div className="phone-screen-header">
                    <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#fff' }}>SchemeSetu</span>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[1,2,3].map(i => <div key={i} className="phone-screen-header-dot" />)}
                    </div>
                  </div>
                  <div style={{ padding: '0.4rem' }}>
                    {['PM Mudra Yojana', 'Stand Up India', 'PMEGP Scheme'].map((s) => (
                      <div key={s} className="phone-scheme-item">
                        <div className="phone-scheme-dot" />
                        <span style={{ fontSize: '0.54rem', color: '#1e3e62', fontWeight: 600 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div className="phone-cta-bar">
                    <span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#fff' }}>Check Eligibility →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Snapchat Location Modal */}
      <SnapchatLocationPicker
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </div>
  );
}
