import React, { useState } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { sanitizeNumericInput, validateAndParseNumber } from '../../utils/numberValidator';

export default function DataUploadManager() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [fileType, setFileType] = useState('scheme'); // 'scheme' | 'user'
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [importSuccess, setImportSuccess] = useState(false);

  // Parse CSV helper supporting quotes and delimiters
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex for CSV values taking quotes into account
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
        // Convert semicolon delimited arrays
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

    // Read and parse file immediately
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
        // Validate numeric boundaries
        if (record.minAge !== undefined && (isNaN(Number(record.minAge)) || Number(record.minAge) < 0 || Number(record.minAge) > 100)) {
          rowErrors.push(`Row ${rowNum}: Invalid minAge (must be 0-100).`);
        }
        if (record.interestRate !== undefined && (isNaN(Number(record.interestRate)) || Number(record.interestRate) < 0 || Number(record.interestRate) > 100)) {
          rowErrors.push(`Row ${rowNum}: Invalid interestRate.`);
        }
      } else {
        // User profile dataset
        if (!record.name) {
          rowErrors.push(`Row ${rowNum}: Missing beneficiary name.`);
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
        showToast(`Successfully loaded ${parsedData.length} test user profiles!`, 'success');
      }
      setImportSuccess(true);
    } catch (err) {
      showToast(`Import failed: ${err.message}`, 'error');
    }
  };

  const handleDownloadSample = (format) => {
    const sampleData = fileType === 'scheme' ? [
      {
        id: "SCHEME-SAMPLE-01",
        name: "PM Micro Enterprise Seed Grant",
        category: "Micro Enterprise Loan",
        level: "Central",
        state: "Pan-India",
        minAge: 18,
        maxAge: 65,
        minIncome: 0,
        maxIncome: 500000,
        minLoan: 50000,
        maxLoan: 500000,
        interestRate: 6.5,
        tenureMonths: 60,
        moratoriumMonths: 6,
        projectTypes: "manufacturing;services;trading",
        education: "10th pass;12th pass;graduate;any",
        department: "Ministry of MSME",
        benefits: "₹50,000 to ₹5,00,000 collateral-free business grant with 6.5% interest rate.",
        summary: "Affordable seed capital for micro enterprises and local entrepreneurs."
      }
    ] : [
      {
        id: "USER-SAMPLE-01",
        name: "Ramesh Kumar",
        age: 32,
        gender: "Male",
        category: "SC",
        annualIncome: 240000,
        education: "10th pass",
        occupation: "Small Business Owner",
        projectCost: 350000,
        state: "Telangana",
        district: "Hyderabad"
      }
    ];

    let fileContent = '';
    let fileName = `sample-${fileType}s.${format}`;
    let mimeType = 'text/plain';

    if (format === 'json') {
      fileContent = JSON.stringify(sampleData, null, 2);
      mimeType = 'application/json';
    } else {
      fileContent = parseCSVToDownload(sampleData);
      mimeType = 'text/csv';
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded sample template: ${fileName}`, 'success');
  };

  const parseCSVToDownload = (data) => {
    const keys = Object.keys(data[0]);
    const header = keys.join(',');
    const rows = data.map(item => keys.map(k => `"${item[k]}"`).join(','));
    return [header, ...rows].join('\n');
  };

  return (
    <div className="card" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Database size={22} style={{ color: '#D97706' }} />
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0B192C', margin: 0 }}>
              {t('dataHubTitle', 'Data Hub & Dataset Import Manager')}
            </h3>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.88rem', margin: 0 }}>
            {t('dataHubSub', 'Upload, validate, preview, and import custom JSON/CSV government schemes and user profiles completely offline.')}
          </p>
        </div>

        {/* Dataset Type Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#F1F5F9', padding: '0.25rem', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => { setFileType('scheme'); setParsedData(null); setSelectedFile(null); }}
            className={`btn btn-sm ${fileType === 'scheme' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
          >
            <FileSpreadsheet size={15} /> Scheme Dataset
          </button>
          <button
            type="button"
            onClick={() => { setFileType('user'); setParsedData(null); setSelectedFile(null); }}
            className={`btn btn-sm ${fileType === 'user' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
          >
            <FileCode size={15} /> Test User Profiles
          </button>
        </div>
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
        <UploadCloud size={40} style={{ color: '#0284C7', margin: '0 auto 0.75rem auto' }} />
        <h4 style={{ fontSize: '1.05rem', color: '#0F172A', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
          {selectedFile ? selectedFile.name : 'Select or Drag & Drop Scheme / User Dataset (.JSON or .CSV)'}
        </h4>
        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
          Local processing: data is read, parsed, and verified in your browser without external internet transmission.
        </p>

        {selectedFile && (
          <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
            <span>File Size: {(selectedFile.size / 1024).toFixed(1)} KB</span>
            <span>•</span>
            <span>Format: {selectedFile.name.split('.').pop().toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Sample Templates & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
          <span>Download Sample Template:</span>
          <button 
            type="button" 
            onClick={() => handleDownloadSample('json')} 
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.78rem', padding: '0.2rem 0.55rem' }}
          >
            <Download size={13} /> JSON Template
          </button>
          <button 
            type="button" 
            onClick={() => handleDownloadSample('csv')} 
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.78rem', padding: '0.2rem 0.55rem' }}
          >
            <Download size={13} /> CSV Template
          </button>
        </div>

        {parsedData && parsedData.length > 0 && (
          <button
            type="button"
            onClick={handleImport}
            disabled={importSuccess}
            className="btn btn-green btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
          >
            {importSuccess ? <Check size={16} /> : <Database size={16} />}
            <span>{importSuccess ? 'Imported Successfully' : `Import ${parsedData.length} Records into Prototype`}</span>
          </button>
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
                  <><CheckCircle2 size={18} /> Valid & Clean</>
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
                {validationErrors.length > 5 && <li>...and {validationErrors.length - 5} more issues.</li>}
              </ul>
            </div>
          )}

          {/* Records Table Preview */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflowX: 'auto' }}>
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
              <Table size={16} /> Table Preview ({parsedData.length} Rows)
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1', color: '#475569' }}>
                  <th style={{ padding: '0.65rem 0.85rem' }}>#</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Name</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Category / Occupation</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Income / Limits</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Level / State</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 6).map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#94A3B8', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: '#0F172A' }}>{row.name || row.schemeName || '—'}</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>{row.category || row.occupation || '—'}</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#059669', fontWeight: 600 }}>
                      {row.maxLoan ? `Max ₹${Number(row.maxLoan).toLocaleString('en-IN')}` : (row.annualIncome ? `₹${Number(row.annualIncome).toLocaleString('en-IN')}/yr` : '—')}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#64748B' }}>{row.level || row.state || 'Pan-India'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
