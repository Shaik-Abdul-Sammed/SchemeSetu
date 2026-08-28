import React, { useState, useEffect } from 'react';
import { useLocation } from '../../context/LocationContext';
import { api } from '../../services/api';
import { MapPin, Navigation, Building2, Phone, ShieldCheck, RefreshCw, X, Radio } from 'lucide-react';
import PartnerDetailsModal from './PartnerDetailsModal';

export default function SnapchatLocationPicker({ isOpen, onClose }) {
  const { location, updateLocation, setNearbyPartners } = useLocation();
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
      alert("Geolocation is not supported by your browser.");
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
        // Fallback to default state coordinates
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
                Snapchat-Style Radar Location Setup
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Detect GPS or select state to map nearby financial service partners
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
              {gpsLoading ? 'Detecting GPS...' : 'Use Current GPS Geolocation'}
            </button>

            <div className="form-group" style={{ margin: 0 }}>
              <select
                value={selectedState}
                onChange={handleStateChange}
                className="form-select"
                style={{ backgroundColor: '#1E293B', color: '#FFFFFF', borderColor: '#334155' }}
              >
                {statesList.map(s => (
                  <option key={s.state} value={s.state}>{s.state} ({s.district})</option>
                ))}
              </select>
            </div>
          </div>

          {/* SNAPCHAT RADAR CANVAS MAP VISUALIZER */}
          <div style={{
            height: '240px',
            borderRadius: '12px',
            backgroundColor: '#020617',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            {/* Grid overlay */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: 'radial-gradient(#1E293B 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              opacity: 0.5
            }} />

            {/* Radar Pulsing Waves */}
            <div style={{
              position: 'absolute',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              animation: 'radarPulse 3s infinite linear'
            }} />
            <div style={{
              position: 'absolute',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '1px solid rgba(56, 189, 248, 0.6)'
            }} />

            {/* Center User Dot */}
            <div style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#38BDF8',
                boxShadow: '0 0 16px #38BDF8',
                border: '3px solid #FFFFFF',
                animation: 'pulse 1.5s infinite'
              }} />
              <div style={{
                backgroundColor: '#0B192C',
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#38BDF8',
                marginTop: '0.4rem',
                border: '1px solid #1E293B'
              }}>
                📍 {location.address || `${selectedDistrict}, ${selectedState}`}
              </div>
            </div>

            {/* Partner Pins scattered on map */}
            {partners.slice(0, 5).map((p, idx) => {
              const offsets = [
                { top: '25%', left: '30%' },
                { top: '30%', right: '25%' },
                { bottom: '25%', left: '35%' },
                { bottom: '30%', right: '30%' },
                { top: '60%', left: '20%' }
              ];
              const pos = offsets[idx % offsets.length];
              return (
                <div key={p.id} style={{ position: 'absolute', ...pos, zIndex: 5, cursor: 'pointer' }} title={p.name}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    boxShadow: '0 0 10px #10B981',
                    border: '2px solid #FFFFFF'
                  }} />
                  <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block', whiteSpace: 'nowrap' }}>
                    {p.name.split(' ')[0]} ({p.distanceText || 'Near'})
                  </span>
                </div>
              );
            })}
          </div>

          {/* NEARBY PARTNERS & BANK BRANCHES LIST */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} style={{ color: '#38BDF8' }} /> Empanelled Bank Branches & CSCs
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                {partners.length} Branches Found
              </span>
            </div>

            {fetchingPartners ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                <RefreshCw className="spin" size={24} style={{ marginBottom: '0.5rem' }} />
                <p>Locating nearby verified financial partners...</p>
              </div>
            ) : partners.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', backgroundColor: '#1E293B', borderRadius: '8px' }}>
                No partner branches found within 100 km. Try selecting a different state.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {partners.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => setActivePartner(p)}
                    className="cursor-pointer hover:border-amber-400/50 transition"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '0.85rem 1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: p.type === 'Bank Branch' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(217, 119, 6, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: p.type === 'Bank Branch' ? '#10B981' : '#F59E0B'
                      }}>
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{p.type} • Click for directions</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F59E0B' }}>
                        {p.distanceText || `${p.distance || 5} km`}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Distance</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
};
