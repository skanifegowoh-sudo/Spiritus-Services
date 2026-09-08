(() => {
  'use strict';

  document.addEventListener('click', e => {
    const ask = e.target.closest('[data-open-spiritus]');
    if (ask) {
      e.preventDefault();
      if (typeof window.openSpiritusAssistant === 'function') window.openSpiritusAssistant();
      else document.querySelector('.spiritus-launcher')?.click();
      return;
    }

    const near = e.target.closest('[data-nearby-parish]');
    if (!near) return;
    e.preventDefault();

    const fallback = () => { window.location.href = 'directory.html'; };
    if (!navigator.geolocation) return fallback();

    const old = near.innerHTML;
    near.innerHTML = '<span class="smart-action__icon">⌖</span><span><strong>Locating…</strong><small>Please allow location</small></span>';

    navigator.geolocation.getCurrentPosition(
      pos => {
        near.innerHTML = old;
        const lat = Number(pos.coords.latitude).toFixed(6);
        const lng = Number(pos.coords.longitude).toFixed(6);
        window.open(`https://www.google.com/maps/search/Catholic+Church/@${lat},${lng},14z`, '_blank', 'noopener,noreferrer');
      },
      () => {
        near.innerHTML = old;
        fallback();
      },
      { enableHighAccuracy:false, timeout:9000, maximumAge:300000 }
    );
  });
})();
