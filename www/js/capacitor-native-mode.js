(() => {
  'use strict';

  function isNativeCapacitor() {
    try {
      return !!(
        window.Capacitor &&
        typeof window.Capacitor.getPlatform === 'function' &&
        window.Capacitor.getPlatform() !== 'web'
      );
    } catch (_) {
      return false;
    }
  }

  function openSpiritus() {
    if (typeof window.openSpiritusAssistant === 'function') {
      window.openSpiritusAssistant();
      return;
    }
    document.querySelector('[data-open-spiritus]')?.click();
    document.querySelector('.spiritus-launcher')?.click();
  }

  function toggleMore() {
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;
    menu.classList.toggle('open');
    if (menu.classList.contains('open')) {
      menu.scrollIntoView({ block: 'nearest' });
    }
  }

  function pageKey() {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/' || path.endsWith('/index.html')) return 'home';
    if (path.endsWith('/directory.html')) return 'parishes';
    if (path.endsWith('/clergy-postings.html')) return 'postings';
    return '';
  }

  function injectNativeNav() {
    if (document.querySelector('.capacitor-bottom-nav')) return;

    const active = pageKey();
    const nav = document.createElement('nav');
    nav.className = 'capacitor-bottom-nav';
    nav.setAttribute('aria-label', 'Spiritus Sanctus app navigation');
    nav.innerHTML = `
      <a href="/index.html" class="${active === 'home' ? 'is-active' : ''}">
        <span>⌂</span><small>Home</small>
      </a>
      <a href="/directory.html" class="${active === 'parishes' ? 'is-active' : ''}">
        <span>⛪</span><small>Parishes</small>
      </a>
      <a href="/clergy-postings.html" class="${active === 'postings' ? 'is-active' : ''}">
        <span>📘</span><small>2026 Search</small>
      </a>
      <button type="button" data-cap-spiritus>
        <span>💬</span><small>Spiritus</small>
      </button>
      <button type="button" data-cap-more>
        <span>☰</span><small>More</small>
      </button>`;
    document.body.appendChild(nav);
  }

  function markNative() {
    document.documentElement.classList.add('capacitor-native');
    document.body.classList.add('capacitor-native-body');
    injectNativeNav();

    document.addEventListener('click', event => {
      if (event.target.closest('[data-cap-spiritus]')) {
        event.preventDefault();
        openSpiritus();
        return;
      }
      if (event.target.closest('[data-cap-more]')) {
        event.preventDefault();
        toggleMore();
      }
    });
  }

  function initWithRetry() {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (isNativeCapacitor()) {
        clearInterval(timer);
        markNative();
      } else if (tries >= 20) {
        clearInterval(timer);
      }
    }, 100);

    if (isNativeCapacitor()) {
      clearInterval(timer);
      markNative();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWithRetry, { once: true });
  } else {
    initWithRetry();
  }
})();
