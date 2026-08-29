import React, { useState } from 'react';
import { MapPin, Navigation, Phone, CheckCircle2, AlertTriangle, Building2, ExternalLink } from 'lucide-react';
import { safeOpenExternalUrl } from '../utils/capacitor';
import { useLanguage } from '../context/LanguageContext';

export default function Map({ partners = [], selectedPartner, onSelectPartner }) {
  const { t } = useLanguage();
  const [activeMarker, setActiveMarker] = useState(selectedPartner || partners[0] || null);

  const getMarkerColor = (partner) => {
    if (partner.fundAvailable && partner.npaStatus === 'low') return '#059669'; // Green = Available
    if (partner.fundAvailable) return '#D97706'; // Yellow = Limited
    return '#DC2626'; // Red = Restricted / High NPA
  };

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      {/* Interactive Map Visual Header Canvas */}
      <div
        style={{
          height: '240px',
          width: '100%',
          background: 'linear-gradient(135deg, #0B192C 0%, #1E3E62 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF'
        }}
      >
        {/* Decorative Grid Lines to simulate GIS map view */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15, backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        {/* Partner Map Pins */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', padding: '1rem' }}>
          {partners.map((partner, idx) => {
            const isSelected = activeMarker?.id === partner.id;
            const pinColor = getMarkerColor(partner);
            return (
              <button
                key={partner.id || idx}
                onClick={() => {
                  setActiveMarker(partner);
                  if (onSelectPartner) onSelectPartner(partner);
                }}
                style={{
                  background: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
                  color: isSelected ? '#0F172A' : '#FFFFFF',
                  border: `2px solid ${pinColor}`,
                  borderRadius: '30px',
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: pinColor, flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{partner.name.split('-')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Marker Popup Details */}
      {activeMarker && (
        <div style={{ padding: '1.25rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div>
              <span className="badge badge-central">{activeMarker.type || 'Public Sector Bank'}</span>
              <h4 style={{ fontSize: '1.1rem', color: '#0B192C', margin: '0.35rem 0 0' }}>{activeMarker.name}</h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: getMarkerColor(activeMarker) }}>
              <CheckCircle2 size={16} />
              {activeMarker.fundAvailable ? t('fundsAvailable', 'Funds Available') : t('limitedFunds', 'Limited Funds')}
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 0.85rem 0' }}>
            📍 {activeMarker.address}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#0284C7', fontWeight: 600 }}>
              {t('distance', 'Distance')}: {activeMarker.distanceKm || 1.5} {t('distanceKmText', 'km from your location')}
            </span>

            <button
              onClick={() => safeOpenExternalUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeMarker.address)}`)}
              className="btn btn-green btn-sm"
            >
              <Navigation size={14} /> {t('openGoogleMaps', 'Open in Google Maps')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
