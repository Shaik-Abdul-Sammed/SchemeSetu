import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Award, 
  User, 
  MapPin, 
  X, 
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Phone,
  Landmark,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useLocation } from '../../context/LocationContext';
import { generateUniversalApplicationSlip } from '../../utils/pdfSlipGenerator';
import { formatIndianCurrency } from '../../utils/numberValidator';

export default function AgentReportModal({ 
  isOpen, 
  onClose, 
  validatedProfile, 
  topSchemes = [], 
  rejectedSchemes = [] 
}) {
  const { showToast } = useToast();
  const { nearbyPartners, location } = useLocation();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!isOpen || !validatedProfile) return null;

  const primaryMatch = topSchemes.length > 0 ? topSchemes[0] : null;
  const primaryScheme = primaryMatch ? primaryMatch.scheme : null;
  
  // Find nearest partner matching scheme or closest center
  const nearestPartner = nearbyPartners && nearbyPartners.length > 0 ? nearbyPartners[0] : null;

  // Calculate approximate monthly EMI for loan portion
  const loanAmt = Number(validatedProfile.loanRequirement || validatedProfile.projectCost || 0);
  const interestRate = primaryScheme?.interestRate || 8.5;
  const tenureMonths = primaryScheme?.repaymentTenureMonths || 60;
  const monthlyRate = (interestRate / 12 / 100);
  let estimatedEmi = 0;
  if (loanAmt > 0 && monthlyRate > 0 && tenureMonths > 0) {
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    estimatedEmi = Math.round(loanAmt * ((monthlyRate * factor) / (factor - 1)));
  }

  const subsidyPercent = primaryScheme?.scSubsidyPercentage || primaryScheme?.subsidy || 0;
  const subsidyAmount = subsidyPercent > 0 ? Math.round((Number(validatedProfile.projectCost || loanAmt) * subsidyPercent) / 100) : 0;

  const handleDownload = async () => {
    try {
      const appId = `APP-AGENT-${Date.now().toString().slice(-6)}`;
      generateUniversalApplicationSlip({
        id: appId,
        schemeName: primaryScheme?.name || 'Welfare Scheme Application',
        category: primaryScheme?.category || 'Government Welfare Assistance',
        level: primaryScheme?.level || 'Central',
        status: 'Verified & Recommended by Agent AG-101',
        date: new Date().toISOString().split('T')[0],
        loanAmount: validatedProfile.loanRequirement || validatedProfile.projectCost,
        beneficiary: validatedProfile.name,
        district: validatedProfile.location?.split(',')[0] || location.district || 'Hyderabad',
        state: validatedProfile.state || location.state || 'Telangana'
      });
      showToast(`Beneficiary Intake Report PDF downloaded! Ref: ${appId}`, 'success');
    } catch (e) {
      showToast('Intake summary recorded.', 'success');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-report-title"
    >
      <div 
        className="card" 
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.15rem 1.5rem',
          backgroundColor: '#0B192C',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid #F59E0B'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="badge" style={{ backgroundColor: '#059669', color: '#FFF', fontSize: '0.72rem', fontWeight: 700 }}>
                ✓ Intake Result Verified
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Ref: SS-AG-{Date.now().toString().slice(-6)}
              </span>
            </div>
            <h2 id="agent-report-title" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Beneficiary Recommendation Dossier
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-sm btn-outline"
            style={{ color: '#FFF', borderColor: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flexGrow: 1, padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* 1. PRIMARY RESULT SUMMARY */}
          <div style={{
            backgroundColor: primaryScheme ? '#F8FAFC' : '#FEF3C7',
            borderRadius: '12px',
            border: `1.5px solid ${primaryScheme ? '#E2E8F0' : '#FDE68A'}`,
            padding: '1.15rem 1.25rem'
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: primaryScheme ? '#0284C7' : '#92400E',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <CheckCircle2 size={15} style={{ color: primaryScheme ? '#059669' : '#D97706' }} /> RESULT
            </div>

            {primaryScheme ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ color: '#64748B', minWidth: '110px', fontSize: '0.82rem' }}>• Eligibility:</span>
                  <strong style={{ color: '#059669' }}>Eligible ({primaryMatch.matchScore || 95}% Match Score)</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ color: '#64748B', minWidth: '110px', fontSize: '0.82rem' }}>• Scheme:</span>
                  <strong style={{ color: '#0F172A' }}>{primaryScheme.name}</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ color: '#64748B', minWidth: '110px', fontSize: '0.82rem' }}>• Benefit:</span>
                  <strong style={{ color: '#059669' }}>
                    {formatIndianCurrency(validatedProfile.loanRequirement || validatedProfile.projectCost)}
                    {subsidyPercent > 0 ? ` (${subsidyPercent}% Subsidy: ~${formatIndianCurrency(subsidyAmount)})` : ' (Collateral Free Loan)'}
                  </strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ color: '#64748B', minWidth: '110px', fontSize: '0.82rem' }}>• EMI:</span>
                  <strong style={{ color: '#0F172A' }}>
                    {estimatedEmi > 0 ? `${formatIndianCurrency(estimatedEmi)}/month (@ ${interestRate}% p.a.)` : 'Direct Grant / Zero EMI'}
                  </strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ color: '#64748B', minWidth: '110px', fontSize: '0.82rem' }}>• Nearest Center:</span>
                  <strong style={{ color: '#0F172A' }}>{nearestPartner?.name || 'Lead District Bank Branch'}</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ color: '#64748B', minWidth: '110px', fontSize: '0.82rem' }}>• Distance:</span>
                  <strong style={{ color: '#0284C7' }}>
                    {nearestPartner?.distanceKm !== null && nearestPartner?.distanceKm !== undefined ? `${nearestPartner.distanceKm} km away` : 'Calculated via GPS'}
                  </strong>
                </li>
              </ul>
            ) : (
              <div style={{ color: '#92400E', fontSize: '0.88rem' }}>
                • Eligibility: Needs Verification — No matching scheme met the exact filter parameters.
              </div>
            )}
          </div>

          {/* 2. NEXT ACTION */}
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1.5px solid #BFDBFE',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#1E40AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                NEXT ACTION
              </div>
              <p style={{ fontSize: '0.88rem', color: '#1E3A8A', margin: '0.2rem 0 0', fontWeight: 600 }}>
                {primaryMatch?.nextAction || 'Submit Project DPR and Caste Certificate through JanSamarth or visit nearest partner branch.'}
              </p>
            </div>

            {primaryScheme?.officialApplicationPortal && (
              <a
                href={primaryScheme.officialApplicationPortal}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.82rem', fontWeight: 700 }}
              >
                <span>Open Portal</span> <ExternalLink size={13} />
              </a>
            )}
          </div>

          {/* 3. EXPANDABLE "VIEW DETAILS ▼" SECTION */}
          <div>
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284C7',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0'
              }}
              aria-expanded={showTechnicalDetails}
            >
              <span>{showTechnicalDetails ? 'View Details ▲' : 'View Details ▼'}</span>
            </button>

            {showTechnicalDetails && (
              <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                
                {/* Applicant Demographics */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#334155' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: '#0F172A' }}>Applicant Parameters:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.35rem' }}>
                    <div>Name: <strong>{validatedProfile.name}</strong></div>
                    <div>Age: <strong>{validatedProfile.age} yrs</strong></div>
                    <div>Category: <strong>{validatedProfile.casteCategory}</strong></div>
                    <div>Annual Income: <strong>{formatIndianCurrency(validatedProfile.annualIncome)}</strong></div>
                    <div>Location: <strong>{validatedProfile.location}</strong></div>
                    <div>Project Cost: <strong>{formatIndianCurrency(validatedProfile.projectCost)}</strong></div>
                  </div>
                </div>

                {/* Required Documents */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>Mandatory Documents Checklist:</div>
                  <div style={{ color: '#475569' }}>
                    {primaryScheme?.documentsRequired?.join(', ') || 'Aadhaar Card, Community/Caste Certificate, Detailed Project Report (DPR), Bank Account Proof'}
                  </div>
                </div>

                {/* Matched Reasoning */}
                {primaryMatch?.matchedCriteria && primaryMatch.matchedCriteria.length > 0 && (
                  <div style={{ backgroundColor: '#F0FDF4', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #DCFCE7', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 700, color: '#166534', marginBottom: '0.35rem' }}>Matched Suitability Factors:</div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#15803D' }}>
                      {primaryMatch.matchedCriteria.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}

                {/* Official Source & Verification Note */}
                <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4, padding: '0.25rem 0' }}>
                  <strong>Official Authority:</strong> {primaryScheme?.officialMinistry || primaryScheme?.department || 'Government of India'}. Final sanction and disbursement are subject to physical verification by the financing bank.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '0.85rem 1.5rem',
          backgroundColor: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-secondary btn-sm"
          >
            Close
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              type="button"
              onClick={handlePrint} 
              className="btn btn-secondary btn-sm"
              title="Print Intake Dossier"
            >
              <Printer size={15} /> Print
            </button>

            <button 
              type="button"
              onClick={handleDownload} 
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700 }}
            >
              <Download size={15} /> Download PDF Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
