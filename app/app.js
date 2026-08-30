/* IPTBe — gestor IPTV local */
'use strict';

// ───────────────────────────── utilitats ─────────────────────────────

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v === true) n.setAttribute(k, '');
    else n.setAttribute(k, v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) n.append(k);
  return n;
};
const fmt = n => (n || 0).toLocaleString('ca-ES');
const norm = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function debounce(fn, ms) {
  let t = null;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
// Camp de cerca per a una secció. Filtra sobre les dades ja carregades, i redibuixa
// només la llista de resultats perquè el cursor no salti mentre escrius.
function sectionSearch(placeholder, initial, onChange) {
  const inp = el('input', { type: 'search', placeholder, value: initial || '',
    'aria-label': placeholder, autocapitalize: 'off', spellcheck: 'false' });
  const run = debounce(() => onChange(inp.value.trim()), 160);
  inp.addEventListener('input', run);
  inp.addEventListener('search', () => onChange(inp.value.trim()));
  const box = el('div', { class: 'hsrch' }, svg('srch', 15), inp);
  return { node: box, input: inp };
}
const hhmm = ts => new Date(ts * 1000).toTimeString().slice(0, 5);
const nowSec = () => Math.floor(Date.now() / 1000);

const ICON = {
  home:'<path d="M3 9.5 10 3.2l7 6.3V16a1 1 0 0 1-1 1h-3.6v-4.8H7.6V17H4a1 1 0 0 1-1-1z"/>',
  tv:'<rect x="2.6" y="6.2" width="14.8" height="10.2" rx="1.6"/><path d="m6.4 2.9 3.6 3.3 3.6-3.3"/>',
  film:'<rect x="2.6" y="3.6" width="14.8" height="12.8" rx="1.6"/><path d="M6.6 3.6v12.8M13.4 3.6v12.8M2.6 10h14.8"/>',
  stack:'<rect x="2.6" y="6.6" width="14.8" height="9.8" rx="1.6"/><path d="M5 4.3h10M6.6 2.2h6.8"/>',
  star:'<path d="m10 2.7 2.28 4.72 5.12.72-3.72 3.56.92 5.1L10 14.4l-4.6 2.4.92-5.1L2.6 8.14l5.12-.72z"/>',
  clock:'<circle cx="10" cy="10" r="7.2"/><path d="M10 5.7V10l2.9 1.8"/>',
  cog:'<path d="M2.8 6.4h14.4M2.8 13.6h14.4"/><circle cx="7.6" cy="6.4" r="2.2"/><circle cx="12.4" cy="13.6" r="2.2"/>',
  srch:'<circle cx="8.9" cy="8.9" r="5.5"/><path d="m13 13 3.6 3.6"/>',
  play:'<path d="M6.2 4 15.6 10 6.2 16z"/>',
  stop:'<rect x="5.6" y="5.6" width="8.8" height="8.8" rx="1.4"/>',
  check:'<path d="m4.4 10.4 3.6 3.4 7.6-8.2"/>',
  down:'<path d="m5.6 8 4.4 4.4L14.4 8"/>',
  right:'<path d="m8 5.6 4.4 4.4L8 14.4"/>',
  left:'<path d="m12 5.6-4.4 4.4L12 14.4"/>',
  refr:'<path d="M16.6 10a6.6 6.6 0 1 1-2-4.75"/><path d="M16.9 3.2v3.4h-3.4"/>',
  out:'<path d="M11.4 3.2h5.4v5.4"/><path d="M16.8 3.2 9.4 10.6"/><path d="M14.8 11.8V16a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 16V7.4a1.6 1.6 0 0 1 1.6-1.6h4.2"/>',
  rew:'<path d="M3.2 10a6.8 6.8 0 1 0 2.1-4.9"/><path d="M3 3.4v3.5h3.5"/>',
  lock:'<rect x="4.2" y="8.8" width="11.6" height="8" rx="1.6"/><path d="M6.8 8.8V6.6a3.2 3.2 0 0 1 6.4 0v2.2"/>',
  srv:'<rect x="2.8" y="3.6" width="14.4" height="5.2" rx="1.4"/><rect x="2.8" y="11.2" width="14.4" height="5.2" rx="1.4"/><path d="M5.6 6.2h.01M5.6 13.8h.01"/>',
  user:'<circle cx="10" cy="7" r="3.2"/><path d="M4 16.6c0-2.9 2.7-4.6 6-4.6s6 1.7 6 4.6"/>',
  power:'<path d="M10 3v7"/><path d="M14.9 5.6a6.8 6.8 0 1 1-9.8 0"/>',
  warn:'<path d="M10 3.4 18 16.6H2z"/><path d="M10 8.4v3.4M10 14.2h.01"/>',
};
function ic(name, sz = 18, sw = 1.6, fill = 'none') {
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 20 20" fill="${fill}" stroke="currentColor"
    stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"
    aria-hidden="true">${ICON[name]}</svg>`;
}
const svg = (name, sz, sw, fill) => {
  const s = document.createElement('span');
  s.style.display = 'inline-flex';
  s.innerHTML = ic(name, sz, sw, fill);
  return s;
};

// ───────────────────────────── capa de xarxa ─────────────────────────────

function appErr(msg, kind = 'error', detail = '') {
  const e = new Error(msg); e.__app = true; e.msg = msg; e.kind = kind; e.detail = detail;
  return e;
}

async function api(path, { method = 'GET', body, timeout = 30000 } = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(path, {
      method, signal: ctl.signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const txt = await r.text();
    let j = {};
    if (txt) { try { j = JSON.parse(txt); } catch { throw appErr('El servidor local ha respost una cosa il·legible.', 'malformed', txt.slice(0, 200)); } }
    if (!r.ok) throw appErr(j.error || `Error ${r.status}`, j.kind || 'error', j.detail || '');
    return j;
  } catch (e) {
    if (e.__app) throw e;
    if (e.name === 'AbortError')
      throw appErr(`Ha trigat més de ${Math.round(timeout / 1000)} segons i he aturat l'espera.`, 'timeout',
                   'Pot ser que el teu proveïdor vagi molt lent ara mateix.');
    if (!navigator.onLine) throw appErr('No tens connexió a internet.', 'offline', '');
    throw appErr("No he pogut parlar amb el servidor local. Potser s'ha aturat.", 'local', String(e));
  } finally { clearTimeout(timer); }
}

// ───────────────────────────── estat ─────────────────────────────

const S = {
  status: null, cat: {}, epg: null,
  prefs: { favorites: { live: {}, vod: {}, series: {} }, progress: { seen: {}, last: {} } },
  now: null, view: 'home', pick: {}, page: {}, query: '',
};

const favOf = k => (S.prefs.favorites[k] ||= {});
const isFav = (k, id) => !!favOf(k)[id];
function toggleFav(k, id) {
  const f = favOf(k);
  if (f[id]) delete f[id]; else f[id] = 1;
  renderFavCount();
  savePrefs();
}
function favCount() {
  return Object.values(S.prefs.favorites).reduce((a, o) => a + Object.keys(o).length, 0);
}
function renderFavCount() {
  const n = favCount(), node = document.getElementById('favct');
  if (node) node.textContent = n ? fmt(n) : '';
}

