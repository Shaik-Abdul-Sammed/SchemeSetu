import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Download, 
  Search, 
  Sparkles, 
  Building2,
  X,
  ShieldCheck,
  Phone,
  LayoutDashboard,
  FileText
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { downloadApplicationSlipPdf } from '../utils/pdfSlipGenerator';

export default function MyApplications() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    loadSavedApplications();
  }, []);

  const loadSavedApplications = () => {
    const stored = JSON.parse(localStorage.getItem('schemesetu_applications') || '[]');
    if (stored.length === 0) {
      // Centralized prototype applications for SIH 2026 showcase
      const demoApps = [
        {
          id: 'APP-2026-8891',
          schemeId: 'scheme-007',
          schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
          status: 'Approved',
          date: '2026-08-20',
          category: 'Agriculture & Rural Development',
          loanAmount: 300000,
          applicant: 'Demo Applicant (Ramesh Kumar)',
          phone: '+91 98765 43210',
          nodalBranch: 'Nodal Lead District Branch, SBI Hyderabad',
          remarks: 'Verification complete. First installment ₹2,000 dispatched to bank account with KCC sanctioned limit ₹3,00,000.',
          timelineStep: 4, // 1: Submitted, 2: Verified, 3: Review, 4: Disbursed
          nextStep: 'DBT funds will credit automatically to your Aadhaar-seeded primary savings account.'
        },
        {
          id: 'APP-2026-9042',
          schemeId: 'scheme-002',
          schemeName: 'Pradhan Mantri Mudra Yojana (PMMY) - Kishore',
          status: 'Under Review',
          date: '2026-08-25',
          category: 'Micro Enterprise Loan',
          loanAmount: 350000,
          applicant: 'Demo Applicant (Ramesh Kumar)',
          phone: '+91 98765 43210',
          nodalBranch: 'Canara Bank Micro-Finance Branch',
          remarks: 'Document verification in progress. Field officer inspection scheduled for next working cycle.',
          timelineStep: 3,
          nextStep: 'Visit the designated branch with original Aadhaar and business quotation within 7 days.'
        }
      ];
      localStorage.setItem('schemesetu_applications', JSON.stringify(demoApps));
      setApplications(demoApps);
    } else {
      setApplications(stored);
    }
  };

  const handleDownloadPdf = async (app) => {
    setDownloadingId(app.id);
    try {
      await downloadApplicationSlipPdf(app, user || { name: app.applicant || 'Demo Applicant' });
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="badge badge-eligible" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={12} /> {t('statusApproved', 'Approved')}
          </span>
        );
      case 'Under Review':
        return (
          <span className="badge badge-cat" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={12} /> {t('statusUnderReview', 'Under Review')}
          </span>
        );
      case 'Rejected':
        return (
          <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <AlertCircle size={12} /> {t('statusRejected', 'Rejected')}
          </span>
        );
      default:
        return (
          <span className="badge badge-central" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={12} /> {t('statusSubmitted', 'Submitted')}
          </span>
        );
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="container py-8">
      
      {/* Top Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#0B192C', margin: 0, display: 'flex', alignItems: 'center', gap: '0.65rem', fontWeight: 800 }}>
            <FileCheck style={{ color: '#059669' }} size={28} /> {t('myApplications', 'My Scheme Applications')}
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>
            {t('trackApplicationsSub', 'Track real-time status of your saved and submitted government scheme applications.')}
          </p>
        </div>

        <Link to="/schemes" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
          {t('applyNewScheme', '+ Apply For New Scheme')}
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Search size={48} style={{ color: '#94A3B8', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0F172A', marginBottom: '0.5rem', fontWeight: 700 }}>
            {t('noSavedApps', 'No Saved Applications Yet')}
          </h3>
          <p style={{ color: '#64748B', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            {t('noSavedAppsSub', 'Find schemes you are eligible for and submit an application.')}
          </p>
          <div className="bottom-action-container" style={{ margin: 0 }}>
            <Link to="/schemes" className="btn btn-primary">
              <Sparkles size={16} /> {t('exploreSchemes', 'Explore Schemes')}
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Applications Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.25rem' }}>
            {applications.map((app) => (
              <div key={app.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284C7', background: '#EFF6FF', padding: '0.25rem 0.65rem', borderRadius: '6px', fontFamily: 'monospace' }}>
                      {app.id}
                    </span>
                    {getStatusBadge(app.status)}
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: '#0B192C', marginBottom: '0.5rem', lineHeight: 1.35, fontWeight: 700 }}>
                    {app.schemeName}
                  </h3>

                  <div style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.85rem' }}>
                    <Calendar size={14} /> {t('submissionDate', 'Submitted:')} {app.date}
                  </div>

                  {app.remarks && (
                    <div style={{ fontSize: '0.82rem', color: '#334155', background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                      <strong>{t('importantNote', 'Note:')}</strong> {app.remarks}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                  <button 
                    onClick={() => setSelectedApp(app)} 
                    className="btn btn-outline btn-sm" 
                    style={{ flexGrow: 1, fontWeight: 600 }}
                  >
                    {t('viewDetailsBtn', 'View Details')}
                  </button>
                  <button 
                    onClick={() => handleDownloadPdf(app)} 
                    disabled={downloadingId === app.id}
                    className="btn btn-green btn-sm" 
                    style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    title="Download Official Application Slip (PDF)"
                  >
                    <Download size={14} className={downloadingId === app.id ? 'animate-bounce' : ''} /> 
                    {downloadingId === app.id ? 'Generating...' : t('slipBtn', 'Slip (PDF)')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="bottom-action-container" style={{ marginTop: '2.5rem' }}>
            <Link to="/schemes" className="btn btn-primary btn-lg" style={{ minWidth: '220px', justifyContent: 'center', fontWeight: 700 }}>
              <Building2 size={18} /> {t('exploreMoreSchemes', 'Explore Government Schemes')}
            </Link>
            <Link to="/dashboard" className="btn btn-secondary btn-lg" style={{ minWidth: '220px', justifyContent: 'center', backgroundColor: '#0B192C', color: '#FFFFFF', fontWeight: 700 }}>
              <LayoutDashboard size={18} /> {t('goToDashboard', 'Go to Citizen Dashboard')}
            </Link>
          </div>
        </>
      )}

      {/* 2. FUNCTIONAL APPLICATION DETAILS MODAL */}
      {selectedApp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(11, 25, 44, 0.8)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#1D4ED8', background: '#EFF6FF', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700 }}>
                  {selectedApp.id}
                </span>
                <h2 style={{ fontSize: '1.3rem', color: '#0B192C', margin: '0.4rem 0 0', fontWeight: 800 }}>
                  {selectedApp.schemeName}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedApp(null)} 
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.25rem' }}
                aria-label="Close details"
              >
                <X size={22} />
              </button>
            </div>

            {/* Visual 4-Step Application Timeline */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                {t('applicationTimeline', 'Application Stage Timeline')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: '0.35rem' }}>
                <span style={{ color: '#059669' }}>1. {t('stepSubmitted', 'Submitted')}</span>
                <span style={{ color: '#059669' }}>2. {t('stepVerified', 'Verified')}</span>
                <span style={{ color: selectedApp.timelineStep >= 3 ? '#059669' : '#94A3B8' }}>3. {t('stepReview', 'Review')}</span>
                <span style={{ color: selectedApp.timelineStep >= 4 ? '#059669' : '#94A3B8' }}>4. {t('stepDisbursed', 'Disbursed')}</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: selectedApp.status === 'Approved' ? '100%' : '70%', 
                    backgroundColor: selectedApp.status === 'Approved' ? '#059669' : '#D97706',
                    transition: 'width 0.4s ease'
                  }} 
                />
              </div>
            </div>

            {/* Application Data Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: '#334155', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: '0.35rem' }}>
                <span style={{ color: '#64748B' }}>{t('applicantName', 'Applicant Name:')}</span>
                <strong>{selectedApp.applicant || user?.name || 'Demo Applicant (Ramesh Kumar)'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: '0.35rem' }}>
                <span style={{ color: '#64748B' }}>{t('submissionDate', 'Submission Date:')}</span>
                <strong>{selectedApp.date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: '0.35rem' }}>
                <span style={{ color: '#64748B' }}>{t('requestedAmount', 'Requested Loan / Benefit:')}</span>
                <strong style={{ color: '#059669' }}>₹{(selectedApp.loanAmount || 300000).toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: '0.35rem' }}>
                <span style={{ color: '#64748B' }}>{t('nodalBranch', 'Nodal Branch:')}</span>
                <strong>{selectedApp.nodalBranch || 'SBI District Lead Branch'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: '0.35rem' }}>
                <span style={{ color: '#64748B' }}>{t('verificationStatus', 'Verification Status:')}</span>
                <strong style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={14} /> {t('verificationPassed', 'e-KYC Verified & DBT Linked')}
                </strong>
              </div>
            </div>

            {/* Note and Next Step */}
            <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.85rem', borderRadius: '8px', fontSize: '0.84rem', color: '#1E40AF', marginBottom: '1.5rem', lineHeight: 1.4 }}>
              <strong>{t('nextStepsTitle', 'Next Step Action:')}</strong> {selectedApp.nextStep || 'Keep your original Aadhaar and bank passbook handy for branch verification.'}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setSelectedApp(null)} 
                className="btn btn-secondary btn-sm"
              >
                {t('closeBtn', 'Close')}
              </button>
              <button 
                onClick={() => handleDownloadPdf(selectedApp)} 
                disabled={downloadingId === selectedApp.id}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
              >
                <Download size={15} className={downloadingId === selectedApp.id ? 'animate-bounce' : ''} /> 
                {downloadingId === selectedApp.id ? 'Generating...' : t('downloadAppPdf', 'Download Application Slip (PDF)')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
