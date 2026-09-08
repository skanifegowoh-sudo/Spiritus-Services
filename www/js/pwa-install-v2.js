(() => {
  'use strict';

  let deferredPrompt = null;
  const standaloneMedia = window.matchMedia('(display-mode: standalone)');
  let installed = standaloneMedia.matches || window.navigator.standalone === true;

  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

  function updateInstalledState() {
    installed = standaloneMedia.matches || window.navigator.standalone === true || installed;
    document.documentElement.classList.toggle('pwa-installed', installed);
    document.documentElement.classList.toggle('pwa-standalone', standaloneMedia.matches || window.navigator.standalone === true);

    document.querySelectorAll('[data-install-app]').forEach(btn => {
      if (installed) {
        btn.textContent = '✓ App Installed';
        btn.disabled = true;
        btn.classList.add('is-installed');
      } else {
        btn.disabled = false;
        btn.classList.remove('is-installed');
      }
    });

    document.querySelectorAll('[data-app-install-status]').forEach(el => {
      el.textContent = installed
        ? 'Spiritus Sanctus is installed on this device.'
        : 'One tap installs Spiritus on your home screen and app drawer.';
    });
  }

  async function installApp() {
    if (installed) return;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') installed = true;
      deferredPrompt = null;
      updateInstalledState();
      return;
    }

    if (isIOS()) {
      alert('To install Spiritus Sanctus on iPhone or iPad: tap Share in Safari, then choose “Add to Home Screen”.');
      return;
    }

    alert('To install Spiritus Sanctus: open the browser menu (⋮) and choose “Install app” or “Add to Home screen”. If the option is not visible yet, refresh this page once.');
  }

  function openSpiritus() {
    if (typeof window.openSpiritusAssistant === 'function') {
      window.openSpiritusAssistant();
      return;
    }
    document.querySelector('.spiritus-launcher')?.click();
  }

  function toggleMoreMenu() {
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;
    menu.classList.toggle('open');
    if (menu.classList.contains('open')) {
      menu.scrollIntoView({block: 'nearest'});
    }
  }

  function currentSection() {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/' || path.endsWith('/index.html')) return 'home';
    if (path.endsWith('/directory.html')) return 'parishes';
    if (path.endsWith('/clergy-postings.html')) return 'postings';
    return '';
  }

  function injectBottomNav() {
    if (document.querySelector('.spiritus-app-nav')) return;

    const active = currentSection();
    const nav = document.createElement('nav');
    nav.className = 'spiritus-app-nav';
    nav.setAttribute('aria-label', 'Spiritus app navigation');
    nav.innerHTML = `
      <a href="/index.html" class="${active === 'home' ? 'is-active' : ''}" aria-label="Home">
        <span>⌂</span><small>Home</small>
      </a>
      <a href="/directory.html" class="${active === 'parishes' ? 'is-active' : ''}" aria-label="Parishes">
        <span>⛪</span><small>Parishes</small>
      </a>
      <a href="/clergy-postings.html" class="${active === 'postings' ? 'is-active' : ''}" aria-label="2026 clergy search">
        <span>📘</span><small>2026 Search</small>
      </a>
      <button type="button" data-app-spiritus aria-label="Ask Spiritus">
        <span>💬</span><small>Spiritus</small>
      </button>
      <button type="button" data-app-more aria-label="More">
        <span>☰</span><small>More</small>
      </button>`;
    document.body.appendChild(nav);
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
    updateInstalledState();
  });

  window.addEventListener('appinstalled', () => {
    installed = true;
    deferredPrompt = null;
    updateInstalledState();
  });

  standaloneMedia.addEventListener?.('change', updateInstalledState);

  document.addEventListener('click', event => {
    const install = event.target.closest('[data-install-app]');
    if (install) {
      event.preventDefault();
      installApp();
      return;
    }

    if (event.target.closest('[data-app-spiritus]')) {
      event.preventDefault();
      openSpiritus();
      return;
    }

    if (event.target.closest('[data-app-more]')) {
      event.preventDefault();
      toggleMoreMenu();
    }
  });

  async function register() {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js', {scope: '/'});
      reg.update?.();
    } catch (err) {
      console.warn('Spiritus PWA service worker registration failed:', err);
    }
  }

  function init() {
    injectMenuInstall();
    injectBottomNav();
    updateInstalledState();
    register();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }
})();
