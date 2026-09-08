(() => {
  'use strict';

  async function cleanLegacyPwa() {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        const rootScope = location.origin + '/';
        for (const reg of regs) {
          if (reg.scope === rootScope) {
            try { await reg.unregister(); } catch (_) {}
          }
        }
      }

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter(k =>
              k.startsWith('spiritus-pwa-') ||
              k.includes('spiritus-pwa-20260908') ||
              k.includes('spiritus-app-shell-')
            )
            .map(k => caches.delete(k))
        );
      }
    } catch (_) {}
  }

  cleanLegacyPwa();
})();
