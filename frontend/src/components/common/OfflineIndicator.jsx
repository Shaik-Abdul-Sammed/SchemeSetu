import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function OfflineIndicator() {
  const { t } = useLanguage();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 4000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showReconnected) {
    return (
      <div className="bg-emerald-600 text-white text-xs font-semibold py-1 px-4 text-center flex items-center justify-center gap-1.5 shadow-md transition-all">
        <Wifi className="w-3.5 h-3.5" />
        <span>{t('onlineMsg', 'Connection Restored')}</span>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div className="bg-amber-600 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-1.5 shadow-md sticky top-0 z-50">
      <WifiOff className="w-3.5 h-3.5 animate-pulse" />
      <span>{t('offlineMsg', 'You are currently offline. Showing cached demo data.')}</span>
    </div>
  );
}
