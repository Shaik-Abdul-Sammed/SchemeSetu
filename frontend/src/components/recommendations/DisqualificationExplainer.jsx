import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';

export default function DisqualificationExplainer({ evaluation }) {
  if (!evaluation) return null;

  const { matchPercentage, matchedCriteria = [], unmatchedCriteria = [], unknownCriteria = [] } = evaluation;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 my-3 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${matchPercentage >= 75 ? 'text-emerald-400' : matchPercentage >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {matchPercentage}% Match
          </span>
          <span className="text-xs text-slate-400">Compatibility Score</span>
        </div>
        <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
          {matchPercentage >= 75 ? 'High Compatibility' : matchPercentage >= 50 ? 'Partial Match' : 'Requires Profile Update'}
        </span>
      </div>

      {/* Matched */}
      {matchedCriteria.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Met Eligibility Requirements ({matchedCriteria.length})
          </h4>
          <ul className="space-y-1 text-xs text-slate-300 pl-5 list-disc">
            {matchedCriteria.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Unmatched */}
      {unmatchedCriteria.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Disqualification / Boundary Limits ({unmatchedCriteria.length})
          </h4>
          <ul className="space-y-1 text-xs text-rose-200/90 pl-5 list-disc">
            {unmatchedCriteria.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Unknown */}
      {unknownCriteria.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> Unconfirmed Profile Attributes ({unknownCriteria.length})
          </h4>
          <ul className="space-y-1 text-xs text-amber-200/90 pl-5 list-disc">
            {unknownCriteria.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
