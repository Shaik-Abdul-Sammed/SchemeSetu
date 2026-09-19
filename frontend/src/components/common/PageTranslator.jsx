import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../context/languageStore';

const originalTextNodes = new WeakMap();
const translatedTextNodes = new WeakMap();
const originalPlaceholders = new WeakMap();
const originalTitles = new WeakMap();
const originalAriaLabels = new WeakMap();
const originalValues = new WeakMap();

// Skip tags that should not have their text translated
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'NOSCRIPT', 'SVG', 'PATH']);

export default function PageTranslator() {
  const { lang } = useLanguage();
  const isTranslatingRef = useRef(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.getElementById('root') || document.body;
    let scheduledFrame = null;

    function shouldSkip(node) {
      if (!node || !node.parentElement) return true;
      const el = node.parentElement;
      if (SKIP_TAGS.has(el.tagName)) return true;
      if (el.closest('[data-no-translate]')) return true;
      if (el.isContentEditable) return true;
      return false;
    }

    function translateTextNode(textNode) {
      if (shouldSkip(textNode)) return;

      const currentVal = textNode.nodeValue;
      if (!currentVal) return;

      if (!originalTextNodes.has(textNode)) {
        originalTextNodes.set(textNode, currentVal);
      } else {
        const oldOrig = originalTextNodes.get(textNode);
        const lastTrans = translatedTextNodes.get(textNode);
        // If React or fetch set new content different from both old original and translation
        if (currentVal !== oldOrig && currentVal !== lastTrans) {
          originalTextNodes.set(textNode, currentVal);
        }
      }

      const original = originalTextNodes.get(textNode);
      const trimmed = original.trim();

      // Skip numbers, symbols, pure punctuation, or empty strings
      if (!trimmed || /^[0-9\s.,!?:;/()#₹$%&@*+\-_=\[\]{}<>|\\^~`'"]+$/.test(trimmed)) {
        return;
      }

      if (lang === 'EN') {
        if (textNode.nodeValue !== original) {
          textNode.nodeValue = original;
        }
        return;
      }

      // 1. Direct translation
      let translated = getTranslation(lang, trimmed);
      let prefix = '';
      let suffix = '';

      // 2. If no direct match, check for list prefixes (e.g., "1. ", "• ", "📄 ", "⚡ ", "✅ ")
      if (!translated || translated === trimmed) {
        const prefixMatch = trimmed.match(/^(\d+\.|\u2022|[•📄⚡✅✓\-*]+)\s+(.+)$/);
        if (prefixMatch) {
          const core = prefixMatch[2].trim();
          const coreTrans = getTranslation(lang, core);
          if (coreTrans && coreTrans !== core) {
            translated = coreTrans;
            prefix = prefixMatch[1] + ' ';
          }
        }
      }

      if (translated && (translated !== trimmed || prefix)) {
        const leadingSpace = original.match(/^\s*/)?.[0] || '';
        const trailingSpace = original.match(/\s*$/)?.[0] || '';
        const newVal = leadingSpace + prefix + translated + suffix + trailingSpace;
        if (textNode.nodeValue !== newVal) {
          textNode.nodeValue = newVal;
          translatedTextNodes.set(textNode, newVal);
        }
      }
    }

    function translateAttributes(el) {
      if (!el || el.closest?.('[data-no-translate]')) return;

      // 1. Placeholder
      if (el.placeholder) {
        if (!originalPlaceholders.has(el)) {
          originalPlaceholders.set(el, el.placeholder);
        }
        const orig = originalPlaceholders.get(el);
        if (lang === 'EN') {
          el.placeholder = orig;
        } else {
          const trans = getTranslation(lang, orig);
          if (trans && trans !== orig) el.placeholder = trans;
        }
      }

      // 2. Title
      if (el.title) {
        if (!originalTitles.has(el)) {
          originalTitles.set(el, el.title);
        }
        const orig = originalTitles.get(el);
        if (lang === 'EN') {
          el.title = orig;
        } else {
          const trans = getTranslation(lang, orig);
          if (trans && trans !== orig) el.title = trans;
        }
      }

      // 3. aria-label
      const ariaLabel = el.getAttribute?.('aria-label');
      if (ariaLabel) {
        if (!originalAriaLabels.has(el)) {
          originalAriaLabels.set(el, ariaLabel);
        }
        const orig = originalAriaLabels.get(el);
        if (lang === 'EN') {
          el.setAttribute('aria-label', orig);
        } else {
          const trans = getTranslation(lang, orig);
          if (trans && trans !== orig) el.setAttribute('aria-label', trans);
        }
      }

      // 4. Button / Submit Value
      if ((el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) && el.value) {
        if (!originalValues.has(el)) {
          originalValues.set(el, el.value);
        }
        const orig = originalValues.get(el);
        if (lang === 'EN') {
          el.value = orig;
        } else {
          const trans = getTranslation(lang, orig);
          if (trans && trans !== orig) el.value = trans;
        }
      }
    }

    function translateSubtree(target) {
      if (!target) return;
      isTranslatingRef.current = true;

      try {
        if (target.nodeType === Node.TEXT_NODE) {
          translateTextNode(target);
          return;
        }

        if (target.nodeType === Node.ELEMENT_NODE) {
          translateAttributes(target);
          const walker = document.createTreeWalker(
            target,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: (n) => shouldSkip(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
            }
          );

          let node;
          while ((node = walker.nextNode())) {
            translateTextNode(node);
          }

          // Check child elements for attributes (placeholder, title, aria-label, input values)
          const attrEls = target.querySelectorAll('input[placeholder], textarea[placeholder], [title], [aria-label], input[type="button"], input[type="submit"]');
          attrEls.forEach(translateAttributes);
        }
      } finally {
        isTranslatingRef.current = false;
      }
    }

    function scheduleTranslation() {
      if (scheduledFrame) cancelAnimationFrame(scheduledFrame);
      scheduledFrame = requestAnimationFrame(() => {
        translateSubtree(root);
      });
    }

    // Initial translation pass
    scheduleTranslation();

    // Observer for dynamic additions & text content mutations
    const observer = new MutationObserver((mutations) => {
      if (isTranslatingRef.current) return;

      let shouldUpdate = false;
      for (const m of mutations) {
        if (m.type === 'childList' && m.addedNodes.length > 0) {
          shouldUpdate = true;
          break;
        }
        if (m.type === 'characterData') {
          shouldUpdate = true;
          break;
        }
      }

      if (shouldUpdate) {
        scheduleTranslation();
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      if (scheduledFrame) cancelAnimationFrame(scheduledFrame);
      observer.disconnect();
    };
  }, [lang]);

  return null;
}
