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
  Navigation,
  Zap,
  Mic,
  FileCheck,
  CheckCircle2,
  Phone
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

  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await schemeService.getSchemes({ limit: 6 });
        setFeaturedSchemes(res.data || []);
      } catch (err) {
        console.error("Failed to load featured schemes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ 
        backgroundColor: '#0B192C', 
        color: '#FFFFFF', 
        padding: '3.5rem 1rem 4rem 1rem', 
        position: 'relative',
        borderBottom: '1px solid #1E293B'
      }}>
        <div className="container" style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          
          {/* Top Badge & Location Pill */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              backgroundColor: 'rgba(245, 158, 11, 0.15)', 
              color: '#F59E0B', 
              padding: '0.3rem 0.85rem', 
              borderRadius: '9999px', 
              fontSize: '0.82rem', 
              fontWeight: 700,
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <ShieldCheck size={16} /> {t('officialPortalBadge', 'Official Citizen Welfare Discovery Portal')}
            </span>

            <button
              onClick={() => setLocationModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(2, 132, 199, 0.18)',
                color: '#38BDF8',
                padding: '0.3rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px solid rgba(56, 189, 248, 0.3)',
                cursor: 'pointer'
              }}
              title="Set Location Radar"
            >
              <Radio size={14} />
              <span>
                {location.isDemo
                  ? `Demo: ${location.district}`
                  : location.isGPS
                    ? `GPS: ${location.district}`
                    : location.state
                      ? `${location.district || location.state}`
                      : 'Location Radar'} ({nearbyPartners.length} centers)
              </span>
            </button>
          </div>

          {/* Main Title */}
          <h1 style={{ 
            fontSize: 'clamp(2rem, 5vw, 2.75rem)', 
            fontWeight: 800, 
            color: '#FFFFFF', 
            lineHeight: 1.2, 
            marginBottom: '1rem',
            letterSpacing: '-0.02em'
          }}>
            {t('heroTitle', 'Find Government Schemes You Are Eligible For')}
          </h1>

          <p style={{ 
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', 
            color: '#CBD5E1', 
            lineHeight: 1.5, 
            maxWidth: '680px', 
            margin: '0 auto 2rem' 
          }}>
            {t('heroSubtitle', 'SchemeSetu simplifies welfare and business loan discovery across Central and State Governments.')}
          </p>

          {/* SEARCH & VOICE INPUT BAR */}
          <form onSubmit={handleSearchSubmit} style={{ maxWidth: '680px', margin: '0 auto 1.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '0.4rem 0.6rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              gap: '0.5rem'
            }}>
              <div style={{ flexGrow: 1 }}>
                <SearchAutocomplete
                  value={searchTerm}
                  onChange={(val) => setSearchTerm(val)}
                  onSelect={(scheme) => navigate(`/schemes/${scheme.id}`)}
                  placeholder={t('searchPlaceholder', 'Search schemes, business types, categories, departments...')}
                />
              </div>

              <VoiceSearchButton onResult={(text) => setSearchTerm(text)} />

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ borderRadius: '12px', padding: '0.6rem 1.25rem', fontWeight: 700, flexShrink: 0 }}
              >
                <Search size={16} />
                <span className="hide-on-mobile">{t('searchCriteria', 'Search')}</span>
              </button>
            </div>
          </form>

          {/* HERO ACTION BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <Link 
              to="/input" 
              className="btn btn-primary btn-lg" 
              style={{ 
                background: 'linear-gradient(135deg, #F59E0B, #D97706)', 
                color: '#0B192C', 
                fontWeight: 800, 
                borderColor: '#F59E0B' 
              }}
            >
              <Mic size={18} /> {t('voiceAssistant', 'Try Voice AI Assistant')}
            </Link>

            <Link to="/eligibility" className="btn btn-secondary btn-lg">
              <Sparkles size={18} /> {t('findMySchemes', 'Find My Schemes')}
            </Link>

            <Link to="/schemes" className="btn btn-secondary btn-lg">
              <Building2 size={18} /> {t('exploreAllSchemes', 'Explore Schemes')}
            </Link>
          </div>

          {/* 1-CLICK DEMO BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => {
                navigate('/results', {
                  state: {
                    criteria: {
                      income: 200000,
                      cost: 350000,
                      education: '10th pass',
                      projectType: 'business',
                      occupation: 'Farmer',
                      age: 32,
                      state: 'Telangana'
                    }
                  }
                });
              }}
              className="btn btn-secondary btn-sm"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                borderColor: '#F59E0B',
                color: '#FCD34D',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 1.15rem',
                borderRadius: '9999px',
                fontWeight: 600
              }}
            >
              <Zap size={15} style={{ color: '#F59E0B' }} />
              <span>⚡ Launch 1-Click SIH 2026 Demo Flow</span>
            </button>
          </div>

        </div>
      </section>

      {/* 2. STATS PILLARS */}
      <section style={{ marginTop: '-2.5rem', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B192C' }}>500+</div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>{t('welfareStat', 'Welfare Schemes')}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#ECFDF5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B192C' }}>10M+</div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>{t('citizensBenefited', 'Citizens Benefited')}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IndianRupee size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B192C' }}>₹50,000 Cr+</div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>{t('directBenefit', 'Direct Benefit (DBT)')}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B192C' }}>100%</div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>{t('verifiedLinks', 'Verified Official Links')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SCHEMES SECTION */}
      <section className="container py-8">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#0B192C', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={22} style={{ color: '#D97706' }} /> {t('featuredTitle', 'Featured Government Schemes')}
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
              {t('featuredSub', 'Popular government initiatives empowering citizens, farmers, and entrepreneurs.')}
            </p>
          </div>
          <Link to="/schemes" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
            {t('viewAllSchemesCTA', 'View All Schemes')} <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {featuredSchemes.slice(0, 6).map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </section>

      {/* 4. RECENTLY VIEWED SCHEMES */}
      <div className="container">
        <RecentlyViewed />
      </div>

      {/* Location Radar Modal */}
      {locationModalOpen && (
        <SnapchatLocationPicker onClose={() => setLocationModalOpen(false)} />
      )}
    </div>
  );
}
