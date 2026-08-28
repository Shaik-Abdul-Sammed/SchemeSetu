import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, Bookmark, Award, UserCheck, Percent, IndianRupee, Clock } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SchemeCard({ scheme, isSaved: initialSaved = false }) {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleToggleSave = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSaving(true);
    try {
      const res = await userService.toggleSaveScheme(scheme.id);
      setSaved(res.isSaved);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className={`badge ${scheme.level === 'Central' ? 'badge-central' : 'badge-state'}`}>
            {scheme.level === 'Central' ? t('centralLevel', 'Central') : t('stateLevel', 'State')}
          </span>
          <span className="badge badge-cat">
            {scheme.category}
          </span>
        </div>

        {isAuthenticated && (
          <button
            onClick={handleToggleSave}
            disabled={saving}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: saved ? '#D97706' : '#94A3B8',
              padding: '0.2rem',
              borderRadius: '4px',
              transition: 'all 0.15s ease'
            }}
            title={saved ? "Remove from Bookmarks" : "Save Scheme"}
            aria-label={saved ? "Remove from Bookmarks" : "Save Scheme"}
          >
            <Bookmark size={20} fill={saved ? "#D97706" : "none"} />
          </button>
        )}
      </div>

      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem', color: '#0B192C', lineHeight: 1.35 }}>
        <Link to={`/schemes/${scheme.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {scheme.name}
        </Link>
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748B', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
        <Building2 size={14} style={{ color: '#475569', shrink: 0 }} />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scheme.department}</span>
      </div>

      <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.1rem', flexGrow: 1 }}>
        {scheme.summary || scheme.description}
      </p>

      {/* Financial Highlight Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem', backgroundColor: '#F8FAFC', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }}>
        <div>
          <div style={{ color: '#64748B' }}>{t('interestRate', 'Rate')}</div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{scheme.interestRate ? `${scheme.interestRate}%` : 'Grant/DBT'}</div>
        </div>
        <div>
          <div style={{ color: '#64748B' }}>{t('maxLoanLimit', 'Max Loan')}</div>
          <div style={{ fontWeight: 700, color: '#059669' }}>₹{(scheme.maxLoan || 500000).toLocaleString('en-IN')}</div>
        </div>
        <div>
          <div style={{ color: '#64748B' }}>{t('tenure', 'Tenure')}</div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{scheme.tenureMonths ? `${scheme.tenureMonths} Mo.` : scheme.tenure || 'Flexible'}</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#ECFDF5', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #A7F3D0', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.25rem' }}>
          <Award size={15} /> {t('benefits', 'Primary Benefit')}
        </div>
        <div style={{ fontSize: '0.88rem', color: '#065F46', fontWeight: 500 }}>
          {scheme.benefits}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
        <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <UserCheck size={14} style={{ color: '#0284C7' }} />
          <span>{scheme.beneficiary}</span>
        </span>

        <Link to={`/schemes/${scheme.id}`} className="btn btn-outline btn-sm">
          {t('viewDetails', 'Details')} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
