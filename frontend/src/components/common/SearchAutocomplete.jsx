import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Tag, X } from 'lucide-react';
import { schemeService } from '../../services/schemeService';
import { useLanguage } from '../../context/LanguageContext';

export default function SearchAutocomplete({ value, onChange, onSelect, placeholder }) {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const effectivePlaceholder = placeholder || t('searchPlaceholder', 'Search schemes, business types, categories, departments...');

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value || value.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }
      try {
        const res = await schemeService.getSchemes({ q: value.trim(), limit: 5 });
        const list = res.schemes || res.data || [];
        setSuggestions(list);
        setIsOpen(list.length > 0);
      } catch (err) {
        console.error('Failed to fetch autocomplete suggestions:', err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        <Search 
          size={18} 
          style={{ position: 'absolute', left: '1rem', color: '#64748B', pointerEvents: 'none' }} 
        />
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value && suggestions.length > 0 && setIsOpen(true)}
          placeholder={effectivePlaceholder}
          aria-label={effectivePlaceholder}
          className="form-control"
          style={{
            paddingLeft: '2.75rem',
            paddingRight: value ? '2.5rem' : '1rem',
            height: '46px',
            fontSize: '0.95rem',
            borderRadius: '10px'
          }}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={t('clearSearch', 'Clear Search')}
            title={t('clearSearch', 'Clear Search')}
            style={{
              position: 'absolute',
              right: '0.75rem',
              background: '#E2E8F0',
              border: 'none',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            zIndex: 100,
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            maxHeight: '320px',
            overflowY: 'auto'
          }}
        >
          {suggestions.map((scheme) => (
            <button
              key={scheme.id}
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onSelect) onSelect(scheme);
              }}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {scheme.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontWeight: 500 }}>
                    <Tag size={12} /> {scheme.category || 'Welfare'}
                  </span>
                  <span>•</span>
                  <span>{scheme.level || 'Central'}</span>
                  <span>•</span>
                  <span>{scheme.department}</span>
                </div>
              </div>
              <ArrowRight size={15} style={{ color: '#94A3B8', flexShrink: 0 }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
