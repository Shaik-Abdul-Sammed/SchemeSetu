import React from 'react';
import { Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';

export default function SchemeFilters({ filters, onChange, onClear, totalResults }) {
  const categories = [
    "All",
    "Agriculture & Farmers",
    "Healthcare & Health Insurance",
    "Housing & Shelter",
    "Financial Services & Micro-Loans",
    "Skills & Craftsmanship",
    "Education & Scholarships",
    "Social Security & Pension",
    "Women & Child Welfare",
    "Business & Entrepreneurship"
  ];

  const occupations = ["All", "Farmer", "Artisan", "Student", "Vendor", "Business", "Senior Citizen", "Any"];
  const genders = ["All", "Female", "Male"];
  const levels = ["All", "Central", "State"];

  return (
    <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#FFFFFF' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={18} style={{ color: '#D97706' }} />
          <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#0B192C' }}>Filter Government Schemes</h3>
          {totalResults !== undefined && (
            <span style={{ fontSize: '0.85rem', color: '#64748B', backgroundColor: '#F1F5F9', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
              {totalResults} {totalResults === 1 ? 'Scheme' : 'Schemes'} Found
            </span>
          )}
        </div>

        <button onClick={onClear} className="btn btn-secondary btn-sm" style={{ color: '#475569', borderColor: '#CBD5E1' }}>
          <RotateCcw size={14} /> Clear Filters
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Category</label>
          <select
            value={filters.category || 'All'}
            onChange={(e) => onChange('category', e.target.value)}
            className="form-select"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Government Level</label>
          <select
            value={filters.level || 'All'}
            onChange={(e) => onChange('level', e.target.value)}
            className="form-select"
          >
            {levels.map(l => <option key={l} value={l}>{l === 'All' ? 'All Levels' : l}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Occupation</label>
          <select
            value={filters.occupation || 'All'}
            onChange={(e) => onChange('occupation', e.target.value)}
            className="form-select"
          >
            {occupations.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Gender</label>
          <select
            value={filters.gender || 'All'}
            onChange={(e) => onChange('gender', e.target.value)}
            className="form-select"
          >
            {genders.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Sort By</label>
          <select
            value={filters.sort || 'name_asc'}
            onChange={(e) => onChange('sort', e.target.value)}
            className="form-select"
          >
            <option value="name_asc">Scheme Name (A - Z)</option>
            <option value="name_desc">Scheme Name (Z - A)</option>
            <option value="income_asc">Income Limit (Lowest First)</option>
            <option value="income_desc">Income Limit (Highest First)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
