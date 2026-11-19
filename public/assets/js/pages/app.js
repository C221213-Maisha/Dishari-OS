/* Dishari OS - /app : learning, pedagogy and game workspace */
(function () {
  'use strict';
  const D = window.D;
  const { T, esc } = D;
  const I = (n, s) => D.icon(n, s);

  const MODES = [
    ['socratic', 'help', { en: 'Socratic', bn: 'সক্রেটিক' }, { en: 'The tutor asks guiding questions and never hands you the answer.', bn: 'টিউটর প্রশ্ন করে, সরাসরি উত্তর দেয় না।' }],
    ['bloom', 'ladder', { en: 'Bloom ladder', bn: 'ব্লুম ল্যাডার' }, { en: 'Climb six levels from remembering to creating.', bn: 'স্মরণ থেকে সৃষ্টি পর্যন্ত ছয় স্তর।' }],
    ['feynman', 'message', { en: 'Feynman', bn: 'ফাইনম্যান' }, { en: 'You explain the idea; the tutor plays a curious classmate and scores clarity.', bn: 'তুমি ব্যাখ্যা করো; টিউটর কৌতূহলী সহপাঠী।' }],
    ['scaffold', 'mountain', { en: 'Scaffolding', bn: 'স্ক্যাফোল্ডিং' }, { en: 'Solve in small steps with hints that fade as you improve.', bn: 'ছোট ধাপে সমাধান, হিন্ট ক্রমশ কমে।' }]
  ];
  const PARTS = [
    ['1', 'puzzle', { en: 'Concept sandbox', bn: 'ধারণা স্যান্ডবক্স' }, 'p1'],
    ['2', 'target', { en: 'Practice sprint', bn: 'অনুশীলন স্প্রিন্ট' }, 'p2'],
    ['3', 'swords', { en: 'Real-world challenge', bn: 'বাস্তব চ্যালেঞ্জ' }, 'p3'],
    ['4', 'users', { en: 'Co-op league', bn: 'কো-অপ লিগ' }, 'p4']
  ];
  const TABS = [
    ['learn', 'layers', { en: 'Learn', bn: 'শেখো' }],
    ['snap', 'camera', { en: 'Snap-to-Solve', bn: 'স্ন্যাপ-টু-সলভ' }],
    ['copilot', 'teacher', { en: 'Teacher Co-Pilot', bn: 'শিক্ষক কো-পাইলট' }],
    ['career', 'compass', { en: 'Career & Passport', bn: 'ক্যারিয়ার ও পাসপোর্ট' }],
    ['talent', 'briefcase', { en: 'Talent Marketplace', bn: 'ট্যালেন্ট মার্কেটপ্লেস' }]
  ];

  const W = { tab: 'learn', s: 'bio', p: '1', m: 'socratic' };
  D.W = W;

  /* ---------------- HUD ---------------- */
  function hudHTML() {
    const g = D.state.game;
    const lp = D.levelProgress(g.xp);
    return `<span class="h" title="${T('Level', 'লেভেল')}">${I('award', 16)} ${T('Level', 'লেভেল')} ${D.n(lp.level)}</span>
      <span class="h" style="min-width:170px" title="${D.n(lp.toNext)} ${T('XP to next level', 'XP বাকি')}">${I('star', 16)} ${D.n(g.xp)} XP <span style="flex:1;min-width:60px">${D.bar(lp.pct, 'thin')}</span></span>
      <span class="h" title="${T('Daily streak', 'দৈনিক ধারা')}">${I('flame', 16)} ${D.n(g.streak)} ${T('day streak', 'দিনের ধারা')}</span>
      <span class="h ${g.combo >= 3 ? 'combo-on' : ''}" title="${T('Three correct answers in a row doubles XP', 'পরপর তিনটি সঠিকে দ্বিগুণ XP')}">${I('zap', 16)} ${g.combo >= 3 ? T('2× XP active', '২× XP সক্রিয়') : T('Combo', 'কম্বো') + ' ' + D.n(g.combo)}</span>`;
  }
  D.refreshHUD = () => {
    const h = D.$('#hud'); if (h) h.innerHTML = hudHTML();
    const q = D.$('#quest-bar'); if (q) { q.innerHTML = questHTML(); bindQuest(); }
    const r = D.$('#side-bloom'); if (r) r.innerHTML = bloomRadar();
  };

  function questHTML() {
    const q = D.quest(W.s);
    return PARTS.map(([n, ic, l, k]) => `<button class="qpart ${W.p === n ? 'active' : ''}" data-part="${n}" aria-pressed="${W.p === n}">
        <span class="n">${I(ic, 14)} ${T('Part', 'পর্ব')} ${D.n(+n)}</span><b>${esc(D.tx(l))}</b>${D.bar(q[k] || 0, 'thin')}${q[k] >= 100 ? `<span class="done-ic">${I('checkCircle', 17)}</span>` : ''}</button>`).join('');
  }
  function bindQuest() {
    D.$$('#quest-bar [data-part]').forEach((b) => (b.onclick = () => { W.p = b.dataset.part; D.setParams({ p: W.p }); D.$('#quest-bar').innerHTML = questHTML(); bindQuest(); renderStage(); }));
  }
  function bloomRadar() {
    const b = D.state.bloom;
    return D.radar(D.BLOOM.map(([, l]) => D.tx(l)), D.BLOOM.map(([k]) => b[k] || 0), { size: 270, label: 'Bloom mastery radar' });
  }

  /* ---------------- Page ---------------- */
  D.page('app', {
    title: { en: 'Workspace', bn: 'ওয়ার্কস্পেস' },
    render(el, params) {
      W.tab = TABS.find((t) => t[0] === params.get('tab')) ? params.get('tab') : 'learn';
      W.s = D.SUBJECTS.find((x) => x.id === params.get('s')) ? params.get('s') : W.s;
      W.p = ['1', '2', '3', '4'].includes(params.get('p')) ? params.get('p') : W.p;
      W.m = MODES.find((x) => x[0] === params.get('m')) ? params.get('m') : W.m;
      const student = D.state.role === 'student';
      const who = student ? D.tx({ en: 'Welcome back, ' + D.NUSRAT.short, bn: 'আবার স্বাগতম, নুসরাত' }) : D.state.role === 'admin' ? T('Learner workspace (admin preview)', 'শিক্ষার্থী ওয়ার্কস্পেস (অ্যাডমিন প্রিভিউ)') : T('Learner workspace', 'শিক্ষার্থী ওয়ার্কস্পেস');
      el.innerHTML = `
        <div class="row between" style="margin-bottom:24px;align-items:flex-end;gap:20px">
          <div>
            <div class="eyebrow">${student ? esc(D.tx(D.NUSRAT.role)) : T('Guest session · progress is saved in this browser', 'অতিথি সেশন · অগ্রগতি এই ব্রাউজারে সংরক্ষিত')}</div>
            <h1 style="font-size:clamp(26px,3vw,34px);margin:8px 0 0">${esc(who)}</h1>
            ${student ? '' : `<p class="small muted" style="margin:6px 0 0">${D.a('demo-user', T('Load the demo student profile', 'ডেমো শিক্ষার্থী প্রোফাইল লোড করুন'))} ${T('to see a learner with real progress.', 'অগ্রগতিসহ দেখতে।')}</p>`}
          </div>
          <div class="hud" id="hud">${hudHTML()}</div>
        </div>
        <div class="tabs" role="tablist" style="margin-bottom:28px" id="ws-tabs">
          ${TABS.map(([k, i, l]) => `<button class="tab ${W.tab === k ? 'active' : ''}" role="tab" aria-selected="${W.tab === k}" data-tab="${k}">${I(i, 16)} ${esc(D.tx(l))}</button>`).join('')}
        </div>
        <div id="ws-body"></div>`;
      D.$$('#ws-tabs [data-tab]').forEach((b) => (b.onclick = () => { W.tab = b.dataset.tab; D.setParams({ tab: W.tab }); D.$$('#ws-tabs .tab').forEach((x) => { x.classList.toggle('active', x === b); x.setAttribute('aria-selected', x === b); }); renderBody(); }));
      renderBody();
      if (!D.LLM.checked) D.probeLLM().then(() => { const e = D.$('#engine-badge'); if (e) e.outerHTML = engineBadge(); });
    }
  });

  function renderBody() {
    const body = D.$('#ws-body');
    if (!body) return;
    if (W.tab === 'learn') return renderLearn(body);
    const fn = D.TABS && D.TABS[W.tab];
    if (fn) fn(body); else body.innerHTML = '';
  }
  D.wsGo = (tab) => { W.tab = tab; D.setParams({ tab }); D.$$('#ws-tabs .tab').forEach((x) => x.classList.toggle('active', x.dataset.tab === tab)); renderBody(); window.scrollTo(0, 0); };

  function engineBadge() {
    return D.LLM.available
      ? `<span class="chip em" id="engine-badge" title="${T('The policy engine decides each turn; the language model only rephrases it using the same sources.', 'নীতি ইঞ্জিন সিদ্ধান্ত নেয়; ভাষা মডেল শুধু ভাষা দেয়।')}">${I('cpu', 13)} ${T('Policy engine + LLM', 'নীতি ইঞ্জিন + LLM')}</span>`
      : `<span class="chip" id="engine-badge" title="${T('Runs entirely in the browser and works offline. Add an API key on the server to enable the language model.', 'সম্পূর্ণ ব্রাউজারে চলে, অফলাইনেও।')}">${I('cpu', 13)} ${T('Offline engine', 'অফলাইন ইঞ্জিন')}</span>`;
  }

  /* ---------------- Learn tab ---------------- */
  function renderLearn(body) {
    body.innerHTML = `
      <div class="row between" style="margin-bottom:16px;gap:16px">
        <div class="subjects" id="subj" role="tablist" aria-label="${T('Subjects', 'বিষয়')}">${D.SUBJECTS.map((s) => `<button class="subj ${W.s === s.id ? 'active' : ''}" data-s="${s.id}" aria-pressed="${W.s === s.id}">${I(s.icon, 16)} ${esc(D.tx(s.name))}</button>`).join('')}</div>
        <span class="small muted" id="topic-line">${I('bookOpen', 15)} ${esc(D.tx(D.subject(W.s).topic))}</span>
      </div>
      <div class="quest" id="quest-bar" aria-label="${T('Four-part quest', 'চার পর্বের কোয়েস্ট')}">${questHTML()}</div>
      <div class="bento" style="margin-top:24px">
        <div class="card s7" id="stage" style="min-height:440px"></div>
        <div class="card s5" id="tutor"></div>
      </div>
      <div class="section" style="margin-top:40px">
        <div class="section-title"><div><div class="eyebrow">${T('Your progress', 'তোমার অগ্রগতি')}</div><h2>${T('Mastery and where it can lead', 'দক্ষতা ও এর গন্তব্য')}</h2></div></div>
        <div class="grid g2">
          <div class="card"><div class="card-head"><h3>${T("Bloom's taxonomy", 'ব্লুম ট্যাক্সোনমি')}</h3>${D.liveTag()}</div><div id="side-bloom" style="display:grid;place-items:center">${bloomRadar()}</div></div>
          <div class="card" id="side-career"></div>
        </div>
      </div>`;
    D.$$('#subj [data-s]').forEach((b) => (b.onclick = () => {
      W.s = b.dataset.s; D.setParams({ s: W.s });
      D.$$('#subj .subj').forEach((x) => { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b); });
      D.$('#topic-line').innerHTML = I('bookOpen', 15) + ' ' + esc(D.tx(D.subject(W.s).topic));
      D.$('#quest-bar').innerHTML = questHTML(); bindQuest(); renderStage(); renderTutor(); renderSide();
    }));
    bindQuest();
    renderStage();
    renderTutor();
    renderSide();
  }

  function renderStage() {
    const el = D.$('#stage');
    if (!el) return;
    el.innerHTML = '';
    const sub = D.subject(W.s);
    if (W.p === '1') D.LABS[W.s](el, sub);
    else if (W.p === '2') D.GAME.practice(el, sub);
    else if (W.p === '3') D.GAME.boss(el, sub);
    else D.GAME.coop(el, sub);
  }
  D.renderStage = renderStage;

  function renderSide() {
    const c = D.$('#side-career');
    if (!c) return;
    const top = D.careerMatches().slice(0, 3);
    c.innerHTML = `<div class="card-head"><h3>${T('Career matches', 'ক্যারিয়ার মিল')}</h3>${D.liveTag()}</div>
      <div class="col" style="gap:16px">${top.map((m) => `<div><div class="row between small" style="margin-bottom:6px"><b style="font-weight:600">${esc(D.tx(m.c.name))}</b><span class="muted">${D.n(m.pct)}%</span></div>${D.bar(m.pct)}<div class="small muted" style="margin-top:5px">O*NET ${m.c.onet} · ${T('strengthen', 'উন্নতি দরকার')} ${esc(D.tx(D.subject(m.gap).name))}</div></div>`).join('')}</div>
      <button class="btn sm" style="margin-top:18px" id="to-career">${T('Open Career Navigator', 'ক্যারিয়ার নেভিগেটর খুলুন')} ${I('arrowRight', 14)}</button>`;
    D.$('#to-career').onclick = () => D.wsGo('career');
  }
  D.renderSide = renderSide;

  /* ---------------- AI Tutor panel ---------------- */
  function renderTutor() {
    const el = D.$('#tutor');
    if (!el) return;
    D.Tutor.opening(W.s, W.m);
    const mode = MODES.find((m) => m[0] === W.m);
    el.innerHTML = `
      <div class="card-head" style="margin-bottom:14px"><h3>${I('message', 18)} ${T('AI tutor', 'AI টিউটর')}</h3>${engineBadge()}</div>
      <div class="modes" id="mode-switcher" role="radiogroup" aria-label="${T('Teaching method', 'শিক্ষণ পদ্ধতি')}">
        ${MODES.map(([k, i, l]) => `<button class="mode ${W.m === k ? 'active' : ''}" role="radio" aria-checked="${W.m === k}" data-m="${k}">${I(i, 18)}<b>${esc(D.tx(l))}</b></button>`).join('')}
      </div>
      <p class="small muted" style="margin:10px 2px 0">${esc(D.tx(mode[3]))}</p>
      <div id="mode-extra" style="margin-top:12px"></div>
      <div class="chat" id="chat" aria-live="polite" style="margin-top:12px"></div>
      <form id="chat-form" class="row nowrap" style="margin-top:12px;gap:8px" autocomplete="off">
        <input type="text" id="chat-in" placeholder="${esc(placeholder())}" aria-label="${T('Your answer or question', 'তোমার উত্তর বা প্রশ্ন')}">
        <button class="btn icon" type="button" id="mic-btn" title="${T('Speak', 'বলো')}" aria-label="${T('Voice input', 'ভয়েস ইনপুট')}">${I('mic', 18)}</button>
        <button class="btn primary icon" type="submit" aria-label="${T('Send', 'পাঠাও')}">${I('send', 18)}</button>
      </form>
      <div class="row between" style="margin-top:12px">
        <button class="btn sm" id="rag-btn">${I('search', 15)} ${T('Why this answer?', 'কেন এই উত্তর?')}</button>
        <div class="row" style="gap:4px"><button class="btn sm ghost icon" id="tutor-speak" title="${T('Read the last reply aloud', 'শেষ উত্তর পড়ে শোনাও')}" aria-label="${T('Read aloud', 'পড়ে শোনাও')}">${I('volume', 16)}</button><button class="btn sm ghost icon" id="tutor-reset" title="${T('Restart', 'আবার শুরু')}" aria-label="${T('Restart', 'আবার শুরু')}">${I('refresh', 16)}</button></div>
      </div>`;
    D.$$('#mode-switcher [data-m]').forEach((b) => (b.onclick = () => { W.m = b.dataset.m; D.setParams({ m: W.m }); D.log('tutor.mode_switch', W.s + ':' + W.m); renderTutor(); }));
    D.$('#chat-form').onsubmit = async (e) => {
      e.preventDefault();
      const inp = D.$('#chat-in');
      const v = inp.value.trim();
      if (!v) return;
      inp.value = '';
      await send(v);
    };
    D.$('#rag-btn').onclick = () => openRAG();
    D.$('#tutor-reset').onclick = () => { D.Tutor.reset(W.s, W.m); renderTutor(); };
    D.$('#tutor-speak').onclick = () => { const S = D.Tutor.session(W.s, W.m); const last = [...S.msgs].reverse().find((m) => m.who === 'ai'); if (last) D.speak(last.text); };
    D.$('#mic-btn').onclick = () => listen();
    drawChat();
    drawModeExtra();
  }
  function placeholder() {
    return { socratic: T('Type your thinking, or ask a question', 'তোমার চিন্তা লেখো, বা প্রশ্ন করো'), bloom: T('Ask a question, or answer the Create task', 'প্রশ্ন করো বা সৃষ্টি-কাজের উত্তর দাও'), feynman: T('Explain it in your own words', 'নিজের ভাষায় ব্যাখ্যা করো'), scaffold: T('Answer this step', 'এই ধাপের উত্তর দাও') }[W.m];
  }
  function fmt(text) {
    return esc(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>').replace(/ {2}/g, '&nbsp;&nbsp;');
  }
  function drawChat() {
    const S = D.Tutor.session(W.s, W.m);
    const box = D.$('#chat');
    if (!box) return;
    const T_ = D.TUTOR[W.s];
    box.innerHTML = S.msgs.map((m, i) => {
      if (m.who === 'me') return `<div class="msg me">${fmt(m.text)}</div>`;
      let extra = '';
      if (m.kind === 'bloom' && m.bloomIdx != null && m.bloomIdx < 5 && i === S.msgs.length - 1) {
        const it = T_.bloom[m.bloomIdx];
        const ord = D.order(it.o.length, m.bloomIdx * 7 + W.s.length);
        extra = `<div class="opts" style="margin-top:10px">${ord.map((k, j) => `<button class="opt" data-bopt="${k}"><span class="k">${'ABCD'[j]}</span><span>${esc(D.tx(it.o[k]))}</span></button>`).join('')}</div>`;
      }
      return `<div class="msg ai">${fmt(m.text)}${extra}<div class="meta"><button data-speak="${i}">${I('volume', 13)} ${T('Listen', 'শোনো')}</button><button data-why="${i}">${I('bookOpen', 13)} ${T('Sources', 'উৎস')}</button>${m.llm ? `<span>${esc(m.llm)}</span>` : ''}</div></div>`;
    }).join('');
    D.$$('[data-bopt]', box).forEach((b) => (b.onclick = () => {
      const S2 = D.Tutor.session(W.s, 'bloom');
      const last = S2.msgs[S2.msgs.length - 1];
      D.Tutor.bloomAnswer(W.s, last.bloomIdx, +b.dataset.bopt);
      drawChat(); drawModeExtra(); D.refreshHUD();
      if (D.drawerOpen()) openRAG();
    }));
    D.$$('[data-speak]', box).forEach((b) => (b.onclick = () => D.speak(S.msgs[+b.dataset.speak].text)));
    D.$$('[data-why]', box).forEach((b) => (b.onclick = () => openRAG()));
    box.scrollTop = box.scrollHeight;
  }
  async function send(v) {
    const box = D.$('#chat');
    D.Tutor.session(W.s, W.m).msgs.push({ who: 'me', text: v, pending: true });
    drawChat();
    box.insertAdjacentHTML('beforeend', `<div class="msg ai typing" id="typing"><span></span><span></span><span></span></div>`);
    box.scrollTop = box.scrollHeight;
    await D.sleep(D.state.lite ? 50 : 380);
    const S = D.Tutor.session(W.s, W.m);
    S.msgs = S.msgs.filter((m) => !m.pending);
    await D.Tutor.reply(W.s, W.m, v);
    if (D.LLM.available) await D.Tutor.verbalize(S);
    drawChat(); drawModeExtra(); D.refreshHUD(); renderSide();
    if (D.drawerOpen()) openRAG();
  }
  function drawModeExtra() {
    const el = D.$('#mode-extra');
    if (!el) return;
    const S = D.Tutor.session(W.s, W.m);
    const T_ = D.TUTOR[W.s];
    if (W.m === 'socratic') {
      const n = T_.socratic.length;
      el.innerHTML = `<div class="row nowrap small muted" style="gap:10px"><span>${S.done ? T('All questions answered', 'সব প্রশ্নের উত্তর হয়েছে') : T('Question', 'প্রশ্ন') + ' ' + D.n(Math.min(S.step + 1, n)) + ' / ' + D.n(n)}</span><span style="flex:1">${D.bar((Math.min(S.step, n) / n) * 100, 'thin')}</span></div>`;
    } else if (W.m === 'bloom') {
      const b = D.state.bloom, cur = Math.min(S.step, 5);
      el.innerHTML = `<div class="col" style="gap:6px">${D.BLOOM.map(([k, l], i) => `<div class="meter" style="grid-template-columns:90px 1fr 36px"><span style="font-weight:${i === cur ? 700 : 500};color:${i === cur ? 'var(--em)' : 'var(--muted)'}">${esc(D.tx(l))}</span>${D.bar(b[k] || 0, 'thin')}<span class="v">${D.n(b[k] || 0)}</span></div>`).join('')}</div>`;
    } else if (W.m === 'feynman') {
      el.innerHTML = `<div class="row nowrap" style="gap:14px"><div>${D.ring(S.bestClarity, { size: 58 })}</div><div class="small"><b style="font-weight:600">${T('Best clarity score', 'সেরা স্পষ্টতা')}</b><div class="muted">${T('Ideas covered', 'ব্যাখ্যাকৃত ধারণা')} ${D.n(S.covered.size)} / ${D.n(T_.feynman.concepts.length)}. ${T('Use plain words and an example.', 'সহজ শব্দ ও উদাহরণ ব্যবহার করো।')}</div></div></div>`;
    } else {
      el.innerHTML = `<div class="row nowrap small" style="gap:12px"><label for="hint-lvl" style="white-space:nowrap;font-weight:600">${T('Hint level', 'হিন্ট লেভেল')} <span id="hint-v">${D.n(S.hintLevel)}</span></label><input type="range" id="hint-lvl" min="0" max="3" step="1" value="${S.hintLevel}" aria-label="Hint level"><span class="muted" style="white-space:nowrap">${T('Step', 'ধাপ')} ${D.n(Math.min(S.step + 1, T_.scaffold.steps.length))} / ${D.n(T_.scaffold.steps.length)}</span></div>
        <div class="small muted" style="margin-top:4px">${T('Hints fade by one level after every two correct steps in a row.', 'পরপর দুটি সঠিক ধাপে হিন্ট এক লেভেল কমে।')}</div>`;
      D.$('#hint-lvl').oninput = (e) => { S.hintLevel = +e.target.value; D.$('#hint-v').textContent = D.n(S.hintLevel); };
    }
  }

  function listen() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { D.toast(T('Voice input is not available in this browser. Chrome on Android supports it.', 'এই ব্রাউজারে ভয়েস ইনপুট নেই।'), 'red'); return; }
    const r = new SR();
    r.lang = D.state.lang === 'bn' ? 'bn-BD' : 'en-US';
    r.interimResults = false;
    D.toast(T('Listening', 'শুনছি'), '', 'mic');
    r.onresult = (e) => { D.$('#chat-in').value = e.results[0][0].transcript; };
    r.onerror = () => D.toast(T('Could not hear you. Check microphone permission.', 'শোনা যায়নি। মাইক্রোফোনের অনুমতি দেখুন।'), 'red');
    r.start();
  }

  /* ---------------- Explainability drawer ---------------- */
  function openRAG() {
    const tr = D.Tutor.session(W.s, W.m).lastTrace;
    if (tr) D.openDrawer(D.ragDrawerHTML(tr));
  }
  D.ragDrawerHTML = (tr) => {
    const g = tr.grounding || { score: 0, supported: 0, total: 0, unsupported: [] };
    const modeName = (MODES.find((m) => m[0] === tr.mode) || [0, 0, { en: tr.mode, bn: tr.mode }])[2];
    const steps = tr.steps || [];
    const guard = steps.filter((s) => ['pii', 'inj', 'safety', 'ret'].includes(s.k));
    const reason = steps.filter((s) => ['eval', 'policy'].includes(s.k));
    const POL = {
      socratic: T('Never reveal the final answer; acknowledge correct reasoning; make the question smaller after an error.', 'চূড়ান্ত উত্তর নয়; সঠিক যুক্তি স্বীকার; ভুলে প্রশ্ন ছোট করো।'),
      bloom: T('Move up one level on a correct answer and down one on an error; the Create level is scored with a rubric.', 'সঠিকে এক ধাপ উপরে, ভুলে এক ধাপ নিচে; সৃষ্টি ধাপে রুব্রিক।'),
      feynman: T('Act as a curious classmate; score clarity on ideas covered, simplicity, examples and jargon; ask about gaps.', 'কৌতূহলী সহপাঠী; স্পষ্টতা মাপো; ঘাটতি নিয়ে প্রশ্ন।'),
      scaffold: T('Give the smallest hint that helps; reduce support as consecutive successes grow.', 'ন্যূনতম হিন্ট আগে; সাফল্যে সহায়তা কমাও।')
    };
    const sec = (n, t) => `<h4>${n}. ${t}</h4>`;
    return `<header><div><div class="eyebrow">${T('Explainable AI', 'ব্যাখ্যাযোগ্য AI')}</div><h3 style="margin:4px 0 0">${T('Why this answer?', 'কেন এই উত্তর?')}</h3></div>${D.closeBtn()}</header>
      <div class="body">
        <section class="row nowrap" style="gap:18px;align-items:center">
          ${D.ring(g.score * 100, { size: 88 })}
          <div class="small"><div class="row" style="gap:8px"><b style="font-weight:600">${T('Grounding score', 'গ্রাউন্ডিং স্কোর')}</b>${D.liveTag()}</div><div class="muted" style="margin-top:4px">${D.n(g.supported)} ${T('of', 'এর মধ্যে')} ${D.n(g.total)} ${T('content words in this reply appear in the cited passages.', 'টি শব্দ উদ্ধৃত অংশে আছে।')}</div>
          <div class="muted" style="margin-top:4px">${tr.engine === 'policy+llm' ? T('Policy engine, rephrased by a language model', 'নীতি ইঞ্জিন, ভাষা মডেলে রূপান্তরিত') + (tr.model ? ' (' + esc(tr.model) + ')' : '') : T('Deterministic policy engine, running offline', 'নির্ধারিত নীতি ইঞ্জিন, অফলাইন')}</div></div>
        </section>
        <section>${sec(1, T('Curriculum evidence', 'পাঠ্যসূত্র'))}
          ${(tr.hits || []).map((h, i) => `<div class="card flat tint" style="padding:14px;margin-bottom:10px">
            <div class="row between small"><b style="font-weight:600">[${i + 1}] ${esc(h.chunk.src)}</b>${h.confidence != null ? `<span class="chip ${h.confidence >= D.state.guard.threshold ? 'em' : 'gold'}">${T('confidence', 'আস্থা')} ${h.confidence.toFixed(2)}</span>` : `<span class="chip">${T('curriculum map', 'পাঠ্যক্রম মানচিত্র')}</span>`}</div>
            <div class="small" style="color:var(--gold);margin:3px 0 8px">${esc(h.chunk.ref)}</div>
            <div class="small" style="color:var(--text2)">${esc(D.tx({ en: h.chunk.en, bn: h.chunk.bn }))}</div>
            <div class="row between small muted" style="margin-top:8px"><span>${esc(h.chunk.lic)}</span>${h.chunk.url ? D.extLink(h.chunk.url, T('Open source', 'উৎস খুলুন')) : ''}</div></div>`).join('') || `<p class="small muted">${T('No passages retrieved.', 'কোনো অংশ পাওয়া যায়নি।')}</p>`}
        </section>
        <section>${sec(2, T('Safety checks', 'নিরাপত্তা যাচাই'))}
          ${guard.length ? `<ul class="clean">${guard.map((s) => `<li style="font-size:13px"><span style="color:${s.ok ? 'var(--ok)' : 'var(--danger)'}">${I(s.ok ? 'check' : 'x', 15)}</span><span>${esc(D.tx(s))}</span></li>`).join('')}</ul>` : `<div class="small muted">${T('No learner input yet.', 'এখনও ইনপুট নেই।')}</div>`}
        </section>
        <section>${sec(3, T('Teaching decision', 'শিক্ষণ সিদ্ধান্ত'))}
          <p class="small" style="margin-bottom:8px"><b style="font-weight:600">${esc(D.tx(modeName))}.</b> ${esc(POL[tr.mode] || '')}</p>
          <ol class="small" style="padding-left:18px;margin:0;color:var(--text2)">${reason.map((s) => `<li style="margin:4px 0">${esc(D.tx(s))}</li>`).join('')}</ol>
          ${tr.decision ? `<div class="banner em" style="margin-top:12px">${I('arrowRight', 16)} ${T('Decision', 'সিদ্ধান্ত')}: <b>${esc(D.tx(tr.decision))}</b></div>` : ''}
        </section>
        <section>${sec(4, T('How this is measured', 'যেভাবে মাপা হয়'))}
          <p class="small muted">${T('Passages are retrieved with bilingual BM25 search over the curriculum index. Free questions with confidence below the admin threshold', 'দ্বিভাষিক BM25 দিয়ে অংশ খোঁজা হয়। অ্যাডমিন সীমার নিচে')} (${D.state.guard.threshold.toFixed(2)}) ${T('are declined rather than guessed. The grounding score is the share of the reply\'s content words found in the cited passages. The hosted version adds multilingual embeddings and a model-graded faithfulness check.', 'আস্থা হলে টিউটর অনুমান না করে বিরত থাকে। গ্রাউন্ডিং = উত্তরের শব্দের কত অংশ উৎসে আছে।')}</p>
        </section>
      </div>`;
  };

  /* Career match (shared) */
  D.subjectMastery = (sid) => { const q = D.quest(sid); return Math.round((q.p1 * 0.2 + q.p2 * 0.3 + q.p3 * 0.3 + q.p4 * 0.2)); };
  D.careerMatches = () => D.CAREERS.map((c) => {
    let pct = 0, gap = null, gapV = 101;
    Object.entries(c.w).forEach(([s, w]) => { const m = D.subjectMastery(s); pct += w * m; if (m < gapV) { gapV = m; gap = s; } });
    const bloomAvg = Object.values(D.state.bloom).reduce((a, b) => a + b, 0) / 6;
    pct = Math.round(pct * 0.8 + bloomAvg * 0.2);
    return { c, pct, gap, gapV };
  }).sort((a, b) => b.pct - a.pct);
})();
