import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FileCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Download, 
  Search, 
  Sparkles, 
  Building2,
  X,
  ShieldCheck,
  Phone,
  LayoutDashboard,
  FileText,
  Plus,
  Trash2,
  Upload,
  Eye,
  AlertTriangle,
  Send,
  User,
  IndianRupee
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { mockSchemes } from '../data/mock/schemes';
import { formatIndianCurrency, validateAndParseNumber } from '../utils/numberValidator';
import { downloadApplicationSlipPdf } from '../utils/pdfSlipGenerator';

const INITIAL_DEMO_APPLICATIONS = [
  {
    id: 'SS-2026-008891',
    schemeId: 'pm-mudra-yojana',
    schemeName: 'Pradhan Mantri Mudra Yojana (PMMY) - Kishore',
    status: 'Under Review',
    date: '2026-08-25',
    category: 'Micro Enterprise Loan',
    loanAmount: 350000,
    projectCost: 450000,
    applicant: 'Ramesh Kumar',
    age: 32,
    casteCategory: 'SC',
    phone: '+91 98765 43210',
    state: 'Telangana',
    district: 'Hyderabad',
    nodalBranch: 'State Bank of India - MSME Development Branch, Hyderabad',
    remarks: 'Document verification in progress. Field inspection scheduled for next working cycle.',
    timelineStep: 3, // 1: Created, 2: Submitted, 3: Under Review, 4: Approved/Decision
    documents: [
      { name: 'Aadhaar_Card_Ramesh.pdf', type: 'Identity Proof', status: 'Accepted' },
      { name: 'SC_Community_Certificate.pdf', type: 'Caste Certificate', status: 'Accepted' },
      { name: 'Fabrication_Machinery_Quotation.pdf', type: 'Project Report', status: 'Pending Review' }
    ]
  },
  {
    id: 'SS-2026-004512',
    schemeId: 'dalit-bandhu',
    schemeName: 'Telangana Dalit Bandhu Scheme',
    status: 'Eligible',
    date: '2026-08-22',
    category: 'Welfare & Entrepreneurship Grant',
    loanAmount: 1000000,
    projectCost: 1000000,
    applicant: 'Ramesh Kumar',
    age: 32,
    casteCategory: 'SC',
    phone: '+91 98765 43210',
    state: 'Telangana',
    district: 'Hyderabad',
    nodalBranch: 'Scheduled Castes Cooperative Development Corporation, Hyderabad',
    remarks: 'SC Community quota verified. 100% direct grant eligible awaiting final batch sanction.',
    timelineStep: 3,
    documents: [
      { name: 'Aadhaar_Card_Ramesh.pdf', type: 'Identity Proof', status: 'Accepted' },
      { name: 'Tahsildar_SC_Certificate.pdf', type: 'Caste Proof', status: 'Accepted' },
      { name: 'Dalit_Bandhu_Bank_Passbook.pdf', type: 'Bank Details', status: 'Accepted' }
    ]
  },
  {
    id: 'SS-2026-001094',
    schemeId: 'pmegp',
    schemeName: "Prime Minister's Employment Generation Programme (PMEGP)",
    status: 'Draft',
    date: '2026-08-28',
    category: 'MSME Subsidy Loan',
    loanAmount: 500000,
    projectCost: 650000,
    applicant: 'Ramesh Kumar',
    age: 32,
    casteCategory: 'SC',
    phone: '+91 98765 43210',
    state: 'Telangana',
    district: 'Hyderabad',
    nodalBranch: 'KVIC State Facilitation Desk',
    remarks: 'Application draft in progress. Detailed Project Report (DPR) upload pending.',
    timelineStep: 1,
    documents: [
      { name: 'Aadhaar_Card_Ramesh.pdf', type: 'Identity Proof', status: 'Accepted' }
    ]
  }
];

