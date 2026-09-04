import React from 'react';
import { Home, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center text-slate-200">
      <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 animate-bounce">
        <AlertCircle className="w-12 h-12" />
      </div>

      <h1 className="text-3xl font-extrabold text-slate-100 mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        The requested page or government scheme reference does not exist or you may be offline.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
        >
          <Home className="w-4 h-4" /> Back to Home
        </button>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    </div>
  );
}
