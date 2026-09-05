import React, { useState } from 'react';
import { Bug, ChevronDown, ChevronUp, RefreshCw, Crosshair, AlertTriangle, CheckCircle2, WifiOff } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

/**
 * GPSDebugPanel — Development diagnostic panel for GPS location debugging.
 * 
 * Shows raw browser GPS output, reverse geocoding results, and centroid
 * distance validation. Designed to be collapsible and unobtrusive.
 * 
 * Set DEV_MODE = false or remove this component entirely for production builds.
 */
const DEV_MODE = true; // Set to false to hide in production

export default function GPSDebugPanel() {
  const [expanded, setExpanded] = useState(false);
  const { location, locationStatus, errorMessage, gpsDebug, refreshLocation, injectTestCoordinates } = useLocation();

  if (!DEV_MODE) return null;

  const statusColors = {
    idle: '#94A3B8',
    detecting: '#F59E0B',
    detected: '#10B981',
    denied: '#EF4444',
    unavailable: '#EF4444',
    timeout: '#F97316',
    unsupported: '#6B7280',
    demo: '#8B5CF6'
  };

  const statusColor = statusColors[locationStatus] || '#94A3B8';

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '12px',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '11px',
      maxWidth: '360px',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      color: '#E2E8F0',
      borderRadius: '8px',
      border: '1px solid rgba(100, 116, 139, 0.4)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(8px)'
    }}>
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          width: '100%',
          padding: '8px 12px',
          background: 'none',
          border: 'none',
          color: '#E2E8F0',
          cursor: 'pointer',
          fontSize: '11px',
          fontFamily: 'monospace'
        }}
      >
        <Bug size={14} style={{ color: '#F59E0B' }} />
        <span style={{ fontWeight: 700 }}>GPS Debug</span>
        <span style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: statusColor,
          marginLeft: '4px'
        }} />
        <span style={{ color: statusColor, textTransform: 'uppercase', fontWeight: 600, fontSize: '10px' }}>
          {locationStatus}
        </span>
        <span style={{ marginLeft: 'auto' }}>
          {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </span>
      </button>

      {/* Expanded diagnostic data */}
      {expanded && (
        <div style={{ padding: '0 12px 10px', lineHeight: '1.6' }}>
          <div style={{ borderTop: '1px solid rgba(100,116,139,0.3)', paddingTop: '8px' }}>

            {/* Raw GPS Coordinates */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ color: '#94A3B8', fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Crosshair size={12} /> RAW BROWSER GPS
              </div>
              {gpsDebug?.rawLat !== null && gpsDebug?.rawLat !== undefined ? (
                <>
                  <div>Latitude:  <span style={{ color: '#22D3EE' }}>{gpsDebug.rawLat?.toFixed(6)}</span></div>
                  <div>Longitude: <span style={{ color: '#22D3EE' }}>{gpsDebug.rawLng?.toFixed(6)}</span></div>
                  <div>Accuracy:  <span style={{ color: gpsDebug.rawAccuracy > 1000 ? '#F97316' : '#10B981' }}>
                    ±{gpsDebug.rawAccuracy} m {gpsDebug.rawAccuracy > 1000 ? '⚠ LOW' : '✓'}
                  </span></div>
                  <div>Timestamp: <span style={{ color: '#A5B4FC' }}>{gpsDebug.rawTimestamp}</span></div>
                </>
              ) : (
                <div style={{ color: '#EF4444' }}>No raw GPS data available</div>
              )}
            </div>

            {/* Reverse Geocode Result */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ color: '#94A3B8', fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {gpsDebug?.reverseGeocodeSource === 'online' ? <CheckCircle2 size={12} style={{ color: '#10B981' }} /> :
                 gpsDebug?.reverseGeocodeSource === 'offline_centroid' ? <WifiOff size={12} style={{ color: '#F59E0B' }} /> :
                 <AlertTriangle size={12} style={{ color: '#EF4444' }} />}
                REVERSE GEOCODE
              </div>
              <div>Result: <span style={{ color: '#FDE68A' }}>{gpsDebug?.reverseGeocodeResult || '(none)'}</span></div>
              <div>Source: <span style={{ color: '#A5B4FC' }}>{gpsDebug?.reverseGeocodeSource || '(none)'}</span></div>
              {gpsDebug?.centroidDistanceKm !== null && gpsDebug?.centroidDistanceKm !== undefined && (
                <div>
                  Centroid Distance: <span style={{ color: gpsDebug.centroidTrusted ? '#10B981' : '#EF4444' }}>
                    {gpsDebug.centroidDistanceKm.toFixed(1)} km {gpsDebug.centroidTrusted ? '(trusted)' : '(⚠ UNVERIFIED >50km)'}
                  </span>
                </div>
              )}
            </div>

            {/* Displayed Location State */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ color: '#94A3B8', fontWeight: 700, marginBottom: '2px' }}>DISPLAYED LOCATION</div>
              <div>State: <span style={{ color: '#FDE68A' }}>{location?.state || '(none)'}</span></div>
              <div>District: <span style={{ color: '#FDE68A' }}>{location?.district || '(none)'}</span></div>
              <div>isGPS: <span style={{ color: location?.isGPS ? '#10B981' : '#94A3B8' }}>{String(location?.isGPS)}</span></div>
              <div>isDemo: <span style={{ color: location?.isDemo ? '#F59E0B' : '#94A3B8' }}>{String(location?.isDemo)}</span></div>
              {location?.geocodeSource && (
                <div>Geocode Source: <span style={{ color: '#A5B4FC' }}>{location.geocodeSource}</span></div>
              )}
              {location?.accuracyWarning && (
                <div style={{ color: '#F97316', marginTop: '2px' }}>⚠ {location.accuracyWarning}</div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div style={{ color: '#EF4444', marginBottom: '8px' }}>
                <AlertTriangle size={12} style={{ verticalAlign: 'middle' }} /> {errorMessage}
              </div>
            )}

            {/* Refresh Button & Test Injections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                onClick={refreshLocation}
                disabled={locationStatus === 'detecting'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  background: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: locationStatus === 'detecting' ? 'wait' : 'pointer',
                  fontSize: '10px',
                  fontWeight: 600,
                  fontFamily: 'monospace'
                }}
              >
                <RefreshCw size={11} className={locationStatus === 'detecting' ? 'animate-spin' : ''} />
                {locationStatus === 'detecting' ? 'Detecting Browser GPS...' : 'Trigger Real Browser GPS'}
              </button>

              {/* Dev Test Trace Injections (Phase 15 requirement) */}
              <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed #334155' }}>
                <div style={{ fontSize: '9px', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                  🛠 Dev Pipeline Trace Tests:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <button
                    onClick={() => injectTestCoordinates && injectTestCoordinates(14.3396, 78.5818, 15)}
                    style={{
                      background: '#1E293B',
                      color: '#38BDF8',
                      border: '1px solid #0284C7',
                      borderRadius: '3px',
                      padding: '3px 4px',
                      fontSize: '9px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    title="Inject IIIT RK Valley / Vempalli Coordinates (14.3396, 78.5818)"
                  >
                    📍 IIIT RK Valley
                  </button>
                  <button
                    onClick={() => injectTestCoordinates && injectTestCoordinates(17.3850, 78.4867, 20)}
                    style={{
                      background: '#1E293B',
                      color: '#FCD34D',
                      border: '1px solid #D97706',
                      borderRadius: '3px',
                      padding: '3px 4px',
                      fontSize: '9px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    title="Inject Hyderabad Coordinates (17.3850, 78.4867)"
                  >
                    📍 Hyderabad
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
