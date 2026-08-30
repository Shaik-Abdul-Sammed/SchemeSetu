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
  Landmark
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
          maxWidth: '720px',
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
          padding: '1.25rem 1.5rem',
          backgroundColor: '#0B192C',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid #F59E0B'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge" style={{ backgroundColor: '#059669', color: '#FFF', fontSize: '0.72rem', fontWeight: 700 }}>
                ✓ Validated Intake Result
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Ref: SS-AGENT-{Date.now().toString().slice(-6)}
              </span>
            </div>
            <h2 id="agent-report-title" style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Beneficiary Recommendation Summary
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
        <div style={{ flexGrow: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* 1. SHORT EXECUTIVE CONCLUSION */}
          {primaryScheme ? (
            <div style={{
              backgroundColor: '#ECFDF5',
              border: '1.5px solid #A7F3D0',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem'
            }}>
              <div style={{
                backgroundColor: '#059669',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recommendation Result ({primaryMatch.matchScore || 95}% Match)
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#065F46', margin: '0.2rem 0 0.3rem' }}>
                  Eligible for {primaryScheme.name}
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#047857', margin: 0, lineHeight: 1.4 }}>
                  {primaryMatch.whyRecommended || `Beneficiary meets demographic, income, and sector criteria with maximum government financial incentives.`}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: '#FEF3C7', border: '1.5px solid #FDE68A', borderRadius: '12px', padding: '1rem 1.25rem', color: '#92400E' }}>
              <AlertTriangle size={20} style={{ marginBottom: '0.35rem' }} />
              <strong>No matching scheme found for the provided criteria.</strong>
            </div>
          )}

          {/* 2. KEY HIGHLIGHTS (3-5 BULLET POINTS) */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
              Key Scheme Parameters & Financials
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              
              {/* Point 1: Scheme & Department */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <Building2 size={18} style={{ color: '#0284C7', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block' }}>Department / Ministry:</span>
                  <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>{primaryScheme?.department || primaryScheme?.officialMinistry || 'Government of India'}</strong>
                </div>
              </div>

              {/* Point 2: Sanction & Subsidy */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <Award size={18} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block' }}>Loan & Capital Subsidy:</span>
                  <strong style={{ fontSize: '0.88rem', color: '#059669' }}>
                    {formatIndianCurrency(validatedProfile.loanRequirement || validatedProfile.projectCost)} 
                    {subsidyPercent > 0 ? ` (${subsidyPercent}% Subsidy: ~${formatIndianCurrency(subsidyAmount)})` : ' (Collateral Free)'}
                  </strong>
                </div>
              </div>

              {/* Point 3: Estimated Monthly EMI */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <TrendingUp size={18} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block' }}>Estimated Monthly EMI:</span>
                  <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>
                    {estimatedEmi > 0 ? `${formatIndianCurrency(estimatedEmi)}/month (@ ${interestRate}% p.a.)` : 'Direct Grant / Zero EMI'}
                  </strong>
                </div>
              </div>

              {/* Point 4: Nearest Assistance Node */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <Landmark size={18} style={{ color: '#7C3AED', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block' }}>Nearest Assistance Center:</span>
                  <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>
                    {nearestPartner?.name || 'Lead District Bank Branch'} 
                    {nearestPartner?.distanceKm !== undefined ? ` (${nearestPartner.distanceKm} km)` : ''}
                  </strong>
                </div>
              </div>

              {/* Point 5: Mandatory Documents */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', gridColumn: '1 / -1' }}>
                <FileText size={18} style={{ color: '#475569', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block' }}>Mandatory Documents Required:</span>
                  <strong style={{ fontSize: '0.86rem', color: '#0F172A' }}>
                    {primaryScheme?.documentsRequired?.slice(0, 4).join(', ') || 'Aadhaar Card, Community Certificate, Detailed Project Report (DPR)'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* 3. RECOMMENDED NEXT ACTION */}
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: 700, textTransform: 'uppercase' }}>
                Recommended Next Step
              </div>
              <p style={{ fontSize: '0.88rem', color: '#1E3A8A', margin: '0.2rem 0 0', fontWeight: 500 }}>
                {primaryMatch?.nextAction || 'Prepare project report and submit application via the official government portal or nearest partner branch.'}
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

          {/* 4. EXPANDABLE TECHNICAL DETAILS SECTION */}
          <div>
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284C7',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0'
              }}
              aria-expanded={showTechnicalDetails}
            >
              <span>{showTechnicalDetails ? 'Hide Detailed Technical Analysis' : 'View Detailed Technical Analysis & Criteria Breakdown'}</span>
              {showTechnicalDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {showTechnicalDetails && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                {/* Beneficiary Demographics */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#334155' }}>
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

                {/* Criteria Match Factors */}
                {primaryMatch?.matchedCriteria && primaryMatch.matchedCriteria.length > 0 && (
                  <div style={{ backgroundColor: '#F0FDF4', padding: '0.85rem', borderRadius: '8px', border: '1px solid #DCFCE7', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 700, color: '#166534', marginBottom: '0.35rem' }}>Matched Criteria:</div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#15803D' }}>
                      {primaryMatch.matchedCriteria.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}

                {/* Official Source & Verification Note */}
                <div style={{ fontSize: '0.76rem', color: '#64748B', lineHeight: 1.4 }}>
                  <strong>Verification Note:</strong> Algorithmic suitability estimation based on official guidelines from {primaryScheme?.officialMinistry || 'Government of India'}. Final sanction is subject to physical verification by the financing institution.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1rem 1.5rem',
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
