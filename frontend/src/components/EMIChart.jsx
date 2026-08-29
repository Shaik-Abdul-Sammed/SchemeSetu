import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function EMIChart({ principal = 250000, totalInterest = 54000, tenureMonths = 36 }) {
  const { t } = useLanguage();
  const totalRepayment = principal + totalInterest;
  const principalPercent = Math.round((principal / totalRepayment) * 100) || 80;
  const interestPercent = 100 - principalPercent;

  return (
    <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '1rem' }}>
      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{t('costBreakdown', 'Repayment Cost Breakdown')} ({tenureMonths} {t('tenure', 'Months')})</span>
        <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>{t('totalRepayment', 'Total')}: ₹{totalRepayment.toLocaleString('en-IN')}</span>
      </div>

      {/* Visual Stacked Progress Bar Chart */}
      <div style={{ height: '24px', width: '100%', background: '#F1F5F9', borderRadius: '12px', overflow: 'hidden', display: 'flex', marginBottom: '1rem', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
        <div
          style={{ width: `${principalPercent}%`, background: 'linear-gradient(90deg, #1E3E62, #0284C7)', transition: 'width 0.4s ease' }}
          title={`Principal: ${principalPercent}%`}
        />
        <div
          style={{ width: `${interestPercent}%`, background: 'linear-gradient(90deg, #F59E0B, #D97706)', transition: 'width 0.4s ease' }}
          title={`Interest: ${interestPercent}%`}
        />
      </div>

      {/* Legend & Exact Numerical Totals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#0284C7', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{t('loanPrincipal', 'Loan Principal')} ({principalPercent}%)</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>₹{principal.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#D97706', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{t('totalInterest', 'Total Interest')} ({interestPercent}%)</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#D97706' }}>₹{totalInterest.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
