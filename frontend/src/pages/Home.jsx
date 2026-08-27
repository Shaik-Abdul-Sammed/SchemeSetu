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
              <ShieldCheck size={18} /> Official Citizen Welfare Discovery Portal
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.15, marginBottom: '1.25rem' }}>
              {t('heroTitle')}
            </h1>

            <p style={{ fontSize: '1.15rem', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '2rem' }}>
              {t('heroSubtitle')}
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
                    📍 Snapchat Radar Location: {location.district || location.state}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    {nearbyPartners.length} Nearby Bank Branches & CSC Partners Mapped
                  </div>
                </div>
              </div>

              <button
                onClick={() => setLocationModalOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ color: '#38BDF8', borderColor: '#38BDF8' }}
              >
                <Navigation size={14} /> Setup Location Radar
              </button>
            </div>

            {/* SEARCH FORM */}
            <form onSubmit={handleSearchSubmit} style={{ maxWidth: '640px', margin: '0 auto 2rem', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, paddingLeft: '0.75rem', gap: '0.5rem', color: '#64748B' }}>
                  <Search size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    aria-label="Search government schemes"
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      fontSize: '1rem',
                      color: '#0F172A'
                    }}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg">
                  Search
                </button>
              </div>
            </form>

            {/* HERO CTAS */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/eligibility" className="btn btn-primary btn-lg">
                <Sparkles size={18} /> {t('findMySchemes')}
              </Link>
              <Link to="/schemes" className="btn btn-secondary btn-lg">
                <Building2 size={18} /> {t('exploreAllSchemes')}
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
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Welfare Schemes</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B192C' }}>10M+</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Citizens Benefited</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IndianRupee size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B192C' }}>₹50,000 Cr+</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Direct Benefit Transfer</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B192C' }}>100%</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Verified Direct Links</div>
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
                {t('featuredTitle')}
              </h2>
              <p style={{ color: '#64748B', fontSize: '1rem' }}>
                {t('featuredSub')}
              </p>
            </div>
            <Link to="/schemes" className="btn btn-outline">
              View All Schemes <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {featuredSchemes.map(scheme => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>
          )}
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
