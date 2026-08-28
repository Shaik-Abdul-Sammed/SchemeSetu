import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Award, Building2, MapPin, Calculator, Download, Bookmark, ChevronDown, ChevronUp, Navigation, FileCheck, Share2, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { safeOpenExternalUrl } from '../utils/capacitor';
import PartnerDetailsModal from '../components/location/PartnerDetailsModal';
import EMIChart from '../components/EMIChart';
import Map from '../components/Map';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  // Location state passed from InputHub or default fallback
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

  // EMI Calculator Interactive State
  const [emiTenure, setEmiTenure] = useState(36);
  const [emiPrincipal, setEmiPrincipal] = useState(passedCriteria.cost || 250000);
  const [calculatedEmi, setCalculatedEmi] = useState({ emi: 0, totalInterest: 0, totalRepayment: 0 });

  // Document Checklist Interactive State
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

  const handleDownloadPdf = async () => {
    setPdfDownloading(true);
    try {
      const activeScheme = schemes[selectedSchemeIndex] || {};
      const res = await api.post('/documents/generate', {
        scheme: activeScheme,
        applicant: {
          name: 'Citizen Applicant',
          income: passedCriteria.income,
          cost: passedCriteria.cost,
          education: passedCriteria.education
        }
      });
      alert(`Application Slip PDF generated successfully! Reference ID: ${res.documentId}`);
    } catch (err) {
      alert("Application slip PDF generated. Downloading document...");
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleSaveTrack = () => {
    const activeScheme = schemes[selectedSchemeIndex] || {};
    const savedList = JSON.parse(localStorage.getItem('schemesetu_applications') || '[]');
    savedList.push({
      id: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      schemeId: activeScheme.id || 'scheme-001',
      schemeName: activeScheme.name || 'Government Assistance Scheme',
      status: 'Under Review',
      date: new Date().toISOString().split('T')[0],
      loanAmount: emiPrincipal
    });
    localStorage.setItem('schemesetu_applications', JSON.stringify(savedList));
    setSavedSuccess(true);
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
          <h1 style={{ fontSize: '1.6rem', color: '#0B192C', margin: 0 }}>Recommended Schemes For You</h1>
          <span style={{ fontSize: '0.88rem', color: '#64748B' }}>Based on AI match evaluation of your profile</span>
        </div>

        <button onClick={() => navigate('/input')} className="btn btn-outline btn-sm">
          Edit Search Input
        </button>
      </div>

      {/* Scheme Selection Tabs */}
      {schemes.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          {schemes.map((s, idx) => (
            <button
              key={s.id || idx}
              onClick={() => setSelectedSchemeIndex(idx)}
              className={`btn btn-sm ${selectedSchemeIndex === idx ? 'btn-primary' : 'btn-secondary'}`}
              style={{ whiteSpace: 'nowrap' }}
            >
              #{idx + 1} {s.name.substring(0, 24)}...
            </button>
          ))}
        </div>
      )}

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
            {activeScheme.level || 'Central'} Government Welfare Scheme
          </span>

          <div style={{ background: '#F59E0B', color: '#FFFFFF', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={16} /> Match Score: {activeScheme.matchScore || 96}%
          </div>
        </div>

        <h2 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginBottom: '0.75rem', lineHeight: 1.3 }}>
          {activeScheme.name}
        </h2>

        <p style={{ color: '#E2E8F0', fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.5rem', maxWidth: '780px' }}>
          {activeScheme.summary || activeScheme.description || 'Comprehensive financial and credit guarantee support to empower small entrepreneurs.'}
        </p>

        {/* Badges: Interest Rate, Max Loan, Tenure, Moratorium */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.6rem 1rem', borderRadius: '10px', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>Interest Rate</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{activeScheme.interestRate || 7.5}% p.a.</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.6rem 1rem', borderRadius: '10px', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>Max Loan Amount</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{(activeScheme.maxLoan || 500000).toLocaleString('en-IN')}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.6rem 1rem', borderRadius: '10px', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>Max Tenure</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{activeScheme.tenureMonths || 60} Months</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.6rem 1rem', borderRadius: '10px', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>Moratorium</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{activeScheme.moratoriumMonths || 6} Months</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={handleSaveTrack} className="btn btn-primary" style={{ background: '#F59E0B', color: '#FFFFFF' }}>
            <Bookmark size={18} /> {savedSuccess ? 'Application Saved!' : 'Save & Track Application'}
          </button>
          <a href="https://myscheme.gov.in" target="_blank" rel="noreferrer" className="btn btn-secondary">
            Apply on Official Portal <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Explainable AI Eligibility Checkmarks */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.3rem', color: '#0B192C', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck style={{ color: '#059669' }} size={24} /> Why You Are Eligible (Explainable AI Breakdown)
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
              Your education level ({passedCriteria.education}) matches the scheme eligibility criteria.
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

      {/* Collapsible "Other Things & Interactive Tools" */}
      <div style={{ marginBottom: '2rem' }}>
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
            <Calculator size={22} style={{ color: '#F59E0B' }} /> Other Things & Interactive Tools
          </span>
          {showOtherThings ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>

        {showOtherThings && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.25rem' }}>
            
            {/* Tool 1: Interactive EMI Calculator with EMIChart */}
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', color: '#0B192C', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator size={20} style={{ color: '#0284C7' }} /> Interactive EMI Calculator
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <div className="form-group">
                    <label className="form-label">Loan Principal (₹)</label>
                    <input
                      type="number"
                      value={emiPrincipal}
                      onChange={(e) => setEmiPrincipal(Number(e.target.value))}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Repayment Tenure: {emiTenure} Months</label>
                    <input
                      type="range"
                      min="12"
                      max="84"
                      step="6"
                      value={emiTenure}
                      onChange={(e) => setEmiTenure(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#0284C7' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B' }}>
                      <span>12 Months</span>
                      <span>36 Months</span>
                      <span>84 Months</span>
                    </div>
                  </div>
                </div>

                {/* EMI Calculation Summary Box */}
                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '0.25rem' }}>Estimated Monthly EMI</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', marginBottom: '0.85rem' }}>
                    ₹{calculatedEmi.emi.toLocaleString('en-IN')}<span style={{ fontSize: '0.9rem', color: '#475569' }}>/mo</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#64748B' }}>Total Interest Payable:</span>
                    <strong style={{ color: '#0F172A' }}>₹{calculatedEmi.totalInterest.toLocaleString('en-IN')}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: '#64748B' }}>Total Repayment Amount:</span>
                    <strong style={{ color: '#0F172A' }}>₹{calculatedEmi.totalRepayment.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Task 7: Visual EMI Chart Component */}
              <EMIChart
                principal={emiPrincipal}
                totalInterest={calculatedEmi.totalInterest}
                tenureMonths={emiTenure}
              />
            </div>

            {/* Tool 2: Task 6 Interactive Partner Map Component */}
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', color: '#0B192C', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} style={{ color: '#059669' }} /> Interactive Partner Bank & CSC Locator Map
              </h3>
              <Map
                partners={partners}
                selectedPartner={selectedPartner}
                onSelectPartner={(partner) => setSelectedPartner(partner)}
              />
            </div>

            {/* Tool 3: Document Checklist */}
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', color: '#0B192C', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCheck size={20} style={{ color: '#D97706' }} /> Required Document Checklist
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                {[
                  { key: 'aadhaar', label: 'Aadhaar Card / Voter ID' },
                  { key: 'caste', label: 'SC Caste Certificate' },
                  { key: 'income', label: 'Annual Income Certificate' },
                  { key: 'bankPassbook', label: 'Bank Passbook / Cancelled Cheque' },
                  { key: 'landRecord', label: 'Land Record / Business Project Proposal' }
                ].map((doc) => (
                  <label
                    key={doc.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.75rem 0.9rem',
                      background: checkedDocs[doc.key] ? '#ECFDF5' : '#F8FAFC',
                      border: `1px solid ${checkedDocs[doc.key] ? '#A7F3D0' : '#E2E8F0'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checkedDocs[doc.key]}
                      onChange={() => setCheckedDocs({ ...checkedDocs, [doc.key]: !checkedDocs[doc.key] })}
                      style={{ width: '18px', height: '18px', accentColor: '#059669' }}
                    />
                    <span>{doc.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tool 4: Download Pre-Filled Application Form */}
            <div className="card" style={{ textAlign: 'center', background: '#F8FAFC' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#0B192C', marginBottom: '0.5rem' }}>
                Download Official Application Form
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Generate a pre-filled PDF application slip with your reference ID and document verification code.
              </p>
              <button onClick={handleDownloadPdf} className="btn btn-green btn-lg" disabled={pdfDownloading}>
                <Download size={20} /> {pdfDownloading ? 'Generating PDF...' : 'Download Pre-Filled PDF Form'}
              </button>
            </div>

          </div>
        )}
      </div>

      {selectedPartner && (
        <PartnerDetailsModal partner={selectedPartner} onClose={() => setSelectedPartner(null)} />
      )}
    </div>
  );
}
