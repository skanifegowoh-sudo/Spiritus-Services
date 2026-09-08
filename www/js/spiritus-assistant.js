(() => {
  'use strict';

  if (window.__SPIRITUS_ASSISTANT_LOADED__) return;
  window.__SPIRITUS_ASSISTANT_LOADED__ = true;

  const CHANCERY_DISPLAY = '+234 811 511 9318';
  const CHANCERY_TEL = '+2348115119318';
  const PASTORAL_DISPLAY = '+234 903 466 6870';
  const PASTORAL_TEL = '+2349034666870';
  const PARISH_SCHEDULE = {
    sundayMorning: ['6:00 a.m.', '8:30 a.m.', '10:00 a.m.'],
    sundayEvening: '6:00 p.m.',
    weekdayMorning: '6:00 a.m.',
    weekdayEvening: '6:00 p.m.'
  };

  function regularMassText(parishName = 'the parish') {
    return `Regular Mass schedule for ${parishName}: Sunday Masses at ${PARISH_SCHEDULE.sundayMorning.join(', ')}, with Sunday evening Mass at ${PARISH_SCHEDULE.sundayEvening}. Weekday Masses are at ${PARISH_SCHEDULE.weekdayMorning} and ${PARISH_SCHEDULE.weekdayEvening}. The chapel is open every day. Mass times can change for special liturgical occasions, so please contact the parish directly for personal enquiries or confirmation.`;
  }

  function firstPhone(raw) {
    const m = String(raw || '').match(/(?:\+234|0)\d{10}/);
    if (!m) return '';
    return m[0].startsWith('0') ? '+234' + m[0].slice(1) : m[0];
  }

  function parishMapQuery(parish) {
    const name = String((parish && parish.name) || '').trim();
    const m = name.match(/^(.*?)\s*\((.*?)\)\s*$/);
    if (m) {
      const locality = m[1].trim();
      const church = m[2].trim();
      return `${church} Catholic Church, ${locality}, Enugu State, Nigeria`;
    }
    return `${name} Catholic Church, Enugu State, Nigeria`;
  }

  function parishMapUrl(parish) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(parishMapQuery(parish))}`;
  }

  function parishActions(parish) {
    const actions = [linkButton('📍 Google Maps Directions', parishMapUrl(parish))];
    const tel = firstPhone(parish.priestPhone);
    if (tel) actions.push(telButton('📞 Call Parish Contact', tel));
    if (parish.priestEmail) actions.push(linkButton('✉️ Email Parish Contact', `mailto:${parish.priestEmail}`));
    actions.push(linkButton('⛪ Parish Directory', 'directory.html'));
    return actions;
  }


  const DATASETS = [
    ['PARISHES_ALL', 'js/parishes-data.js'],
    ['SCHOOLS', 'js/schools-data.js'],
    ['HEALTH_CENTRES', 'js/health-data.js']
  ];

  const stopWords = new Set([
    'the','and','for','with','from','that','this','there','where','what','when','which','who','how','can','could','would','please','need','want','about','tell','give','show','find','near','into','your','you','our','are','is','of','to','a','an','in','on','at','me','my','do','does','i'
  ]);

  let panel, messages, input, micButton, speakEnabled = true, recognition = null, canSpeak = false;

  function loadScript(globalName, src) {
    if (window[globalName]) return Promise.resolve();
    return new Promise((resolve) => {
      const existing = [...document.scripts].find(s => (s.getAttribute('src') || '').endsWith(src.replace('js/', 'js/')));
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 1200);
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  const dataReady = Promise.all(DATASETS.map(([g, src]) => loadScript(g, src)));

  function normalise(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokens(value) {
    return normalise(value).split(' ').filter(t => t.length > 1 && !stopWords.has(t));
  }

  function score(query, haystack) {
    const q = tokens(query);
    if (!q.length) return 0;
    const h = normalise(haystack);
    let points = 0;
    for (const t of q) {
      if (h.includes(` ${t} `) || h.startsWith(`${t} `) || h.endsWith(` ${t}`) || h === t) points += 3;
      else if (h.includes(t)) points += 1;
    }
    const nq = normalise(query);
    if (nq.length > 3 && h.includes(nq)) points += 8;
    return points;
  }

  function telButton(label, tel = CHANCERY_TEL) {
    return { label, href: `tel:${tel}`, kind: 'call' };
  }

  function linkButton(label, href) {
    return { label, href, kind: 'link' };
  }

  function addMessage(text, who = 'assistant', actions = []) {
    const wrap = document.createElement('div');
    wrap.className = `spiritus-msg spiritus-msg--${who}`;

    const bubble = document.createElement('div');
    bubble.className = 'spiritus-msg__bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);

    if (actions.length) {
      const row = document.createElement('div');
      row.className = 'spiritus-msg__actions';
      actions.forEach(action => {
        const a = document.createElement('a');
        a.className = `spiritus-action spiritus-action--${action.kind || 'link'}`;
        a.href = action.href;
        a.textContent = action.label;
        if (/^https?:/i.test(action.href)) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        row.appendChild(a);
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
    const utterance = new SpeechSynthesisUtterance(text.replace(/\+234/g, 'plus two three four'));
    utterance.lang = 'en-NG';
    utterance.rate = 0.96;
    window.speechSynthesis.speak(utterance);
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

  function findMatches(query) {
    const results = [];

    (window.PARISHES_ALL || []).forEach(p => {
      const haystack = [p.name, p.deanery, p.priest, p.priestEmail].join(' ');
      const s = score(query, haystack);
      if (s > 2) results.push({ type: 'parish', score: s, item: p });
    });

    flattenSchools().forEach(school => {
      const haystack = [school.name, school.location, school.head, school.category].join(' ');
      const s = score(query, haystack);
      if (s > 2) results.push({ type: 'school', score: s, item: school });
    });

    (window.HEALTH_CENTRES || []).forEach(centre => {
      const haystack = [centre.name, centre.category].join(' ');
      const s = score(query, haystack);
      if (s > 2) results.push({ type: 'health', score: s, item: centre });
    });

    return results.sort((a, b) => b.score - a.score).slice(0, 4);
  }

  function answerMatch(match) {
    const x = match.item;
    if (match.type === 'parish') {
      const phone = x.priestPhone ? ` Listed parish contact: ${x.priestPhone}.` : '';
      const email = x.priestEmail ? ` Email: ${x.priestEmail}.` : '';
      return {
        text: `${x.name} is in ${x.deanery}. Parish priest: ${x.priest}.${phone}${email} ${regularMassText(x.name)}`,
        actions: parishActions(x)
      };
    }
    if (match.type === 'school') {
      const place = x.location ? ` Location: ${x.location}.` : '';
      const head = x.head ? ` Head: ${x.head}.` : '';
      return {
        text: `${x.name}.${place}${head}`,
        actions: [linkButton('Open Schools', 'schools.html')]
      };
    }
    if (match.type === 'health') {
      const direct = x.phone ? ` Listed phone: ${x.phone}.` : ` No direct phone is listed in the directory; the Chancery contact is ${CHANCERY_DISPLAY}.`;
      return {
        text: `${x.name} — ${x.category}.${direct}`,
        actions: [linkButton('Open Health Directory', 'health.html'), telButton('Call Chancery')]
      };
    }
    return null;
  }

  async function respond(raw) {
    const q = normalise(raw);
    await dataReady;

    if (!q) return;

    if (/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)\b/.test(q)) {
      return {
        text: 'Welcome to the Catholic Diocese of Enugu. I am the Spiritus automated assistant. How may I help you?',
        actions: []
      };
    }

    if (/emergency|urgent|burst pipe|severe leak/.test(q)) {
      return {
        text: `For Spiritus Sanctus Works or Chancery emergency contact, call ${CHANCERY_DISPLAY}. For the separately listed pastoral emergency line, call ${PASTORAL_DISPLAY}.`,
        actions: [telButton('Call Chancery / Works', CHANCERY_TEL), telButton('Pastoral Emergency', PASTORAL_TEL)]
      };
    }

    if (/chancery|secretariat|headquarters|office hours|opening hours|contact office|call office|catholic secretariat/.test(q)) {
      return {
        text: `The Catholic Secretariat is at Holy Ghost Cathedral, Ogui, Enugu. Office hours are Monday to Friday, 8:00am to 5:00pm. Chancery phone: ${CHANCERY_DISPLAY}. Email: cathsen1@yahoo.com.`,
        actions: [telButton('Call Chancery'), linkButton('Contact Page', 'contact.html')]
      };
    }

    if (/bishop|bishops|leadership|curia/.test(q)) {
      return {
        text: 'You can find the diocesan bishops, leadership and curia on the About page. For an official or sensitive request, please contact the Chancery rather than relying on this assistant.',
        actions: [linkButton('Diocesan Leadership', 'about.html'), telButton('Call Chancery')]
      };
    }

    if (/canon|canonical|dispensation|tribunal|marriage case|annulment|legal|land matter|property matter/.test(q)) {
      return {
        text: 'Canonical, legal, marriage, land and other sensitive diocesan matters must be handled by the appropriate office. I can direct you to the Chancery, but I cannot give an official canonical or legal decision.',
        actions: [linkButton('Legal & Canon Law Services', 'services.html#legal'), telButton('Call Chancery')]
      };
    }

    if (/plumb|pipe|leak|bathroom|water tank|borehole|drainage|electrical|carpentry|painting|masonry|tiling|cctv|networking|solar|service|technician|works/.test(q)) {
      const coming = /electrical|carpentry|painting|masonry|tiling|cctv|networking|solar/.test(q);
      return {
        text: coming
          ? 'That trade is listed as coming soon. The services currently live are pipe repairs, leak detection, bathroom installation, water tank installation, borehole plumbing and drainage maintenance.'
          : 'Spiritus Sanctus Works currently offers pipe repairs, leak detection, bathroom installation, water tank installation, borehole plumbing and drainage maintenance. Emergency call-outs use the Chancery / Works number.',
        actions: [linkButton('Open Services', 'services.html'), telButton('Call Works', CHANCERY_TEL)]
      };
    }

    if (/hospital|clinic|maternity|health|medical centre|care home|elderly|motherless|eye clinic/.test(q)) {
      const matches = findMatches(q).filter(x => x.type === 'health');
      if (matches.length) return answerMatch(matches[0]);
      return {
        text: 'The Diocese has hospitals, maternity and medical centres, clinics and care homes listed in the Health Directory. I can help you find a named centre. I do not provide medical diagnosis or emergency medical advice.',
        actions: [linkButton('Health Directory', 'health.html'), telButton('Call Chancery')]
      };
    }

    if (/school|college|university|education|hostel|seminary|institute/.test(q)) {
      const matches = findMatches(q).filter(x => x.type === 'school');
      if (matches.length) return answerMatch(matches[0]);
      return {
        text: 'Catholic schools and higher institutions are listed in the Schools Directory. Tell me the name or location of the school you are looking for.',
        actions: [linkButton('Schools Directory', 'schools.html')]
      };
    }

    if (/mass|sunday|weekday|chapel|direction|directions|google map|maps|locate|location|route|how do i get/.test(q)) {
      const parishMatches = findMatches(q).filter(x => x.type === 'parish');
      if (parishMatches.length) {
        const parish = parishMatches[0].item;
        if (/direction|directions|google map|maps|locate|location|route|how do i get/.test(q)) {
          return {
            text: `I can open Google Maps directions to ${parish.name}. The destination is generated from the parish name and locality in the diocesan directory. If a map pin differs from the parish's actual gate, please confirm with the parish contact before travelling.`,
            actions: parishActions(parish)
          };
        }
        return {
          text: regularMassText(parish.name),
          actions: parishActions(parish)
        };
      }
      if (/mass|sunday|weekday|chapel/.test(q)) {
        return {
          text: regularMassText('parishes in this directory'),
          actions: [linkButton('⛪ Find a Parish', 'directory.html')]
        };
      }
      return {
        text: 'Tell me the parish name or town and I can open Google Maps directions from your current location.',
        actions: [linkButton('⛪ Parish Directory', 'directory.html')]
      };
    }

    if (/parish|church|priest|deanery|rev fr|father /.test(q)) {
      const matches = findMatches(q).filter(x => x.type === 'parish');
      if (matches.length) return answerMatch(matches[0]);
      return {
        text: 'I can search the diocesan parish directory by parish name, town, deanery or parish priest. Please give me a more specific name or place.',
        actions: [linkButton('Parish Directory', 'directory.html')]
      };
    }

    if (/announcement|notice|event|news|latest/.test(q)) {
      return {
        text: 'Current diocesan notices and announcements are available on the Notices page.',
        actions: [linkButton('View Notices', 'announcements.html')]
      };
    }

    if (/choice flame|newspaper|publication|diocesan paper/.test(q)) {
      return {
        text: 'The Choice Flame is the diocesan publication section of the portal.',
        actions: [linkButton('Open Choice Flame', 'choice-flame.html')]
      };
    }

    if (/faith|formation|catech|sacrament|baptism|confirmation|eucharist|marriage preparation/.test(q)) {
      return {
        text: 'Faith formation and sacramental resources are available on the Faith & Formation page. For a specific sacramental or pastoral case, contact your parish or the Chancery.',
        actions: [linkButton('Faith & Formation', 'faith-formation.html'), telButton('Call Chancery')]
      };
    }

    const matches = findMatches(q);
    if (matches.length && matches[0].score >= 4) return answerMatch(matches[0]);

    return {
      text: `I could not verify that from the diocesan information currently available to me. Please use the directory or contact the Chancery on ${CHANCERY_DISPLAY}. I will not guess or invent an answer.`,
      actions: [linkButton('Search Parishes', 'directory.html'), linkButton('Contact Chancery', 'contact.html'), telButton('Call Chancery')]
    };
  }

  async function submit(text) {
    const clean = String(text || '').trim();
    if (!clean) return;
    addMessage(clean, 'user');
    input.value = '';
    input.focus();

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
      typing.remove();
      addMessage(`I could not complete that search. Please contact the Chancery on ${CHANCERY_DISPLAY}.`, 'assistant', [telButton('Call Chancery')]);
    }
  }

  function initRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      micButton.disabled = true;
      micButton.title = 'Voice input is not supported by this browser';
      return;
    }
    recognition = new SR();
    recognition.lang = 'en-NG';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => micButton.classList.add('is-listening');
    recognition.onend = () => micButton.classList.remove('is-listening');
    recognition.onerror = () => micButton.classList.remove('is-listening');
    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || '';
      input.value = text;
      submit(text);
    };
  }

  function installStyles() {
    if (document.getElementById('spiritusAssistantStyles')) return;
    const style = document.createElement('style');
    style.id = 'spiritusAssistantStyles';
    style.textContent = `
/* ============================================================
   SPIRITUS ASSISTANT — FREE LIVE CHAT + VOICE BETA
   ============================================================ */
.spiritus-assistant {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9999;
  font-family: var(--sans, 'Inter', system-ui, sans-serif);
}

.spiritus-launcher {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: var(--cobalt, #1E5631);
  color: #fff;
  box-shadow: 0 12px 35px rgba(24, 50, 38, .28);
  font: 700 14px/1 var(--sans, 'Inter', system-ui, sans-serif);
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease;
}
.spiritus-launcher:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(24, 50, 38, .32); }
.spiritus-launcher:focus-visible,
.spiritus-panel button:focus-visible,
.spiritus-panel input:focus-visible,
.spiritus-panel a:focus-visible { outline: 3px solid rgba(184,145,43,.45); outline-offset: 2px; }
.spiritus-launcher__icon { font-size: 20px; }
.spiritus-launcher__text { white-space: nowrap; }
.spiritus-launcher__dot {
  position: absolute;
  top: 2px;
  right: 5px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #F5C84C;
  border: 2px solid #fff;
}

.spiritus-panel {
  position: absolute;
  right: 0;
  bottom: 70px;
  width: min(390px, calc(100vw - 28px));
  height: min(620px, 74vh);
  display: none;
  grid-template-rows: auto auto 1fr auto auto auto;
  overflow: hidden;
  border: 1px solid rgba(32, 26, 22, .10);
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 28px 80px rgba(21, 30, 25, .26);
  color: #201A16;
}
.spiritus-panel.is-open { display: grid; animation: spiritusRise .18s ease-out; }
@keyframes spiritusRise { from { opacity: 0; transform: translateY(10px) scale(.985); } to { opacity: 1; transform: none; } }

.spiritus-panel__header {
  display: grid;
  grid-template-columns: 42px 1fr auto auto;
  gap: 10px;
  align-items: center;
  padding: 14px 14px 13px;
  background: linear-gradient(135deg, #173f29 0%, #1E5631 60%, #2F6F5E 100%);
  color: #fff;
}
.spiritus-avatar {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(255,255,255,.14);
  border: 1px solid rgba(255,255,255,.22);
  font-size: 20px;
}
.spiritus-panel__identity { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.spiritus-panel__identity strong { font-size: 15px; color: #fff; }
.spiritus-panel__identity span { font-size: 11px; color: rgba(255,255,255,.82); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.spiritus-panel__identity i { display: inline-block; width: 7px; height: 7px; margin-right: 4px; border-radius: 50%; background: #63D68A; }
.spiritus-sound, .spiritus-close {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: rgba(255,255,255,.10);
  color: #fff;
  cursor: pointer;
}
.spiritus-close { font-size: 25px; line-height: 1; }

.spiritus-trust {
  padding: 8px 14px;
  background: #F7EFD9;
  color: #5B4B2D;
  border-bottom: 1px solid rgba(91,75,45,.10);
  font-size: 11px;
  line-height: 1.4;
}

.spiritus-messages {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 16px 13px 10px;
  background: linear-gradient(#FFFCF5, #fff 42%);
  scrollbar-width: thin;
}
.spiritus-msg { display: flex; flex-direction: column; margin: 0 0 12px; }
.spiritus-msg--user { align-items: flex-end; }
.spiritus-msg--assistant { align-items: flex-start; }
.spiritus-msg__bubble {
  max-width: 88%;
  padding: 11px 13px;
  border-radius: 15px;
  font-size: 13.5px;
  line-height: 1.52;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.spiritus-msg--assistant .spiritus-msg__bubble {
  background: #F2F5F2;
  color: #29342D;
  border-bottom-left-radius: 5px;
}
.spiritus-msg--user .spiritus-msg__bubble {
  background: #1E5631;
  color: #fff;
  border-bottom-right-radius: 5px;
}
.spiritus-msg__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 92%;
  margin-top: 7px;
}
.spiritus-action {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 6px 10px;
  border: 1px solid #DDE6DF;
  border-radius: 999px;
  background: #fff;
  color: #1E5631;
  font-size: 11.5px;
  font-weight: 700;
  text-decoration: none;
}
.spiritus-action--call { background: #EDF7F0; border-color: #CFE4D5; }
.spiritus-typing { margin: 0 0 10px; color: #7C7A74; font-size: 11.5px; font-style: italic; }

.spiritus-quick {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding: 9px 12px;
  border-top: 1px solid #EEE9DF;
  background: #FFFCF5;
  scrollbar-width: none;
}
.spiritus-quick::-webkit-scrollbar { display: none; }
.spiritus-quick button {
  flex: 0 0 auto;
  min-height: 32px;
  padding: 6px 10px;
  border: 1px solid #E3DDD0;
  border-radius: 999px;
  background: #fff;
  color: #4A433B;
  font: 650 11.5px/1 var(--sans, 'Inter', system-ui, sans-serif);
  cursor: pointer;
}

.spiritus-compose {
  display: grid;
  grid-template-columns: 38px 1fr 40px;
  gap: 7px;
  align-items: center;
  padding: 10px 11px;
  border-top: 1px solid #EEE9DF;
  background: #fff;
}
.spiritus-compose input {
  width: 100%;
  min-width: 0;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #DCD8CF;
  border-radius: 13px;
  background: #FBFAF7;
  color: #201A16;
  font: 500 13px/1 var(--sans, 'Inter', system-ui, sans-serif);
}
.spiritus-compose input::placeholder { color: #8B877F; }
.spiritus-mic, .spiritus-send {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 11px;
  cursor: pointer;
}
.spiritus-mic { background: #F7EFD9; color: #6C5624; }
.spiritus-mic.is-listening { background: #FCE1E4; color: #8B2436; animation: spiritusPulse 1s infinite; }
.spiritus-mic:disabled { opacity: .4; cursor: not-allowed; }
.spiritus-send { background: #1E5631; color: #fff; font-size: 17px; }
@keyframes spiritusPulse { 50% { transform: scale(1.08); } }

.spiritus-footer-note {
  padding: 0 12px 10px;
  background: #fff;
  color: #817C72;
  font-size: 10.5px;
  text-align: center;
}

@media (max-width: 640px) {
  .spiritus-assistant { right: 12px; bottom: max(12px, env(safe-area-inset-bottom)); }
  .spiritus-launcher { min-height: 52px; padding: 0 15px; }
  .spiritus-launcher__text { font-size: 13px; }
  .spiritus-panel {
    position: fixed;
    left: 10px;
    right: 10px;
    bottom: calc(76px + env(safe-area-inset-bottom));
    width: auto;
    height: min(650px, calc(100dvh - 105px));
    max-height: 78dvh;
    border-radius: 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spiritus-panel.is-open, .spiritus-launcher, .spiritus-mic.is-listening { animation: none; transition: none; }
}
`;
    document.head.appendChild(style);
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
          <button class="spiritus-sound" type="button" aria-label="Turn spoken replies off" title="Spoken replies">🔊</button>
          <button class="spiritus-close" type="button" aria-label="Close chat">×</button>
        </header>
        <div class="spiritus-trust">I use information from this diocesan portal. I do not invent official Church information.</div>
        <div class="spiritus-messages" aria-live="polite"></div>
        <div class="spiritus-quick" aria-label="Quick questions">
          <button type="button" data-q="Find a parish">⛪ Parishes</button>
          <button type="button" data-q="What are the regular parish Mass times?">🕊️ Mass Times</button>
          <button type="button" data-q="Give me directions to a parish">📍 Directions</button>
          <button type="button" data-q="Chancery contact and office hours">🏛 Chancery</button>
          <button type="button" data-q="Show diocesan hospitals and health centres">🏥 Health</button>
          <button type="button" data-q="Show Catholic schools">🎓 Schools</button>
          <button type="button" data-q="What services are available?">🔧 Services</button>
          <button type="button" data-q="Emergency contact">🚨 Emergency</button>
        </div>
        <form class="spiritus-compose">
          <button class="spiritus-mic" type="button" aria-label="Speak your question" title="Speak">🎤</button>
          <input type="text" maxlength="300" autocomplete="off" placeholder="Ask about a parish, school, hospital…" aria-label="Message Spiritus Assistant" />
          <button class="spiritus-send" type="submit" aria-label="Send message">➤</button>
        </form>
        <div class="spiritus-footer-note">For sensitive or official matters, contact a human diocesan office.</div>
      </section>`;
    document.body.appendChild(root);

    panel = root.querySelector('.spiritus-panel');
    messages = root.querySelector('.spiritus-messages');
    input = root.querySelector('.spiritus-compose input');
    micButton = root.querySelector('.spiritus-mic');

    const launcher = root.querySelector('.spiritus-launcher');
    const close = root.querySelector('.spiritus-close');
    const sound = root.querySelector('.spiritus-sound');
    const form = root.querySelector('.spiritus-compose');

    function setOpen(open) {
      panel.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      launcher.setAttribute('aria-expanded', open ? 'true' : 'false');
      root.classList.toggle('is-open', open);
      if (open) {
        canSpeak = true;
        launcher.querySelector('.spiritus-launcher__dot').style.display = 'none';
        setTimeout(() => input.focus(), 50);
      }
    }

    launcher.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
    close.addEventListener('click', () => setOpen(false));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submit(input.value);
    });

    root.querySelectorAll('.spiritus-quick button').forEach(btn => {
      btn.addEventListener('click', () => submit(btn.dataset.q));
    });

    sound.addEventListener('click', () => {
      speakEnabled = !speakEnabled;
      if (!speakEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
      sound.textContent = speakEnabled ? '🔊' : '🔇';
      sound.setAttribute('aria-label', speakEnabled ? 'Turn spoken replies off' : 'Turn spoken replies on');
    });

    micButton.addEventListener('click', () => {
      if (!recognition) return;
      try {
        if (micButton.classList.contains('is-listening')) recognition.stop();
        else recognition.start();
      } catch (_) {}
    });

    initRecognition();

    addMessage('Welcome to the Catholic Diocese of Enugu. I am the Spiritus automated assistant. Ask me about parishes, Mass times, directions, the Chancery, schools, health services or Spiritus Sanctus Works.', 'assistant');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildWidget, { once: true });
  else buildWidget();
})();
