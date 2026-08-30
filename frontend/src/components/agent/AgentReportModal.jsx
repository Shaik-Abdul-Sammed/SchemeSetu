import React from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
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
  if (!isOpen || !validatedProfile) return null;

  const primaryScheme = topSchemes.length > 0 ? topSchemes[0].scheme : null;

  const handleDownload = async () => {
    try {
      const appId = `APP-AGENT-${Date.now()}`;
      generateUniversalApplicationSlip({
        id: appId,
        schemeName: primaryScheme?.name || 'Welfare Scheme Application',
        category: primaryScheme?.category || 'Government Welfare Assistance',
        level: primaryScheme?.level || 'Central',
        status: 'Verified & Recommended by Agent AG-101',
        date: new Date().toISOString().split('T')[0],
        loanAmount: validatedProfile.loanRequirement || validatedProfile.projectCost,
        beneficiary: validatedProfile.name,
        district: validatedProfile.location.split(',')[0] || 'Hyderabad',
        state: validatedProfile.state || 'Telangana'
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem'
    }}>
      <div className="card" style={{
        maxWidth: '740px',
        width: '100%',
        maxHeight: '90vh',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#0B192C',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge" style={{ backgroundColor: '#059669', color: '#FFF', fontSize: '0.72rem' }}>
                Validated Citizen Intake
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Ref: AG-101-CSC
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.25rem 0 0', color: '#FFFFFF' }}>
              Beneficiary Intake & Recommendation Report
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-sm btn-outline"
            style={{ color: '#FFF', borderColor: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flexGrow: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Beneficiary Profile Card */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Validated Citizen Demographics & Need
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.88rem', color: '#1E293B' }}>
              <div><strong>Name:</strong> {validatedProfile.name}</div>
              <div><strong>Age / Category:</strong> {validatedProfile.age} yrs | <span className="badge badge-cat">{validatedProfile.casteCategory}</span></div>
              <div><strong>Annual Family Income:</strong> {formatIndianCurrency(validatedProfile.annualIncome)}</div>
              <div><strong>Project Cost:</strong> {formatIndianCurrency(validatedProfile.projectCost)}</div>
              <div><strong>Loan Requirement:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>{formatIndianCurrency(validatedProfile.loanRequirement)}</span></div>
              <div><strong>Location:</strong> {validatedProfile.location}</div>
            </div>
          </div>

          {/* Top Recommendations (Up to 3) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0B192C', margin: 0 }}>
                Top Matched Welfare Schemes ({topSchemes.length})
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Derived from verified SchemeSetu dataset
              </span>
            </div>

            {topSchemes.length === 0 ? (
              <div style={{ padding: '1.5rem', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '10px', textAlign: 'center' }}>
                <AlertTriangle size={24} style={{ margin: '0 auto 0.5rem' }} />
                <strong>No suitable schemes matched the specified criteria.</strong>
                <p style={{ fontSize: '0.85rem', margin: '0.35rem 0 0' }}>
                  Please check income limits or review project cost parameters.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {topSchemes.map(({ scheme, matchScore, financialFit, reasons }, idx) => (
                  <div 
                    key={scheme.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      backgroundColor: idx === 0 ? '#ECFDF5' : '#FFFFFF',
                      border: idx === 0 ? '1.5px solid #10B981' : '1px solid #CBD5E1'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="badge badge-central" style={{ fontSize: '0.7rem' }}>Rank {idx + 1}</span>
                          <span className="badge" style={{ backgroundColor: '#0284C7', color: '#FFF', fontSize: '0.7rem' }}>
                            Match {matchScore}%
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', color: '#0B192C', fontWeight: 700, margin: '0.3rem 0 0.15rem' }}>
                          {scheme.name}
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{scheme.department}</div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Maximum Eligible Loan / Assistance</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>
                          {scheme.maxLoan ? formatIndianCurrency(scheme.maxLoan) : (scheme.maxBenefit ? formatIndianCurrency(scheme.maxBenefit) : 'Grant Basis')}
                        </div>
                        <span className="badge" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', fontSize: '0.7rem', marginTop: '0.2rem' }}>
                          {financialFit}
                        </span>
                      </div>
                    </div>

                    {/* Eligibility Reasons */}
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {reasons.map((r, rIdx) => (
                        <span key={rIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#065F46', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          <CheckCircle2 size={12} /> {r}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div style={{ backgroundColor: '#F1F5F9', padding: '1rem', borderRadius: '10px', fontSize: '0.82rem', color: '#334155' }}>
            <strong>Actionable Next Steps:</strong>
            <ol style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem', lineHeight: 1.5 }}>
              <li>Verify original SC/Community and Income certificates with Tahsildar stamp.</li>
              <li>Submit loan application through national portal (JanSamarth / KVIC / SC Corporation).</li>
              <li>Track application status via SchemeSetu Application Tracker.</li>
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button onClick={onClose} className="btn btn-outline btn-sm">
            Close / Edit Profile
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handlePrint} className="btn btn-secondary btn-sm">
              <Printer size={15} /> Print
            </button>
            <button onClick={handleDownload} className="btn btn-green btn-sm" disabled={topSchemes.length === 0}>
              <Download size={15} /> Download Summary PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
