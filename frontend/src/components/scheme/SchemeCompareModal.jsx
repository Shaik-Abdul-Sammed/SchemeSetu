import React from 'react';
import { X, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SchemeCompareModal({ schemes, onClose, onSelectScheme }) {
  if (!schemes || schemes.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white">Compare Schemes Side-by-Side</h3>
          </div>
          <p className="text-xs text-slate-400">Evaluate scheme parameters to find the best fit for your requirements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schemes.map((s) => (
            <div key={s.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    {s.level || 'Central'}
                  </span>
                  <h4 className="text-base font-bold text-white leading-tight">{s.name}</h4>
                  <p className="text-xs text-slate-400">{s.department}</p>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Primary Benefit</span>
                    <span className="text-emerald-400 font-semibold">{s.summary || 'Direct Benefit Transfer'}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Max Annual Income</span>
                    <span className="text-slate-300">
                      {s.incomeLimit ? `₹${Number(s.incomeLimit).toLocaleString('en-IN')}` : 'No strict limit'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Eligible Category</span>
                    <span className="text-slate-300">{s.category || 'Agriculture & Welfare'}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Required Documents</span>
                    <span className="text-slate-400 text-[11px] block">
                      {Array.isArray(s.documents) ? s.documents.slice(0, 3).join(', ') : 'Aadhaar, Bank Passbook'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectScheme && onSelectScheme(s.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-md"
              >
                <span>View Full Scheme</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
