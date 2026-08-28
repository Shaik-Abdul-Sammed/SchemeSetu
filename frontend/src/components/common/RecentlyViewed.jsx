import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, ArrowRight } from 'lucide-react';

export default function RecentlyViewed() {
  const [recentSchemes, setRecentSchemes] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('schemesetu_recently_viewed');
      if (stored) {
        setRecentSchemes(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse recently viewed schemes:', e);
    }
  }, []);

  if (!recentSchemes || recentSchemes.length === 0) return null;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-bold text-white">Recently Viewed Schemes</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {recentSchemes.slice(0, 4).map((scheme) => (
          <Link
            key={scheme.id}
            to={`/schemes/${scheme.id}`}
            className="bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl p-3.5 transition group flex flex-col justify-between"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                {scheme.category || 'Welfare'}
              </span>
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition line-clamp-1">
                {scheme.name}
              </h4>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60 mt-2">
              <span>View details</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
