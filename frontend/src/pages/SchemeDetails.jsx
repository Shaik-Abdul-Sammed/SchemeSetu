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
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorMessage from '../components/common/ErrorMessage';

export default function SchemeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await schemeService.getSchemeById(id);
      setScheme(res.data);
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
        <ErrorMessage title="Scheme Not Found" message={error} onRetry={fetchDetails} />
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/schemes" className="btn btn-primary">
            <ArrowLeft size={16} /> Back to All Schemes
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
          <ArrowLeft size={16} /> Back to Schemes List
        </Link>
      </div>

      {/* Header Banner */}
      <div className="card" style={{ backgroundColor: '#0B192C', color: '#FFFFFF', padding: '2.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span className="badge badge-central">{scheme.level} Scheme</span>
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
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/eligibility')} className="btn btn-primary btn-lg">
            <Sparkles size={18} /> Check My Eligibility
          </button>

          <a 
            href={scheme.officialUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-secondary btn-lg"
          >
            Apply on Official Portal <ExternalLink size={18} />
          </a>
        </div>
      </div>

      {/* Main Grid Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Benefits & Eligibility */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Key Benefits */}
          <div className="card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: '#0B192C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award style={{ color: '#059669' }} size={22} /> Scheme Benefits
            </h2>
            <div style={{ backgroundColor: '#ECFDF5', padding: '1rem', borderRadius: '8px', border: '1px solid #A7F3D0', color: '#047857', fontWeight: 600, marginBottom: '1rem' }}>
              {scheme.benefits}
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {scheme.detailedBenefits.map((benefit, idx) => (
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
              <UserCheck style={{ color: '#D97706' }} size={22} /> Eligibility Criteria
            </h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {scheme.eligibilityCriteria.map((criterion, idx) => (
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
              <ListOrdered style={{ color: '#1D4ED8' }} size={22} /> Application Steps
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {scheme.applicationProcess.map((step, idx) => (
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
              <FileText style={{ color: '#7E22CE' }} size={22} /> Documents Required
            </h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {scheme.documentsRequired.map((doc, idx) => (
                <li key={idx} style={{ padding: '0.65rem 0.85rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#1E293B', fontWeight: 500 }}>
                  📄 {doc}
                </li>
              ))}
            </ul>
          </div>

          {/* Scheme Quick Specifications */}
          <div className="card" style={{ backgroundColor: '#F8FAFC' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.85rem', color: '#0B192C' }}>Scheme Specifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>Target Beneficiary:</span>
                <strong style={{ color: '#0F172A' }}>{scheme.beneficiary}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>Age Limit:</span>
                <strong style={{ color: '#0F172A' }}>{scheme.minAge} - {scheme.maxAge} Years</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>Income Ceiling:</span>
                <strong style={{ color: '#0F172A' }}>Up to ₹{scheme.maxIncome.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Official Portal:</span>
                <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0284C7', fontWeight: 600 }}>
                  Visit Portal ↗
                </a>
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          {scheme.faqs && scheme.faqs.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: '#0B192C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle style={{ color: '#0284C7' }} size={22} /> Frequently Asked Questions
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
                        justify: 'space-between',
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
    </div>
  );
}
