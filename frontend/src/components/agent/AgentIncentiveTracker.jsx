import React from 'react';
import { DollarSign, Award, CheckCircle, TrendingUp } from 'lucide-react';

export default function AgentIncentiveTracker() {
  const AGENT_STATS = {
    agentId: 'VLE-AP-9082',
    agentName: 'Suresh Kumar',
    verifiedSubmissions: 42,
    pendingSubmissions: 5,
    commissionEarned: 4200, // ₹100 per verified application
    ranking: '#4 in District',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 my-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Field Agent Incentive & Commission Tracker
          </h3>
          <p className="text-xs text-slate-400">Track earnings per verified citizen onboarding and regional agent ranking</p>
        </div>
        <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full">
          {AGENT_STATS.ranking}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">Total Verified Applications</span>
          <strong className="text-xl font-bold text-emerald-400">{AGENT_STATS.verifiedSubmissions}</strong>
        </div>

        <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">Total Incentives Earned</span>
          <strong className="text-xl font-bold text-amber-400">₹{AGENT_STATS.commissionEarned.toLocaleString('en-IN')}</strong>
        </div>

        <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 block mb-1">Pending Verification</span>
          <strong className="text-xl font-bold text-blue-400">{AGENT_STATS.pendingSubmissions}</strong>
        </div>
      </div>
    </div>
  );
}
