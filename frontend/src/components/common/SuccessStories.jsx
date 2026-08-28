import React, { useState } from 'react';
import { Quote, ChevronLeft, ChevronRight, Award } from 'lucide-react';

export default function SuccessStories() {
  const stories = [
    {
      name: 'Sunita Devi',
      location: 'Warangal, Telangana',
      scheme: 'PMMY Mudra Kishore',
      story: 'Received ₹3.5 Lakhs collateral-free loan to scale my garment stitching unit. Enabled 4 rural women to get employment.',
      amount: '₹3.50 Lakhs'
    },
    {
      name: 'Rajesh Paswan',
      location: 'Patna, Bihar',
      scheme: 'Stand-Up India',
      story: 'Sanctioned ₹10 Lakhs for setting up an eco-friendly paper-bag manufacturing business with 3-year tax exemption.',
      amount: '₹10.00 Lakhs'
    }
  ];

  const [index, setIndex] = useState(0);

  const prev = () => setIndex((index - 1 + stories.length) % stories.length);
  const next = () => setIndex((index + 1) % stories.length);

  const active = stories[index];

  return (
    <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '14px', border: '1px solid #E2E8F0', marginTop: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '1.1rem', color: '#0B192C', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Quote style={{ color: '#059669' }} size={20} /> Beneficiary Success Stories
        </h4>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button onClick={prev} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem' }}><ChevronLeft size={16} /></button>
          <button onClick={next} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem' }}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div style={{ background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '10px', borderLeft: '4px solid #059669' }}>
        <p style={{ fontSize: '0.92rem', color: '#334155', fontStyle: 'italic', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          "{active.story}"
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
          <div>
            <strong style={{ color: '#0B192C' }}>{active.name}</strong> • <span style={{ color: '#64748B' }}>{active.location}</span>
          </div>
          <span style={{ fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
            {active.amount} ({active.scheme})
          </span>
        </div>
      </div>
    </div>
  );
}
