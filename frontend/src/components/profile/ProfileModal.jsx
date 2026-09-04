/**
 * ProfileModal.jsx — User Profile Viewer & Editor Modal for SchemeSetu V4
 * ─────────────────────────────────────────────────────────────────────────────
 * Gives full privacy control to citizens:
 *   • View current profile state
 *   • Edit details (Name, State, District, Occupation, Income, etc.)
 *   • Clear / Delete profile data from localStorage
 */
import React, { useState } from 'react';
import { User, MapPin, Briefcase, DollarSign, Trash2, Save, X, ShieldCheck } from 'lucide-react';
import { useUserProfile } from '../../context/UserProfileContext';
import { INDIAN_LOCATIONS } from '../../context/LocationContext';

export default function ProfileModal({ isOpen, onClose }) {
  const { profile, updateProfile, clearProfile } = useUserProfile();
  const [formData, setFormData] = useState({ ...profile });
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your saved profile?')) {
      clearProfile();
      setFormData({
        name: '', state: '', district: '', occupation: '',
        annualIncome: '', projectType: '', cost: '', education: '',
      });
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(11,25,44,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#fff', borderRadius: '16px',
          width: 'min(540px, 95vw)', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
          border: '1px solid #E2E8F0', padding: '1.5rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: '#FEF3C7', color: '#D97706',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={22} />
            </div>
            <div>
              <h2 id="profile-modal-title" style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700, color: '#0F172A' }}>
                Your SchemeSetu Profile
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Used only for personalized & verified scheme matching
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {saveSuccess && (
          <div style={{
            background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46',
            borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem',
          }}>
            <ShieldCheck size={16} /> Profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="prof-name">Full Name</label>
              <input
                id="prof-name"
                type="text"
                className="form-control"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Ravi Kumar"
              />
            </div>

            {/* State */}
            <div className="form-group">
              <label className="form-label" htmlFor="prof-state">State</label>
              <select
                id="prof-state"
                className="form-select"
                value={formData.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
              >
                <option value="">Select State</option>
                {INDIAN_LOCATIONS.map((loc) => (
                  <option key={loc.state} value={loc.state}>{loc.state}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="form-group">
              <label className="form-label" htmlFor="prof-district">District / City</label>
              <input
                id="prof-district"
                type="text"
                className="form-control"
                value={formData.district || ''}
                onChange={(e) => handleChange('district', e.target.value)}
                placeholder="e.g. Tirupati"
              />
            </div>

            {/* Occupation */}
            <div className="form-group">
              <label className="form-label" htmlFor="prof-occupation">Occupation</label>
              <select
                id="prof-occupation"
                className="form-select"
                value={formData.occupation || ''}
                onChange={(e) => handleChange('occupation', e.target.value)}
              >
                <option value="">Select Occupation</option>
                <option value="Farmer">Farmer / Agriculture</option>
                <option value="Artisan">Traditional Artisan</option>
                <option value="Vendor">Street Vendor</option>
                <option value="Business">Small Business / Entrepreneur</option>
                <option value="Student">Student / Youth</option>
                <option value="Employee">Private / Govt Employee</option>
              </select>
            </div>

            {/* Annual Income */}
            <div className="form-group">
              <label className="form-label" htmlFor="prof-income">Annual Household Income (₹)</label>
              <input
                id="prof-income"
                type="number"
                className="form-control"
                value={formData.annualIncome || ''}
                onChange={(e) => handleChange('annualIncome', Number(e.target.value) || null)}
                placeholder="e.g. 180000"
              />
            </div>

            {/* Project / Loan Requirement */}
            <div className="form-group">
              <label className="form-label" htmlFor="prof-project">Project / Business Type</label>
              <input
                id="prof-project"
                type="text"
                className="form-control"
                value={formData.projectType || ''}
                onChange={(e) => handleChange('projectType', e.target.value)}
                placeholder="e.g. Dairy Farming, Food Shop"
              />
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: '0.85rem', borderTop: '1px solid #E2E8F0', marginTop: '0.5rem',
          }}>
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-outline"
              style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
            >
              <Trash2 size={15} /> Delete Profile
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Profile
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
