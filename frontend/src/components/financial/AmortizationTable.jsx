import React, { useState } from 'react';
import { Download, Table, Calendar, DollarSign, Percent } from 'lucide-react';
import { calculateAmortizationSchedule } from '../../utils/financialCalculators';

export default function AmortizationTable({ defaultPrincipal = 500000, defaultRate = 8.5, defaultTenure = 60 }) {
  const [principal, setPrincipal] = useState(defaultPrincipal);
  const [rate, setRate] = useState(defaultRate);
  const [tenure, setTenure] = useState(defaultTenure);
  const [moratorium, setMoratorium] = useState(0);

  const { emi, totalInterest, totalAmount, schedule } = calculateAmortizationSchedule({
    principal,
    rate,
    tenureMonths: tenure,
    moratoriumMonths: moratorium,
  });

  const exportToCSV = () => {
    const headers = ['Month', 'Moratorium', 'Principal (INR)', 'Interest (INR)', 'Total Payment (INR)', 'Remaining Balance (INR)'];
    const rows = schedule.map(s => [
      s.month,
      s.isMoratorium ? 'Yes' : 'No',
      s.principalPayment,
      s.interestPayment,
      s.totalPayment,
      s.remainingBalance,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Amortization_Schedule_P${principal}_R${rate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 my-4 text-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Table className="w-5 h-5 text-emerald-400" /> Interactive Loan Amortization Schedule
          </h3>
          <p className="text-xs text-slate-400">Month-by-month repayment breakdown with moratorium & CSV export</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all self-start md:self-auto"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Principal: ₹{Number(principal).toLocaleString('en-IN')}
          </label>
          <input
            type="range"
            min="10000"
            max="2000000"
            step="10000"
            value={principal}
            onChange={e => setPrincipal(Number(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-800 rounded h-1.5 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1 mb-1">
            <Percent className="w-3.5 h-3.5 text-blue-400" /> Interest Rate: {rate}%
          </label>
          <input
            type="range"
            min="4.0"
            max="15.0"
            step="0.25"
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="w-full accent-blue-500 bg-slate-800 rounded h-1.5 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1 mb-1">
            <Calendar className="w-3.5 h-3.5 text-purple-400" /> Tenure: {tenure} Months
          </label>
          <input
            type="range"
            min="6"
            max="120"
            step="6"
            value={tenure}
            onChange={e => setTenure(Number(e.target.value))}
            className="w-full accent-purple-500 bg-slate-800 rounded h-1.5 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1 mb-1">
            Moratorium: {moratorium} Months
          </label>
          <input
            type="range"
            min="0"
            max="18"
            step="1"
            value={moratorium}
            onChange={e => setMoratorium(Number(e.target.value))}
            className="w-full accent-amber-500 bg-slate-800 rounded h-1.5 cursor-pointer"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Monthly EMI</span>
          <span className="text-sm font-bold text-emerald-400">₹{emi.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Total Interest</span>
          <span className="text-sm font-bold text-amber-400">₹{totalInterest.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Total Payable</span>
          <span className="text-sm font-bold text-slate-100">₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Schedule Table Preview */}
      <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-800 text-xs">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800/90 text-slate-400 sticky top-0">
            <tr>
              <th className="p-2.5">Month</th>
              <th className="p-2.5">Principal</th>
              <th className="p-2.5">Interest</th>
              <th className="p-2.5">Total Payment</th>
              <th className="p-2.5">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {schedule.slice(0, 12).map(s => (
              <tr key={s.month} className={s.isMoratorium ? 'bg-amber-500/5 text-amber-300' : 'hover:bg-slate-800/40'}>
                <td className="p-2.5 font-sans font-medium">{s.month} {s.isMoratorium && '(Moratorium)'}</td>
                <td className="p-2.5">₹{s.principalPayment.toLocaleString('en-IN')}</td>
                <td className="p-2.5 text-amber-400">₹{s.interestPayment.toLocaleString('en-IN')}</td>
                <td className="p-2.5 text-emerald-400 font-bold">₹{s.totalPayment.toLocaleString('en-IN')}</td>
                <td className="p-2.5 text-slate-400">₹{s.remainingBalance.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {schedule.length > 12 && (
          <p className="text-[11px] text-slate-400 text-center py-2 bg-slate-800/40 border-t border-slate-800">
            Showing first 12 of {schedule.length} months. Export CSV for full schedule.
          </p>
        )}
      </div>
    </div>
  );
}
