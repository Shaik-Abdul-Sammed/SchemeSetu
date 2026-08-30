import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MultiStepEligibilityWizard from '../components/eligibility/MultiStepEligibilityWizard';
import MediaAnalysisHub from '../components/media/MediaAnalysisHub';
import DataUploadManager from '../components/admin/DataUploadManager';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, FileText, UploadCloud, UserCheck } from 'lucide-react';

export default function Eligibility({ initialMode }) {
  const { t } = useLanguage();
  const location = useLocation();
  const [intakeMode, setIntakeMode] = useState(() => {
    if (initialMode) return initialMode;
    if (location.pathname === '/media' || location.state?.mode === 'media') return 'media';
    if (location.state?.mode === 'upload') return 'upload';
    return 'wizard';
  });
  const [extractedProfile, setExtractedProfile] = useState(null);

  const handleProfileExtracted = (profileData) => {
    setExtractedProfile(profileData);
    setIntakeMode('wizard');
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 2rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#0B192C', marginBottom: '0.5rem', fontWeight: 800 }}>
          {t('checkEligibility', 'Check Your Scheme Eligibility')}
        </h1>
        <p style={{ color: '#64748B', fontSize: '1rem' }}>
          {t('eligibilitySubtitle', 'Discover central and state government welfare initiatives and subsidized loans matched specifically to your demographic and financial profile.')}
        </p>

        {/* Mode Switcher Buttons */}
        <div style={{ display: 'inline-flex', gap: '0.5rem', backgroundColor: '#F1F5F9', padding: '0.35rem', borderRadius: '12px', marginTop: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setIntakeMode('wizard')}
            className={`btn btn-sm ${intakeMode === 'wizard' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.84rem' }}
          >
            <FileText size={15} /> {t('stepwiseWizard', 'Step-by-Step Wizard')}
          </button>

          <button
            type="button"
            onClick={() => setIntakeMode('media')}
            className={`btn btn-sm ${intakeMode === 'media' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.84rem' }}
          >
            <Sparkles size={15} /> {t('mediaDocAnalysis', 'Media & Document Intake')}
          </button>

          <button
            type="button"
            onClick={() => setIntakeMode('upload')}
            className={`btn btn-sm ${intakeMode === 'upload' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.84rem' }}
          >
            <UserCheck size={15} /> {t('demoPersonUpload', 'Upload Demo Person Profile')}
          </button>
        </div>
      </div>

      {intakeMode === 'wizard' && (
        <MultiStepEligibilityWizard key={extractedProfile ? JSON.stringify(extractedProfile) : 'wizard-default'} />
      )}

      {intakeMode === 'media' && (
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <MediaAnalysisHub onProfileExtracted={handleProfileExtracted} />
        </div>
      )}

      {intakeMode === 'upload' && (
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <DataUploadManager />
        </div>
      )}
    </div>
  );
}
