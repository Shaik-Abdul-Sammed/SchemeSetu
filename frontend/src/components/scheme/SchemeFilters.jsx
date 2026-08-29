import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function SchemeFilters({ filters, onChange, onClear, totalResults }) {
  const { t } = useLanguage();

  const categories = [
    "All",
    "Micro/Small Enterprise Loan",
    "Micro Enterprise Loan",
    "Micro Enterprise Seed Loan",
    "Credit-Linked Subsidy Scheme",
    "Working Capital Microcredit",
    "SC/ST & Women Entrepreneurship Loan",
    "Agriculture & Rural Development",
    "Traditional Artisans & Craftspeople Support",
    "Credit Guarantee Scheme",
    "Food Processing & Agribusiness Subsidy",
    "SC/ST Entrepreneurship Support",
    "Healthcare & Health Insurance"
  ];

  const occupations = ["All", "Farmer", "Artisan", "Student", "Vendor", "Business", "Senior Citizen", "Any"];
  const levels = ["All", "Central", "State"];

  return (
    <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#FFFFFF' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={18} style={{ color: '#D97706' }} />
          <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#0B192C' }}>{t('filterTitle', 'Filter Government Schemes')}</h3>
          {totalResults !== undefined && (
            <span style={{ fontSize: '0.85rem', color: '#64748B', backgroundColor: '#F1F5F9', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
              {totalResults} {t('resultsCount', 'Schemes Found')}
            </span>
          )}
        </div>

        <button onClick={onClear} className="btn btn-secondary btn-sm" style={{ color: '#475569', borderColor: '#CBD5E1' }}>
          <RotateCcw size={14} /> {t('clearFilters', 'Clear Filters')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">{t('category', 'Category')}</label>
          <select
            value={filters.category || 'All'}
            onChange={(e) => onChange('category', e.target.value)}
            className="form-select"
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c === 'All' ? t('allCategories', 'All Categories') : c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">{t('level', 'Government Level')}</label>
          <select
            value={filters.level || 'All'}
            onChange={(e) => onChange('level', e.target.value)}
            className="form-select"
          >
            {levels.map(l => (
              <option key={l} value={l}>
                {l === 'All' ? t('allLevels', 'All Levels (Central & State)') : l === 'Central' ? t('centralLevel', 'Central Government') : t('stateLevel', 'State Government')}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">{t('occupation', 'Occupation')}</label>
          <select
            value={filters.occupation || 'All'}
            onChange={(e) => onChange('occupation', e.target.value)}
            className="form-select"
          >
            {occupations.map(o => (
              <option key={o} value={o}>
                {o === 'All' ? t('allOccupations', 'All Occupations') : o === 'Farmer' ? t('farmerOcc', 'Farmer') : o === 'Artisan' ? t('artisanOcc', 'Artisan') : o === 'Student' ? t('studentOcc', 'Student') : o === 'Vendor' ? t('vendorOcc', 'Vendor') : o === 'Business' ? t('businessOcc', 'Business') : o === 'Senior Citizen' ? t('seniorCitizenOcc', 'Senior Citizen') : o}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">{t('sortBy', 'Sort By')}</label>
          <select
            value={filters.sort || 'name_asc'}
            onChange={(e) => onChange('sort', e.target.value)}
            className="form-select"
          >
            <option value="name_asc">{t('sortNameAsc', 'Scheme Name (A - Z)')}</option>
            <option value="name_desc">{t('sortNameDesc', 'Scheme Name (Z - A)')}</option>
            <option value="income_asc">{t('sortIncomeAsc', 'Income Limit (Lowest First)')}</option>
            <option value="income_desc">{t('sortIncomeDesc', 'Income Limit (Highest First)')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