let saveT = null;
function savePrefs() {
  clearTimeout(saveT);
  saveT = setTimeout(async () => {
    for (let intent = 0; intent < 2; intent++) {
      try {
        await api('/api/prefs', { method: 'POST', body: S.prefs, timeout: 8000 });
        setOffline(false);
        return;
      } catch (e) {
        if (intent === 0) { await new Promise(r => setTimeout(r, 1200)); continue; }
        setOffline(true, 'Els favorits que has marcat NO s\'han desat.');
      }
    }
  }, 400);
}

// ───────────────────────── panells d'estat ─────────────────────────

function loadingPane(host, msg = 'Carregant…') {
  const p = el('div', { class: 'pane' },
    el('div', { class: 'panebox' },
      el('div', { class: 'spin' }),
      el('p', { text: msg }),
      el('p', { class: 'slow', hidden: true })));
  host.append(p);
  const slow = p.querySelector('.slow');
  const t1 = setTimeout(() => { slow.hidden = false; slow.textContent = 'Està trigant més del normal. Continuo esperant…'; }, 6000);
  const t2 = setTimeout(() => { slow.textContent = 'El teu proveïdor va molt lent avui. Encara hi som.'; }, 15000);
  return { done() { clearTimeout(t1); clearTimeout(t2); p.remove(); } };
}

const ERR_TITLE = {
  timeout: 'Massa lent', offline: 'Sense connexió', auth: 'Credencials rebutjades',
  network: 'No hi arribo', dns: 'Adreça no trobada', http: 'El proveïdor ha fallat', malformed: 'Resposta estranya',
  local: 'Servidor local aturat', no_vlc: 'No trobo el VLC', unconfigured: 'Falta configurar',
};
const ERR_HELP = {
  timeout: "Prova-ho de nou d'aquí un moment. Si passa sempre, el servidor del teu proveïdor deu estar saturat.",
  offline: 'Comprova el wifi i torna-ho a provar.',
  dns: "Sol ser una errada a l'adreça del servidor. Revisa-la a Configuració.",
  network: 'Revisa la connexió i que l\'adreça del servidor a Configuració sigui correcta.',
  auth: 'Ves a Configuració i torna a escriure usuari i contrasenya.',
  http: 'És un problema del seu costat, no del teu. Torna-ho a provar més tard.',
  local: 'Torna a obrir IPTBe fent doble clic a iptbe.command.',
  no_vlc: "Descarrega'l de videolan.org i posa'l a la carpeta Aplicacions.",
};

function errorPane(host, e, retry) {
  const acts = el('div', { class: 'acts' });
  if (retry) {
    const b = el('button', { class: 'btn btn-p', onclick: async () => {
      b.disabled = true; b.textContent = 'Provant…'; await retry();
    } });
    b.append(svg('refr', 15), 'Torna-ho a provar');
    acts.append(b);
  }
  if (e.kind === 'auth' || e.kind === 'unconfigured')
    acts.append(el('button', { class: 'btn btn-s', text: 'Anar a Configuració',
      onclick: () => { p.remove(); go('config'); } }));
  const p = el('div', { class: 'pane' },
    el('div', { class: 'panebox' },
      el('div', { style: 'color:var(--live)', html: ic('warn', 30, 1.5) }),
      el('h3', { text: ERR_TITLE[e.kind] || 'Alguna cosa ha fallat' }),
      el('p', { text: e.msg }),
      ERR_HELP[e.kind] ? el('p', { class: 'slow', text: ERR_HELP[e.kind] }) : null,
      e.detail ? el('div', { class: 'det', text: String(e.detail).slice(0, 200) }) : null,
      acts));
  host.append(p);
  return p;
}

// Carrega dades ensenyant filat i, si peta, error amb reintent.
async function guard(host, job, msg) {
  const spin = loadingPane(host, msg);
  try { const r = await job(); spin.done(); return r; }
  catch (e) {
    spin.done();
    errorPane(host, e, async () => { host.querySelector('.pane')?.remove(); await guard(host, job, msg); });
    return null;
  }
}

// Si el servidor local no hi és (l'has aturat, o la pestanya és d'una arrencada antiga),
// cal dir-ho: altrament sembla que tot funciona i els canvis es perden en silenci.
let offlineBar = null;
function setOffline(on, why) {
  if (!on) { offlineBar?.remove(); offlineBar = null; return; }
  if (offlineBar) return;
  offlineBar = el('div', { class: 'offline' },
    svg('warn', 17),
    el('span', { html: '<b>IPTBe no respon.</b> ' + (why || 'Els canvis que facis ara no es desaran.') +
      ' Aquesta pestanya pot ser d\'una arrencada anterior.' }),
    el('button', { text: 'Reintentar', onclick: () => location.reload() }));
  document.body.append(offlineBar);
}

let toastT = null;
function toast(msg, bad = false) {
  const t = $('#toast');
  t.textContent = msg; t.className = 'toast' + (bad ? ' bad' : ''); t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, bad ? 6000 : 3200);
}

// ───────────────────────── dades ─────────────────────────

async function ensureCatalog(kind, refresh = false) {
  if (S.cat[kind] && !refresh) return S.cat[kind];
  S.cat[kind] = await api(`/api/catalog?kind=${kind}${refresh ? '&refresh=1' : ''}`, { timeout: 90000 });
  return S.cat[kind];
}
async function ensureEpg(refresh = false) {
  if (S.epg && !refresh) return S.epg;
  S.epg = await api(`/api/epg${refresh ? '?refresh=1' : ''}`, { timeout: 60000 });
  return S.epg;
}
function progOf(epgId) {
  const list = S.epg?.by?.[epgId]; if (!list) return null;
  const t = nowSec();
  for (let i = 0; i < list.length; i++)
    if (list[i].s <= t && t < list[i].e) return { now: list[i], next: list[i + 1] || null };
  const nx = list.find(p => p.s > t);
  return nx ? { now: null, next: nx } : null;
}

// ───────────────────────── reproducció ─────────────────────────

async function play(kind, id, label, ext) {
  toast('Obrint el VLC…');
  try {
    const r = await api('/api/play', { method: 'POST', timeout: 20000,
      body: { kind, id, label, ext: ext || 'mkv' } });
    S.now = r.now; renderNow();
    toast(`Reproduint «${label}» al VLC`);
  } catch (e) { toast(e.msg, true); }
}
async function stopPlay() {
  try { const r = await api('/api/stop', { method: 'POST', timeout: 15000 });
    S.now = r.now; renderNow(); toast('Reproducció aturada'); }
  catch (e) { toast(e.msg, true); }
}
async function quitApp() {
  if (!confirm('Vols aturar IPTBe? Es tancaran el servidor i el VLC.')) return;
  try { await api('/api/quit', { method: 'POST', timeout: 8000 }); } catch {}
  document.body.innerHTML =
    '<div class="pane"><div class="panebox">' +
    '<h3>IPTBe s\'ha aturat</h3>' +
    '<p>El servidor ja no corre en segon pla. Pots tancar aquesta pestanya.</p>' +
    '<p class="slow">Per tornar-hi, doble clic a <b>iptbe.command</b>.</p>' +
    '</div></div>';
  clearInterval(pingT);
}

