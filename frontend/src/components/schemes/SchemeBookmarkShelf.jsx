import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SchemeBookmarkShelf() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('schemesetu_bookmarks') || '[]');
      setBookmarks(saved);
    } catch (e) {
      setBookmarks([]);
    }
  }, []);

  const removeBookmark = (id) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem('schemesetu_bookmarks', JSON.stringify(updated));
  };

  if (bookmarks.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 my-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400" />
          <h4 className="text-xs font-bold text-slate-100">Saved Schemes Shelf ({bookmarks.length})</h4>
        </div>
        <span className="text-[10px] text-slate-400">Offline Available</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bookmarks.map(b => (
          <div key={b.id} className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-lg flex items-center justify-between gap-2">
            <div className="truncate">
              <span className="text-xs font-bold text-slate-100 block truncate">{b.name}</span>
              <span className="text-[10px] text-emerald-400 font-mono">{b.category}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => navigate(`/schemes/${b.id}`)}
                className="p-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => removeBookmark(b.id)}
                className="p-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
