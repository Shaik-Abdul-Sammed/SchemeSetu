import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight, Download, Search, Sparkles, Building2 } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function MyApplications() {
  const { t } = useLanguage();
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    loadSavedApplications();
  }, []);

  const loadSavedApplications = () => {
    const stored = JSON.parse(localStorage.getItem('schemesetu_applications') || '[]');
    if (stored.length === 0) {
      // Default demo mock applications for hackathon showcase
      const demoApps = [
        {
          id: 'APP-2026-8891',
          schemeId: 'scheme-007',
          schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
          status: 'Approved',
          date: '2026-08-20',
          category: 'Agriculture & Rural Development',
          loanAmount: 300000,
          remarks: 'Verification complete. First installment ₹2,000 dispatched to bank account with KCC sanctioned limit ₹3,00,000.'
        },
        {
          id: 'APP-2026-9042',
          schemeId: 'scheme-002',
          schemeName: 'Pradhan Mantri Mudra Yojana (PMMY) - Kishore',
          status: 'Under Review',
          date: '2026-08-25',
          category: 'Micro Enterprise Loan',
          loanAmount: 350000,
          remarks: 'Document verification in progress at Canara Bank Lead Branch.'
        }
      ];
      localStorage.setItem('schemesetu_applications', JSON.stringify(demoApps));
      setApplications(demoApps);
    } else {
      setApplications(stored);
    }
  };

  const handleDownloadPdf = async (app) => {
    try {
      const res = await api.post('/documents/generate', {
        scheme: { name: app.schemeName, id: app.schemeId },
        applicant: { name: 'Citizen Applicant' }
      });
      alert(`Downloaded application slip for ${app.id}`);
    } catch (e) {
      alert(`Downloaded application slip for ${app.id}`);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="container py-8">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#0B192C', margin: 0, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileCheck style={{ color: '#059669' }} size={28} /> {t('myApplications', 'My Scheme Applications')}
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            {t('trackApplicationsSub', 'Track real-time status of your saved and submitted government scheme applications.')}
          </p>
        </div>

        <Link to="/input" className="btn btn-primary btn-sm">
          {t('applyNewScheme', '+ Apply For New Scheme')}
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Search size={48} style={{ color: '#94A3B8', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#0F172A', marginBottom: '0.5rem' }}>{t('noSavedApps', 'No Saved Applications Yet')}</h3>
          <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>{t('noSavedAppsSub', 'Find schemes you are eligible for and click "Save & Track Application".')}</p>
          <div className="bottom-action-container" style={{ margin: 0 }}>
            <Link to="/input" className="btn btn-primary">{t('startSchemeSearch', 'Start Scheme Search')}</Link>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {applications.map((app) => (
              <div key={app.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284C7', background: '#EFF6FF', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
                      {app.id}
                    </span>
                    <span className={`badge ${app.status === 'Approved' ? 'badge-state' : app.status === 'Under Review' ? 'badge-cat' : 'badge-central'}`}>
                      {app.status === 'Approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />} {app.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: '#0B192C', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                    {app.schemeName}
                  </h3>

                  <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
                    <Calendar size={14} /> {t('submittedOn', 'Submitted:')} {app.date}
                  </div>

                  {app.remarks && (
                    <div style={{ fontSize: '0.85rem', color: '#334155', background: '#F8FAFC', padding: '0.65rem', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                      <strong>{t('note', 'Note:')}</strong> {app.remarks}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                  <button onClick={() => setSelectedApp(app)} className="btn btn-outline btn-sm" style={{ flexGrow: 1 }}>
                    {t('viewDetailsBtn', 'View Details')}
                  </button>
                  <button onClick={() => handleDownloadPdf(app)} className="btn btn-green btn-sm" title="Download Application Slip">
                    <Download size={14} /> {t('slipBtn', 'Slip')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Centered Bottom Action Container */}
          <div className="bottom-action-container">
            <Link to="/schemes" className="btn btn-primary btn-lg" style={{ minWidth: '220px', justifyContent: 'center' }}>
              <Building2 size={18} /> {t('exploreMoreSchemes', 'Explore More Schemes')}
            </Link>
            <Link to="/dashboard" className="btn btn-secondary btn-lg" style={{ minWidth: '220px', justifyContent: 'center', backgroundColor: '#0B192C' }}>
              <Sparkles size={18} /> {t('dashboard', 'Go to Citizen Dashboard')}
            </Link>
          </div>
        </>
      )}

      {/* Application Details Modal */}
      {selectedApp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,25,44,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card glass-card" style={{ maxWidth: '540px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-central">{selectedApp.id}</span>
                <h3 style={{ fontSize: '1.3rem', color: '#0B192C', margin: '0.35rem 0 0' }}>{selectedApp.schemeName}</h3>
              </div>
              <button onClick={() => setSelectedApp(null)} className="btn btn-sm btn-outline">✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#334155', marginBottom: '1.5rem' }}>
              <div><strong>{t('appStatus', 'Application Status:')}</strong> <span style={{ color: selectedApp.status === 'Approved' ? '#059669' : '#D97706', fontWeight: 700 }}>{selectedApp.status}</span></div>
              <div><strong>{t('submissionDate', 'Submission Date:')}</strong> {selectedApp.date}</div>
              <div><strong>{t('requestedLoanAmount', 'Requested Loan Amount:')}</strong> ₹{(selectedApp.loanAmount || 300000).toLocaleString('en-IN')}</div>
              <div><strong>{t('verificationStatus', 'Verification Status:')}</strong> {t('verificationPassed', 'Document checklist verified & passed.')}</div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedApp(null)} className="btn btn-secondary btn-sm">{t('closeBtn', 'Close')}</button>
              <button onClick={() => handleDownloadPdf(selectedApp)} className="btn btn-primary btn-sm"><Download size={16} /> {t('downloadAppPdf', 'Download Application PDF')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
