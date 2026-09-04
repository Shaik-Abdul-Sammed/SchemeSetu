import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, ArrowRight, X } from 'lucide-react';
import { evaluateProjectFeasibility } from '../../utils/feasibilityChecker';

export default function FeasibilityReportModal({ isOpen, onClose, projectParams }) {
  if (!isOpen) return null;

  const result = evaluateProjectFeasibility(projectParams || {});
  const { totalScore, overallFeasibility, checks } = result;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 text-slate-200 shadow-2xl relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Business Feasibility & Risk Assessment Report
            </h3>
            <p className="text-xs text-slate-400">Automated evaluation of margin equity, DSCR, and collateral waivers</p>
          </div>
          <span className={`text-lg font-bold font-mono px-3 py-1 rounded-xl border ${
            totalScore >= 75
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : totalScore >= 50
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            {totalScore}/100
          </span>
        </div>

        {/* Condition Checks List */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1 mb-5">
          {checks.map((c, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border text-xs ${
                c.isPassed ? 'bg-slate-800/40 border-slate-800' : 'bg-rose-500/5 border-rose-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  {c.isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  {c.title}
                </span>
                <span className="font-mono text-slate-400 text-[11px]">{c.score}/{c.maxScore} Pts</span>
              </div>

              <p className="text-slate-300 leading-snug pl-5">{c.details}</p>

              {c.recommendation && (
                <div className="mt-2 text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 text-[11px]">
                  <strong>Actionable Tip:</strong> {c.recommendation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <span className="text-xs text-slate-400">Ready for Bank Submission</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
          >
            Close Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
