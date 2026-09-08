(() => {
  'use strict';

  const frame = document.getElementById('spiritusFrame');
  const installSheet = document.getElementById('installSheet');
  const installNow = document.getElementById('installNow');
  const continueWeb = document.getElementById('continueWeb');
  const status = document.getElementById('appStatus');

  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  let deferredPrompt = null;

  const routes = {
    home: '/?embedded=app',
    directory: '/directory.html?embedded=app',
    postings: '/clergy-postings.html?embedded=app',
    domus: '/services.html?embedded=app#hospitality',
    'choice-flame': '/choice-flame.html?embedded=app'
  };

  function showStatus(text) {
    status.textContent = text;
    status.classList.add('show');
    clearTimeout(showStatus.t);
    showStatus.t = setTimeout(() => status.classList.remove('show'), 1800);
  }

  function setPage(page) {
    frame.src = routes[page] || routes.home;
    document.querySelectorAll('[data-page]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.page === page));
  }

  function pageFromUrl() {
    const q = new URLSearchParams(location.search);
    return q.get('page') || 'home';
  }

  function postToSite(message) {
    try { frame.contentWindow.postMessage(message, location.origin); } catch (_) {}
  }

  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => setPage(btn.dataset.page));
  });

  document.querySelector('[data-action="spiritus"]').addEventListener('click', () => {
    postToSite({type:'spiritus-open'});
  });

  document.querySelector('[data-action="more"]').addEventListener('click', () => {
    postToSite({type:'spiritus-menu-toggle'});
  });

  frame.addEventListener('load', () => {
    try {
      const path = frame.contentWindow.location.pathname;
      const page =
        path.endsWith('/directory.html') ? 'directory' :
        path.endsWith('/clergy-postings.html') ? 'postings' :
        path.endsWith('/services.html') ? 'domus' :
        path.endsWith('/choice-flame.html') ? 'choice-flame' : 'home';
      document.querySelectorAll('[data-page]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.page === page));
    } catch (_) {}
  });

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (!standalone) installSheet.hidden = false;
  });

  window.addEventListener('appinstalled', () => {
    installSheet.hidden = true;
    showStatus('Spiritus installed');
  });

  installNow.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      return;
    }
    alert('Open the browser menu (⋮) and choose “Install app” or “Add to Home screen”.');
  });

  continueWeb.addEventListener('click', () => {
    installSheet.hidden = true;
  });

  if (!standalone && new URLSearchParams(location.search).get('install') === '1') {
    installSheet.hidden = false;
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/app/service-worker.js', {scope:'/app/'}).then(reg => reg.update()).catch(() => {});
  }

  setPage(pageFromUrl());
})();
