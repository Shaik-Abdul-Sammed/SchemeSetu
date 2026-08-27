import React from 'react';

export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="skeleton" style={{ height: '24px', width: '60%' }} />
          <div className="skeleton" style={{ height: '16px', width: '40%' }} />
          <div className="skeleton" style={{ height: '48px', width: '100%' }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="skeleton" style={{ height: '28px', width: '100px' }} />
            <div className="skeleton" style={{ height: '28px', width: '120px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
