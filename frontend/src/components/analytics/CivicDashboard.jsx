import React from 'react';
import { TrendingUp, Users, DollarSign, Award, MapPin } from 'lucide-react';

export default function CivicDashboard() {
  const METRICS = [
    { label: 'Total Aid Facilitated', value: '₹4.82 Crore', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Citizens Benefited', value: '14,280+', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Verified Submissions', value: '98.6%', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Active CSC Partners', value: '340+ Hubs', icon: MapPin, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const DISTRICTS = [
    { name: 'Visakhapatnam, AP', percentage: 94 },
    { name: 'Vijayawada, AP', percentage: 88 },
    { name: 'Hyderabad, TS', percentage: 92 },
    { name: 'Chennai, TN', percentage: 86 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 my-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Civic Impact & Inclusion Dashboard
          </h3>
          <p className="text-xs text-slate-400">Real-time scheme disbursement metrics and district inclusion rates</p>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Metrics
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-slate-800/50 border border-slate-800 p-3.5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">{m.label}</span>
                <div className={`p-1.5 rounded-lg ${m.bg}`}>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
              </div>
              <span className={`text-lg font-bold ${m.color}`}>{m.value}</span>
            </div>
          );
        })}
      </div>

      {/* District Penetration Rates */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4">
        <h4 className="text-xs font-bold text-slate-200 mb-3">District Scheme Penetration Rates</h4>
        <div className="space-y-3">
          {DISTRICTS.map((d, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">{d.name}</span>
                <span className="text-emerald-400 font-mono font-bold">{d.percentage}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${d.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
