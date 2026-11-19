/* Dishari OS - Home */
(function () {
  'use strict';
  const D = window.D;
  const { T, esc } = D;
  const I = (n, s) => D.icon(n, s);

  D.ROUTE_MAP = [
    ['app', 'layers', { en: 'Learning workspace: tutor, labs, quest game, Snap-to-Solve, Co-Pilot, career tools', bn: 'ওয়ার্কস্পেস: টিউটর, ল্যাব, গেম, কো-পাইলট, ক্যারিয়ার' }],
    ['demo-user', 'graduation', { en: 'One-click demo student: Nusrat Jahan from Rangpur', bn: 'এক-ক্লিক ডেমো শিক্ষার্থী: নুসরাত জাহান' }],
    ['demo-admin', 'building', { en: 'One-click demo institutional admin', bn: 'এক-ক্লিক ডেমো অ্যাডমিন' }],
    ['admin', 'shield', { en: 'Curriculum, telemetry, cohorts, roles and guardrails', bn: 'পাঠ্যক্রম, টেলিমেট্রি, ভূমিকা ও গার্ডরেইল' }],
    ['sdg4', 'target', { en: 'SDG 4 alignment, research evidence and impact calculator', bn: 'SDG ৪, গবেষণা ও প্রভাব ক্যালকুলেটর' }],
    ['data', 'database', { en: 'Data pipeline, lineage, schema and knowledge graph', bn: 'ডেটা পাইপলাইন, লিনিয়েজ ও নলেজ গ্রাফ' }],
    ['security', 'lock', { en: 'Privacy, compliance alignment, bias and injection defence', bn: 'গোপনীয়তা, সম্মতি, পক্ষপাত ও ইনজেকশন প্রতিরক্ষা' }],
    ['architecture', 'network', { en: 'Multi-agent system blueprint with a live request trace', bn: 'মাল্টি-এজেন্ট ব্লুপ্রিন্ট ও লাইভ ট্রেস' }],
    ['presentation', 'clock', { en: '180-second pitch storyboard with rehearsal timer', bn: '১৮০ সেকেন্ড পিচ স্টোরিবোর্ড' }],
    ['pitchdeck', 'presentation', { en: 'Ten-slide investor deck', bn: 'দশ স্লাইডের বিনিয়োগকারী ডেক' }],
    ['audit', 'shieldCheck', { en: 'One-click live audit with exportable scorecard', bn: 'এক-ক্লিক লাইভ অডিট' }]
  ];

  D.page('', {
    title: { en: 'From Classroom to Global Career', bn: 'ক্লাসরুম থেকে বিশ্ব ক্যারিয়ার' },
    render(el) {
      const F = D.FACTS;
      const stat = (f) => `<div><div class="kpi">${esc(f.v)}</div><div class="small" style="margin:6px 0 10px;color:var(--text2)">${esc(D.tx(f.label))}</div><a class="small muted" href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.src)}</a></div>`;
      const pillars = [
        ['teacher', T('AI Teacher', 'AI শিক্ষক'), T('Adapts to each learner with four research-based teaching methods, grounded in NCTB and OpenStax.', 'চারটি গবেষণাভিত্তিক পদ্ধতিতে প্রতিটি শিক্ষার্থীর সাথে খাপ খায়।'), 'app', { tab: 'learn' }],
        ['compass', T('Career Navigator', 'ক্যারিয়ার নেভিগেটর'), T('Connects mastered topics to real occupations through a concept, skill and job graph.', 'আয়ত্ত বিষয়কে বাস্তব পেশার সাথে যুক্ত করে।'), 'app', { tab: 'career' }],
        ['route', T('SkillBridge', 'স্কিলব্রিজ'), T('Short, realistic work tasks turn classroom science into applied skill.', 'ছোট বাস্তব কাজে ক্লাসের বিজ্ঞান দক্ষতায় পরিণত হয়।'), 'app', { tab: 'career' }],
        ['idCard', T('Workforce Ready', 'ওয়ার্কফোর্স রেডি'), T('A short AI viva issues a Skill Passport that anyone can verify by QR.', 'ছোট AI ভাইভার পর QR-যাচাইযোগ্য স্কিল পাসপোর্ট।'), 'demo-user', null],
        ['globe', T('Talent Marketplace', 'ট্যালেন্ট মার্কেটপ্লেস'), T('Employers find verified skills, with identity shared only on the learner\'s consent.', 'যাচাইকৃত দক্ষতা; পরিচয় শুধু সম্মতিতে।'), 'app', { tab: 'talent' }]
      ];
      el.innerHTML = `
      <section class="hero">
        <div>
          <div class="eyebrow">LearnSphere AI · UN SDG 4 · AI Builders Congress 2026</div>
          <h1>Dishari OS <span class="bn">দিশারী</span></h1>
          <p class="tagline">${T('From classroom to global career.', 'ক্লাসরুম থেকে বিশ্ব ক্যারিয়ার।')}</p>
          <p class="lead">${T('A bilingual AI tutor that teaches the way learning science recommends, turns the NCTB science curriculum into real-world challenges, and converts what a student masters into a credential employers can trust. Designed first for rural, madrasah and polytechnic learners, and light enough for a 2G connection.', 'একটি দ্বিভাষিক AI টিউটর যা শিক্ষাবিজ্ঞানের সুপারিশমতো শেখায়, NCTB বিজ্ঞানকে বাস্তব চ্যালেঞ্জে রূপ দেয় এবং শিক্ষার্থীর দক্ষতাকে নিয়োগকর্তার কাছে বিশ্বাসযোগ্য সনদে পরিণত করে। গ্রাম, মাদ্রাসা ও পলিটেকনিকের শিক্ষার্থীদের জন্য, ২জি-তেও চলে।')}</p>
          <div class="row" style="margin-top:22px;gap:10px">
            ${D.a('demo-user', T('Explore as a student', 'শিক্ষার্থী হিসেবে দেখুন') + ' ' + I('arrowRight', 16), 'btn primary lg')}
            ${D.a('demo-admin', T('Open the admin console', 'অ্যাডমিন কনসোল'), 'btn lg')}
          </div>
          <p class="small muted" style="margin-top:14px">${T('No sign-up needed. Both demo accounts open with one click.', 'সাইন-আপ লাগবে না। দুটি ডেমো অ্যাকাউন্ট এক ক্লিকে খোলে।')} <a href="#" id="home-tour">${T('Take the 30-second tour', '৩০ সেকেন্ডের ট্যুর')}</a></p>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="row between" style="margin-bottom:14px"><span class="small muted">${T('Biology · Socratic mode', 'জীববিজ্ঞান · সক্রেটিক মোড')}</span><span class="chip em">${I('bookOpen', 13)} ${T('Grounded', 'সূত্রভিত্তিক')}</span></div>
          <div class="msg ai" style="max-width:100%">${T('Your leg muscles work non-stop in a football match. What does a muscle cell need a constant supply of?', 'ফুটবল খেলায় পায়ের পেশি অনবরত কাজ করে। পেশিকোষের কিসের নিরবচ্ছিন্ন সরবরাহ দরকার?')}</div>
          <div class="msg me" style="margin:10px 0 10px auto;width:fit-content">${T('Energy, so ATP?', 'শক্তি, মানে ATP?')}</div>
          <div class="msg ai" style="max-width:100%">${T('Good. Which organelle makes most of that ATP?', 'চমৎকার। কোন অঙ্গাণু বেশিরভাগ ATP তৈরি করে?')}</div>
          <div class="small muted" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)">${I('book', 14)} OpenStax Biology 2e, §4.3 · NCTB HSC Biology, Ch. 1</div>
        </div>
      </section>

      <section class="section" style="margin-top:48px">
        <div class="section-title"><div><div class="eyebrow">${T('Why it is needed', 'কেন প্রয়োজন')}</div><h2>${T('The gap between school and work', 'স্কুল ও কর্মক্ষেত্রের মাঝের ফাঁক')}</h2></div></div>
        <div class="stat-strip">${stat(F.secondary)}${stat(F.tutoring)}${stat(F.dropout)}${stat(F.neet)}</div>
      </section>

      <section class="section">
        <div class="section-title"><div><div class="eyebrow">${T('What it does', 'কী করে')}</div><h2>${T('Five pillars, one learning journey', 'পাঁচ স্তম্ভ, একটি শেখার যাত্রা')}</h2><p>${T('Each pillar hands the learner to the next: learn a concept, apply it, prove it, and be found for it.', 'প্রতিটি স্তম্ভ পরেরটিতে নিয়ে যায়: শেখা, প্রয়োগ, প্রমাণ, এবং সুযোগ পাওয়া।')}</p></div></div>
        <div class="grid g5">
          ${pillars.map(([ic, t, d, r, p], i) => `<a class="card hoverable flat" style="color:inherit;text-decoration:none;padding:20px" href="${esc(D.href(r, p))}" data-link="${r}"${p ? ` data-params="${esc(new URLSearchParams(p).toString())}"` : ''}>
            <div class="row between"><span class="ic-box">${I(ic, 20)}</span><span class="mono small muted">0${i + 1}</span></div>
            <h3 style="margin:16px 0 6px">${esc(t)}</h3><p class="small muted" style="margin:0">${esc(d)}</p></a>`).join('')}
        </div>
      </section>

      <section class="section">
        <div class="grid g2" style="gap:28px">
          <div>
            <div class="eyebrow">${T('How it teaches', 'কীভাবে শেখায়')}</div>
            <h2 style="margin:8px 0 16px">${T('Four teaching methods, one tutor', 'চার পদ্ধতি, এক টিউটর')}</h2>
            <ul class="clean">
              ${[['help', T('Socratic inquiry', 'সক্রেটিক অনুসন্ধান'), T('Asks progressively narrower questions instead of giving answers.', 'উত্তর না দিয়ে ধাপে ধাপে প্রশ্ন করে।')], ['ladder', T("Bloom's mastery ladder", 'ব্লুম ল্যাডার'), T('Moves from remembering to creating, with a meter for each level.', 'স্মরণ থেকে সৃষ্টি, প্রতিটি স্তরে মিটার।')], ['message', T('Feynman teach-back', 'ফাইনম্যান টিচ-ব্যাক'), T('The learner explains; the tutor asks follow-ups and scores clarity.', 'শিক্ষার্থী ব্যাখ্যা করে; টিউটর স্পষ্টতা মাপে।')], ['mountain', T('Scaffolding', 'স্ক্যাফোল্ডিং'), T('Breaks problems into steps with hints that fade as skill grows.', 'সমস্যাকে ধাপে ভাগ করে, হিন্ট ক্রমশ কমে।')]].map(([ic, t, d]) => `<li>${I(ic, 18)}<div><b style="font-weight:600">${esc(t)}</b><div class="small muted">${esc(d)}</div></div></li>`).join('')}
            </ul>
          </div>
          <div>
            <div class="eyebrow">${T('How it motivates', 'কীভাবে উদ্দীপ্ত করে')}</div>
            <h2 style="margin:8px 0 16px">${T('A four-part quest in every subject', 'প্রতিটি বিষয়ে চার পর্বের কোয়েস্ট')}</h2>
            <ul class="clean">
              ${[['puzzle', T('Concept sandbox', 'ধারণা স্যান্ডবক্স'), T('Build a cell, balance equations, shape curves, wire logic gates.', 'কোষ গড়া, সমীকরণ সমতা, লজিক গেট।')], ['target', T('Practice sprint', 'অনুশীলন স্প্রিন্ট'), T('Adaptive questions; three correct in a row doubles points.', 'অ্যাডাপটিভ প্রশ্ন; পরপর তিনটি সঠিকে দ্বিগুণ পয়েন্ট।')], ['swords', T('Real-world challenge', 'বাস্তব চ্যালেঞ্জ'), T('A dengue case, a polluted river, a flood-relief drone, a clinic database.', 'ডেঙ্গু, দূষিত নদী, ত্রাণ ড্রোন, ক্লিনিকের ডেটাবেজ।')], ['users', T('Co-op league', 'কো-অপ লিগ'), T('Mixed teams from urban, rural, madrasah and polytechnic schools.', 'শহর, গ্রাম, মাদ্রাসা ও পলিটেকনিকের মিশ্র দল।')]].map(([ic, t, d]) => `<li>${I(ic, 18)}<div><b style="font-weight:600">${esc(t)}</b><div class="small muted">${esc(d)}</div></div></li>`).join('')}
            </ul>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="card" style="padding:28px">
          <div class="section-title" style="margin-bottom:10px"><div><div class="eyebrow">${T('Evidence', 'প্রমাণ')}</div><h2>${T('Built on learning science, stated honestly', 'শিক্ষাবিজ্ঞানের ভিত্তিতে, সততার সাথে')}</h2></div>${D.a('sdg4', T('Read the evidence', 'প্রমাণ দেখুন') + ' ' + I('arrowRight', 15), 'btn')}</div>
          <div class="grid g3" style="margin-top:12px">
            ${D.RESEARCH.slice(0, 3).map((r) => `<div><b style="font-weight:600">${esc(D.tx(r.title))}</b><p class="small muted" style="margin:6px 0 0">${esc(D.tx(r.finding))}</p></div>`).join('')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-title"><div><div class="eyebrow">${T('For judges', 'বিচারকদের জন্য')}</div><h2>${T('All eleven required routes', 'প্রয়োজনীয় এগারোটি রুট')}</h2><p>${T('Every route is public and works without an account. Press Ctrl + K to jump anywhere.', 'প্রতিটি রুট উন্মুক্ত। Ctrl + K চেপে যেকোনো জায়গায় যান।')}</p></div></div>
        <div class="table-wrap"><table class="t"><tbody>
          ${D.ROUTE_MAP.map(([r, ic, d]) => `<tr><td style="width:44px;color:var(--em)">${I(ic, 18)}</td><td style="width:170px">${D.a(r, '/' + r, 'mono')}</td><td class="muted">${esc(D.tx(d))}</td></tr>`).join('')}
        </tbody></table></div>
      </section>

      <footer class="section small muted" style="border-top:1px solid var(--line);padding-top:20px;display:flex;gap:16px;flex-wrap:wrap;justify-content:space-between">
        <span>${T('Figures marked', 'চিহ্নিত')} ${D.demoTag()} ${T('are illustrative; figures marked', 'সংখ্যা নমুনা;')} ${D.liveTag()} ${T('are computed in your browser; external statistics link to their sources.', 'ব্রাউজারে গণনা; বাইরের পরিসংখ্যানে উৎস আছে।')}</span>
        <span>Dishari OS · AI Builders Congress 2026</span>
      </footer>`;
      D.$('#home-tour').onclick = (e) => { e.preventDefault(); D.tour(0); };
    }
  });
})();