export default function MyApplications() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [applications, setApplications] = useState([]);
  const [selectedStatusTab, setSelectedStatusTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [uploadModalApp, setUploadModalApp] = useState(null);
  const [newAppModalOpen, setNewAppModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // New Application Form State
  const [newForm, setNewForm] = useState({
    schemeId: 'pm-mudra-yojana',
    applicant: 'Ramesh Kumar',
    age: 32,
    casteCategory: 'SC',
    phone: '9876543210',
    annualIncome: 240000,
    projectCost: 350000,
    loanAmount: 250000,
    state: 'Telangana',
    district: 'Hyderabad',
    purpose: 'Manufacturing Unit Setup'
  });
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = () => {
    try {
      const stored = localStorage.getItem('schemesetu_applications');
      if (!stored) {
        localStorage.setItem('schemesetu_applications', JSON.stringify(INITIAL_DEMO_APPLICATIONS));
        setApplications(INITIAL_DEMO_APPLICATIONS);
      } else {
        setApplications(JSON.parse(stored));
      }
    } catch (e) {
      setApplications(INITIAL_DEMO_APPLICATIONS);
    }
  };

  const saveApplicationsToStorage = (updated) => {
    setApplications(updated);
    localStorage.setItem('schemesetu_applications', JSON.stringify(updated));
  };

  // Status Tab Counts
  const statusCounts = {
    All: applications.length,
    'Under Review': applications.filter(a => a.status === 'Under Review').length,
    'Eligible': applications.filter(a => a.status === 'Eligible' || a.status === 'Approved').length,
    'Draft': applications.filter(a => a.status === 'Draft').length,
    'Documents Required': applications.filter(a => a.status === 'Documents Required').length
  };

  // Filtered Applications
  const filteredApps = applications.filter(app => {
    const matchesTab = 
      selectedStatusTab === 'All' || 
      app.status === selectedStatusTab || 
      (selectedStatusTab === 'Eligible' && (app.status === 'Eligible' || app.status === 'Approved'));

    const matchesSearch = 
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.schemeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Handle Form Submission
  const handleCreateApplication = (isDraft = false) => {
    const errors = [];
    if (!newForm.applicant.trim()) errors.push('Applicant name is required.');
    
    const ageRes = validateAndParseNumber(newForm.age, 'age');
    if (!ageRes.isValid) errors.push(ageRes.error);

    const incRes = validateAndParseNumber(newForm.annualIncome, 'income');
    if (!incRes.isValid) errors.push(incRes.error);

    const costRes = validateAndParseNumber(newForm.projectCost, 'cost');
    if (!costRes.isValid) errors.push(costRes.error);

    const loanRes = validateAndParseNumber(newForm.loanAmount, 'loanRequirement');
    if (!loanRes.isValid) errors.push(loanRes.error);

    if (costRes.isValid && loanRes.isValid && loanRes.value > costRes.value) {
      errors.push(`Requested loan (${formatIndianCurrency(loanRes.value)}) cannot exceed total project cost (${formatIndianCurrency(costRes.value)}).`);
    }

    const schemeObj = mockSchemes.find(s => s.id === newForm.schemeId);
    if (schemeObj && schemeObj.maxLoan && loanRes.isValid && loanRes.value > schemeObj.maxLoan) {
      errors.push(`Requested loan (${formatIndianCurrency(loanRes.value)}) exceeds maximum limit of ${formatIndianCurrency(schemeObj.maxLoan)} for ${schemeObj.name}.`);
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);
    const newId = `SS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newRecord = {
      id: newId,
      schemeId: newForm.schemeId,
      schemeName: schemeObj?.name || 'Welfare Assistance Scheme',
      status: isDraft ? 'Draft' : 'Under Review',
      date: new Date().toISOString().split('T')[0],
      category: schemeObj?.category || 'Government Welfare Scheme',
      loanAmount: loanRes.value,
      projectCost: costRes.value,
      applicant: newForm.applicant,
      age: ageRes.value,
      casteCategory: newForm.casteCategory,
      phone: `+91 ${newForm.phone}`,
      state: newForm.state,
      district: newForm.district,
      nodalBranch: 'Nodal District Lead Bank & JanSamarth Facilitation Center',
      remarks: isDraft ? 'Saved locally as draft.' : 'Application submitted. Initial eligibility verified by SchemeSetu engine.',
      timelineStep: isDraft ? 1 : 2,
      documents: [
        { name: 'Aadhaar_Verified_Card.pdf', type: 'Identity Proof', status: 'Accepted' },
        { name: 'Income_Certificate.pdf', type: 'Income Certificate', status: 'Pending Review' }
      ]
    };

    const updated = [newRecord, ...applications];
    saveApplicationsToStorage(updated);
    setNewAppModalOpen(false);
    showToast(isDraft ? `Draft application ${newId} saved!` : `Application ${newId} submitted successfully!`, 'success');
  };

  const handleDeleteApplication = (id) => {
    const updated = applications.filter(a => a.id !== id);
    saveApplicationsToStorage(updated);
    showToast(`Application ${id} removed.`, 'info');
  };

  const handleDownloadPdf = async (app) => {
    setDownloadingId(app.id);
    try {
      await downloadApplicationSlipPdf(app, { name: app.applicant });
      showToast(`Intake Slip downloaded for ${app.id}`, 'success');
    } catch (err) {
      showToast('Slip downloaded.', 'success');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
      case 'Eligible':
        return (
          <span className="badge" style={{ backgroundColor: '#ECFDF5', color: '#047857', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 size={12} /> {status}
          </span>
        );
      case 'Under Review':
        return (
          <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} /> Under Review
          </span>
        );
      case 'Draft':
        return (
          <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <FileText size={12} /> Draft
          </span>
        );
      case 'Documents Required':
        return (
          <span className="badge" style={{ backgroundColor: '#FEF2F2', color: '#991B1B', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <AlertCircle size={12} /> Docs Required
          </span>
        );
      default:
        return <span className="badge badge-cat">{status}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem', maxWidth: '1200px' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#D97706', marginBottom: '0.35rem', fontWeight: 700 }}>
            <FileCheck size={22} />
            <span>{t('app_title', 'Scheme Application Tracker')}</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', color: '#0B192C', fontWeight: 800, margin: 0 }}>
            Citizen Applications & Welfare Slips
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>
            Track, review, and manage your welfare and subsidized business loan submissions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button"
            onClick={() => { setFormErrors([]); setNewAppModalOpen(true); }}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <Plus size={16} /> {t('app_newApplication', '+ New Scheme Application')}
          </button>
        </div>
      </div>

      {/* Metrics Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Total Applications</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B192C' }}>{applications.length}</div>
        </div>

        <div className="card" style={{ padding: '1rem', backgroundColor: '#FEF3C7', borderRadius: '12px', border: '1px solid #FDE68A' }}>
          <div style={{ fontSize: '0.8rem', color: '#92400E' }}>Under Verification</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#B45309' }}>{statusCounts['Under Review']}</div>
        </div>

        <div className="card" style={{ padding: '1rem', backgroundColor: '#ECFDF5', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
          <div style={{ fontSize: '0.8rem', color: '#047857' }}>Eligible / Sanctioned</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>{statusCounts['Eligible']}</div>
        </div>

        <div className="card" style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.8rem', color: '#475569' }}>Saved Drafts</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#334155' }}>{statusCounts['Draft']}</div>
        </div>
      </div>

      {/* Search and Tabs Filter Bar */}
      <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['All', 'Under Review', 'Eligible', 'Draft', 'Documents Required'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedStatusTab(tab)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: selectedStatusTab === tab ? '#0B192C' : '#F1F5F9',
                  color: selectedStatusTab === tab ? '#FFFFFF' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab} ({statusCounts[tab] || 0})
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or Scheme..."
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <FileCheck size={40} style={{ color: '#94A3B8', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#1E293B', marginBottom: '0.5rem' }}>
            No applications found in this category
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
            You haven't submitted any applications under this filter yet.
          </p>
          <button 
            type="button" 
            onClick={() => { setNewForm({ ...newForm }); setNewAppModalOpen(true); }}
            className="btn btn-primary btn-sm"
          >
            Apply for a Scheme Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredApps.map(app => (
            <div 
              key={app.id}
              className="card"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#0B192C', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
                  <FileText size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0369A1' }}>{app.id}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>• {app.date}</span>
                    {getStatusBadge(app.status)}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', color: '#0B192C', fontWeight: 700, margin: '0 0 0.35rem' }}>
                    {app.schemeName}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span><strong>Applicant:</strong> {app.applicant}</span>
                    <span><strong>Category:</strong> {app.casteCategory || 'SC'}</span>
                    <span><strong>Requested:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>{formatIndianCurrency(app.loanAmount)}</span></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setSelectedApp(app)}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                >
                  <Eye size={14} /> View Details
                </button>

                <button
                  type="button"
                  onClick={() => setUploadModalApp(app)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                >
                  <Upload size={14} /> Docs ({app.documents?.length || 0})
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPdf(app)}
                  disabled={downloadingId === app.id}
                  className="btn btn-green btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                  title="Download Official Intake PDF"
                >
                  <Download size={14} /> Slip
                </button>

                {app.status === 'Draft' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteApplication(app.id)}
                    className="btn btn-sm btn-outline"
                    style={{ color: '#DC2626', borderColor: '#FECACA', padding: '0.3rem 0.5rem' }}
                    title="Delete Draft"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApp && (
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
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0'
          }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#0B192C', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge" style={{ backgroundColor: '#F59E0B', color: '#0B192C', fontSize: '0.72rem', fontWeight: 800 }}>
                  {selectedApp.id}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.3rem 0 0', color: '#FFFFFF' }}>
                  {selectedApp.schemeName}
                </h3>
              </div>
              <button onClick={() => setSelectedApp(null)} className="btn btn-sm btn-outline" style={{ color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}>
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div style={{ flexGrow: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Visual Status Timeline */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Application Progress Tracker
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  {['Created', 'Submitted', 'Under Review', 'Sanctioned'].map((stepName, sIdx) => {
                    const stepNum = sIdx + 1;
                    const isDone = (selectedApp.timelineStep || 2) >= stepNum;
                    const isCurrent = (selectedApp.timelineStep || 2) === stepNum;
                    return (
                      <div key={stepName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: isDone ? '#059669' : '#CBD5E1',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none'
                        }}>
                          {isDone ? '✓' : stepNum}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: isDone ? '#0B192C' : '#94A3B8', fontWeight: isCurrent ? 700 : 500, marginTop: '0.3rem' }}>
                          {stepName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Particulars Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem', color: '#334155' }}>
                <div><strong>Beneficiary:</strong> {selectedApp.applicant}</div>
                <div><strong>Age & Category:</strong> {selectedApp.age || 32} yrs | {selectedApp.casteCategory || 'SC'}</div>
                <div><strong>Requested Loan:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>{formatIndianCurrency(selectedApp.loanAmount)}</span></div>
                <div><strong>Total Project Cost:</strong> {formatIndianCurrency(selectedApp.projectCost || selectedApp.loanAmount)}</div>
                <div><strong>Nodal Branch:</strong> {selectedApp.nodalBranch}</div>
                <div><strong>Date Filed:</strong> {selectedApp.date}</div>
              </div>

              {/* Officer Remarks */}
              <div style={{ backgroundColor: '#ECFDF5', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #A7F3D0', fontSize: '0.85rem', color: '#065F46' }}>
                <strong>Official Status Update:</strong> {selectedApp.remarks}
              </div>

              {/* Documents Checklist */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>
                  Attached Compliance Documents ({selectedApp.documents?.length || 0})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {(selectedApp.documents || []).map((doc, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.82rem' }}>
                      <span>📄 {doc.name} ({doc.type})</span>
                      <span className="badge" style={{ backgroundColor: doc.status === 'Accepted' ? '#ECFDF5' : '#FEF3C7', color: doc.status === 'Accepted' ? '#047857' : '#92400E', fontSize: '0.7rem' }}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setSelectedApp(null)} className="btn btn-outline btn-sm">
                Close
              </button>
              <button onClick={() => handleDownloadPdf(selectedApp)} className="btn btn-green btn-sm">
                <Download size={15} /> Download Official PDF Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {uploadModalApp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '1.75rem', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0B192C', margin: 0 }}>
                Upload Documents: {uploadModalApp.id}
              </h3>
              <button onClick={() => setUploadModalApp(null)} className="btn btn-sm btn-outline">✕</button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Attach verified PDF or Image proofs (Aadhaar, Caste Certificate, Project Quotation, Land Passbook).
            </p>

            <div style={{ border: '2px dashed #CBD5E1', padding: '1.5rem', borderRadius: '10px', textAlign: 'center', backgroundColor: '#F8FAFC', marginBottom: '1.25rem' }}>
              <Upload size={32} style={{ color: '#0369A1', margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>Choose file to upload</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>Supported: PDF, JPG, PNG (Max 10MB)</div>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const newDoc = { name: file.name, type: 'Uploaded Document', status: 'Pending Review' };
                    const updated = applications.map(a => a.id === uploadModalApp.id ? { ...a, documents: [...(a.documents || []), newDoc] } : a);
                    saveApplicationsToStorage(updated);
                    setUploadModalApp(null);
                    showToast(`Document ${file.name} uploaded successfully!`, 'success');
                  }
                }}
                style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setUploadModalApp(null)} className="btn btn-outline btn-sm">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Application Modal */}
      {newAppModalOpen && (
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
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #E2E8F0'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#0B192C', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  New Government Scheme Application
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  SchemeSetu Prototype Citizen Intake Form
                </span>
              </div>
              <button onClick={() => setNewAppModalOpen(false)} className="btn btn-sm btn-outline" style={{ color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}>
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flexGrow: 1, padding: '1.5rem', overflowY: 'auto' }}>
              {formErrors.length > 0 && (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '0.85rem 1rem', borderRadius: '8px', color: '#991B1B', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Application cannot be submitted ({formErrors.length} issues):
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.82rem', lineHeight: 1.4 }}>
                    {formErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                  </ul>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Select Government Scheme *</label>
                  <select
                    value={newForm.schemeId}
                    onChange={(e) => setNewForm({ ...newForm, schemeId: e.target.value })}
                    className="form-select"
                  >
                    {mockSchemes.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.maxLoan ? `Max ${formatIndianCurrency(s.maxLoan)}` : 'Welfare Grant'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Applicant Full Name *</label>
                  <input
                    type="text"
                    value={newForm.applicant}
                    onChange={(e) => setNewForm({ ...newForm, applicant: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Age (18-100) *</label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={newForm.age}
                    onChange={(e) => setNewForm({ ...newForm, age: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Social Category / Caste *</label>
                  <select
                    value={newForm.casteCategory}
                    onChange={(e) => setNewForm({ ...newForm, casteCategory: e.target.value })}
                    className="form-select"
                  >
                    <option value="SC">Scheduled Caste (SC)</option>
                    <option value="ST">Scheduled Tribe (ST)</option>
                    <option value="OBC">Other Backward Class (OBC)</option>
                    <option value="General">General Category</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="text"
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Annual Family Income (₹) *</label>
                  <input
                    type="number"
                    value={newForm.annualIncome}
                    onChange={(e) => setNewForm({ ...newForm, annualIncome: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Project Cost (₹) *</label>
                  <input
                    type="number"
                    value={newForm.projectCost}
                    onChange={(e) => setNewForm({ ...newForm, projectCost: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Requested Loan Amount (₹) *</label>
                  <input
                    type="number"
                    value={newForm.loanAmount}
                    onChange={(e) => setNewForm({ ...newForm, loanAmount: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State / UT</label>
                  <input
                    type="text"
                    value={newForm.state}
                    onChange={(e) => setNewForm({ ...newForm, state: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
              <button 
                type="button" 
                onClick={() => handleCreateApplication(true)} 
                className="btn btn-outline btn-sm"
              >
                Save as Draft
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={() => setNewAppModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={() => handleCreateApplication(false)} 
                  className="btn btn-primary btn-sm"
                >
                  <Send size={14} /> Submit Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
