import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Tag } from 'lucide-react';
import { schemeService } from '../../services/schemeService';

export default function SearchAutocomplete({ value, onChange, onSelect, placeholder = 'Search by name, sector or keyword...' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

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

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value && suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-800/60">
          {suggestions.map((scheme) => (
            <button
              key={scheme.id}
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onSelect) onSelect(scheme);
              }}
              className="w-full p-3 text-left hover:bg-slate-800/80 transition flex items-center justify-between gap-3 group"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition">
                  {scheme.name}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-400" /> {scheme.category || 'Welfare'}
                  </span>
                  <span>•</span>
                  <span>{scheme.level || 'Central'}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
