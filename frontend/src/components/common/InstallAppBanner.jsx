import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install SchemeSetu: Open browser menu (⋮ or Share) and select "Add to Home screen" or "Install App".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner && !isInstalled) {
    return (
      <div className="bg-slate-900/90 text-slate-300 text-xs py-1.5 px-4 text-center border-b border-slate-800 flex items-center justify-between">
        <span className="flex items-center gap-1.5 justify-center w-full sm:w-auto">
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>SchemeSetu Web App - Install on mobile/desktop for offline access</span>
        </span>
        <button
          onClick={handleInstallClick}
          className="hidden sm:inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-0.5 rounded text-[11px] font-semibold transition"
        >
          <Download className="w-3 h-3" /> Install App
        </button>
      </div>
    );
  }

  if (isInstalled) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white text-xs py-2 px-4 border-b border-emerald-500/30 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <div className="bg-emerald-500/20 p-1.5 rounded-lg border border-emerald-500/30">
          <Smartphone className="w-4 h-4 text-emerald-400 animate-pulse" />
        </div>
        <div>
          <span className="font-semibold text-emerald-300">Install SchemeSetu Web App</span>
          <p className="text-[11px] text-slate-300 hidden sm:block">Access government schemes offline directly from your home screen.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded text-xs transition flex items-center gap-1 shadow-md"
        >
          <Download className="w-3.5 h-3.5" /> Install
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="text-slate-400 hover:text-white p-1 transition"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
