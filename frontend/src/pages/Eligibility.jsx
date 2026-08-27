import React from 'react';
import MultiStepEligibilityWizard from '../components/eligibility/MultiStepEligibilityWizard';

export default function Eligibility() {
  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#0B192C', marginBottom: '0.5rem' }}>
          Check Your Scheme Eligibility
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.05rem' }}>
          Answer a few simple questions to find government welfare programs matched specifically to your profile.
        </p>
      </div>

      <MultiStepEligibilityWizard />
    </div>
  );
}
