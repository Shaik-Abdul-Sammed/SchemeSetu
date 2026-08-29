import React, { useState, useEffect } from 'react';
import { Award, Users, CheckCircle, IndianRupee, FileText } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function VLEDashboard() {
  const { t } = useLanguage();
  const [vle, setVle] = useState({
    vleId: 'VLE-TEL-8091',
    name: 'Kavitha Reddy',
    centerName: 'CSC Warangal Digital Seva Kendra',
    totalApplications: 38,
    approvedApplications: 29,
    commissionEarned: 14500,
    recentRegistrations: [
      { name: 'Ramesh K.', scheme: 'PMMY Kishore', status: 'Approved', commission: 500 },
      { name: 'Srinivas M.', scheme: 'PM-KISAN', status: 'Under Review', commission: 0 }
    ]
  });

  useEffect(() => {
    api.get('/vle/dashboard').then(res => {
      if (res.vle) setVle(res.vle);
    }).catch(e => console.log("Using default VLE mock data"));
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="container py-8">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-central">{vle.vleId}</span>
          <h1 style={{ fontSize: '1.75rem', color: '#0B192C', margin: '0.25rem 0 0' }}>
            {t('vleTitle', 'VLE Agent Incentives & Portal')}
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Center: {vle.centerName} ({vle.name})
          </p>
        </div>

        <button className="btn btn-green btn-sm">{t('registerNewCitizen', '+ Register New Citizen Intake')}</button>
      </div>

      {/* Analytics Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ background: '#F8FAFC' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{t('totalAppsLabel', 'Total Applications Filed')}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0B192C' }}>{vle.totalApplications}</div>
        </div>

        <div className="card" style={{ background: '#ECFDF5' }}>
          <div style={{ fontSize: '0.85rem', color: '#047857' }}>{t('approvedLoansLabel', 'Approved Loans')}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>{vle.approvedApplications}</div>
        </div>

        <div className="card" style={{ background: '#FEF3C7' }}>
          <div style={{ fontSize: '0.85rem', color: '#92400E' }}>{t('vleCommissionLabel', 'VLE Commission Earned')}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706' }}>₹{vle.commissionEarned.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', color: '#0B192C', marginBottom: '1rem' }}>{t('recentSubmissions', 'Recent Citizen Submissions')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {vle.recentRegistrations.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div>
                <strong style={{ color: '#0F172A' }}>{r.name}</strong> • <span style={{ color: '#64748B' }}>{r.scheme}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`badge ${r.status === 'Approved' ? 'badge-state' : 'badge-cat'}`}>{r.status}</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>+₹{r.commission}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
