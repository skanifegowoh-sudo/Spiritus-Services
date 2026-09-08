(() => {
  'use strict';

  const posting = window.POSTING_2026 || {};
  const records = Array.isArray(posting.searchRecords) ? posting.searchRecords : [];
  const parishes = Array.isArray(window.PARISHES_ALL) ? window.PARISHES_ALL : [];
  const forbidden = new RegExp(['0803','337','5672'].join('') + '|' + ['803','337','5672'].join(''));

  const STOP = new Set([
    'fr','rev','reverend','father','msgr','monsignor','most','very','sr','sister','br','brother',
    'priest','priests','st','saint','the','a','an','of','in','at','to','for','and','with',
    'who','where','what','which','is','are','was','2026','posting','postings','current','diocese','enugu'
  ]);

  const ALIASES = {
    cwo: 'catholic women organization',
    cmo: 'catholic men organization',
    cyon: 'catholic youth organization nigeria',
    nfcs: 'nigerian federation catholic students',
    ycs: 'young catholic students',
    imt: 'institute management technology',
    esut: 'enugu state university science technology',
    unn: 'university nigeria nsukka',
    unec: 'university nigeria enugu campus',
    unth: 'university nigeria teaching hospital',
    gouni: 'godfrey okoye university'
  };

  const parishRecords = parishes.map(p => ({
    category: 'Parish Assignment',
    label: p.name || 'Parish',
    person: p.priest || '',
    details: [
      p.deanery || '',
      p.vicarAssignments ? `Assigned clergy: ${p.vicarAssignments}` : ''
    ].filter(Boolean).join(' · '),
    sourcePage: p.sourcePage || ''
  }));

  function normalise(v) {
    return String(v || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escapeHtml(v) {
    return String(v || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function key(r) {
    return normalise([r.category, r.label, r.person, r.details].join('|'));
  }

  const all = [];
  const seen = new Set();
  [...parishRecords, ...records].forEach(r => {
    const joined = [r.label, r.person, r.details].join(' ');
    if (forbidden.test(joined)) return;
    const k = key(r);
    if (!k || seen.has(k)) return;
    seen.add(k);
    all.push(r);
  });

  function expandTerms(raw) {
    const out = [];
    normalise(raw).split(' ').filter(Boolean).forEach(t => {
      const expanded = ALIASES[t] ? ALIASES[t].split(' ') : [t];
      expanded.forEach(x => {
        if (x.length >= 2 && !STOP.has(x) && !out.includes(x)) out.push(x);
      });
    });
    return out;
  }

  function hay(r) {
    return normalise([r.category, r.label, r.person, r.details].join(' '));
  }

  function matches(r, terms) {
    if (!terms.length) return true;
    const h = hay(r);
    return terms.every(t => h.includes(t));
  }

  function score(r, terms, raw) {
    const h = hay(r);
    const label = normalise(r.label);
    const person = normalise(r.person);
    const phrase = normalise(raw).split(' ').filter(t => t && !STOP.has(t)).join(' ');
    let s = 0;

    terms.forEach(t => {
      if (person === t || label === t) s += 35;
      else if (person.startsWith(t) || label.startsWith(t)) s += 20;
      else if (` ${person} `.includes(` ${t} `) || ` ${label} `.includes(` ${t} `)) s += 14;
      else if (` ${h} `.includes(` ${t} `)) s += 9;
      else if (h.includes(t)) s += 4;
    });

    if (phrase && person.includes(phrase)) s += 45;
    if (phrase && label.includes(phrase)) s += 40;
    if (phrase && h.includes(phrase)) s += 20;
    return s;
  }

  function searchData(raw, category = 'All') {
    const terms = expandTerms(raw);
    let list = all.filter(r => category === 'All' || r.category === category);
    if (!terms.length) return { terms, results: list };

    list = list
      .filter(r => matches(r, terms))
      .map(r => ({ r, s: score(r, terms, raw) }))
      .sort((a,b) => b.s - a.s || String(a.r.person).localeCompare(String(b.r.person)) || String(a.r.label).localeCompare(String(b.r.label)))
      .map(x => x.r);

    return { terms, results: list };
  }

  window.SPIRITUS_POSTING_SEARCH = {
    search: (query, category = 'All') => searchData(query, category).results,
    terms: expandTerms,
    totalRecords: all.length
  };

  const input = document.getElementById('postingSearch');
  const clear = document.getElementById('postingClear');
  const filters = document.getElementById('postingFilters');
  const results = document.getElementById('postingResults');
  const count = document.getElementById('postingCount');
  const prompt = document.getElementById('postingPrompt');
  if (!input || !clear || !filters || !results || !count) return;

  let activeCategory = 'All';

  function firstPhone(v) {
    const m = String(v || '').match(/(?:\+234|0)\d{10}/);
    if (!m || forbidden.test(m[0])) return '';
    return m[0].startsWith('0') ? '+234' + m[0].slice(1) : m[0];
  }

  function categoryLabel(c) {
    const map = {
      'Parish Assignment': 'Parish',
      'Apostolic Chaplaincy': 'Apostolic Association'
    };
    return map[c] || c || 'Assignment';
  }

  function roleLabel(r) {
    if (r.category === 'Parish Assignment') return 'Parish Priest / Administrator';
    if (r.category === 'Deanery') return 'Dean';
    if (r.category === 'Institutional Chaplaincy' || r.category === 'Apostolic Chaplaincy') return 'Chaplain';
    return '';
  }

  function highlight(v, terms) {
    let out = escapeHtml(v);
    terms.filter(t => t.length >= 3).sort((a,b) => b.length - a.length).forEach(t => {
      const safe = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      out = out.replace(new RegExp(`(${safe})`, 'ig'), '<mark>$1</mark>');
    });
    return out;
  }

  function buildFilters() {
    const preferred = [
      'All','Parish Assignment','Deanery','Curia','Episcopal Vicar',
      'Priest Assignment','Other Placement','Institution',
      'Institutional Chaplaincy','Apostolic Chaplaincy'
    ];
    const actual = [...new Set(all.map(r => r.category).filter(Boolean))];
    const cats = [
      ...preferred.filter(x => x === 'All' || actual.includes(x)),
      ...actual.filter(x => !preferred.includes(x)).sort()
    ];

    filters.innerHTML = cats.map(c =>
      `<button type="button" class="posting-filter${c === activeCategory ? ' is-active' : ''}" data-category="${escapeHtml(c)}">${escapeHtml(categoryLabel(c))}</button>`
    ).join('');

    filters.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.category || 'All';
        filters.querySelectorAll('button').forEach(b => b.classList.toggle('is-active', b === btn));
        render();
      });
    });
  }

  function card(r, terms) {
    const ph = firstPhone(`${r.person || ''} ${r.details || ''}`);
    const role = roleLabel(r);
    const detailParts = String(r.details || '').split(' · ').filter(Boolean);

    return `<article class="posting-card">
      <div class="posting-card__top">
        <span class="posting-card__category">${escapeHtml(categoryLabel(r.category))}</span>
        <span class="posting-card__source">${r.sourcePage ? `Posting 2026 · p. ${escapeHtml(r.sourcePage)}` : 'Posting 2026'}</span>
      </div>
      <h3 class="posting-card__label">${highlight(r.label || '', terms)}</h3>
      ${r.person ? `<div class="posting-card__person-wrap">
        ${role ? `<span class="posting-card__role">${escapeHtml(role)}</span>` : ''}
        <div class="posting-card__person">${highlight(r.person, terms)}</div>
      </div>` : ''}
      ${detailParts.length ? `<div class="posting-card__details">${detailParts.map(d => `<span>${highlight(d, terms)}</span>`).join('')}</div>` : ''}
      <div class="posting-card__footer">
        ${ph ? `<a class="posting-card__call" href="tel:${escapeHtml(ph)}">📞 Call listed contact</a>` : '<span class="posting-card__no-phone">No direct phone published here</span>'}
      </div>
    </article>`;
  }

  function initialState() {
    count.textContent = `${all.length} verified posting records available`;
    results.innerHTML = `<div class="posting-welcome">
      <div class="posting-welcome__icon">🔎</div>
      <div><strong>Start with a name, parish, office or institution.</strong>
      <p>Examples: <b>Ogbuene</b>, <b>IMT</b>, <b>CWO</b>, <b>Emene Deanery</b>, <b>Ogbete</b>. Titles such as “Fr.” are ignored so they cannot flood your results.</p></div>
    </div>`;
  }

  function render() {
    const raw = input.value.trim();
    const data = searchData(raw, activeCategory);
    const terms = data.terms;
    let list = data.results;

    if (!raw && activeCategory === 'All') {
      initialState();
      if (prompt) prompt.textContent = 'Search by priest, parish, office, institution, chaplaincy or association.';
      return;
    }

    if (!raw && activeCategory !== 'All') {
      list = list.slice().sort((a,b) => String(a.label).localeCompare(String(b.label)));
    }

    if (prompt) {
      prompt.textContent = raw
        ? (terms.length ? `Matching all meaningful terms: ${terms.join(' + ')}` : 'Type a surname, parish, office or institution.')
        : `Browsing ${categoryLabel(activeCategory)} records.`;
    }

    count.textContent = `${list.length} ${list.length === 1 ? 'verified match' : 'verified matches'}`;

    if (!list.length) {
      results.innerHTML = `<div class="posting-empty">
        <div class="posting-empty__icon">🔎</div>
        <strong>No verified 2026 record matched that search.</strong>
        <span>Try a surname, parish, office, institution, deanery or association.</span>
      </div>`;
      return;
    }

    const visible = list.slice(0, 100);
    results.innerHTML = visible.map(r => card(r, terms)).join('') +
      (list.length > visible.length ? `<div class="posting-limit-note">Showing the first ${visible.length} of ${list.length} matches. Add another word to narrow the search.</div>` : '');
  }

  input.addEventListener('input', render);
  clear.addEventListener('click', () => {
    input.value = '';
    activeCategory = 'All';
    buildFilters();
    render();
    input.focus();
  });

  document.querySelectorAll('[data-example]').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.example || '';
      activeCategory = 'All';
      buildFilters();
      render();
      input.focus();
    });
  });

  buildFilters();
  render();
})();
