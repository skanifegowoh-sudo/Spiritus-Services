(() => {
  'use strict';

  const params = new URLSearchParams(location.search);
  const embedded = params.get('embedded') === 'app';
  let deferredPrompt = null;

  if (embedded) document.documentElement.classList.add('embedded-app');

  function openSpiritus() {
    if (typeof window.openSpiritusAssistant === 'function') {
      window.openSpiritusAssistant();
      return;
    }
    document.querySelector('.spiritus-launcher')?.click();
  }

  function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('open');
  }

  async function retireLegacyRootWorker() {
    if (!('serviceWorker' in navigator)) return;
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      const rootScope = location.origin + '/';
      for (const reg of regs) {
        if (reg.scope === rootScope) await reg.unregister();
      }

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k =>
          k.startsWith('spiritus-pwa-') ||
          k.includes('spiritus-pwa-20260908')
        ).map(k => caches.delete(k)));
      }
    } catch (_) {}
  }

  function updateInstallUI() {
    document.querySelectorAll('[data-app-install-status]').forEach(el => {
      el.textContent = 'Install the separate Spiritus app. Normal website links will continue opening in your browser.';
    });
  }

  async function installApp() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      return;
    }
    location.href = '/app/?install=1';
  }

  function injectMenuInstall() {
    if (embedded) return;
    document.querySelectorAll('.nav__mobile').forEach(menu => {
      if (menu.querySelector('[data-install-app]')) return;
      const btn = document.createElement('button');
      btn.type='button';
      btn.className='pwa-nav-install';
      btn.setAttribute('data-install-app','');
      btn.textContent='📲 Install Spiritus App';
      menu.appendChild(btn);
    });
  }

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
  });

  window.addEventListener('message', e => {
    if (e.origin !== location.origin) return;
    if (e.data?.type === 'spiritus-open') openSpiritus();
    if (e.data?.type === 'spiritus-menu-toggle') toggleMenu();
  });

  document.addEventListener('click', e => {
    const install = e.target.closest('[data-install-app]');
    if (!install) return;
    e.preventDefault();
    installApp();
  });

  function init() {
    retireLegacyRootWorker();
    injectMenuInstall();
    updateInstallUI();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