// ───────────────────────── estructura ─────────────────────────

function shell() {
  const app = $('#app');
  app.textContent = '';
  const side = el('aside', { class: 'side' });
  side.append(
    el('div', { class: 'brand' },
      el('span', { class: 'serif brand-n', text: 'IPTBe' }),
      el('span', { class: 'brand-d' })));

  const form = el('form', { class: 'srch', onsubmit: e => { e.preventDefault(); doSearch(inp.value); } });
  const inp = el('input', { type: 'search', placeholder: 'Cerca a tot el catàleg',
    'aria-label': 'Cerca', value: S.query });
  // La X del camp només esborra el text de la pantalla. Si no netegem també l'estat,
  // el text reapareix la propera vegada que es redibuixa la barra lateral.
  const cleared = () => {
    if (inp.value.trim() || !S.query) return;
    S.query = '';
    if (S.view === 'search') go('home');
  };
  inp.addEventListener('search', cleared);   // la X nativa
  inp.addEventListener('input', cleared);    // esborrat a mà
  form.append(svg('srch', 15), inp);
  side.append(form);

  const nav = el('nav', { class: 'nav' });
  const counts = {
    live: S.cat.live?.items.length, vod: S.cat.vod?.items.length, series: S.cat.series?.items.length };
  [['home', 'home', 'Inici', null],
   ['live', 'tv', 'TV en directe', counts.live],
   ['vod', 'film', 'Pel·lícules', counts.vod],
   ['series', 'stack', 'Sèries', counts.series]].forEach(([id, icn, label, ct]) => {
    const b = el('button', { class: 'nv' + (S.view === id ? ' on' : ''), onclick: () => go(id) });
    b.append(svg('tv' === icn ? 'tv' : icn, 17), el('span', { text: label }));
    if (ct) b.append(el('span', { class: 'ct tnum', text: fmt(ct) }));
    nav.append(b);
  });
  side.append(nav, el('div', { class: 'navsep' }), el('div', { class: 'navlbl', text: 'EL MEU' }));

  const nav2 = el('nav', { class: 'nav' });
  const bf = el('button', { class: 'nv' + (S.view === 'favs' ? ' on' : ''), onclick: () => go('favs') });
  // El comptador existeix sempre (encara que buit) perquè es pugui refrescar a l'instant.
  bf.append(svg('star', 17), el('span', { text: 'Favorits' }),
            el('span', { class: 'ct tnum', id: 'favct' }));
  nav2.append(bf);
  renderFavCount();
  side.append(nav2);

  const foot = el('div', { class: 'side-foot' });
  const bc = el('button', { class: 'nv' + (S.view === 'config' ? ' on' : ''), onclick: () => go('config') });
  bc.append(svg('cog', 17), el('span', { text: 'Configuració' }));
  const bq = el('button', { class: 'nv', onclick: quitApp, title: 'Atura el servidor local' });
  bq.append(svg('power', 17), el('span', { text: 'Aturar IPTBe' }));
  foot.append(bc, bq);
  const at = S.cat.live?.at;
  if (at) {
    const days = Math.floor((Date.now() / 1000 - at) / 86400);
    const m = el('div', { class: 'side-meta' });
    m.append(svg('refr', 14), el('span', {
      text: days <= 0 ? 'Dades actualitzades avui' : `Dades de fa ${days} ${days === 1 ? 'dia' : 'dies'}` }));
    foot.append(m);
  }
  side.append(foot);

  const main = el('main', { class: 'main', id: 'main' });
  app.append(el('div', { class: 'body' }, side, main), nowBar());
  return main;
}

function nowBar() {
  const bar = el('div', { class: 'now', id: 'nowbar', hidden: !S.now?.label });
  return bar;
}
function renderNow() {
  const bar = $('#nowbar'); if (!bar) return;
  bar.textContent = '';
  if (!S.now?.label) { bar.hidden = true; return; }
  bar.hidden = false;
  const stop = el('button', { class: 'btn-d', onclick: stopPlay });
  stop.append(svg('stop', 14, 1.6, 'currentColor'), 'Aturar');
  bar.append(
    el('span', { class: 'dot' }),
    el('span', { class: 'now-lbl', text: S.now.kind === 'live' ? 'EN DIRECTE' : 'REPRODUINT' }),
    el('span', { class: 'now-t', text: S.now.label }),
    stop);
}

function header(main, title, sub, tools = []) {
  const h = el('div', { class: 'head' },
    el('div', {}, el('div', { class: 'serif h1', text: title }),
                   sub ? el('div', { class: 'sub', text: sub }) : null),
    el('div', { class: 'tools' }, ...tools));
  main.append(h);
  return h;
}
function refreshChip(kind) {
  const b = el('button', { class: 'chip', onclick: async () => {
    b.disabled = true; b.textContent = 'Actualitzant…';
    try {
      if (kind === 'live') { await ensureCatalog('live', true); await ensureEpg(true); }
      else await ensureCatalog(kind, true);
      toast('Dades actualitzades'); go(S.view);
    } catch (e) { toast(e.msg, true); b.disabled = false; b.textContent = ''; b.append(svg('refr', 14), 'Actualitzar'); }
  } });
  b.append(svg('refr', 14), 'Actualitzar');
  return b;
}

// ───────────────────────── vistes ─────────────────────────

function go(view, arg) {
  S.view = view; S.arg = arg;
  const main = shell();
  ({ home: vHome, live: vLive, vod: vGrid, series: vGrid, favs: vFavs,
     config: vConfig, search: vSearch, serie: vSerie, movie: vMovie }[view] || vHome)(main, arg);
}

