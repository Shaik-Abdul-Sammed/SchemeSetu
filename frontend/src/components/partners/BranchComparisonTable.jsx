import React from 'react';
import { Building2, Phone, MapPin, CheckCircle2, AlertTriangle, ShieldCheck, Navigation, ExternalLink, Clock } from 'lucide-react';

export default function BranchComparisonTable({ partners = [], onSelectPartner }) {
  if (!partners || partners.length === 0) return null;

  const topPartners = partners.slice(0, 3);

  return (
    <div style={{
      backgroundColor: '#0F172A',
      border: '1px solid #1E293B',
      borderRadius: '16px',
      padding: '1.5rem',
      margin: '1.5rem 0',
      color: '#F8FAFC',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)'
    }}>
      <div style={{ borderBottom: '1px solid #334155', paddingBottom: '0.85rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Building2 size={20} style={{ color: '#F59E0B' }} />
            <span>Multi-Branch Comparative Matrix</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0.25rem 0 0' }}>
            Side-by-side comparison of nearest banking branches by distance, loan budget, NPA risk rating & nodal helpline
          </p>
        </div>
        <span className="badge" style={{ backgroundColor: '#1E293B', color: '#CBD5E1', border: '1px solid #475569', fontSize: '0.75rem', fontWeight: 700 }}>
          Top {topPartners.length} Nearest Branches
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', fontSize: '0.84rem', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94A3B8' }}>
              <th style={{ padding: '0.75rem', backgroundColor: 'rgba(30, 41, 59, 0.5)', width: '22%', fontWeight: 700 }}>Metric</th>
              {topPartners.map(p => (
                <th key={p.id} style={{ padding: '0.75rem', backgroundColor: '#1E293B', fontWeight: 800, color: '#FFFFFF' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>{p.name}</span>
                    {p.ifscCode && (
                      <span style={{ fontSize: '0.72rem', color: '#FCD34D', fontFamily: 'monospace' }}>
                        IFSC: {p.ifscCode}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <td style={{ padding: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Institution Type</td>
              {topPartners.map(p => (
                <td key={p.id} style={{ padding: '0.75rem', color: '#E2E8F0', fontWeight: 600 }}>
                  <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#FCD34D', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.72rem' }}>
                    {p.type}
                  </span>
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <td style={{ padding: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Proximity & Travel</td>
              {topPartners.map(p => {
                const distVal = p.calculatedDistance !== undefined && p.calculatedDistance !== null ? p.calculatedDistance : (p.distanceKm || p.distance);
                const numDist = distVal !== undefined && distVal !== null ? Number(distVal) : null;
                return (
                  <td key={p.id} style={{ padding: '0.75rem', color: '#34D399', fontFamily: 'monospace', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} style={{ color: '#10B981', shrink: 0 }} />
                      <span>{numDist !== null && !isNaN(numDist) ? (numDist <= 1 ? 'Within 1 km' : `${numDist.toFixed(1)} km`) : (p.distanceText || 'Near You')}</span>
                    </div>
                    {numDist !== null && !isNaN(numDist) && (
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.15rem' }}>
                        ~{Math.max(2, Math.ceil(numDist * 2.5))} min drive
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <td style={{ padding: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Fund Availability</td>
              {topPartners.map(p => (
                <td key={p.id} style={{ padding: '0.75rem' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    backgroundColor: p.fundAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: p.fundAvailable ? '#34D399' : '#F87171',
                    border: p.fundAvailable ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    {p.fundAvailable ? '✓ Active Lending Funds' : 'Budget Exhausted'}
                  </span>
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <td style={{ padding: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>NPA Risk Status</td>
              {topPartners.map(p => (
                <td key={p.id} style={{ padding: '0.75rem' }}>
                  <span style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: p.npaStatus === 'low' ? '#34D399' : '#FBBF24',
                    backgroundColor: p.npaStatus === 'low' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                  }}>
                    <ShieldCheck size={13} style={{ display: 'inline', marginRight: '3px' }} />
                    {p.npaStatus || 'Low'} NPA
                  </span>
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <td style={{ padding: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Nodal Helpline</td>
              {topPartners.map(p => (
                <td key={p.id} style={{ padding: '0.75rem' }}>
                  {p.phone ? (
                    <a
                      href={`tel:${p.phone.replace(/[^+\d]/g, '')}`}
                      style={{ color: '#38BDF8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}
                    >
                      <Phone size={13} /> {p.phone}
                    </a>
                  ) : (
                    <span style={{ color: '#64748B' }}>Helpline available at branch</span>
                  )}
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <td style={{ padding: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Working Hours</td>
              {topPartners.map(p => (
                <td key={p.id} style={{ padding: '0.75rem', color: '#CBD5E1', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={13} style={{ color: '#10B981', shrink: 0 }} />
                    <span>{p.timing || '10:00 AM - 4:00 PM (Mon-Fri)'}</span>
                  </div>
                </td>
              ))}
            </tr>

            <tr>
              <td style={{ padding: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Quick Actions</td>
              {topPartners.map(p => {
                const dirUrl = (p.coordinates?.lat && p.coordinates?.lng)
                  ? `https://www.google.com/maps/dir/?api=1&destination=${p.coordinates.lat},${p.coordinates.lng}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.address}`)}`;
                return (
                  <td key={p.id} style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <a
                        href={dirUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ color: '#FFFFFF', borderColor: '#475569', fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                      >
                        <Navigation size={12} /> Directions
                      </a>
                      {onSelectPartner && (
                        <button
                          type="button"
                          onClick={() => onSelectPartner(p)}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', backgroundColor: '#F59E0B', color: '#0F172A', border: 'none', fontWeight: 700 }}
                        >
                          Details
                        </button>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
