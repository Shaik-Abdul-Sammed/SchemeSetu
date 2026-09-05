import React, { useState } from 'react';
import { Award, ShieldCheck, CheckCircle2, DollarSign, ArrowRight, Building2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SC_SCHEMES = [
  {
    id: 'stand-up-india',
    name: 'Stand Up India Scheme for SC/ST & Women',
    subsidy: 'Covered under CGSIL Guarantee (No Collateral)',
    maxLoan: '₹10 Lakh to ₹1 Crore',
    interestRate: '8.0% p.a.',
    marginMoney: 'Only 15% (Can be combined with State Subsidy)',
    eligibility: 'Must be SC/ST or Woman Entrepreneur setting up Greenfield Business',
    badge: 'High-Capacity Capital',
  },
  {
    id: 'nsfdc-micro-credit',
    name: 'NSFDC National Scheduled Castes Finance Loan',
    subsidy: 'Direct Concessional Interest Rate (4% - 6%)',
    maxLoan: 'Up to ₹5 Lakhs',
    interestRate: '4.0% - 6.0% p.a.',
    marginMoney: 'Zero Margin Money required for SC micro-units',
    eligibility: 'SC applicants with family income up to ₹3.00 Lakh/year',
    badge: 'Concessional Interest',
  },
  {
    id: 'pmegp-sc-special',
    name: 'PMEGP Credit Linked Subsidy (SC Special Category)',
    subsidy: '35% Capital Subsidy (Rural) / 25% (Urban)',
    maxLoan: 'Up to ₹25 Lakhs (Manufacturing) / ₹10 Lakhs (Services)',
    interestRate: '9.0% p.a. (Subsidized)',
    marginMoney: 'Only 5% Owner Contribution (vs 10% for General)',
    eligibility: 'SC entrepreneurs establishing new manufacturing/service ventures',
    badge: '35% Max Subsidy',
  },
  {
    id: 'pm-vishwakarma-sc',
    name: 'PM Vishwakarma SC Traditional Artisans Scheme',
    subsidy: '₹15,000 Free Toolkit Voucher + ₹500/day Stipend',
    maxLoan: '₹3 Lakh Collateral-Free Credit',
    interestRate: '5.0% Concessional Rate',
    marginMoney: '0% Margin Money Required',
    eligibility: 'SC Artisans working in 18 traditional trades (Potter, Weaver, Carpenter, Blacksmith)',
    badge: 'Free Toolkit + 5% Loan',
  }
];

export default function ScEntrepreneurHub() {
  const navigate = useNavigate();
  const [selectedScheme, setSelectedScheme] = useState(SC_SCHEMES[0]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 my-6 text-slate-200 shadow-2xl">
      {/* Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono mb-2">
            <Award className="w-4 h-4" /> Dedicated SC Entrepreneur Empowerment Portal
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Scheduled Caste (SC) Business & Finance Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access 35% capital subsidies, collateral-free Stand-Up India loans up to ₹1 Crore & 4% NSFDC micro-credits
          </p>
        </div>

        <button
          onClick={() => navigate('/eligibility', { state: { socialCategory: 'SC' } })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 self-start md:self-auto"
        >
          <span>Check SC Eligibility Match</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of SC Schemes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {SC_SCHEMES.map((scheme) => (
          <div
            key={scheme.id}
            onClick={() => setSelectedScheme(scheme)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedScheme.id === scheme.id
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-lg'
                : 'bg-slate-800/50 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {scheme.badge}
              </span>
              <span className="text-xs font-bold text-emerald-400">{scheme.maxLoan}</span>
            </div>

            <h4 className="text-sm font-bold text-slate-100 mb-2">{scheme.name}</h4>
            
            <div className="space-y-1 text-xs text-slate-400 mb-3">
              <p className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> <strong>Subsidy:</strong> {scheme.subsidy}
              </p>
              <p className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" /> <strong>Owner Equity:</strong> {scheme.marginMoney}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Scheme Deep Dive */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-xs">
        <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> {selectedScheme.name} — SC Special Provisions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-center">
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Max Financing</span>
            <strong className="text-emerald-400 text-sm font-bold">{selectedScheme.maxLoan}</strong>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Concessional Interest</span>
            <strong className="text-amber-400 text-sm font-bold">{selectedScheme.interestRate}</strong>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">SC Subsidy Rate</span>
            <strong className="text-blue-400 text-sm font-bold">Up to 35% Capital Grant</strong>
          </div>
        </div>

        <p className="text-slate-300 mb-4 leading-relaxed">
          <strong className="text-slate-100">Target Eligibility:</strong> {selectedScheme.eligibility}
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => navigate(`/schemes/${selectedScheme.id}`)}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition-all text-xs"
          >
            Apply for SC Concessional Loan →
          </button>
        </div>
      </div>
    </div>
  );
}
