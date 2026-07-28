// Make every service card (available + coming soon) clickable — jumps to the
// booking form and pre-selects the matching service in the dropdown.
(function() {
  const select = document.getElementById('serviceSelect');
  const nameInput = document.getElementById('fullNameInput');
  const bookSection = document.getElementById('book');

  function selectService(serviceName) {
    if (!select) return;
    let matched = false;
    for (const opt of select.options) {
      if (opt.value === serviceName || opt.textContent.trim() === serviceName) {
        select.value = opt.value;
        matched = true;
        break;
      }
    }
    if (!matched && serviceName) {
      // fallback: add it as a temporary option so the choice is never lost
      const opt = document.createElement('option');
      opt.value = serviceName;
      opt.textContent = serviceName;
      opt.selected = true;
      select.appendChild(opt);
    }
    // brief highlight so it's obvious the field was filled in
    select.classList.add('form-select--flash');
    setTimeout(() => select.classList.remove('form-select--flash'), 900);
  }

  function goToBooking(serviceName) {
    selectService(serviceName);
    if (bookSection) {
      bookSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (nameInput) {
      setTimeout(() => nameInput.focus({ preventScroll: true }), 500);
    }
  }

  document.querySelectorAll('.svc-card[data-service]').forEach(card => {
    card.addEventListener('click', () => goToBooking(card.dataset.service));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToBooking(card.dataset.service);
      }
    });
  });
})();
