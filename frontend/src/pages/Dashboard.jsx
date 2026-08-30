import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { userService } from '../services/userService';
import { schemeService } from '../services/schemeService';
import SchemeCard from '../components/scheme/SchemeCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import SnapchatLocationPicker from '../components/location/SnapchatLocationPicker';
import { 
  User, 
  Bookmark, 
  FileCheck2, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Clock, 
  IndianRupee,
  Mic,
  MapPin,
  Calculator,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Zap,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { location, nearbyPartners } = useLocation();
  const navigate = useNavigate();

  const [savedSchemes, setSavedSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [recommendedSchemes, setRecommendedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [savedRes, appsRes, schemesRes] = await Promise.all([
        userService.getSavedSchemes(),
        userService.getApplications(),
        schemeService.getSchemes({ limit: 4 })
      ]);
      setSavedSchemes(savedRes.data || []);
      setApplications(appsRes.data || []);
      setRecommendedSchemes(schemesRes.data?.slice(0, 3) || []);
    } catch (err) {
      setError(err.message || 'Failed to load user dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="container py-8">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="container py-8" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. TOP HEADER & CITIZEN IDENTITY */}
      <div 
        className="card" 
        style={{ 
          backgroundColor: '#0B192C', 
          color: '#FFFFFF', 
          padding: '1.75rem', 
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(11, 25, 44, 0.4)',
          border: '1px solid #1E293B',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1.25rem' 
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              backgroundColor: 'rgba(245, 158, 11, 0.15)', 
              color: '#F59E0B', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '9999px', 
              fontSize: '0.8rem', 
              fontWeight: 700,
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <ShieldCheck size={15} /> Verified Citizen Beneficiary
            </span>

            <button 
              onClick={() => setLocationModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(2, 132, 199, 0.18)',
                color: '#38BDF8',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid rgba(56, 189, 248, 0.3)',
                cursor: 'pointer'
              }}
              title="Change Location Radar"
            >
              <MapPin size={13} /> {location.district || location.state || 'Location Radar'} ({location.isGPS ? 'GPS' : location.isDemo ? 'Demo' : 'Radar'})
            </button>
          </div>

          <h1 style={{ fontSize: '1.75rem', color: '#FFFFFF', margin: '0.25rem 0 0', lineHeight: 1.2, fontWeight: 800 }}>
            {t('welcomeBack', 'Welcome back')}, {user?.name || 'Citizen'}
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0 }}>
            {t('dashboardSubtitle', 'Government welfare benefits discovery, applications tracking, and personalized recommendations.')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={loadDashboardData} className="btn btn-secondary btn-sm" title={t('refreshDashboard', 'Refresh Data')}>
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/eligibility" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
            <Sparkles size={15} /> Check Eligibility
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadDashboardData} />}

      {/* 2. SUMMARY METRIC CARDS (4 Standard Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Card 1: Eligible Schemes */}
        <Link to="/schemes" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #F59E0B', transition: 'transform 0.15s ease' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Eligible Schemes</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0B192C' }}>11</div>
              <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>Active Recommendations →</div>
            </div>
          </div>
        </Link>

        {/* Card 2: Saved Schemes */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #059669' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bookmark size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Saved Schemes</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0B192C' }}>{savedSchemes.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Bookmarked for review</div>
          </div>
        </div>

        {/* Card 3: Tracked Applications */}
        <Link to="/applications" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #0284C7', transition: 'transform 0.15s ease' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileCheck2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>My Applications</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0B192C' }}>{applications.length}</div>
              <div style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: 600 }}>Track Live Status →</div>
            </div>
          </div>
        </Link>

        {/* Card 4: Nearby Support */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #7C3AED', cursor: 'pointer' }} onClick={() => setLocationModalOpen(true)}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nearby Support</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0B192C' }}>{nearbyPartners.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600 }}>Banks & CSC Nodes</div>
          </div>
        </div>
      </div>

      {/* 3. RECOMMENDED SCHEMES SECTION (3-4 Clean Cards) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#0B192C', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} style={{ color: '#D97706' }} /> Top Recommended Schemes For You
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
              Based on your beneficiary profile and eligible welfare criteria.
            </p>
          </div>
          <Link to="/schemes" className="btn btn-outline btn-sm" style={{ fontSize: '0.85rem' }}>
            View All Schemes <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {recommendedSchemes.map(scheme => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      </div>

      {/* 4. QUICK ACTIONS HUB */}
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#0B192C', marginBottom: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap style={{ color: '#D97706' }} size={20} /> Quick Actions
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link to="/eligibility" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#FFFFFF', transition: 'all 0.15s ease' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Sparkles size={20} />
                </div>
                <h3 style={{ fontSize: '0.98rem', color: '#0B192C', marginBottom: '0.35rem', fontWeight: 700 }}>Check Eligibility</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>AI-powered multi-parameter matching</p>
              </div>
              <div style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.75rem' }}>Start Wizard →</div>
            </div>
          </Link>

          <Link to="/schemes" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#FFFFFF', transition: 'all 0.15s ease' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Building2 size={20} />
                </div>
                <h3 style={{ fontSize: '0.98rem', color: '#0B192C', marginBottom: '0.35rem', fontWeight: 700 }}>Find Schemes</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>Search by business, loan, or sector</p>
              </div>
              <div style={{ color: '#D97706', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.75rem' }}>Explore Catalog →</div>
            </div>
          </Link>

          <Link to="/results" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#FFFFFF', transition: 'all 0.15s ease' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Calculator size={20} />
                </div>
                <h3 style={{ fontSize: '0.98rem', color: '#0B192C', marginBottom: '0.35rem', fontWeight: 700 }}>Calculate EMI</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>Loan tenure and moratorium estimates</p>
              </div>
              <div style={{ color: '#7C3AED', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.75rem' }}>Open Calculator →</div>
            </div>
          </Link>

          <div onClick={() => setLocationModalOpen(true)} style={{ cursor: 'pointer' }}>
            <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#FFFFFF', transition: 'all 0.15s ease' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <MapPin size={20} />
                </div>
                <h3 style={{ fontSize: '0.98rem', color: '#0B192C', marginBottom: '0.35rem', fontWeight: 700 }}>Find Nearby Support</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>Locate bank branches & CSC nodes</p>
              </div>
              <div style={{ color: '#0284C7', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.75rem' }}>View Radar →</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY & SAVED SCHEMES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
        {/* Tracked Applications Box */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0B192C', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck2 size={18} style={{ color: '#059669' }} /> Recent Application Activity
            </h3>
            <Link to="/applications" style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 600 }}>All ({applications.length})</Link>
          </div>

          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#64748B' }}>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>No active applications currently filed.</p>
              <Link to="/schemes" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>Apply for a Scheme</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {applications.slice(0, 3).map(app => (
                <div key={app.id} style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>{app.id}</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>{app.schemeName}</div>
                  </div>
                  <span className={`badge ${app.status === 'Approved' ? 'badge-eligible' : 'badge-cat'}`}>
                    {app.status === 'Approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />} {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Schemes Box */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0B192C', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bookmark size={18} style={{ color: '#D97706' }} /> Saved Bookmarks
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{savedSchemes.length} saved</span>
          </div>

          {savedSchemes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#64748B' }}>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>No saved schemes in your bookmarks.</p>
              <Link to="/schemes" className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>Explore Schemes</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {savedSchemes.slice(0, 3).map(scheme => (
                <div key={scheme.id} style={{ padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>{scheme.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{scheme.category}</div>
                  </div>
                  <Link to={`/schemes/${scheme.id}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem' }}>
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. VOICE ASSISTANCE CTA BANNER */}
      <div 
        className="card" 
        style={{ 
          background: 'linear-gradient(135deg, #1E3E62 0%, #0B192C 100%)', 
          color: '#FFFFFF', 
          padding: '1.75rem', 
          borderRadius: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          border: '1px solid #334155'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Mic size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', margin: 0, fontWeight: 700 }}>
              Need help? Ask SchemeSetu AI Voice Assistant
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
              Speak naturally in Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Marathi, or English.
            </p>
          </div>
        </div>

        <Link to="/input" className="btn btn-primary" style={{ background: '#F59E0B', color: '#0B192C', fontWeight: 800, borderColor: '#F59E0B' }}>
          <Mic size={16} /> Open Voice Assistant
        </Link>
      </div>

      {/* Location Radar Modal */}
      <SnapchatLocationPicker
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </div>
  );
}
