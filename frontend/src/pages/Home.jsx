import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  IndianRupee, 
  Radio,
  Navigation
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
        console.error("Error loading featured schemes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/schemes?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/schemes');
    }
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section style={{ backgroundColor: '#0B192C', color: '#FFFFFF', padding: '4rem 0 5rem 0', position: 'relative' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(217, 119, 6, 0.15)', color: '#F59E0B', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.88rem', fontWeight: 600, marginBottom: '1.25rem', border: '1px solid rgba(217, 119, 6, 0.3)' }}>
              <ShieldCheck size={18} /> {t('officialPortalBadge', 'Official Citizen Welfare Discovery Portal')}
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.15, marginBottom: '1.25rem' }}>
              {t('heroTitle', 'Find Government Schemes You Are Eligible For')}
            </h1>

            <p style={{ fontSize: '1.15rem', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '2rem' }}>
              {t('heroSubtitle', 'SchemeSetu simplifies welfare and business loan discovery across Central and State Governments.')}
            </p>

            {/* SNAPCHAT LOCATION SETUP RADAR BANNER */}
            <div style={{
              backgroundColor: 'rgba(2, 132, 199, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '0.85rem 1.25rem',
              maxWidth: '640px',
              margin: '0 auto 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}>
                <Radio size={22} style={{ color: '#38BDF8' }} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>
                    📍 {t('snapchatRadarLocation', 'Snapchat Radar Location:')} {location.district || location.state}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    {nearbyPartners.length} {t('nearbyBanks', 'Nearby Bank Branches & CSC Partners Mapped')}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setLocationModalOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ color: '#38BDF8', borderColor: '#38BDF8' }}
              >
                <Navigation size={14} /> {t('setupLocationRadar', 'Setup Location Radar')}
              </button>
            </div>

            {/* SEARCH FORM WITH AUTOCOMPLETE & VOICE */}
            <form onSubmit={handleSearchSubmit} style={{ maxWidth: '680px', margin: '0 auto 2rem', position: 'relative' }}>
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-2xl">
                <div className="flex-1">
                  <SearchAutocomplete
                    value={searchTerm}
                    onChange={(val) => setSearchTerm(val)}
                    onSelect={(scheme) => navigate(`/schemes/${scheme.id}`)}
                    placeholder={t('searchPlaceholder', 'Search schemes, business types, categories, departments...')}
                  />
                </div>
                <VoiceSearchButton onResult={(text) => setSearchTerm(text)} />
                <button type="submit" className="btn btn-primary font-bold px-5 py-3 rounded-xl shrink-0">
                  {t('searchCriteria', 'Search')}
                </button>
              </div>
            </form>

            {/* HERO CTAS */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/eligibility" className="btn btn-primary btn-lg">
                <Sparkles size={18} /> {t('findMySchemes', 'Find My Schemes')}
              </Link>
              <Link to="/schemes" className="btn btn-secondary btn-lg">
                <Building2 size={18} /> {t('exploreAllSchemes', 'Explore All Schemes')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section style={{ marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B192C' }}>500+</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{t('welfareStat', 'Welfare Schemes')}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B192C' }}>10M+</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{t('citizensBenefited', 'Citizens Benefited')}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IndianRupee size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B192C' }}>₹50,000 Cr+</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{t('directBenefit', 'Direct Benefit Transfer')}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B192C' }}>100%</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{t('verifiedLinks', 'Verified Direct Links')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED SCHEMES */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', color: '#0B192C', marginBottom: '0.5rem' }}>
                {t('featuredTitle', 'Featured National Schemes')}
              </h2>
              <p style={{ color: '#64748B', fontSize: '1rem' }}>
                {t('featuredSub', 'Popular Central and State welfare initiatives empowering marginalized entrepreneurs and citizens.')}
              </p>
            </div>
            <Link to="/schemes" className="btn btn-outline">
              {t('viewAllSchemesCTA', 'View All Schemes')} <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
              {featuredSchemes.map(scheme => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>
          )}

          {/* Recently Viewed Schemes History */}
          <div style={{ marginTop: '3rem' }}>
            <RecentlyViewed />
          </div>
        </div>
      </section>

      {/* ── MOBILE APP DOWNLOAD SECTION ─────────────────────────────────── */}
      <section className="app-download-section">
        <div className="container">
          <div className="app-download-card">
            {/* Left: Text content */}
            <div className="app-download-text">
              <div className="app-download-badge">{t('mobileAppBadge', 'Now Available on Mobile')}</div>
              <h2 className="app-download-heading">
                {t('mobileAppHeading', 'Take SchemeSetu Everywhere')}
              </h2>
              <p className="app-download-sub">
                {t('mobileAppSub', 'Access 500+ government schemes, track applications, and get AI-powered guidance — right from your phone. Available in 8 Indian languages.')}
              </p>
              <div className="app-download-buttons">
                <a
                  href="#"
                  className="app-store-btn"
                  aria-label="Download on Google Play"
                  onClick={e => e.preventDefault()}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3.18 23.76c.37.21.8.22 1.18.03l12.64-7.04-2.79-2.79-11.03 9.8zm-1.05-20.4A1.5 1.5 0 0 0 2 4.5v15c0 .48.23.9.6 1.17l.08.06 8.4-8.4v-.2L2.13 3.36zm18.12 8.38-2.72-1.52-3.08 3.08 3.08 3.09 2.74-1.53a1.54 1.54 0 0 0 0-2.62v-.5zm-16.4-9.4L15.21 9.8l-2.79 2.79L.37 2.24C.74.96 1.87.25 3.85 2.34z"/>
                  </svg>
                  <div className="app-store-btn-text">
                    <span className="app-store-label">{t('getItOn', 'GET IT ON')}</span>
                    <span className="app-store-name">Google Play</span>
                  </div>
                </a>

                <a
                  href="#"
                  className="app-store-btn"
                  aria-label="Download on App Store"
                  onClick={e => e.preventDefault()}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.19 1.28-2.17 3.82.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.36 2.76M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="app-store-btn-text">
                    <span className="app-store-label">{t('downloadOn', 'DOWNLOAD ON THE')}</span>
                    <span className="app-store-name">App Store</span>
                  </div>
                </a>
              </div>
              <p className="app-download-note">
                🔒 {t('mobileAppNote', 'Free forever · No ads · Works offline · All 8 Indian languages')}
              </p>
            </div>

            {/* Right: Phone mockup illustration */}
            <div className="app-download-visual" aria-hidden="true">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="phone-screen-header">
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#fff', opacity: 0.9 }}>SchemeSetu</span>
                  </div>
                  <div style={{ padding: '0.5rem' }}>
                    {['PM Mudra Yojana', 'Stand Up India', 'PMEGP Scheme'].map((s, i) => (
                      <div key={i} className="phone-scheme-item">
                        <div className="phone-scheme-dot" />
                        <span style={{ fontSize: '0.55rem', color: '#1e3e62', fontWeight: 600 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div className="phone-cta-bar">
                    <span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#fff' }}>Check Eligibility →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Snapchat Location Setup Modal */}
      <SnapchatLocationPicker
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </div>
  );
}
