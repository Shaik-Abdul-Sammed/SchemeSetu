import React, { useState } from 'react';
import { Calculator, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function BenefitEstimator({ scheme }) {
  const { t } = useLanguage();
  const [landAcres, setLandAcres] = useState(2);
  const [projectCost, setProjectCost] = useState(100000);
  const [annualIncome, setAnnualIncome] = useState(150000);

  // Dynamic estimate calculation based on scheme type
  let estimatedPayout = 6000;
  let calculationNote = 'Standard annual direct benefit transfer payout';

  if (scheme?.id === 'pm-kisan') {
    estimatedPayout = 6000;
    calculationNote = '₹6,000 per year paid in 3 equal installments of ₹2,000 via DBT.';
  } else if (scheme?.id === 'pmegp') {
    const subsidyRate = annualIncome < 200000 ? 0.35 : 0.25;
    estimatedPayout = Math.min(projectCost * subsidyRate, 875000);
    calculationNote = `${(subsidyRate * 100).toFixed(0)}% government margin money subsidy on project cost of ₹${Number(projectCost).toLocaleString('en-IN')}.`;
  } else if (scheme?.id === 'ayushman-bharat') {
    estimatedPayout = 500000;
    calculationNote = 'Free health insurance cover up to ₹5,00,000 per family per year for secondary & tertiary hospital care.';
  } else {
    estimatedPayout = Math.min(annualIncome * 0.15 + 10000, 50000);
    calculationNote = 'Estimated financial assistance based on income and welfare category eligibility.';
  }

  return (
    <div className="card" style={{ backgroundColor: '#0B192C', borderColor: '#1E293B', color: '#FFFFFF', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calculator size={20} style={{ color: '#10B981' }} />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          {t('estimatorTitle', 'Interactive Subsidy & Benefit Estimator')}
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: '#94A3B8', fontSize: '0.82rem' }}>
            {t('landHolding', 'Land Holding (Acres)')}
          </label>
          <input
            type="number"
            value={landAcres}
            onChange={(e) => setLandAcres(Number(e.target.value))}
            className="form-input"
            style={{ backgroundColor: '#0F172A', color: '#FFFFFF', borderColor: '#334155' }}
            min="0"
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: '#94A3B8', fontSize: '0.82rem' }}>
            {t('annualIncomeLabel', 'Annual Household Income (₹)')}
          </label>
          <input
            type="number"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(Number(e.target.value))}
            className="form-input"
            style={{ backgroundColor: '#0F172A', color: '#FFFFFF', borderColor: '#334155' }}
            min="0"
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: '#94A3B8', fontSize: '0.82rem' }}>
            {t('projectCostLabel', 'Proposed Project/Loan Cost (₹)')}
          </label>
          <input
            type="number"
            value={projectCost}
            onChange={(e) => setProjectCost(Number(e.target.value))}
            className="form-input"
            style={{ backgroundColor: '#0F172A', color: '#FFFFFF', borderColor: '#334155' }}
            min="0"
          />
        </div>
      </div>

      <div style={{
        backgroundColor: 'rgba(5, 150, 105, 0.15)',
        border: '1px solid rgba(5, 150, 105, 0.3)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34D399', fontWeight: 600, fontSize: '0.85rem' }}>
            <Sparkles size={16} style={{ color: '#F59E0B' }} />
            <span>{t('estFinancialAssistance', 'Estimated Government Financial Assistance')}</span>
          </div>
          <p style={{ color: '#CBD5E1', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
            {calculationNote}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F59E0B', display: 'block' }}>
            ₹{Math.round(estimatedPayout).toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{t('estAnnualValue', 'Est. Annual Value')}</span>
        </div>
      </div>
    </div>
  );
}
