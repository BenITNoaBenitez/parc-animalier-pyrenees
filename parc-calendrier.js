/*! <parc-calendrier> — Parc Animalier des Pyrénées · prototype BenIT
 * Les sept calendriers du site officiel (quatre nuits insolites, deux gîtes, vue d’ensemble), refaits à la charte du prototype.
 * Données : service public du widget D-EDGE, avec le jeton public déjà exposé sur les pages officielles.
 * Réservation : moteur officiel D-EDGE. Cette balise ne traite ni paiement ni donnée personnelle.
 * Usage : <script src="parc-calendrier.js" defer></script> puis <parc-calendrier logement="taniere"></parc-calendrier>
 */
(function (root) {
  'use strict';
  const CONFIG = {"property":"JLPH-28870","groupId":"18036","_authCode":"eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJib29raW5nRW5naW5lUmVmZXJlbmNlIjoiSkxQSCIsImhvdGVsSWQiOiIyODg3MCIsImdyb3VwSWQiOiIxODAzNiIsInJlZmVyZW5jZVJhdGVDb2RlIjoiQkFSU0lUIiwiZGlzcGxheU5hbWUiOiJQYXJjLUFuaW1hbGllci1kZXMtUHlyZW5lZXMiLCJuYmYiOjE3NjM0ODAyNzQsImV4cCI6MjUzNDAyMzAwODAwLCJpYXQiOjE3NjM0ODAyNzQsImlzcyI6IkF2YWlscHJvIEFQSSBNYW5hZ2VyIiwiYXVkIjoiZC1lZGdlIn0.2qoyY5Wx2Zw2Oje7LwX0WPQy2BdREyrtIUsJzm9xebLRKgu0-EDg7gdAjsnKg-PXt4wdx8_O6i3apWKOVq-anw"};
  const API = 'https://websdk.d-edge.com/bestprice';
  const ENGINE = 'https://www.secure-hotel-booking.com/d-edge/Parc-Animalier-Des-Pyrenees/JLPH/';
  const SITE = 'https://www.parc-animalier-pyrenees.com/page/';
  const FONTS = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap';
  const CHILD_MAX_AGE = 12;
  const LODGES = {
    tous: {key: 'tous', id: null, name: 'Tous les hébergements', eyebrow: 'Nuits insolites & gîtes d’exception', tagline: 'Le meilleur tarif par date, tous hébergements confondus', page: 'hebergements', adults: 10, children: 10, color: '#91ab2a'},
    taniere: {key: 'taniere', id: 140910, name: 'La Tanière', eyebrow: 'Dormir avec les ours bruns', tagline: 'Dîner, petit-déjeuner & 2 jours au parc inclus', page: 'dormir-avec-les-ours-bruns', adults: 2, children: 1, color: '#a77c4c'},
    refuge: {key: 'refuge', id: 140908, name: 'Le Refuge', eyebrow: 'Dormir avec les loups noirs', tagline: 'Dîner, petit-déjeuner & 2 jours au parc inclus', page: 'dormir-avec-les-loups-noirs', adults: 5, children: 4, color: '#34575e'},
    trappeur: {key: 'trappeur', id: 140907, name: 'La Cabane du Trappeur', eyebrow: 'Dormir avec les loups gris', tagline: 'Dîner, petit-déjeuner & 2 jours au parc inclus', page: 'nuits-insolites', adults: 4, children: 3, color: '#8c9c60'},
    asian: {key: 'asian', id: 163456, name: 'Asian Lodge', eyebrow: 'Dormir avec les pandas roux', tagline: 'Dîner, petit-déjeuner & 2 jours au parc inclus', page: 'dormir-avec-les-pandas-roux', adults: 5, children: 4, color: '#bb6247'},
    grange: {key: 'grange', id: 140905, name: 'La Grange', eyebrow: 'Gîte d’exception · Pyrénées Prestige', tagline: 'Gîte entier rénové, au cœur des Pyrénées', page: 'la-grange', adults: 10, children: 9, color: '#7a6a52'},
    moulin: {key: 'moulin', id: 140906, name: 'Le Moulin', eyebrow: 'Gîte d’exception · Pyrénées Prestige', tagline: 'Moulin rénové, au cœur des Pyrénées', page: 'le-moulin', adults: 5, children: 4, color: '#4f6d8a'}
  };
  const byId = id => Object.values(LODGES).find(l => l.id === Number(id)) || null;
  const iso = d => d.toISOString().slice(0, 10);
  const addDays = (date, n) => iso(new Date(Date.parse(date + 'T12:00:00Z') + n * 86400000));
  const parisToday = () => new Intl.DateTimeFormat('sv-SE', {timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
  const monthStart = date => date.slice(0, 7) + '-01';
  const monthEnd = month => {const d = new Date(month + 'T12:00:00Z'); return iso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 12)));};
  const shiftMonth = (month, n) => {const d = new Date(month + 'T12:00:00Z'); d.setUTCMonth(d.getUTCMonth() + n); return monthStart(iso(d));};
  const money = n => new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: Number.isInteger(n) ? 0 : 2}).format(n);
  const fmt = (date, opts) => new Intl.DateTimeFormat('fr-FR', Object.assign({}, opts, {timeZone: 'UTC'})).format(new Date(date + 'T12:00:00Z'));
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  function clampOccupancy(lodge, occ) {
    const adults = Math.min(lodge.adults, Math.max(1, Number(occ.adults) || 1));
    const children = Math.min(lodge.children, Math.max(0, Number(occ.children) || 0));
    const ages = Array.from({length: children}, (_, i) => {const a = Number((occ.ages || [])[i]); return Number.isInteger(a) && a >= 0 && a <= CHILD_MAX_AGE ? a : 6;});
    return {adults, children, ages};
  }
  function apiUrl(lodge, from, to, occ) {
    const url = new URL(API);
    const params = Object.assign({}, CONFIG, {fromDate: from, toDate: to, adults: String(occ.adults), behavior: 'lowerMinstay', currency: 'EUR', locale: 'fr_FR', output: 'json', s: '1', version: '0.0.1', hotelCurrency: 'EUR'});
    if (lodge.id) params.roomIds = String(lodge.id);
    if (occ.children > 0) {params.children = String(occ.children); params.childrenAges = occ.ages.join(',');}
    url.search = new URLSearchParams(params);
    return url.href;
  }
  // Une ligne par date d’arrivée : tarif « dès » par nuit, séjour minimum, logement. Un service muet ne devient jamais « complet ».
  function normalize(payload, roomId) {
    if (!payload || payload.error || !payload.data || payload.data.code !== 200 || !Array.isArray(payload.data.data)) throw new Error('Réponse D-EDGE non reconnue');
    const map = new Map();
    for (const row of payload.data.data) {
      const date = row.bookingParams && row.bookingParams.from, r = row.restrictions;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !r) continue;
      if (roomId && Number(row.room) !== Number(roomId)) continue;
      const room = byId(row.room) || {key: 'autre', id: Number(row.room), name: 'Hébergement ' + row.room, page: 'hebergements', color: '#91ab2a'};
      const nights = Math.max(1, Number(r.minstay) || 1);
      const perNight = Number(row.pricePerNight) || Number(row.totalPrice) / Math.max(1, Number(row.nights) || 1);
      const available = r.status === 'Available' && Number(row.lowestRoomAvailability) > 0 && !r.closedOnArrival && perNight > 0 && row.currency === 'EUR';
      const status = available ? 'available' : r.closedOnArrival ? 'closed' : r.status === 'NotAvailable' ? 'full' : 'unknown';
      const value = {date, status, price: available ? perNight : null, nights, room, rate: row.rate};
      const prior = map.get(date);
      if (!prior || (available && (prior.status !== 'available' || value.price < prior.price))) map.set(date, value);
    }
    return map;
  }
  function bookingUrl(offer, occ, filterRoom) {
    const url = new URL(ENGINE);
    const params = {arrivalDate: offer.date, departureDate: addDays(offer.date, offer.nights), language: 'fr-FR', selectedAdultCount: String(occ.adults), currency: 'EUR'};
    if (occ.children > 0) params.selectedChildCount = String(occ.children);
    if (filterRoom !== false && offer.room && offer.room.id) {params.roomAction = 'filter'; params.roomId = String(offer.room.id);}
    url.search = new URLSearchParams(params);
    return url.href;
  }
  async function fetchRange(lodge, from, to, occ, signal) {
    const timeout = new AbortController(), timer = setTimeout(() => timeout.abort(), 18000);
    const abort = () => timeout.abort();
    if (signal) {if (signal.aborted) timeout.abort(); signal.addEventListener('abort', abort, {once: true});}
    try {
      const response = await fetch(apiUrl(lodge, from, to, occ), {signal: timeout.signal, credentials: 'omit'});
      if (!response.ok) throw new Error('D-EDGE indisponible');
      return normalize(await response.json(), lodge.id);
    } finally {clearTimeout(timer); if (signal) signal.removeEventListener('abort', abort);}
  }
  function ensureFonts() {
    if (typeof document === 'undefined' || document.getElementById('parc-calendrier-fonts')) return;
    try {for (const face of document.fonts) if (/barlow condensed/i.test(face.family)) return;} catch (e) {}
    const link = document.createElement('link');
    link.id = 'parc-calendrier-fonts'; link.rel = 'stylesheet'; link.href = FONTS;
    document.head.appendChild(link);
  }

  const STYLE = `
:host{--green:#91ab2a;--navy:#00212d;--pale:#edf1dc;--gold:#e0b755;--ink:#07242d;--muted:#738083;--line:#e6eaea;--card:#fff;--day-bg:#f0f4e1;--day-border:#e6edcf;--day-hover:#e3edc1;--day-text:#607719;--sel-bg:#00212d;--sel-text:#fff;--sel-caption:#e2edb9;--accent:#91ab2a;--accent-text:#172900;--body:'DM Sans',system-ui,sans-serif;--display:'Barlow Condensed','Arial Narrow',sans-serif;--months:1;display:block;font-family:var(--body);font-size:13px;line-height:1.4;color:var(--ink);background:var(--card);border-radius:18px;overflow:hidden;box-shadow:0 18px 50px #00212d12;container-type:inline-size;text-align:left}
:host([hidden]){display:none}
:host([theme="nuit"]){--card:#00212d;--ink:#fff;--muted:#b7c4c8;--line:#ffffff22;--day-bg:#ffffff12;--day-border:#ffffff1c;--day-hover:#ffffff24;--day-text:#e0b755;--sel-bg:#e0b755;--sel-text:#00212d;--sel-caption:#3a2e00;--accent:#e0b755;--accent-text:#00212d}
*{box-sizing:border-box}button{font:inherit;color:inherit;cursor:pointer;background:none;border:0;padding:0;margin:0}button:disabled{cursor:default}a{color:inherit}
button:focus-visible,a:focus-visible,select:focus-visible{outline:3px solid #347085;outline-offset:3px}
.head{position:relative;isolation:isolate;min-height:168px;display:flex;flex-direction:column;justify-content:flex-end;padding:22px 24px 20px;color:#fff;background:var(--navy)}
.head img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}
.head:before{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--accent-lodge,var(--green));z-index:1}
.head:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#00212d2e,#00212dd4);z-index:-1}
.eyebrow{font-size:9px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;line-height:1.5}
.head h2{font-family:var(--display);font-size:42px;font-weight:500;line-height:.95;letter-spacing:-.4px;margin:7px 0 8px}
.head p{margin:0;font-size:11px;opacity:.92}
:host([compact]) .head{display:none}
.body{padding:18px 22px 22px}
.top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.live{font-size:9px;color:var(--muted);white-space:nowrap}.live:before{content:'●';color:var(--accent);font-size:7px;margin-right:5px}
.occupancy{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;font-size:10px;color:var(--muted)}
.occupancy label{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
select{font:inherit;font-size:11px;color:var(--ink);background:var(--card);border:1px solid var(--line);border-radius:7px;padding:5px 6px;cursor:pointer}
.nav{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}
.nav h3{margin:0;font-size:15px;font-weight:500}
.nav button{width:32px;height:32px;flex:none;border-radius:50%;border:1px solid var(--line);font-size:20px;line-height:1}
.nav button:hover:not(:disabled){background:var(--day-hover)}.nav button:disabled{opacity:.3}
.months{display:grid;grid-template-columns:repeat(var(--months),minmax(0,1fr));gap:22px}
.month h4{margin:0 0 10px;font-size:12px;font-weight:600;color:var(--muted)}
.weekdays,.grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
.weekdays{font-size:9px;color:var(--muted);text-align:center;margin-bottom:8px}
.day{height:52px;border:1px solid transparent;border-radius:8px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:2px;position:relative;padding:3px 0;font-variant-numeric:tabular-nums}
.num{font-size:13px;line-height:16px}.cap{font-size:8px;line-height:10px;white-space:nowrap}
.day.available{background:var(--day-bg);border-color:var(--day-border);transition:background .15s,transform .15s}
.day.available .cap{color:var(--day-text);font-weight:600}
.day.available:hover{background:var(--day-hover);transform:translateY(-2px);border-color:var(--accent)}
.day.full .cap,.day.closed .cap{color:#9d735e}.day.unknown .cap{color:var(--muted)}.day.past{opacity:.35}
.day.loading .cap{background:var(--day-bg);border-radius:4px;color:transparent;width:24px;animation:pulse 1.3s ease-in-out infinite}
.day.selected{background:var(--sel-bg)!important;border-color:var(--sel-bg);color:var(--sel-text);transform:none}
.day.selected .cap{color:var(--sel-caption)}
.who{position:absolute;bottom:4px;width:4px;height:4px;border-radius:50%}
.key{display:flex;justify-content:space-between;gap:8px;font-size:8px;color:var(--muted);margin-top:14px}
.key i{display:inline-block;width:6px;height:6px;background:var(--accent);border-radius:50%;margin-right:5px}
.notice{font-size:10px;line-height:1.6;color:#8d664b;margin-top:10px}:host([theme="nuit"]) .notice{color:#e8c48b}.notice:empty{display:none}
.retry{margin-top:10px;font-size:10px;padding:9px 13px;border-radius:7px;background:var(--day-bg);color:var(--day-text)}
.pick[hidden]{display:none}.pick{margin-top:16px;padding:16px 18px;border-radius:12px;background:var(--day-bg);border:1px solid var(--day-border);display:grid;gap:9px;animation:reveal .3s ease;outline:none}
.pick .eyebrow{color:var(--muted);letter-spacing:.8px;font-size:8px;text-transform:none}
.pick .lodge{font-family:var(--display);font-size:24px;font-weight:500;line-height:1}
.pick .price{font-family:var(--display);font-size:32px;line-height:1}.pick .price small{font-family:var(--body);font-size:9px;color:var(--muted);margin-left:7px}
.pick .book{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:13px 15px;background:var(--accent);color:var(--accent-text);border-radius:7px;font-size:11px;font-weight:600;text-decoration:none;transition:filter .15s}
.pick .book:hover{filter:brightness(1.06)}
.pick .more{font-size:10px;text-decoration:underline;text-underline-offset:3px}
.pick .hint{font-size:9px;color:var(--muted);line-height:1.6}
.pick .text{justify-self:start;font-size:10px;text-decoration:underline;text-underline-offset:3px;color:var(--muted)}
.foot{margin-top:18px;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:12px;font-size:9px;color:var(--muted);line-height:1.5}
.foot a{white-space:nowrap;color:var(--ink)}
@keyframes pulse{50%{opacity:.4}}@keyframes reveal{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@container (max-width:640px){.months{grid-template-columns:1fr}}
@container (max-width:420px){.body{padding:15px 13px 16px}.day{height:48px;border-radius:6px}.weekdays,.grid{gap:3px}.num{font-size:12px}.cap{font-size:7px}.head{min-height:140px;padding:18px 18px 16px}.head h2{font-size:34px}.foot{display:block}.foot a{display:block;margin-top:6px}.pick{padding:14px}.pick .price{font-size:28px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;

  const SHELL = `<header class="head" id="head"><img id="photo" alt="" hidden><span class="eyebrow" id="eyebrow"></span><h2 id="title"></h2><p id="tagline"></p></header>
