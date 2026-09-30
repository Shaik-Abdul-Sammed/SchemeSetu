import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calculator as CalcIcon, 
  Percent, 
  Clock, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight, 
  MapPin, 
  Volume2, 
  VolumeX, 
  TrendingDown, 
  Award, 
  CheckCircle2, 
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import useTextToSpeech from '../hooks/useTextToSpeech';
import AmortizationTable from '../components/financial/AmortizationTable';
import { formatIndianCurrency } from '../utils/numberValidator';

export const SCHEME_PRESETS = [
  {
    id: 'mfs',
    name: 'NSFDC Micro Finance Scheme',
    nameTe: 'ఎన్‌ఎస్‌ఎఫ్‌డిసి మైక్రో ఫైనాన్స్ పథకం',
    nameHi: 'एनएसएफडीसी माइक्रो फाइनेंस योजना',
    category: 'Small Projects / Tiny Units',
    maxLoan: 140000,
    defaultCost: 140000,
    interestRate: 6.5,
    tenureMonths: 36,
    moratoriumMonths: 3,
    coveragePct: 90,
    description: 'Concessional credit up to ₹1.40 Lakh for small projects (vegetable vending, kirana, tailoring, poultry) at 6.5% p.a. with 90% funding.',
    icon: '🛒',
    color: '#059669'
  },
  {
    id: 'term-loan',
    name: 'NSFDC Concessional Term Loan',
    nameTe: 'ఎన్‌ఎస్‌ఎఫ్‌డిసి టర్మ్ లోన్ పథకం',
    nameHi: 'एनएसएफडीसी सावधि ऋण योजना',
    category: 'Enterprise & Capital Projects',
    maxLoan: 5000000,
    defaultCost: 1000000,
    interestRate: 7.5,
    tenureMonths: 60,
    moratoriumMonths: 6,
    coveragePct: 90,
    description: 'Long-term enterprise finance up to ₹50.00 Lakhs for transport (autos, commercial vehicles), manufacturing, and agriculture equipment.',
    icon: '🚜',
    color: '#2563EB'
  },
  {
    id: 'education',
    name: 'NSFDC Educational Loan Scheme',
    nameTe: 'ఎన్‌ఎస్‌ఎఫ్‌డిసి విద్యా రుణం',
    nameHi: 'एनएसएफडीसी शिक्षा ऋण योजना',
    category: 'Higher / Technical Education',
    maxLoan: 3000000,
    defaultCost: 800000,
    interestRate: 6.5,
    tenureMonths: 60,
    moratoriumMonths: 12,
    coveragePct: 90,
    description: 'Up to ₹30.00 Lakhs for professional/technical courses in India (₹50 Lakhs abroad) with 12 months post-study moratorium.',
    icon: '🎓',
    color: '#7C3AED'
  },
  {
    id: 'msy',
    name: 'Mahila Samriddhi Yojana (SC Women)',
    nameTe: 'మహిళా సమృద్ధి యోజన',
    nameHi: 'महिला समृद्धि योजना',
    category: 'SC Women Self-Help / Micro Units',
    maxLoan: 140000,
    defaultCost: 140000,
    interestRate: 4.0,
    tenureMonths: 36,
    moratoriumMonths: 3,
    coveragePct: 90,
    description: 'Highly concessional 4.0% interest micro-finance exclusively for Scheduled Caste women entrepreneurs and SHGs.',
    icon: '🌸',
    color: '#DB2777'
  },
  {
    id: 'custom',
    name: 'Custom Loan / Commercial Comparison',
    nameTe: 'అనుకూలీకరించిన రుణం',
    nameHi: 'कस्टम ऋण सिम्युलेटर',
    category: 'Custom Simulator (6.5% - 15% Interest)',
    maxLoan: 5000000,
    defaultCost: 500000,
    interestRate: 8.0,
    tenureMonths: 48,
    moratoriumMonths: 6,
    coveragePct: 90,
    description: 'Customize interest rate from 6.5% to 15.0%, test 3 to 12 months moratorium, and inspect financial feasibility.',
    icon: '⚙️',
    color: '#D97706'
  }
];

