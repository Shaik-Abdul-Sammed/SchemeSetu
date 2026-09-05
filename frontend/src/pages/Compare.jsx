import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Plus, 
  Building2, 
  Award, 
  IndianRupee, 
  ExternalLink,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { mockSchemes } from '../data/mock/schemes';
import { formatIndianCurrency } from '../utils/numberValidator';
import ApplicationGuidanceModal from '../components/scheme/ApplicationGuidanceModal';

export default function Compare() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedSchemeIds, setSelectedSchemeIds] = useState(() => {
    if (location.state?.schemeIds && Array.isArray(location.state.schemeIds)) {
      return location.state.schemeIds.slice(0, 3);
    }
    // Default 2 top schemes to compare
    return ['pm-mudra-yojana', 'pmegp'];
  });

  const [activeGuidanceScheme, setActiveGuidanceScheme] = useState(null);

  const selectedSchemes = selectedSchemeIds
    .map(id => mockSchemes.find(s => s.id === id))
    .filter(Boolean);

  const handleAddScheme = (e) => {
    const id = e.target.value;
    if (id && !selectedSchemeIds.includes(id) && selectedSchemeIds.length < 4) {
      setSelectedSchemeIds(prev => [...prev, id]);
    }
    e.target.value = '';
  };

  const handleRemoveScheme = (id) => {
    if (selectedSchemeIds.length <= 1) return;
    setSelectedSchemeIds(prev => prev.filter(sId => sId !== id));
  };

  const availableToAdd = mockSchemes.filter(s => !selectedSchemeIds.includes(s.id));

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#D97706', marginBottom: '0.5rem', fontWeight: 700 }}>
          <Scale size={24} />
          <span>{t('schemeComparison', 'Government Scheme Comparator')}</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#0B192C', marginBottom: '0.5rem', fontWeight: 800 }}>
          {t('compareSchemesTitle', 'Side-by-Side Scheme Comparison')}
        </h1>
        <p style={{ color: '#64748B', fontSize: '1rem' }}>
          {t('compareSchemesSubtitle', 'Compare official financial caps, SC subsidies, interest rates, eligibility criteria, and required documents across government welfare initiatives.')}
        </p>

        {/* Add Scheme Selector */}
        {selectedSchemeIds.length < 4 && (
          <div style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              onChange={handleAddScheme}
              defaultValue=""
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              <option value="" disabled>+ Add another scheme to compare ({selectedSchemeIds.length}/4)...</option>
              {availableToAdd.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Comparison Grid Table */}
      <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflowX: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
              <th style={{ width: '22%', padding: '1rem', textAlign: 'left', color: '#475569', fontSize: '0.9rem' }}>
                Feature / Criteria
              </th>
              {selectedSchemes.map(scheme => (
                <th key={scheme.id} style={{ width: `${78 / selectedSchemes.length}%`, padding: '1rem', textAlign: 'left', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <span className="badge badge-central" style={{ fontSize: '0.72rem', marginBottom: '0.35rem' }}>
                        {scheme.level} Government
                      </span>
                      <h3 style={{ fontSize: '1.1rem', color: '#0B192C', margin: 0, fontWeight: 700 }}>
                        {scheme.name}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                        {scheme.department}
                      </div>
                    </div>

                    {selectedSchemes.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveScheme(scheme.id)}
                        className="btn btn-sm btn-outline"
                        style={{ padding: '0.2rem 0.4rem', color: '#94A3B8' }}
                        title="Remove from comparison"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 1. Category & Beneficiary */}
            <tr style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFAFA' }}>
              <td style={{ padding: '1rem', fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Category & Target Group</td>
              {selectedSchemes.map(s => (
                <td key={s.id} style={{ padding: '1rem', fontSize: '0.85rem', color: '#0F172A' }}>
                  <div><span className="badge badge-cat">{s.category}</span></div>
                  <div style={{ marginTop: '0.35rem', color: '#475569' }}>{s.beneficiary}</div>
                </td>
              ))}
            </tr>

            {/* 2. Maximum Loan / Financial Cap */}
            <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
              <td style={{ padding: '1rem', fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Max Loan / Project Cost</td>
              {selectedSchemes.map(s => (
                <td key={s.id} style={{ padding: '1rem', fontSize: '0.95rem', fontWeight: 700, color: '#059669' }}>
                  {s.maxLoan ? formatIndianCurrency(s.maxLoan) : (s.maxBenefit ? formatIndianCurrency(s.maxBenefit) : 'Not specified in available data')}
                </td>
              ))}
            </tr>

            {/* 3. Interest Rate & Subsidies */}
            <tr style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFAFA' }}>
              <td style={{ padding: '1rem', fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Interest Rate & Subsidies</td>
              {selectedSchemes.map(s => (
                <td key={s.id} style={{ padding: '1rem', fontSize: '0.85rem', color: '#0F172A' }}>
                  {s.interestRate !== undefined ? (
                    <div>
                      <strong style={{ color: '#0369A1' }}>{s.interestRate}% p.a.</strong>
                      {s.id === 'pmegp' && <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '0.2rem' }}>★ 35% Special SC/ST/Women Margin Subsidy</div>}
                      {s.id === 'dalit-bandhu' && <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.2rem' }}>★ 100% Non-Repayable Welfare Grant</div>}
                    </div>
                  ) : 'Standard Bank Rates / Grant Basis'}
                </td>
              ))}
            </tr>

            {/* 4. Age & Income Eligibility */}
            <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
              <td style={{ padding: '1rem', fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Age & Income Limit</td>
              {selectedSchemes.map(s => (
                <td key={s.id} style={{ padding: '1rem', fontSize: '0.85rem', color: '#475569' }}>
                  <div><strong>Age:</strong> {s.minAge} to {s.maxAge} years</div>
                  <div><strong>Income Ceiling:</strong> {s.maxIncome ? `Up to ₹${s.maxIncome.toLocaleString('en-IN')}/yr` : 'No Cap'}</div>
                </td>
              ))}
            </tr>

            {/* 5. Key Benefits Summary */}
            <tr style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFAFA' }}>
              <td style={{ padding: '1rem', fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Core Benefit</td>
              {selectedSchemes.map(s => (
                <td key={s.id} style={{ padding: '1rem', fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                  {s.benefits}
                </td>
              ))}
            </tr>

            {/* 6. Documents Required */}
            <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
              <td style={{ padding: '1rem', fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>Key Required Documents</td>
              {selectedSchemes.map(s => (
                <td key={s.id} style={{ padding: '1rem', fontSize: '0.8rem', color: '#475569' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 1.4 }}>
                    {(s.documentsRequired || []).slice(0, 3).map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* 7. Action Buttons */}
            <tr>
              <td style={{ padding: '1.25rem 1rem' }}></td>
              {selectedSchemes.map(s => (
                <td key={s.id} style={{ padding: '1.25rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setActiveGuidanceScheme(s)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <FileText size={14} /> {t('applyGuidance', 'Apply & Guidance')}
                    </button>
                    <Link
                      to={`/schemes/${s.id}`}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.8rem', textAlign: 'center' }}
                    >
                      View Details
                    </Link>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Application Guidance Modal */}
      <ApplicationGuidanceModal
        isOpen={!!activeGuidanceScheme}
        onClose={() => setActiveGuidanceScheme(null)}
        scheme={activeGuidanceScheme}
      />
    </div>
  );
}
