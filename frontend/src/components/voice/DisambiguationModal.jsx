import React from 'react';
import { HelpCircle, Check, X } from 'lucide-react';

export default function DisambiguationModal({ primaryOption, alternativeOption, onConfirm, onCancel }) {
  if (!primaryOption) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 text-slate-200 shadow-2xl animate-scale-in">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-slate-100">Did you mean...?</h3>
        </div>

        <p className="text-xs text-slate-300 mb-4">
          I want to make sure I take you to the right place. Please confirm your choice:
        </p>

        <div className="space-y-2.5 mb-5">
          <button
            onClick={() => onConfirm(primaryOption.intent)}
            className="w-full text-left p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold text-xs transition-all flex items-center justify-between"
          >
            <span>{primaryOption.title || primaryOption.intent}</span>
            <Check className="w-4 h-4 text-emerald-400" />
          </button>

          {alternativeOption && (
            <button
              onClick={() => onConfirm(alternativeOption.intent)}
              className="w-full text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs transition-all flex items-center justify-between"
            >
              <span>{alternativeOption.title || alternativeOption.intent}</span>
            </button>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-800 pt-3">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
