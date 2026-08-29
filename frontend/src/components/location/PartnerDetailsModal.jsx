import React from 'react';
import { X, MapPin, Phone, Clock, Navigation, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function PartnerDetailsModal({ partner, onClose }) {
  const { t } = useLanguage();
  if (!partner) return null;

  const handleGetDirections = () => {
    const lat = partner.coordinates?.lat || partner.lat || 13.0827;
    const lng = partner.coordinates?.lng || partner.lng || 80.2707;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
            {partner.type || 'Common Service Centre'}
          </span>
          <h3 className="text-xl font-bold text-white leading-tight">{partner.name}</h3>
          <p className="text-xs text-slate-400 flex items-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>{partner.address || `${partner.district}, ${partner.state}`}</span>
          </p>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-amber-400" /> {t('distance', 'Distance from Location')}:
            </span>
            <span className="text-amber-400 font-extrabold text-sm">
              {partner.distance ? `${partner.distance.toFixed(1)} km` : 'Nearby'}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-2.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> {t('helpdeskContact', 'Helpdesk Contact:')}
            </span>
            <span className="text-slate-200 font-medium">{partner.phone || '+91 1800-180-1551'}</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-2.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> {t('workingHours', 'Working Hours:')}
            </span>
            <span className="text-slate-200 font-medium">{t('workingHoursDetail', 'Mon - Sat (09:00 AM - 06:00 PM)')}</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-300 block">{t('facilitationServices', 'Supported Citizen Facilitation Services:')}</span>
          <ul className="text-xs text-slate-400 space-y-1">
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {t('dbtVerification', 'DBT Bank Account Seeding & e-KYC Verification')}</li>
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {t('agentAssisted', 'Agent-Assisted Scheme Application Submission')}</li>
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {t('pdfGeneration', 'Printed PDF Scheme Application Form Generation')}</li>
          </ul>
        </div>

        <button
          onClick={handleGetDirections}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg"
        >
          <Navigation className="w-4 h-4" /> {t('getDirections', 'Get Live Google Maps Directions')}
        </button>
      </div>
    </div>
  );
}
