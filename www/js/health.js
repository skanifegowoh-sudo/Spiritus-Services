// Health Services page — lets a tap on any centre card pre-fill the shared
// request form below, and shows that centre's real contact info (or the
// Diocesan Health Office fallback when no direct number/email is listed).
(function() {
  const centres = window.HEALTH_CENTRES || [];
  const general = window.HEALTH_GENERAL_CONTACT || {};
  const select = document.getElementById('healthCentreSelect');
  const panel = document.getElementById('healthContactPanel');
  const nameInput = document.getElementById('healthNameInput');
  const requestSection = document.getElementById('request');

  if (!select) return;

  // Build the dropdown, grouped exactly like the page's own sections.
  const categories = ["Hospitals", "Maternity & Medical Centres", "Care Homes"];
  categories.forEach(cat => {
    const group = document.createElement('optgroup');
    group.label = cat;
    centres.filter(c => c.category === cat).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = c.name;
      group.appendChild(opt);
    });
    select.appendChild(group);
  });

  function findCentre(name) {
    return centres.find(c => c.name === name);
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function updateContactPanel() {
    const centre = findCentre(select.value);
    if (!panel) return;

    if (!centre) {
      panel.innerHTML = 'Select a centre to see the fastest way to reach them.';
      return;
    }

    if (centre.phone || centre.email) {
      let actions = '';
      if (centre.phone) actions += `<a href="tel:${centre.phone}" class="btn btn--jade btn--sm">📞 Call ${escapeHtml(centre.phone)}</a>`;
      if (centre.email) actions += `<a href="mailto:${centre.email}" class="btn btn--cobalt btn--sm">✉️ Email directly</a>`;
      panel.innerHTML = `<strong>${escapeHtml(centre.name)}</strong> has a direct contact listed in the Diocesan Directory — feel free to reach them straight away.<div class="health-contact-panel__actions">${actions}</div>`;
    } else {
      panel.innerHTML = `<strong>${escapeHtml(centre.name)}</strong> doesn't have a direct number or email listed in the Diocesan Directory. Submit the form and your request will be forwarded to the ${escapeHtml(general.label)}, or reach them directly now.<div class="health-contact-panel__actions"><a href="tel:${general.phone}" class="btn btn--jade btn--sm">📞 Call ${escapeHtml(general.phone)}</a><a href="mailto:${general.email}" class="btn btn--cobalt btn--sm">✉️ Email ${escapeHtml(general.label)}</a></div>`;
    }
  }
  window.updateHealthContactPanel = updateContactPanel;

  function selectCentre(name) {
    let matched = false;
    for (const opt of select.options) {
      if (opt.value === name) {
        select.value = opt.value;
        matched = true;
        break;
      }
    }
    if (!matched && name) {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      opt.selected = true;
      select.appendChild(opt);
    }
    select.classList.add('form-select--flash');
    setTimeout(() => select.classList.remove('form-select--flash'), 900);
    updateContactPanel();
  }

  function goToRequest(name) {
    selectCentre(name);
    if (requestSection) requestSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (nameInput) setTimeout(() => nameInput.focus({ preventScroll: true }), 500);
  }

  document.querySelectorAll('[data-centre]').forEach(card => {
    card.addEventListener('click', () => goToRequest(card.dataset.centre));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToRequest(card.dataset.centre);
      }
    });
  });

  select.addEventListener('change', updateContactPanel);

  window.handleHealthRequestSubmit = function() {
    const centre = findCentre(select.value);
    if (centre && (centre.phone || centre.email)) {
      alert(`Thank you! Your request has been sent to ${centre.name}. For a faster response, you can also reach them directly using the contact shown above.`);
    } else if (centre) {
      alert(`Thank you! Since ${centre.name} has no direct contact on file, your request has been forwarded to the ${general.label}, who will connect you.`);
    } else {
      alert('Thank you! Your request has been received.');
    }
  };
})();
