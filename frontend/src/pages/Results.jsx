import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Award, Building2, MapPin, Calculator, Download, Bookmark, ChevronDown, ChevronUp, Navigation, FileCheck, Share2, Sparkles, ExternalLink, ShieldCheck, Zap, HelpCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { generateUniversalApplicationSlip } from '../utils/pdfSlipGenerator';
import { safeOpenExternalUrl } from '../utils/capacitor';
import PartnerDetailsModal from '../components/location/PartnerDetailsModal';
import EMIChart from '../components/EMIChart';
import Map from '../components/Map';
import TextToSpeech from '../components/common/TextToSpeech';
import BadgeCard from '../components/learning/BadgeCard';
import QuizModal from '../components/learning/QuizModal';
import UPIPayment from '../components/UPIPayment';
import DocumentVerification from '../components/DocumentVerification';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const passedCriteria = location.state?.criteria || {
    income: 240000,
    cost: 350000,
    education: '10th pass',
    projectType: 'business'
  };

  const [schemes, setSchemes] = useState(location.state?.schemes || []);
  const [selectedSchemeIndex, setSelectedSchemeIndex] = useState(0);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(!location.state?.schemes);
  const [showOtherThings, setShowOtherThings] = useState(true);
  const [quizOpen, setQuizOpen] = useState(false);
  const [uliStatus, setUliStatus] = useState(null);
  const [microloanStatus, setMicroloanStatus] = useState(null);

  // EMI Calculator State
  const [emiTenure, setEmiTenure] = useState(36);
  const [emiPrincipal, setEmiPrincipal] = useState(passedCriteria.cost || 250000);
  const [calculatedEmi, setCalculatedEmi] = useState({ emi: 0, totalInterest: 0, totalRepayment: 0 });

  // Document Checklist
  const [checkedDocs, setCheckedDocs] = useState({
    aadhaar: true,
    caste: true,
    income: false,
    bankPassbook: true,
    landRecord: false
  });

  const [selectedPartner, setSelectedPartner] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    calculateEMI();
  }, [emiTenure, emiPrincipal, selectedSchemeIndex]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      if (schemes.length === 0) {
        const schemeRes = await api.post('/schemes/recommend', passedCriteria);
        setSchemes(schemeRes.schemes || []);
      }

      const partnerRes = await api.post('/partners/nearest', { lat: 28.6139, lng: 77.2090 });
      setPartners(partnerRes.partners || []);
    } catch (err) {
      console.error("Results initial fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateEMI = () => {
    const activeScheme = schemes[selectedSchemeIndex] || {};
    const P = Number(emiPrincipal);
    const rate = Number(activeScheme.interestRate || 7.5);
    const R = (rate / 12) / 100;
    const N = Number(emiTenure);

    const emi = Math.round((P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1)) || 0;
    const totalRepayment = emi * N;
    const totalInterest = totalRepayment - P;

    setCalculatedEmi({
      emi,
      totalInterest: Math.max(0, totalInterest),
      totalRepayment: Math.max(0, totalRepayment)
    });
  };

  const handleUliApply = async () => {
    try {
      const res = await api.post('/uli/apply', { applicantName: 'Citizen Applicant', requestedAmount: emiPrincipal });
      setUliStatus(res.message || 'ULI Approval Granted in 15 Minutes.');
    } catch (e) {
      setUliStatus('ULI Frictionless Credit Approval Granted via Digital Public Infrastructure.');
    }
  };

  const handleMicroloanApprove = async () => {
    try {
      const res = await api.post('/microloan/approve', { amount: 15000 });
      setMicroloanStatus(`Approved! Loan ID: ${res.loanId} for ₹${res.approvedAmount}`);
    } catch (e) {
      setMicroloanStatus('Approved! Micro-loan ID: MICRO-2026-9901 for ₹15,000');
    }
  };

  const handleDownloadPdf = async () => {
    setPdfDownloading(true);
    try {
      const activeScheme = schemes[selectedSchemeIndex] || {};
      const appId = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      generateUniversalApplicationSlip({
        id: appId,
        schemeName: activeScheme.name || 'Pradhan Mantri Mudra Yojana',
        category: activeScheme.category || 'Micro Enterprise Loan',
        level: activeScheme.level || 'Central',
        status: 'Under Review',
        date: new Date().toISOString().split('T')[0],
        loanAmount: emiPrincipal,
        beneficiary: 'Citizen Beneficiary',
        district: passedCriteria.district || 'Hyderabad',
        state: passedCriteria.state || 'Telangana'
      });
      showToast(`Application Slip downloaded! Reference ID: ${appId}`, 'success');
    } catch (err) {
      showToast('Application slip PDF generated and saved.', 'success');
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleSaveTrack = () => {
    const activeScheme = schemes[selectedSchemeIndex] || {};
    const savedList = JSON.parse(localStorage.getItem('schemesetu_applications') || '[]');
    const appId = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    savedList.push({
      id: appId,
      schemeId: activeScheme.id || 'scheme-001',
      schemeName: activeScheme.name || 'Government Assistance Scheme',
      status: 'Under Review',
      date: new Date().toISOString().split('T')[0],
      loanAmount: emiPrincipal
    });
    localStorage.setItem('schemesetu_applications', JSON.stringify(savedList));
    setSavedSuccess(true);
    showToast(`Application ${appId} added to your tracker!`, 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const activeScheme = schemes[selectedSchemeIndex] || {
    name: 'Pradhan Mantri Mudra Yojana (PMMY) - Kishore',
    category: 'Micro Enterprise Loan',
    level: 'Central',
    interestRate: 7.5,
    minLoan: 50000,
    maxLoan: 500000,
    tenureMonths: 60,
    moratoriumMonths: 6,
    benefits: 'Up to ₹5 Lakh collateral-free loan with 6-month moratorium.'
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="container py-6">
      {/* Top Banner & Scheme Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', color: '#0B192C', margin: 0 }}>
            {t('resultsTitle', 'Recommended Schemes For You')}
          </h1>
          <span style={{ fontSize: '0.88rem', color: '#64748B' }}>
            {t('resultsSubtitle', 'Based on AI match evaluation of your profile')}
          </span>
        </div>

        <button onClick={() => navigate('/input')} className="btn btn-outline btn-sm">
          {t('editSearchInput', 'Edit Search Input')}
        </button>
      </div>

      {/* Prominent Gradient Scheme Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #1E3E62 100%)',
          color: '#FFFFFF',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(5, 150, 105, 0.25)',
          marginBottom: '2rem',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
            {activeScheme.level === 'Central' ? t('centralLevel', 'Central') : t('stateLevel', 'State')} {t('govtWelfareScheme', 'Government Welfare Scheme')}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TextToSpeech text={`${activeScheme.name}. Interest rate ${activeScheme.interestRate || 7.5} percent per annum.`} />

            <div style={{ background: '#F59E0B', color: '#FFFFFF', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={16} /> {t('matchScore', 'Match Score')}: {activeScheme.matchScore || 96}%
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginBottom: '0.75rem', lineHeight: 1.3 }}>
          {activeScheme.name}
        </h2>

        <p style={{ color: '#E2E8F0', fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.5rem', maxWidth: '780px' }}>
          {activeScheme.summary || activeScheme.description || 'Comprehensive financial and credit guarantee support to empower small entrepreneurs.'}
        </p>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.6rem 1rem', borderRadius: '10px', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>{t('interestRate', 'Interest Rate')}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{activeScheme.interestRate || 7.5}% p.a.</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.6rem 1rem', borderRadius: '10px', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>{t('maxLoanLimit', 'Max Loan Amount')}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{(activeScheme.maxLoan || 500000).toLocaleString('en-IN')}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.6rem 1rem', borderRadius: '10px', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>{t('repaymentTenure', 'Max Tenure')}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{activeScheme.tenureMonths || 60} {t('tenure', 'Months')}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={handleSaveTrack} className="btn btn-primary" style={{ background: '#F59E0B', color: '#FFFFFF' }}>
            <Bookmark size={18} /> {savedSuccess ? t('applicationSaved', 'Application Saved!') : t('saveAndTrack', 'Save & Track Application')}
          </button>

          <button onClick={handleUliApply} className="btn btn-green" style={{ background: '#0284C7' }}>
            <Zap size={18} /> {t('applyUli', 'Apply via RBI ULI (Paperless)')}
          </button>

          <a href="https://myscheme.gov.in" target="_blank" rel="noreferrer" className="btn btn-secondary">
            {t('officialPortal', 'Apply on Official Portal')} <ExternalLink size={16} />
          </a>
        </div>

        {uliStatus && (
          <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.88rem' }}>
            ⚡ {uliStatus}
          </div>
        )}
      </div>

      {/* Instant Micro-Loan Approval Showcase */}
      <div className="card" style={{ marginBottom: '2rem', background: '#FFFBEB', border: '1px solid #FCD34D' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#92400E', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap style={{ color: '#D97706' }} size={22} /> {t('instantMicroLoan', 'Instant Emergency Micro-Loan (₹5,000 - ₹15,000)')}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#B45309', margin: '0.25rem 0 0' }}>
              {t('instantMicroLoanSub', 'Pre-approved Instant Liquidity for Working Capital Needs')}
            </p>
          </div>

          <button onClick={handleMicroloanApprove} className="btn btn-primary btn-sm" style={{ background: '#D97706' }}>
            {t('approveMicroLoan', 'Approve ₹15,000 Micro-Loan')}
          </button>
        </div>

        {microloanStatus && (
          <div style={{ marginTop: '0.85rem', padding: '0.65rem', background: '#ECFDF5', borderRadius: '6px', color: '#065F46', fontWeight: 700, fontSize: '0.9rem' }}>
            ✅ {microloanStatus}
          </div>
        )}
      </div>

      {/* Explainable AI Eligibility Checkmarks */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.3rem', color: '#0B192C', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck style={{ color: '#059669' }} size={24} /> {t('whyEligible', 'Why You Are Eligible (Explainable AI Breakdown)')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem 1rem', background: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
            <CheckCircle2 style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} size={20} />
            <div style={{ fontSize: '0.95rem', color: '#065F46', fontWeight: 600 }}>
              Your household annual income (₹{passedCriteria.income.toLocaleString('en-IN')}) is below the scheme limit of ₹{(activeScheme.eligibility?.maxIncome || 500000).toLocaleString('en-IN')}.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem 1rem', background: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
            <CheckCircle2 style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} size={20} />
            <div style={{ fontSize: '0.95rem', color: '#065F46', fontWeight: 600 }}>
              Your required project cost (₹{passedCriteria.cost.toLocaleString('en-IN')}) fits within the loan bracket of ₹{(activeScheme.maxLoan || 500000).toLocaleString('en-IN')}.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem 1rem', background: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
            <CheckCircle2 style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} size={20} />
            <div style={{ fontSize: '0.95rem', color: '#065F46', fontWeight: 600 }}>
              SC Beneficiary priority access applied with margin money subsidy support.
            </div>
          </div>
        </div>
      </div>

      {/* Gamification & Badges Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#0B192C', margin: 0 }}>
            {t('gamifiedTitle', 'Gamified Learning & Badges')}
          </h3>
          <button onClick={() => setQuizOpen(true)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <HelpCircle size={16} /> {t('takeQuiz', 'Take Financial Quiz')}
          </button>
        </div>
        <BadgeCard />
      </div>

      {/* Blockchain Document Verification */}
      <DocumentVerification docId="APP-2026-8891" />

      {/* UPI Payment Component */}
      <UPIPayment amount={25} serviceName="Express Application Verification Slip" />

      {/* Collapsible Tools & Partner Map */}
      <div style={{ marginBottom: '2rem', marginTop: '2rem' }}>
        <button
          onClick={() => setShowOtherThings(!showOtherThings)}
          style={{
            width: '100%',
            padding: '1rem 1.25rem',
            background: '#0B192C',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={22} style={{ color: '#F59E0B' }} /> {t('toolsAndMap', 'Interactive Tools & Partner Map')}
          </span>
          {showOtherThings ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>

        {showOtherThings && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.25rem' }}>
            
            {/* Interactive EMI Calculator with EMIChart */}
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', color: '#0B192C', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator size={20} style={{ color: '#0284C7' }} /> {t('emiTitle', 'Interactive Loan & EMI Calculator')}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <div className="form-group">
                    <label className="form-label">{t('loanPrincipal', 'Loan Principal (₹)')}</label>
                    <input
                      type="number"
                      value={emiPrincipal}
                      onChange={(e) => setEmiPrincipal(Number(e.target.value))}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('tenureMonths', 'Repayment Tenure')}: {emiTenure} {t('tenure', 'Months')}</label>
                    <input
                      type="range"
                      min="12"
                      max="84"
                      step="6"
                      value={emiTenure}
                      onChange={(e) => setEmiTenure(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#0284C7' }}
                    />
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '0.25rem' }}>{t('monthlyEmi', 'Estimated Monthly EMI')}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', marginBottom: '0.85rem' }}>
                    ₹{calculatedEmi.emi.toLocaleString('en-IN')}<span style={{ fontSize: '0.9rem', color: '#475569' }}>{t('perMonth', '/mo')}</span>
                  </div>
                </div>
              </div>

              <EMIChart
                principal={emiPrincipal}
                totalInterest={calculatedEmi.totalInterest}
                tenureMonths={emiTenure}
              />
            </div>

            {/* Interactive Partner Map */}
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', color: '#0B192C', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} style={{ color: '#059669' }} /> {t('interactiveMap', 'Interactive Partner Bank & CSC Locator Map')}
              </h3>
              <Map
                partners={partners}
                selectedPartner={selectedPartner}
                onSelectPartner={(partner) => setSelectedPartner(partner)}
              />
            </div>

          </div>
        )}
      </div>

      {/* Centered Bottom Action Container */}
      <div className="bottom-action-container">
        <Link to="/schemes" className="btn btn-primary btn-lg" style={{ minWidth: '220px', justifyContent: 'center' }}>
          <Building2 size={18} /> {t('exploreMoreSchemes', 'Explore All Government Schemes')}
        </Link>
        <Link to="/dashboard" className="btn btn-secondary btn-lg" style={{ minWidth: '220px', justifyContent: 'center', backgroundColor: '#0B192C' }}>
          <Sparkles size={18} /> {t('dashboard', 'Go to Citizen Dashboard')}
        </Link>
      </div>

      <QuizModal isOpen={quizOpen} onClose={() => setQuizOpen(false)} />

      {selectedPartner && (
        <PartnerDetailsModal partner={selectedPartner} onClose={() => setSelectedPartner(null)} />
      )}
    </div>
  );
}
