(() => {
  'use strict';

  let deferredPrompt = null;
  let installed = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

  function updateUI() {
    document.querySelectorAll('[data-install-app]').forEach(btn => {
      if (installed) {
        btn.textContent = '✓ App Installed';
        btn.disabled = true;
        btn.classList.add('is-installed');
      } else {
        btn.disabled = false;
      }
    });

    document.querySelectorAll('[data-app-install-status]').forEach(el => {
      el.textContent = installed
        ? 'Spiritus Sanctus is installed on this device.'
        : 'Install once, then launch Spiritus directly from your phone like any other app.';
    });

    document.documentElement.classList.toggle('pwa-installed', installed);
  }

  async function installApp() {
    if (installed) return;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') installed = true;
      deferredPrompt = null;
      updateUI();
      return;
    }

    if (isIOS()) {
      alert('To install Spiritus Sanctus on iPhone or iPad: tap Share in Safari, then choose “Add to Home Screen”.');
      return;
    }

    alert('To install Spiritus Sanctus: open your browser menu (⋮) and choose “Install app” or “Add to Home screen”. If the option is not visible yet, refresh this page once.');
  }

  function injectMenuInstall() {
    document.querySelectorAll('.nav__mobile').forEach(menu => {
      if (menu.querySelector('[data-install-app]')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pwa-nav-install';
      btn.setAttribute('data-install-app', '');
      btn.textContent = '📲 Install Spiritus App';
      menu.appendChild(btn);
    });
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    updateUI();
  });

  window.addEventListener('appinstalled', () => {
    installed = true;
    deferredPrompt = null;
    updateUI();
  });

  document.addEventListener('click', event => {
    const btn = event.target.closest('[data-install-app]');
    if (!btn) return;
    event.preventDefault();
    installApp();
  });

  async function register() {
    if (!('serviceWorker' in navigator)) return;
    try {
      await navigator.serviceWorker.register('/service-worker.js', {scope: '/'});
    } catch (err) {
      console.warn('Spiritus PWA service worker registration failed:', err);
    }
  }

  function init() {
    injectMenuInstall();
    updateUI();
    register();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }
})();
