// Renders choice-flame.html's "Recent Highlights" cards from the shared
// data file — the same array that drives the homepage preview.
(function() {
  const grid = document.getElementById('highlightsGrid');
  const articles = window.CHOICE_FLAME_ARTICLES || [];
  if (!grid) return;

  grid.innerHTML = articles.map(a => `
    <a href="${a.link}" target="_blank" rel="noopener" class="article-card">
      <div class="article-card__img"><span style="position:relative;z-index:1">${a.icon}</span></div>
      <div class="article-card__body">
        <div class="article-card__cat">${a.category}</div>
        <div class="article-card__title">${a.title}</div>
        <div class="article-card__desc">${a.desc}</div>
        <div class="article-card__meta">
          <span>${a.date}</span>
          <span class="article-card__read">View on Facebook →</span>
        </div>
      </div>
    </a>
  `).join('');
})();
