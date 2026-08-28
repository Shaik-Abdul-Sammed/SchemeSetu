import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw } from 'lucide-react';
import { schemeService } from '../services/schemeService';
import SchemeCard from '../components/scheme/SchemeCard';
import SchemeFilters from '../components/scheme/SchemeFilters';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import SearchAutocomplete from '../components/common/SearchAutocomplete';
import VoiceSearchButton from '../components/common/VoiceSearchButton';
import SchemeCompareModal from '../components/scheme/SchemeCompareModal';

export default function Schemes() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || 'All',
    level: searchParams.get('level') || 'All',
    occupation: searchParams.get('occupation') || 'All',
    gender: searchParams.get('gender') || 'All',
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
      setSchemes(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to connect to schemes API endpoint.');
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
      gender: 'All',
      sort: 'name_asc',
      page: 1
    };
    setFilters(defaultFilters);
    setSearchParams({});
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#0B192C', marginBottom: '0.5rem' }}>
          Explore Government Schemes
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.05rem' }}>
          Search and filter verified Central and State Government welfare programs.
        </p>
      </div>

      {/* Search Input Bar & Compare Action */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchAutocomplete
              value={filters.q}
              onChange={(val) => handleFilterChange('q', val)}
              onSelect={(s) => handleFilterChange('q', s.name)}
              placeholder="Search schemes by name, keyword, department, or benefits..."
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <VoiceSearchButton onResult={(text) => handleFilterChange('q', text)} />
            <button
              onClick={() => setIsCompareOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition shadow-md"
            >
              Compare Schemes ({schemes.slice(0, 3).length})
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
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
