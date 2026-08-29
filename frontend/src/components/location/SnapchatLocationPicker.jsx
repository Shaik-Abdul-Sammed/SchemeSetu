import React, { useState, useEffect } from 'react';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { MapPin, Navigation, Building2, Phone, ShieldCheck, RefreshCw, X, Radio } from 'lucide-react';
import PartnerDetailsModal from './PartnerDetailsModal';

export default function SnapchatLocationPicker({ isOpen, onClose }) {
  const { location, updateLocation, setNearbyPartners } = useLocation();
  const { t } = useLanguage();
  const [gpsLoading, setGpsLoading] = useState(false);
  const [partners, setPartners] = useState([]);
  const [fetchingPartners, setFetchingPartners] = useState(false);
  const [selectedState, setSelectedState] = useState(location.state || 'Telangana');
  const [selectedDistrict, setSelectedDistrict] = useState(location.district || 'Hyderabad');
  const [activePartner, setActivePartner] = useState(null);

  const statesList = [
    { state: 'Telangana', district: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
    { state: 'Andhra Pradesh', district: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
    { state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { state: 'Karnataka', district: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    { state: 'Maharashtra', district: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8467, lng: 80.9462 }
  ];

  const fetchPartners = async (lat, lng) => {
    setFetchingPartners(true);
    try {
      const res = await api.post('/partners/nearest', {
        lat: lat || location.lat,
        lng: lng || location.lng,
        maxDistance: 100
      });
      const list = res.partners || [];
      setPartners(list);
      setNearbyPartners(list);
    } catch (err) {
      console.error("Partner fetch error:", err);
    } finally {
      setFetchingPartners(false);
    }
  };

  useEffect(() => {
    fetchPartners(location.lat, location.lng);
  }, [location.lat, location.lng]);

  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      alert(t('geoUnsupported', 'Geolocation is not supported by your browser.'));
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        updateLocation({
          lat,
          lng,
          isGPS: true,
          address: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
        });
        fetchPartners(lat, lng);
        setGpsLoading(false);
      },
      (err) => {
        console.warn("GPS detection fallback:", err.message);
        const fallback = statesList.find(s => s.state === selectedState) || statesList[0];
        updateLocation({
          lat: fallback.lat,
          lng: fallback.lng,
          state: fallback.state,
          district: fallback.district,
          address: `${fallback.district}, ${fallback.state}`,
          isGPS: false
        });
        fetchPartners(fallback.lat, fallback.lng);
        setGpsLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    const match = statesList.find(s => s.state === newState);
    if (match) {
      setSelectedDistrict(match.district);
      updateLocation({
        lat: match.lat,
        lng: match.lng,
        state: match.state,
        district: match.district,
        address: `${match.district}, ${match.state}`,
        isGPS: false
      });
      fetchPartners(match.lat, match.lng);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 12, 26, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '840px',
        maxHeight: '90vh',
        overflowY: 'auto',
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        borderColor: '#1E293B',
        padding: 0,
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(2, 132, 199, 0.2)',
              color: '#38BDF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Radio size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#FFFFFF', margin: 0 }}>
                {t('locationSetup', 'Snapchat Location Radar')}
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                {t('nearbyBanks', 'Nearby Bank Branches & CSC Partners Mapped')}
              </span>
            </div>
          </div>

          <button
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
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Controls Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={handleGPSDetect}
              disabled={gpsLoading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Navigation size={18} className={gpsLoading ? 'spin' : ''} />
              {gpsLoading ? t('detectingLocation', 'Detecting GPS...') : t('useMyLocation', 'Use Current GPS Geolocation')}
            </button>

            <div className="form-group" style={{ margin: 0 }}>
              <select
                value={selectedState}
                onChange={handleStateChange}
                className="form-select"
                style={{ backgroundColor: '#1E293B', color: '#FFFFFF', borderColor: '#334155', height: '44px' }}
              >
                {statesList.map(s => (
                  <option key={s.state} value={s.state}>{s.state} ({s.district})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Summary Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#1E293B',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.88rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38BDF8' }}>
              <MapPin size={18} />
              <span>{location.address || `${selectedDistrict}, ${selectedState}`}</span>
            </div>
            <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
              {location.isGPS ? `GPS Active (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'State Centroid Pin'}
            </span>
          </div>

          {/* Mapped Partners List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', margin: 0 }}>
                {t('empanelledBranches', 'Empanelled Bank Branches & CSCs')}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                {partners.length} {t('branchesFound', 'Branches Found')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {partners.map(partner => (
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
                    transition: 'transform 0.15s ease, border-color 0.15s ease'
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
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38BDF8' }}>
                        {partner.distance ? `${partner.distance.toFixed(1)} km` : '0.8 km'}
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