// — Inici —
// La portada respon "què puc veure ara mateix", tinguis favorits o no.
async function vHome(main) {
  header(main, 'Inici', null, [refreshChip('live')]);
  const scroll = el('div', { class: 'scroll' }); main.append(scroll);
  const ok = await guard(main, async () => {
    await ensureCatalog('live'); await ensureEpg().catch(() => {}); return true;
  }, 'Carregant…');
  if (!ok) return;

  const box = el('div', { class: 'home' }); scroll.append(box);

  // Esports en directe. Si no hi ha cap partit, la secció no existeix.
  const sports = sportsNow(6);
  if (sports.length) {
    const sg = el('div', { class: 'chgrid' });
    sports.forEach(c => sg.append(chCard(c)));
    box.append(el('div', { class: 'hrow' },
      el('div', { class: 'hhead' },
        el('span', { class: 'sec live', text: 'ESPORTS ARA' }),
        el('span', { style: 'font-size:11.5px;color:var(--ink4)',
          text: `${sports.length} ${sports.length === 1 ? 'partit en joc' : 'partits en joc'}` })), sg));
  }

  // Continuar veient
  const last = Object.entries(S.prefs.progress.last || {})
    .sort((a, b) => (b[1].at || 0) - (a[1].at || 0)).slice(0, 4);
  if (last.length) {
    const cg = el('div', { class: 'controw' });
    last.forEach(([sid, v]) => cg.append(
      el('button', { class: 'contcard', onclick: () => go('serie', sid) },
        el('div', { class: 'pw' }, v.cover ? el('img', { src: imgSrc(v.cover), alt: '', loading: 'lazy' }) : null),
        el('div', { class: 'm' },
          el('b', { text: v.name || 'Sèrie' }),
          el('div', { class: 'e tnum', text: `T${v.s} · E${v.e}` }),
          el('div', { style: 'font-size:12.5px;color:var(--ink2)', text: v.title || '' })))));
    box.append(el('div', { class: 'hrow' },
      el('div', { class: 'hhead' }, el('span', { class: 'sec', text: 'CONTINUAR VEIENT' })), cg));
  }

  // Novetats: es carreguen després, per no endarrerir els esports.
  const slots = [
    ['series', 'NOVETATS · SÈRIES'],
    ['vod', 'NOVETATS · PEL·LÍCULES'],
  ].map(([kind, label]) => {
    const row = el('div', { class: 'hrow' },
      el('div', { class: 'hhead' },
        el('span', { class: 'sec', text: label }),
        el('span', { class: 'slot-note', style: 'font-size:11.5px;color:var(--ink4)', text: 'carregant…' })));
    const grid = el('div', { class: 'grid newrow' });
    row.append(grid);
    box.append(row);
    return { kind, row, grid };
  });

  for (const s of slots) {
    try {
      await ensureCatalog(s.kind);
      const fresh = safeItems(s.kind).filter(x => x.t)
        .sort((a, b) => b.t - a.t).slice(0, 6);
      if (!fresh.length) { s.row.remove(); continue; }
      const d = new Date(fresh[0].t * 1000);
      const today = new Date().toDateString() === d.toDateString();
      s.row.querySelector('.slot-note').textContent = today
        ? "afegides avui" : 'afegides el ' + d.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });
      fresh.forEach(x => s.grid.append(poster(x, s.kind)));
    } catch {
      s.row.remove();   // si falla, simplement no ensenyem la secció
    }
  }
}

// El proveïdor repeteix cada canal en diverses qualitats ("La 1 HD" i "La 1 HD 1080").
// A la portada, on l'espai és escàs, ens quedem només amb la millor versió de cadascun.
function bestPerChannel(list) {
  const rank = n => /\b4K|UHD\b/i.test(n) ? 4 : /\b1080|FHD\b/i.test(n) ? 3
                  : /\bHD\b/i.test(n) ? 2 : /\b720\b/i.test(n) ? 1 : 0;
  const key = c => (c.e || '').trim().toLowerCase() ||
    c.n.replace(/\b(4K|UHD|FHD|HD|SD|1080|720)\b/gi, '').replace(/\s+/g, ' ').trim().toLowerCase();
  const best = new Map();
  for (const c of list) {
    const k = key(c), cur = best.get(k);
    if (!cur || rank(c.n) > rank(cur.n)) best.set(k, c);
  }
  return [...best.values()];
}

// Esports: el proveïdor només envia guia d'algunes categories (DEPORTES ESPAÑA, F1, MOTO GP).
// A la resta (NBA, EVENTOS, TENNIS...) els canals es diuen "NBA 01" i prou, sense cap dada
// de què hi fan, així que no hi ha manera de saber si estan emetent res.
const SPORT_CAT = /DEPORTES|F1|FORMULA|MOTO|LIGA|NBA|NFL|NHL|UFC|TENNIS|EVENTOS/i;

// Un partit de veritat porta els equips al títol ("LALIGA - R. Sociedad - Espanyol").
// Quan el canal no emet res, el títol és només la marca del canal ("M+ LALIGA 2").
function isFixture(title) {
  const t = (title || '').trim();
  if (!t || !/\S\s*-\s*\S/.test(t)) return false;      // sense guionet no és un enfrontament
  if (/^disfruta\b/i.test(t)) return false;              // "Disfruta de DAZN en Movistar Plus"
  return true;
}

// Res per a adults als suggeriments de la portada.
const ADULT = /\bXXX\b|ADULTO|\+\s?18|PORN|ER[OÓ]TIC/i;
function safeItems(kind) {
  const blocked = new Set(S.cat[kind].cats.filter(c => ADULT.test(c.n)).map(c => c.id));
  return S.cat[kind].items.filter(x => !blocked.has(x.c));
}

function sportsNow(limit = 6) {
  if (!S.epg) return [];
  const sportIds = new Set(S.cat.live.cats.filter(c => SPORT_CAT.test(c.n)).map(c => c.id));
  const out = [];
  for (const c of bestPerChannel(S.cat.live.items.filter(x => sportIds.has(x.c)))) {
    const p = progOf(c.e);
    if (p?.now && isFixture(p.now.t)) out.push(c);
  }
  return out.slice(0, limit);
}

function chCard(c) {
  const p = progOf(c.e);
  const card = el('button', { class: 'chcard', onclick: () => play('live', c.id, c.n) });
  const top = el('div', { class: 't' });
  const st = el('span', { class: 'star' + (isFav('live', c.id) ? ' on' : ''),
    style: 'margin-left:auto', role: 'button', tabindex: '0', title: 'Favorit',
    onclick: e => { e.stopPropagation(); toggleFav('live', c.id); st.classList.toggle('on');
      st.innerHTML = ic('star', 15, 1.5, st.classList.contains('on') ? 'currentColor' : 'none'); } });
  st.innerHTML = ic('star', 15, 1.5, isFav('live', c.id) ? 'currentColor' : 'none');
  top.append(logoOf(c), el('b', { text: c.n }), st);
  card.append(top);
  if (p?.now) {
    const pct = Math.max(1, Math.min(100, Math.round((nowSec() - p.now.s) / (p.now.e - p.now.s) * 100)));
    card.append(el('div', { style: 'display:flex;flex-direction:column;gap:6px' },
      el('div', { style: 'display:flex;align-items:baseline;gap:7px' },
        el('span', { class: 'sec live', text: 'ARA' }),
        el('span', { class: 'tnum', style: 'font-size:11px;color:var(--ink4)',
          text: `${hhmm(p.now.s)}–${hhmm(p.now.e)}` })),
      el('div', { class: 'pt', text: p.now.t }),
      el('div', { class: 'prog live' }, el('i', { style: `width:${pct}%` }))));
    if (p.next) card.append(el('div', { class: 'nx tnum', text: `Després · ${hhmm(p.next.s)} ${p.next.t}` }));
  } else {
    card.append(el('div', { class: 'pt noepg', text: 'Sense guia de programació' }));
  }
  return card;
}
const imgSrc = u => u ? '/api/img?u=' + encodeURIComponent(u) : '';
// Ensenyem la marca de text de seguida i la substituïm si la imatge arriba:
// el servidor de logos del proveïdor pot trigar molt.
function logoOf(c) {
  const box = monoOf(c.n);
  if (!c.l) return box;
  const i = new Image();
  i.onload = () => { const t = el('img', { class: 'logo', src: i.src, alt: '' }); box.replaceWith(t); };
  i.src = imgSrc(c.l);
  return box;
}
function monoOf(name) {
  const t = (name || '?').replace(/\b(HD|FHD|SD|4K|1080|720)\b/gi, '').trim();
  return el('span', { class: 'mono', text: (t.slice(0, 3) || '?').toUpperCase() });
}

