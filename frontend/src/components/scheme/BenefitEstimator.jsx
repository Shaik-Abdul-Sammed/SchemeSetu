import React, { useState } from 'react';
import { Calculator, DollarSign, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function BenefitEstimator({ scheme }) {
  const { t } = useLanguage();
  const [landAcres, setLandAcres] = useState(2);
  const [projectCost, setProjectCost] = useState(100000);
  const [annualIncome, setAnnualIncome] = useState(150000);

  // Dynamic estimate calculation based on scheme type
  let estimatedPayout = 6000;
  let calculationNote = 'Standard annual direct benefit transfer payout';

  if (scheme?.id === 'pm-kisan') {
    estimatedPayout = 6000;
    calculationNote = '₹6,000 per year paid in 3 equal installments of ₹2,000 via DBT.';
  } else if (scheme?.id === 'pmegp') {
    const subsidyRate = annualIncome < 200000 ? 0.35 : 0.25;
    estimatedPayout = Math.min(projectCost * subsidyRate, 875000);
    calculationNote = `${(subsidyRate * 100).toFixed(0)}% government margin money subsidy on project cost of ₹${Number(projectCost).toLocaleString('en-IN')}.`;
  } else if (scheme?.id === 'ayushman-bharat') {
    estimatedPayout = 500000;
    calculationNote = 'Free health insurance cover up to ₹5,00,000 per family per year for secondary & tertiary hospital care.';
  } else {
    estimatedPayout = Math.min(annualIncome * 0.15 + 10000, 50000);
    calculationNote = 'Estimated financial assistance based on income and welfare category eligibility.';
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-bold text-white">{t('estimatorTitle', 'Interactive Subsidy & Benefit Estimator')}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <label className="text-slate-400 font-medium">{t('landHolding', 'Land Holding (Acres)')}</label>
          <input
            type="number"
            value={landAcres}
            onChange={(e) => setLandAcres(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            min="0"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-400 font-medium">{t('annualIncomeLabel', 'Annual Household Income (₹)')}</label>
          <input
            type="number"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            min="0"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-400 font-medium">{t('projectCostLabel', 'Proposed Project/Loan Cost (₹)')}</label>
          <input
            type="number"
            value={projectCost}
            onChange={(e) => setProjectCost(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            min="0"
          />
        </div>
      </div>

      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-300">{t('estFinancialAssistance', 'Estimated Government Financial Assistance')}</span>
          </div>
          <p className="text-xs text-slate-300">{calculationNote}</p>
        </div>
        <div className="text-center sm:text-right shrink-0">
          <span className="text-2xl font-extrabold text-amber-400">
            ₹{Math.round(estimatedPayout).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400 block">{t('estAnnualValue', 'Est. Annual Value')}</span>
        </div>
      </div>
    </div>
  );
}