<div class="body">
<div class="top"><div class="occupancy" id="occupancy"></div><span class="live" id="live" role="status"></span></div>
<div class="nav"><button type="button" id="prev" aria-label="Mois précédent">‹</button><h3 id="month" aria-live="polite"></h3><button type="button" id="next" aria-label="Mois suivant">›</button></div>
<div class="months" id="months"></div>
<div class="key"><span><i></i> Tarif « dès », par nuit, pour la composition choisie</span><span>— Indisponible</span></div>
<div class="notice" id="notice" role="status"></div>
<button type="button" class="retry" id="retry" hidden>Actualiser les disponibilités ↻</button>
<div class="pick" id="pick" hidden tabindex="-1" aria-live="polite"></div>
<div class="foot"><span id="footText"></span><a id="siteLink" target="_blank" rel="noopener">Voir sur le site du parc ↗</a></div>
</div>`;

  const api = {LODGES, byId, addDays, monthStart, monthEnd, shiftMonth, parisToday, clampOccupancy, apiUrl, normalize, bookingUrl, fetchRange};

  if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
    class ParcCalendrier extends HTMLElement {
      static get observedAttributes() {return ['logement', 'chambre', 'adultes', 'enfants', 'ages', 'mois', 'photo', 'titre', 'sous-titre'];}
      constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this._cache = new Map(); this._req = 0; this._verify = 0; this._results = new Map();
        this._loading = false; this._failed = false; this._selected = null; this._mounted = false;
        this._month = monthStart(parisToday()); this._months = 1; this._lodge = LODGES.tous; this._occ = clampOccupancy(LODGES.tous, {adults: 2});
        this._onOffline = () => {this._req++; if (this._controller) this._controller.abort(); this._cache.clear(); this._results = new Map(); this._loading = false; this._failed = true; this._clear(); this._paint();};
        this._onOnline = () => this._load(true);
      }
      $(id) {return this.shadowRoot.getElementById(id);}
      connectedCallback() {
        if (!this._mounted) {this._mounted = true; ensureFonts(); this._mount();}
        window.addEventListener('offline', this._onOffline); window.addEventListener('online', this._onOnline);
        this._configure(); this._load();
      }
      disconnectedCallback() {
        window.removeEventListener('offline', this._onOffline); window.removeEventListener('online', this._onOnline);
        this._req++; this._verify++; if (this._controller) this._controller.abort(); if (this._verifier) this._verifier.abort();
      }
      attributeChangedCallback(name) {
        if (!this._mounted || !this.isConnected) return;
        if (name === 'photo' || name === 'titre' || name === 'sous-titre') {this._paintHead(); return;}
        this._configure(); this._load();
      }
      get selection() {
        const v = this._selected && this._results.get(this._selected);
        return v && v.status === 'available' ? {date: v.date, nights: v.nights, price: v.price, room: v.room.name, roomId: v.room.id, adults: this._occ.adults, children: this._occ.children, url: bookingUrl(v, this._occ)} : null;
      }
      refresh() {this._cache.clear(); this._load(true);}
      _configure() {
        const key = (this.getAttribute('logement') || '').trim().toLowerCase();
        const byRoom = this.hasAttribute('chambre') ? byId(this.getAttribute('chambre')) : null;
        this._lodge = byRoom || LODGES[key] || (key || this.hasAttribute('chambre') ? null : LODGES.tous);
        this._months = this.getAttribute('mois') === '2' ? 2 : 1;
        this.style.setProperty('--months', String(this._months));
        if (!this._lodge) return;
        this.$('head').style.display = '';
        this._occ = clampOccupancy(this._lodge, {adults: this.getAttribute('adultes') || 2, children: this.getAttribute('enfants') || 0, ages: (this.getAttribute('ages') || '').split(/[,; ]+/).filter(Boolean)});
        this._paintHead(); this._paintOccupancy();
        this.$('siteLink').href = SITE + this._lodge.page;
      }
      _mount() {
        this.shadowRoot.innerHTML = `<style>${STYLE}</style>${SHELL}`;
        this.$('prev').addEventListener('click', () => this._move(-1));
        this.$('next').addEventListener('click', () => this._move(1));
        this.$('retry').addEventListener('click', () => this._load(true));
        this.$('months').addEventListener('click', e => {const b = e.target.closest('button[data-date]'); if (b && !b.disabled) this._select(b.dataset.date);});
        this.$('pick').addEventListener('click', e => {if (e.target.closest('#clear')) this._clear(true);});
        this.$('occupancy').addEventListener('change', () => this._readOccupancy());
      }
      _paintHead() {
        if (!this._lodge) return;
        const img = this.$('photo'), photo = this.getAttribute('photo');
        if (photo) {img.src = photo; img.hidden = false;} else {img.removeAttribute('src'); img.hidden = true;}
        this.$('eyebrow').textContent = this._lodge.eyebrow;
        this.$('title').textContent = this.getAttribute('titre') || this._lodge.name;
        this.$('tagline').textContent = this.getAttribute('sous-titre') || this._lodge.tagline;
        this.$('head').style.setProperty('--accent-lodge', this._lodge.color);
      }
      _paintOccupancy() {
        const l = this._lodge, o = this._occ;
        const options = (from, to, value, suffix) => Array.from({length: to - from + 1}, (_, i) => {const n = from + i; return `<option value="${n}"${n === value ? ' selected' : ''}>${n}${suffix ? ' ' + suffix(n) : ''}</option>`;}).join('');
        this.$('occupancy').innerHTML = `<label>Adultes <select id="adults" aria-label="Nombre d’adultes">${options(1, l.adults, o.adults)}</select></label>` +
          (l.children > 0 ? `<label>Enfants <select id="children" aria-label="Nombre d’enfants, jusqu’à ${CHILD_MAX_AGE} ans">${options(0, l.children, o.children)}</select></label>` : '') +
          o.ages.map((a, i) => `<label>Âge${o.ages.length > 1 ? ' ' + (i + 1) : ''} <select data-age="${i}" aria-label="Âge de l’enfant ${i + 1}">${options(0, CHILD_MAX_AGE, a, n => n > 1 ? 'ans' : 'an')}</select></label>`).join('');
      }
      _readOccupancy() {
        const sr = this.shadowRoot, children = sr.getElementById('children');
        this._occ = clampOccupancy(this._lodge, {adults: sr.getElementById('adults').value, children: children ? children.value : 0, ages: Array.from(sr.querySelectorAll('select[data-age]')).map(s => s.value)});
        this._paintOccupancy(); this._load();
      }
      _move(n) {this._month = shiftMonth(this._month, n); this._load();}
      _range() {
        const today = parisToday();
        return {from: this._month < today ? today : this._month, to: monthEnd(this._months === 2 ? shiftMonth(this._month, 1) : this._month)};
      }
      _load(force) {
        if (!this._lodge) {this._paintError('Logement inconnu. Utilisez logement="tous", "taniere", "refuge", "trappeur", "asian", "grange" ou "moulin", ou chambre="identifiant D-EDGE".'); return;}
        const req = ++this._req;
        if (this._controller) this._controller.abort();
        this._controller = new AbortController();
        this._clear();
        const {from, to} = this._range();
        const key = [this._lodge.key, this._occ.adults, this._occ.children, this._occ.ages.join('-'), from, to].join('|');
        const hit = this._cache.get(key);
        if (!force && hit && Date.now() - hit.time < 60000) {this._results = hit.data; this._loading = false; this._failed = false; this._paint(); return;}
        this._loading = true; this._failed = false; this._results = new Map(); this._paint();
        fetchRange(this._lodge, from, to, this._occ, this._controller.signal)
          .then(data => {if (req !== this._req) return; this._results = data; this._cache.set(key, {time: Date.now(), data});})
          .catch(() => {if (req !== this._req) return; this._results = new Map(); this._failed = true;})
          .then(() => {if (req !== this._req) return; this._loading = false; this._paint();});
      }
      _paint() {this._paintNav(); this._paintGrid(); this._paintStatus();}
      _paintNav() {
        this.$('prev').disabled = this._month <= monthStart(parisToday());
        if (this._months === 2) {
          const next = shiftMonth(this._month, 1), sameYear = this._month.slice(0, 4) === next.slice(0, 4);
          this.$('month').textContent = `${cap(fmt(this._month, sameYear ? {month: 'long'} : {month: 'long', year: 'numeric'}))} – ${fmt(next, {month: 'long', year: 'numeric'})}`;
        } else this.$('month').textContent = cap(fmt(this._month, {month: 'long', year: 'numeric'}));
      }
      _cells(month) {
        const today = parisToday(), start = new Date(month + 'T12:00:00Z'), days = Number(monthEnd(month).slice(8));
        let html = '<span aria-hidden="true"></span>'.repeat((start.getUTCDay() + 6) % 7);
        for (let day = 1; day <= days; day++) {
          const date = month.slice(0, 8) + String(day).padStart(2, '0');
          const past = date < today, v = this._results.get(date);
          const status = past ? 'past' : this._loading ? 'loading' : v ? v.status : 'unknown';
          const active = status === 'available';
          const caption = past ? '' : status === 'loading' ? '…' : active ? money(v.price) : status === 'unknown' ? '?' : '—';
          const detail = past ? 'date passée' : status === 'loading' ? 'chargement' : active ? `dès ${money(v.price)} par nuit${v.nights > 1 ? `, ${v.nights} nuits minimum` : ''}${this._lodge.id ? '' : ', ' + v.room.name}` : status === 'full' ? 'indisponible' : status === 'closed' ? 'arrivée impossible ce jour' : 'disponibilité inconnue';
          html += `<button type="button" class="day ${status}${this._selected === date ? ' selected' : ''}" data-date="${date}"${active ? '' : ' disabled'} aria-label="${esc(cap(fmt(date, {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})) + ', ' + detail)}" aria-pressed="${this._selected === date}"><span class="num">${day}</span><span class="cap">${caption}</span>${active && !this._lodge.id ? `<i class="who" style="background:${v.room.color}" aria-hidden="true"></i>` : ''}</button>`;
        }
        return html;
      }
      _paintGrid() {
        const months = this._months === 2 ? [this._month, shiftMonth(this._month, 1)] : [this._month];
        this.$('months').setAttribute('aria-busy', String(this._loading));
        this.$('months').innerHTML = months.map(m => `<div class="month">${this._months === 2 ? `<h4>${cap(fmt(m, {month: 'long', year: 'numeric'}))}</h4>` : ''}<div class="weekdays" aria-hidden="true"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div><div class="grid" aria-label="Dates d’arrivée">${this._cells(m)}</div></div>`).join('');
      }
      _paintStatus() {
        const today = parisToday(), any = Array.from(this._results.values()).some(v => v.status === 'available' && v.date >= today);
        this.$('live').textContent = this._loading ? 'Connexion…' : this._failed ? 'Connexion indisponible' : 'D-EDGE · en direct';
        this.$('notice').textContent = this._loading ? '' : this._failed ? 'Les disponibilités ne peuvent pas être chargées. Réessayez ou utilisez le moteur officiel.' : !any ? 'Aucune date disponible pour cette composition sur la période affichée. Essayez le mois suivant ou une autre composition.' : '';
        this.$('retry').hidden = this._loading || !this._failed;
        if (!this._selected) this.$('footText').textContent = 'Choisissez une date d’arrivée.';
      }
      _paintError(message) {this.$('head').style.display = 'none'; this.$('notice').textContent = message; this.$('live').textContent = 'Configuration'; this.$('months').innerHTML = ''; this.$('occupancy').innerHTML = ''; this.$('month').textContent = ''; this.$('pick').hidden = true;}
      _clear(focus) {
        const date = this._selected; this._verify++; if (this._verifier) this._verifier.abort();
        this._selected = null; this._paintPick(null);
        if (date) {this._paintGrid(); if (focus) {const b = this.shadowRoot.querySelector(`[data-date="${date}"]`); if (b) b.focus({preventScroll: true});}}
      }
      _select(date) {
        const value = this._results.get(date);
        if (!value || value.status !== 'available') return;
        this._selected = date; this._paintGrid(); this._paintPick(value, 'Vérification de la date auprès de D-EDGE…');
        this.$('pick').focus({preventScroll: true});
        const req = ++this._verify; if (this._verifier) this._verifier.abort(); this._verifier = new AbortController();
        fetchRange(this._lodge, date, date, this._occ, this._verifier.signal).then(map => {
          if (req !== this._verify) return;
          const fresh = map.get(date);
          if (fresh) this._results.set(date, fresh);
          const current = this._results.get(date);
          this._paintGrid();
          this._paintPick(current, fresh && fresh.status === 'available' ? 'Disponibilité confirmée à l’instant. Prix final et conditions confirmés sur le moteur officiel.' : 'Cette date n’est plus confirmée pour cette composition. Choisissez une autre date ou vérifiez sur le moteur officiel.');
          this._emit();
        }).catch(() => {if (req !== this._verify) return; this._paintPick(value, 'Vérification impossible pour le moment : le moteur officiel confirmera la disponibilité.'); this._emit();});
      }
      _emit() {this.dispatchEvent(new CustomEvent('parc-calendrier:selection', {bubbles: true, composed: true, detail: this.selection}));}
      _paintPick(value, hint) {
        const el = this.$('pick');
        if (!value) {el.hidden = true; el.innerHTML = ''; this.$('footText').textContent = 'Choisissez une date d’arrivée.'; return;}
        const o = this._occ, available = value.status === 'available';
        const who = `${o.adults} adulte${o.adults > 1 ? 's' : ''}${o.children ? `, ${o.children} enfant${o.children > 1 ? 's' : ''}` : ''}`;
        const stay = value.nights > 1 ? `${value.nights} nuits minimum` : '1 nuit';
        const short = d => cap(fmt(d, {weekday: 'short', day: 'numeric', month: 'long'}));
        el.hidden = false;
        el.innerHTML = `<span class="eyebrow">${short(value.date)} → ${short(addDays(value.date, value.nights))} · ${stay} · ${who}</span>` +
          (this._lodge.id ? '' : `<span class="lodge">${esc(value.room.name)}</span>`) +
          (available ? `<span class="price">${money(value.price)}<small>par nuit · dès</small></span><a class="book" href="${bookingUrl(value, o)}" target="_blank" rel="noopener">Réserver sur le moteur officiel <span>↗</span></a>` : `<span class="price">Indisponible</span><a class="book" href="${bookingUrl(value, o, false)}" target="_blank" rel="noopener">Voir d’autres dates sur le moteur officiel <span>↗</span></a>`) +
          (this._lodge.id || !available ? '' : `<a class="more" href="${bookingUrl(value, o, false)}" target="_blank" rel="noopener">Tous les hébergements à cette date ↗</a>`) +
          `<span class="hint">${esc(hint || '')}</span><button type="button" class="text" id="clear">← Changer de date</button>`;
        this.$('footText').textContent = `Tarif pour ${who}, hors taxe de séjour.`;
      }
    }
    api.ParcCalendrier = ParcCalendrier;
    if (!customElements.get('parc-calendrier')) customElements.define('parc-calendrier', ParcCalendrier);
  }
  root.parcCalendrier = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
