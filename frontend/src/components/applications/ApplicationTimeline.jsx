import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, CreditCard } from 'lucide-react';

export default function ApplicationTimeline({ currentStage = 2 }) {
  const STAGES = [
    { id: 1, name: 'Application Submitted', desc: 'Received at CSC / Online Portal', icon: CheckCircle2, est: 'Day 1' },
    { id: 2, name: 'CSC / VLE Verification', desc: 'Biometric & Document Auth', icon: ShieldCheck, est: 'Days 2-3' },
    { id: 3, name: 'District Officer Sanction', desc: 'Final Eligibility Approval', icon: Clock, est: 'Days 4-7' },
    { id: 4, name: 'Direct Benefit Transfer', desc: 'Fund Disbursed to Bank', icon: CreditCard, est: 'Days 7-10' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 my-4 text-slate-200">
      <div className="border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" /> Stage-by-Stage Application Timeline
        </h3>
        <p className="text-xs text-slate-400">Track your scheme application status from submission to bank DBT credit</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          const isDone = stage.id <= currentStage;
          const isCurrent = stage.id === currentStage;

          return (
            <div
              key={stage.id}
              className={`p-4 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-purple-500/10 border-purple-500/40 text-purple-200 shadow-lg'
                  : isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isCurrent ? 'text-purple-400 animate-pulse' : isDone ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {stage.est}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-100 mb-1">{stage.name}</h4>
              <p className="text-[11px] text-slate-400 leading-snug">{stage.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
