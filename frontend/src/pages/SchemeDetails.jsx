import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  FileText, 
  ListOrdered, 
  HelpCircle, 
  Award, 
  UserCheck, 
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { schemeService } from '../services/schemeService';
import { useLanguage } from '../context/LanguageContext';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import AudioReaderButton from '../components/common/AudioReaderButton';
import ShareSchemeButton from '../components/common/ShareSchemeButton';
import BenefitEstimator from '../components/scheme/BenefitEstimator';
import SchemeFAQ from '../components/scheme/SchemeFAQ';
import ApplicationGuidanceModal from '../components/scheme/ApplicationGuidanceModal';

export default function SchemeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [guidanceOpen, setGuidanceOpen] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await schemeService.getSchemeById(id);
      const data = res.data;
      setScheme(data);

      // Save to recently viewed schemes in localStorage
      if (data && data.id) {
        try {
          const stored = localStorage.getItem('schemesetu_recently_viewed');
          let list = stored ? JSON.parse(stored) : [];
          list = list.filter(item => item.id !== data.id);
          list.unshift({ id: data.id, name: data.name, category: data.category, summary: data.summary });
          localStorage.setItem('schemesetu_recently_viewed', JSON.stringify(list.slice(0, 8)));
        } catch (e) {
          console.error('Failed to save to recently viewed:', e);
        }
      }
    } catch (err) {
      setError(err.message || `Scheme with ID '${id}' could not be loaded.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem' }}>
        <LoadingSkeleton count={2} />
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem' }}>
        <ErrorMessage title={t('unableToLoad', 'Scheme Not Found')} message={error} onRetry={fetchDetails} />
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/schemes" className="btn btn-primary">
            <ArrowLeft size={16} /> {t('backToSchemes', 'Back to Schemes List')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Back Breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/schemes" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={16} /> {t('backToSchemes', 'Back to Schemes List')}
        </Link>
      </div>

      {/* Header Banner */}
      <div className="card" style={{ backgroundColor: '#0B192C', color: '#FFFFFF', padding: '2.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span className="badge badge-central">{scheme.level === 'Central' ? t('centralLevel', 'Central') : t('stateLevel', 'State')}</span>
          <span className="badge badge-cat">{scheme.category}</span>
        </div>

        <h1 style={{ fontSize: '2.25rem', color: '#FFFFFF', marginBottom: '0.75rem', lineHeight: 1.2 }}>
          {scheme.name}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          <Building2 size={18} style={{ color: '#F59E0B' }} />
          <span>{scheme.department}</span>
        </div>

        <p style={{ color: '#CBD5E1', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '900px', marginBottom: '2rem' }}>
          {scheme.summary}
        </p>

        {/* Action CTAs */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setGuidanceOpen(true)} className="btn btn-primary btn-lg" style={{ backgroundColor: '#059669', borderColor: '#059669' }}>
            <FileText size={18} /> {t('applyGuidanceBtn', 'Apply Now / Application Guidance')}
          </button>

          <button onClick={() => navigate('/eligibility')} className="btn btn-secondary btn-lg">
            <Sparkles size={18} /> {t('checkMyEligibility', 'Check My Eligibility')}
          </button>

          <a 
            href={scheme.officialUrl || 'https://www.myscheme.gov.in/'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-secondary btn-lg"
          >
            {t('officialPortal', 'Official Portal')} <ExternalLink size={18} />
          </a>

          <AudioReaderButton textToRead={`${scheme.name}. ${scheme.summary}. ${scheme.benefits}`} label={t('readAloud', 'Read Aloud')} />
          <ShareSchemeButton scheme={scheme} />
        </div>
      </div>

      {/* Main Grid Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
        {/* Left Column: Benefits & Eligibility */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Key Benefits */}
          <div className="card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: '#0B192C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award style={{ color: '#059669' }} size={22} /> {t('schemeBenefits', 'Scheme Benefits')}
            </h2>
            <div style={{ backgroundColor: '#ECFDF5', padding: '1rem', borderRadius: '8px', border: '1px solid #A7F3D0', color: '#047857', fontWeight: 600, marginBottom: '1rem' }}>
              {scheme.benefits}
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {(scheme.detailedBenefits || []).map((benefit, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.95rem', color: '#334155' }}>
                  <CheckCircle2 size={18} style={{ color: '#059669', shrink: 0, marginTop: '2px' }} />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Eligibility Criteria */}
          <div className="card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: '#0B192C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck style={{ color: '#D97706' }} size={22} /> {t('eligibilityCriteria', 'Eligibility Criteria')}
            </h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(scheme.eligibilityCriteria || []).map((criterion, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.95rem', color: '#334155', padding: '0.6rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <CheckCircle2 size={18} style={{ color: '#D97706', shrink: 0, marginTop: '2px' }} />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Application Process */}
          <div className="card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: '#0B192C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ListOrdered style={{ color: '#1D4ED8' }} size={22} /> {t('applicationSteps', 'Application Steps')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(scheme.applicationProcess || []).map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.85rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, shrink: 0 }}>
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#334155', paddingTop: '0.2rem' }}>
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Required Documents, FAQs, Quick Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Documents Required */}
          <div className="card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: '#0B192C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText style={{ color: '#7E22CE' }} size={22} /> {t('documentsRequired', 'Documents Required')}
            </h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(scheme.documentsRequired || []).map((doc, idx) => (
                <li key={idx} style={{ padding: '0.65rem 0.85rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#1E293B', fontWeight: 500 }}>
                  📄 {doc}
                </li>
              ))}
            </ul>
          </div>

          {/* Scheme Quick Specifications */}
          <div className="card" style={{ backgroundColor: '#F8FAFC' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.85rem', color: '#0B192C' }}>{t('schemeSpecifications', 'Scheme Specifications')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>{t('targetBeneficiary', 'Target Beneficiary:')}</span>
                <strong style={{ color: '#0F172A' }}>{scheme.beneficiary}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>{t('ageLimit', 'Age Limit:')}</span>
                <strong style={{ color: '#0F172A' }}>{scheme.minAge} - {scheme.maxAge} {t('years', 'Years')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>{t('incomeCeiling', 'Income Ceiling:')}</span>
                <strong style={{ color: '#0F172A' }}>{t('upTo', 'Up to')} ₹{(scheme.maxIncome || 1000000).toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>{t('officialPortal', 'Official Portal')}:</span>
                <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0284C7', fontWeight: 600 }}>
                  {t('visitPortal', 'Visit Portal ↗')}
                </a>
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          {scheme.faqs && scheme.faqs.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: '#0B192C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle style={{ color: '#0284C7' }} size={22} /> {t('faqsTitle', 'Frequently Asked Questions')}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {scheme.faqs.map((faq, idx) => (
                  <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        textAlign: 'left',
                        background: '#F8FAFC',
                        border: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: '#0F172A',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{faq.question}</span>
                      {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {openFaq === idx && (
                      <div style={{ padding: '0.85rem 1rem', fontSize: '0.9rem', color: '#475569', backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Subsidy Benefit Estimator */}
      <div style={{ marginTop: '2rem' }}>
        <BenefitEstimator scheme={scheme} />
      </div>

      {/* Bilingual Scheme FAQs */}
      <div style={{ marginTop: '2rem' }}>
        <SchemeFAQ schemeName={scheme.name} faqs={scheme.faqs} />
      </div>

      {/* Perfectly Centered Bottom Action Container */}
      <div className="bottom-action-container">
        <Link to="/schemes" className="btn btn-secondary btn-lg" style={{ minWidth: '200px', justifyContent: 'center' }}>
          <ArrowLeft size={18} /> {t('backToSchemes', 'Back to Schemes')}
        </Link>
        <button onClick={() => setGuidanceOpen(true)} className="btn btn-primary btn-lg" style={{ minWidth: '220px', justifyContent: 'center', backgroundColor: '#059669', borderColor: '#059669' }}>
          <FileText size={18} /> {t('applyGuidanceBtn', 'Apply Now / Guidance')}
        </button>
      </div>

      {/* Application Guidance Modal */}
      <ApplicationGuidanceModal 
        isOpen={guidanceOpen} 
        onClose={() => setGuidanceOpen(false)} 
        scheme={scheme} 
      />
    </div>
  );
}