// — TV en directe —
async function vLive(main) {
  const col = el('div', { class: 'col' });
  main.classList.add('rowed'); main.append(col);
  S.q ||= {};
  const search = sectionSearch('Cerca un canal', S.q.live || '',
    v => { S.q.live = v; S.page.live = 0; render(); });
  header(col, 'TV en directe', null, [search.node, refreshChip('live')]);
  const wrap = el('div', { class: 'scroll' }); col.append(wrap);
  const ok = await guard(main, async () => {
    await ensureCatalog('live');
    try { await ensureEpg(); } catch (e) { toast('Canals carregats, però la guia no: ' + e.msg, true); }
    return true;
  }, 'Carregant canals i guia de programació…');
  if (!ok) return;

  const cats = S.cat.live.cats, items = S.cat.live.items;
  const counts = {}; items.forEach(i => counts[i.c] = (counts[i.c] || 0) + 1);
  S.pick.live ||= cats.find(c => counts[c.id])?.id || cats[0]?.id;

  const rail = el('aside', { class: 'rail' },
    el('div', { class: 'navlbl', text: `CATEGORIES · ${cats.filter(c => counts[c.id]).length}` }));
  const railList = el('div', { class: 'list' });
  rail.append(railList);
  main.prepend(rail);

  const chanScroll = el('div', { class: 'chanwrap' }); wrap.append(chanScroll);
  chanScroll.append(el('div', { class: 'cols chead' },
    el('span'), el('span'),
    el('span', { class: 'navlbl', text: 'CANAL' }),
    el('span', { class: 'navlbl', style: 'color:var(--live)', text: 'ARA · ' + hhmm(nowSec()) }),
    el('span', { class: 'navlbl', text: 'A CONTINUACIÓ' }), el('span')));
  const box = el('div', { style: 'padding:0 30px' }); chanScroll.append(box);

  function render() {
    const q = (S.q.live || '').trim();
    const cercant = q.length >= 2;
    const list = cercant
      ? items.filter(c => norm(c.n).includes(norm(q)))
      : items.filter(i => i.c === S.pick.live);

    railList.textContent = '';
    cats.filter(c => counts[c.id]).forEach(c => {
      const b = el('button', { class: !cercant && S.pick.live === c.id ? 'on' : '',
        style: cercant ? 'opacity:.5' : '',
        onclick: () => {
          S.pick.live = c.id; S.page.live = 0; S.q.live = ''; search.input.value = ''; render();
        } });
      b.append(el('span', { text: c.n }), el('span', { class: 'ct tnum', text: fmt(counts[c.id]) }));
      railList.append(b);
    });

    col.querySelector('.sub')?.remove();
    col.querySelector('.head > div').append(el('div', { class: 'sub',
      text: cercant
        ? `«${q}» · ${fmt(list.length)} ${list.length === 1 ? 'canal' : 'canals'} a totes les categories`
        : `${cats.find(c => c.id === S.pick.live)?.n || ''} · ${fmt(list.length)} canals` +
          (S.epg ? ` · guia de les ${hhmm(S.epg.at)}` : ' · sense guia') }));

    box.textContent = '';
    chanScroll.querySelectorAll('.chip').forEach(n => n.remove());
    if (!list.length) {
      box.append(el('div', { class: 'empty', text: `Cap canal per a «${q}».` }));
      return;
    }
    paged(box, list, 120, 'live', c => liveRow(c), render);
  }
  render();
}

function liveRow(c) {
  const p = progOf(c.e);
  const row = el('button', { class: 'row cols', onclick: () => play('live', c.id, c.n) });
  const st = el('span', { class: 'star' + (isFav('live', c.id) ? ' on' : ''),
    role: 'button', tabindex: '0', title: 'Favorit',
    onclick: e => { e.stopPropagation(); toggleFav('live', c.id);
      st.classList.toggle('on'); st.innerHTML = ic('star', 16, 1.5, st.classList.contains('on') ? 'currentColor' : 'none'); } });
  st.innerHTML = ic('star', 16, 1.5, isFav('live', c.id) ? 'currentColor' : 'none');

  const name = el('div', { class: 'cname' }, el('b', { text: c.n }));
  const q = (c.n.match(/\b(4K|UHD|1080|720)\b/i) || c.n.match(/\b(FHD|HD|SD)\b/i) || [])[0];
  if (q) name.append(el('span', { class: 'q tnum', text: q.toUpperCase() }));

  let nowCell, nextCell;
  if (p?.now) {
    const pct = Math.max(1, Math.min(100, Math.round((nowSec() - p.now.s) / (p.now.e - p.now.s) * 100)));
    nowCell = el('div', { class: 'pnow' },
      el('div', { class: 'pnow-t' },
        el('span', { class: 'pnow-h tnum', text: hhmm(p.now.s) }),
        el('b', { text: p.now.t })),
      el('div', { class: 'prog live', style: 'max-width:300px' }, el('i', { style: `width:${pct}%` })));
    nextCell = p.next ? el('div', { class: 'pnext' },
      el('span', { class: 'tnum', text: 'DESPRÉS · ' + hhmm(p.next.s) }),
      el('b', { text: p.next.t })) : el('div');
  } else {
    nowCell = el('div', { class: 'noepg', text: 'Sense guia de programació' });
    nextCell = el('div');
  }
  row.append(st, logoOf(c), name, nowCell, nextCell,
    c.a ? el('span', { style: 'color:var(--ink4)', title: 'Es pot recuperar', html: ic('rew', 16) }) : el('span'));
  return row;
}

