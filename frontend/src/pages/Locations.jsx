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
  AlertCircle,
  Copy,
  Check,
  Mail,
  Share2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { MOCK_PARTNERS } from '../data/mock/partners';
import VoiceSearchButton from '../components/common/VoiceSearchButton';
import BranchComparisonTable from '../components/partners/BranchComparisonTable';
import PartnerDetailsModal from '../components/location/PartnerDetailsModal';

export default function Locations() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { 
    location, 
    locationStatus, 
    errorMessage, 
    detectCurrentGPSLocation, 
    refreshLocation, 
    setManualLocation,
    nearbyPartners,
    calculateDistance,
    INDIAN_LOCATIONS
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState(location?.state || 'All');
  const [selectedDistrict, setSelectedDistrict] = useState(location?.district || 'All');
  const [selectedMandal, setSelectedMandal] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [onlyEligible, setOnlyEligible] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [copiedIfsc, setCopiedIfsc] = useState(false);
  const isUserFiltering = React.useRef(false);

  const handleCopyIfsc = (code) => {
    if (!code) return;
    try {
      navigator.clipboard?.writeText(code);
      setCopiedIfsc(true);
      setTimeout(() => setCopiedIfsc(false), 2000);
    } catch (e) {
      // clipboard fallback
    }
  };

  // Synchronize state and district when location changes externally (GPS or initial load)
  useEffect(() => {
    if (isUserFiltering.current) return;
    if (location?.state) {
      setSelectedState(location.state);
    }
    if (location?.district) {
      setSelectedDistrict(location.district);
    }
  }, [location?.state, location?.district]);

  // Attempt GPS detect via centralized location service
  const handleDetectGps = () => {
    isUserFiltering.current = false;
    detectCurrentGPSLocation(true);
  };

  // Dynamically compute state options from available partners AND all Indian locations
  const stateOptions = React.useMemo(() => {
    const states = new Set([
      ...nearbyPartners.map(p => p.state),
      ...(INDIAN_LOCATIONS || []).map(l => l.state)
    ].filter(Boolean));
    return ['All', ...Array.from(states).sort()];
  }, [nearbyPartners, INDIAN_LOCATIONS]);

  // Dynamically compute district options for selected state
  const districtOptions = React.useMemo(() => {
    if (selectedState === 'All') {
      const allDists = new Set([
        ...nearbyPartners.map(p => p.district),
        ...(INDIAN_LOCATIONS || []).map(l => l.district)
      ].filter(Boolean));
      return ['All', ...Array.from(allDists).sort()];
    }
    const filteredDists = new Set([
      ...nearbyPartners.filter(p => p.state === selectedState || (p.address && p.address.includes(selectedState))).map(p => p.district),
      ...(INDIAN_LOCATIONS || []).filter(l => l.state === selectedState).map(l => l.district)
    ].filter(Boolean));
    return ['All', ...Array.from(filteredDists).sort()];
  }, [nearbyPartners, INDIAN_LOCATIONS, selectedState]);

  // Filter from dynamically sorted nearbyPartners from LocationContext
  const filteredPartners = nearbyPartners.filter(partner => {
    const matchesSearch = 
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (partner.district && partner.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (partner.supportedServices && partner.supportedServices.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesState = selectedState === 'All' || partner.state === selectedState || (partner.address && partner.address.includes(selectedState));
    const matchesDistrict = selectedDistrict === 'All' || 
      (partner.district && partner.district.toLowerCase() === selectedDistrict.toLowerCase()) ||
      (partner.address && partner.address.toLowerCase().includes(selectedDistrict.toLowerCase()));
    const matchesMandal = selectedMandal === 'All' || 
      (partner.mandal && partner.mandal === selectedMandal) || 
      (partner.address && partner.address.toLowerCase().includes(selectedMandal.toLowerCase()));
    const matchesType = selectedType === 'All' || 
      (selectedType === 'All Banks (Public Sector & RRB)'
        ? (partner.type === 'Public Sector Bank' || partner.type === 'Regional Rural Bank (RRB)' || partner.type === 'NBFC-MFI')
        : partner.type === selectedType);
    const matchesNpa = !onlyEligible || (partner.fundAvailable && partner.npaStatus !== 'high');

    return matchesSearch && matchesState && matchesDistrict && matchesMandal && matchesType && matchesNpa;
  });

  const typeOptions = [
    'All',
    'All Banks (Public Sector & RRB)',
    'Public Sector Bank',
    'Regional Rural Bank (RRB)',
    'State Channelizing Agency (SCA)',
    'Common Services Centre (CSC)',
    'NBFC-MFI',
    'District Welfare Center',
    'KVIC Facilitation Center'
  ];

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
            disabled={locationStatus === 'detecting'}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            <Navigation size={16} className={locationStatus === 'detecting' ? 'animate-spin' : ''} />
            <span>{locationStatus === 'detecting' ? 'Detecting GPS...' : t('loc_detectGps', 'Use Current GPS Location')}</span>
          </button>

          {location.isGPS && location.lat !== null && location.lng !== null && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge" style={{ backgroundColor: '#ECFDF5', color: '#047857', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={14} /> GPS Active (Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}{location.accuracy ? `, ±${location.accuracy}m` : ''})
              </span>
              <button 
                onClick={() => {
                  const url = `https://maps.google.com/?q=${location.lat},${location.lng}`;
                  navigator.clipboard?.writeText(url);
                  alert('GPS Link copied!');
                }}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                title="Copy GPS Maps Link"
              >
                <Copy size={14} /> Copy Link
              </button>
              <button 
                onClick={() => {
                  const url = `https://maps.google.com/?q=${location.lat},${location.lng}`;
                  const text = encodeURIComponent(`Here is my current location for SchemeSetu assistance: ${url}`);
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                }}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#059669', borderColor: '#34D399' }}
                title="Share via WhatsApp"
              >
                <Share2 size={14} /> Share
              </button>
            </div>
          )}
        </div>

        {errorMessage && locationStatus !== 'detected' && locationStatus !== 'idle' && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#991B1B', backgroundColor: '#FEF2F2', padding: '0.4rem 0.8rem', borderRadius: '8px', display: 'inline-block' }}>
            {errorMessage}
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Search Box with Voice Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flexGrow: 1 }}>
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
            <VoiceSearchButton 
              onResult={(transcript) => setSearchQuery(transcript)} 
            />
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => {
                const newState = e.target.value;
                isUserFiltering.current = true;
                setSelectedState(newState);
                setSelectedDistrict('All');
                if (newState !== 'All') {
                  const stateLoc = (INDIAN_LOCATIONS || []).find(l => l.state.toLowerCase() === newState.toLowerCase());
                  if (stateLoc) {
                    setManualLocation(newState, stateLoc.district);
                  }
                }
              }}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
              aria-label="Filter by State"
            >
              {stateOptions.map(st => (
                <option key={st} value={st}>{st === 'All' ? 'All States & UTs' : `State: ${st}`}</option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                const newDist = e.target.value;
                isUserFiltering.current = true;
                setSelectedDistrict(newDist);
                if (selectedState !== 'All' && newDist !== 'All') {
                  setManualLocation(selectedState, newDist);
                }
              }}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
              aria-label="Filter by District"
            >
              {districtOptions.map(dist => (
                <option key={dist} value={dist}>{dist === 'All' ? 'All Districts' : `District: ${dist}`}</option>
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
                <option key={tp} value={tp}>{tp === 'All' ? 'All Channel Partner Types' : tp}</option>
              ))}
            </select>
          </div>
        </div>

        {/* NPA Risk & Fund Utilization Intelligent Router Filter */}
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>
            <input 
              type="checkbox" 
              checked={onlyEligible} 
              onChange={(e) => setOnlyEligible(e.target.checked)} 
              style={{ width: '16px', height: '16px', accentColor: '#059669' }}
            />
            <ShieldCheck size={16} style={{ color: '#059669' }} />
            <span>Smart Routing: Route only to Channel Partners with Low NPA & Active Funds</span>
          </label>
          {onlyEligible && (
            <span style={{ fontSize: '0.78rem', color: '#047857', backgroundColor: '#ECFDF5', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
              ✓ Excluding partners with high NPAs or depleted funds
            </span>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#0B192C', fontWeight: 800, margin: 0 }}>
          Assistance Centers & Bank Branches ({filteredPartners.length})
        </h2>
        <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
          {(location && location.lat && location.lng) ? 'Sorted by proximity to your current location' : 'Showing verified partner locations'}
        </span>
      </div>

      {/* Multi-Branch Comparative Matrix for Nearby Bank Branches */}
      {filteredPartners.some(p => p.type?.includes('Bank') || p.type?.includes('RRB') || p.type?.includes('SCA')) && (
        <BranchComparisonTable 
          partners={filteredPartners.filter(p => p.type?.includes('Bank') || p.type?.includes('RRB') || p.type?.includes('SCA'))} 
          onSelectPartner={(partner) => setSelectedCenter(partner)}
        />
      )}

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
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedState('All'); setSelectedDistrict('All'); setSelectedType('All'); }}
              className="btn btn-primary btn-sm"
            >
              Show Nearest Regional Centers
            </button>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedState('All'); setSelectedDistrict('All'); setSelectedType('All'); }}
              className="btn btn-outline btn-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.35rem' }}>
          {filteredPartners.map(partner => {
            const distVal = partner.calculatedDistance !== undefined && partner.calculatedDistance !== null
              ? partner.calculatedDistance
              : (partner.distanceKm || partner.distance);
            const numDist = distVal !== undefined && distVal !== null ? Number(distVal) : null;
            const dirUrl = (partner.coordinates?.lat && partner.coordinates?.lng)
              ? `https://www.google.com/maps/dir/?api=1&destination=${partner.coordinates.lat},${partner.coordinates.lng}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${partner.name} ${partner.address}`)}`;

            return (
              <div 
                key={partner.id} 
                className="card"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
                }}
              >
                <div>
                  {/* Type, NPA status & Distance Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className="badge badge-central" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                        {partner.type}
                      </span>
                      {partner.fundAvailable && (
                        <span className="badge" style={{ backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', fontSize: '0.7rem', fontWeight: 700 }}>
                          ✓ Active Funds
                        </span>
                      )}
                    </div>
                    
                    {numDist !== null && !isNaN(numDist) ? (
                      <span 
                        className="badge" 
                        style={{ 
                          backgroundColor: numDist <= 5 ? '#DCFCE7' : (numDist <= 15 ? '#FEF3C7' : '#FFEDD5'), 
                          color: numDist <= 5 ? '#15803D' : (numDist <= 15 ? '#B45309' : '#C2410C'), 
                          border: numDist <= 5 ? '1px solid #86EFAC' : (numDist <= 15 ? '1px solid #FDE68A' : '1px solid #FDBA74'),
                          fontSize: '0.75rem', 
                          fontWeight: 800,
                          padding: '0.2rem 0.55rem'
                        }}
                      >
                        <Compass size={12} style={{ display: 'inline', marginRight: '3px' }} />
                        {numDist <= 1 ? 'Within 1 km' : `${numDist.toFixed(1)} km`}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Distance unavailable</span>
                    )}
                  </div>

                  {/* Center Title */}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0B192C', margin: '0 0 0.35rem', lineHeight: 1.3 }}>
                    {partner.name}
                  </h3>

                  {/* IFSC & Travel Estimate Pill Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {partner.ifscCode && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700 }}>
                        <span>IFSC: {partner.ifscCode}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyIfsc(partner.ifscCode)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B45309', padding: '0 0.15rem' }}
                          title="Copy IFSC Code"
                        >
                          {copiedIfsc ? <Check size={12} style={{ color: '#059669' }} /> : <Copy size={12} />}
                        </button>
                      </div>
                    )}

                    {numDist !== null && !isNaN(numDist) && (
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                        ~{Math.max(2, Math.ceil(numDist * 2.5))} min drive
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.85rem', color: '#475569', marginBottom: '0.65rem', lineHeight: 1.4 }}>
                    <MapPin size={16} style={{ shrink: 0, marginTop: '2px', color: '#D97706' }} />
                    <span>{partner.address}</span>
                  </div>

                  {/* Operating Hours & Lunch */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748B', marginBottom: '0.65rem' }}>
                    <Clock size={14} style={{ color: '#059669', shrink: 0 }} />
                    <span>{partner.timing || '10:00 AM - 4:00 PM (Mon-Fri)'}{partner.lunchTime ? ` • Lunch: ${partner.lunchTime}` : ''}</span>
                  </div>

                  {/* Phone Helpline Contact */}
                  {partner.phone && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <a
                        href={`tel:${partner.phone.replace(/[^+\d]/g, '')}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#0284C7', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}
                      >
                        <Phone size={13} />
                        <span>{partner.phone}</span>
                      </a>
                    </div>
                  )}

                  {/* Key Facilities or Supported Services */}
                  {partner.facilities && partner.facilities.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                      {partner.facilities.slice(0, 3).map((f, idx) => (
                        <span key={idx} style={{ fontSize: '0.72rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #DBEAFE', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 600 }}>
                          • {f}
                        </span>
                      ))}
                    </div>
                  ) : partner.supportedServices && (
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
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap' }}>
                  <a
                    href={dirUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ flexGrow: 1, fontSize: '0.78rem', justifyContent: 'center', color: '#0369A1', borderColor: '#BAE6FD' }}
                    title="Open Live GPS Route in Google Maps"
                  >
                    <Navigation size={13} /> GPS Route
                  </a>

                  {partner.phone && (
                    <a
                      href={`tel:${partner.phone.replace(/[^+\d]/g, '')}`}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem', color: '#065F46', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}
                      title={`Call ${partner.phone}`}
                    >
                      <Phone size={13} /> Call
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedCenter(partner)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enhanced Center & Bank Details Modal */}
      {selectedCenter && (
        <PartnerDetailsModal
          partner={selectedCenter}
          onClose={() => setSelectedCenter(null)}
        />
      )}
    </div>
  );
}
