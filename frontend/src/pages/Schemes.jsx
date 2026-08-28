import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw, Scale } from 'lucide-react';
import { schemeService } from '../services/schemeService';
import SchemeCard from '../components/scheme/SchemeCard';
import SchemeFilters from '../components/scheme/SchemeFilters';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import SearchAutocomplete from '../components/common/SearchAutocomplete';
import VoiceSearchButton from '../components/common/VoiceSearchButton';
import SchemeCompareModal from '../components/scheme/SchemeCompareModal';
import { useLanguage } from '../context/LanguageContext';

export default function Schemes() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || 'All',
    level: searchParams.get('level') || 'All',
    occupation: searchParams.get('occupation') || 'All',
    sort: searchParams.get('sort') || 'name_asc',
    page: 1
  });

  const [schemes, setSchemes] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const fetchSchemes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await schemeService.getSchemes({
        ...filters,
        limit: 9
      });
      setSchemes(res.schemes || res.data || []);
      setTotal(res.total || res.count || (res.schemes ? res.schemes.length : 0));
      setTotalPages(res.totalPages || Math.ceil((res.total || res.schemes?.length || 1) / 9) || 1);
    } catch (err) {
      setError(err.message || 'Failed to load schemes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    setSearchParams(prev => {
      if (value && value !== 'All') prev.set(key, value);
      else prev.delete(key);
      return prev;
    });
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      q: '',
      category: 'All',
      level: 'All',
      occupation: 'All',
      sort: 'name_asc',
      page: 1
    };
    setFilters(defaultFilters);
    setSearchParams({});
  };

  const handleVoiceSearchResult = (transcript) => {
    handleFilterChange('q', transcript);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#0B192C', marginBottom: '0.5rem' }}>
          {t('exploreSchemes', 'Explore Government Schemes')}
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.05rem', margin: 0 }}>
          {t('heroSubtitle', 'Search and filter verified Central and State Government welfare and business loan programs.')}
        </p>
      </div>

      {/* Prominent Search Bar & Voice Search Control */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flexGrow: 1, minWidth: '240px' }}>
            <SearchAutocomplete
              value={filters.q}
              onChange={(val) => handleFilterChange('q', val)}
              onSelect={(s) => handleFilterChange('q', s.name)}
              placeholder={t('searchPlaceholder', 'Search schemes, business types, categories, departments...')}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <VoiceSearchButton onResult={handleVoiceSearchResult} />
            
            <button
              onClick={() => setIsCompareOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', height: '42px' }}
            >
              <Scale size={16} /> {t('compareSchemes', 'Compare Schemes')} ({Math.min(3, schemes.length)})
            </button>
          </div>
        </div>
      </div>

      {/* Filter Component */}
      <SchemeFilters 
        filters={filters} 
        onChange={handleFilterChange} 
        onClear={handleClearFilters}
        totalResults={total}
      />

      {/* Content Area */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchSchemes} />
      ) : schemes.length === 0 ? (
        <EmptyState onClear={handleClearFilters} />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {schemes.map(scheme => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              <button
                disabled={filters.page <= 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                className="btn btn-outline btn-sm"
              >
                Previous
              </button>
              <span style={{ fontSize: '0.9rem', color: '#475569', padding: '0 0.75rem' }}>
                Page {filters.page} of {totalPages}
              </span>
              <button
                disabled={filters.page >= totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                className="btn btn-outline btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Side-by-Side Scheme Comparison Modal */}
      {isCompareOpen && (
        <SchemeCompareModal
          schemes={schemes.slice(0, 3)}
          onClose={() => setIsCompareOpen(false)}
        />
      )}
    </div>
  );
}
