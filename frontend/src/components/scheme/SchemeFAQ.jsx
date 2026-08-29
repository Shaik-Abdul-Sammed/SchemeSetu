import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function SchemeFAQ({ schemeName = 'Government Scheme', faqs = [] }) {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0);

  const defaultFaqs = [
    {
      question: `Who is eligible to apply for ${schemeName}?`,
      answer: `Citizens matching the age limit, annual income criteria, and occupation guidelines listed under the eligibility section can apply.`
    },
    {
      question: `What documents are required for application submission?`,
      answer: `Primary documents include Aadhaar Card, Bank Account Passbook, Income Certificate, Caste/Category Certificate (if applicable), and Passport Photo.`
    },
    {
      question: `How is the cash benefit or subsidy disbursed?`,
      answer: `Financial grants are disbursed directly into the beneficiary's Aadhaar-seeded bank account via Direct Benefit Transfer (DBT).`
    },
    {
      question: `Can an applicant apply through nearest Common Service Centre (CSC)?`,
      answer: `Yes, certified Gram Panchayat VLEs and CSC Jan Seva Kendras can submit applications on your behalf using the Agent Portal.`
    }
  ];

  const listToRender = faqs && faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <HelpCircle size={22} style={{ color: '#F59E0B' }} />
        <h3 style={{ fontSize: '1.25rem', color: '#0B192C', margin: 0 }}>
          {t('faqsTitle', 'Frequently Asked Questions (FAQs)')}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {listToRender.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const qText = faq.question || faq.qEn || '';
          const aText = faq.answer || faq.aEn || '';

          return (
            <div
              key={idx}
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF'
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  background: isOpen ? '#F8FAFC' : '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#0F172A'
                }}
              >
                <span>{qText}</span>
                {isOpen ? <ChevronUp size={18} style={{ color: '#F59E0B', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: '#64748B', flexShrink: 0 }} />}
              </button>

              {isOpen && (
                <div style={{ padding: '0.85rem 1rem 1rem', fontSize: '0.9rem', color: '#475569', borderTop: '1px solid #E2E8F0', lineHeight: 1.6, backgroundColor: '#F8FAFC' }}>
                  <p style={{ margin: 0 }}>{aText}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
