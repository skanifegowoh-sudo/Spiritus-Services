// Renders the homepage's "Latest from the Diocese" cards from the same
// data used on choice-flame.html, so the two never fall out of sync.
(function() {
  const grid = document.getElementById('homeNewsGrid');
  const articles = window.CHOICE_FLAME_ARTICLES || [];
  if (!grid) return;

  const variants = ['cobalt', 'coral', 'jade'];

  // Evergreen items (like the daily Gospel) don't count as "latest news" —
  // the newest dated items are the last 3 non-pinned entries in the array.
  const latest = articles.filter(a => !a.pinned).slice(-3).reverse();

  grid.innerHTML = latest.map((a, i) => `
    <article class="news-card news-card--${variants[i % variants.length]}">
      <div class="news-card__thumb">${a.icon}</div>
      <div class="news-card__body">
        <span class="news-card__tag">${a.category} · ${a.date}</span>
        <h3 class="news-card__title">${a.title}</h3>
        <p class="news-card__excerpt">${a.desc}</p>
        <a href="choice-flame.html" class="news-card__link">Read more →</a>
      </div>
    </article>
  `).join('');
})();
