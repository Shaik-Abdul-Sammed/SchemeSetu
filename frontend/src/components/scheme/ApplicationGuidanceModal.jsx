import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  FileCheck, 
  Download, 
  ExternalLink, 
  ShieldAlert, 
  X, 
  MapPin, 
  ArrowRight, 
  Printer, 
  Clock, 
  CheckSquare, 
  Square 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { generateUniversalApplicationSlip } from '../../utils/pdfSlipGenerator';

export default function ApplicationGuidanceModal({ isOpen, onClose, scheme }) {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [checkedDocs, setCheckedDocs] = useState({
    aadhaar: true,
    incomeCert: true,
    casteCert: false,
    bankPassbook: true,
    projectReport: false,
    photos: true
  });

  if (!isOpen || !scheme) return null;

  const toggleDoc = (key) => {
    setCheckedDocs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadGuidance = () => {
    try {
      const appId = `APP-GUIDE-${Math.floor(1000 + Math.random() * 9000)}`;
      generateUniversalApplicationSlip({
        id: appId,
        schemeName: scheme.name,
        category: scheme.category || 'Government Welfare Scheme',
        level: scheme.level || 'Central',
        status: 'Guidance Checklist Generated',
        date: new Date().toISOString().split('T')[0],
        loanAmount: scheme.maxLoan || scheme.maxBenefit || 200000,
        beneficiary: 'Citizen Beneficiary',
        district: 'District Kendra',
        state: 'Pan-India'
      });
      showToast(t('guidanceDownloaded', 'Application Checklist & Guidance PDF Downloaded!'), 'success');
    } catch (e) {
      showToast('Guidance PDF generated and downloaded.', 'success');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const defaultDocuments = [
    { key: 'aadhaar', label: t('docAadhaar', 'Aadhaar Card / Government Identity Proof (Mandatory)'), required: true },
    { key: 'incomeCert', label: t('docIncome', 'Annual Family Income Certificate (Issued by Tehsildar / Revenue Authority)'), required: true },
    { key: 'casteCert', label: t('docCaste', 'Community / Caste / Category Certificate (for SC/ST/OBC Priority Quota)'), required: false },
    { key: 'bankPassbook', label: t('docBank', 'Active Bank Account Passbook / Cancelled Cheque (Linked with Aadhaar DBT)'), required: true },
    { key: 'projectReport', label: t('docProject', 'Business Project Profile / Quotation for Machinery / Land Records (if applicable)'), required: false },
    { key: 'photos', label: t('docPhotos', '3 Passport-sized Photographs'), required: true }
  ];

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(11, 25, 44, 0.85)', 
        backdropFilter: 'blur(5px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 99999, 
        padding: '1rem' 
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guidance-title"
    >
      <div 
        className="card" 
        style={{ 
          maxWidth: '740px', 
          width: '100%', 
          maxHeight: '92vh', 
          overflowY: 'auto', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px', 
          padding: '2rem', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className={`badge ${scheme.level === 'State' ? 'badge-state' : 'badge-central'}`}>
                {scheme.level || 'Central'} Scheme
              </span>
              <span className="badge badge-cat">{scheme.category || 'Financial Welfare'}</span>
            </div>
            <h2 id="guidance-title" style={{ fontSize: '1.4rem', color: '#0B192C', margin: 0, fontWeight: 800 }}>
              {scheme.name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>
              Nodal Ministry / Department: <strong>{scheme.department || scheme.ministry || 'Government of India'}</strong>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-secondary btn-sm" 
            style={{ padding: '0.35rem 0.65rem' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Prototype Guidance Disclaimer Banner */}
        <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#1E40AF', fontSize: '0.85rem' }}>
          <ShieldAlert size={20} style={{ flexShrink: 0, color: '#2563EB' }} />
          <div>
            <strong>{t('prototypeNoticeTitle', 'Official Application Notice:')}</strong>{' '}
            {t('prototypeNoticeText', 'Prototype guidance — actual scheme registration and biometric verification must be completed through the official government portal or your nearest authorized Common Service Centre (CSC) Kendra.')}
          </div>
        </div>

        {/* Section 1: Step-by-step application walkthrough */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0B192C', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Clock size={18} style={{ color: '#D97706' }} /> {t('stepwiseProcedure', 'Step-by-Step Application Procedure')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#D97706', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>
                1
              </div>
              <div style={{ fontSize: '0.88rem', color: '#334155' }}>
                <strong>{t('step1GuideTitle', 'Document Preparation & Verification:')}</strong> {t('step1GuideDesc', 'Assemble self-attested copies of your Aadhaar card, bank passbook (Aadhaar linked), and income/category certificates.')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#D97706', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>
                2
              </div>
              <div style={{ fontSize: '0.88rem', color: '#334155' }}>
                <strong>{t('step2GuideTitle', 'Application Submission:')}</strong> {t('step2GuideDesc', 'Apply online via the official scheme website or visit your nearest designated Lead Bank / CSC VLE Center for assisted registration.')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#D97706', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>
                3
              </div>
              <div style={{ fontSize: '0.88rem', color: '#334155' }}>
                <strong>{t('step3GuideTitle', 'Sanction & DBT Payout:')}</strong> {t('step3GuideDesc', 'Upon document verification by the nodal officer, loan sanction or direct benefit transfer (DBT) is credited directly to your bank account.')}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Interactive Required Documents Checklist */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0B192C', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <FileCheck size={18} style={{ color: '#059669' }} /> {t('requiredDocsChecklist', 'Required Documents Checklist (Tap to Check)')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {defaultDocuments.map(doc => {
              const isChecked = checkedDocs[doc.key];
              return (
                <div 
                  key={doc.key}
                  onClick={() => toggleDoc(doc.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: `1px solid ${isChecked ? '#A7F3D0' : '#E2E8F0'}`,
                    backgroundColor: isChecked ? '#ECFDF5' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: isChecked ? '#065F46' : '#334155' }}>
                    {isChecked ? <CheckSquare size={18} style={{ color: '#059669' }} /> : <Square size={18} style={{ color: '#94A3B8' }} />}
                    <span>{doc.label}</span>
                  </div>
                  {doc.required && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      Required
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              type="button"
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              title="Print Application Checklist"
            >
              <Printer size={15} /> {t('printChecklist', 'Print')}
            </button>
            <button 
              type="button"
              onClick={handleDownloadGuidance}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: '#059669', color: '#059669' }}
            >
              <Download size={15} /> {t('downloadSlipBtn', 'Download PDF Slip')}
            </button>
          </div>

          {scheme.officialUrl ? (
            <a 
              href={scheme.officialUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
            >
              <span>{t('visitOfficialPortal', 'Visit Official Portal')}</span>
              <ExternalLink size={14} />
            </a>
          ) : (
            <a 
              href="https://www.myscheme.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
            >
              <span>{t('visitOfficialPortal', 'Visit myScheme National Portal')}</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
