(() => {
  'use strict';

  if (window.__SPIRITUS_ASSISTANT_V4__) return;
  window.__SPIRITUS_ASSISTANT_V4__ = true;

  const DATASETS = [
    ['SPIRITUS_KNOWLEDGE', 'js/spiritus-knowledge.js'],
    ['POSTING_2026', 'js/posting-2026-data.js'],
    ['PARISHES_ALL', 'js/parishes-data.js'],
    ['SCHOOLS', 'js/schools-data.js'],
    ['HEALTH_CENTRES', 'js/health-data.js']
  ];

  let K = null;
  let panel, messages, input, micButton, soundButton;
  let recognition = null;
  let speakEnabled = false;
  let canSpeak = false;

  const state = {
    selectedParish: null,
    selectedSchool: null,
    selectedHealth: null,
    lastIntent: null,
    awaiting: null
  };

  const genericParishWords = new Set([
    'find','locate','show','search','looking','look','parish','parishes','church','churches','catholic',
    'mass','masses','time','times','schedule','sunday','weekday','morning','evening','chapel','open',
    'direction','directions','map','maps','google','route','get','there','priest','father','rev','reverend',
    'contact','phone','number','email','call','please','need','want','which','where','what','who','how','is',
    'the','a','an','of','to','in','at','on','for','me','my','i','you','your'
  ]);

  const genericSchoolWords = new Set([
    'find','show','school','schools','college','university','education','institution','institutions',
    'where','what','which','the','a','an','of','to','in','at','for','me','my','i','please'
  ]);

  const genericHealthWords = new Set([
    'find','show','hospital','hospitals','health','centre','center','centres','centers','clinic','clinics',
    'maternity','medical','care','home','homes','where','what','which','the','a','an','of','to','in','at','for','me','my','i','please'
  ]);

  const genericPostingWords = new Set([
    'who','what','which','where','is','are','the','a','an','of','to','in','at','for','me','my','i','please',
    'current','2026','posting','catholic','diocese','enugu','fr','rev','reverend','father','most','very'
  ]);

  function loadScript(globalName, src) {
    if (window[globalName]) return Promise.resolve();
    return new Promise((resolve) => {
      const already = [...document.scripts].find(s => (s.getAttribute('src') || '').split('?')[0].endsWith(src));
      if (already) {
        if (window[globalName]) return resolve();
        already.addEventListener('load', resolve, { once: true });
        already.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 1800);
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  const dataReady = Promise.all(DATASETS.map(([g, src]) => loadScript(g, src))).then(() => {
    K = window.SPIRITUS_KNOWLEDGE || {};
  });

  function normalise(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function words(value) {
    return normalise(value).split(' ').filter(Boolean);
  }

  function significantWords(value, stopSet) {
    return words(value).filter(w => w.length > 1 && !stopSet.has(w));
  }

  function exactishScore(queryTerms, haystack, originalQuery = '') {
    const h = ` ${normalise(haystack)} `;
    let score = 0;
    for (const term of queryTerms) {
      if (h.includes(` ${term} `)) score += term.length >= 5 ? 8 : 5;
      else if (h.includes(term)) score += term.length >= 5 ? 4 : 2;
    }
    const nq = normalise(originalQuery);
    if (nq.length >= 4 && normalise(haystack).includes(nq)) score += 20;
    return score;
  }

  function firstPhone(raw) {
    const text = String(raw || '');
    const m = text.match(/(?:\+234|0)\d{10}/);
    if (!m) return '';
    return m[0].startsWith('0') ? '+234' + m[0].slice(1) : m[0];
  }

  function telAction(label, phone) {
    return { type: 'link', label, href: `tel:${phone}`, kind: 'call' };
  }

  function linkAction(label, href) {
    return { type: 'link', label, href, kind: 'link' };
  }

  function promptAction(label, prompt, kind = 'prompt') {
    return { type: 'prompt', label, prompt, kind };
  }

  function parishMapQuery(parish) {
    const name = String(parish?.name || '').trim();
    const m = name.match(/^(.*?)\s*\((.*?)\)\s*$/);
    if (m) {
      return `${m[2].trim()} Catholic Church, ${m[1].trim()}, Enugu State, Nigeria`;
    }
    return `${name}, Catholic Church, Enugu State, Nigeria`;
  }

  function parishMapUrl(parish) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(parishMapQuery(parish))}`;
  }

  function massText(parishName = '') {
    const s = K.parishSchedule;
    const prefix = parishName ? `Regular Mass schedule for ${parishName}: ` : 'Regular parish Mass schedule: ';
    return `${prefix}Sunday Masses at ${s.sundayMorning.join(', ')}; Sunday evening Mass at ${s.sundayEvening}; weekday Masses at ${s.weekdayMorning} and ${s.weekdayEvening}. ${s.chapel} ${s.caution}`;
  }

  function parishSummary(parish) {
    const bits = [`${parish.name} is in ${parish.deanery}.`];
    if (parish.priest) bits.push(`2026 parish priest / administrator: ${parish.priest}.`);
    if (parish.vicarAssignments) bits.push(`2026 parish vicars / assigned clergy: ${parish.vicarAssignments}.`);
    if (parish.priestPhone) bits.push(`Listed parish contact: ${parish.priestPhone}.`);
    if (parish.priestEmail) bits.push(`Email: ${parish.priestEmail}.`);
    if (!parish.priestPhone && !parish.priestEmail) bits.push('Posting 2026 does not give a direct parish phone or email for this entry.');
    return bits.join(' ');
  }

  function parishActions(parish) {
    const out = [
      promptAction('🕊️ Mass Times', `Mass times for ${parish.name}`),
      linkAction('📍 Directions', parishMapUrl(parish))
    ];
    const phone = firstPhone(parish.priestPhone);
    if (phone) out.push(telAction('📞 Call Parish', phone));
    if (parish.priestEmail) out.push(linkAction('✉️ Email Parish', `mailto:${parish.priestEmail}`));
    out.push(linkAction('⛪ Directory', 'directory.html'));
    return out;
  }

  function flattenSchools() {
    const out = [];
    const schools = window.SCHOOLS || {};
    Object.entries(schools).forEach(([category, list]) => {
      if (!Array.isArray(list)) return;
      list.forEach(item => out.push({ ...item, category }));
    });
    return out;
  }

  function findParishCandidates(raw) {
    const terms = significantWords(raw, genericParishWords);
    if (!terms.length) return [];

    return (window.PARISHES_ALL || [])
      .map(p => {
        const locality = String(p.name || '').replace(/\([^)]*\)/g, ' ');
        const hay = [p.name, locality, p.deanery, p.priest, p.priestEmail, p.priestPhone, p.vicarAssignments,
          ...(p.vicars || []).map(v => `${v.name} ${v.phone || ''} ${v.email || ''}`)
        ].join(' ');
        let score = exactishScore(terms, hay, raw);

        // Prefer locality/church-name matches over generic clergy words.
        const nName = normalise(p.name);
        for (const term of terms) {
          if (nName.includes(term)) score += 5;
        }
        return { item: p, score };
      })
      .filter(x => x.score >= 5)
      .sort((a, b) => b.score - a.score);
  }

  function findSchoolCandidates(raw) {
    const terms = significantWords(raw, genericSchoolWords);
    if (!terms.length) return [];
    return flattenSchools()
      .map(s => ({
        item: s,
        score: exactishScore(terms, [s.name, s.location, s.head, s.category].join(' '), raw)
      }))
      .filter(x => x.score >= 5)
      .sort((a, b) => b.score - a.score);
  }

  function findHealthCandidates(raw) {
    const terms = significantWords(raw, genericHealthWords);
    if (!terms.length) return [];
    return (window.HEALTH_CENTRES || [])
      .map(h => ({
        item: h,
        score: exactishScore(terms, [h.name, h.category, h.phone, h.email].join(' '), raw)
      }))
      .filter(x => x.score >= 5)
      .sort((a, b) => b.score - a.score);
  }


  function findPostingCandidates(raw) {
    const terms = significantWords(raw, genericPostingWords);
    if (!terms.length) return [];
    const records = window.POSTING_2026?.searchRecords || [];
    return records
      .map(r => ({
        item: r,
        score: exactishScore(terms, [r.category, r.label, r.person, r.details].join(' '), raw)
      }))
      .filter(x => x.score >= 8)
      .sort((a, b) => b.score - a.score);
  }

  function postingChoiceResponse(candidates) {
    if (!candidates.length) return null;
    if (uniqueEnough(candidates)) {
      const r = candidates[0].item;
      return {
        text: `${r.label}: ${r.person}${r.details && normalise(r.details) !== normalise(r.label) ? `. ${r.details}.` : '.'} Source: Posting 2026.`,
        actions: [promptAction('☰ Help Menu', 'Help')]
      };
    }
    return {
      text: 'I found several 2026 posting records that may match. Please choose one:',
      actions: candidates.slice(0, 5).map(x =>
        promptAction(`📋 ${x.item.label} — ${x.item.person}`, `2026 posting: ${x.item.label} ${x.item.person}`)
      )
    };
  }

  function uniqueEnough(candidates) {
    if (!candidates.length) return false;
    if (candidates.length === 1) return true;
    return candidates[0].score >= candidates[1].score + 7;
  }

  function parishChoiceResponse(candidates, raw) {
    if (!candidates.length) {
      state.awaiting = 'parish';
      return {
        text: 'I could not identify a parish from that. Please type the parish name, town, deanery, or priest name. I will not choose one at random.',
        actions: [linkAction('⛪ Open Parish Directory', 'directory.html')]
      };
    }

    if (uniqueEnough(candidates)) {
      const p = candidates[0].item;
      state.selectedParish = p;
      state.awaiting = null;
      return {
        text: parishSummary(p),
        actions: parishActions(p)
      };
    }

    const top = candidates.slice(0, 5);
    state.awaiting = 'parish';
    return {
      text: 'I found more than one possible parish. Please choose the one you mean:',
      actions: top.map(x => promptAction(`⛪ ${x.item.name}`, `Select parish: ${x.item.name}`))
    };
  }

  function schoolChoiceResponse(candidates) {
    if (!candidates.length) {
      state.awaiting = 'school';
      return {
        text: 'Please give me the school name or location. I will search the diocesan Schools Directory.',
        actions: [linkAction('🎓 Open Schools Directory', 'schools.html')]
      };
    }
    if (!uniqueEnough(candidates)) {
      return {
        text: 'I found several possible schools. Choose one:',
        actions: candidates.slice(0, 5).map(x => promptAction(`🎓 ${x.item.name}`, `School details: ${x.item.name}`))
      };
    }
    const s = candidates[0].item;
    state.selectedSchool = s;
    state.awaiting = null;
    return {
      text: `${s.name}${s.location ? `. Location: ${s.location}` : ''}${s.head ? `. Head: ${s.head}` : ''}.`,
      actions: [linkAction('🎓 Schools Directory', 'schools.html')]
    };
  }

  function healthChoiceResponse(candidates) {
    if (!candidates.length) {
      state.awaiting = 'health';
      return {
        text: 'Please give me the hospital, maternity centre, clinic or care-home name. I will search the diocesan Health Directory.',
        actions: [linkAction('🏥 Open Health Directory', 'health.html')]
      };
    }
    if (!uniqueEnough(candidates)) {
      return {
        text: 'I found several possible health facilities. Choose one:',
        actions: candidates.slice(0, 5).map(x => promptAction(`🏥 ${x.item.name}`, `Health facility details: ${x.item.name}`))
      };
    }
    const h = candidates[0].item;
    state.selectedHealth = h;
    state.awaiting = null;
    const direct = h.phone ? ` Listed phone: ${h.phone}.` : ` No direct phone is listed in the current directory; the Chancery can help with referral.`;
    return {
      text: `${h.name} — ${h.category}.${direct}`,
      actions: [
        ...(h.phone ? [telAction('📞 Call Facility', firstPhone(h.phone) || h.phone)] : []),
        linkAction('🏥 Health Directory', 'health.html'),
        telAction('🏛 Call Chancery', K.contacts.chancery.phone)
      ]
    };
  }

  function faqScore(raw, faq) {
    const q = normalise(raw);
    let best = 0;
    for (const trigger of faq.triggers || []) {
      const t = normalise(trigger);
      if (!t) continue;
      if (q === t) best = Math.max(best, 100);
      else if (q.includes(t)) best = Math.max(best, 70 + Math.min(20, t.length));
      else {
        const qt = new Set(words(q));
        const tt = words(t);
        const overlap = tt.filter(x => qt.has(x)).length;
        if (overlap) best = Math.max(best, overlap * 10);
      }
    }
    return best;
  }

  function findFAQ(raw) {
    const ranked = (K.faq || []).map(f => ({ faq: f, score: faqScore(raw, f) }))
      .sort((a, b) => b.score - a.score);
    return ranked[0]?.score >= 20 ? ranked[0].faq : null;
  }

  function faqResponse(faq) {
    const actions = [];
    if (faq.id === 'find_parish') actions.push(promptAction('⛪ Find by name/town', 'I want to find a parish'));
    if (faq.id === 'mass_times') actions.push(promptAction('⛪ Choose parish', 'I need Mass times for a parish'));
    if (['baptism','marriage','funeral','mass_intention','confession'].includes(faq.id)) {
      actions.push(promptAction('⛪ Find my parish', 'I need to find my parish'));
      actions.push(telAction('🏛 Call Chancery', K.contacts.chancery.phone));
    }
    if (faq.id === 'chancery') {
      actions.push(telAction('📞 Call Chancery', K.contacts.chancery.phone));
      actions.push(linkAction('✉️ Contact Page', 'contact.html'));
    }
    if (faq.id === 'emergency') {
      actions.push(telAction('🚨 Chancery / Works', K.contacts.chancery.phone));
      actions.push(telAction('🙏 Pastoral Emergency', K.contacts.pastoralEmergency.phone));
    }
    if (faq.id === 'schools') actions.push(linkAction('🎓 Schools Directory', 'schools.html'));
    if (faq.id === 'health') actions.push(linkAction('🏥 Health Directory', 'health.html'));
    if (faq.id === 'works') actions.push(linkAction('🔧 Services', 'services.html'));
    if (['retreat','pilgrimage','prayer','counselling','vocational'].includes(faq.id)) actions.push(linkAction('🕊 Faith & Formation', 'faith-formation.html'));
    if (faq.id === 'choice_flame') actions.push(linkAction('📰 Choice Flame', 'choice-flame.html'));
    if (faq.id === 'notices') actions.push(linkAction('📢 Current Notices', 'announcements.html'));
    if (['bishop','chancellor','history'].includes(faq.id)) actions.push(linkAction('✝ About Diocese', 'about.html'));
    return { text: faq.answer, actions };
  }

  function faithCentreResponse(type) {
    const labels = {
      retreat: 'Retreat centres',
      pilgrimage: 'Pilgrimage centres',
      prayer: 'Prayer ministries',
      pastoral: 'Pastoral and counselling centres',
      vocational: 'Vocational centres'
    };
    const list = (K.faithCentres || []).filter(x => x.type === type);
    if (!list.length) return null;
    const text = `${labels[type]} listed on the portal:\n` + list.map(x => `• ${x.name} — ${x.location}`).join('\n');
    return { text, actions: [linkAction('🕊 Faith & Formation', 'faith-formation.html')] };
  }

  function helpMenu() {
    state.awaiting = null;
    return {
      text: 'What would you like help with? Choose a topic or type your question.',
      actions: [
        promptAction('⛪ Parishes', 'Parish help'),
        promptAction('🕊 Mass Times', 'Mass times'),
        promptAction('📍 Directions', 'Directions to a parish'),
        promptAction('✝ Sacraments', 'Sacrament help'),
        promptAction('🏛 Chancery', 'Chancery information'),
        promptAction('🎓 Schools', 'School help'),
        promptAction('🏥 Health', 'Health facilities'),
        promptAction('🙏 Faith & Formation', 'Faith and formation'),
        promptAction('🔧 Services', 'Spiritus Sanctus Works services'),
        promptAction('📰 News', 'Choice Flame and notices')
      ]
    };
  }

  function parishMenu() {
    state.awaiting = 'parish';
    return {
      text: 'For parish help, type a parish name, town, deanery or priest name. You can then ask for Mass times, directions, the parish priest, phone or email.',
      actions: [
        linkAction('⛪ Open Parish Directory', 'directory.html'),
        promptAction('🕊 Regular Mass Schedule', 'What is the regular parish Mass schedule?')
      ]
    };
  }

  function sacramentMenu() {
    return {
      text: 'Choose the kind of sacramental or pastoral enquiry. Parish-specific requirements must be confirmed directly with the parish.',
      actions: [
        promptAction('👶 Baptism', 'How do I arrange a baptism?'),
        promptAction('💍 Marriage', 'How do I arrange a Catholic marriage?'),
        promptAction('🕯 Funeral', 'How do I arrange a funeral Mass?'),
        promptAction('🙏 Mass Intention', 'How do I book a Mass intention?'),
        promptAction('✝ Confession', 'When is Confession?')
      ]
    };
  }

  function faithMenu() {
    return {
      text: 'Faith & Formation includes retreats, pilgrimage centres, prayer ministries, pastoral/counselling centres and vocational centres.',
      actions: [
        promptAction('🕊 Retreats', 'Show retreat centres'),
        promptAction('⛪ Pilgrimage', 'Show pilgrimage centres'),
        promptAction('🙏 Prayer Ministries', 'Show prayer ministries'),
        promptAction('💬 Counselling', 'Show pastoral and counselling centres'),
        promptAction('🛠 Vocational', 'Show vocational centres')
      ]
    };
  }

  function newsMenu() {
    return {
      text: 'You can open The Choice Flame for diocesan news and its Facebook feed, or open Notices for current official diocesan announcements.',
      actions: [
        linkAction('📰 Choice Flame', 'choice-flame.html'),
        linkAction('📢 Notices', 'announcements.html')
      ]
    };
  }

  function selectedParishFollowup(q) {
    const p = state.selectedParish;
    if (!p) return null;

    if (/mass|sunday|weekday|morning|evening|chapel/.test(q)) {
      state.lastIntent = 'mass';
      return { text: massText(p.name), actions: parishActions(p) };
    }
    if (/direction|directions|map|maps|route|locate|location|get there/.test(q)) {
      state.lastIntent = 'directions';
      return {
        text: `Opening Google Maps directions for ${p.name}. The destination is generated from the parish name and locality in the diocesan directory; please confirm the pin with the parish if needed.`,
        actions: [linkAction('📍 Open Google Maps', parishMapUrl(p)), ...parishActions(p).filter(a => a.label !== '📍 Directions')]
      };
    }
    if (/priest|father|pastor/.test(q)) {
      return { text: p.priest ? `The listed parish priest of ${p.name} is ${p.priest}.` : `No parish-priest name is currently listed for ${p.name}.`, actions: parishActions(p) };
    }
    if (/vicar|assistant|curate|assigned clergy|other priest|other priests/.test(q)) {
      return {
        text: p.vicarAssignments ? `The 2026 Posting lists these parish vicars / assigned clergy for ${p.name}: ${p.vicarAssignments}.` : `The 2026 Posting does not list a parish vicar or additional assigned clergy for ${p.name}.`,
        actions: parishActions(p)
      };
    }
    if (/phone|number|call|contact/.test(q)) {
      const phone = firstPhone(p.priestPhone);
      return {
        text: p.priestPhone ? `The listed parish contact for ${p.name} is ${p.priestPhone}.` : `Posting 2026 does not provide a direct parish phone for ${p.name}. Please contact the parish locally or use the Chancery for referral.`,
        actions: phone ? [telAction('📞 Call Parish', phone), ...parishActions(p).filter(a => !a.label.includes('Call Parish'))] : [telAction('🏛 Call Chancery', K.contacts.chancery.phone), linkAction('⛪ Directory', 'directory.html')]
      };
    }
    if (/email/.test(q)) {
      return {
        text: p.priestEmail ? `The listed parish email for ${p.name} is ${p.priestEmail}.` : `Posting 2026 does not provide a parish email for ${p.name}.`,
        actions: p.priestEmail ? [linkAction('✉️ Email Parish', `mailto:${p.priestEmail}`)] : [telAction('🏛 Call Chancery', K.contacts.chancery.phone)]
      };
    }
    return null;
  }

  function genericSelectionPrompt(kind) {
    if (kind === 'parish') return parishMenu();
    if (kind === 'school') return { text: 'Please type the school name or location.', actions: [linkAction('🎓 Schools Directory', 'schools.html')] };
    if (kind === 'health') return { text: 'Please type the facility name or category.', actions: [linkAction('🏥 Health Directory', 'health.html')] };
    return null;
  }

  async function respond(raw) {
    await dataReady;
    const original = String(raw || '').trim();
    const q = normalise(original);
    if (!q) return null;

    if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/.test(q)) {
      return helpMenu();
    }

    if (/^(help|menu|start over|restart|home|what can you do)$/.test(q)) {
      state.selectedParish = null;
      state.selectedSchool = null;
      state.selectedHealth = null;
      return helpMenu();
    }

    // Handle explicit selection from candidate chips.
    const selectedParishName = original.match(/^Select parish:\s*(.+)$/i)?.[1];
    if (selectedParishName) {
      const p = (window.PARISHES_ALL || []).find(x => normalise(x.name) === normalise(selectedParishName));
      if (p) {
        state.selectedParish = p;
        state.awaiting = null;
        return { text: parishSummary(p), actions: parishActions(p) };
      }
    }

    // Guided menu triggers come before fuzzy matching.
    if (/^(parish help|find a parish|i want to find a parish|i need to find my parish)$/.test(q)) return parishMenu();
    if (/^(sacrament help|sacraments|sacramental help)$/.test(q)) return sacramentMenu();
    if (/^(faith and formation|faith formation)$/.test(q)) return faithMenu();
    if (/^(choice flame and notices|news)$/.test(q)) return newsMenu();
    if (/^(school help|schools)$/.test(q)) return genericSelectionPrompt('school');
    if (/^(health facilities|health)$/.test(q)) return genericSelectionPrompt('health');

    // Generic Mass/directions questions must not select a random parish.
    if (/^(mass times|directions to a parish|directions|find directions)$/.test(q)) {
      if (state.selectedParish) return selectedParishFollowup(q);
      state.awaiting = 'parish';
      return {
        text: q.startsWith('mass') ? `${massText()} If you want parish-specific contact details or directions, tell me the parish name.` : 'Which parish do you want directions to? Please type the parish name or town.',
        actions: [linkAction('⛪ Parish Directory', 'directory.html')]
      };
    }

    // If a parish is already selected, natural follow-ups use it.
    const contextual = selectedParishFollowup(q);
    if (contextual && significantWords(q, genericParishWords).length === 0) return contextual;
    if (contextual && /^(what about|and|also|its|the|their|when|where|who|phone|email|mass|sunday|weekday|morning|evening|chapel|direction|directions|priest|contact)/.test(q)) return contextual;

    // If awaiting a specific entity, treat free text as the requested selector.
    if (state.awaiting === 'parish') {
      const c = findParishCandidates(original);
      if (c.length) return parishChoiceResponse(c, original);
    }
    if (state.awaiting === 'school') {
      const c = findSchoolCandidates(original);
      if (c.length) return schoolChoiceResponse(c);
    }
    if (state.awaiting === 'health') {
      const c = findHealthCandidates(original);
      if (c.length) return healthChoiceResponse(c);
    }

    // Specific parish intents.
    if (/parish|church|priest|deanery|father|rev|mass|chapel|direction|directions|maps|locate|location/.test(q)) {
      const c = findParishCandidates(original);

      if (c.length) {
        const result = parishChoiceResponse(c, original);
        // If query explicitly asks for a follow-up property and one parish is clear, answer that property.
        if (state.selectedParish && uniqueEnough(c)) {
          const p = state.selectedParish;
          if (/mass|sunday|weekday|morning|evening|chapel/.test(q)) return { text: massText(p.name), actions: parishActions(p) };
          if (/direction|directions|map|maps|route|locate|location/.test(q)) {
            return { text: `Here are Google Maps directions to ${p.name}.`, actions: parishActions(p) };
          }
          if (/priest|father/.test(q)) return { text: p.priest ? `The 2026 parish priest / administrator of ${p.name} is ${p.priest}.` : `No parish-priest name is shown for ${p.name} in Posting 2026.`, actions: parishActions(p) };
          if (/vicar|assistant|curate|assigned clergy/.test(q)) return { text: p.vicarAssignments ? `The 2026 Posting lists these parish vicars / assigned clergy for ${p.name}: ${p.vicarAssignments}.` : `No parish vicar or additional assigned clergy is listed for ${p.name} in Posting 2026.`, actions: parishActions(p) };
        }
        return result;
      }

      // Only ask for a parish when the query is parish-related and no meaningful entity matched.
      if (/parish|church|mass|chapel|direction|directions|maps|priest/.test(q)) return parishMenu();
    }

    // Specific school / health entity searches.
    if (/school|college|university|education|institute/.test(q)) {
      const c = findSchoolCandidates(original);
      if (c.length) return schoolChoiceResponse(c);
      return genericSelectionPrompt('school');
    }

    if (/hospital|clinic|maternity|health|care home|medical centre|medical center/.test(q)) {
      const c = findHealthCandidates(original);
      if (c.length) return healthChoiceResponse(c);
      return genericSelectionPrompt('health');
    }

    // Faith-centre direct lookups.
    if (/retreat/.test(q)) return faithCentreResponse('retreat');
    if (/pilgrimage|awhum|ugwogo/.test(q)) return faithCentreResponse('pilgrimage');
    if (/prayer ministr|adoration|upper room/.test(q)) return faithCentreResponse('prayer');
    if (/counsell|counsel|therapeutic|pastoral centre|pastoral center/.test(q)) return faithCentreResponse('pastoral');
    if (/vocational|skill centre|skill center|technical training/.test(q)) return faithCentreResponse('vocational');

    // Role/person lookups from the diocesan Posting 2026.
    if (/\b(who|dean|vicar|chancellor|secretary|administrator|director|chaplain|rector|tribunal|exorc|bursar|auditor|procurator|communications|vocations|assignment|assigned|posting|cwo|cmo|cyon|nfcs|choice flame)\b/.test(q)) {
      const postingMatches = findPostingCandidates(original);
      if (postingMatches.length) return postingChoiceResponse(postingMatches);
    }

    // FAQ/facts.
    const faq = findFAQ(original);
    if (faq) return faqResponse(faq);

    // Simple diocesan fact questions.
    if (/how many parishes/.test(q)) return { text: `The 2026 Posting headings declare ${K.diocese.parishes} parishes across ${K.diocese.deaneries} deaneries. The posting tables also contain additional outstation/work-up/pastoral listings, which are searchable in the directory.`, actions: [linkAction('⛪ Parish Directory', 'directory.html')] };
    if (/how many priests/.test(q)) return { text: `The portal lists ${K.diocese.diocesanPriests} diocesan priests.`, actions: [linkAction('✝ About Diocese', 'about.html')] };
    if (/seminarian/.test(q)) return { text: `The portal lists ${K.diocese.majorSeminarians} major seminarians and ${K.diocese.minorSeminarians} minor seminarians.`, actions: [linkAction('✝ About Diocese', 'about.html')] };

    return {
      text: `I could not verify that from the diocesan information currently configured for me. I will not guess. Choose a help topic, search the portal, or contact the Chancery on ${K.contacts.chancery.phoneDisplay}.`,
      actions: [
        promptAction('☰ Help Menu', 'Help'),
        linkAction('⛪ Parish Directory', 'directory.html'),
        linkAction('✉️ Contact', 'contact.html'),
        telAction('📞 Call Chancery', K.contacts.chancery.phone)
      ]
    };
  }

  function addMessage(text, who = 'assistant', actions = []) {
    const wrap = document.createElement('div');
    wrap.className = `spiritus-msg spiritus-msg--${who}`;

    const bubble = document.createElement('div');
    bubble.className = 'spiritus-msg__bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);

    if (actions?.length) {
      const row = document.createElement('div');
      row.className = 'spiritus-msg__actions';

      actions.forEach(action => {
        if (action.type === 'prompt') {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = `spiritus-action spiritus-action--${action.kind || 'prompt'}`;
          b.textContent = action.label;
          b.addEventListener('click', () => submit(action.prompt));
          row.appendChild(b);
        } else {
          const a = document.createElement('a');
          a.className = `spiritus-action spiritus-action--${action.kind || 'link'}`;
          a.href = action.href;
          a.textContent = action.label;
          if (/^https?:/i.test(action.href)) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
          }
          row.appendChild(a);
        }
      });
      wrap.appendChild(row);
    }

    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;

    if (who === 'assistant' && speakEnabled && canSpeak) speak(text);
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text).replace(/\+234/g, 'plus two three four'));
    utterance.lang = 'en-NG';
    utterance.rate = 0.97;
    window.speechSynthesis.speak(utterance);
  }

  async function submit(text) {
    const clean = String(text || '').trim();
    if (!clean) return;
    addMessage(clean, 'user');
    input.value = '';

    const typing = document.createElement('div');
    typing.className = 'spiritus-typing';
    typing.textContent = 'Spiritus is checking verified diocesan information…';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    try {
      const result = await respond(clean);
      typing.remove();
      if (result) addMessage(result.text, 'assistant', result.actions || []);
    } catch (err) {
      console.error('Spiritus Assistant error:', err);
      typing.remove();
      const phone = window.SPIRITUS_KNOWLEDGE?.contacts?.chancery?.phoneDisplay || '+234 811 511 9318';
      addMessage(`I could not complete that lookup. Please use the portal directory or contact the Chancery on ${phone}.`, 'assistant', [
        linkAction('✉️ Contact', 'contact.html')
      ]);
    }
  }

  function installStyles() {
    if (document.getElementById('spiritusAssistantStyles')) return;
    const style = document.createElement('style');
    style.id = 'spiritusAssistantStyles';
    style.textContent = `
.spiritus-assistant{position:fixed;right:20px;bottom:20px;z-index:9999;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#201A16}
.spiritus-launcher{border:0;min-height:56px;padding:0 18px;border-radius:999px;background:#1E5631;color:white;box-shadow:0 14px 34px rgba(20,48,31,.28);display:flex;align-items:center;gap:9px;font-weight:800;cursor:pointer}
.spiritus-launcher__icon{font-size:20px}.spiritus-launcher__text{font-size:14px}.spiritus-launcher__dot{width:8px;height:8px;border-radius:50%;background:#7ef0a5;box-shadow:0 0 0 4px rgba(126,240,165,.16)}
.spiritus-panel{position:absolute;right:0;bottom:70px;width:min(410px,calc(100vw - 24px));height:620px;max-height:calc(100vh - 115px);background:#fff;border-radius:22px;box-shadow:0 24px 70px rgba(20,27,22,.28);overflow:hidden;display:none;flex-direction:column;border:1px solid rgba(32,26,22,.08)}
.spiritus-panel.is-open{display:flex;animation:spiritusIn .18s ease-out}@keyframes spiritusIn{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
.spiritus-panel__header{min-height:70px;padding:12px 14px;background:linear-gradient(135deg,#174326,#2f6f5e);color:white;display:flex;align-items:center;gap:10px}.spiritus-avatar{width:42px;height:42px;border-radius:14px;background:rgba(255,255,255,.15);display:grid;place-items:center;font-size:20px}.spiritus-panel__identity{flex:1;min-width:0;display:flex;flex-direction:column}.spiritus-panel__identity strong{color:white;font-size:15px}.spiritus-panel__identity span{font-size:11px;opacity:.86;display:flex;align-items:center;gap:5px}.spiritus-panel__identity i{width:7px;height:7px;border-radius:50%;background:#73e397}.spiritus-close,.spiritus-sound{width:36px;height:36px;border:0;border-radius:10px;color:white;background:rgba(255,255,255,.12);cursor:pointer;font-size:18px}.spiritus-trust{padding:8px 13px;background:#fff8e9;color:#5b4a24;font-size:11px;line-height:1.35;border-bottom:1px solid #f0e2bd}
.spiritus-messages{flex:1;padding:14px;overflow-y:auto;background:#f8f7f3;display:flex;flex-direction:column;gap:11px}.spiritus-msg{display:flex;flex-direction:column;align-items:flex-start;gap:7px}.spiritus-msg--user{align-items:flex-end}.spiritus-msg__bubble{max-width:90%;padding:10px 12px;border-radius:14px 14px 14px 4px;background:white;border:1px solid rgba(32,26,22,.08);box-shadow:0 2px 8px rgba(32,26,22,.05);font-size:13px;line-height:1.48;color:#342d27;white-space:pre-wrap}.spiritus-msg--user .spiritus-msg__bubble{background:#1E5631;color:white;border:0;border-radius:14px 14px 4px 14px}.spiritus-msg__actions{display:flex;flex-wrap:wrap;gap:6px;max-width:96%}.spiritus-action{text-decoration:none;padding:7px 9px;border-radius:999px;background:#ecf4ee;color:#174326;font-size:11px;font-weight:800;border:1px solid #d5e7da;cursor:pointer;font-family:inherit}.spiritus-action--call{background:#174326;color:white;border-color:#174326}.spiritus-typing{font-size:11px;color:#817c72;padding:0 4px}
.spiritus-quick{padding:9px 10px 4px;background:#fff;display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}.spiritus-quick::-webkit-scrollbar{display:none}.spiritus-quick button{flex:0 0 auto;border:1px solid #e4dfd3;background:#fff;color:#40382f;border-radius:999px;padding:7px 9px;font-size:11px;font-weight:700;cursor:pointer}
.spiritus-compose{padding:8px 10px 10px;background:#fff;display:grid;grid-template-columns:40px 1fr 40px;gap:7px;align-items:center}.spiritus-compose input{min-width:0;height:42px;border-radius:12px;border:1px solid #ded8ca;padding:0 11px;outline:none;font:inherit;font-size:13px}.spiritus-compose input:focus{border-color:#2f6f5e;box-shadow:0 0 0 3px rgba(47,111,94,.10)}.spiritus-mic,.spiritus-send{height:40px;width:40px;border:0;border-radius:12px;cursor:pointer}.spiritus-mic{background:#f3eee4}.spiritus-mic.is-listening{background:#fbe3e6;color:#7A2331;animation:spiritusPulse 1s infinite}@keyframes spiritusPulse{50%{transform:scale(.94)}}.spiritus-mic:disabled{opacity:.4;cursor:not-allowed}.spiritus-send{background:#1E5631;color:white;font-size:17px}.spiritus-footer-note{padding:0 12px 10px;background:#fff;color:#817C72;font-size:10.5px;text-align:center}
@media(max-width:640px){.spiritus-assistant{right:12px;bottom:max(12px,env(safe-area-inset-bottom))}.spiritus-launcher{min-height:52px;padding:0 15px}.spiritus-launcher__text{font-size:13px}.spiritus-panel{position:fixed;left:10px;right:10px;bottom:calc(76px + env(safe-area-inset-bottom));width:auto;height:min(650px,calc(100dvh - 105px));max-height:78dvh;border-radius:20px}}
@media(prefers-reduced-motion:reduce){.spiritus-panel.is-open,.spiritus-launcher,.spiritus-mic.is-listening{animation:none;transition:none}}
`;
    document.head.appendChild(style);
  }

  function initRecognition() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      micButton.disabled = true;
      micButton.title = 'Voice input is not supported by this browser';
      return;
    }
    recognition = new Recognition();
    recognition.lang = 'en-NG';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      micButton.classList.add('is-listening');
      micButton.textContent = '◉';
    };
    recognition.onend = () => {
      micButton.classList.remove('is-listening');
      micButton.textContent = '🎤';
    };
    recognition.onerror = () => {
      micButton.classList.remove('is-listening');
      micButton.textContent = '🎤';
    };
    recognition.onresult = e => {
      const spoken = e.results?.[0]?.[0]?.transcript || '';
      input.value = spoken;
      submit(spoken);
    };
  }

  function buildWidget() {
    installStyles();

    const root = document.createElement('div');
    root.id = 'spiritusAssistant';
    root.className = 'spiritus-assistant';
    root.innerHTML = `
      <button class="spiritus-launcher" type="button" aria-label="Open Spiritus Assistant" aria-expanded="false">
        <span class="spiritus-launcher__icon">💬</span>
        <span class="spiritus-launcher__text">Chat with Spiritus</span>
        <span class="spiritus-launcher__dot" aria-hidden="true"></span>
      </button>
      <section class="spiritus-panel" role="dialog" aria-label="Spiritus Assistant" aria-hidden="true">
        <header class="spiritus-panel__header">
          <div class="spiritus-avatar" aria-hidden="true">✝</div>
          <div class="spiritus-panel__identity">
            <strong>Spiritus Assistant</strong>
            <span><i></i> Beta · verified diocesan information</span>
          </div>
          <button class="spiritus-sound" type="button" aria-label="Turn spoken replies on" title="Spoken replies">🔇</button>
          <button class="spiritus-close" type="button" aria-label="Close chat">×</button>
        </header>
        <div class="spiritus-trust">I use the diocesan portal's structured data and FAQ knowledge. I do not choose a result at random or invent official Church information.</div>
        <div class="spiritus-messages" aria-live="polite"></div>
        <div class="spiritus-quick" aria-label="Quick questions">
          <button type="button" data-q="Parish help">⛪ Parishes</button>
          <button type="button" data-q="Mass times">🕊 Mass Times</button>
          <button type="button" data-q="Directions to a parish">📍 Directions</button>
          <button type="button" data-q="Sacrament help">✝ Sacraments</button>
          <button type="button" data-q="Chancery information">🏛 Chancery</button>
          <button type="button" data-q="School help">🎓 Schools</button>
          <button type="button" data-q="Health facilities">🏥 Health</button>
          <button type="button" data-q="Faith and Formation">🙏 Faith</button>
          <button type="button" data-q="Spiritus Sanctus Works services">🔧 Services</button>
          <button type="button" data-q="Choice Flame and notices">📰 News</button>
        </div>
        <form class="spiritus-compose">
          <button class="spiritus-mic" type="button" aria-label="Speak your question" title="Speak">🎤</button>
          <input type="text" maxlength="350" autocomplete="off" placeholder="Ask about a parish, sacrament, school…" aria-label="Message Spiritus Assistant"/>
          <button class="spiritus-send" type="submit" aria-label="Send message">➤</button>
        </form>
        <div class="spiritus-footer-note">For sensitive, canonical or official matters, the assistant directs you to a human diocesan office.</div>
      </section>`;
    document.body.appendChild(root);

    panel = root.querySelector('.spiritus-panel');
    messages = root.querySelector('.spiritus-messages');
    input = root.querySelector('.spiritus-compose input');
    micButton = root.querySelector('.spiritus-mic');
    soundButton = root.querySelector('.spiritus-sound');

    const launcher = root.querySelector('.spiritus-launcher');
    const close = root.querySelector('.spiritus-close');
    const form = root.querySelector('.spiritus-compose');

    function setOpen(open) {
      panel.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      launcher.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        canSpeak = true;
        launcher.querySelector('.spiritus-launcher__dot').style.display = 'none';
        setTimeout(() => input.focus(), 50);
      }
    }

    launcher.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
    close.addEventListener('click', () => setOpen(false));

    form.addEventListener('submit', e => {
      e.preventDefault();
      submit(input.value);
    });

    root.querySelectorAll('.spiritus-quick button').forEach(btn => {
      btn.addEventListener('click', () => submit(btn.dataset.q));
    });

    soundButton.addEventListener('click', () => {
      speakEnabled = !speakEnabled;
      if (!speakEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
      soundButton.textContent = speakEnabled ? '🔊' : '🔇';
      soundButton.setAttribute('aria-label', speakEnabled ? 'Turn spoken replies off' : 'Turn spoken replies on');
    });

    micButton.addEventListener('click', () => {
      if (!recognition) return;
      try {
        if (micButton.classList.contains('is-listening')) recognition.stop();
        else recognition.start();
      } catch (_) {}
    });

    initRecognition();

    addMessage('Welcome to the Catholic Diocese of Enugu. I can help with parishes, Mass times, directions, sacraments, the Chancery, schools, health services, faith centres, Spiritus Sanctus Works, Choice Flame and notices. Choose a topic below or type your question.', 'assistant', [
      promptAction('☰ Help Menu', 'Help')
    ]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget, { once: true });
  } else {
    buildWidget();
  }
})();