// — Graelles de pel·lícules i sèries —
async function vGrid(main) {
  const kind = S.view;
  const title = kind === 'vod' ? 'Pel·lícules' : 'Sèries';
  S.q ||= {};
  const search = sectionSearch(kind === 'vod' ? 'Cerca una pel·lícula' : 'Cerca una sèrie',
    S.q[kind] || '', v => { S.q[kind] = v; S.page[kind] = 0; render(); });
  header(main, title, null, [search.node, refreshChip(kind)]);
  const wrap = el('div', { class: 'scroll' }); main.append(wrap);
  const ok = await guard(main, () => ensureCatalog(kind), `Carregant ${title.toLowerCase()}…`);
  if (!ok) return;

  const { cats, items } = S.cat[kind];
  const counts = {}; items.forEach(i => counts[i.c] = (counts[i.c] || 0) + 1);
  S.pick[kind] ||= cats.find(c => counts[c.id])?.id || cats[0]?.id;

  const tabs = el('div', { class: 'cattabs' }); wrap.append(tabs);
  const results = el('div'); wrap.append(results);

  function render() {
    const q = (S.q[kind] || '').trim();
    const cercant = q.length >= 2;
    // Cercant, mirem TOT el catàleg de la secció: si busques un títol concret
    // no saps (ni t'importa) en quina categoria l'han posat.
    const list = cercant
      ? items.filter(x => norm(x.n).includes(norm(q)))
      : items.filter(i => i.c === S.pick[kind]);

    tabs.textContent = '';
    tabs.classList.toggle('searching', cercant);
    cats.filter(c => counts[c.id]).forEach(c => {
      const b = el('button', { class: 'cattab' + (!cercant && S.pick[kind] === c.id ? ' on' : ''),
        onclick: () => {                       // triar categoria cancel·la la cerca
          S.pick[kind] = c.id; S.page[kind] = 0; S.q[kind] = ''; search.input.value = ''; render();
        } });
      b.append(el('span', { text: catLabel(c.n, kind) }), el('span', { class: 'ct', text: fmt(counts[c.id]) }));
      tabs.append(b);
    });

    main.querySelector('.sub')?.remove();
    main.querySelector('.head > div').append(el('div', { class: 'sub',
      text: cercant
        ? `«${q}» · ${fmt(list.length)} ${list.length === 1 ? 'resultat' : 'resultats'} a totes les categories`
        : `${catLabel(cats.find(c => c.id === S.pick[kind])?.n || '', kind)} · ${fmt(list.length)} títols` }));

    results.textContent = '';
    if (!list.length) {
      results.append(el('div', { class: 'empty',
        text: cercant ? `Cap resultat per a «${q}».` : 'Aquesta categoria és buida.' }));
      return;
    }
    const grid = el('div', { class: 'grid' }); results.append(grid);
    paged(grid, list, 60, kind, it => poster(it, kind), render);
  }
  render();
}

function catLabel(name, kind) {
  const pref = kind === 'vod' ? /^CINE\s+/i : kind === 'series' ? /^SERIES\s+/i : null;
  if (!pref) return name;
  const curt = name.replace(pref, '').trim();
  return curt.length >= 3 ? curt : name;
}

function poster(it, kind) {
  const card = el('button', { class: 'card',
    onclick: () => kind === 'series' ? go('serie', it.id) : go('movie', it.id) });
  const pw = el('div', { class: 'pw' });
  if (it.l) {
    const img = el('img', { src: imgSrc(it.l), alt: '', loading: 'lazy' });
    img.onerror = () => { img.remove(); pw.append(el('div', { class: 'ph', text: it.n })); };
    pw.append(img);
  } else pw.append(el('div', { class: 'ph', text: it.n }));
  const r = parseFloat(it.r);
  if (r > 0) pw.append(el('span', { class: 'rt tnum', text: r.toFixed(1).replace('.', ',') }));
  const st = el('span', { class: 'star fv' + (isFav(kind, it.id) ? ' on' : ''),
    role: 'button', tabindex: '0',
    onclick: e => { e.stopPropagation(); toggleFav(kind, it.id);
      st.classList.toggle('on');
      st.innerHTML = ic('star', 15, 1.5, st.classList.contains('on') ? 'currentColor' : 'none'); } });
  st.innerHTML = ic('star', 15, 1.5, isFav(kind, it.id) ? 'currentColor' : 'none');
  pw.append(st);
  card.append(pw, el('b', { text: it.n }));
  if (it.y) card.append(el('span', { class: 'tnum', text: it.y }));
  return card;
}

function paged(host, list, size, key, make, redraw) {
  const n = (S.page[key] || 0) + 1;
  const slice = list.slice(0, size * n);
  slice.forEach(x => host.append(make(x)));
  if (list.length > slice.length) {
    const more = el('button', { class: 'chip', style: 'margin:16px 30px 30px',
      onclick: () => { S.page[key] = n; (redraw || (() => go(S.view)))(); } });
    more.append(svg('down', 14), `Carrega'n ${fmt(Math.min(size, list.length - slice.length))} més ` +
      `(en queden ${fmt(list.length - slice.length)})`);
    (host.parentElement || host).append(more);
  }
}

// — Fitxa de sèrie —
async function vSerie(main, sid) {
  header(main, 'Sèrie', null, [backChip('series')]);
  const wrap = el('div', { class: 'scroll' }); main.append(wrap);
  const data = await guard(main, () => api('/api/series/' + sid, { timeout: 40000 }),
    'Carregant la fitxa…');
  if (!data) return;
  const info = data.info || {}, seasons = data.episodes || {};
  main.querySelector('.h1').textContent = info.name || 'Sèrie';
  const keys = Object.keys(seasons).sort((a, b) => (+a) - (+b));
  const total = keys.reduce((a, k) => a + seasons[k].length, 0);
  S.pick.season = keys.includes(S.pick.season) ? S.pick.season : keys[0];

  const d = el('div', { class: 'detail' }); wrap.append(d);
  const pw = el('div', { class: 'pw' });
  if (info.cover) { const i = el('img', { src: imgSrc(info.cover), alt: '' });
    i.onerror = () => { i.remove(); pw.append(el('div', { class: 'ph', text: info.name || '' })); };
    pw.append(i); }
  else pw.append(el('div', { class: 'ph', text: info.name || '' }));

  const facts = el('div', { class: 'dfacts' });
  const r = parseFloat(info.rating);
  if (r > 0) facts.append(el('span', { class: 'rt tnum', text: r.toFixed(1).replace('.', ',') }));
  [(info.releaseDate || '').slice(0, 4), (info.genre || '').replace(/\s*\/\s*/g, ', '),
   `${keys.length} ${keys.length === 1 ? 'temporada' : 'temporades'} · ${total} episodis`,
   info.episode_run_time ? `~${info.episode_run_time} min` : ''
  ].filter(Boolean).forEach((t, i, a) => {
    facts.append(el('span', { text: t })); if (i < a.length - 1) facts.append(el('i', { text: '·' })); });

  const favBtn = el('button', { class: 'btn btn-s', onclick: () => {
    toggleFav('series', sid); paintFav(); } });
  const paintFav = () => { favBtn.textContent = '';
    favBtn.style.color = isFav('series', sid) ? 'var(--acc)' : '';
    favBtn.append(svg('star', 15, 1.5, isFav('series', sid) ? 'currentColor' : 'none'),
      isFav('series', sid) ? 'Als favorits' : 'Afegir a favorits'); };
  paintFav();

  d.append(el('div', { class: 'dtop' }, pw,
    el('div', { class: 'dmeta' },
      el('div', { style: 'display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap' },
        el('div', { class: 'serif dtitle', text: info.name || '' }),
        el('div', { style: 'margin-left:auto;display:flex;gap:8px' }, favBtn)),
      facts,
      info.plot ? el('div', { class: 'dplot', text: info.plot }) : null,
      info.cast ? el('div', { class: 'dcast' }, el('em', { text: 'REPARTIMENT' }),
        document.createTextNode(info.cast.split(',').map(s => s.trim()).join(' · '))) : null)));

  const tabs = el('div', { class: 'tabs' });
  keys.forEach(k => {
    const b = el('button', { class: 'tab' + (S.pick.season === k ? ' on' : ''),
      onclick: () => { S.pick.season = k; go('serie', sid); } });
    b.append(`Temporada ${k}`, el('span', { class: 'ct tnum', text: seasons[k].length }));
    tabs.append(b);
  });
  d.append(tabs);

  const eps = el('div', { class: 'eps' });
  (seasons[S.pick.season] || []).forEach(e => eps.append(epRow(e, sid, info)));
  d.append(eps);
}

