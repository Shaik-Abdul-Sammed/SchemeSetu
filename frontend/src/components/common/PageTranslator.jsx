import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * PageTranslator — Google Translate Widget Integration
 *
 * Integrates the official Google Translate website widget which translates
 * the ENTIRE page content automatically — not just hardcoded dictionary keys.
 *
 * Language code mapping between SchemeSetu (2-letter) and Google Translate (IETF BCP 47):
 *   EN → en  |  HI → hi  |  TE → te  |  TA → ta  |  KN → kn
 *   ML → ml  |  MR → mr  |  BN → bn  |  PA → pa  |  GU → gu
 *   UR → ur  |  OR → or  |  AS → as
 *
 * When lang === 'EN', the widget is hidden and shows the original English content.
 * When lang changes to a non-English language, the widget automatically applies
 * the translation across the full page DOM — including dynamically loaded content.
 */

const LANG_MAP = {
  EN: 'en',
  HI: 'hi',
  TE: 'te',
  TA: 'ta',
  KN: 'kn',
  ML: 'ml',
  MR: 'mr',
  BN: 'bn',
  PA: 'pa',
  GU: 'gu',
  UR: 'ur',
  OR: 'or',
  AS: 'as'
};

let widgetInitialized = false;

function loadGoogleTranslateScript() {
  if (document.getElementById('google-translate-script')) return;
  const script = document.createElement('script');
  script.id = 'google-translate-script';
  script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function initWidget() {
  if (!window.google || !window.google.translate) return false;
  if (!document.getElementById('google_translate_element')) return false;
  if (widgetInitialized) return true;

  try {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        includedLanguages: 'hi,te,ta,kn,ml,mr,bn,pa,gu,ur,or,as,en',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
        multilanguagePage: false
      },
      'google_translate_element'
    );
    widgetInitialized = true;
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Programmatically set the Google Translate language using the hidden
 * cookie-based approach that the widget itself uses internally.
 */
function applyGoogleTranslateLanguage(googleLangCode) {
  if (googleLangCode === 'en') {
    // Restore original English — click the "Show original" control if present
    const restore = document.querySelector('.goog-te-banner-frame') ||
      document.getElementById('google_translate_element');
    
    // Remove the translation cookie and reload concept — use the select element
    const sel = document.querySelector('.goog-te-combo');
    if (sel) {
      sel.value = 'en';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return;
  }

  // Use the combo select to trigger translation
  const sel = document.querySelector('.goog-te-combo');
  if (sel) {
    sel.value = googleLangCode;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }

  // Fallback: use cookie-based approach
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `googtrans=/en/${googleLangCode}; expires=${expires}; path=/`;
  document.cookie = `googtrans=/en/${googleLangCode}; expires=${expires}; domain=${window.location.hostname}; path=/`;
}

export default function PageTranslator() {
  const { lang } = useLanguage();
  const lastLang = useRef(lang);
  const [widgetReady, setWidgetReady] = useState(false);

  // Step 1: Mount the hidden Google Translate container and load the script once
  useEffect(() => {
    // Inject the hidden container where the widget attaches
    if (!document.getElementById('google_translate_element')) {
      const container = document.createElement('div');
      container.id = 'google_translate_element';
      container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;';
      document.body.appendChild(container);
    }

    // Add CSS to hide the Google Translate toolbar banner which appears at the top of the page
    if (!document.getElementById('google-translate-hide-css')) {
      const style = document.createElement('style');
      style.id = 'google-translate-hide-css';
      style.textContent = `
        /* Hide the Google Translate top banner bar */
        .goog-te-banner-frame.skiptranslate { display: none !important; }
        body { top: 0 !important; }
        /* Hide the "Translated" tooltip */
        .goog-te-balloon-frame { display: none !important; }
        /* Hide the Google Translate attribution bar */
        #goog-gt-tt { display: none !important; }
        .goog-tooltip { display: none !important; }
        .goog-tooltip:hover { display: none !important; }
        .goog-text-highlight { background: none !important; box-shadow: none !important; }
      `;
      document.head.appendChild(style);
    }

    // Install the global callback that the Google Translate script calls when ready
    window.googleTranslateElementInit = () => {
      const ok = initWidget();
      if (ok) setWidgetReady(true);
    };

    // Load the script
    loadGoogleTranslateScript();

    // Polling fallback in case the callback fires before React picks it up
    const poll = setInterval(() => {
      if (initWidget()) {
        setWidgetReady(true);
        clearInterval(poll);
      }
    }, 500);

    return () => {
      clearInterval(poll);
    };
  }, []);

  // Step 2: Whenever lang changes (and widget is ready), apply the translation
  useEffect(() => {
    if (!widgetReady && lang !== 'EN') return;
    if (lang === lastLang.current) return;
    lastLang.current = lang;

    const googleLang = LANG_MAP[lang] || 'en';

    if (widgetReady) {
      applyGoogleTranslateLanguage(googleLang);
    } else if (lang !== 'EN') {
      // Widget not ready yet — set cookie for next page load / retry
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `googtrans=/en/${googleLang}; expires=${expires}; path=/`;
      // Retry after the widget becomes ready
      const retryInterval = setInterval(() => {
        if (initWidget()) {
          setWidgetReady(true);
          clearInterval(retryInterval);
          applyGoogleTranslateLanguage(googleLang);
        }
      }, 300);
      setTimeout(() => clearInterval(retryInterval), 10000);
    }
  }, [lang, widgetReady]);

  return null;
}
