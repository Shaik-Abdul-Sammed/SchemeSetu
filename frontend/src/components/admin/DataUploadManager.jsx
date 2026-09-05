import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Trash2, 
  Database, 
  Eye, 
  RefreshCw,
  Table,
  Check,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  RotateCcw,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { sanitizeNumericInput, validateAndParseNumber, formatIndianCurrency } from '../../utils/numberValidator';

export default function DataUploadManager() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [fileType, setFileType] = useState('demo-person'); // 'demo-person' | 'scheme' | 'user'
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // 1-Click Load Demo SC Profile
  const loadDemoScProfile = () => {
    const scProfile = {
      id: "DEMO-SC-001",
      name: "Ramesh Kumar (Demo SC Entrepreneur)",
      age: 32,
      gender: "Male",
      category: "SC",
      casteCategory: "SC",
      state: "Telangana",
      district: "Hyderabad",
      villageTown: "Secunderabad",
      education: "10th pass",
      employmentStatus: "Self-Employed",
      occupation: "Small Business Owner",
      businessType: "Manufacturing",
      businessExperience: 4,
      annualIncome: 240000,
      existingBusinessIncome: 180000,
      projectCost: 350000,
      loanRequirement: 250000,
      numEmployees: 2,
      disabilityStatus: "No",
      bplStatus: "Yes",
      maritalStatus: "Married"
    };

    setFileType('demo-person');
    setSelectedFile({ name: 'demo-person-sc-profile.json', size: 1024, type: 'application/json' });
    setParsedData([scProfile]);
    setValidationErrors([]);
    setImportSuccess(false);
    showToast('Loaded Demo SC Profile (Ramesh Kumar)! Ready to evaluate.', 'success');
  };

  // Parse CSV helper supporting quotes and delimiters
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = [];
      let inQuotes = false;
      let currentValue = '';

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim().replace(/^["']|["']$/g, ''));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim().replace(/^["']|["']$/g, ''));

      const rowObj = {};
      headers.forEach((header, idx) => {
        let val = values[idx] !== undefined ? values[idx] : '';
        if (val.includes(';')) {
          val = val.split(';').map(s => s.trim());
        }
        rowObj[header] = val;
      });
      rows.push(rowObj);
    }
    return rows;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'json' && extension !== 'csv') {
      showToast('Please select a valid .json or .csv file.', 'error');
      return;
    }

    setSelectedFile(file);
    setParsedData(null);
    setValidationErrors([]);
    setImportSuccess(false);

    setParsing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target.result;
        let records = [];

        if (extension === 'json') {
          const parsed = JSON.parse(content);
          records = Array.isArray(parsed) ? parsed : [parsed];
        } else {
          records = parseCSV(content);
        }

        validateAndSetRecords(records);
      } catch (err) {
        showToast(`Failed to parse file: ${err.message}`, 'error');
        setValidationErrors([`File parsing error: ${err.message}`]);
      } finally {
        setParsing(false);
      }
    };

    reader.onerror = () => {
      showToast('Error reading file from disk.', 'error');
      setParsing(false);
    };

    reader.readAsText(file);
  };

  const validateAndSetRecords = (records) => {
    const errors = [];
    const validRecords = [];

    if (!records || records.length === 0) {
      errors.push('The uploaded file contains no data records.');
      setParsedData([]);
      setValidationErrors(errors);
      return;
    }

    records.forEach((record, index) => {
      const rowNum = index + 1;
      const rowErrors = [];

      if (fileType === 'scheme') {
        if (!record.name && !record.schemeName) {
          rowErrors.push(`Row ${rowNum}: Missing scheme name.`);
        }
        if (!record.category && !record.schemeCategory) {
          rowErrors.push(`Row ${rowNum}: Missing category.`);
        }
        if (record.minAge !== undefined && (isNaN(Number(record.minAge)) || Number(record.minAge) < 0 || Number(record.minAge) > 100)) {
          rowErrors.push(`Row ${rowNum}: Invalid minAge (must be 0-100).`);
        }
        if (record.interestRate !== undefined && (isNaN(Number(record.interestRate)) || Number(record.interestRate) < 0 || Number(record.interestRate) > 100)) {
          rowErrors.push(`Row ${rowNum}: Invalid interestRate.`);
        }
      } else {
        // User / Demo Person Profile
        if (!record.name) {
          rowErrors.push(`Row ${rowNum}: Missing person name.`);
        }
        if (record.annualIncome !== undefined) {
          const incVal = validateAndParseNumber(record.annualIncome, 'income');
          if (!incVal.isValid) {
            rowErrors.push(`Row ${rowNum}: Invalid annual income (${incVal.error}).`);
          }
        }
        if (record.age !== undefined) {
          const ageVal = validateAndParseNumber(record.age, 'age');
          if (!ageVal.isValid) {
            rowErrors.push(`Row ${rowNum}: Invalid age (${ageVal.error}).`);
          }
        }
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        validRecords.push(record);
      }
    });

    setParsedData(records);
    setValidationErrors(errors);

    if (errors.length === 0) {
      showToast(`Successfully validated ${validRecords.length} records with 0 errors!`, 'success');
    } else {
      showToast(`Validated with ${errors.length} warning(s)/error(s).`, 'warning');
    }
  };

  const handleImport = () => {
    if (!parsedData || parsedData.length === 0) {
      showToast('No parsed data available to import.', 'error');
      return;
    }

    try {
      if (fileType === 'scheme') {
        const stored = localStorage.getItem('schemesetu_custom_schemes');
        const currentList = stored ? JSON.parse(stored) : [];
        const merged = [...currentList, ...parsedData];
        localStorage.setItem('schemesetu_custom_schemes', JSON.stringify(merged));
        showToast(`Successfully imported ${parsedData.length} schemes into SchemeSetu!`, 'success');
      } else {
        localStorage.setItem('schemesetu_demo_users', JSON.stringify(parsedData));
        showToast(`Successfully saved ${parsedData.length} demo profiles!`, 'success');
      }
      setImportSuccess(true);
    } catch (err) {
      showToast(`Import failed: ${err.message}`, 'error');
    }
  };

  const handleEvaluateProfile = (profile) => {
    // Pass confirmed profile to eligibility wizard
    const evalData = {
      name: profile.name || 'Ramesh Kumar',
      age: Number(profile.age || 32),
      gender: profile.gender || 'Male',
      casteCategory: profile.casteCategory || profile.category || 'SC',
      annualIncome: Number(profile.annualIncome || 240000),
      occupation: profile.occupation || 'Farmer',
      state: profile.state || 'Telangana',
      areaType: profile.villageTown ? 'Rural' : 'Urban',
      education: profile.education || '10th pass',
      bplStatus: profile.bplStatus || 'Yes',
      projectCost: Number(profile.projectCost || 350000),
      loanRequirement: Number(profile.loanRequirement || 250000)
    };

    navigate('/eligibility', { state: { prefilledData: evalData } });
  };

  const handleResetData = () => {
    localStorage.removeItem('schemesetu_custom_schemes');
    localStorage.removeItem('schemesetu_demo_users');
    setParsedData(null);
    setSelectedFile(null);
    setValidationErrors([]);
    setShowResetModal(false);
    showToast('Prototype data reset! Restored baseline datasets.', 'success');
  };

  const handleDownloadSample = (sampleType, format) => {
    let fileName = '';
    let fileContent = '';

    if (sampleType === 'demo-person-sc') {
      fileName = `demo-person-sc-profile.${format}`;
      const sample = [{
        id: "DEMO-SC-001",
        name: "Ramesh Kumar (Demo SC Entrepreneur)",
        age: 32,
        gender: "Male",
        category: "SC",
        state: "Telangana",
        district: "Hyderabad",
        education: "10th pass",
        occupation: "Small Business Owner",
        businessType: "Manufacturing",
        annualIncome: 240000,
        projectCost: 350000,
        loanRequirement: 250000,
        bplStatus: "Yes"
      }];
      fileContent = format === 'json' ? JSON.stringify(sample[0], null, 2) : parseCSVToDownload(sample);
    } else if (sampleType === 'demo-person-multi') {
      fileName = `demo-person-multiple-profiles.${format}`;
      const sample = [
        { id: "DEMO-SC-001", name: "Ramesh Kumar", age: 32, category: "SC", annualIncome: 240000, projectCost: 350000, loanRequirement: 250000, state: "Telangana" },
        { id: "DEMO-OBC-002", name: "Lakshmi Devi", age: 28, category: "OBC", annualIncome: 180000, projectCost: 150000, loanRequirement: 100000, state: "Tamil Nadu" },
        { id: "DEMO-GEN-003", name: "Manpreet Singh", age: 45, category: "General", annualIncome: 320000, projectCost: 500000, loanRequirement: 400000, state: "Punjab" }
      ];
      fileContent = format === 'json' ? JSON.stringify(sample, null, 2) : parseCSVToDownload(sample);
    } else {
      fileName = `sample-schemes.${format}`;
      const sample = [{
        id: "SCHEME-SAMPLE-01",
        name: "PM Micro Enterprise Seed Grant",
        category: "Micro Enterprise Loan",
        level: "Central",
        minAge: 18,
        maxAge: 65,
        maxIncome: 500000,
        maxLoan: 500000,
        interestRate: 6.5,
        department: "Ministry of MSME"
      }];
      fileContent = format === 'json' ? JSON.stringify(sample, null, 2) : parseCSVToDownload(sample);
    }

    const blob = new Blob([fileContent], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded sample file: ${fileName}`, 'success');
  };

  const parseCSVToDownload = (data) => {
    const keys = Object.keys(data[0]);
    const header = keys.join(',');
    const rows = data.map(item => keys.map(k => `"${item[k]}"`).join(','));
    return [header, ...rows].join('\n');
  };

  return (
    <div className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Database size={22} style={{ color: '#D97706' }} />
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0B192C', margin: 0 }}>
              {t('dataHubTitle', 'Data Hub & Demo Person Upload Manager')}
            </h3>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.88rem', margin: 0 }}>
            {t('dataHubSub', 'Upload, validate, preview, and evaluate custom JSON/CSV person profiles and government scheme datasets offline.')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="btn btn-outline btn-sm"
            style={{ color: '#DC2626', borderColor: '#FECACA' }}
            title="Reset Prototype Data"
          >
            <RotateCcw size={14} /> Reset Demo Data
          </button>
        </div>
      </div>

      {/* Dataset Type Selector & 1-Click Demo Profile Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: '#F1F5F9', padding: '0.25rem', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => { setFileType('demo-person'); setParsedData(null); setSelectedFile(null); }}
            className={`btn btn-sm ${fileType === 'demo-person' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
          >
            <UserCheck size={15} /> Demo Person Profiles
          </button>
          <button
            type="button"
            onClick={() => { setFileType('scheme'); setParsedData(null); setSelectedFile(null); }}
            className={`btn btn-sm ${fileType === 'scheme' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
          >
            <FileSpreadsheet size={15} /> Scheme Dataset
          </button>
        </div>

        {/* 1-Click SC Profile Quick Trigger */}
        <button
          type="button"
          onClick={loadDemoScProfile}
          className="btn btn-secondary btn-sm"
          style={{ borderColor: '#D97706', color: '#D97706', fontWeight: 700 }}
        >
          ⚡ 1-Click Load SC Profile (Ramesh Kumar)
        </button>
      </div>

      {/* File Upload Drag & Drop Zone */}
      <div 
        style={{
          border: '2px dashed #CBD5E1',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#F8FAFC',
          marginBottom: '1.5rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={() => document.getElementById('file-upload-input').click()}
      >
        <input 
          id="file-upload-input"
          type="file" 
          accept=".json,.csv" 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
        />
        <UploadCloud size={38} style={{ color: '#0284C7', margin: '0 auto 0.75rem auto' }} />
        <h4 style={{ fontSize: '1.05rem', color: '#0F172A', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
          {selectedFile ? selectedFile.name : `Select or Drag & Drop ${fileType === 'scheme' ? 'Scheme' : 'Demo Person Profile'} File (.JSON / .CSV)`}
        </h4>
        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
          Local processing: data is parsed and evaluated securely in your browser session without internet dependencies.
        </p>

        {selectedFile && (
          <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
            <span>File Size: {(selectedFile.size / 1024).toFixed(1)} KB</span>
            <span>•</span>
            <span>Format: {selectedFile.name.split('.').pop().toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Sample Templates Download Hub */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', flexWrap: 'wrap' }}>
          <strong>Download Evaluation Samples:</strong>
          <button 
            type="button" 
            onClick={() => handleDownloadSample('demo-person-sc', 'json')} 
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem' }}
          >
            SC Profile JSON
          </button>
          <button 
            type="button" 
            onClick={() => handleDownloadSample('demo-person-sc', 'csv')} 
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem' }}
          >
            SC Profile CSV
          </button>
          <button 
            type="button" 
            onClick={() => handleDownloadSample('demo-person-multi', 'json')} 
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem' }}
          >
            Multiple Profiles JSON
          </button>
        </div>

        {parsedData && parsedData.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleImport}
              disabled={importSuccess}
              className="btn btn-outline btn-sm"
              style={{ fontWeight: 600 }}
            >
              {importSuccess ? <Check size={14} /> : <Database size={14} />}
              <span>{importSuccess ? 'Saved to Dataset' : 'Save to Dataset'}</span>
            </button>

            {fileType === 'demo-person' && parsedData[0] && (
              <button
                type="button"
                onClick={() => handleEvaluateProfile(parsedData[0])}
                className="btn btn-green btn-sm"
                style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <span>Confirm & Recommend Schemes</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Validation Status & Summary */}
      {parsedData && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '0.78rem', color: '#1E40AF', fontWeight: 600 }}>Total Records Detected</div>
              <div style={{ fontSize: '1.4rem', color: '#1E3A8A', fontWeight: 800 }}>{parsedData.length}</div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: validationErrors.length === 0 ? '#ECFDF5' : '#FEF3C7', borderRadius: '8px', border: `1px solid ${validationErrors.length === 0 ? '#A7F3D0' : '#FDE68A'}` }}>
              <div style={{ fontSize: '0.78rem', color: validationErrors.length === 0 ? '#065F46' : '#92400E', fontWeight: 600 }}>Validation Status</div>
              <div style={{ fontSize: '1rem', color: validationErrors.length === 0 ? '#047857' : '#B45309', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                {validationErrors.length === 0 ? (
                  <><CheckCircle2 size={18} /> Clean & Schema Validated</>
                ) : (
                  <><AlertTriangle size={18} /> {validationErrors.length} Warning(s)</>
                )}
              </div>
            </div>
          </div>

          {/* Validation Warnings List */}
          {validationErrors.length > 0 && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={16} /> Dataset Validation Issues:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#B91C1C' }}>
                {validationErrors.slice(0, 5).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Records Table Preview */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflowX: 'auto' }}>
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Table size={16} /> Preview ({parsedData.length} Records)
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1', color: '#475569' }}>
                  <th style={{ padding: '0.65rem 0.85rem' }}>#</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Name</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Category / Caste</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Income / Project Cost</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Location</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 8).map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#94A3B8', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: '#0F172A' }}>{row.name || row.schemeName || '—'}</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>
                      <span className="badge badge-cat" style={{ fontSize: '0.72rem' }}>
                        {row.casteCategory || row.category || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#059669', fontWeight: 600 }}>
                      {row.projectCost ? `Cost: ${formatIndianCurrency(row.projectCost)}` : (row.annualIncome ? `Income: ${formatIndianCurrency(row.annualIncome)}` : '—')}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#64748B' }}>{row.district ? `${row.district}, ${row.state}` : (row.state || 'Pan-India')}</td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      {fileType === 'demo-person' && (
                        <button
                          type="button"
                          onClick={() => handleEvaluateProfile(row)}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                        >
                          Evaluate <ArrowRight size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11, 25, 44, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '1.75rem', backgroundColor: '#FFFFFF', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#DC2626', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={20} /> Reset Prototype Data?
              </h3>
              <button onClick={() => setShowResetModal(false)} className="btn btn-sm btn-outline">✕</button>
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              This will clear imported demo profiles and custom uploaded schemes, restoring baseline national datasets. Baseline seed data will not be deleted.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowResetModal(false)} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button onClick={handleResetData} className="btn btn-danger btn-sm" style={{ backgroundColor: '#DC2626', borderColor: '#DC2626', color: '#FFF' }}>
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
