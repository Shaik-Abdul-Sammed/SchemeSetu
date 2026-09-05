import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Zap } from 'lucide-react';

export default function NetworkStatusBadge() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [effectiveType, setEffectiveType] = useState('4g');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('connection' in navigator) {
      setEffectiveType(navigator.connection?.effectiveType || '4g');
      const handleConnChange = () => setEffectiveType(navigator.connection?.effectiveType || '4g');
      navigator.connection?.addEventListener('change', handleConnChange);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        navigator.connection?.removeEventListener('change', handleConnChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${
      !isOnline
        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
        : effectiveType === '2g'
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    }`}>
      {!isOnline ? (
        <>
          <WifiOff className="w-3 h-3 text-rose-400" />
          <span>Offline Mode (Cached)</span>
        </>
      ) : (
        <>
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span className="uppercase">{effectiveType} Network</span>
        </>
      )}
    </div>
  );
}
