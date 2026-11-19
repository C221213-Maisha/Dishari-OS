/* Dishari OS, workspace tools: Snap-to-Solve (Vision Autopsy Agent), Teacher & Parent Co-Pilot,
   Career Bridge + micro-internships + Skill Passport (Career Graph Agent), Talent Marketplace. */
(function () {
  'use strict';
  const D = window.D;
  const { T, esc } = D;
  const tx = D.tx;
  D.TABS = {};

  /* ============================== Snap-to-Solve ============================== */
  D.TABS.snap = (body) => {
    let cur = 0, ran = false, guess = null, upload = null;
    const draw = () => {
      const S = D.SNAPS[cur];
      body.innerHTML = `<div class="bento">
        <div class="card s4">
          <div class="card-head"><h3>${T('Snap-to-Solve', 'স্ন্যাপ-টু-সলভ')}</h3><span class="chip">${T('Vision Autopsy Agent', 'ভিশন অটোপসি এজেন্ট')}</span></div>
          <p class="small muted">${T('Pick a sample of handwritten student work (or upload a photo). The agent pinpoints the exact line of the conceptual mistake and prescribes 3 remedial drills.', 'হাতে লেখা নমুনা বেছে নাও বা ছবি আপলোড করো। এজেন্ট ভুলের সঠিক লাইন চিহ্নিত করে ৩টি প্রতিকারমূলক অনুশীলন দেয়।')}</p>
          <div class="col" style="gap:8px">${D.SNAPS.map((s, i) => `<button class="pick ${i === cur && !upload ? 'active' : ''}" data-snap="${i}"><b>${D.icon(D.subject(s.subject).icon, 15)} ${esc(tx(s.title))}</b><span>${esc(s.student)}</span></button>`).join('')}</div>
          <label class="btn" style="margin-top:12px;width:100%;justify-content:center;cursor:pointer">${T('Upload a photo of your work', 'তোমার কাজের ছবি আপলোড')}<input type="file" accept="image/*" id="snap-up" class="sr-only"></label>
          <p class="small muted" style="margin-top:8px">${T('Photos are processed for this request only and never used for training.', 'ছবি শুধু এই অনুরোধে ব্যবহৃত হয়, প্রশিক্ষণে কখনো নয়।')}</p>
        </div>
        <div class="card s8">
          ${upload ? uploadView() : `<div class="card-head"><h3>${esc(tx(S.title))}</h3><div class="row" style="gap:6px">${ran ? `<span class="chip danger">${T('Line', 'লাইন')} ${D.n(S.err + 1)}</span>` : `<span class="chip gold">${T('Predict the wrong line first for +15 XP', 'আগে ভুল লাইন অনুমান করো: +১৫ XP')}</span>`}</div></div>
          <div class="paper" id="paper">${S.lines.map((l, i) => `<span class="hl ${ran && i === S.err ? 'err' : ''}" data-ln="${i}" style="${guess === i && !ran ? 'outline:2px dashed #1d5fbf' : ''}">${esc(l)}</span>`).join('')}${!ran ? '' : ''}</div>
          <div class="row" style="margin-top:12px"><button class="btn primary" id="autopsy" ${ran ? 'disabled' : ''}>${T('Run Mistake Autopsy', 'ভুলের অটোপসি চালাও')}</button>${guess != null && !ran ? `<span class="small muted">${T('Your prediction: line', 'তোমার অনুমান: লাইন')} ${D.n(guess + 1)}</span>` : ''}</div>
          <div id="autopsy-out">${ran ? result(S) : ''}</div>`}
        </div></div>`;
      D.$$('[data-snap]', body).forEach((b) => (b.onclick = () => { cur = +b.dataset.snap; ran = false; guess = null; upload = null; draw(); }));
      D.$('#snap-up').onchange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.size > 4 * 1024 * 1024) { D.toast(T('Please use an image under 4 MB (2G-friendly).', '৪ MB-এর ছোট ছবি দিন।'), 'red'); return; }
        const r = new FileReader();
        r.onload = () => { upload = { url: r.result, name: f.name, size: f.size }; draw(); };
        r.readAsDataURL(f);
      };
      if (upload) return bindUpload();
      D.$$('[data-ln]', body).forEach((s) => (s.onclick = () => { if (ran) return; guess = +s.dataset.ln; draw(); }));
      const btn = D.$('#autopsy');
      if (btn) btn.onclick = async () => {
        const p = D.$('#paper');
        if (!D.state.lite) { p.insertAdjacentHTML('beforeend', '<div class="scanline"></div>'); await D.sleep(1300); }
        ran = true;
        if (guess === S.err) { D.answer(true); D.addXP(15, T('Correct prediction', 'সঠিক অনুমান')); }
        D.log('snap.autopsy', S.id);
        draw();
        bindDrills(S);
      };
      if (ran) bindDrills(S);
    };
    const result = (S) => `<div class="card flat tint" style="margin-top:14px">
        <div class="row between"><b>${T('Diagnosis', 'নির্ণয়')}: ${esc(tx(S.tag))}</b>${guess != null ? (guess === S.err ? `<span class="chip em">${T('You predicted it!', 'তুমি ঠিক অনুমান করেছ!')}</span>` : `<span class="chip">${T('You guessed line', 'তোমার অনুমান')} ${D.n(guess + 1)}</span>`) : ''}</div>
        <p style="margin:8px 0">${esc(tx(S.explain))}</p>
        <div class="small">${T('Corrected', 'সংশোধিত')}: <code>${esc(S.fix)}</code> · <button class="btn sm ghost" data-src="${S.cite}">${T('Textbook source', 'পাঠ্যসূত্র')}</button></div>
      </div>
      <h4 style="margin:16px 0 8px">${T('3 targeted remedial drills', '৩টি লক্ষ্যভিত্তিক অনুশীলন')}</h4>
      <div class="grid g3">${S.drills.map((d, i) => { const ord = D.order(d.o.length, i + 31); return `<div class="card flat tint" data-drill="${i}"><div class="small" style="font-weight:700;margin-bottom:8px">${D.n(i + 1)}. ${esc(tx(d.q))}</div><div class="opts">${ord.map((k, j) => `<button class="opt" data-dk="${k}"><span class="k">${'ABCD'[j]}</span><span>${esc(typeof d.o[k] === 'string' ? d.o[k] : tx(d.o[k]))}</span></button>`).join('')}</div></div>`; }).join('')}</div>
      <button class="btn sm" id="queue" style="margin-top:10px">${T('Add drills to my practice queue', 'অনুশীলন তালিকায় যোগ করো')}</button>`;
    const bindDrills = (S) => {
      D.$$('[data-src]', body).forEach((b) => (b.onclick = () => D.showSource(b.dataset.src)));
      D.$$('[data-drill]', body).forEach((card) => {
        const d = S.drills[+card.dataset.drill];
        D.$$('[data-dk]', card).forEach((b) => (b.onclick = () => { const ok = +b.dataset.dk === d.a; D.answer(ok); D.$$('.opt', card).forEach((x) => { x.disabled = true; if (+x.dataset.dk === d.a) x.classList.add('right'); }); if (!ok) b.classList.add('wrong'); else D.addXP(10, T('Remedial drill', 'প্রতিকার অনুশীলন')); }));
      });
      const q = D.$('#queue'); if (q) q.onclick = () => { D.state.queue.push(S.id); D.save(); D.toast(T('Added to your practice queue', 'অনুশীলন তালিকায় যোগ হয়েছে')); };
    };
    const uploadView = () => `<div class="card-head"><h3>${esc(upload.name)}</h3><button class="btn sm ghost" id="up-clear"></button></div>
      <img src="${upload.url}" alt="${T('Uploaded student work', 'আপলোড করা কাজ')}" style="max-width:100%;max-height:340px;border-radius:12px;border:1px solid var(--line)">
      <div class="row" style="margin-top:12px"><button class="btn primary" id="up-run">${T('Run Vision Autopsy', 'ভিশন অটোপসি চালাও')}</button><span class="small muted">${D.n(Math.round(upload.size / 1024))} KB</span></div>
      <div id="up-out" style="margin-top:12px"></div>`;
    const bindUpload = () => {
      D.$('#up-clear').onclick = () => { upload = null; draw(); };
      D.$('#up-run').onclick = async () => {
        const out = D.$('#up-out');
        await D.probeLLM();
        if (!D.LLM.available) {
          out.innerHTML = `<div class="banner info">ℹ<span>${T('Reading arbitrary handwriting needs the cloud vision model (/api/autopsy), which is not configured on this deployment, so nothing was analysed, we will not invent a diagnosis. The three samples on the left run fully offline and show the complete autopsy flow.', 'হাতের লেখা পড়তে ক্লাউড ভিশন মডেল দরকার, যা এই ডিপ্লয়মেন্টে নেই, তাই কোনো বিশ্লেষণ হয়নি; আমরা মনগড়া নির্ণয় দিই না। বাঁ দিকের নমুনাগুলো অফলাইনে পুরো প্রক্রিয়া দেখায়।')}</span></div>`;
          return;
        }
        out.innerHTML = `<div class="typing"><span></span><span></span><span></span></div>`;
        try {
          const r = await fetch(new URL('api/autopsy', document.baseURI), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: upload.url, lang: D.state.lang }) });
          const j = await r.json();
          out.innerHTML = j.text ? `<div class="card flat tint"><div class="small muted">${esc(j.model || '')}</div><div style="white-space:pre-wrap">${esc(j.text)}</div></div>` : `<div class="feedback no">${esc(j.error || 'Error')}</div>`;
          D.log('snap.vision_autopsy', upload.name);
        } catch (e) { out.innerHTML = `<div class="feedback no">${T('The vision service could not be reached.', 'ভিশন সার্ভিসে পৌঁছানো যায়নি।')}</div>`; }
      };
    };
    draw();
  };

  /* ============================== Teacher & Parent Co-Pilot ============================== */
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const CQ = {
    eq: () => { const h = rnd([20, 45, 80, 125]), v = rnd([8, 10, 12, 15]), t = Math.sqrt((2 * h) / 10), R = +(v * t).toFixed(1), off = +(R + rnd([-6, -3, 4])).toFixed(1);
      return { stem: { en: `A relief drone flies horizontally at ${h} m above a flooded village with speed ${v} m/s and releases a medicine box. (g = 10 m/s², ignore air resistance)`, bn: `একটি ত্রাণ ড্রোন বন্যাকবলিত গ্রামের ${h} m উপরে ${v} m/s বেগে অনুভূমিকভাবে উড়ে ওষুধের বাক্স ছাড়ে। (g = 10 m/s², বায়ুর বাধা উপেক্ষা)` },
        parts: [[{ en: 'What is projectile motion?', bn: 'প্রক্ষেপক গতি কাকে বলে?' }, 1, 'remember'], [{ en: 'Why does the horizontal velocity of the box stay constant?', bn: 'বাক্সের অনুভূমিক বেগ কেন ধ্রুব থাকে?' }, 2, 'understand'], [{ en: 'Find the time the box takes to reach the ground.', bn: 'বাক্সটি ভূমিতে পৌঁছাতে কত সময় লাগে নির্ণয় করো।' }, 3, 'apply'], [{ en: `The pilot releases the box ${off} m before the shelter. Will it land on the shelter? Analyse mathematically.`, bn: `পাইলট আশ্রয়কেন্দ্রের ${off} m আগে বাক্স ছাড়লেন। বাক্সটি কি আশ্রয়কেন্দ্রে পড়বে? গাণিতিকভাবে বিশ্লেষণ করো।` }, 4, 'analyze']],
        key: { en: `t = √(2h/g) = ${t.toFixed(2)} s; range = v·t = ${R} m → ${Math.abs(off - R) < 0.5 ? 'yes' : 'no, it lands ' + Math.abs(R - off).toFixed(1) + ' m ' + (R > off ? 'beyond' : 'short of') + ' the shelter'}.`, bn: `t = √(2h/g) = ${t.toFixed(2)} s; পাল্লা = ${R} m → ${Math.abs(off - R) < 0.5 ? 'হ্যাঁ' : 'না, ' + Math.abs(R - off).toFixed(1) + ' m ' + (R > off ? 'পরে' : 'আগে') + ' পড়বে'}।` }, cite: 'eq-03' }; },
    chem: () => { const Va = rnd([20, 25, 50]), Mb = rnd([0.1, 0.2]), Vb = rnd([10, 12.5, 15, 20]), Ma = +((Mb * Vb) / Va).toFixed(3);
      return { stem: { en: `${Va}.0 mL of acidic river water (assume HCl) needs ${Vb} mL of ${Mb.toFixed(2)} M NaOH to reach the phenolphthalein end-point.`, bn: `${Va}.0 mL অম্লীয় নদীর পানিতে (HCl ধরো) ফেনলফথ্যালিন প্রান্তবিন্দুতে পৌঁছাতে ${Mb.toFixed(2)} M NaOH-এর ${Vb} mL লাগে।` },
        parts: [[{ en: 'What is a titration?', bn: 'টাইট্রেশন কী?' }, 1, 'remember'], [{ en: 'Why does phenolphthalein turn pink at the end-point?', bn: 'প্রান্তবিন্দুতে ফেনলফথ্যালিন কেন গোলাপি হয়?' }, 2, 'understand'], [{ en: 'Calculate the molarity of HCl in the river sample.', bn: 'নমুনায় HCl-এর মোলারিটি নির্ণয় করো।' }, 3, 'apply'], [{ en: 'Should the factory be allowed to discharge this water? Evaluate using pH and neutralisation.', bn: 'কারখানাকে কি এই পানি নিঃসরণের অনুমতি দেওয়া উচিত? pH ও প্রশমনের আলোকে মূল্যায়ন করো।' }, 4, 'evaluate']],
        key: { en: `M_acid = (${Mb} × ${Vb}) / ${Va} = ${Ma} M; HCl + NaOH → NaCl + H₂O (1:1).`, bn: `M_acid = (${Mb} × ${Vb}) / ${Va} = ${Ma} M; HCl + NaOH → NaCl + H₂O (১:১)।` }, cite: 'chem-03' }; },
    bio: () => { const pl = rnd([62000, 85000, 98000]), wbc = rnd([2800, 3200, 3600]);
      return { stem: { en: `A 15-year-old in Sylhet has had fever for 4 days. Report: platelets ${pl.toLocaleString()}/µL, WBC ${wbc.toLocaleString()}/µL, NS1 positive.`, bn: `সিলেটের ১৫ বছর বয়সী একজনের ৪ দিন জ্বর। রিপোর্ট: প্লাটিলেট ${pl.toLocaleString()}/µL, WBC ${wbc.toLocaleString()}/µL, NS1 পজিটিভ।` },
        parts: [[{ en: 'What is an antibody?', bn: 'অ্যান্টিবডি কী?' }, 1, 'remember'], [{ en: 'Explain the role of cytotoxic T cells in viral infection.', bn: 'ভাইরাস সংক্রমণে সাইটোটক্সিক T কোষের ভূমিকা ব্যাখ্যা করো।' }, 2, 'understand'], [{ en: 'Use the report to identify the likely infection.', bn: 'রিপোর্ট থেকে সম্ভাব্য সংক্রমণ শনাক্ত করো।' }, 3, 'apply'], [{ en: 'A neighbour suggests antibiotics. Evaluate this advice using immunology.', bn: 'প্রতিবেশী অ্যান্টিবায়োটিক খেতে বলছেন। রোগপ্রতিরোধবিদ্যার আলোকে মূল্যায়ন করো।' }, 4, 'evaluate']],
        key: { en: 'Low platelets + low WBC + NS1⁺ → dengue (viral). Antibiotics act on bacteria, not viruses; clinician-led supportive care.', bn: 'কম প্লাটিলেট + কম WBC + NS1⁺ → ডেঙ্গু (ভাইরাস)। অ্যান্টিবায়োটিক ভাইরাসে কাজ করে না।' }, cite: 'bio-06' }; },
    math: () => { const k = rnd([0.05, 0.1]), b = rnd([2, 3]), c = rnd([10, 20]); const vx = b / (2 * k), vy = -k * vx * vx + b * vx + c;
      return { stem: { en: `A drone's path is y = −${k}x² + ${b}x + ${c} (metres).`, bn: `একটি ড্রোনের পথ y = −${k}x² + ${b}x + ${c} (মিটার)।` },
        parts: [[{ en: 'What is a quadratic function?', bn: 'দ্বিঘাত ফাংশন কী?' }, 1, 'remember'], [{ en: 'Why does this parabola open downward?', bn: 'পরাবৃত্তটি কেন নিচে খোলে?' }, 2, 'understand'], [{ en: 'Find the maximum height of the drone.', bn: 'ড্রোনের সর্বোচ্চ উচ্চতা নির্ণয় করো।' }, 3, 'apply'], [{ en: 'A 35 m tower stands at x = 12. Will the drone clear it? Analyse.', bn: 'x = 12-এ ৩৫ m টাওয়ার আছে। ড্রোন কি পার হবে? বিশ্লেষণ করো।' }, 4, 'analyze']],
        key: { en: `Vertex x = ${vx}, y_max = ${vy.toFixed(1)} m; y(12) = ${(-k * 144 + b * 12 + c).toFixed(1)} m → ${(-k * 144 + b * 12 + c) > 35 ? 'clears' : 'does not clear'} the tower.`, bn: `শীর্ষ x = ${vx}, সর্বোচ্চ ${vy.toFixed(1)} m; y(12) = ${(-k * 144 + b * 12 + c).toFixed(1)} m → ${(-k * 144 + b * 12 + c) > 35 ? 'পার হবে' : 'পার হবে না'}।` }, cite: 'math-04' }; },
    ict: () => { const n = rnd([5, 10, 20]);
      return { stem: { en: `A student writes:\ntotal = 0\nfor i in range(1, ${n}):\n    total += i\nprint(total)`, bn: `একজন শিক্ষার্থী লিখল:\ntotal = 0\nfor i in range(1, ${n}):\n    total += i\nprint(total)` },
        parts: [[{ en: 'What is a loop?', bn: 'লুপ কী?' }, 1, 'remember'], [{ en: 'Explain what range(1, n) produces.', bn: 'range(1, n) কী দেয় ব্যাখ্যা করো।' }, 2, 'understand'], [{ en: 'What does the program print?', bn: 'প্রোগ্রামটি কী প্রিন্ট করবে?' }, 3, 'apply'], [{ en: `The student wanted 1 + … + ${n}. Find and justify the fix.`, bn: `শিক্ষার্থী ১ + … + ${n} চেয়েছিল। ভুল খুঁজে সমাধান যুক্তিসহ দাও।` }, 4, 'evaluate']],
        key: { en: `Prints ${(n - 1) * n / 2}; fix: range(1, ${n + 1}) → ${n * (n + 1) / 2}.`, bn: `প্রিন্ট ${(n - 1) * n / 2}; সমাধান: range(1, ${n + 1}) → ${n * (n + 1) / 2}।` }, cite: 'ict-03' }; }
  };
  D.TABS.copilot = (body) => {
    const st = { s: D.W.s, n: 5, lang: D.state.lang === 'bn' ? 'bn' : 'both', out: null };
    const gen = () => {
      const cq = CQ[st.s]();
      const pool = D.PRACTICE[st.s].map((q) => ({ q: q.q, o: q.o, a: q.a, t: q.d === 1 ? 'remember' : q.d === 2 ? 'understand' : 'apply', cite: q.cite }))
        .concat(D.TUTOR[st.s].bloom.filter((b) => b.o).map((b) => ({ q: b.q, o: b.o, a: b.a, t: b.t, cite: b.cite[0] })));
      const mcq = pool.sort(() => Math.random() - 0.5).slice(0, st.n).map((q, i) => { const ord = D.order(q.o.length, i + 41); return Object.assign({}, q, { ord }); });
      st.out = { cq, mcq };
      D.log('copilot.generate', st.s + ':' + st.n);
    };
    const L = (o) => st.lang === 'both' ? `${esc(o.bn)}<br><span class="muted small">${esc(o.en)}</span>` : esc(o[st.lang]);
    const draw = () => {
      if (!st.out) gen();
      const { cq, mcq } = st.out;
      const BN = ['ক', 'খ', 'গ', 'ঘ'];
      body.innerHTML = `<div class="bento">
        <div class="card s8" id="cq-print">
          <div class="card-head no-print"><h3>${T('NCTB Creative Question & MCQ generator', 'NCTB সৃজনশীল প্রশ্ন ও MCQ জেনারেটর')}</h3><div class="row" style="gap:6px"><button class="btn sm" id="regen">${T('Generate new set', 'নতুন সেট')}</button><button class="btn sm" id="cq-copy">${T('Copy', 'কপি')}</button><button class="btn sm" id="cq-print-btn">${T('Print', 'প্রিন্ট')}</button></div></div>
          <div class="row no-print" style="gap:8px;margin-bottom:12px">
            <label class="field" style="flex:1">${T('Subject', 'বিষয়')}<select id="cp-s">${D.SUBJECTS.map((s) => `<option value="${s.id}" ${s.id === st.s ? 'selected' : ''}>${esc(tx(s.name))}</option>`).join('')}</select></label>
            <label class="field" style="flex:1">${T('MCQs', 'MCQ সংখ্যা')}<select id="cp-n">${[3, 5, 8].map((n) => `<option ${n === st.n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
            <label class="field" style="flex:1">${T('Language', 'ভাষা')}<select id="cp-l"><option value="bn" ${st.lang === 'bn' ? 'selected' : ''}>বাংলা</option><option value="en" ${st.lang === 'en' ? 'selected' : ''}>English</option><option value="both" ${st.lang === 'both' ? 'selected' : ''}>${T('Both', 'উভয়')}</option></select></label>
          </div>
          <div class="eyebrow">${T('Creative Question (CQ), NCTB format', 'সৃজনশীল প্রশ্ন, NCTB ফরম্যাট')}</div>
          <div class="card flat tint" style="margin-top:8px"><b>${T('Stimulus', 'উদ্দীপক')}:</b><div style="white-space:pre-wrap;margin-top:4px">${L(cq.stem)}</div></div>
          <table class="t" style="margin-top:8px"><tbody>${cq.parts.map((p, i) => `<tr><td style="width:36px"><b>${BN[i]})</b></td><td>${L(p[0])}</td><td class="num" style="width:40px">${D.n(p[1])}</td><td style="width:110px"><span class="chip">${esc(tx(D.BLOOM.find((b) => b[0] === p[2])[1]))}</span></td></tr>`).join('')}</tbody></table>
          <details style="margin-top:8px"><summary class="small" style="cursor:pointer;font-weight:700">${T('Answer key & marking guidance', 'উত্তরমালা ও নম্বর বণ্টন')}</summary><p class="small" style="margin-top:6px">${L(cq.key)}</p><p class="small muted">${T('Source', 'উৎস')}: ${esc((D.KB.find((c) => c.id === cq.cite) || {}).src || '')}: ${esc((D.KB.find((c) => c.id === cq.cite) || {}).ref || '')}</p></details>
          <div class="eyebrow" style="margin-top:16px">MCQ</div>
          <ol style="padding-left:20px;margin:8px 0 0">${mcq.map((q) => `<li style="margin-bottom:10px"><div>${L(typeof q.q === 'string' ? { en: q.q, bn: q.q } : q.q)} <span class="chip" style="margin-left:4px">${esc(tx(D.BLOOM.find((b) => b[0] === q.t)[1]))}</span></div><div class="small" style="margin-top:4px">${q.ord.map((k, j) => `<span style="margin-right:14px">${['ক', 'খ', 'গ', 'ঘ'][j]}) ${esc(typeof q.o[k] === 'string' ? q.o[k] : tx(q.o[k]))}${k === q.a ? D.icon('check', 16) : ''}</span>`).join('')}</div></li>`).join('')}</ol>
        </div>
        <div class="col s4" style="gap:16px">
          <div class="card"><div class="card-head"><h3>${T('Class misconception heatmap', 'ক্লাসের ভুল ধারণা হিটম্যাপ')}</h3>${D.demoTag()}</div>
            ${[[T('Sign of ∫ sin x', '∫ sin x-এর চিহ্ন'), 62], [T('Changing subscripts', 'পাদাঙ্ক বদলানো'), 48], [T('range() stop value', 'range() stop মান'), 55], [T('Antibiotics vs viruses', 'অ্যান্টিবায়োটিক বনাম ভাইরাস'), 31], [T('Brackets in rearranging', 'পুনর্বিন্যাসে বন্ধনী'), 44]].map(([l, v]) => `<div class="meter" style="grid-template-columns:1fr 90px 40px;margin-bottom:6px"><span class="small">${esc(l)}</span>${D.bar(v, v > 50 ? 'red' : 'gold')}<span class="v">${D.n(v)}%</span></div>`).join('')}
            <button class="btn sm" id="assign" style="margin-top:8px">${T('Assign remedial set to struggling students', 'দুর্বল শিক্ষার্থীদের প্রতিকার সেট দাও')}</button></div>
          <div class="card"><div class="card-head"><h3>${T('Parent snapshot (Bangla)', 'অভিভাবক স্ন্যাপশট (বাংলা)')}</h3>${D.liveTag()}</div><div id="parent"></div></div>
        </div></div>`;
      D.$('#regen').onclick = () => { st.out = null; draw(); };
      D.$('#cp-s').onchange = (e) => { st.s = e.target.value; st.out = null; draw(); };
      D.$('#cp-n').onchange = (e) => { st.n = +e.target.value; st.out = null; draw(); };
      D.$('#cp-l').onchange = (e) => { st.lang = e.target.value; draw(); };
      D.$('#cq-print-btn').onclick = () => window.print();
      D.$('#cq-copy').onclick = () => { const t = D.$('#cq-print').innerText; navigator.clipboard && navigator.clipboard.writeText(t).then(() => D.toast(T('Copied', 'কপি হয়েছে'))); };
      D.$('#assign').onclick = () => { D.log('copilot.assign_remedial', st.s); D.toast(T('Remedial set assigned to 7 students (sample class)', '৭ জন শিক্ষার্থীকে প্রতিকার সেট দেওয়া হয়েছে (নমুনা)')); };
      parent();
    };
    const parent = () => {
      const g = D.state.game;
      const name = D.state.role === 'student' ? 'নুসরাত' : 'আপনার সন্তান';
      const best = D.SUBJECTS.map((s) => [s, D.subjectMastery(s.id)]).sort((a, b) => b[1] - a[1]);
      const sms = `${name} এই সপ্তাহে দিশারীতে ${D.n(g.streak)} দিন টানা পড়েছে। শক্তি: ${best[0][0].name.bn} (${D.n(best[0][1])}%)। মনোযোগ দরকার: ${best[best.length - 1][0].name.bn}।`;
      const seg = Math.ceil(sms.length / 67);
      D.$('#parent').innerHTML = `<p class="small" style="line-height:1.8">প্রিয় অভিভাবক, ${name} এই সপ্তাহে <b>${D.n(g.streak)} দিন</b> টানা অনুশীলন করেছে এবং মোট <b>${D.n(g.xp)} XP</b> অর্জন করেছে। সবচেয়ে ভালো করছে <b>${best[0][0].name.bn}</b>-এ (${D.n(best[0][1])}%)। <b>${best[best.length - 1][0].name.bn}</b>-এ আরও সহায়তা দরকার, বাসায় ১৫ মিনিট "শিক্ষককে শেখাও" অনুশীলনে উৎসাহ দিন।</p>
        <div class="card flat tint small"><b>SMS</b> <span class="muted">(${D.n(sms.length)} ${T('chars', 'অক্ষর')} · ${D.n(seg)} ${T('Unicode segment(s)', 'ইউনিকোড অংশ')})</span><div style="margin-top:4px">${esc(sms)}</div></div>
        <button class="btn sm" id="sms" style="margin-top:8px">${T('Send to guardian (simulated)', 'অভিভাবককে পাঠাও (সিমুলেটেড)')}</button>`;
      D.$('#sms').onclick = () => { D.log('copilot.parent_sms', 'simulated'); D.toast(T('SMS queued (simulated, no message was sent)', 'SMS সারিতে (সিমুলেটেড, কোনো বার্তা পাঠানো হয়নি)')); };
    };
    draw();
  };

  /* ============================== Career Bridge & Skill Passport ============================== */
  async function sha256(s) {
    if (window.crypto && crypto.subtle) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, '0')).join(''); }
    let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h.toString(16).padStart(64, '0');
  }
  const canon = (p) => JSON.stringify({ id: p.id, holder: p.holder, skill: p.skill, level: p.level, onet: p.onet, issued: p.issued, viva: p.viva, task: p.task, issuer: 'Dishari OS demo issuer' });
  const b64u = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64u = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
  D.passportHash = async (p) => { if (!p.hash) p.hash = await sha256(canon(p)); return p.hash; };
  D.passportURL = (p) => { const payload = b64u(JSON.stringify({ i: p.id, n: p.holder, s: p.skill, l: p.level, o: p.onet, d: p.issued, v: p.viva, t: p.task, h: p.hash.slice(0, 16) })); const u = new URL(D.href('app', { tab: 'talent', verify: payload }), document.baseURI); return u.toString(); };
  D.verifyPayload = async (raw) => {
    try {
      let s = raw.trim();
      const m = s.match(/verify=([A-Za-z0-9_-]+)/); if (m) s = m[1];
      const o = JSON.parse(unb64u(s));
      const p = { id: o.i, holder: o.n, skill: o.s, level: o.l, onet: o.o, issued: o.d, viva: o.v, task: o.t };
      const h = await sha256(canon(p));
      return { ok: h.slice(0, 16) === o.h, p, h };
    } catch (e) { return { ok: false, error: true }; }
  };
  D.passportCard = (p) => `<div class="passport">
      <div class="row between" style="position:relative"><div><div class="eyebrow">${T('Digital Skill Passport', 'ডিজিটাল স্কিল পাসপোর্ট')}</div><h3 style="margin:6px 0 2px">${esc(tx(p.title))}</h3><div class="small muted">${esc(p.holder)} · ${esc(p.level)} · O*NET ${esc(p.onet)}</div></div>
      <div class="qr" title="${T('Scan to verify', 'যাচাই করতে স্ক্যান করো')}">${p.hash ? D.qrSVG(D.passportURL(p), 112) : ''}</div></div>
      <div class="row small" style="margin-top:10px;position:relative;gap:6px"><span class="chip em">${T('AI viva', 'AI ভাইভা')} ${esc(p.viva)}</span><span class="chip">${T('Task', 'কাজ')}: ${esc(p.task)}</span><span class="chip">${T('Issued', 'ইস্যু')} ${esc(p.issued)}</span></div>
      <div class="small mono muted" style="margin-top:8px;position:relative;word-break:break-all">ID ${esc(p.id)} · SHA-256 ${esc((p.hash || '').slice(0, 24))}…</div></div>`;

  D.TABS.career = (body) => {
    const matches = D.careerMatches();
    let sel = matches[0].c.id;
    const draw = async () => {
      for (const p of D.state.passports) await D.passportHash(p);
      D.save();
      const m = matches.find((x) => x.c.id === sel) || matches[0];
      const subjW = Object.entries(m.c.w);
      body.innerHTML = `<div class="bento">
        <div class="card s7">
          <div class="card-head"><h3>${T('Career Navigator', 'ক্যারিয়ার নেভিগেটর')}</h3><span>${D.liveTag(T('From your quest mastery', 'তোমার দক্ষতা থেকে'))}</span></div>
          <div class="col" style="gap:8px">${matches.map((x) => `<button class="pick ${x.c.id === sel ? 'active' : ''}" data-car="${x.c.id}" style="display:grid;grid-template-columns:1fr 140px 44px;gap:12px;align-items:center"><b>${esc(tx(x.c.name))} <span class="muted small" style="font-weight:500">· O*NET ${x.c.onet}</span></b>${D.bar(x.pct)}<span class="small" style="text-align:right;margin:0;color:var(--text2)">${D.n(x.pct)}%</span></button>`).join('')}</div>
          <h4 style="margin:16px 0 8px">${T('Concept → Skill → Job path', 'ধারণা → দক্ষতা → পেশা পথ')}: ${esc(tx(m.c.name))}</h4>
          <svg viewBox="0 0 560 ${40 + subjW.length * 46}" width="100%" class="chart" role="img" aria-label="skill graph">
            ${subjW.map(([s, w], i) => { const y = 30 + i * 46, ms = D.subjectMastery(s); return `<rect x="6" y="${y - 16}" width="150" height="32" rx="8" style="fill:var(--card2);stroke:${ms >= 60 ? 'var(--em)' : 'var(--gold)'}"/><text x="81" y="${y + 4}" text-anchor="middle" style="fill:var(--text);font-weight:700">${esc(tx(D.subject(s).name))} ${D.n(ms)}%</text>
              <path d="M156 ${y} C 210 ${y}, 210 ${20 + (subjW.length * 46) / 2}, 250 ${20 + (subjW.length * 46) / 2}" style="fill:none;stroke:var(--line2);stroke-width:${1 + w * 6}"/>`; }).join('')}
            <rect x="250" y="${(subjW.length * 46) / 2}" width="140" height="40" rx="10" style="fill:var(--gold-soft);stroke:var(--gold)"/><text x="320" y="${(subjW.length * 46) / 2 + 25}" text-anchor="middle" style="fill:var(--gold);font-weight:800">${esc(D.INTERNSHIPS[m.c.intern].skill)}</text>
            <path d="M390 ${20 + (subjW.length * 46) / 2} H 420" style="stroke:var(--line2);stroke-width:3"/>
            <rect x="420" y="${(subjW.length * 46) / 2}" width="134" height="40" rx="10" style="fill:var(--em-soft);stroke:var(--em)"/><text x="487" y="${(subjW.length * 46) / 2 + 25}" text-anchor="middle" style="fill:var(--em);font-weight:800;font-size:11px">O*NET ${m.c.onet}</text>
          </svg>
          <div class="banner" style="margin-top:8px">${T('Biggest gap', 'সবচেয়ে বড় ঘাটতি')}: <b>${esc(tx(D.subject(m.gap).name))}</b> (${D.n(m.gapV)}%). ${T('Next best action: finish its Boss Battle, then take the micro-internship below.', 'পরবর্তী পদক্ষেপ: এর বস ব্যাটল শেষ করো, তারপর নিচের মাইক্রো-ইন্টার্নশিপ।')} <a href="${(D.KB.find((c) => c.id === m.c.chunk) || {}).url}" target="_blank" rel="noopener">O*NET </a></div>
        </div>
        <div class="card s5">
          <div class="card-head"><h3>${T('Skill Passport wallet', 'স্কিল পাসপোর্ট ওয়ালেট')}</h3><span class="chip">${D.n(D.state.passports.length)}</span></div>
          <div class="col" style="gap:12px">${D.state.passports.map((p) => D.passportCard(p)).join('') || `<p class="small muted">${T('Complete a micro-internship and pass the 3-question AI viva to earn your first passport.', 'মাইক্রো-ইন্টার্নশিপ ও ৩ প্রশ্নের ভাইভা পাস করে প্রথম পাসপোর্ট অর্জন করো।')}</p>`}</div>
          <p class="small muted" style="margin-top:10px">${T('Scanning the QR opens the recruiter verification view, which recomputes the SHA-256 integrity hash. Production issues Ed25519-signed W3C Verifiable Credentials.', 'QR স্ক্যান করলে রিক্রুটার যাচাই পাতা খোলে এবং SHA-256 হ্যাশ পুনর্গণনা করে।')}</p>
        </div>
        <div class="card s12">
          <div class="card-head"><h3>${T('Day-in-the-Life micro-internships', 'একদিনের মাইক্রো-ইন্টার্নশিপ')}</h3><span class="small muted">${T('Real tasks · computed answers · AI viva → passport', 'বাস্তব কাজ · গণিত উত্তর · AI ভাইভা → পাসপোর্ট')}</span></div>
          <div class="grid g4">${Object.entries(D.INTERNSHIPS).map(([k, it]) => { const has = D.state.passports.find((p) => p.skill === it.skill); return `<div class="card flat tint"><span class="ic-box" style="margin-bottom:12px">${D.icon(it.icon, 20)}</span><div><b>${esc(tx(it.title))}</b></div><div class="small muted" style="margin:4px 0 10px">${esc(tx(it.org))} · O*NET ${it.onet}</div><button class="btn sm ${has ? '' : 'primary'}" data-intern="${k}">${has ? D.icon('check', 15) + ' ' + T('Earned, try again', 'অর্জিত, আবার') : T('Start task', 'কাজ শুরু') + ' ' + D.icon('arrowRight', 15)}</button></div>`; }).join('')}</div>
        </div></div>`;
      D.$$('[data-car]', body).forEach((b) => (b.onclick = () => { sel = b.dataset.car; draw(); }));
      D.$$('[data-intern]', body).forEach((b) => (b.onclick = () => internship(b.dataset.intern, draw)));
    };
    draw();
  };

  function internship(key, done) {
    const it = D.INTERNSHIPS[key];
    const truth = it.compute(it.data);
    const m = D.modal(tx(it.title), `
      <div class="small muted">${esc(tx(it.org))} ${D.demoTag(T('Sample brief', 'নমুনা ব্রিফ'))}</div>
      <p style="margin-top:10px">${esc(tx(it.brief))}</p>
      <pre style="white-space:pre-wrap;word-break:break-all">${esc(it.data)}</pre>
      <form id="it-f" class="col" style="gap:8px;margin-top:12px"><label class="field">${esc(tx(it.ask))}<input type="text" id="it-v" inputmode="decimal" autocomplete="off"></label><button class="btn primary" type="submit">${T('Submit to team lead', 'টিম লিডকে জমা দাও')}</button></form>
      <div id="it-out"></div>`);
    D.$('#it-f').onsubmit = (e) => {
      e.preventDefault();
      const v = D.parseNum(D.$('#it-v').value);
      const ok = !isNaN(v) && Math.abs(v - truth) <= it.tol + 1e-9;
      D.answer(ok);
      const out = D.$('#it-out');
      if (!ok) { out.innerHTML = `<div class="feedback no">${T('The lead re-checked it and got a different value. Re-read the formula and try again.', 'টিম লিড ভিন্ন মান পেয়েছেন। সূত্রটি আবার পড়ে চেষ্টা করো।')}</div>`; return; }
      D.addXP(40, T('Internship task', 'ইন্টার্নশিপ কাজ'));
      out.innerHTML = `<div class="feedback ok">${T('Correct', 'সঠিক')} (${D.n(truth)}). ${T('Now a 3-question AI viva to verify understanding:', 'এবার বোঝাপড়া যাচাইয়ে ৩ প্রশ্নের AI ভাইভা:')}</div><div id="viva" style="margin-top:10px"></div>`;
      D.$('#it-f').style.display = 'none';
      let i = 0, score = 0;
      const ask = () => {
        const box = D.$('#viva');
        if (i >= 3) {
          if (score >= 2) {
            const p = { id: `DSP-2026-${(D.state.user ? D.state.user.id : 'guest').toUpperCase().slice(-7)}-${it.skill.split('-')[0].slice(0, 4)}${Date.now().toString(36).slice(-3).toUpperCase()}`, holder: D.state.user ? D.state.user.name : 'Guest learner', holderId: D.state.user ? D.state.user.id : 'guest', skill: it.skill, title: it.title, level: 'Foundation', onet: it.onet, issued: new Date().toISOString().slice(0, 10), viva: score + '/3', task: tx(it.title), hash: '' };
            D.state.passports = D.state.passports.filter((x) => x.skill !== it.skill).concat([p]);
            D.passportHash(p).then(() => { D.save(); box.innerHTML = `<div class="feedback ok">${T('Viva passed', 'ভাইভা উত্তীর্ণ')} ${D.n(score)}/3: ${T('Skill Passport issued!', 'স্কিল পাসপোর্ট ইস্যু হয়েছে!')}</div><div style="margin-top:10px">${D.passportCard(p)}</div>`; });
            D.addXP(60, T('Skill Passport', 'স্কিল পাসপোর্ট')); D.award('passport-' + it.skill, { en: 'Passport: ' + it.skill, bn: 'পাসপোর্ট: ' + it.skill }, ''); D.confetti();
            D.log('passport.issued', it.skill);
            if (done) setTimeout(done, 50);
          } else box.innerHTML = `<div class="feedback no">${T('Viva score', 'ভাইভা স্কোর')} ${D.n(score)}/3. ${T('Review and retry, passports require 2 of 3.', 'পুনরায় দেখে চেষ্টা করো, ৩-এর মধ্যে ২ লাগবে।')}</div>`;
          return;
        }
        const q = it.viva[i];
        const ord = D.order(q.o.length, i + 51);
        box.innerHTML = `<div class="small muted">${T('Viva question', 'ভাইভা প্রশ্ন')} ${D.n(i + 1)}/3</div><div style="font-weight:700;margin:6px 0">${esc(tx(q.q))}</div><div class="opts">${ord.map((k, j) => `<button class="opt" data-v="${k}"><span class="k">${'ABCD'[j]}</span><span>${esc(typeof q.o[k] === 'string' ? q.o[k] : tx(q.o[k]))}</span></button>`).join('')}</div>`;
        D.$$('[data-v]', box).forEach((b) => (b.onclick = () => { const ok2 = +b.dataset.v === q.a; if (ok2) score++; b.classList.add(ok2 ? 'right' : 'wrong'); setTimeout(() => { i++; ask(); }, 420); }));
      };
      ask();
    };
    setTimeout(() => { const i = D.$('#it-v'); if (i) i.focus(); }, 40);
  }

  /* ============================== Talent Marketplace (recruiter) ============================== */
  D.TABS.talent = (body) => {
    const st = { skill: '', showRegion: false };
    const vparam = D.current().params.get('verify');
    const draw = () => {
      const list = D.TALENT.filter((c) => !st.skill || c.skills.includes(st.skill)).sort((a, b) => b.readiness - a.readiness);
      const skills = Array.from(new Set(D.TALENT.flatMap((c) => c.skills)));
      body.innerHTML = `<div class="banner info" style="margin-bottom:14px"><span><b>${T('Recruiter view', 'রিক্রুটার ভিউ')}</b>: ${T('Blind-hiring by default: names, gender, photos and schools are hidden. Ranking uses verified skills only; identity is shared only if the candidate consents.', 'ডিফল্টভাবে অন্ধ নিয়োগ: নাম, লিঙ্গ, ছবি ও প্রতিষ্ঠান লুকানো। শুধু যাচাইকৃত দক্ষতায় র্যাঙ্কিং; প্রার্থী সম্মতি দিলে পরিচয় প্রকাশ।')}</span></div>
        <div class="bento">
          <div class="card s5">
            <div class="card-head"><h3>${T('Verify a Skill Passport', 'স্কিল পাসপোর্ট যাচাই')}</h3></div>
            <form id="vf" class="row nowrap" style="gap:8px"><input type="text" id="vin" placeholder="${T('Paste passport link or code', 'পাসপোর্ট লিংক বা কোড দিন')}" value="${esc(vparam || '')}"><button class="btn primary" type="submit">${T('Verify', 'যাচাই')}</button></form>
            <button class="btn sm ghost" id="vsample" style="margin-top:8px">${T('Try with Nusrat\'s sample passport', 'নুসরাতের নমুনা পাসপোর্ট দিয়ে দেখো')}</button>
            <div id="vout" style="margin-top:12px"></div>
          </div>
          <div class="card s7">
            <div class="card-head"><h3>${T('Open roles (sample)', 'খোলা পদ (নমুনা)')}</h3>${D.demoTag()}</div>
            <div class="table-wrap"><table class="t"><thead><tr><th>${T('Role', 'পদ')}</th><th>${T('Employer', 'নিয়োগকর্তা')}</th><th>${T('Mode', 'ধরন')}</th><th class="num">${T('Verified matches', 'যাচাইকৃত মিল')}</th></tr></thead><tbody>
              ${D.ROLES_OPEN.map((r) => `<tr><td><b>${esc(tx(r.t))}</b><div class="small muted">${r.need.join(', ')}</div></td><td>${esc(r.org)}</td><td>${esc(tx(r.mode))}</td><td class="num">${D.n(D.TALENT.filter((c) => r.need.every((n) => c.skills.includes(n))).length)}</td></tr>`).join('')}
            </tbody></table></div>
          </div>
          <div class="card s12">
            <div class="card-head"><h3>${T('Verified talent pool (anonymised)', 'যাচাইকৃত প্রতিভা (বেনামি)')}</h3><div class="row" style="gap:8px">${D.demoTag()}<label class="switch small"><input type="checkbox" id="reg" ${st.showRegion ? 'checked' : ''}><span class="track"></span>${T('Show region (on-site roles only)', 'অঞ্চল দেখাও (অন-সাইট)')}</label></div></div>
            <div class="row" style="gap:6px;margin-bottom:12px"><span class="chip click ${!st.skill ? 'em' : ''}" data-sk="">${T('All skills', 'সব দক্ষতা')}</span>${skills.map((s) => `<span class="chip click ${st.skill === s ? 'em' : ''}" data-sk="${esc(s)}">${esc(s)}</span>`).join('')}</div>
            <div class="grid g3">${list.map((c) => `<div class="card flat tint"><div class="row between"><b class="mono">${esc(c.id)}</b><span class="chip ${c.consent ? 'em' : ''}">${c.consent ? D.icon('check', 16) + T('open to intro', 'পরিচয়ে আগ্রহী') : T('consent pending', 'সম্মতি বাকি')}</span></div>
              <div class="small muted" style="margin:6px 0">${esc(c.track)} · ${st.showRegion ? esc(c.region) : T('region hidden', 'অঞ্চল লুকানো')} · ${esc(c.langs)}</div>
              <div class="row" style="gap:5px;margin-bottom:8px">${c.skills.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>
              <div class="row nowrap small" style="gap:8px">${T('Readiness', 'প্রস্তুতি')} ${D.bar(c.readiness)} <b>${D.n(c.readiness)}</b></div>
              <div class="row between small" style="margin-top:8px"><span>${D.n(c.passports)} ${T('passports', 'পাসপোর্ট')}</span><button class="btn sm ${c.consent ? 'primary' : ''}" data-intro="${esc(c.id)}" ${c.consent ? '' : 'disabled'}>${c.consent ? T('Request intro', 'পরিচয়ের অনুরোধ') : T('Awaiting consent', 'সম্মতির অপেক্ষা')}</button></div></div>`).join('')}</div>
            <p class="small muted" style="margin-top:10px">${T('Fairness controls: protected attributes (gender, religion, region, school type) are excluded from ranking and audited monthly for disparate impact, see /security.', 'ন্যায্যতা: লিঙ্গ, ধর্ম, অঞ্চল, প্রতিষ্ঠানের ধরন র্যাঙ্কিংয়ে বাদ এবং মাসিক নিরীক্ষা, /security দেখুন।')}</p>
          </div></div>`;
      D.$$('[data-sk]', body).forEach((b) => (b.onclick = () => { st.skill = b.dataset.sk; draw(); }));
      D.$('#reg').onchange = (e) => { st.showRegion = e.target.checked; D.log('talent.region_toggle', String(st.showRegion)); draw(); };
      D.$$('[data-intro]', body).forEach((b) => (b.onclick = () => { D.log('talent.intro_request', b.dataset.intro); D.modal(T('Intro request sent', 'পরিচয়ের অনুরোধ পাঠানো হয়েছে'), `<p>${T('Candidate', 'প্রার্থী')} <b class="mono">${esc(b.dataset.intro)}</b> ${T('will receive your request in Bangla and English. Their identity and contact details are shared only if they accept. You will be notified in the recruiter inbox.', 'বাংলা ও ইংরেজিতে অনুরোধ পাবেন। গ্রহণ করলে তবেই পরিচয় ও যোগাযোগ প্রকাশ হবে।')}</p><p class="small muted">${T('Simulated in the demo, no message was sent.', 'ডেমোতে সিমুলেটেড, কোনো বার্তা পাঠানো হয়নি।')}</p>`); }));
      D.$('#vf').onsubmit = async (e) => { e.preventDefault(); await verify(D.$('#vin').value); };
      D.$('#vsample').onclick = async () => { const p = D.state.passports[0] || Object.assign({}, D.SAMPLE_PASSPORT); await D.passportHash(p); const u = D.passportURL(p); D.$('#vin').value = u; await verify(u); };
      if (vparam) verify(vparam);
    };
    const verify = async (raw) => {
      const out = D.$('#vout');
      if (!raw.trim()) return;
      const r = await D.verifyPayload(raw);
      D.log('passport.verify', r.ok ? 'valid' : 'invalid');
      out.innerHTML = r.error ? `<div class="feedback no">${T('Not a Dishari passport code.', 'এটি দিশারী পাসপোর্ট কোড নয়।')}</div>`
        : r.ok ? `<div class="feedback ok"><b>${T('Integrity verified', 'অখণ্ডতা যাচাইকৃত')}</b>: ${T('the credential has not been altered since issue.', 'ইস্যুর পর সনদটি পরিবর্তিত হয়নি।')}</div>
          <table class="t" style="margin-top:8px"><tbody><tr><td>${T('Holder', 'ধারক')}</td><td><b>${esc(r.p.holder)}</b></td></tr><tr><td>${T('Skill', 'দক্ষতা')}</td><td>${esc(r.p.skill)} · ${esc(r.p.level)}</td></tr><tr><td>O*NET</td><td><a href="https://www.onetonline.org/link/summary/${esc(r.p.onet)}" target="_blank" rel="noopener">${esc(r.p.onet)} </a></td></tr><tr><td>${T('Evidence', 'প্রমাণ')}</td><td>${esc(r.p.task)} · ${T('viva', 'ভাইভা')} ${esc(r.p.viva)}</td></tr><tr><td>${T('Issued', 'ইস্যু')}</td><td>${esc(r.p.issued)}</td></tr><tr><td>SHA-256</td><td class="mono small">${esc(r.h.slice(0, 32))}…</td></tr></tbody></table>
          <p class="small muted" style="margin-top:6px">${T('Demo issuer: integrity hash only. Production signs credentials with the institution\'s Ed25519 key (W3C Verifiable Credentials 2.0) so authenticity can be checked offline.', 'ডেমো: শুধু অখণ্ডতা হ্যাশ। প্রোডাকশনে Ed25519 স্বাক্ষর (W3C VC 2.0)।')}</p>`
          : `<div class="feedback no"><b>${T('Tampered or invalid', 'পরিবর্তিত বা অবৈধ')}</b>: ${T('the hash does not match the credential contents.', 'হ্যাশ বিষয়বস্তুর সাথে মেলেনি।')}</div>`;
    };
    draw();
  };
})();
