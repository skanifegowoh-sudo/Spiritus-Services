// Render the 2026 parish posting: parish priest / assigned clergy, regular Mass schedule,
// chapel information and Google Maps directions. Source: Catholic Diocese of Enugu — Posting 2026.
(function() {
  const DEANERY_COLORS = {
    'Agbani Deanery': 'cobalt',
    'Aguobu Owa Deanery': 'coral',
    'Emene Deanery': 'jade',
    'Enugu Deanery': 'sun',
    'Nkwo Nike Deanery': 'violet',
    'Udi Deanery': 'teal',
  };

  const MASS = {
    sundayMorning: ['6:00 a.m.', '8:30 a.m.', '10:00 a.m.'],
    sundayEvening: '6:00 p.m.',
    weekdayMorning: '6:00 a.m.',
    weekdayEvening: '6:00 p.m.'
  };

  const container = document.getElementById('directoryContent');
  if (!container || !window.PARISHES_ALL) return;

  const parishes = window.PARISHES_ALL.slice();

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function firstPhone(raw) {
    const m = String(raw || '').match(/(?:\+234|0)\d{10}/);
    if (!m) return '';
    return m[0].startsWith('0') ? '+234' + m[0].slice(1) : m[0];
  }

  function mapQuery(p) {
    const name = String(p.name || '').trim();
    const m = name.match(/^(.*?)\s*\((.*?)\)\s*$/);
    if (m) return `${m[2].trim()} Catholic Church, ${m[1].trim()}, Enugu State, Nigeria`;
    return `${name} Catholic Church, Enugu State, Nigeria`;
  }

  function mapUrl(p) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery(p))}`;
  }

  function renderSchedule() {
    return `<div class="parish-schedule">
      <div class="parish-schedule__title">⛪ Regular Mass Schedule</div>
      <div class="parish-schedule__grid">
        <div><strong>Sunday morning</strong><span>${MASS.sundayMorning.join(' · ')}</span></div>
        <div><strong>Sunday evening</strong><span>${MASS.sundayEvening}</span></div>
        <div><strong>Weekday morning</strong><span>${MASS.weekdayMorning}</span></div>
        <div><strong>Weekday evening</strong><span>${MASS.weekdayEvening}</span></div>
      </div>
      <div class="parish-schedule__chapel">🙏 Chapel: open every day.</div>
      <div class="parish-schedule__note">Mass times may change on special liturgical occasions. For baptisms, weddings, funerals, Mass intentions, appointments, parish societies or other personal enquiries, please contact the parish directly.</div>
    </div>`;
  }

  function renderActions(p) {
    const phone = firstPhone(p.priestPhone);
    const email = String(p.priestEmail || '').trim();
    let html = `<div class="parish-actions">
      <a class="parish-action parish-action--map" href="${escapeHtml(mapUrl(p))}" target="_blank" rel="noopener noreferrer">📍 Google Maps Directions</a>`;
    if (phone) html += `<a class="parish-action" href="tel:${escapeHtml(phone)}">📞 Call Parish Contact</a>`;
    if (email) html += `<a class="parish-action" href="mailto:${escapeHtml(email)}">✉️ Email Parish Contact</a>`;
    if (!phone && !email) html += `<a class="parish-action" href="contact.html">🏛 Chancery Referral</a>`;
    html += `</div><div class="parish-map-note">Google Maps uses the parish name and locality from the 2026 Posting. The 2026 Posting does not provide parish phone/email details, so older 2025 contact numbers are not carried forward. Please contact the parish locally or the Chancery for referral.</div>`;
    return html;
  }

  function renderDetail(p) {
    let rows = '';
    if (p.priest) {
      rows += `<div class="parish-detail__row">
        <span class="parish-detail__label">✝ Parish Priest / Administrator</span>
        <span class="parish-detail__name">${escapeHtml(p.priest)}</span>
      </div>`;
    }
    const assigned = String(p.vicarAssignments || '').trim();
    if (assigned) {
      rows += `<div class="parish-detail__row">
        <span class="parish-detail__label">⛪ Parish Vicars / Assigned Clergy</span>
        <span class="parish-detail__name">${escapeHtml(assigned)}</span>
      </div>`;
    }
    if (!rows) rows = `<div class="parish-detail__row"><span class="parish-detail__label">No clergy assignment is shown for this entry in Posting 2026.</span></div>`;
    if (p.unitType && p.unitType !== 'parish') {
      rows += `<div class="parish-detail__row"><span class="parish-detail__label">📌 Listing type</span><span class="parish-detail__name">${escapeHtml(p.unitType)}</span></div>`;
    }
    return rows + renderSchedule() + renderActions(p);
  }

  function installStyles() {
    if (document.getElementById('parishDirectoryEnhancements')) return;
    const style = document.createElement('style');
    style.id = 'parishDirectoryEnhancements';
    style.textContent = `
      .parish-schedule{margin-top:16px;padding:16px;border-radius:14px;background:#fffaf0;border:1px solid rgba(184,145,43,.22)}
      .parish-schedule__title{font-weight:800;margin-bottom:10px;color:#201A16}
      .parish-schedule__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .parish-schedule__grid>div{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border-radius:10px;background:#fff}
      .parish-schedule__grid strong{font-size:12px;color:#7A2331;text-transform:uppercase;letter-spacing:.04em}
      .parish-schedule__grid span{font-size:14px;color:#362C24}
      .parish-schedule__chapel{margin-top:10px;font-weight:700;color:#1E5631}
      .parish-schedule__note,.parish-map-note{margin-top:8px;font-size:12px;line-height:1.5;color:#6d665d}
      .parish-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
      .parish-action{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 12px;border-radius:999px;background:#f3eee4;color:#201A16;font-size:13px;font-weight:700;text-decoration:none}
      .parish-action--map{background:#1E5631;color:white}
      .parish-action:hover{transform:translateY(-1px)}
      @media(max-width:640px){.parish-schedule__grid{grid-template-columns:1fr}.parish-action{width:100%}}
    `;
    document.head.appendChild(style);
  }

  installStyles();

  let html = '<div class="parish-grid" id="parishGrid">';
  parishes.forEach((p, i) => {
    const vicarNames = p.vicarAssignments || (p.vicars || []).map(v => v.name).join(' ');
    const searchable = (p.name + ' ' + p.deanery + ' ' + p.priest + ' ' + vicarNames).toLowerCase();
    const color = DEANERY_COLORS[p.deanery] || 'cobalt';
    html += `<div class="parish-item parish-item--clickable" data-deanery="${escapeHtml(p.deanery)}" data-name="${escapeHtml(searchable)}" data-idx="${i}">
      <div class="parish-item__num">${String(i + 1).padStart(3, '0')}</div>
      <div class="parish-item__name">${escapeHtml(p.name)}</div>
      <div class="parish-item__meta">
        <span class="parish-item__tag parish-item__tag--${color}">${escapeHtml(p.deanery.replace(' Deanery',''))}</span>
        <span class="parish-item__chevron">▾ 2026 clergy · Mass times · directions</span>
      </div>
      <div class="parish-item__detail">${renderDetail(p)}</div>
    </div>`;
  });
  html += '</div>';
  container.innerHTML = html;

  document.querySelectorAll('.parish-item--clickable').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('a,button,input,select,textarea')) return;
      item.classList.toggle('parish-item--open');
    });
  });

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
  if (search) search.addEventListener('input', (e) => {
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
