import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  User, 
  IndianRupee, 
  Briefcase, 
  MapPin, 
  FileCheck, 
  AlertCircle,
  ExternalLink,
  Award
} from 'lucide-react';
import { eligibilityService } from '../../services/eligibilityService';
import ErrorMessage from '../common/ErrorMessage';

export default function MultiStepEligibilityWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState({
    name: '',
    age: 30,
    gender: 'Male',
    casteCategory: 'General',
    disability: 'No',
    maritalStatus: 'Married',
    annualIncome: 180000,
    bplStatus: 'Yes',
    occupation: 'Farmer',
    state: 'Pan-India',
    areaType: 'Rural',
    education: 'Secondary',
    landOwner: 'Yes'
  });

  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [results, setResults] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  const validateCurrentStep = () => {
    if (step === 1) {
      if (!formData.age || Number(formData.age) < 0 || Number(formData.age) > 110) {
        setValidationError('Please enter a valid age between 0 and 110.');
        return false;
      }
    }
    if (step === 3) {
      if (formData.annualIncome === undefined || Number(formData.annualIncome) < 0) {
        setValidationError('Please enter a valid annual family income.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await eligibilityService.checkEligibility({
        ...formData,
        age: Number(formData.age),
        annualIncome: Number(formData.annualIncome)
      });
      setResults(res);
      setStep(7); // Show results
    } catch (err) {
      setApiError(err.message || 'Failed to calculate eligibility recommendations.');
    } finally {
      setLoading(false);
    }
  };

  // Render Step 7: Results
  if (step === 7 && results) {
    const recommendedList = results.recommendations || [];
    const eligibleCount = results.recommendationsCount || 0;

    return (
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', marginBottom: '2rem', backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#15803D', marginBottom: '1rem' }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ color: '#14532D', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Eligibility Assessment Complete
          </h2>
          <p style={{ color: '#166534', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
            Based on the information provided, you may be eligible for <strong>{eligibleCount} government scheme{eligibleCount === 1 ? '' : 's'}</strong> out of {results.totalEvaluated} evaluated.
          </p>
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#15803D', fontStyle: 'italic' }}>
            * Disclaimer: SchemeSetu recommendations are based on standard government eligibility criteria. Official verification is subject to document validation.
          </div>
        </div>

        <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', color: '#0B192C' }}>
          Recommended Schemes for You
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {recommendedList.map(({ scheme, isEligible, matchScore, eligibilityStatus, matchReasons, disqualifyReasons }) => (
            <div key={scheme.id} className="card" style={{ borderLeft: `6px solid ${isEligible ? '#059669' : '#D97706'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className={`badge ${isEligible ? 'badge-eligible' : 'badge-cat'}`}>
                      {matchScore}% Match Score
                    </span>
                    <span className="badge badge-central">{scheme.level}</span>
                    <span className="badge badge-cat">{scheme.category}</span>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', color: '#0B192C', margin: 0 }}>{scheme.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.2rem' }}>{scheme.department}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: isEligible ? '#047857' : '#B45309' }}>
                    {eligibilityStatus}
                  </span>
                </div>
              </div>

              <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1rem' }}>{scheme.summary}</p>

              <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                  <Award size={16} /> Key Benefit
                </div>
                <div style={{ fontSize: '0.92rem', color: '#0F172A' }}>{scheme.benefits}</div>
              </div>

              {/* Match Criteria Breakdown */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#1E293B', marginBottom: '0.5rem' }}>Why this matches your profile:</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {matchReasons.map((reason, idx) => (
                    <li key={idx} style={{ fontSize: '0.88rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={15} style={{ shrink: 0 }} /> {reason}
                    </li>
                  ))}
                  {disqualifyReasons.map((reason, idx) => (
                    <li key={idx} style={{ fontSize: '0.88rem', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertCircle size={15} style={{ shrink: 0 }} /> {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                <button 
                  onClick={() => navigate(`/schemes/${scheme.id}`)}
                  className="btn btn-outline btn-sm"
                >
                  View Details & Required Documents
                </button>

                <a 
                  href={scheme.officialUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary btn-sm"
                >
                  Apply on Official Portal <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <button onClick={() => setStep(1)} className="btn btn-secondary">
            Re-evaluate Eligibility with Different Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Multi-step progress indicator */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}% Completed</span>
        </div>
        <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${(step / totalSteps) * 100}%`, 
              backgroundColor: '#D97706',
              transition: 'width 0.3s ease'
            }} 
          />
        </div>
      </div>

      <div className="card">
        {validationError && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {validationError}
          </div>
        )}

        {apiError && (
          <ErrorMessage 
            title="Eligibility Evaluation Error" 
            message={apiError} 
            onRetry={handleSubmit} 
          />
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem', color: '#0B192C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User style={{ color: '#D97706' }} size={22} /> Step 1: Basic Information
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Enter your basic details to check eligibility rules.
            </p>

            <div className="form-group">
              <label className="form-label">Full Name (Optional)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Ramesh Kumar"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Age (in Years) *</label>
              <input 
                type="number" 
                className="form-control" 
                min="0"
                max="110"
                value={formData.age}
                onChange={e => handleChange('age', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select 
                className="form-select"
                value={formData.gender}
                onChange={e => handleChange('gender', e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem', color: '#0B192C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck style={{ color: '#D97706' }} size={22} /> Step 2: Demographics
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Social category and demographic status help match target reservation schemes.
            </p>

            <div className="form-group">
              <label className="form-label">Social Category / Caste Group</label>
              <select 
                className="form-select"
                value={formData.casteCategory}
                onChange={e => handleChange('casteCategory', e.target.value)}
              >
                <option value="General">General</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="Minority">Minority Community</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Persons with Disability (PwD)?</label>
              <select 
                className="form-select"
                value={formData.disability}
                onChange={e => handleChange('disability', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes (40% or more disability)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Marital Status</label>
              <select 
                className="form-select"
                value={formData.maritalStatus}
                onChange={e => handleChange('maritalStatus', e.target.value)}
              >
                <option value="Single">Single / Unmarried</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced / Separated</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem', color: '#0B192C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IndianRupee style={{ color: '#D97706' }} size={22} /> Step 3: Income & Poverty Details
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Income ceilings determine eligibility for subsidies, free healthcare, and grants.
            </p>

            <div className="form-group">
              <label className="form-label">Annual Family Income (in ₹) *</label>
              <input 
                type="number" 
                className="form-control" 
                step="10000"
                value={formData.annualIncome}
                onChange={e => handleChange('annualIncome', e.target.value)}
              />
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>e.g. ₹1,80,000 per year</span>
            </div>

            <div className="form-group">
              <label className="form-label">Below Poverty Line (BPL) Card Holder?</label>
              <select 
                className="form-select"
                value={formData.bplStatus}
                onChange={e => handleChange('bplStatus', e.target.value)}
              >
                <option value="Yes">Yes (Holds BPL / Ration Card)</option>
                <option value="No">No (Above Poverty Line / APL)</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem', color: '#0B192C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase style={{ color: '#D97706' }} size={22} /> Step 4: Occupation & Vocation
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Select primary occupation to find sector-specific schemes.
            </p>

            <div className="form-group">
              <label className="form-label">Primary Occupation</label>
              <select 
                className="form-select"
                value={formData.occupation}
                onChange={e => handleChange('occupation', e.target.value)}
              >
                <option value="Farmer">Farmer / Agriculture</option>
                <option value="Artisan">Traditional Artisan / Craftsman</option>
                <option value="Student">Student (School / College)</option>
                <option value="Vendor">Street Vendor / Small Hawker</option>
                <option value="Business">Small Business Owner / Entrepreneur</option>
                <option value="Unemployed">Unemployed / Job Seeker</option>
                <option value="Senior Citizen">Senior Citizen (Retired)</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem', color: '#0B192C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin style={{ color: '#D97706' }} size={22} /> Step 5: Location Details
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Location determines Central vs State-level scheme availability.
            </p>

            <div className="form-group">
              <label className="form-label">State / Union Territory</label>
              <select 
                className="form-select"
                value={formData.state}
                onChange={e => handleChange('state', e.target.value)}
              >
                <option value="Pan-India">Pan-India (All States)</option>
                <option value="Telangana">Telangana</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Area Type</label>
              <select 
                className="form-select"
                value={formData.areaType}
                onChange={e => handleChange('areaType', e.target.value)}
              >
                <option value="Rural">Rural (Village / Gram Panchayat)</option>
                <option value="Urban">Urban (City / Municipality)</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem', color: '#0B192C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles style={{ color: '#D97706' }} size={22} /> Step 6: Ownership & Education
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Final step for land asset ownership and qualification criteria.
            </p>

            <div className="form-group">
              <label className="form-label">Do you own cultivable agricultural land?</label>
              <select 
                className="form-select"
                value={formData.landOwner}
                onChange={e => handleChange('landOwner', e.target.value)}
              >
                <option value="Yes">Yes (Land registered in applicant/family name)</option>
                <option value="No">No (Landless / Tenant Farmer / Non-Farmer)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Highest Education Level</label>
              <select 
                className="form-select"
                value={formData.education}
                onChange={e => handleChange('education', e.target.value)}
              >
                <option value="Primary">Primary School (Up to Class 8)</option>
                <option value="Secondary">Secondary / 10th Standard</option>
                <option value="Higher Secondary">12th Standard / Pre-University</option>
                <option value="Graduate">Graduate / Diploma</option>
                <option value="Post Graduate">Post Graduate / Ph.D.</option>
              </select>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0' }}>
          {step > 1 ? (
            <button onClick={handleBack} disabled={loading} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          <button onClick={handleNext} disabled={loading} className="btn btn-primary">
            {loading ? (
              <span>Calculating Eligibility...</span>
            ) : step === totalSteps ? (
              <span>Check My Eligibility <Sparkles size={16} /></span>
            ) : (
              <span>Next Step <ArrowRight size={16} /></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
