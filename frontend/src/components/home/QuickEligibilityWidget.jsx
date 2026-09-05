import React, { useState } from 'react';
import { Sliders, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickEligibilityWidget() {
  const navigate = useNavigate();
  const [income, setIncome] = useState(250000);
  const [age, setAge] = useState(30);
  const [occupation, setOccupation] = useState('farmer');

  const getEstimatedSchemesCount = () => {
    let count = 6;
    if (income <= 300000) count += 4;
    if (occupation === 'farmer' || occupation === 'artisan') count += 3;
    if (age >= 60) count += 2;
    return count;
  };

  const handleExplore = () => {
    navigate('/eligibility', { state: { income, age, occupation } });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100">Quick Eligibility Checker</h3>
        </div>
        <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
          Instant Match
        </span>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Annual Income:</span>
            <strong className="text-emerald-400 font-mono">₹{income.toLocaleString('en-IN')}</strong>
          </div>
          <input
            type="range"
            min="50000"
            max="1200000"
            step="25000"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-800 rounded h-1.5 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Age:</span>
            <strong className="text-blue-400 font-mono">{age} years</strong>
          </div>
          <input
            type="range"
            min="18"
            max="80"
            step="1"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full accent-blue-500 bg-slate-800 rounded h-1.5 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-slate-300 mb-1 block">Occupation:</label>
          <select
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500"
          >
            <option value="farmer">Farmer / Agriculture</option>
            <option value="artisan">Artisan / Craftsman</option>
            <option value="vendor">Street Vendor / Hawker</option>
            <option value="business">Micro Entrepreneur / MSME</option>
            <option value="student">Student / Youth</option>
          </select>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-800 pt-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 block">Est. Qualifying Schemes</span>
          <strong className="text-lg font-bold text-emerald-400">{getEstimatedSchemesCount()} Schemes</strong>
        </div>

        <button
          onClick={handleExplore}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
        >
          <span>Find My Schemes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
