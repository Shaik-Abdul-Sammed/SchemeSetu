import React from 'react';
import { Award, CheckCircle, Star, ShieldCheck, Zap } from 'lucide-react';

export default function BadgeCard({ badges = [] }) {
  const allBadges = [
    { id: 'profile', title: 'Profile Master', desc: 'Completed income & enterprise details', icon: ShieldCheck, unlocked: true },
    { id: 'explorer', title: 'Scheme Explorer', desc: 'Explored 3+ government schemes', icon: Star, unlocked: true },
    { id: 'quiz', title: 'EMI Genius', desc: 'Passed financial literacy quiz', icon: Zap, unlocked: true },
    { id: 'applied', title: 'Loan Applicant', desc: 'Saved & submitted scheme application', icon: Award, unlocked: false }
  ];

  return (
    <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '1rem' }}>
      <h4 style={{ fontSize: '1.05rem', color: '#0B192C', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <Award style={{ color: '#F59E0B' }} size={20} /> Citizen Learning Badges & Achievements
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        {allBadges.map((b) => {
          const IconComp = b.icon;
          return (
            <div
              key={b.id}
              style={{
                padding: '0.85rem',
                borderRadius: '10px',
                background: b.unlocked ? '#ECFDF5' : '#F8FAFC',
                border: `1px solid ${b.unlocked ? '#A7F3D0' : '#E2E8F0'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: b.unlocked ? '#059669' : '#CBD5E1', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IconComp size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: b.unlocked ? '#065F46' : '#64748B' }}>{b.title}</div>
                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{b.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
