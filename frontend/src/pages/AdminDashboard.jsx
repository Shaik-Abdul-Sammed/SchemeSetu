import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Building2 } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [name, setName] = useState('');
  const [maxLoan, setMaxLoan] = useState(300000);

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
    if (!name.trim()) return;
    try {
      await api.post('/admin/schemes', { name, maxLoan });
      setName('');
      fetchSchemes();
    } catch (e) {
      setSchemes([...schemes, { id: `scheme-${Date.now()}`, name, category: 'Micro Enterprise', maxLoan: Number(maxLoan) }]);
      setName('');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/schemes/${id}`);
      fetchSchemes();
    } catch (e) {
      setSchemes(schemes.filter(s => s.id !== id));
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }} className="container py-8">
      <h1 style={{ fontSize: '1.75rem', color: '#0B192C', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <Settings style={{ color: '#0284C7' }} size={28} /> {t('adminTitle', 'Administrative Dynamic Scheme Portal')}
      </h1>
      <p style={{ color: '#64748B', marginBottom: '2rem' }}>
        {t('adminSub', 'Government Officials Panel: Dynamically create, edit, or remove schemes and loan parameters.')}
      </p>

      {/* Add Scheme Form */}
      <form onSubmit={handleAdd} className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginBottom: '1rem' }}>{t('createNewScheme', '+ Create New Scheme Entry')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('schemeTitlePlaceholder', 'Scheme Title')}
            className="form-control"
            required
          />
          <input
            type="number"
            value={maxLoan}
            onChange={(e) => setMaxLoan(e.target.value)}
            placeholder={t('maxLoanPlaceholder', 'Max Loan Limit (₹)')}
            className="form-control"
            required
          />
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
                <div style={{ fontSize: '0.82rem', color: '#64748B' }}>{t('maxLoanLimit', 'Max Loan')}: ₹{(s.maxLoan || 300000).toLocaleString('en-IN')}</div>
              </div>
              <button onClick={() => handleDelete(s.id)} className="btn btn-sm btn-outline" style={{ color: '#DC2626', borderColor: '#FECACA' }}>
                <Trash2 size={16} /> {t('deleteBtn', 'Delete')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
