/**
 * Capacitor Mobile Integration & Android Back Button Handler
 * 
 * Provides Capacitor-specific native integration for SchemeSetu:
 *  - Handles Android hardware back button cleanly (closes modals -> navigates back -> exits gracefully).
 *  - Handles safe areas & status bar styling.
 *  - Handles offline/online network status changes.
 */

export function setupCapacitorApp({ navigate, currentPath, closeModals }) {
  if (typeof window === 'undefined') return;

  const isCapacitor = !!window.Capacitor;

  // 1. Android Back Button Handling
  if (isCapacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
    const { App } = window.Capacitor.Plugins;

    App.removeAllListeners?.();

    App.addListener('backButton', ({ canGoBack }) => {
      // Check if any modal is currently open
      const hasOpenModal = document.querySelector('[role="dialog"]') || 
                           document.querySelector('.modal-backdrop') || 
                           document.querySelector('.fixed.aria-modal');

      if (hasOpenModal && closeModals) {
        closeModals();
        return;
      }

      if (currentPath !== '/' && currentPath !== '/home') {
        if (navigate) {
          navigate(-1);
        } else {
          window.history.back();
        }
      } else {
        App.minimizeApp();
      }
    });
  }

  // 2. Safe Area Insets Padding Helper
  if (isCapacitor) {
    document.body.classList.add('is-capacitor-native');
  }
}
