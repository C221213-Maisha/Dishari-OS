/* Dishari OS, core: utils, i18n, state store, game economy, router.
   Zero dependencies. Works from any static host, sub-path deployments and file://. */
(function () {
  'use strict';
  const D = (window.D = window.D || {});

  /* ---------------- Utilities ---------------- */
  D.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  D.$ = (s, r) => (r || document).querySelector(s);
  D.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  D.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  D.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  D.uid = () => Math.random().toString(36).slice(2, 10);
  D.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---------------- i18n ---------------- */
  // Every user-facing string is bilingual. T(en, bn) picks the active language;
  // tx({en, bn}) does the same for content objects.
  D.T = (en, bn) => (D.state && D.state.lang === 'bn' && bn != null ? bn : en);
  D.tx = (o) => (o == null ? '' : typeof o === 'string' || typeof o === 'number' ? String(o) : D.state.lang === 'bn' && o.bn != null ? o.bn : o.en);
  const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
  D.n = (v, opts) => {
    const s = typeof v === 'number' ? v.toLocaleString('en-US', opts || {}) : String(v);
    return D.state && D.state.lang === 'bn' ? s.replace(/[0-9]/g, (d) => BN_DIGITS[d]) : s;
  };

  /* ---------------- Persistent store ---------------- */
  const KEY = 'dishari.os.v2';
  const defaults = () => ({
    theme: 'light', lang: 'en', lite: false, dyslexia: false, audio: false,
    role: 'guest', user: null, tourDone: false,
    game: { xp: 0, streak: 1, gems: 0, combo: 0, bestCombo: 0, badges: [], quests: {}, coop: 0 },
    bloom: { remember: 0, understand: 0, apply: 0, analyze: 0, evaluate: 0, create: 0 },
    passports: [], kbExtra: [], queue: [],
    guard: { pii: true, injection: true, threshold: 0.33, dialect: true, age: true },
    log: [], audits: []
  });
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      const s = JSON.parse(raw);
      const d = defaults();
      return Object.assign(d, s, { game: Object.assign(d.game, s.game || {}), bloom: Object.assign(d.bloom, s.bloom || {}), guard: Object.assign(d.guard, s.guard || {}) });
    } catch (e) { return defaults(); }
  }
  D.state = load();
  let saveT = null;
  D.save = () => {
    clearTimeout(saveT);
    saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(D.state)); } catch (e) { /* storage unavailable: keep in memory */ } }, 120);
  };
  D.flush = () => { clearTimeout(saveT); try { localStorage.setItem(KEY, JSON.stringify(D.state)); } catch (e) { /* ignore */ } };
  window.addEventListener('pagehide', () => D.flush());
  D.set = (patch) => { Object.assign(D.state, patch); D.save(); };
  // Data-subject rights (PDPO 2025 / GDPR): export everything we hold in this browser, or erase it.
  D.exportMyData = () => {
    const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), note: 'All Dishari OS data stored in this browser', data: D.state }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dishari-my-data.json'; a.click();
    D.log('privacy.export', 'self-service export');
  };
  D.errors = [];
  window.addEventListener('error', (e) => D.errors.push(String(e.message || e)));
  window.addEventListener('unhandledrejection', (e) => D.errors.push(String(e.reason || 'promise')));
  D.resetAll = () => { try { localStorage.removeItem(KEY); } catch (e) {} D.state = defaults(); D.save(); };
  D.log = (action, detail) => {
    D.state.log.unshift({ t: new Date().toISOString(), actor: D.state.user ? D.state.user.id : 'guest', role: D.state.role, action, detail: detail || '' });
    D.state.log = D.state.log.slice(0, 200);
    D.save();
  };

  /* ---------------- Game economy ---------------- */
  // Level curve: level = floor(sqrt(xp / 100)) + 1  → L15 starts at 19,600 XP.
  D.levelOf = (xp) => Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
  D.xpForLevel = (lvl) => Math.pow(lvl - 1, 2) * 100;
  D.levelProgress = (xp) => {
    const l = D.levelOf(xp), a = D.xpForLevel(l), b = D.xpForLevel(l + 1);
    return { level: l, pct: Math.round(((xp - a) / (b - a)) * 100), toNext: b - xp };
  };
  D.multiplier = () => (D.state.game.combo >= 3 ? 2 : 1);
  D.addXP = (base, reason) => {
    const g = D.state.game;
    const before = D.levelOf(g.xp);
    const gain = Math.round(base * D.multiplier());
    g.xp += gain;
    const after = D.levelOf(g.xp);
    D.save();
    if (D.toast && gain >= 25) D.toast(`+${D.n(gain)} XP${D.multiplier() > 1 ? ' (2× ' + D.T('combo', 'কম্বো') + ')' : ''}${reason ? ' · ' + reason : ''}`, D.multiplier() > 1 ? 'gold' : '', 'star');
    if (after > before) {
      D.award('level-' + after, { en: 'Reached Level ' + after, bn: 'লেভেল ' + D.n(after) + '-এ উন্নীত' }, '');
      if (D.confetti) D.confetti();
    }
    if (D.refreshHUD) D.refreshHUD();
    return gain;
  };
  D.answer = (correct) => {
    const g = D.state.game;
    if (correct) { g.combo += 1; g.bestCombo = Math.max(g.bestCombo, g.combo); if (g.combo === 3 && D.toast) D.toast(D.T('Combo ×3, 2× XP multiplier active!', 'কম্বো ×৩, ২× XP সক্রিয়!'), 'gold'); }
    else { g.combo = 0; }
    D.save();
    if (D.refreshHUD) D.refreshHUD();
  };
  D.addGems = (n) => { D.state.game.gems += n; D.save(); if (D.refreshHUD) D.refreshHUD(); };
  D.award = (id, label, icon) => {
    const g = D.state.game;
    if (g.badges.find((b) => b.id === id)) return false;
    g.badges.push({ id, label, icon: icon || 'award', at: new Date().toISOString() });
    D.save();
    if (D.toast) D.toast(D.T('Badge unlocked: ', 'ব্যাজ অর্জিত: ') + D.tx(label), 'gold', 'award');
    D.log('badge.awarded', id);
    return true;
  };
  D.quest = (subject) => {
    const q = D.state.game.quests;
    if (!q[subject]) q[subject] = { p1: 0, p2: 0, p3: 0, p4: 0 };
    return q[subject];
  };
  D.setQuest = (subject, part, pct) => {
    const q = D.quest(subject);
    q[part] = Math.max(q[part] || 0, D.clamp(Math.round(pct), 0, 100));
    D.save();
  };
  D.bumpBloom = (tier, delta) => {
    D.state.bloom[tier] = D.clamp((D.state.bloom[tier] || 0) + delta, 0, 100);
    D.save();
  };

  /* ---------------- Router ---------------- */
  // Real path routes (/app, /admin …) on any static host; each route folder ships an
  // index.html with <base href="../">. Falls back to #/route on file:// or when forced.
  D.hashMode = () => location.protocol === 'file:' || !!window.DISHARI_HASH;
  D.routes = {};
  D.page = (name, def) => { D.routes[name] = def; };
  D.routeNames = () => Object.keys(D.routes);

  function baseURL() { return new URL(document.baseURI); }
  D.current = () => {
    if (D.hashMode()) {
      const h = location.hash.replace(/^#\/?/, '');
      const [p, q] = h.split('?');
      let name = (p || '').split('/')[0];
      if (!name) {
        // opened a route folder directly from disk, e.g. .../app/index.html
        const segs = location.pathname.split('/').filter(Boolean);
        const folder = segs.length > 1 ? segs[segs.length - 2] : '';
        if (D.routes[folder]) name = folder;
      }
      return { name: name || '', params: new URLSearchParams(q || '') };
    }
    const base = baseURL();
    let rel = location.pathname.startsWith(base.pathname) ? location.pathname.slice(base.pathname.length) : location.pathname;
    rel = rel.replace(/^\/+/, '').replace(/index\.html$/, '');
    return { name: rel.split('/')[0] || '', params: new URLSearchParams(location.search) };
  };
  D.href = (name, params) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    if (D.hashMode()) return '#/' + (name || '') + q;
    return (name ? name + '/' : './') + q;
  };
  D.go = (name, params, opts) => {
    const url = D.href(name, params);
    if (D.hashMode()) { if (location.hash !== url) location.hash = url; else D.render(); }
    else {
      const abs = new URL(url, document.baseURI).toString();
      if (opts && opts.replace) history.replaceState({}, '', abs); else history.pushState({}, '', abs);
      D.render();
    }
    if (!(opts && opts.keepScroll)) window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  };
  D.setParams = (params) => {
    // update query params of the current route without re-rendering or scrolling
    const cur = D.current();
    const merged = new URLSearchParams(cur.params);
    Object.entries(params).forEach(([k, v]) => (v == null ? merged.delete(k) : merged.set(k, v)));
    const obj = Object.fromEntries(merged.entries());
    const url = D.href(cur.name, Object.keys(obj).length ? obj : null);
    if (D.hashMode()) history.replaceState({}, '', location.pathname + location.search + url);
    else history.replaceState({}, '', new URL(url, document.baseURI).toString());
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-link]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    e.preventDefault();
    const name = a.getAttribute('data-link');
    const p = a.getAttribute('data-params');
    D.go(name, p ? Object.fromEntries(new URLSearchParams(p)) : null);
  });
  window.addEventListener('popstate', () => D.render());
  window.addEventListener('hashchange', () => { if (D.hashMode()) D.render(); });

  // Link helper used across templates
  D.a = (name, label, cls, params) => `<a href="${D.esc(D.href(name, params))}" data-link="${D.esc(name)}"${params ? ` data-params="${D.esc(new URLSearchParams(params).toString())}"` : ''} class="${cls || ''}">${label}</a>`;
})();
