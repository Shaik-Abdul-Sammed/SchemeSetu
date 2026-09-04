import React, { useState } from 'react';
import { ShieldCheck, Lock, Trash2, CheckCircle, RefreshCw } from 'lucide-react';
import { useUserProfile } from '../../context/UserProfileContext';

export default function SecurityTrustSeal() {
  const { clearProfile, profile } = useUserProfile();
  const [cleared, setCleared] = useState(false);

  const handleWipeData = () => {
    if (window.confirm('Wipe all stored profile data from this device? This action is permanent.')) {
      clearProfile();
      setCleared(true);
      setTimeout(() => setCleared(false), 3000);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-300 text-xs shadow-lg">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-slate-100 text-sm">DPDP Act 2023 Compliant Vault</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
          AES-256 Encrypted
        </span>
      </div>

      <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
        Your data is stored locally on this device. We do not sell or store unmasked Aadhaar numbers on external cloud servers.
      </p>

      <div className="flex items-center justify-between border-t border-slate-800 pt-3">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Lock className="w-3.5 h-3.5 text-blue-400" />
          <span>Active Profile Slots: <strong className="text-slate-200">{Object.keys(profile || {}).length}</strong></span>
        </div>

        <button
          onClick={handleWipeData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-all font-medium text-[11px]"
        >
          {cleared ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Trash2 className="w-3.5 h-3.5 text-rose-400" />}
          <span>{cleared ? 'Data Erased' : 'One-Click Data Wipe'}</span>
        </button>
      </div>
    </div>
  );
}
