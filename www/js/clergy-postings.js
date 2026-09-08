(() => {
  'use strict';
  const posting = window.POSTING_2026 || {};
  const records = Array.isArray(posting.searchRecords) ? posting.searchRecords : [];
  const parishes = Array.isArray(window.PARISHES_ALL) ? window.PARISHES_ALL : [];
  const forbidden = /08033375672|8033375672/;

  const parishRecords = parishes.map(p => ({
    category: 'Parish Assignment',
    label: p.name || 'Parish',
    person: p.priest || '',
    details: [p.deanery || '', p.vicarAssignments ? `Assigned clergy: ${p.vicarAssignments}` : ''].filter(Boolean).join(' · '),
    sourcePage: p.sourcePage || ''
  }));

  const all = [...parishRecords, ...records].filter(r => !forbidden.test([r.label, r.person, r.details].join(' ')));
  const input = document.getElementById('postingSearch');
  const clear = document.getElementById('postingClear');
  const filters = document.getElementById('postingFilters');
  const results = document.getElementById('postingResults');
  const count = document.getElementById('postingCount');
  if (!input || !filters || !results || !count) return;

  let activeCategory = 'All';

  const norm = v => String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const esc = v => String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  function phone(v) {
    const m = String(v || '').match(/(?:\+234|0)\d{10}/);
    if (!m || forbidden.test(m[0])) return '';
    return m[0].startsWith('0') ? '+234' + m[0].slice(1) : m[0];
  }

  function buildFilters() {
    const preferred = ['All','Parish Assignment','Deanery','Curia','Episcopal Vicar','Other Placement','Institution','Institutional Chaplaincy','Apostolic Chaplaincy'];
    const actual = [...new Set(all.map(r => r.category).filter(Boolean))];
    const cats = [...preferred.filter(x => x === 'All' || actual.includes(x)), ...actual.filter(x => !preferred.includes(x)).sort()];
    filters.innerHTML = cats.map(c => `<button type="button" class="posting-filter${c === activeCategory ? ' is-active' : ''}" data-category="${esc(c)}">${esc(c)}</button>`).join('');
    filters.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category || 'All';
      filters.querySelectorAll('button').forEach(b => b.classList.toggle('is-active', b === btn));
      render();
    }));
  }

  function score(r, terms, raw) {
    const hay = norm([r.category, r.label, r.person, r.details].join(' '));
    let s = 0;
    terms.forEach(t => {
      if (hay.includes(` ${t} `)) s += t.length >= 5 ? 8 : 5;
      else if (hay.includes(t)) s += 2;
    });
    if (raw && hay.includes(raw)) s += 20;
    return s;
  }

  function card(r) {
    const ph = phone(`${r.person || ''} ${r.details || ''}`);
    return `<article class="posting-card">
      <div class="posting-card__top"><span class="posting-card__category">${esc(r.category || 'Assignment')}</span><span class="posting-card__source">${r.sourcePage ? `Posting 2026 · p. ${esc(r.sourcePage)}` : 'Posting 2026'}</span></div>
      <h3 class="posting-card__label">${esc(r.label || '')}</h3>
      ${r.person ? `<div class="posting-card__person">${esc(r.person)}</div>` : ''}
      ${r.details ? `<div class="posting-card__details">${esc(r.details)}</div>` : ''}
      ${ph ? `<a class="posting-card__call" href="tel:${esc(ph)}">📞 Call listed contact</a>` : ''}
    </article>`;
  }

  function render() {
    const raw = norm(input.value);
    const terms = raw.split(' ').filter(Boolean);
    let list = all.filter(r => activeCategory === 'All' || r.category === activeCategory);

    if (terms.length) {
      list = list.map(r => ({r, s: score(r, terms, raw)})).filter(x => x.s > 0).sort((a,b) => b.s - a.s || String(a.r.label).localeCompare(String(b.r.label))).map(x => x.r);
    } else {
      list = list.slice().sort((a,b) => String(a.category).localeCompare(String(b.category)) || String(a.label).localeCompare(String(b.label)));
    }

    count.textContent = `${list.length} ${list.length === 1 ? 'assignment' : 'assignments'} found`;
    if (!list.length) {
      results.innerHTML = `<div class="posting-empty"><div class="posting-empty__icon">🔎</div><strong>No verified 2026 posting matched that search.</strong><span>Try a priest's surname, parish, institution, office, deanery or association.</span></div>`;
      return;
    }

    const visible = list.slice(0, 160);
    results.innerHTML = visible.map(card).join('') + (list.length > visible.length ? `<div class="posting-limit-note">Showing the first ${visible.length} results. Narrow the search to see a specific assignment.</div>` : '');
  }

  input.addEventListener('input', render);
  clear.addEventListener('click', () => { input.value=''; activeCategory='All'; buildFilters(); render(); input.focus(); });
  document.querySelectorAll('[data-example]').forEach(btn => btn.addEventListener('click', () => { input.value = btn.dataset.example || ''; render(); input.focus(); }));

  buildFilters();
  render();
})();
