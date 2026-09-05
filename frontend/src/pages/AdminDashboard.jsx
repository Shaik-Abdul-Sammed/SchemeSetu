import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Building2, Database, Layers } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { sanitizeNumericInput, validateAndParseNumber, formatIndianCurrency } from '../utils/numberValidator';
import DataUploadManager from '../components/admin/DataUploadManager';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dataHub'); // 'dataHub' | 'schemes'
  const [schemes, setSchemes] = useState([]);
  const [name, setName] = useState('');
  const [maxLoan, setMaxLoan] = useState('300000');

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const res = await api.get('/admin/schemes');
      setSchemes(res.schemes || []);
    } catch (e) {
      setSchemes([
        { id: 'scheme-001', name: 'Pradhan Mantri Mudra Yojana (PMMY) - Kishore', category: 'Micro Enterprise', maxLoan: 500000 }
      ]);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a scheme name.', 'warning');
      return;
    }
    const loanVal = validateAndParseNumber(maxLoan, 'loanAmount');
    if (!loanVal.isValid) {
      showToast(loanVal.error || 'Please enter a valid loan limit.', 'warning');
      return;
    }

    try {
      await api.post('/admin/schemes', { name, maxLoan: loanVal.value });
      setName('');
      setMaxLoan('300000');
      showToast('New scheme published successfully!', 'success');
      fetchSchemes();
    } catch (e) {
      setSchemes([...schemes, { id: `scheme-${Date.now()}`, name, category: 'Micro Enterprise', maxLoan: loanVal.value }]);
      setName('');
      setMaxLoan('300000');
      showToast('New scheme added to local prototype!', 'success');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/schemes/${id}`);
      fetchSchemes();
      showToast('Scheme deleted.', 'info');
    } catch (e) {
      setSchemes(schemes.filter(s => s.id !== id));
      showToast('Scheme removed from local list.', 'info');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="container py-8">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0B192C', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Settings style={{ color: '#0284C7' }} size={28} /> {t('adminTitle', 'Administrative Government & Data Hub Portal')}
        </h1>
        <p style={{ color: '#64748B', margin: 0 }}>
          {t('adminSub', 'Government Officials Panel: Dynamically import datasets, manage schemes, and test eligibility rules offline.')}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '2px solid #E2E8F0', marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('dataHub')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'dataHub' ? '3px solid #D97706' : '3px solid transparent',
            color: activeTab === 'dataHub' ? '#D97706' : '#64748B',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Database size={18} /> {t('dataHubTab', 'Data Hub & Dataset Import (JSON/CSV)')}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schemes')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'schemes' ? '3px solid #D97706' : '3px solid transparent',
            color: activeTab === 'schemes' ? '#D97706' : '#64748B',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Layers size={18} /> {t('customSchemesTab', 'Dynamic Scheme Editor')}
        </button>
      </div>

      {/* TAB 1: Data Hub & Import Manager */}
      {activeTab === 'dataHub' && (
        <DataUploadManager />
      )}

      {/* TAB 2: Dynamic Scheme Editor */}
      {activeTab === 'schemes' && (
        <div>
          {/* Add Scheme Form */}
          <form onSubmit={handleAdd} className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginBottom: '1rem' }}>{t('createNewScheme', '+ Create New Scheme Entry')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">{t('schemeName', 'Scheme Title *')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('schemeTitlePlaceholder', 'e.g. State Youth Enterprise Subsidy')}
                  className="form-control"
                  required
                />
              </div>
              <div>
                <label className="form-label">{t('maxLoanLimit', 'Max Loan Limit (₹) *')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={maxLoan}
                  onChange={(e) => setMaxLoan(sanitizeNumericInput(e.target.value, 8))}
                  placeholder="e.g. 500000"
                  className="form-control"
                  required
                />
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Formatted: {formatIndianCurrency(maxLoan)}
                </span>
              </div>
            </div>
            <button type="submit" className="btn btn-green">
              <Plus size={16} /> {t('publishScheme', 'Publish Scheme')}
            </button>
          </form>

          {/* Active Schemes Table */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', color: '#0B192C', marginBottom: '1rem' }}>{t('activeSchemesList', 'Active Schemes')} ({schemes.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {schemes.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <strong style={{ color: '#0B192C' }}>{s.name}</strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748B' }}>{t('maxLoanLimit', 'Max Loan')}: {formatIndianCurrency(s.maxLoan || 300000)}</div>
                  </div>
                  <button onClick={() => handleDelete(s.id)} className="btn btn-sm btn-outline" style={{ color: '#DC2626', borderColor: '#FECACA' }}>
                    <Trash2 size={16} /> {t('deleteBtn', 'Delete')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
