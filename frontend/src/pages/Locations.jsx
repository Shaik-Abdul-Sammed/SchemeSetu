import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Phone, 
  Clock, 
  Building2, 
  CheckCircle2, 
  ExternalLink, 
  Filter, 
  ShieldCheck, 
  Compass, 
  Info,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MOCK_PARTNERS } from '../data/mock/partners';
import { safeGetLocation } from '../utils/capacitor';

// Haversine distance calculation in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export default function Locations() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [userCoords, setUserCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);

  // Attempt optional GPS detect
  const handleDetectGps = async () => {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const loc = await safeGetLocation();
      if (loc && loc.lat && loc.lng) {
        setUserCoords({ lat: loc.lat, lng: loc.lng });
      } else {
        setGpsError('Geolocation unavailable. Please search manually by state or district.');
      }
    } catch (e) {
      setGpsError('Location permission denied or unavailable.');
    } finally {
      setGpsLoading(false);
    }
  };

  // Filter and compute distances
  const filteredPartners = MOCK_PARTNERS.map(partner => {
    let dist = partner.distanceKm;
    if (userCoords && partner.coordinates?.lat && partner.coordinates?.lng) {
      const computed = calculateDistance(
        userCoords.lat,
        userCoords.lng,
        partner.coordinates.lat,
        partner.coordinates.lng
      );
      if (computed !== null) {
        dist = parseFloat(computed);
      }
    }
    return { ...partner, calculatedDistance: dist };
  }).filter(partner => {
    const matchesSearch = 
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (partner.district && partner.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (partner.supportedServices && partner.supportedServices.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesState = selectedState === 'All' || partner.address.includes(selectedState);
    const matchesType = selectedType === 'All' || partner.type === selectedType;

    return matchesSearch && matchesState && matchesType;
  });

  // Sort by calculated distance ascending if coordinates available
  if (userCoords) {
    filteredPartners.sort((a, b) => (a.calculatedDistance || 9999) - (b.calculatedDistance || 9999));
  }

  const stateOptions = ['All', 'Telangana', 'Tamil Nadu', 'Andhra Pradesh', 'Maharashtra', 'Karnataka', 'Delhi'];
  const typeOptions = ['All', 'Public Sector Bank', 'Common Services Centre (CSC)', 'District Welfare Center', 'KVIC Facilitation Center'];

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#D97706', marginBottom: '0.5rem', fontWeight: 700 }}>
          <MapPin size={22} />
          <span>{t('loc_title', 'Citizen Welfare Centers & CSC Locator')}</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#0B192C', fontWeight: 800, margin: '0 0 0.5rem' }}>
          {t('loc_findNearest', 'Find Nearest Assistance Center')}
        </h1>
        <p style={{ color: '#64748B', fontSize: '1rem', margin: 0 }}>
          Locate verified CSC Digital Seva Kendras, Public Sector Bank MSME branches, and District Welfare Offices for in-person application assistance and biometric KYC.
        </p>

        {/* GPS Detect Trigger */}
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleDetectGps}
            disabled={gpsLoading}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            <Navigation size={16} />
            <span>{gpsLoading ? 'Detecting Location...' : t('loc_detectGps', 'Use Current GPS Location')}</span>
          </button>

          {userCoords && (
            <span className="badge" style={{ backgroundColor: '#ECFDF5', color: '#047857', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={14} /> GPS Active (Lat: {userCoords.lat.toFixed(2)}, Lng: {userCoords.lng.toFixed(2)})
            </span>
          )}
        </div>

        {gpsError && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#991B1B', backgroundColor: '#FEF2F2', padding: '0.4rem 0.8rem', borderRadius: '8px', display: 'inline-block' }}>
            {gpsError}
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('loc_searchDistrict', 'Search by District, PIN, or Center name...')}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              {stateOptions.map(st => (
                <option key={st} value={st}>{st === 'All' ? 'All States & UTs' : `State: ${st}`}</option>
              ))}
            </select>
          </div>

          {/* Service Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              {typeOptions.map(tp => (
                <option key={tp} value={tp}>{tp === 'All' ? 'All Facility Types' : tp}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#0B192C', fontWeight: 800, margin: 0 }}>
          Assistance Centers ({filteredPartners.length})
        </h2>
        <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
          {userCoords ? 'Sorted by proximity to your current location' : 'Showing verified partner locations'}
        </span>
      </div>

      {/* Centers Grid */}
      {filteredPartners.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <Building2 size={40} style={{ color: '#94A3B8', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#1E293B', marginBottom: '0.5rem' }}>
            No matching assistance centers found
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            We couldn't find any centers matching your filters. Try selecting "All States" or clearing your search term.
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedState('All'); setSelectedType('All'); }}
            className="btn btn-outline btn-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredPartners.map(partner => (
            <div 
              key={partner.id} 
              className="card"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
              }}
            >
              <div>
                {/* Type & Distance Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <span className="badge badge-central" style={{ fontSize: '0.72rem' }}>
                    {partner.type}
                  </span>
                  
                  {partner.calculatedDistance !== undefined && partner.calculatedDistance !== null ? (
                    <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '0.75rem', fontWeight: 700 }}>
                      <Compass size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      {partner.calculatedDistance} km away
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Distance unavailable</span>
                  )}
                </div>

                {/* Center Title */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0B192C', margin: '0 0 0.35rem' }}>
                  {partner.name}
                </h3>

                {/* Address */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                  <MapPin size={16} style={{ shrink: 0, marginTop: '2px', color: '#D97706' }} />
                  <span>{partner.address}</span>
                </div>

                {/* Operating Hours */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748B', marginBottom: '0.75rem' }}>
                  <Clock size={14} style={{ color: '#059669' }} />
                  <span>{partner.timing || '10:00 AM - 4:30 PM (Mon-Fri)'}</span>
                </div>

                {/* Supported Services Tags */}
                {partner.supportedServices && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                    {partner.supportedServices.slice(0, 3).map((srv, idx) => (
                      <span key={idx} style={{ fontSize: '0.72rem', backgroundColor: '#F1F5F9', color: '#334155', padding: '0.2rem 0.45rem', borderRadius: '4px' }}>
                        ✓ {srv}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.45rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap' }}>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${partner.name} ${partner.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ flexGrow: 1, fontSize: '0.78rem', justifyContent: 'center' }}
                  title="Open in Google Maps"
                >
                  <Navigation size={13} /> Directions
                </a>

                {partner.phone && (
                  <a
                    href={`tel:${partner.phone.replace(/[^+\d]/g, '')}`}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                    title={`Call ${partner.phone}`}
                  >
                    <Phone size={13} />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCenter(partner)}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Center Details Modal */}
      {selectedCenter && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <div className="card" style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-central">{selectedCenter.type}</span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0B192C', margin: '0.35rem 0 0' }}>
                  {selectedCenter.name}
                </h2>
              </div>
              <button onClick={() => setSelectedCenter(null)} className="btn btn-sm btn-outline">
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: '#334155', marginBottom: '1.5rem' }}>
              <div><strong>Address:</strong> {selectedCenter.address}</div>
              <div><strong>Nodal Manager:</strong> {selectedCenter.manager || 'Authorized CSC VLE Operator'}</div>
              <div><strong>Contact Number:</strong> {selectedCenter.phone || 'Information not available in dataset'}</div>
              <div><strong>Operating Timings:</strong> {selectedCenter.timing || '10:00 AM - 4:30 PM'}</div>
              <div>
                <strong>Supported Welfare Schemes & Services:</strong>
                <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem', lineHeight: 1.4 }}>
                  {(selectedCenter.supportedServices || ['MUDRA Sanction', 'PMEGP Subsidy Desk', 'DBT Seed Verification']).map((srv, idx) => (
                    <li key={idx}>{srv}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedCenter.name} ${selectedCenter.address}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <Navigation size={15} /> Open Maps Navigation
              </a>
              <button
                type="button"
                onClick={() => {
                  setSelectedCenter(null);
                  navigate('/applications', { state: { prefilledNodal: selectedCenter.name } });
                }}
                className="btn btn-primary btn-sm"
              >
                <FileText size={15} /> Apply Assistance Here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