export default function Calculator() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { speak, stop, isSpeaking } = useTextToSpeech({ lang });

  const [selectedPresetId, setSelectedPresetId] = useState('mfs');
  const activePreset = SCHEME_PRESETS.find(p => p.id === selectedPresetId) || SCHEME_PRESETS[0];

  // Dynamic values
  const [projectCost, setProjectCost] = useState(activePreset.defaultCost);
  const [coveragePct, setCoveragePct] = useState(activePreset.coveragePct);
  const [interestRate, setInterestRate] = useState(activePreset.interestRate);
  const [tenureMonths, setTenureMonths] = useState(activePreset.tenureMonths);
  const [moratoriumMonths, setMoratoriumMonths] = useState(activePreset.moratoriumMonths);

  // Sync state when preset changes
  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setProjectCost(preset.defaultCost);
    setCoveragePct(preset.coveragePct);
    setInterestRate(preset.interestRate);
    setTenureMonths(preset.tenureMonths);
    setMoratoriumMonths(preset.moratoriumMonths);
  };

  // Financial calculations
  const govtLoanPrincipal = Math.min(
    activePreset.maxLoan, 
    Math.round((projectCost * coveragePct) / 100)
  );
  const beneficiaryMarginMoney = Math.max(0, projectCost - govtLoanPrincipal);

  // Monthly EMI after moratorium
  const effectiveTenure = Math.max(1, tenureMonths - moratoriumMonths);
  const monthlyRate = (interestRate / 12) / 100;
  const emi = Math.round(
    (govtLoanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, effectiveTenure)) / 
    (Math.pow(1 + monthlyRate, effectiveTenure) - 1)
  ) || 0;

  const totalRepayment = emi * effectiveTenure;
  const totalInterest = Math.max(0, totalRepayment - govtLoanPrincipal);

  // Commercial bank comparison (market rate ~13.5% without concession)
  const commercialRate = 0.135 / 12;
  const commercialEmi = Math.round(
    (govtLoanPrincipal * commercialRate * Math.pow(1 + commercialRate, effectiveTenure)) / 
    (Math.pow(1 + commercialRate, effectiveTenure) - 1)
  ) || 0;
  const commercialTotalRepayment = commercialEmi * effectiveTenure;
  const totalSavings = Math.max(0, commercialTotalRepayment - totalRepayment);
  const monthlySavings = Math.max(0, commercialEmi - emi);

  // Spoken audio summary
  const handleSpeakSummary = () => {
    if (isSpeaking) {
      stop();
      return;
    }
    let summaryText = '';
    if (lang === 'te') {
      summaryText = `${activePreset.nameTe || activePreset.name}. ప్రాజెక్ట్ ఖర్చు ${formatIndianCurrency(projectCost)}. ప్రభుత్వం 90 శాతం రాయితీ రుణం ${formatIndianCurrency(govtLoanPrincipal)} అందిస్తుంది. నెలకు సుమారు ఈఎంఐ ${formatIndianCurrency(emi)}. మొరటోరియం కాలం ${moratoriumMonths} నెలలు. వాణిజ్య బ్యాంకులతో పోలిస్తే మీకు మొత్తం ${formatIndianCurrency(totalSavings)} ఆదా అవుతుంది.`;
    } else if (lang === 'hi') {
      summaryText = `${activePreset.nameHi || activePreset.name}. कुल परियोजना लागत ${formatIndianCurrency(projectCost)}. सरकार 90 प्रतिशत रियायती ऋण ${formatIndianCurrency(govtLoanPrincipal)} प्रदान करती है। मासिक ईएमआई लगभग ${formatIndianCurrency(emi)} है। मोराटोरियम अवधि ${moratoriumMonths} महीने है। वाणिज्यिक बैंक की तुलना में आपकी कुल बचत ${formatIndianCurrency(totalSavings)} है।`;
    } else {
      summaryText = `${activePreset.name}. Total project cost is ₹${projectCost.toLocaleString('en-IN')}. Government provides 90 percent concessional loan of ₹${govtLoanPrincipal.toLocaleString('en-IN')} at ${interestRate} percent interest. Estimated monthly EMI is ₹${emi.toLocaleString('en-IN')} with ${moratoriumMonths} months moratorium grace period. You save ₹${totalSavings.toLocaleString('en-IN')} compared to commercial market rates.`;
    }
    speak(summaryText);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem', maxWidth: '1100px' }}>
      {/* Page Title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#059669', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.95rem' }}>
          <CalcIcon size={20} />
          <span>{t('fin_calculatorTitle', 'MoSJE & NSFDC Concessional Financial Calculator')}</span>
        </div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0B192C', margin: '0 0 0.5rem' }}>
          {t('fin_projectedEmiMoratorium', 'Financial Calculator & Moratorium Simulator')}
        </h1>
        <p style={{ color: '#64748B', maxWidth: '700px', margin: '0 auto', fontSize: '0.95rem' }}>
          Model concessional interest rates (4.0% to 8.0%), 90% project cost coverage, 3 to 12 months moratorium grace periods, and verify your commercial interest savings.
        </p>
      </div>

      {/* Scheme Presets Selector */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Select Concessional Scheme Guidelines
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {SCHEME_PRESETS.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                style={{
                  textAlign: 'left',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: isSelected ? `2px solid ${preset.color}` : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? `${preset.color}10` : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? `0 4px 12px ${preset.color}25` : '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{preset.icon}</span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: isSelected ? preset.color : '#64748B',
                    backgroundColor: isSelected ? `${preset.color}20` : '#F1F5F9',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px'
                  }}>
                    {preset.interestRate}% p.a.
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A', marginBottom: '0.2rem' }}>
                  {lang === 'te' && preset.nameTe ? preset.nameTe : (lang === 'hi' && preset.nameHi ? preset.nameHi : preset.name)}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Max: ₹{(preset.maxLoan / 100000).toFixed(1)} Lakh • {preset.moratoriumMonths}m Moratorium
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Calculator Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        
        {/* Left Card: Input Sliders */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', pb: '0.75rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0B192C', margin: 0 }}>
              Loan Parameters & Guidelines
            </h2>
            <button
              onClick={handleSpeakSummary}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', borderColor: '#A7F3D0' }}
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isSpeaking ? 'Stop Voice' : 'Listen'}</span>
            </button>
          </div>

          {/* Project Cost Slider */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                Total Estimated Project Cost
              </label>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                ₹{projectCost.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="20000"
              max={activePreset.maxLoan ? Math.min(5500000, Math.round(activePreset.maxLoan / 0.9)) : 5000000}
              step="10000"
              value={projectCost}
              onChange={(e) => setProjectCost(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#059669', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8' }}>
              <span>₹20,000</span>
              <span>Scheme Ceiling: ₹{activePreset.maxLoan.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Concessional Interest Rate Slider */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                Concessional Annual Interest Rate
              </label>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2563EB' }}>
                {interestRate}% p.a.
              </span>
            </div>
            <input
              type="range"
              min="4.0"
              max="15.0"
              step="0.25"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#2563EB', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8' }}>
              <span>4.0% (MSY Women)</span>
              <span>6.5% - 8.0% (NSFDC)</span>
              <span>15.0% (Max)</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                Repayment Tenure
              </label>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7C3AED' }}>
                {tenureMonths} Months ({(tenureMonths / 12).toFixed(1)} Years)
              </span>
            </div>
            <input
              type="range"
              min="12"
              max="84"
              step="6"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#7C3AED', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8' }}>
              <span>12 Months</span>
              <span>60 Months (5 Yrs)</span>
              <span>84 Months (7 Yrs)</span>
            </div>
          </div>

          {/* Moratorium Grace Period Slider */}
          <div style={{ marginBottom: '1rem', backgroundColor: '#FFFBEB', padding: '1rem', borderRadius: '12px', border: '1px solid #FCD34D' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400E', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={16} /> Moratorium / Grace Period
              </label>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#D97706' }}>
                {moratoriumMonths} Months
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="18"
              step="1"
              value={moratoriumMonths}
              onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#D97706', cursor: 'pointer' }}
            />
            <p style={{ fontSize: '0.78rem', color: '#B45309', margin: '0.4rem 0 0', lineHeight: 1.4 }}>
              💡 <strong>Principal Holiday:</strong> During the first {moratoriumMonths} months, no principal EMI is collected, giving your project time to generate cash flow.
            </p>
          </div>
        </div>

        {/* Right Card: 90% Govt vs 10% Beneficiary Split & EMI Result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* 90% Concessional Funding Breakdown */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0B192C', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: '#059669' }} />
              Concessional 90% Funding Split (Channel Finance)
            </h3>

            {/* Split Visual Bar */}
            <div style={{ height: '24px', width: '100%', borderRadius: '12px', overflow: 'hidden', display: 'flex', marginBottom: '0.85rem' }}>
              <div 
                style={{ 
                  width: `${coveragePct}%`, 
                  backgroundColor: '#059669', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#FFFFFF', 
                  fontSize: '0.75rem', 
                  fontWeight: 800 
                }}
              >
                90% Govt Loan
              </div>
              <div 
                style={{ 
                  width: `${100 - coveragePct}%`, 
                  backgroundColor: '#F59E0B', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#FFFFFF', 
                  fontSize: '0.75rem', 
                  fontWeight: 800 
                }}
              >
                10% Margin
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div style={{ backgroundColor: '#ECFDF5', padding: '0.85rem', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                <span style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: 600, display: 'block' }}>
                  🏛️ Govt Concessional Loan ({coveragePct}%)
                </span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#047857' }}>
                  ₹{govtLoanPrincipal.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#059669', display: 'block', marginTop: '0.2rem' }}>
                  At {interestRate}% concessional rate
                </span>
              </div>

              <div style={{ backgroundColor: '#FFFBEB', padding: '0.85rem', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                <span style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 600, display: 'block' }}>
                  👤 Beneficiary Equity ({100 - coveragePct}%)
                </span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#B45309' }}>
                  ₹{beneficiaryMarginMoney.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#D97706', display: 'block', marginTop: '0.2rem' }}>
                  Promoter margin contribution
                </span>
              </div>
            </div>
          </div>

          {/* Projected EMI & Commercial Savings Showcase */}
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #059669 0%, #1E3E62 100%)', 
              color: '#FFFFFF', 
              padding: '1.5rem', 
              borderRadius: '16px', 
              boxShadow: '0 8px 24px rgba(5, 150, 105, 0.2)' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#A7F3D0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Projected Monthly Repayment
                </span>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.1, marginTop: '0.25rem' }}>
                  ₹{emi.toLocaleString('en-IN')}
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: '#CBD5E1' }}> / month</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>Moratorium Active</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FCD34D' }}>
                  {moratoriumMonths} Months Zero Principal
                </div>
              </div>
            </div>

            {/* Savings Callout vs Commercial Loan */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', padding: '0.85rem 1rem', borderRadius: '10px', backdropFilter: 'blur(8px)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#FCD34D', fontWeight: 700, marginBottom: '0.25rem' }}>
                <TrendingDown size={18} />
                Financial Literacy Impact: Concessional vs Commercial Market Rate (13.5%)
              </div>
              <div style={{ fontSize: '0.85rem', color: '#E2E8F0' }}>
                You save <strong>₹{monthlySavings.toLocaleString('en-IN')}/month</strong> on EMI and over <strong>₹{totalSavings.toLocaleString('en-IN')}</strong> in total interest!
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#CBD5E1' }}>
              <span>Total Interest: ₹{totalInterest.toLocaleString('en-IN')}</span>
              <span>Total Repayable: ₹{totalRepayment.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Action Route to Nearest Partner */}
          <Link
            to="/locations"
            state={{ prefilterScheme: activePreset.name }}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.9rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              backgroundColor: '#0B192C',
              color: '#FFFFFF',
              borderRadius: '12px',
              textDecoration: 'none'
            }}
          >
            <MapPin size={18} style={{ color: '#F59E0B' }} />
            Find Nearest Channel Partner for {activePreset.name.split(' ')[1] || 'this Scheme'}
            <ArrowRight size={16} />
          </Link>

        </div>
      </div>

      {/* Month-by-Month Amortization Schedule Table */}
      <div style={{ marginTop: '2.5rem' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0B192C', marginBottom: '0.5rem' }}>
          Detailed Month-by-Month Repayment Schedule
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '1rem' }}>
          Inspect principal deduction, interest payment, remaining balance after moratorium, and export full CSV report.
        </p>
        <AmortizationTable
          defaultPrincipal={govtLoanPrincipal}
          defaultRate={interestRate}
          defaultTenure={tenureMonths}
          defaultMoratorium={moratoriumMonths}
          maxPrincipal={activePreset.maxLoan || 5000000}
        />
      </div>
    </div>
  );
}
