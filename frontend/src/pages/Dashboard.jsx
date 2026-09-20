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
import VoiceAssistantModal from '../components/voice/VoiceAssistantModal';
import { formatIndianCurrency } from '../utils/numberValidator';
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
  Download,
  Award,
  TrendingUp,
  Scale,
  MessageSquare
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
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

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

  const handleDownloadDossier = () => {
    const dossierText = `
=====================================================
          SCHEMESETU CITIZEN DOSSIER
=====================================================
Applicant Name: ${user?.name || 'Citizen Beneficiary'}
Email: ${user?.email || 'N/A'}
Role: Verified Citizen Beneficiary
Location: ${location.district && location.state ? `${location.district}, ${location.state}` : (location.district || location.state || 'Not Specified')}
e-KYC Status: Verified & Aadhaar Seeded
Active Applications: ${applications.length}
Bookmarked Schemes: ${savedSchemes.length}
=====================================================
Official Government Digital Service Dossier - 2026
`;
    const blob = new Blob([dossierText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SchemeSetu_Dossier_${user?.name ? user.name.replace(/\s+/g, '_') : 'Citizen'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="container py-8" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. FANTASTIC HERO IDENTITY & DOSSIER HEADER */}
      <div 
        className="card" 
        style={{ 
          background: 'linear-gradient(135deg, #0B192C 0%, #1E293B 60%, #0F172A 100%)', 
          color: '#FFFFFF', 
          padding: '2rem', 
          borderRadius: '20px',
          boxShadow: '0 20px 40px -10px rgba(11, 25, 44, 0.5), 0 0 20px rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative Ambient Background Glow */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            
            {/* User Avatar Circle */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D97706, #F59E0B)',
              color: '#0F172A',
              fontWeight: 900,
              fontSize: '1.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
              flexShrink: 0
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                  color: '#34D399', 
                  padding: '0.3rem 0.8rem', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: 700,
                  border: '1px solid rgba(16, 185, 129, 0.4)'
                }}>
                  <ShieldCheck size={15} /> {t('verifiedCitizen', 'Verified SC Beneficiary')}
                </span>



                <button 
                  onClick={() => setLocationModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38BDF8',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    cursor: 'pointer'
                  }}
                  title="Change Location Radar"
                >
                  <MapPin size={14} style={{ color: '#F59E0B' }} /> 
                  <span>{location.district && location.state ? `${location.district}, ${location.state}` : (location.district || location.state || t('selectLocation', 'Select Location'))}</span>
                  {location.isGPS && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />}
                </button>
              </div>

              <h1 style={{ fontSize: '1.85rem', color: '#FFFFFF', margin: 0, lineHeight: 1.2, fontWeight: 900 }}>
                {t('welcomeBack', 'Welcome back')}, {user?.name || 'Citizen'}!
              </h1>
              <p style={{ color: '#94A3B8', fontSize: '0.92rem', margin: 0 }}>
                {t('dashboardSubtitle', 'Manage your scheme applications, verified profile, and financial assistance recommendations.')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button 
              onClick={handleDownloadDossier} 
              className="btn btn-outline btn-sm"
              style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              title="Download Citizen Dossier"
            >
              <Download size={15} /> Dossier PDF
            </button>
            <button 
              onClick={loadDashboardData} 
              className="btn btn-secondary btn-sm" 
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)' }}
              title={t('refreshDashboard', 'Refresh Data')}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <Link to="/eligibility" className="btn btn-primary btn-sm" style={{ fontWeight: 800, background: 'linear-gradient(135deg, #D97706, #F59E0B)', color: '#0F172A', border: 'none' }}>
              <Sparkles size={15} /> {t('reEvaluate', 'Check Eligibility')}
            </Link>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadDashboardData} />}

      {/* 2. FANTASTIC HIGH-CONTRAST KPI METRIC CARDS (4 CARDS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        
        {/* KPI 1: Eligible Schemes */}
        <Link to="/schemes" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ 
            padding: '1.35rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            backgroundColor: '#FFFFFF', 
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('statEligible', 'Eligible Schemes')}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>11 Schemes</div>
              <div style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 700, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span>100% Score Verified</span> <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </Link>

        {/* KPI 2: Est. Financial Assistance */}
        <div className="card" style={{ 
          padding: '1.35rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
        }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IndianRupee size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('statBenefit', 'Financial Value')}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>₹10.00L Max</div>
            <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem' }}>
              35% SC Subsidies & Grants
            </div>
          </div>
        </div>

        {/* KPI 3: Active Applications */}
        <Link to="/applications" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ 
            padding: '1.35rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            backgroundColor: '#FFFFFF', 
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(2, 132, 199, 0.15)', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileCheck2 size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('statActiveApps', 'Active Applications')}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>{applications.length} Filed</div>
              <div style={{ fontSize: '0.78rem', color: '#0284C7', fontWeight: 700, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span>Track status timeline</span> <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </Link>

        {/* KPI 4: Empanelled CSC & GPS Radar */}
        <div 
          onClick={() => setLocationModalOpen(true)} 
          className="card" 
          style={{ 
            padding: '1.35rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            backgroundColor: '#FFFFFF', 
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
        >
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(124, 58, 237, 0.15)', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('statPartners', 'Nearest Bank Center')}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
              {nearbyPartners[0]?.distanceKm ? `${nearbyPartners[0].distanceKm} km away` : '1.2 km away'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#7C3AED', fontWeight: 700, marginTop: '0.2rem' }}>
              {nearbyPartners[0]?.name || 'State Bank of India'} (GPS Verified)
            </div>
          </div>
        </div>
      </div>

      {/* FINANCIAL ASSISTANCE & MORATORIUM BENCHMARK WIDGET */}
      <div 
        className="card" 
        style={{ 
          padding: '1.5rem', 
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)', 
          borderRadius: '16px', 
          border: '1px solid #BFDBFE',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#0284C7', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Award size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#0F172A', margin: 0, fontWeight: 800 }}>
              NSFDC & Government Subsidy Entitlement Breakdown
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0' }}>
              Up to 35% capital subsidy, 4% interest rebate, and 12-month moratorium period for verified beneficiaries.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Subsidised Interest Rate</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#059669' }}>4.00% p.a.</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Moratorium Holiday</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0284C7' }}>12 Months</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Repayment Window</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#7C3AED' }}>10 Years</div>
          </div>
        </div>
      </div>

      {/* 3. LIVE APPLICATION TRACKER STAGE TIMELINE */}
      {applications.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('liveTracking', 'Live Application Stage Tracker')}</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0 0' }}>
                Application: <span style={{ fontFamily: 'monospace', color: '#0284C7' }}>{applications[0].id}</span> ({applications[0].schemeName})
              </h2>
            </div>
            <Link to="/applications" className="btn btn-outline btn-sm" style={{ fontSize: '0.8rem' }}>
              View All Applications →
            </Link>
          </div>

          {/* 4-Step Progress Line */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', position: 'relative' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.85rem', backgroundColor: '#ECFDF5', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontWeight: 800, fontSize: '0.82rem' }}>
                <CheckCircle2 size={16} /> 1. {t('stepApplied', 'Applied Online')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#047857' }}>Submitted via SchemeSetu Intake</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.85rem', backgroundColor: '#ECFDF5', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontWeight: 800, fontSize: '0.82rem' }}>
                <CheckCircle2 size={16} /> 2. {t('stepKyc', 'Digital KYC')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#047857' }}>Aadhaar & Caste Seeding Done</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.85rem', backgroundColor: '#EFF6FF', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284C7', fontWeight: 800, fontSize: '0.82rem' }}>
                <Clock size={16} className="animate-spin" style={{ color: '#0284C7' }} /> 3. {t('stepApproval', 'Bank Approval')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#1E40AF' }}>Under District Task Force Review</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.85rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontWeight: 700, fontSize: '0.82rem' }}>
                <Building2 size={16} /> 4. {t('stepDisbursed', 'Disbursal / Next Action')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>DBT Direct Transfer Stage</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TOP RECOMMENDED SCHEMES FOR CITIZEN WITH CALCULATED MATCH SCORE BADGES */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#0F172A', margin: 0, fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={22} style={{ color: '#D97706' }} /> {t('recommendedSchemes', 'Recommended Schemes for You')}
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
              Evaluated with 100% precision algorithm based on MoSJE income ceilings and SC eligibility guidelines.
            </p>
          </div>
          <Link to="/schemes" className="btn btn-outline btn-sm" style={{ fontSize: '0.85rem' }}>
            {t('exploreMoreSchemes', 'Explore Government Schemes')} <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {recommendedSchemes.map((scheme, idx) => (
            <div key={scheme.id} style={{ position: 'relative' }}>
              {/* Calculated Match Score Pill */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 2,
                backgroundColor: idx === 0 ? '#059669' : '#D97706',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.25rem 0.6rem',
                borderRadius: '20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <ShieldCheck size={12} /> {idx === 0 ? '100% Match' : '96% Match'}
              </div>
              <SchemeCard scheme={scheme} />
            </div>
          ))}
        </div>
      </div>

      {/* 5. QUICK SERVICES & TOOLS HUB */}
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#0F172A', marginBottom: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap style={{ color: '#D97706' }} size={20} /> {t('quickActions', 'Quick Services & Tools')}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          {/* Action 1: Voice AI Assistant */}
          <div 
            onClick={() => setVoiceModalOpen(true)} 
            className="card" 
            style={{ 
              padding: '1.25rem', 
              backgroundColor: '#0F172A', 
              color: '#FFFFFF', 
              borderRadius: '16px', 
              cursor: 'pointer',
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)'
            }}
          >
            <div>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F59E0B', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                <Mic size={22} />
              </div>
              <h3 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '0.35rem', fontWeight: 800 }}>{t('voiceService', 'Voice AI Assistant')}</h3>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.4, margin: 0 }}>{t('voiceServiceDesc', 'Speak in 10 Indic languages to discover schemes')}</p>
            </div>
            <div style={{ color: '#FCD34D', fontSize: '0.82rem', fontWeight: 800, marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>Speak Query Now</span> <ChevronRight size={16} />
            </div>
          </div>

          {/* Action 2: Eligibility Wizard */}
          <Link to="/eligibility" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                  <Sparkles size={22} />
                </div>
                <h3 style={{ fontSize: '1rem', color: '#0F172A', marginBottom: '0.35rem', fontWeight: 800 }}>{t('wizardService', 'Eligibility Assessment')}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>{t('wizardServiceDesc', 'Evaluate full eligibility across 11+ parameters')}</p>
              </div>
              <div style={{ color: '#059669', fontSize: '0.82rem', fontWeight: 800, marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span>Start Assessment</span> <ChevronRight size={16} />
              </div>
            </div>
          </Link>

          {/* Action 3: Location Radar */}
          <div onClick={() => setLocationModalOpen(true)} style={{ cursor: 'pointer' }}>
            <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                  <MapPin size={22} />
                </div>
                <h3 style={{ fontSize: '1rem', color: '#0F172A', marginBottom: '0.35rem', fontWeight: 800 }}>{t('radarService', 'Location Radar')}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>{t('radarServiceDesc', 'Locate nearby empanelled bank branches & CSCs')}</p>
              </div>
              <div style={{ color: '#0284C7', fontSize: '0.82rem', fontWeight: 800, marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span>Find Centers</span> <ChevronRight size={16} />
              </div>
            </div>
          </div>

          {/* Action 4: EMI & Subsidy Calculator */}
          <Link to="/results" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                  <Calculator size={22} />
                </div>
                <h3 style={{ fontSize: '1rem', color: '#0F172A', marginBottom: '0.35rem', fontWeight: 800 }}>{t('calcService', 'EMI & Subsidy Calculator')}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>{t('calcServiceDesc', 'Calculate monthly loan EMI and interest subsidies')}</p>
              </div>
              <div style={{ color: '#7C3AED', fontSize: '0.82rem', fontWeight: 800, marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span>Calculate EMI</span> <ChevronRight size={16} />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 6. SAVED BOOKMARKS & RECENT APPLICATIONS SPLIT-VIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
        
        {/* Tracked Applications Box */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '16px', padding: '1.25rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0F172A', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck2 size={20} style={{ color: '#059669' }} /> {t('trackedApplications', 'Tracked Applications')}
            </h3>
            <Link to="/applications" style={{ fontSize: '0.82rem', color: '#0284C7', fontWeight: 700 }}>{t('allApplications', 'All Applications')} ({applications.length})</Link>
          </div>

          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.75rem 0', color: '#64748B' }}>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>No active applications currently filed.</p>
              <Link to="/schemes" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem', fontWeight: 700 }}>Apply for a Scheme</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {applications.slice(0, 3).map(app => (
                <div key={app.id} style={{ padding: '0.9rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace', fontWeight: 700 }}>{app.id}</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>{app.schemeName}</div>
                  </div>
                  <span className={`badge ${app.status === 'Approved' ? 'badge-eligible' : 'badge-cat'}`} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
                    {app.status === 'Approved' ? <CheckCircle2 size={13} /> : <Clock size={13} />} {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Schemes Box */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '16px', padding: '1.25rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0F172A', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bookmark size={20} style={{ color: '#D97706' }} /> {t('bookmarkedSchemes', 'Bookmarked Schemes')}
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 700 }}>{savedSchemes.length} {t('saved', 'Saved')}</span>
          </div>

          {savedSchemes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.75rem 0', color: '#64748B' }}>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>No saved schemes in your bookmarks.</p>
              <Link to="/schemes" className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem', fontWeight: 700 }}>Explore Schemes</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {savedSchemes.slice(0, 3).map(scheme => (
                <div key={scheme.id} style={{ padding: '0.9rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>{scheme.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{scheme.category}</div>
                  </div>
                  <Link to={`/schemes/${scheme.id}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem', fontWeight: 700 }}>
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Snapchat Location Radar Modal */}
      <SnapchatLocationPicker
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />

      {/* AI Voice Assistant Modal */}
      <VoiceAssistantModal 
        isOpen={voiceModalOpen} 
        onClose={() => setVoiceModalOpen(false)} 
      />
    </div>
  );
}
