import React from 'react';
import { SearchX } from 'lucide-react';

export default function EmptyState({ title = "No schemes found", message = "Try adjusting your search terms or clearing selected filters.", onClear }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#F1F5F9', color: '#64748B', marginBottom: '1rem' }}>
        <SearchX size={32} />
      </div>
      <h3 style={{ color: '#0F172A', marginBottom: '0.5rem', fontSize: '1.25rem' }}>{title}</h3>
      <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>{message}</p>
      {onClear && (
        <button onClick={onClear} className="btn btn-primary btn-sm">
          Reset All Filters
        </button>
      )}
    </div>
  );
}
