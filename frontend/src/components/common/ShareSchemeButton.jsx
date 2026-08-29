import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ShareSchemeButton({ scheme }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: scheme?.name || 'SchemeSetu Government Scheme',
      text: `Check out ${scheme?.name || 'this government scheme'} on SchemeSetu: ${scheme?.summary || ''}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share error:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (e) {
        alert(`Copy link: ${window.location.href}`);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
      title={t('shareScheme', 'Share Scheme')}
      aria-label={t('shareScheme', 'Share Scheme')}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-emerald-400" />}
      <span>{copied ? t('linkCopied', 'Link Copied!') : t('shareScheme', 'Share Scheme')}</span>
    </button>
  );
}
