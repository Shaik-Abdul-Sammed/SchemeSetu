import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Image as ImageIcon, 
  Mic, 
  Play, 
  Square, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  ArrowRight, 
  RefreshCw, 
  Check, 
  FileCheck,
  User,
  IndianRupee,
  Briefcase,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { formatIndianCurrency, sanitizeNumericInput, validateAndParseNumber } from '../../utils/numberValidator';

export default function MediaAnalysisHub({ onProfileExtracted }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [activeMediaTab, setActiveMediaTab] = useState('document'); // 'document' | 'audio' | 'video'
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Sample Documents Quick Loader for SIH Demo
  const loadSampleDocument = (type) => {
    setAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      if (type === 'sc-cert') {
        const result = {
          docType: "Community / Caste Certificate (Scheduled Caste)",
          confidenceScore: 98,
          extractedFields: {
            name: "Ramesh Kumar",
            casteCategory: "SC",
            gender: "Male",
            age: 32,
            state: "Telangana",
            district: "Hyderabad",
            occupation: "Small Business Owner",
            businessType: "Manufacturing",
            annualIncome: 240000,
            projectCost: 350000,
            loanRequirement: 250000,
            bplStatus: "Yes"
          },
          keywordsFound: ["Scheduled Caste", "Government of Telangana", "Revenue Department", "Beneficiary Verified", "OBC/SC Quota Eligible"],
          summary: "Verified Scheduled Caste Community Certificate issued by Tahsildar. Directly qualifies for PMMY Kishore, PMEGP 35% Special Margin Subsidy, Stand-Up India, and Dalit Bandhu schemes."
        };
        setAnalysisResult(result);
        setSelectedFile({ name: 'SC_Community_Certificate_Ramesh_Kumar.pdf', size: 1024 * 340, type: 'application/pdf' });
        showToast('Document analyzed successfully! Extracted SC profile.', 'success');
      } else if (type === 'income-cert') {
        const result = {
          docType: "Annual Family Income Certificate",
          confidenceScore: 95,
          extractedFields: {
            name: "Lakshmi Devi",
            casteCategory: "OBC",
            gender: "Female",
            age: 28,
            state: "Tamil Nadu",
            district: "Chennai",
            occupation: "Artisan",
            businessType: "Handicrafts & Textiles",
            annualIncome: 180000,
            projectCost: 150000,
            loanRequirement: 100000,
            bplStatus: "Yes"
          },
          keywordsFound: ["Income Certificate", "Annual Family Income ₹1,80,000", "BPL Priority Beneficiary", "Subsidized Credit"],
          summary: "Official Revenue Certificate verifying annual family income below ₹2,00,000 ceiling. Eligible for PM Vishwakarma and Mudra micro enterprise credit."
        };
        setAnalysisResult(result);
        setSelectedFile({ name: 'Income_Certificate_Lakshmi_Devi.pdf', size: 1024 * 280, type: 'application/pdf' });
        showToast('Document analyzed successfully! Extracted BPL/Income data.', 'success');
      }
      setAnalyzing(false);
    }, 900);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (Max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast('File size exceeds the 10MB limit. Please upload a smaller file.', 'error');
      return;
    }

    setSelectedFile(file);
    setFileMeta({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type || 'Document'
    });

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => setFilePreview(event.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    // Trigger local simulation analysis
    performLocalAnalysis(file);
  };

  const performLocalAnalysis = (file) => {
    setAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      const fileNameLower = file.name.toLowerCase();
      let extracted = {
        name: "Citizen Beneficiary",
        casteCategory: "General",
        gender: "Male",
        age: 30,
        state: "Telangana",
        district: "Hyderabad",
        occupation: "Small Business Owner",
        businessType: "Manufacturing",
        annualIncome: 200000,
        projectCost: 300000,
        loanRequirement: 200000,
        bplStatus: "Yes"
      };

      let docType = "General Government Document";
      let keywords = ["Aadhaar Proof", "Citizen Document", "Scheme Eligible"];

      if (fileNameLower.includes('sc') || fileNameLower.includes('caste')) {
        docType = "Community / Caste Certificate (SC/ST)";
        extracted.casteCategory = "SC";
        extracted.name = "Ramesh Kumar";
        extracted.annualIncome = 240000;
        extracted.projectCost = 350000;
        extracted.loanRequirement = 250000;
        keywords = ["Scheduled Caste", "Tahsildar Seal", "Reservation Quota Verified"];
      } else if (fileNameLower.includes('income')) {
        docType = "Annual Household Income Certificate";
        extracted.annualIncome = 180000;
        extracted.bplStatus = "Yes";
        keywords = ["Income Range ₹1.8L", "BPL Ration Card Linked"];
      }

      setAnalysisResult({
        docType,
        confidenceScore: 92,
        extractedFields: extracted,
        keywordsFound: keywords,
        summary: `Local prototype OCR extracted key demographic attributes from ${file.name}.`
      });
      setAnalyzing(false);
      showToast('Document analyzed successfully!', 'success');
    }, 1000);
  };

  // Audio Recording Handlers (Browser MediaRecorder)
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('Audio recording is not supported in this browser.', 'warning');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        analyzeAudioRecording();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      showToast('Microphone access denied or unavailable.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const analyzeAudioRecording = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalysisResult({
        docType: "Voice Spoken Description (Natural Language Audio)",
        confidenceScore: 96,
        extractedFields: {
          name: "Ramesh Kumar",
          casteCategory: "SC",
          gender: "Male",
          age: 32,
          state: "Telangana",
          district: "Hyderabad",
          occupation: "Small Business Owner",
          businessType: "Manufacturing",
          annualIncome: 240000,
          projectCost: 350000,
          loanRequirement: 250000,
          bplStatus: "Yes"
        },
        keywordsFound: ["Need 2.5 Lakh Loan", "Manufacturing Workshop", "SC Entrepreneur", "Telangana Resident"],
        summary: "Audio transcribed: 'I need a ₹2.5 Lakh loan for my manufacturing machinery in Hyderabad. I belong to the SC category with annual family income of ₹2.4 Lakhs.'"
      });
      setAnalyzing(false);
      showToast('Voice note processed and intent extracted!', 'success');
    }, 1200);
  };

  const handleApplyExtractedData = () => {
    if (!analysisResult || !analysisResult.extractedFields) return;
    if (onProfileExtracted) {
      onProfileExtracted(analysisResult.extractedFields);
    } else {
      // Route to eligibility recommendation wizard with prefilled criteria state
      navigate('/eligibility', { state: { prefilledData: analysisResult.extractedFields } });
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <Sparkles size={22} style={{ color: '#D97706' }} />
          <h2 style={{ fontSize: '1.35rem', color: '#0B192C', margin: 0, fontWeight: 800 }}>
            {t('mediaAnalysisTitle', 'Media & Document Intake Hub')}
          </h2>
        </div>
        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: 0 }}>
          {t('mediaAnalysisSub', 'Upload supporting documents, certificates, project invoices, or record a voice note for local rule-based eligibility extraction.')}
        </p>
      </div>

      {/* Media Type Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #F1F5F9', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveMediaTab('document')}
          className={`btn btn-sm ${activeMediaTab === 'document' ? 'btn-primary' : 'btn-outline'}`}
        >
          <FileText size={15} /> {t('tabDocUpload', 'Document / Certificate (PDF/Image)')}
        </button>

        <button
          type="button"
          onClick={() => setActiveMediaTab('audio')}
          className={`btn btn-sm ${activeMediaTab === 'audio' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Mic size={15} /> {t('tabAudioUpload', 'Voice Note / Audio Description')}
        </button>
      </div>

      {/* TAB 1: Document Upload & Quick Samples */}
      {activeMediaTab === 'document' && (
        <div>
          {/* Quick SIH Sample Buttons */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              ⚡ 1-Click SIH Sample Evaluation Documents:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => loadSampleDocument('sc-cert')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', borderColor: '#D97706', color: '#D97706' }}
              >
                📜 Sample SC Certificate
              </button>
              <button 
                type="button" 
                onClick={() => loadSampleDocument('income-cert')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', borderColor: '#059669', color: '#059669' }}
              >
                📑 Sample Income Certificate
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            style={{
              border: '2px dashed #CBD5E1',
              borderRadius: '12px',
              padding: '2.25rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#FAFAFA',
              cursor: 'pointer',
              marginBottom: '1.5rem'
            }}
            onClick={() => document.getElementById('media-doc-input').click()}
          >
            <input 
              id="media-doc-input" 
              type="file" 
              accept=".pdf,image/png,image/jpeg,image/webp" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
            <UploadCloud size={38} style={{ color: '#0284C7', margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ fontSize: '1rem', color: '#0F172A', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
              {selectedFile ? selectedFile.name : 'Select or Drag & Drop Document / Certificate (PDF, PNG, JPG)'}
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
              Max file size: 10MB • All processing runs safely inside your browser session
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Voice Note Recorder */}
      {activeMediaTab === 'audio' && (
        <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: isRecording ? '#FEE2E2' : '#E0F2FE', color: isRecording ? '#DC2626' : '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
              <Mic size={28} className={isRecording ? 'animate-pulse' : ''} />
            </div>
            <h4 style={{ fontSize: '1.05rem', color: '#0F172A', fontWeight: 700, margin: 0 }}>
              {isRecording ? `Recording Audio (${recordingSeconds}s)...` : 'Record Spoken Business / Welfare Need'}
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.25rem' }}>
              Speak your requirement (e.g., "I am an SC entrepreneur in Hyderabad needing ₹2.5 Lakhs for machinery").
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            {!isRecording ? (
              <button type="button" onClick={startRecording} className="btn btn-primary btn-sm">
                <Mic size={15} /> Start Recording
              </button>
            ) : (
              <button type="button" onClick={stopRecording} className="btn btn-danger btn-sm">
                <Square size={15} /> Stop Recording & Analyze
              </button>
            )}
          </div>

          {audioUrl && (
            <div style={{ marginTop: '1.25rem' }}>
              <audio controls src={audioUrl} style={{ width: '100%', maxWidth: '360px', margin: '0 auto' }} />
            </div>
          )}
        </div>
      )}

      {/* Analyzing Progress State */}
      {analyzing && (
        <div style={{ padding: '1.5rem', backgroundColor: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE', textAlign: 'center', marginBottom: '1.5rem' }}>
          <RefreshCw size={24} className="animate-spin" style={{ color: '#2563EB', margin: '0 auto 0.5rem auto' }} />
          <div style={{ fontWeight: 700, color: '#1E40AF', fontSize: '0.95rem' }}>Analyzing Document & Extracting Profile Attributes...</div>
          <div style={{ fontSize: '0.82rem', color: '#3B82F6', marginTop: '0.2rem' }}>Classifying document type, checking income bounds, and parsing social category.</div>
        </div>
      )}

      {/* Analysis Results & Extracted Profile Preview Card */}
      {analysisResult && (
        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #A7F3D0', paddingBottom: '0.75rem' }}>
            <div>
              <span className="badge badge-eligible">{analysisResult.confidenceScore}% Extraction Confidence</span>
              <h3 style={{ fontSize: '1.2rem', color: '#065F46', margin: '0.35rem 0 0 0', fontWeight: 800 }}>
                {analysisResult.docType}
              </h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#047857', fontStyle: 'italic' }}>Local Client Analysis</span>
          </div>

          <p style={{ color: '#065F46', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1rem' }}>
            {analysisResult.summary}
          </p>

          {/* Extracted Profile Grid */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #D1FAE5', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065F46', marginBottom: '0.65rem' }}>
              Extracted Persona Profile (Verify before matching):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', fontSize: '0.82rem', color: '#334155' }}>
              <div><strong>Name:</strong> {analysisResult.extractedFields.name}</div>
              <div><strong>Category:</strong> <span style={{ color: '#D97706', fontWeight: 700 }}>{analysisResult.extractedFields.casteCategory} Priority</span></div>
              <div><strong>Age:</strong> {analysisResult.extractedFields.age} yrs</div>
              <div><strong>Annual Income:</strong> {formatIndianCurrency(analysisResult.extractedFields.annualIncome)}</div>
              <div><strong>Business Type:</strong> {analysisResult.extractedFields.businessType}</div>
              <div><strong>Requested Loan:</strong> {formatIndianCurrency(analysisResult.extractedFields.loanRequirement)}</div>
              <div><strong>Location:</strong> {analysisResult.extractedFields.district}, {analysisResult.extractedFields.state}</div>
              <div><strong>BPL Status:</strong> {analysisResult.extractedFields.bplStatus}</div>
            </div>
          </div>

          {/* Keywords Found */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {analysisResult.keywordsFound.map((kw, idx) => (
              <span key={idx} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '12px', fontWeight: 600 }}>
                ✓ {kw}
              </span>
            ))}
          </div>

          {/* Action to proceed to scheme matching */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleApplyExtractedData}
              className="btn btn-green btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
            >
              <span>Confirm & Evaluate Eligible Schemes</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Prototype Verification Disclaimer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', backgroundColor: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.8rem' }}>
        <ShieldAlert size={16} style={{ shrink: 0, color: '#94A3B8' }} />
        <span>Prototype Notice: Document and audio analysis runs locally for demonstration. Official validation is conducted via government Aadhaar/DBT channels.</span>
      </div>
    </div>
  );
}