function epRow(e, sid, info) {
  const num = e.episode_num, key = `${sid}:${S.pick.season}:${num}`;
  const seen = !!S.prefs.progress.seen[key];
  const inf = e.info || {};
  const title = (e.title || '').split(' - ').pop();
  const dur = (inf.duration || '').split(':').slice(0, 2);
  const row = el('button', { class: 'ep' + (seen ? ' seen' : ''), onclick: () => {
    S.prefs.progress.seen[key] = 1;
    S.prefs.progress.last[sid] = { name: info.name, cover: info.cover, s: S.pick.season,
      e: num, title, at: nowSec() };
    savePrefs();
    play('series', e.id, `${info.name} T${S.pick.season}E${num}`, e.container_extension || 'mkv');
    row.classList.add('seen');
  } });
  const mk = el('span', { class: 'mk' });
  if (seen) mk.innerHTML = ic('check', 12, 2.2);
  row.append(mk,
    el('span', { class: 'no tnum', text: num }),
    el('span', { class: 'ti' }, el('b', { text: title || `Episodi ${num}` }),
      inf.plot ? el('span', { text: inf.plot }) : null),
    el('span', { class: 'du tnum', text: dur.length === 2 ? `${+dur[0] * 60 + +dur[1]} min` : '' }),
    el('span', { style: 'color:var(--acc)', html: ic('out', 16) }));
  return row;
}

// — Fitxa de pel·lícula —
async function vMovie(main, vid) {
  header(main, 'Pel·lícula', null, [backChip('vod')]);
  const wrap = el('div', { class: 'scroll' }); main.append(wrap);
  const data = await guard(main, () => api('/api/movie/' + vid, { timeout: 40000 }), 'Carregant la fitxa…');
  if (!data) return;
  const i = data.info || {}, m = data.movie_data || {};
  const name = m.name || i.name || 'Pel·lícula';
  main.querySelector('.h1').textContent = name;

  const pw = el('div', { class: 'pw' });
  const cover = i.movie_image || i.cover_big;
  if (cover) { const im = el('img', { src: imgSrc(cover), alt: '' });
    im.onerror = () => { im.remove(); pw.append(el('div', { class: 'ph', text: name })); }; pw.append(im); }
  else pw.append(el('div', { class: 'ph', text: name }));

  const facts = el('div', { class: 'dfacts' });
  const r = parseFloat(i.rating);
  if (r > 0) facts.append(el('span', { class: 'rt tnum', text: r.toFixed(1).replace('.', ',') }));
  [(i.releasedate || i.releaseDate || '').slice(0, 4), i.genre, i.duration, i.director]
    .filter(Boolean).forEach((t, k, a) => {
      facts.append(el('span', { text: t })); if (k < a.length - 1) facts.append(el('i', { text: '·' })); });

  const playBtn = el('button', { class: 'btn btn-p',
    onclick: () => play('movie', vid, name, m.container_extension || 'mkv') });
  playBtn.append(svg('play', 14, 1.6, 'currentColor'), 'Obrir al VLC');
  const favBtn = el('button', { class: 'btn btn-s', onclick: () => { toggleFav('vod', vid); paint(); } });
  const paint = () => { favBtn.textContent = '';
    favBtn.style.color = isFav('vod', vid) ? 'var(--acc)' : '';
    favBtn.append(svg('star', 15, 1.5, isFav('vod', vid) ? 'currentColor' : 'none'),
      isFav('vod', vid) ? 'Als favorits' : 'Afegir a favorits'); };
  paint();

  wrap.append(el('div', { class: 'detail' },
    el('div', { class: 'dtop' }, pw,
      el('div', { class: 'dmeta' },
        el('div', { class: 'serif dtitle', text: name }),
        facts,
        i.plot ? el('div', { class: 'dplot', text: i.plot }) : null,
        i.cast ? el('div', { class: 'dcast' }, el('em', { text: 'REPARTIMENT' }),
          document.createTextNode(i.cast)) : null,
        el('div', { style: 'display:flex;gap:9px;margin-top:6px' }, playBtn, favBtn)))));
}

function backChip(to) {
  const b = el('button', { class: 'chip', onclick: () => go(to) });
  b.append(svg('left', 14), 'Tornar');
  return b;
}

// — Favorits —
async function vFavs(main) {
  header(main, 'Favorits', null, []);
  const wrap = el('div', { class: 'scroll' }); main.append(wrap);
  const need = ['live', 'vod', 'series'].filter(k => Object.keys(favOf(k)).length && !S.cat[k]);
  if (need.length) {
    const ok = await guard(main, async () => {
      for (const k of need) await ensureCatalog(k);
      if (Object.keys(favOf('live')).length) await ensureEpg().catch(() => {});
      return true;
    }, 'Carregant els teus favorits…');
    if (!ok) return;
  }
  const box = el('div', { class: 'home' }); wrap.append(box);
  let any = false;
  const chIds = Object.keys(favOf('live'));
  if (chIds.length && S.cat.live) {
    any = true;
    const g = el('div', { class: 'chgrid' });
    S.cat.live.items.filter(c => chIds.includes(String(c.id))).forEach(c => g.append(chCard(c)));
    box.append(el('div', { class: 'hrow' },
      el('div', { class: 'hhead' }, el('span', { class: 'sec', text: 'CANALS' })), g));
  }
  [['series', 'SÈRIES'], ['vod', 'PEL·LÍCULES']].forEach(([k, label]) => {
    const ids = Object.keys(favOf(k));
    if (!ids.length || !S.cat[k]) return;
    any = true;
    const g = el('div', { class: 'grid', style: 'padding:0' });
    S.cat[k].items.filter(x => ids.includes(String(x.id))).forEach(x => g.append(poster(x, k)));
    box.append(el('div', { class: 'hrow' },
      el('div', { class: 'hhead' }, el('span', { class: 'sec', text: label })), g));
  });
  if (!any) box.append(el('div', { class: 'empty',
    text: "Encara no tens res marcat. Toca l'estrella a qualsevol canal, pel·lícula o sèrie." }));
}

