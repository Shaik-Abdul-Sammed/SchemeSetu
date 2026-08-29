import React from 'react';
import { X, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function SchemeCompareModal({ schemes, onClose, onSelectScheme }) {
  const { t } = useLanguage();
  if (!schemes || schemes.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,25,44,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem', overflowY: 'auto' }}>
      <div className="card glass-card" style={{ maxWidth: '900px', width: '100%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button
          onClick={onClose}
          className="btn btn-sm btn-outline"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}
          aria-label="Close"
        >
          ✕
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <ShieldCheck size={22} style={{ color: '#F59E0B' }} />
            <h3 style={{ fontSize: '1.35rem', color: '#0B192C', margin: 0 }}>{t('compareSchemes', 'Compare Schemes Side-by-Side')}</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>{t('compareSub', 'Evaluate scheme parameters to find the best fit for your requirements.')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {schemes.map((s) => (
            <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <span className={`badge ${s.level === 'Central' ? 'badge-central' : 'badge-state'}`}>
                    {s.level === 'Central' ? t('centralLevel', 'Central') : t('stateLevel', 'State')}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', color: '#0B192C', marginTop: '0.5rem', marginBottom: '0.25rem', lineHeight: 1.3 }}>{s.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>{s.department}</p>
                </div>

                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>{t('schemeBenefits', 'Primary Benefit')}</span>
                    <strong style={{ color: '#059669' }}>{s.summary || 'Direct Benefit Transfer'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>{t('maxIncomeLimit', 'Max Annual Income')}</span>
                    <strong style={{ color: '#0F172A' }}>
                      {s.incomeLimit ? `₹${Number(s.incomeLimit).toLocaleString('en-IN')}` : 'No strict limit'}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>{t('categoryLabel', 'Eligible Category')}</span>
                    <span style={{ color: '#334155' }}>{s.category || 'Agriculture & Welfare'}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => {
                    if (onSelectScheme) onSelectScheme(s.id);
                    onClose();
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>{t('viewDetailsBtn', 'View Scheme')}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
