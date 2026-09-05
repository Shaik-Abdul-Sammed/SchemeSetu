import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  ShieldCheck, 
  X, 
  Radio, 
  AlertCircle, 
  Sparkles, 
  Info,
  RefreshCw,
  Clock,
  Compass,
  AlertTriangle
} from 'lucide-react';
import PartnerDetailsModal from './PartnerDetailsModal';

export default function SnapchatLocationPicker({ isOpen = true, onClose }) {
  const { 
    location, 
    locationStatus, 
    errorMessage, 
    detectCurrentGPSLocation, 
    refreshLocation,
    setDemoLocation, 
    setManualLocation, 
    nearbyPartners, 
    INDIAN_LOCATIONS 
  } = useLocation();

  const { t } = useLanguage();
  const [selectedState, setSelectedState] = useState(location.state || 'Telangana');
  const [activePartner, setActivePartner] = useState(null);

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setManualLocation(newState);
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 12, 26, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-radar-title"
    >
      <div className="card" style={{
        width: '100%',
        maxWidth: '860px',
        maxHeight: '90vh',
        overflowY: 'auto',
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        borderColor: '#1E293B',
        padding: 0,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #1E293B',
          backgroundColor: '#0B192C'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(2, 132, 199, 0.2)',
              color: '#38BDF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Radio size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 id="location-radar-title" style={{ fontSize: '1.25rem', color: '#FFFFFF', margin: 0, fontWeight: 700 }}>
                {t('locationSetup', 'SchemeSetu Location Radar')}
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                {t('nearbyBanks', 'Nearby Bank Branches & CSC Partner Network')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', flexGrow: 1 }}>
          
          {/* Geolocation Detection Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.25rem'
          }}>
            <button
              type="button"
              onClick={() => detectCurrentGPSLocation(true)}
              disabled={locationStatus === 'detecting'}
              className="btn btn-primary"
              style={{ justifyContent: 'center', fontWeight: 600 }}
            >
              <Navigation size={18} className={locationStatus === 'detecting' ? 'animate-spin' : ''} />
              {locationStatus === 'detecting' 
                ? t('detectingLocation', '📍 Detecting GPS...') 
                : t('useMyLocation', 'Use Current GPS Geolocation')}
            </button>

            <button
              type="button"
              onClick={() => setDemoLocation('Tamil Nadu', 'Chennai')}
              className="btn btn-secondary"
              style={{ justifyContent: 'center', borderColor: '#F59E0B', color: '#FCD34D' }}
            >
              <Sparkles size={16} style={{ color: '#F59E0B' }} />
              <span>Load Demo Location (Chennai)</span>
            </button>

            <div className="form-group" style={{ margin: 0 }}>
              <select
                value={selectedState}
                onChange={handleStateChange}
                className="form-select"
                style={{ backgroundColor: '#1E293B', color: '#FFFFFF', borderColor: '#334155', height: '42px' }}
                aria-label="Select State"
              >
                <option value="" disabled>Select State / District Manually</option>
                {INDIAN_LOCATIONS.map(s => (
                  <option key={s.state} value={s.state}>{s.state} ({s.district})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Message / Error / Permission Warning */}
          {locationStatus === 'denied' && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              color: '#FCA5A5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={18} style={{ color: '#EF4444', flexShrink: 0 }} />
              <div>
                <strong>Location Permission Denied:</strong> {errorMessage || 'Location permission was denied. Enable location access in your browser settings or select manually.'}
              </div>
            </div>
          )}

          {locationStatus === 'unavailable' && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              color: '#FCA5A5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={18} style={{ color: '#EF4444', flexShrink: 0 }} />
              <div>
                <strong>Position Unavailable:</strong> {errorMessage || 'Your device could not determine the current location.'}
              </div>
            </div>
          )}

          {locationStatus === 'timeout' && (
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              color: '#FDE68A',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={18} style={{ color: '#F59E0B', flexShrink: 0 }} />
              <div>
                <strong>GPS Timeout:</strong> GPS detection timed out. Please try again or select your state manually.
              </div>
            </div>
          )}

          {/* Current Location Display & Accuracy Card */}
          <div style={{
            backgroundColor: '#1E293B',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#38BDF8' }}>
                <MapPin size={18} />
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1rem' }}>
                  {location.isDemo 
                    ? `Demo Location: ${location.district}, ${location.state}`
                    : location.isGPS 
                      ? `Current Location: ${location.district || ''}, ${location.state || ''}`
                      : location.state 
                        ? `Selected State: ${location.district || ''}, ${location.state}`
                        : 'Location not set (Select State or Click GPS)'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {location.isGPS && (
                  <button
                    type="button"
                    onClick={refreshLocation}
                    className="btn btn-secondary btn-xs"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderColor: '#38BDF8', color: '#38BDF8' }}
                    title="Refresh GPS Coordinates"
                  >
                    <RefreshCw size={12} /> Refresh Location
                  </button>
                )}
                {location.isGPS && (
                  <span style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                    <ShieldCheck size={14} /> Live GPS Detected
                  </span>
                )}
              </div>
            </div>

            {/* Coordinates & Accuracy Details */}
            {location.lat !== null && location.lng !== null && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '0.5rem', 
                fontSize: '0.8rem', 
                color: '#94A3B8',
                paddingTop: '0.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div>
                  <span style={{ color: '#64748B' }}>Latitude:</span> <strong>{Number(location.lat).toFixed(4)}° N</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Longitude:</span> <strong>{Number(location.lng).toFixed(4)}° E</strong>
                </div>
                {location.accuracy !== null && (
                  <div>
                    <span style={{ color: '#64748B' }}>Accuracy:</span> <strong style={{ color: location.accuracy <= 100 ? '#34D399' : '#FBBF24' }}>±{location.accuracy} m</strong>
                  </div>
                )}
                {location.timestamp && (
                  <div>
                    <span style={{ color: '#64748B' }}>Updated:</span> <strong>{new Date(location.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Low Accuracy Warning */}
            {location.accuracyWarning && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#FCD34D', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertTriangle size={14} />
                <span>{location.accuracyWarning}</span>
              </div>
            )}
          </div>

          {/* Mapped Partners List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', margin: 0, fontWeight: 600 }}>
                  {t('empanelledBranches', 'Empanelled Bank Branches & CSC Centers')}
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8', backgroundColor: '#334155', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  Sorted by actual distance
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700 }}>
                {nearbyPartners.length} {t('branchesFound', 'Branches Found')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
              {nearbyPartners.map(partner => (
                <div
                  key={partner.id}
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setActivePartner(partner)}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {partner.type || 'Bank Branch'}
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38BDF8' }}>
                        {partner.distanceKm !== null && partner.distanceKm !== undefined
                          ? `${partner.distanceKm} km away`
                          : 'Calculated upon GPS'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.98rem', color: '#FFFFFF', marginBottom: '0.35rem', lineHeight: 1.3 }}>
                      {partner.name}
                    </h4>

                    <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>
                      {partner.address}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid #334155' }}>
                    <span style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Phone size={12} style={{ color: '#10B981' }} /> {partner.phone || '1800-11-2026'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#38BDF8', fontWeight: 600 }}>
                      {t('viewDetails', 'Details')} →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #1E293B',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0B192C'
        }}>
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-secondary btn-sm" 
            style={{ minWidth: '160px', justifyContent: 'center' }}
          >
            {t('closeBtn', 'Done / Set Radar')}
          </button>
        </div>
      </div>

      {activePartner && (
        <PartnerDetailsModal
          partner={activePartner}
          onClose={() => setActivePartner(null)}
        />
      )}
    </div>
  );
}
