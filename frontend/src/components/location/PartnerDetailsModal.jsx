import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, MapPin, Phone, Clock, Navigation, CheckCircle, Copy, Check, 
  Building2, ShieldCheck, Mail, FileText, Compass, Car, Volume2, VolumeX,
  Footprints, Bus, PhoneCall, HelpCircle, HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import useTextToSpeech from '../../hooks/useTextToSpeech';

import { 
  openDirectionsInMaps, 
  getWalkingDirectionsUrl, 
  getDirectionsUrl,
  isPartnerOpenNow, 
  getAudioDirectionsText 
} from '../../utils/mapUtils';

export default function PartnerDetailsModal({ partner, onClose }) {
  const { lang, t } = useLanguage();
  const { location, setManualLocation } = useLocation();
  const navigate = useNavigate();
  const { speak, stop, isSpeaking } = useTextToSpeech({ lang });

  const [copiedIfsc, setCopiedIfsc] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  // Stop speech when closing
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  if (!partner) return null;

  const openStatus = isPartnerOpenNow(partner);

  // Extract accurate coordinates
  const pLat = partner.coordinates?.lat ?? partner.lat ?? null;
  const pLng = partner.coordinates?.lng ?? partner.lng ?? null;

  // Real distance computation
  const distNum = partner.calculatedDistance !== null && partner.calculatedDistance !== undefined
    ? Number(partner.calculatedDistance)
    : (partner.distanceKm !== null && partner.distanceKm !== undefined
        ? Number(partner.distanceKm)
        : (partner.distance !== null && partner.distance !== undefined ? Number(partner.distance) : null));

  // Estimated travel times
  const driveMinutes = distNum !== null ? Math.max(1, Math.round(distNum * 2.5)) : null;
  const walkMinutes = distNum !== null ? Math.max(2, Math.round(distNum * 12)) : null;

  const displayLandmark = (lang === 'TE' && partner.landmarkTe)
    ? partner.landmarkTe
    : ((lang === 'HI' || lang === 'BHI' || lang === 'GON') && partner.landmarkHi)
      ? partner.landmarkHi
      : (partner.landmark || 'Near Main Bus Stand & Market');

  const displayTransit = (lang === 'TE' && partner.transitAdviceTe)
    ? partner.transitAdviceTe
    : ((lang === 'HI' || lang === 'BHI' || lang === 'GON') && partner.transitAdviceHi)
      ? partner.transitAdviceHi
      : (partner.transitAdvice || 'Directly accessible via local bus and auto-rickshaw.');

  const handleSpeakDirections = () => {
    if (isSpeaking) {
      stop();
    } else {
      const speechText = getAudioDirectionsText(partner, location, lang);
      speak(speechText);
    }
  };

  const handleCopyIfsc = (ifsc) => {
    if (!ifsc) return;
    navigator.clipboard.writeText(ifsc);
    setCopiedIfsc(true);
    setTimeout(() => setCopiedIfsc(false), 2000);
  };

  const handleCopyAddress = (addr) => {
    if (!addr) return;
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Google Maps directions with exact partner coordinates and user GPS origin
  const handleGetDirections = (mode = 'driving') => {
    openDirectionsInMaps(partner, location, mode);
  };

  const handleApplyAtBranch = () => {
    if (onClose) onClose();
    navigate('/applications', { state: { prefilledNodal: partner.name } });
  };

  const handleSubmitCallback = (e) => {
    e.preventDefault();
    if (!callbackPhone.trim()) return;
    setCallbackSubmitted(true);
    setTimeout(() => {
      setShowCallbackModal(false);
      setCallbackSubmitted(false);
      setCallbackPhone('');
    }, 3000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 12, 27, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 100001
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bank-details-title"
    >
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
          border: '1px solid #CBD5E1',
          overflow: 'hidden'
        }}
      >
        {/* Top Header Row with India Tricolor Bar */}
        <div style={{ height: '5px', background: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)' }} />

        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#0B192C',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(11, 25, 44, 0.2)'
            }}>
              <Building2 size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  backgroundColor: '#0B192C',
                  color: '#FCD34D',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px'
                }}>
                  {partner.type || 'Bank Branch'}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: '#ECFDF5',
                  color: '#047857',
                  border: '1px solid #A7F3D0',
                  padding: '0.18rem 0.55rem',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <ShieldCheck size={13} /> {t('verifiedPartner', 'Official Empanelled Partner')}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: openStatus.badgeBg || '#ECFDF5',
                  color: openStatus.color || '#047857',
                  border: `1px solid ${openStatus.badgeBorder || '#A7F3D0'}`,
                  padding: '0.18rem 0.55rem',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <Clock size={12} /> {openStatus.statusText}
                </span>
              </div>
              <h2 
                id="bank-details-title"
                style={{
                  fontSize: '1.28rem',
                  fontWeight: 800,
                  color: '#0B192C',
                  margin: '0.3rem 0 0 0',
                  lineHeight: 1.3
                }}
              >
                {partner.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {/* Live Proximity & Travel Banner */}
          <div style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Compass size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                  Live GPS Proximity to You
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#064E3B' }}>
                  {distNum !== null ? `${distNum.toFixed(1)} km away` : 'Within Local Service Area'}
                </div>
              </div>
            </div>

            {driveMinutes !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  backgroundColor: '#FFFFFF',
                  color: '#047857',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #86EFAC',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <Car size={15} /> ~{driveMinutes} min drive
                </span>
                {walkMinutes && (
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    backgroundColor: '#FFFFFF',
                    color: '#047857',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #86EFAC'
                  }}>
                    🚶 ~{walkMinutes} min walk
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Spoken Voice Guidance Card for Illiterate / Tribal / Rural Beneficiaries */}
          <div style={{
            backgroundColor: isSpeaking ? '#FEF3C7' : '#F0F9FF',
            border: `1.5px solid ${isSpeaking ? '#F59E0B' : '#BAE6FD'}`,
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: isSpeaking ? '#D97706' : '#0284C7',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {isSpeaking ? <VolumeX size={22} className="animate-pulse" /> : <Volume2 size={22} />}
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: isSpeaking ? '#92400E' : '#0369A1', textTransform: 'uppercase' }}>
                  {lang === 'TE' ? 'వాయిస్ సహాయం / ఆడియో దారి' : (lang === 'HI' || lang === 'BHI' || lang === 'GON' ? 'आवाज सहायता / बोलकर रास्ता' : 'Spoken Audio Route Guidance')}
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginTop: '0.15rem' }}>
                  {isSpeaking
                    ? (lang === 'TE' ? 'వివరణ చదువుతోంది... ఆపడానికి నొక్కండి' : (lang === 'HI' ? 'सुनाया जा रहा है... रोकने के लिए दबाएं' : 'Speaking directions... Click to stop'))
                    : (lang === 'TE' ? 'ఈ కేంద్రం చిరునామా & దారిని బిగ్గరగా వినండి' : (lang === 'HI' ? 'इस केंद्र का पता और रास्ता बोलकर सुनें' : 'Listen to address & directions aloud in your language'))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSpeakDirections}
              style={{
                padding: '0.55rem 1.15rem',
                fontSize: '0.84rem',
                fontWeight: 800,
                backgroundColor: isSpeaking ? '#DC2626' : '#0284C7',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 3px 8px rgba(2, 132, 199, 0.25)'
              }}
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isSpeaking ? (lang === 'TE' ? 'ఆపండి (Stop)' : 'रोकें (Stop)') : (lang === 'TE' ? 'వినండి (Listen)' : 'सुनें (Listen)')}</span>
            </button>
          </div>

          {/* Prominent Landmark & Public Transit Block */}
          <div style={{
            backgroundColor: '#FFFBEB',
            border: '1.5px solid #FDE68A',
            borderRadius: '14px',
            padding: '1.1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <Building2 size={20} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#92400E', textTransform: 'uppercase' }}>
                  {lang === 'TE' ? 'ప్రధాన ల్యాండ్‌మార్క్ (గుర్తు)' : (lang === 'HI' || lang === 'BHI' || lang === 'GON' ? 'मुख्य लैंडमार्क (पहचान)' : 'Local Landmark & Surrounding Identification')}
                </div>
                <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#78350F', marginTop: '0.2rem' }}>
                  {displayLandmark}
                </div>
                {partner.landmark && displayLandmark !== partner.landmark && (
                  <div style={{ fontSize: '0.82rem', color: '#92400E', marginTop: '0.15rem' }}>
                    English Landmark: {partner.landmark}
                  </div>
                )}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.84rem',
              color: '#92400E',
              backgroundColor: '#FEF3C7',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px'
            }}>
              <Bus size={16} style={{ color: '#B45309', flexShrink: 0 }} />
              <span><strong>{lang === 'TE' ? 'రవాణా సలహా:' : (lang === 'HI' ? 'पहुंचने की सलाह:' : 'Transit Advice:')}</strong> {displayTransit}</span>
            </div>
          </div>

          {/* Core Banking & Official Identifiers Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '0.85rem'
          }}>
            {/* IFSC Code Card */}
            {partner.ifscCode && (
              <div style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#FFFBEB',
                borderRadius: '12px',
                border: '1px solid #FDE68A',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '0.74rem', color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>
                  IFSC Code (RTGS / NEFT / IMPS)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'monospace', color: '#78350F', letterSpacing: '0.05em' }}>
                    {partner.ifscCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyIfsc(partner.ifscCode)}
                    style={{
                      padding: '0.28rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#FFFFFF',
                      color: copiedIfsc ? '#059669' : '#92400E',
                      border: '1px solid #FCD34D',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {copiedIfsc ? <Check size={14} style={{ color: '#059669' }} /> : <Copy size={14} />}
                    <span>{copiedIfsc ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Branch Code Card */}
            {partner.branchCode && (
              <div style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                  Branch Code / MICR
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace', color: '#0F172A', marginTop: '0.35rem' }}>
                  {partner.branchCode}
                </div>
              </div>
            )}

            {/* Nodal Officer / Manager */}
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Designated Nodal Officer
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem' }}>
                {partner.manager || 'Authorized Welfare Desk Officer'}
              </div>
            </div>

            {/* Official Phone Helpline */}
            {partner.phone && (
              <div style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#F0FDF4',
                borderRadius: '12px',
                border: '1px solid #BBF7D0'
              }}>
                <div style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                  Direct Helpline Phone
                </div>
                <div style={{ marginTop: '0.35rem' }}>
                  <a
                    href={`tel:${partner.phone.replace(/[^+\d]/g, '')}`}
                    style={{
                      fontSize: '0.96rem',
                      fontWeight: 800,
                      color: '#15803D',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Phone size={15} /> {partner.phone}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Full Location & Physical Address Section */}
          <div style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '1.1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <MapPin size={20} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Accurate Location & Street Address
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    {partner.address || `${partner.district}, ${partner.state}`}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.25rem' }}>
                    District: <strong style={{ color: '#0B192C' }}>{partner.district || 'YSR Kadapa'}</strong> | State: <strong style={{ color: '#0B192C' }}>{partner.state || 'Andhra Pradesh'}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyAddress(partner.address)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#FFFFFF',
                  color: copiedAddress ? '#059669' : '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                {copiedAddress ? <Check size={13} style={{ color: '#059669' }} /> : <Copy size={13} />}
                <span>{copiedAddress ? 'Address Copied' : 'Copy Address'}</span>
              </button>
            </div>

            {/* Exact GPS Coordinates Pill */}
            {pLat && pLng && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.85rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px dashed #CBD5E1',
                fontSize: '0.78rem',
                color: '#64748B',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Navigation size={13} style={{ color: '#0284C7' }} />
                  <span>Exact GPS Coordinates:</span>
                  <strong style={{ fontFamily: 'monospace', color: '#0F172A' }}>
                    {Number(pLat).toFixed(4)}° N, {Number(pLng).toFixed(4)}° E
                  </strong>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                  ✓ High Precision Geo-Lock
                </span>
              </div>
            )}
          </div>

          {/* Operating Hours & Timings */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            padding: '0.9rem 1.1rem',
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            border: '1px solid #E2E8F0'
          }}>
            <Clock size={19} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Operating Schedule & Timings
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginTop: '0.15rem' }}>
                {partner.timing || '10:00 AM - 4:00 PM (Monday to Friday)'}
                {partner.lunchTime && (
                  <span style={{ color: '#D97706', fontWeight: 700, marginLeft: '0.5rem' }}>
                    (Lunch Break: {partner.lunchTime})
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                Closed on 2nd & 4th Saturdays, Sundays & National Gazetted Holidays
              </div>
            </div>
          </div>

          {/* Email Support */}
          {partner.email && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1.1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <Mail size={17} style={{ color: '#2563EB', flexShrink: 0 }} />
              <div style={{ fontSize: '0.88rem' }}>
                <strong style={{ color: '#0F172A' }}>Official Email:</strong>{' '}
                <a 
                  href={`mailto:${partner.email}`} 
                  style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 700 }}
                >
                  {partner.email}
                </a>
              </div>
            </div>
          )}

          {/* Available Banking Desks & Facilities */}
          {partner.facilities && partner.facilities.length > 0 && (
            <div>
              <div style={{
                fontSize: '0.84rem',
                fontWeight: 800,
                color: '#0B192C',
                marginBottom: '0.55rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <ShieldCheck size={16} style={{ color: '#059669' }} />
                <span>Available Facilities & Service Counters:</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {partner.facilities.map((fac, fIdx) => (
                  <span
                    key={fIdx}
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      backgroundColor: '#ECFDF5',
                      color: '#047857',
                      border: '1px solid #A7F3D0',
                      padding: '0.3rem 0.7rem',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <CheckCircle size={13} style={{ color: '#059669' }} /> {fac}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Supported Government Welfare Schemes */}
          <div>
            <div style={{
              fontSize: '0.84rem',
              fontWeight: 800,
              color: '#0B192C',
              marginBottom: '0.55rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <FileText size={16} style={{ color: '#D97706' }} />
              <span>Supported Government Welfare Schemes:</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {(partner.supportedServices || ['MUDRA Loan Sanction', 'PMEGP Subsidy Desk', 'DBT Aadhaar Seeding', 'KCC Crop Credit']).map((srv, sIdx) => (
                <span
                  key={sIdx}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                    padding: '0.3rem 0.7rem',
                    borderRadius: '8px'
                  }}
                >
                  {srv}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div style={{
          padding: '1.1rem 1.5rem',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          {/* Set as Radar Anchor */}
          <button
            type="button"
            onClick={() => {
              if (partner.state && setManualLocation) {
                setManualLocation(partner.state, partner.district);
              }
            }}
            style={{
              padding: '0.55rem 0.95rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#334155',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            title="Set this center as your active location radar"
          >
            <MapPin size={15} style={{ color: '#D97706' }} /> Set as My Radar
          </button>

          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Direct 1-Tap Phone Call */}
            {partner.phone && (
              <a
                href={`tel:${partner.phone.replace(/[^+\d]/g, '')}`}
                style={{
                  padding: '0.55rem 1rem',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                }}
              >
                <PhoneCall size={15} /> {lang === 'TE' ? 'అధికారికి కాల్' : (lang === 'HI' ? 'अधिकारी को कॉल' : 'Call Officer')}
              </a>
            )}

            {/* Walking Directions */}
            <button
              type="button"
              onClick={() => handleGetDirections('walking')}
              style={{
                padding: '0.55rem 0.95rem',
                fontSize: '0.84rem',
                fontWeight: 700,
                backgroundColor: '#FFFFFF',
                color: '#0369A1',
                border: '1.5px solid #BAE6FD',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="Walking Route in Google Maps"
            >
              <Footprints size={15} /> {lang === 'TE' ? 'నడక దారి' : (lang === 'HI' ? 'पैदल रास्ता' : 'Walk')}
            </button>

            {/* Driving / Auto GPS Directions */}
            <button
              type="button"
              onClick={() => handleGetDirections('driving')}
              style={{
                padding: '0.55rem 1.05rem',
                fontSize: '0.84rem',
                fontWeight: 800,
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Car size={15} /> {lang === 'TE' ? 'వాహనం దారి' : (lang === 'HI' ? 'गाड़ी का रास्ता' : 'GPS Route')}
            </button>

            {/* Assisted Seva Request Callback */}
            <button
              type="button"
              onClick={() => setShowCallbackModal(true)}
              style={{
                padding: '0.55rem 0.95rem',
                fontSize: '0.84rem',
                fontWeight: 700,
                backgroundColor: '#FFFBEB',
                color: '#92400E',
                border: '1.5px solid #FDE68A',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="Request field volunteer assistance"
            >
              <HeartHandshake size={15} /> {lang === 'TE' ? 'సహాయం కావాలి' : (lang === 'HI' ? 'मदद चाहिए' : 'Request Sahayak')}
            </button>

            {/* Apply at Branch */}
            <button
              type="button"
              onClick={handleApplyAtBranch}
              style={{
                padding: '0.55rem 1.15rem',
                fontSize: '0.84rem',
                fontWeight: 800,
                backgroundColor: '#059669',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <FileText size={15} /> Apply
            </button>
          </div>
        </div>

        {/* Assisted Seva Call-Me-Back Dialog */}
        {showCallbackModal && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 100005
          }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              padding: '1.75rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
              border: '1.5px solid #CBD5E1'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 800 }}>
                  <HeartHandshake size={24} />
                  <span style={{ fontSize: '1.1rem', color: '#0F172A' }}>
                    {lang === 'TE' ? 'గ్రామీణ సహాయక్ తోడ్పాటు' : (lang === 'HI' ? 'ग्रामीण सहायक सहायता' : 'Gramin Sahayak Assistance')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCallbackModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={20} />
                </button>
              </div>

              {callbackSubmitted ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <CheckCircle size={48} style={{ color: '#059669', margin: '0 auto 0.75rem' }} />
                  <h3 style={{ fontSize: '1.15rem', color: '#065F46', fontWeight: 800, margin: '0 0 0.4rem' }}>
                    {lang === 'TE' ? 'అభ్యర్థన నమోదైంది!' : (lang === 'HI' ? 'अनुरोध दर्ज हो गया!' : 'Assistance Request Registered!')}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                    {lang === 'TE'
                      ? 'స్థానిక సంక్షేమ వాలంటీర్ (సహాయక్) 2 గంటల్లో మీకు ఫోన్ చేసి మార్గదర్శనం చేస్తారు.'
                      : (lang === 'HI'
                        ? 'स्थानीय कल्याण मित्र (सहायक) 2 घंटे के भीतर आपको फोन करके बैंक पहुंचने में सहायता करेंगे।'
                        : 'A local Welfare Volunteer (Sahayak) will call you within 2 hours to guide you to the branch.')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitCallback} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                    {lang === 'TE'
                      ? 'మీరు బ్యాంక్ లేదా కేంద్రం చేరుకోవడంలో ఇబ్బంది పడుతున్నారా? మీ ఫోన్ నంబర్ ఇవ్వండి, మా అధికారి మీకు ఫోన్ చేసి సహాయం చేస్తారు.'
                      : (lang === 'HI'
                        ? 'क्या आपको केंद्र तक पहुंचने में सहायता चाहिए? अपना मोबाइल नंबर दर्ज करें, हमारे सहायक आपको कॉल करेंगे।'
                        : 'Need help visiting this center? Enter your mobile number, and a local field coordinator will call you back.')}
                  </p>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      {lang === 'TE' ? 'మీ మొబైల్ నంబర్' : (lang === 'HI' ? 'आपका मोबाइल नंबर' : 'Your Mobile Number')}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      pattern="[0-9]{10}"
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '1.1rem',
                        letterSpacing: '0.1em',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowCallbackModal(false)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#F8FAFC',
                        color: '#475569',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {lang === 'TE' ? 'రద్దు' : (lang === 'HI' ? 'रद्द करें' : 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={callbackPhone.length < 10}
                      style={{
                        flex: 2,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: callbackPhone.length === 10 ? '#059669' : '#94A3B8',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        cursor: callbackPhone.length === 10 ? 'pointer' : 'not-allowed',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                      }}
                    >
                      {lang === 'TE' ? 'కాల్ అభ్యర్థించండి' : (lang === 'HI' ? 'कॉल का अनुरोध करें' : 'Request Callback')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
