import React from 'react';
import { Building2, Phone, MapPin, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function BranchComparisonTable({ partners = [] }) {
  if (!partners || partners.length === 0) return null;

  const topPartners = partners.slice(0, 3);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 my-4 text-slate-200">
      <div className="border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" /> Multi-Branch Comparative Matrix
        </h3>
        <p className="text-xs text-slate-400">Compare nearest partner bank branches by distance, loan budget & nodal officer contact</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="p-3 bg-slate-800/40">Branch Name</th>
              {topPartners.map(p => (
                <th key={p.id} className="p-3 bg-slate-800/80 font-bold text-slate-100">{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            <tr>
              <td className="p-3 text-slate-400 font-medium">Institution Type</td>
              {topPartners.map(p => (
                <td key={p.id} className="p-3 text-slate-200 font-semibold">{p.type}</td>
              ))}
            </tr>

            <tr>
              <td className="p-3 text-slate-400 font-medium">Estimated Distance</td>
              {topPartners.map(p => (
                <td key={p.id} className="p-3 text-emerald-400 font-mono flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {p.distance ? `${p.distance} km` : 'Near You'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 text-slate-400 font-medium">Fund Availability</td>
              {topPartners.map(p => (
                <td key={p.id} className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.fundAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400'}`}>
                    {p.fundAvailable ? 'Funds Available' : 'Budget Exhausted'}
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 text-slate-400 font-medium">NPA Risk Rating</td>
              {topPartners.map(p => (
                <td key={p.id} className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${p.npaStatus === 'low' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {p.npaStatus} NPA
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 text-slate-400 font-medium">Nodal Helpline</td>
              {topPartners.map(p => (
                <td key={p.id} className="p-3 font-mono text-slate-300">
                  <a href={`tel:${p.phone}`} className="flex items-center gap-1 hover:text-emerald-400 transition-all">
                    <Phone className="w-3 h-3 text-blue-400" /> {p.phone}
                  </a>
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 text-slate-400 font-medium">Supported Schemes</td>
              {topPartners.map(p => (
                <td key={p.id} className="p-3">
                  <span className="text-slate-300 font-bold">{p.schemes?.length || 0} Schemes</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
