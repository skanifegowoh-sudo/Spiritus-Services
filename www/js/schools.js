// Render the schools directory from the real 2025 Diocesan Directory data
(function() {
  const CATEGORIES = [
    { key: 'higher',     name: 'Higher Institutions',        sub: 'Universities, Seminaries & Institutes', color: 'cobalt', anchor: 'higher',     icon: '🎓' },
    { key: 'secondary',  name: 'Mission Secondary Schools',  sub: 'Diocesan-run secondary schools',        color: 'coral',  anchor: 'secondary',  icon: '🏫' },
    { key: 'seminaries', name: 'Seminaries',                 sub: 'Minor seminaries of the Diocese',       color: 'violet', anchor: 'seminaries', icon: '✝' },
    { key: 'vocational', name: 'Vocational Centres',         sub: 'Skills & technical training centres',   color: 'sun',    anchor: 'vocational', icon: '🛠' },
    { key: 'nursery',    name: 'Nursery & Primary Schools',  sub: 'Parish nursery/primary schools',        color: 'jade',   anchor: 'nursery',    icon: '🧒' },
  ];

  const container = document.getElementById('schoolsContent');
  if (!container || !window.SCHOOLS) return;

  function fieldsFor(key, item, i) {
    // Returns [line1, line2] of meta info depending on category shape
    if (key === 'secondary') {
      return [item.head, item.contact].filter(Boolean);
    }
    if (key === 'nursery') {
      return [item.parish, item.contact].filter(Boolean);
    }
    // higher, seminaries, vocational share {name, location, head}
    return [item.location, item.head].filter(Boolean);
  }

  let html = '';
  for (const c of CATEGORIES) {
    const list = window.SCHOOLS[c.key] || [];
    html += `<div class="deanery-block" id="${c.anchor}" data-category="${c.key}">`;
    html += `<div class="deanery-header deanery-header--${c.color}">
      <div>
        <div class="deanery-header__title">${c.icon} ${c.name}</div>
        <div class="deanery-header__meta">${c.sub}</div>
      </div>
      <div class="deanery-header__count">${list.length} ${list.length === 1 ? 'entry' : 'entries'}</div>
    </div>`;
    html += '<div class="parish-grid">';
    list.forEach((item, i) => {
      const meta = fieldsFor(c.key, item, i);
      const searchable = (item.name + ' ' + (item.location || '') + ' ' + (item.parish || '') + ' ' + (item.head || '') + ' ' + (item.contact || '')).toLowerCase();
      html += `<div class="parish-item" data-name="${searchable.replace(/"/g, '&quot;')}">
        <div class="parish-item__num">${String(i + 1).padStart(2, '0')}</div>
        <div class="parish-item__name">${item.name}</div>
        <div class="parish-item__meta">${meta.length ? meta.join(' · ') : '&nbsp;'}</div>
      </div>`;
    });
    html += '</div></div>';
  }
  container.innerHTML = html;

  const colorMap = { higher: 'cobalt', secondary: 'coral', seminaries: 'violet', vocational: 'sun', nursery: 'jade' };
  document.querySelectorAll('#categoryFilters .directory-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#categoryFilters .directory-filter').forEach(b => {
        b.classList.remove('directory-filter--active');
        b.classList.remove('deanery-cobalt', 'deanery-coral', 'deanery-jade', 'deanery-sun', 'deanery-violet', 'deanery-teal');
      });
      btn.classList.add('directory-filter--active');
      const ck = btn.dataset.category;
      if (colorMap[ck]) btn.classList.add('deanery-' + colorMap[ck]);
      filter(ck === 'all' ? '' : ck, currentQuery);
    });
  });

  let currentQuery = '';
  const search = document.getElementById('schoolSearch');
  search.addEventListener('input', (e) => {
    currentQuery = e.target.value.toLowerCase();
    const active = document.querySelector('#categoryFilters .directory-filter--active');
    filter(active && active.dataset.category !== 'all' ? active.dataset.category : '', currentQuery);
  });

  function filter(category, query) {
    document.querySelectorAll('.deanery-block').forEach(block => {
      const ck = block.dataset.category;
      const matchesCategory = !category || ck === category;
      let hasMatch = false;
      block.querySelectorAll('.parish-item').forEach(item => {
        const name = item.dataset.name || '';
        const show = (!query || name.includes(query));
        item.style.display = show ? '' : 'none';
        if (show) hasMatch = true;
      });
      block.style.display = (matchesCategory && (hasMatch || !query)) ? '' : 'none';
    });
  }

  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
  }
})();
