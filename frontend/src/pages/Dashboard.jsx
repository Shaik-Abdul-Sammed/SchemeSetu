import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { userService } from '../services/userService';
import SchemeCard from '../components/scheme/SchemeCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import SnapchatLocationPicker from '../components/location/SnapchatLocationPicker';
import { 
  User, 
  Bookmark, 
  FileCheck2, 
  Bell, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  IndianRupee,
  Mic,
  MapPin,
  Calculator,
  Download,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Zap,
  Award
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { location, nearbyPartners } = useLocation();
  const navigate = useNavigate();

  const [savedSchemes, setSavedSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [savedRes, appsRes, notifsRes] = await Promise.all([
        userService.getSavedSchemes(),
        userService.getApplications(),
        userService.getNotifications()
      ]);
      setSavedSchemes(savedRes.data || []);
      setApplications(appsRes.data || []);
      setNotifications(notifsRes.data || []);
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
      <div className="container" style={{ padding: '3rem 1.25rem' }}>
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  // Calculate high-level summary metrics
  const totalSanctioned = applications.reduce((acc, curr) => acc + (curr.sanctionedAmount || curr.loanAmount || 0), 0);
  const approvedCount = applications.filter(a => a.status === 'Approved').length;

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      
      {/* 1. TOP WELCOME & CITIZEN IDENTITY BANNER */}
      <div 
        className="card" 
        style={{ 
          backgroundColor: '#0B192C', 
          color: '#FFFFFF', 
          padding: '2.25rem', 
          marginBottom: '2rem', 
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(11, 25, 44, 0.25)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1.5rem' 
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              backgroundColor: 'rgba(217, 119, 6, 0.2)', 
              color: '#F59E0B', 
              padding: '0.3rem 0.85rem', 
              borderRadius: '9999px', 
              fontSize: '0.82rem', 
              fontWeight: 700,
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <ShieldCheck size={16} /> {t('verifiedCitizen', 'Verified Citizen Profile')}
            </span>

            <button 
              onClick={() => setLocationModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(2, 132, 199, 0.2)',
                color: '#38BDF8',
                padding: '0.3rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px solid rgba(56, 189, 248, 0.3)',
                cursor: 'pointer'
              }}
              title="Change Location Radar"
            >
              <MapPin size={14} /> {location.district || 'Hyderabad'}, {location.state || 'Telangana'} ({location.isGPS ? 'GPS' : 'Radar'})
            </button>
          </div>

          <h1 style={{ fontSize: '2rem', color: '#FFFFFF', margin: '0.35rem 0 0', lineHeight: 1.2 }}>
            {t('welcomeBack', 'Welcome back')}, {user?.name || 'Citizen'}
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0 }}>
            {t('dashboardSubtitle', 'Manage your scheme applications, verified profile, and financial assistance recommendations.')}
          </p>
        </div>

        {/* Action Buttons in Banner */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={loadDashboardData} className="btn btn-secondary btn-sm" title={t('refreshDashboard', 'Refresh Data')}>
            <RefreshCw size={15} /> {t('refreshDashboard', 'Refresh')}
          </button>
          <Link to="/eligibility" className="btn btn-primary btn-sm">
            <Sparkles size={16} /> {t('checkEligibility', 'Check Eligibility')}
          </Link>
          <Link to="/schemes" className="btn btn-outline btn-sm" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }}>
            <Building2 size={16} /> {t('exploreSchemes', 'Explore Schemes')}
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadDashboardData} />}

      {/* 2. STATS & ANALYTICS METRIC GRID */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {/* Stat 1: Eligible Schemes */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #D97706' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>{t('statEligible', 'Eligible Schemes')}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0B192C' }}>11</div>
            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Central & State Schemes</div>
          </div>
        </div>

        {/* Stat 2: Financial Assistance Value */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #059669' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>{t('statBenefit', 'Financial Value')}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>₹{(totalSanctioned || 750000).toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Sanctioned & Subsidy Total</div>
          </div>
        </div>

        {/* Stat 3: Tracked Applications */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #0284C7' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileCheck2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>{t('statActiveApps', 'Active Applications')}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0B192C' }}>{applications.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: 600 }}>{approvedCount} Sanctioned • {applications.length - approvedCount} In Review</div>
          </div>
        </div>

        {/* Stat 4: Nearby Empanelled Centers */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #7C3AED', cursor: 'pointer' }} onClick={() => setLocationModalOpen(true)}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>{t('statPartners', 'Nearby Centers')}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0B192C' }}>{nearbyPartners.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600 }}>Banks & CSC Nodes Active</div>
          </div>
        </div>
      </div>

      {/* 3. QUICK SERVICES & TOOLS ACCELERATOR HUB */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#0B192C', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap style={{ color: '#D97706' }} size={22} /> {t('quickActions', 'Quick Services & Tools')}
        </h2>

        <div className="grid-4">
          <Link to="/input" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#FFFFFF', transition: 'all 0.2s ease' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Mic size={20} />
                </div>
                <h3 style={{ fontSize: '1rem', color: '#0B192C', marginBottom: '0.35rem' }}>{t('voiceService', 'Voice AI SchemeSetu')}</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>{t('voiceServiceDesc', 'Speak in your regional language to find schemes')}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#D97706', fontSize: '0.82rem', fontWeight: 700, marginTop: '0.85rem' }}>
                <span>Launch Assistant</span> <ChevronRight size={14} />
              </div>
            </div>
          </Link>

          <Link to="/eligibility" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#FFFFFF', transition: 'all 0.2s ease' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Sparkles size={20} />
                </div>
                <h3 style={{ fontSize: '1rem', color: '#0B192C', marginBottom: '0.35rem' }}>{t('wizardService', 'Eligibility Assessment')}</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>{t('wizardServiceDesc', 'Evaluate full eligibility across 11+ parameters')}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontSize: '0.82rem', fontWeight: 700, marginTop: '0.85rem' }}>
                <span>Start Assessment</span> <ChevronRight size={14} />
              </div>
            </div>
          </Link>

          <div onClick={() => setLocationModalOpen(true)} style={{ cursor: 'pointer' }}>
            <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#FFFFFF', transition: 'all 0.2s ease' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <MapPin size={20} />
                </div>
                <h3 style={{ fontSize: '1rem', color: '#0B192C', marginBottom: '0.35rem' }}>{t('radarService', 'Location Radar')}</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>{t('radarServiceDesc', 'Locate nearby empanelled bank branches & CSCs')}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#0284C7', fontSize: '0.82rem', fontWeight: 700, marginTop: '0.85rem' }}>
                <span>Open Radar</span> <ChevronRight size={14} />
              </div>
            </div>
          </div>

          <Link to="/results" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#FFFFFF', transition: 'all 0.2s ease' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Calculator size={20} />
                </div>
                <h3 style={{ fontSize: '1rem', color: '#0B192C', marginBottom: '0.35rem' }}>{t('calcService', 'EMI & Subsidy Calculator')}</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>{t('calcServiceDesc', 'Calculate monthly loan EMI and interest subsidies')}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#7C3AED', fontSize: '0.82rem', fontWeight: 700, marginTop: '0.85rem' }}>
                <span>Calculate EMI</span> <ChevronRight size={14} />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. MAIN DASHBOARD CONTENT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
        
        {/* LEFT COLUMN: LIVE APPLICATIONS TRACKER & BOOKMARKED SCHEMES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Applications Tracker */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCheck2 style={{ color: '#059669' }} size={22} />
                <h2 style={{ fontSize: '1.25rem', color: '#0B192C', margin: 0 }}>
                  {t('liveTracking', 'Live Application Stage Tracker')}
                </h2>
              </div>
              <span className="badge badge-eligible">{applications.length} {t('active', 'Active')}</span>
            </div>

            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B' }}>
                <FileCheck2 size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.95rem', margin: 0 }}>{t('noTrackedApps', 'No applications tracked yet.')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {applications.map(app => (
                  <div key={app.id} style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#1D4ED8', backgroundColor: '#EFF6FF', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                          {app.id}
                        </span>
                        <h3 style={{ fontSize: '1.05rem', color: '#0F172A', margin: '0.35rem 0 0' }}>{app.schemeName}</h3>
                      </div>
                      <span className={`badge ${app.status === 'Approved' ? 'badge-eligible' : 'badge-cat'}`}>
                        {app.status === 'Approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />} {app.status}
                      </span>
                    </div>

                    {/* Visual 4-Step Progress Bar */}
                    <div style={{ margin: '0.5rem 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '0.35rem' }}>
                        <span style={{ color: '#059669' }}>1. {t('stepApplied', 'Applied')}</span>
                        <span style={{ color: '#059669' }}>2. {t('stepKyc', 'Digital KYC')}</span>
                        <span style={{ color: app.status === 'Approved' ? '#059669' : '#D97706' }}>3. {t('stepApproval', 'Bank Review')}</span>
                        <span style={{ color: app.status === 'Approved' ? '#059669' : '#94A3B8' }}>4. {t('stepDisbursed', 'DBT Disbursed')}</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            width: app.status === 'Approved' ? '100%' : '65%', 
                            backgroundColor: app.status === 'Approved' ? '#059669' : '#D97706',
                            transition: 'width 0.4s ease'
                          }} 
                        />
                      </div>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#475569', backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <strong>{t('note', 'Branch Note:')}</strong> {app.remarks || 'Document verification in progress at designated nodal branch.'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                        Amount: <strong>₹{(app.sanctionedAmount || app.loanAmount || 300000).toLocaleString('en-IN')}</strong>
                      </span>
                      <Link to="/applications" className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                        <Download size={13} /> {t('downloadSlip', 'Download Slip')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarked Schemes */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bookmark style={{ color: '#D97706' }} size={22} />
                <h2 style={{ fontSize: '1.25rem', color: '#0B192C', margin: 0 }}>
                  {t('bookmarkedSchemes', 'Bookmarked Schemes')}
                </h2>
              </div>
              <span className="badge badge-cat">{savedSchemes.length} {t('saved', 'Saved')}</span>
            </div>

            {savedSchemes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B' }}>
                <Bookmark size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.95rem', margin: '0 0 1rem' }}>{t('noBookmarks', 'No saved schemes yet.')}</p>
                <Link to="/schemes" className="btn btn-primary btn-sm">{t('exploreSchemes', 'Explore Schemes')}</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {savedSchemes.map(scheme => (
                  <SchemeCard key={scheme.id} scheme={scheme} isSaved={true} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CITIZEN PROFILE, E-KYC STATUS & GOVERNMENT NOTIFICATIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Citizen Profile & e-KYC Verification Box */}
          <div className="card" style={{ backgroundColor: '#F8FAFC' }}>
            <h2 style={{ fontSize: '1.15rem', color: '#0B192C', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: '#D97706' }} /> {t('profileInfo', 'Citizen Profile & Verification')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>{t('fullNameLabel', 'Full Name:')}</span>
                <strong style={{ color: '#0F172A' }}>{user?.name || 'Ramesh Kumar'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>{t('emailLabel', 'Registered ID:')}</span>
                <strong style={{ color: '#0F172A' }}>{user?.email || 'citizen@schemesetu.in'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>{t('stateLabel', 'State / District:')}</span>
                <strong style={{ color: '#0F172A' }}>{location.district || 'Hyderabad'}, {user?.state || location.state || 'Telangana'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Beneficiary Category:</span>
                <strong style={{ color: '#059669' }}>SC / Priority Entrepreneur</strong>
              </div>
            </div>

            {/* e-KYC Checklist */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                {t('ekycStatus', 'e-KYC & DBT Verification')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: '#059669', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={14} /> {t('aadhaarLinked', 'Aadhaar e-KYC: Verified')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={14} /> {t('dbtActive', 'DBT Bank Linkage: Active')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={14} /> {t('bplMapped', 'Ration / Caste Data: Mapped')}
                </div>
              </div>
            </div>
          </div>

          {/* Portal Notifications Feed */}
          <div className="card">
            <h2 style={{ fontSize: '1.15rem', color: '#0B192C', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell style={{ color: '#1D4ED8' }} size={20} /> {t('portalNotifications', 'Portal Notifications & Alerts')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {notifications.map(n => (
                <div key={n.id} style={{ padding: '0.85rem', backgroundColor: n.read ? '#F8FAFC' : '#EFF6FF', borderRadius: '8px', border: `1px solid ${n.read ? '#E2E8F0' : '#BFDBFE'}` }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{n.title}</span>
                    {!n.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1D4ED8' }} />}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.35rem', lineHeight: 1.4 }}>{n.message}</p>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{n.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 5. PERFECTLY CENTERED BOTTOM ACTION BUTTON CONTAINER */}
      <div className="bottom-action-container">
        <Link to="/schemes" className="btn btn-primary btn-lg" style={{ minWidth: '220px', justifyContent: 'center' }}>
          <Building2 size={18} /> {t('exploreMoreSchemes', 'Explore All Government Schemes')}
        </Link>
        <Link to="/eligibility" className="btn btn-green btn-lg" style={{ minWidth: '220px', justifyContent: 'center' }}>
          <Sparkles size={18} /> {t('reEvaluate', 'Re-evaluate Eligibility')}
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