// — Cerca —
function doSearch(q) {
  S.query = (q || '').trim();
  if (S.query.length < 2) { toast('Escriu almenys dues lletres.'); return; }
  go('search');
}
async function vSearch(main) {
  header(main, 'Cerca', `«${S.query}»`, []);
  const wrap = el('div', { class: 'scroll' }); main.append(wrap);
  const ok = await guard(main, async () => {
    for (const k of ['live', 'vod', 'series']) await ensureCatalog(k);
    return true;
  }, 'Buscant a tot el catàleg…');
  if (!ok) return;

  const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const q = norm(S.query);
  const box = el('div', { class: 'home' }); wrap.append(box);
  let total = 0;
  [['live', 'CANALS'], ['series', 'SÈRIES'], ['vod', 'PEL·LÍCULES']].forEach(([k, label]) => {
    const hits = S.cat[k].items.filter(x => norm(x.n).includes(q)).slice(0, 48);
    if (!hits.length) return;
    total += hits.length;
    const g = k === 'live' ? el('div', { class: 'chgrid' }) : el('div', { class: 'grid', style: 'padding:0' });
    hits.forEach(x => g.append(k === 'live' ? chCard(x) : poster(x, k)));
    box.append(el('div', { class: 'hrow' },
      el('div', { class: 'hhead' },
        el('span', { class: 'sec', text: label }),
        el('span', { style: 'font-size:11.5px;color:var(--ink4)', text: `${hits.length} resultats` })), g));
  });
  if (!total) box.append(el('div', { class: 'empty', text: `Cap resultat per a «${S.query}».` }));
}

// — Configuració —
function vConfig(main, first) {
  const wrap = el('div', { class: 'cfg' });
  if (first) { $('#app').textContent = ''; $('#app').append(wrap); }
  else { main.append(el('div', { class: 'scroll' }, wrap)); }

  const art = el('div', { class: 'cfg-art' },
    el('h1', { text: 'IPTBe' }),
    el('p', { text: "Entra i gaudeix dels teus canals d'IPTV." }),
    el('div', { class: 'rule', style: 'max-width:340px' }),
    el('div', { class: 'cfg-list' },
      row2('tv', 'Guia de programació en directe'),
      row2('star', 'Favorits i historial, teus i locals'),
      row2('out', 'Reproducció al VLC amb un clic')));
  function row2(i, t) { const d = el('div'); d.append(svg(i, 17), el('span', { text: t })); return d; }

  const e = S.status || {};
  const fServer = field('srv', 'SERVIDOR', 'https://el-teu-servidor.com:8443', e.server || '');
  const fUser = field('user', 'USUARI', 'el teu usuari', e.user || '');
  const fPass = field('lock', 'CONTRASENYA', 'la teva contrasenya', '', 'password');
  const result = el('div');

  const testBtn = el('button', { class: 'btn btn-s' });
  testBtn.append(svg('refr', 15), 'Provar connexió');
  const saveBtn = el('button', { class: 'btn btn-p', style: 'margin-left:auto' });
  saveBtn.append('Desar i entrar', svg('right', 15));

  async function test() {
    result.textContent = '';
    const body = { server: fServer.value(), user: fUser.value(), pass: fPass.value() };
    if (!body.server || !body.user || !body.pass) {
      return result.append(note(false, 'Falten dades', 'Omple els tres camps abans de provar.'));
    }
    testBtn.disabled = saveBtn.disabled = true;
    const old = testBtn.textContent; testBtn.textContent = 'Provant…';
    try {
      const r = await api('/api/test', { method: 'POST', body, timeout: 30000 });
      result.append(note(true, 'Connexió correcta',
        `Compte ${r.status || 'actiu'}${r.expires ? ` fins al ${r.expires}` : ''}. ` +
        `${r.max_connections} ${r.max_connections === '1' ? 'connexió simultània' : 'connexions simultànies'}` +
        (r.max_connections === '1' ? ' — no podràs veure dues coses alhora.' : '.')));
      return true;
    } catch (err) {
      result.append(note(false, ERR_TITLE[err.kind] || 'No ha funcionat',
        err.msg + (ERR_HELP[err.kind] ? ' ' + ERR_HELP[err.kind] : '')));
      return false;
    } finally { testBtn.disabled = saveBtn.disabled = false; testBtn.textContent = ''; testBtn.append(svg('refr', 15), 'Provar connexió'); }
  }
  testBtn.onclick = test;
  saveBtn.onclick = async () => {
    if (!(await test())) return;
    saveBtn.disabled = true;
    try {
      await api('/api/config', { method: 'POST', timeout: 15000,
        body: { server: fServer.value(), user: fUser.value(), pass: fPass.value() } });
      S.cat = {}; S.epg = null;
      S.status = await api('/api/status');
      toast('Credencials desades');
      go('home');
    } catch (err) { result.append(note(false, 'No he pogut desar', err.msg)); saveBtn.disabled = false; }
  };

  wrap.append(art, el('div', { class: 'cfg-form' },
    el('div', { class: 'cfg-box' },
      el('h2', { text: first ? 'Comencem' : 'Configuració' }),
      el('p', { style: 'margin:0;font-size:14px;line-height:1.55;color:var(--ink2)',
        text: 'Enganxa les dades del teu proveïdor. Es desaran només en aquest ordinador.' }),
      fServer.node, fUser.node, fPass.node,
      el('div', { style: 'display:flex;align-items:center;gap:10px' }, testBtn, saveBtn),
      result)));

  function field(icn, label, ph, val, type) {
    const input = el('input', { type: type || 'text', placeholder: ph, value: val,
      autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false' });
    const node = el('div', { class: 'fld' },
      el('label', { text: label }),
      el('div', { class: 'inp' }, svg(icn, 16), input));
    return { node, value: () => input.value.trim() };
  }
  function note(good, title, body) {
    const n = el('div', { class: 'note' + (good ? '' : ' bad') });
    const b = el('b'); b.append(svg(good ? 'check' : 'warn', 15, 2), title);
    n.append(b, el('p', { text: body }));
    return n;
  }
}

// ───────────────────────── arrencada ─────────────────────────

let pingT = null;
async function boot() {
  const app = $('#app');
  const spin = loadingPane(app, 'Arrencant IPTBe…');
  try {
    S.status = await api('/api/status', { timeout: 10000 });
    const p = await api('/api/prefs', { timeout: 10000 }).catch(() => null);
    if (p) {
      S.prefs.favorites = Object.assign({ live: {}, vod: {}, series: {} }, p.favorites || {});
      S.prefs.progress = Object.assign({ seen: {}, last: {} }, p.progress || {});
    }
    S.now = S.status.now?.label ? S.status.now : null;
    spin.done();
    if (!S.status.vlc)
      toast("No trobo el VLC a /Applications. Podràs navegar, però no reproduir.", true);
    if (!S.status.configured) { S.view = 'config'; vConfig(null, true); }
    else go('home');
  } catch (e) {
    spin.done();
    errorPane(app, e, async () => { app.textContent = ''; await boot(); });
    return;
  }
  let fallits = 0;
  pingT = setInterval(async () => {
    try {
      const r = await api('/api/ping', { method: 'POST', timeout: 8000 });
      fallits = 0; setOffline(false);
      const label = r.now?.label || null;
      if (label !== (S.now?.label || null)) { S.now = label ? r.now : null; renderNow(); }
    } catch {
      if (++fallits >= 2) setOffline(true);
    }
  }, 20000);
}

document.addEventListener('keydown', e => {
  if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
    e.preventDefault(); $('.srch input')?.focus();
  }
});
boot();
