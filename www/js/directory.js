// Render the parish directory: alphabetical by parish name, click to reveal priest/vicar + contacts
(function() {
  const DEANERY_COLORS = {
    'Agbani Deanery': 'cobalt',
    'Aguobu Owa Deanery': 'coral',
    'Emene Deanery': 'jade',
    'Enugu Deanery': 'sun',
    'Nkwo Nike Deanery': 'violet',
    'Udi Deanery': 'teal',
  };

  const container = document.getElementById('directoryContent');
  if (!container || !window.PARISHES_ALL) return;

  const parishes = window.PARISHES_ALL.slice(); // already sorted alphabetically by name

  function escapeHtml(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderDetail(p) {
    let rows = '';
    if (p.priest) {
      rows += `<div class="parish-detail__row">
        <span class="parish-detail__label">✝ Parish Priest</span>
        <span class="parish-detail__name">${escapeHtml(p.priest)}</span>
        ${p.priestPhone ? `<span class="parish-detail__contact">📞 ${escapeHtml(p.priestPhone)}</span>` : ''}
        ${p.priestEmail ? `<span class="parish-detail__contact">✉️ ${escapeHtml(p.priestEmail)}</span>` : ''}
      </div>`;
    }
    (p.vicars || []).forEach(v => {
      if (!v.name) return;
      rows += `<div class="parish-detail__row">
        <span class="parish-detail__label">⛪ Parish Vicar</span>
        <span class="parish-detail__name">${escapeHtml(v.name)}</span>
        ${v.phone ? `<span class="parish-detail__contact">📞 ${escapeHtml(v.phone)}</span>` : ''}
        ${v.email ? `<span class="parish-detail__contact">✉️ ${escapeHtml(v.email)}</span>` : ''}
      </div>`;
    });
    if (!rows) {
      rows = `<div class="parish-detail__row"><span class="parish-detail__label">No contact details on file for this parish yet.</span></div>`;
    }
    return rows;
  }

  let html = '<div class="parish-grid" id="parishGrid">';
  parishes.forEach((p, i) => {
    const vicarNames = (p.vicars || []).map(v => v.name).join(' ');
    const searchable = (p.name + ' ' + p.deanery + ' ' + p.priest + ' ' + vicarNames).toLowerCase();
    const color = DEANERY_COLORS[p.deanery] || 'cobalt';
    html += `<div class="parish-item parish-item--clickable" data-deanery="${escapeHtml(p.deanery)}" data-name="${escapeHtml(searchable)}" data-idx="${i}">
      <div class="parish-item__num">${String(i + 1).padStart(3, '0')}</div>
      <div class="parish-item__name">${escapeHtml(p.name)}</div>
      <div class="parish-item__meta">
        <span class="parish-item__tag parish-item__tag--${color}">${escapeHtml(p.deanery.replace(' Deanery',''))}</span>
        <span class="parish-item__chevron">▾ tap for priest &amp; contact</span>
      </div>
      <div class="parish-item__detail">${renderDetail(p)}</div>
    </div>`;
  });
  html += '</div>';
  container.innerHTML = html;

  // click-to-expand behaviour
  document.querySelectorAll('.parish-item--clickable').forEach(item => {
    item.addEventListener('click', (e) => {
      item.classList.toggle('parish-item--open');
    });
  });

  // deanery filter buttons
  document.querySelectorAll('#deaneryFilters .directory-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#deaneryFilters .directory-filter').forEach(b => {
        b.classList.remove('directory-filter--active');
        b.classList.remove('deanery-cobalt','deanery-coral','deanery-jade','deanery-sun','deanery-violet','deanery-teal');
      });
      btn.classList.add('directory-filter--active');
      const dk = btn.dataset.deanery;
      const color = DEANERY_COLORS[dk];
      if (color) btn.classList.add('deanery-' + color);
      currentDeanery = dk === 'all' ? '' : dk;
      applyFilter();
    });
  });

  let currentDeanery = '';
  let currentQuery = '';
  const search = document.getElementById('parishSearch');
  search.addEventListener('input', (e) => {
    currentQuery = e.target.value.toLowerCase();
    applyFilter();
  });

  function applyFilter() {
    document.querySelectorAll('.parish-item').forEach(item => {
      const matchesDeanery = !currentDeanery || item.dataset.deanery === currentDeanery;
      const matchesQuery = !currentQuery || (item.dataset.name || '').includes(currentQuery);
      item.style.display = (matchesDeanery && matchesQuery) ? '' : 'none';
    });
  }
})();
