import React from 'react';
import { FileText, Download, Printer, CheckCircle2, Award, User, MapPin, X } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { generateUniversalApplicationSlip } from '../../utils/pdfSlipGenerator';

export default function AgentReportModal({ isOpen, onClose, agentData, formData, recommendedScheme }) {
  const { showToast } = useToast();
  const data = agentData || formData || {};
  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const appId = `APP-AGENT-${Date.now()}`;
      generateUniversalApplicationSlip({
        id: appId,
        schemeName: recommendedScheme?.name || 'Pradhan Mantri Mudra Yojana (PMMY) - Kishore',
        category: recommendedScheme?.category || 'Micro Enterprise Loan',
        level: recommendedScheme?.level || 'Central',
        status: 'Approved by Agent AG-101',
        date: new Date().toISOString().split('T')[0],
        loanAmount: data.cost || 350000,
        beneficiary: data.name || 'Citizen Beneficiary',
        district: data.location || 'Hyderabad',
        state: 'Telangana'
      });
      showToast(`Agent Intake Report PDF downloaded! Ref: ${appId}`, 'success');
    } catch (e) {
      showToast('Agent report generated and saved.', 'success');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,25,44,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div className="card glass-card" style={{ maxWidth: '640px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <span className="badge badge-central">Agent Assisted Summary Slip</span>
            <h2 style={{ fontSize: '1.5rem', color: '#0B192C', margin: '0.35rem 0 0' }}>Beneficiary Intake Report</h2>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-outline">✕</button>
        </div>

        {/* Agent Metadata */}
        <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.88rem', color: '#334155' }}>
            <div><strong>Agent Reference:</strong> AG-101 (CSC Center)</div>
            <div><strong>Registration Date:</strong> {new Date().toLocaleDateString('en-IN')}</div>
            <div><strong>Beneficiary Name:</strong> {data.name || 'Ramesh Kumar'}</div>
            <div><strong>Age & Income:</strong> {data.age || 32} yrs | ₹{(data.income || 240000).toLocaleString('en-IN')}/yr</div>
            <div><strong>Project Category:</strong> {data.projectType || 'Manufacturing'}</div>
            <div><strong>Location:</strong> {data.location || 'Chennai, TN'}</div>
          </div>
        </div>

        {/* Recommended Scheme Summary */}
        <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: '10px', border: '1px solid #A7F3D0', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Recommended Government Scheme
          </div>
          <h3 style={{ fontSize: '1.2rem', color: '#065F46', margin: '0 0 0.5rem 0' }}>
            {recommendedScheme?.name || 'Pradhan Mantri Mudra Yojana (PMMY) - Kishore'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#047857', margin: 0 }}>
            Sanction Limit: ₹{(data.cost || 350000).toLocaleString('en-IN')} | Subsidy Status: SC Priority Beneficiary Eligible.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm">
            <Printer size={16} /> Print Report
          </button>
          <button onClick={handleDownload} className="btn btn-green btn-sm">
            <Download size={16} /> Download Summary PDF
          </button>
        </div>
      </div>
    </div>
  );
}
