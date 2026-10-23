/*! <parc-calendrier> — Parc Animalier des Pyrénées · prototype BenIT
 * Les sept calendriers du site officiel (quatre nuits insolites, deux gîtes, vue d’ensemble), refaits à la charte du prototype.
 * Données : service public du widget D-EDGE, avec le jeton public déjà exposé sur les pages officielles.
 * Réservation : moteur officiel D-EDGE. Cette balise ne traite ni paiement ni donnée personnelle.
 * Usage : <script src="parc-calendrier.js" defer></script> puis <parc-calendrier logement="taniere"></parc-calendrier>
 * Attributs : logement | chambre, adultes, enfants, ages, mois (1|2), design (cases|cercles|lignes), theme (clair|sombre), photo, titre, sous-titre, compact.
 * Un clic choisit la nuit du jour cliqué et affiche ses deux jours, arrivée et départ ; un clic plus loin déplace le départ
 * tant que les nuits intermédiaires sont disponibles. Les boutons − et + du panneau font de même. Le séjour minimum est annoncé dans la case, au-dessus du calendrier et dans le panneau.
 */
(function (root) {
  'use strict';
  const CONFIG = {"property":"JLPH-28870","groupId":"18036","_authCode":"eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJib29raW5nRW5naW5lUmVmZXJlbmNlIjoiSkxQSCIsImhvdGVsSWQiOiIyODg3MCIsImdyb3VwSWQiOiIxODAzNiIsInJlZmVyZW5jZVJhdGVDb2RlIjoiQkFSU0lUIiwiZGlzcGxheU5hbWUiOiJQYXJjLUFuaW1hbGllci1kZXMtUHlyZW5lZXMiLCJuYmYiOjE3NjM0ODAyNzQsImV4cCI6MjUzNDAyMzAwODAwLCJpYXQiOjE3NjM0ODAyNzQsImlzcyI6IkF2YWlscHJvIEFQSSBNYW5hZ2VyIiwiYXVkIjoiZC1lZGdlIn0.2qoyY5Wx2Zw2Oje7LwX0WPQy2BdREyrtIUsJzm9xebLRKgu0-EDg7gdAjsnKg-PXt4wdx8_O6i3apWKOVq-anw"};
  const API = 'https://websdk.d-edge.com/bestprice';
  const ENGINE = 'https://www.secure-hotel-booking.com/d-edge/Parc-Animalier-Des-Pyrenees/JLPH/';
  const SITE = 'https://www.parc-animalier-pyrenees.com/page/';
  const MEDIA = 'https://www.parc-animalier-pyrenees.com/medias_front/pages/';
  const FONTS = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap';
  const CHILD_MAX_AGE = 12;
  const LODGES = {
    tous: {key: 'tous', photo: MEDIA + '045810035120000437parcanimalierdespyrenees-ayzacost-photoaspheries.jpg', id: null, ids: [140910, 140908, 140907, 163456], name: 'Les quatre lodges', eyebrow: 'Nuits insolites · vue d’ensemble', tagline: 'Le meilleur tarif par date parmi La Tanière, Le Refuge, La Cabane du Trappeur et Asian Lodge', page: 'hebergements', adults: 5, children: 4, color: '#91ab2a'},
    taniere: {key: 'taniere', photo: MEDIA + '033817taniere.jpg', id: 140910, name: 'La Tanière', eyebrow: 'Dormir avec les ours bruns', tagline: 'Dîner, petit-déjeuner & 2 jours au parc inclus', page: 'dormir-avec-les-ours-bruns', adults: 2, children: 1, color: '#a77c4c'},
    refuge: {key: 'refuge', photo: MEDIA + '042005ecolodge_le_refuge_pap-19.jpg', id: 140908, name: 'Le Refuge', eyebrow: 'Dormir avec les loups noirs', tagline: 'Dîner, petit-déjeuner & 2 jours au parc inclus', page: 'dormir-avec-les-loups-noirs', adults: 5, children: 4, color: '#34575e'},
    trappeur: {key: 'trappeur', photo: MEDIA + '115802trappeur.jpg', id: 140907, name: 'La Cabane du Trappeur', eyebrow: 'Dormir avec les loups gris', tagline: 'Dîner, petit-déjeuner & 2 jours au parc inclus', page: 'nuits-insolites', adults: 4, children: 3, color: '#8c9c60'},
    asian: {key: 'asian', photo: MEDIA + '011910shutterstock_32201191.jpg', id: 163456, name: 'Asian Lodge', eyebrow: 'Dormir avec les pandas roux', tagline: 'Dîner, petit-déjeuner & 2 jours au parc inclus', page: 'dormir-avec-les-pandas-roux', adults: 5, children: 4, color: '#bb6247'},
    grange: {key: 'grange', photo: MEDIA + '115115la_grange_parc_animalier_des_pyrenees-33.jpg', id: 140905, name: 'La Grange', eyebrow: 'Gîte d’exception · Pyrénées Prestige', tagline: 'Gîte entier rénové, au cœur des Pyrénées', page: 'la-grange', adults: 10, children: 9, color: '#7a6a52'},
    moulin: {key: 'moulin', photo: MEDIA + '114008le_moulin_parc_animalier_des_pyrenees-21.jpg', id: 140906, name: 'Le Moulin', eyebrow: 'Gîte d’exception · Pyrénées Prestige', tagline: 'Moulin rénové, au cœur des Pyrénées', page: 'le-moulin', adults: 5, children: 4, color: '#4f6d8a'}
  };
  const byId = id => Object.values(LODGES).find(l => l.id === Number(id)) || null;
  const iso = d => d.toISOString().slice(0, 10);
  const addDays = (date, n) => iso(new Date(Date.parse(date + 'T12:00:00Z') + n * 86400000));
  const nightsBetween = (from, to) => Math.round((Date.parse(to + 'T12:00:00Z') - Date.parse(from + 'T12:00:00Z')) / 86400000);
  const parisToday = () => new Intl.DateTimeFormat('sv-SE', {timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
  const monthStart = date => date.slice(0, 7) + '-01';
  const monthEnd = month => {const d = new Date(month + 'T12:00:00Z'); return iso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 12)));};
  const shiftMonth = (month, n) => {const d = new Date(month + 'T12:00:00Z'); d.setUTCMonth(d.getUTCMonth() + n); return monthStart(iso(d));};
  const money = n => new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: Number.isInteger(n) ? 0 : 2}).format(n);
  const fmt = (date, opts) => new Intl.DateTimeFormat('fr-FR', Object.assign({}, opts, {timeZone: 'UTC'})).format(new Date(date + 'T12:00:00Z'));
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

  function clampOccupancy(lodge, occ) {
    const adults = Math.min(lodge.adults, Math.max(1, Number(occ.adults) || 1));
    const children = Math.min(lodge.children, Math.max(0, Number(occ.children) || 0));
    const ages = Array.from({length: children}, (_, i) => {const a = Number((occ.ages || [])[i]); return Number.isInteger(a) && a >= 0 && a <= CHILD_MAX_AGE ? a : 6;});
    return {adults, children, ages};
  }
  function apiUrl(lodge, from, to, occ) {
    const url = new URL(API);
    const params = Object.assign({}, CONFIG, {fromDate: from, toDate: to, adults: String(occ.adults), behavior: 'lowerMinstay', currency: 'EUR', locale: 'fr_FR', output: 'json', s: '1', version: '0.0.1', hotelCurrency: 'EUR'});
    if (lodge.ids) params.roomIds = lodge.ids.join(','); else if (lodge.id) params.roomIds = String(lodge.id);
    if (occ.children > 0) {params.children = String(occ.children); params.childrenAges = occ.ages.join(',');}
    url.search = new URLSearchParams(params);
    return url.href;
  }
  // Une ligne par date d’arrivée : tarif « dès » par nuit, séjour minimum et maximum, logement. Un service muet ne devient jamais « complet ».
  // `rooms` : un identifiant, une liste d’identifiants, ou rien pour tout accepter.
  function normalize(payload, rooms) {
    if (!payload || payload.error || !payload.data || payload.data.code !== 200 || !Array.isArray(payload.data.data)) throw new Error('Réponse D-EDGE non reconnue');
    const allowed = Array.isArray(rooms) ? rooms.map(Number) : rooms ? [Number(rooms)] : null;
    const map = new Map();
    for (const row of payload.data.data) {
      const date = row.bookingParams && row.bookingParams.from, r = row.restrictions;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !r) continue;
      if (allowed && !allowed.includes(Number(row.room))) continue;
      const room = byId(row.room) || {key: 'autre', id: Number(row.room), name: 'Hébergement ' + row.room, page: 'hebergements', color: '#91ab2a'};
      const nights = Math.max(1, Number(r.minstay) || 1);
      const perNight = Number(row.pricePerNight) || Number(row.totalPrice) / Math.max(1, Number(row.nights) || 1);
      const available = r.status === 'Available' && Number(row.lowestRoomAvailability) > 0 && !r.closedOnArrival && perNight > 0 && row.currency === 'EUR';
      const status = available ? 'available' : r.closedOnArrival ? 'closed' : r.status === 'NotAvailable' ? 'full' : 'unknown';
      const value = {date, status, price: available ? perNight : null, nights, maxNights: Math.max(nights, Number(r.maxstay) || 31), noDeparture: !!r.closedOnDeparture, room, rate: row.rate};
      const prior = map.get(date);
      if (!prior || (available && (prior.status !== 'available' || value.price < prior.price))) map.set(date, value);
    }
    return map;
  }
  function bookingUrl(offer, occ, filterRoom, nights) {
    const stay = Math.max(1, Number(nights) || offer.nights || 1);
    const url = new URL(ENGINE);
    const params = {arrivalDate: offer.date, departureDate: addDays(offer.date, stay), language: 'fr-FR', selectedAdultCount: String(occ.adults), currency: 'EUR'};
    if (occ.children > 0) params.selectedChildCount = String(occ.children);
    if (filterRoom !== false && offer.room && offer.room.id) {params.roomAction = 'filter'; params.roomId = String(offer.room.id);}
    url.search = new URLSearchParams(params);
    return url.href;
  }
  // Vue d’ensemble : une date réunit les quatre lodges. Un point par logement disponible ; un lodge qui ne répond pas rend la date « à vérifier », jamais « complet ».
  function combine(maps, date) {
    const values = maps.map(m => (m ? m.get(date) : undefined));
    const offers = values.filter(v => v && v.status === 'available').sort((a, b) => a.price - b.price);
    const unknown = values.some(v => !v || v.status === 'unknown');
    const allClosed = values.length > 0 && values.every(v => v && v.status === 'closed');
    const best = offers[0] || null;
    const byRoom = {};
    for (const v of values) if (v) byRoom[v.room.id] = v;
    return {date, status: best ? 'available' : unknown ? 'unknown' : allClosed ? 'closed' : 'full', price: best ? best.price : null, nights: best ? best.nights : 1, maxNights: best ? best.maxNights : 31, noDeparture: best ? best.noDeparture : false, room: best ? best.room : null, offers, byRoom, unknown};
  }
  function combineMaps(maps, from, to) {
    const map = new Map();
    for (let date = from; date <= to; date = addDays(date, 1)) map.set(date, combine(maps, date));
    map.partial = maps.some(m => !m);
    return map;
  }
  async function fetchOne(room, from, to, occ, signal) {
    const timeout = new AbortController(), timer = setTimeout(() => timeout.abort(), 18000);
    const abort = () => timeout.abort();
    if (signal) {if (signal.aborted) timeout.abort(); signal.addEventListener('abort', abort, {once: true});}
    try {
      const response = await fetch(apiUrl(room, from, to, occ), {signal: timeout.signal, credentials: 'omit'});
      if (!response.ok) throw new Error('D-EDGE indisponible');
      return normalize(await response.json(), room.id);
    } finally {clearTimeout(timer); if (signal) signal.removeEventListener('abort', abort);}
  }
  async function fetchRange(lodge, from, to, occ, signal) {
    if (!lodge.ids) return fetchOne(lodge, from, to, occ, signal);
    const settled = await Promise.allSettled(lodge.ids.map(id => fetchOne({id}, from, to, occ, signal)));
    if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const maps = settled.map(r => (r.status === 'fulfilled' ? r.value : null));
    if (maps.every(m => !m)) throw new Error('D-EDGE indisponible');
    return combineMaps(maps, from, to);
  }
  function ensureFonts() {
    if (typeof document === 'undefined' || document.getElementById('parc-calendrier-fonts')) return;
    try {for (const face of document.fonts) if (/barlow condensed/i.test(face.family)) return;} catch (e) {}
    const link = document.createElement('link');
    link.id = 'parc-calendrier-fonts'; link.rel = 'stylesheet'; link.href = FONTS;
    document.head.appendChild(link);
  }

  const STYLE = `
:host{--green:#91ab2a;--navy:#00212d;--pale:#edf1dc;--gold:#e0b755;--ink:#07242d;--muted:#738083;--line:#e6eaea;--card:#fff;--day-bg:#f0f4e1;--day-border:#e6edcf;--day-hover:#e3edc1;--day-text:#607719;--sel-bg:#00212d;--sel-text:#fff;--sel-caption:#e2edb9;--within-bg:#dfe8c0;--accent:#91ab2a;--accent-strong:#5c7414;--accent-text:#172900;--body:'DM Sans',system-ui,sans-serif;--display:'Barlow Condensed','Arial Narrow',sans-serif;--months:1;display:block;width:100%;max-width:100%;min-width:0;flex:1 1 100%;box-sizing:border-box;font-family:var(--body);font-size:13px;line-height:1.4;color:var(--ink);background:var(--card);border-radius:18px;overflow:hidden;box-shadow:0 18px 50px #00212d12;container-type:inline-size;text-align:left}
:host([hidden]){display:none}
.root{--fs-base:13px;--fs-num:13px;--fs-cap:9px;--fs-min:7px;--day-h:54px;--fs-ui:9px;--fs-select:11px;--fs-nav:15px;--btn:32px;--fs-eyebrow:9px;--fs-h2:42px;--fs-text:11px;--fs-key:9px;--fs-price:32px;--fs-book:11px;--fs-lodge:24px;--circle:34px;--fs-num-lignes:20px;font-size:var(--fs-base)}
@container (min-width:560px){.root{--fs-num:15px;--fs-cap:10.5px;--fs-min:8px;--day-h:62px;--fs-ui:10px;--fs-select:12px;--fs-nav:17px;--btn:36px;--fs-eyebrow:10px;--fs-text:12px;--fs-key:10px;--fs-price:36px;--fs-book:12px;--fs-lodge:26px;--circle:38px;--fs-num-lignes:23px}}
@container (min-width:760px){.root{--fs-base:14px;--fs-num:17px;--fs-cap:12px;--fs-min:9px;--day-h:70px;--fs-ui:11px;--fs-select:13px;--fs-nav:19px;--btn:38px;--fs-eyebrow:11px;--fs-h2:50px;--fs-text:13px;--fs-key:11px;--fs-price:40px;--fs-book:13px;--fs-lodge:28px;--circle:42px;--fs-num-lignes:26px}}
:host([theme="sombre"]),:host([theme="nuit"]){--card:#00212d;--ink:#fff;--muted:#b7c4c8;--line:#ffffff22;--day-bg:#ffffff12;--day-border:#ffffff1c;--day-hover:#ffffff24;--day-text:#e0b755;--sel-bg:#e0b755;--sel-text:#00212d;--sel-caption:#3a2e00;--within-bg:#e0b75544;--accent:#e0b755;--accent-strong:#e0b755;--accent-text:#00212d}
*{box-sizing:border-box}button{font:inherit;color:inherit;cursor:pointer;background:none;border:0;padding:0;margin:0}button:disabled{cursor:default}a{color:inherit}
button:focus-visible,a:focus-visible,select:focus-visible{outline:3px solid #347085;outline-offset:3px}
.head{position:relative;isolation:isolate;min-height:168px;display:flex;flex-direction:column;justify-content:flex-end;padding:22px 24px 20px;color:#fff;background:var(--navy)}
.head img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}
.head:before{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--accent-lodge,var(--green));z-index:1}
.head:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#00212d2e,#00212dd4);z-index:-1}
.eyebrow{font-size:var(--fs-eyebrow);font-weight:600;letter-spacing:1.4px;text-transform:uppercase;line-height:1.5}
.head h2{font-family:var(--display);font-size:var(--fs-h2);font-weight:500;line-height:.95;letter-spacing:-.4px;margin:7px 0 8px}
.head p{margin:0;font-size:var(--fs-text);opacity:.92}
:host([compact]) .head{display:none}
.body{padding:18px 22px 22px}
.top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.live{font-size:var(--fs-key);color:var(--muted);white-space:nowrap}.live:empty{display:none}.live:before{content:'●';color:var(--accent);font-size:7px;margin-right:5px}
.occupancy{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;font-size:var(--fs-ui);color:var(--muted)}
.occupancy label{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
select{font:inherit;font-size:var(--fs-select);color:var(--ink);background:var(--card);border:1px solid var(--line);border-radius:7px;padding:5px 6px;cursor:pointer}
.nav{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}
.nav h3{margin:0;font-size:var(--fs-nav);font-weight:500}
.nav button{width:var(--btn);height:var(--btn);flex:none;border-radius:50%;border:1px solid var(--line);font-size:calc(var(--btn) * .62);line-height:1}
.nav button:hover:not(:disabled){background:var(--day-hover)}.nav button:disabled{opacity:.3}
.months{display:grid;grid-template-columns:repeat(var(--months),minmax(0,1fr));gap:22px}
.month h4{margin:0 0 10px;font-size:var(--fs-select);font-weight:600;color:var(--muted)}
.weekdays,.grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
.weekdays{font-size:var(--fs-ui);color:var(--muted);text-align:center;margin-bottom:8px}
.day{height:var(--day-h);border:1px solid transparent;border-radius:8px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:2px;position:relative;padding:3px 0;font-variant-numeric:tabular-nums}
.num{font-size:var(--fs-num);line-height:1.2}.cap{font-size:var(--fs-cap);line-height:1.2;white-space:nowrap}
.day.available{background:var(--day-bg);border-color:var(--day-border);transition:background .15s,transform .15s}
.day.available .cap{color:var(--day-text);font-weight:600}
.day.available:hover{background:var(--day-hover);transform:translateY(-2px);border-color:var(--accent)}
.day .min{font-size:var(--fs-min);line-height:1.2;color:#8d664b;white-space:nowrap}:host([theme="sombre"]) .day .min,:host([theme="nuit"]) .day .min{color:#e8c48b}
.day.start .min,.day.end .min,.day.within .min{display:none}
.day.can-end{cursor:pointer}.day.can-end:hover{box-shadow:inset 0 0 0 1px var(--accent);transform:none}
.day.full .cap,.day.closed .cap{color:#9d735e}.day.unknown .cap{color:var(--muted)}.day.past{opacity:.35}
.day.loading .cap{background:var(--day-bg);border-radius:4px;color:transparent;width:24px;animation:pulse 1.3s ease-in-out infinite}
.day.start,.day.end{background:var(--sel-bg)!important;border-color:var(--sel-bg)!important;color:var(--sel-text);transform:none!important;opacity:1}
.day.start{border-radius:8px 3px 3px 8px}.day.end{border-radius:3px 8px 8px 3px}
.day.start .cap,.day.end .cap{color:var(--sel-caption)!important;font-weight:600;letter-spacing:.3px}
.day.within{background:var(--within-bg)!important;border-color:var(--within-bg)!important;border-radius:3px}
.dots{position:absolute;bottom:4px;left:0;right:0;display:flex;justify-content:center;gap:3px;height:4px}.dots i{width:4px;height:4px;border-radius:50%}
.pick .others{display:grid;gap:6px;padding-top:4px}.pick .others .eyebrow{margin-bottom:2px}
.pick .others a{display:grid;grid-template-columns:8px minmax(0,1fr) auto auto 12px;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:var(--card);border:1px solid var(--day-border);font-size:var(--fs-text);text-decoration:none}
.pick .others a:hover{border-color:var(--accent)}.pick .others i{width:8px;height:8px;border-radius:50%}.pick .others b{font-family:var(--display);font-size:calc(var(--fs-lodge) * .7);font-weight:500}.pick .others small{font-size:var(--fs-key);color:var(--muted)}.pick .others em{font-style:normal;color:var(--muted)}
.key{display:flex;justify-content:space-between;gap:8px;font-size:var(--fs-key);color:var(--muted);margin-top:14px}
.key i{display:inline-block;width:6px;height:6px;background:var(--accent);border-radius:50%;margin-right:5px}
.minstay{display:flex;align-items:center;gap:8px;margin:0 0 12px;padding:8px 11px;border-radius:8px;background:var(--day-bg);border:1px solid var(--day-border);font-size:var(--fs-text);line-height:1.5;color:var(--ink)}
.minstay[hidden]{display:none}.minstay b{flex:none;width:18px;height:18px;border-radius:50%;background:var(--sel-bg);color:var(--sel-text);font-size:10px;font-weight:600;display:inline-flex;align-items:center;justify-content:center}
.pick .badge{justify-self:start;font-size:var(--fs-key);font-weight:600;letter-spacing:.3px;padding:4px 8px;border-radius:20px;background:var(--sel-bg);color:var(--sel-text)}
.key b{display:inline-block;width:14px;height:6px;background:var(--sel-bg);border-radius:2px;margin-right:5px;vertical-align:middle}
.notice{font-size:var(--fs-text);line-height:1.6;color:#8d664b;margin-top:10px}:host([theme="sombre"]) .notice,:host([theme="nuit"]) .notice{color:#e8c48b}.notice:empty{display:none}
.retry{margin-top:10px;font-size:var(--fs-text);padding:9px 13px;border-radius:7px;background:var(--day-bg);color:var(--day-text)}
.pick[hidden]{display:none}.pick{margin-top:16px;padding:16px 18px;border-radius:12px;background:var(--day-bg);border:1px solid var(--day-border);display:grid;gap:9px;animation:reveal .3s ease;outline:none}
.pick .eyebrow{color:var(--muted);letter-spacing:.8px;font-size:var(--fs-key);text-transform:none}
.pick .lodge{font-family:var(--display);font-size:var(--fs-lodge);font-weight:500;line-height:1}
.pick .nights{display:flex;align-items:center;gap:8px;font-size:var(--fs-text);color:var(--muted)}
.pick .nights strong{font-size:var(--fs-select);color:var(--ink);min-width:56px;text-align:center}
.pick .nights button{width:28px;height:28px;border-radius:50%;border:1px solid var(--day-border);background:var(--card);color:var(--ink);font-size:16px;line-height:1}
.pick .nights button:hover:not(:disabled){border-color:var(--accent)}.pick .nights button:disabled{opacity:.3}
.pick .price{font-family:var(--display);font-size:var(--fs-price);line-height:1}.pick .price small{font-family:var(--body);font-size:var(--fs-key);color:var(--muted);margin-left:7px}
.pick .book{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:13px 15px;background:var(--accent);color:var(--accent-text);border-radius:7px;font-size:var(--fs-book);font-weight:600;text-decoration:none;transition:filter .15s}
.pick .book:hover{filter:brightness(1.06)}
.pick .more{font-size:var(--fs-text);text-decoration:underline;text-underline-offset:3px}
.pick .hint{font-size:var(--fs-key);color:var(--muted);line-height:1.6}
.pick .text{justify-self:start;font-size:var(--fs-text);text-decoration:underline;text-underline-offset:3px;color:var(--muted)}
.stage{display:grid;overflow:hidden}
.stage>*{grid-area:1/1;transition:transform .35s ease,opacity .35s ease;outline:none}
.view-list{transform:translateX(48px);opacity:0;pointer-events:none}
.stage.list .view-month{transform:translateX(-48px);opacity:0;pointer-events:none}
.stage.list .view-list{transform:none;opacity:1;pointer-events:auto}
.view-month[hidden],.view-list[hidden]{display:none}
.view-list .text{background:none;font-size:var(--fs-text);text-decoration:underline;text-underline-offset:3px;color:var(--muted);padding:2px 0 14px}
.view-list>.eyebrow{display:block;color:var(--muted);letter-spacing:.8px;font-size:var(--fs-key);text-transform:none}
.view-list h3{margin:6px 0 0;font-family:var(--display);font-size:calc(var(--fs-lodge) * 1.35);font-weight:500;line-height:1.05}
.view-list .status{margin:8px 0 0;font-size:var(--fs-text);color:var(--muted);line-height:1.6}
.view-list .nights{margin-top:12px}
.view-list .book{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:14px;padding:13px 15px;background:var(--accent);color:var(--accent-text);border-radius:7px;font-size:var(--fs-book);font-weight:600;text-decoration:none}
.view-list .more{display:inline-block;margin-top:12px;font-size:var(--fs-text);text-decoration:underline;text-underline-offset:3px}
.view-list .note{font-size:var(--fs-key);color:var(--muted);line-height:1.6;margin:12px 0 0}
.rooms{display:grid;gap:12px;margin-top:14px}
.room{display:grid;grid-template-columns:34% minmax(0,1fr);background:var(--card);border:1px solid var(--day-border);border-radius:12px;overflow:hidden;min-height:156px;animation:reveal .3s ease}
.room>img{width:100%;height:100%;min-height:156px;object-fit:cover}
.room-info{padding:14px 16px;display:flex;flex-direction:column;align-items:flex-start;gap:5px;min-width:0}
.room-info .eyebrow{color:var(--muted);font-size:var(--fs-key)}
.room-info h4{margin:0;font-family:var(--display);font-size:var(--fs-lodge);font-weight:500;line-height:1}
.room-more{font-size:var(--fs-key);color:var(--muted);text-decoration:underline;text-underline-offset:3px}
.room-price{margin-top:auto;padding-top:8px;font-family:var(--display);font-size:calc(var(--fs-price) * .78);line-height:1}.room-price small{font-family:var(--body);font-size:var(--fs-key);color:var(--muted);margin-left:6px}
.room .reserve{width:100%;display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:8px;padding:11px 13px;background:var(--accent);color:var(--accent-text);border-radius:7px;font-size:var(--fs-book);font-weight:600;text-decoration:none;transition:filter .15s}
.room .reserve:hover{filter:brightness(1.06)}
.rooms.single .room{grid-template-columns:42% minmax(0,1fr)}
:host([theme="sombre"]) .room,:host([theme="nuit"]) .room{background:#ffffff0d}
:host([design="cercles"]) .room{border-radius:20px}:host([design="cercles"]) .room .reserve{border-radius:30px}
:host([design="lignes"]) .room{border-radius:0;border:0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}:host([design="lignes"]) .room .reserve{border-radius:0}
.foot{margin-top:18px;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:12px;font-size:var(--fs-key);color:var(--muted);line-height:1.5}
.foot a{white-space:nowrap;color:var(--ink)}
/* Design 2 · cercles : le numéro dans une pastille ronde, le prix dessous. */
:host([design="cercles"]) .weekdays,:host([design="cercles"]) .grid{gap:2px 4px}
:host([design="cercles"]) .day{height:calc(var(--day-h) + 8px);border:0;background:none!important;gap:3px;padding:2px 0;border-radius:0}
:host([design="cercles"]) .num{width:var(--circle);height:var(--circle);border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid transparent;line-height:1;transition:background .15s,border-color .15s}
:host([design="cercles"]) .day.available .num{background:var(--day-bg);border-color:var(--day-border)}
:host([design="cercles"]) .day.available:hover{transform:none}
:host([design="cercles"]) .day.available:hover .num{background:var(--day-hover);border-color:var(--accent)}
:host([design="cercles"]) .day.can-end:hover{box-shadow:none}:host([design="cercles"]) .day.can-end:hover .num{border-color:var(--accent)}
:host([design="cercles"]) .minstay{border-radius:20px}
:host([design="cercles"]) .day.start,:host([design="cercles"]) .day.end{color:var(--ink)}
:host([design="cercles"]) .day.start .num,:host([design="cercles"]) .day.end .num{background:var(--sel-bg);color:var(--sel-text);border-color:var(--sel-bg)}
:host([design="cercles"]) .day.start .cap,:host([design="cercles"]) .day.end .cap{color:var(--accent-strong)!important}
:host([design="cercles"]) .day.within .num{box-shadow:inset 0 0 0 2px var(--accent)}
:host([design="cercles"]) .dots{bottom:2px}
:host([design="cercles"]) .nav button{border:0;background:var(--day-bg)}
:host([design="cercles"]) .pick{border-radius:22px}
:host([design="cercles"]) .pick .book{border-radius:30px;padding-left:18px;padding-right:18px}
/* Design 3 · lignes : carnet de séjour, grands chiffres condensés, filets fins. */
:host([design="lignes"]){border-radius:6px;box-shadow:0 10px 30px #00212d0e}
:host([design="lignes"]) .head{min-height:150px}:host([design="lignes"]) .head h2{font-weight:600;letter-spacing:0}
:host([design="lignes"]) .weekdays{font-size:8px;letter-spacing:1.2px;text-transform:uppercase;border-bottom:1px solid var(--line);padding-bottom:8px;margin-bottom:0}
:host([design="lignes"]) .grid{gap:0}
:host([design="lignes"]) .day{height:calc(var(--day-h) + 6px);border-radius:0!important;border:0;border-bottom:1px solid var(--line);align-items:flex-start;padding:7px 8px 6px;gap:4px;background:none!important}
:host([design="lignes"]) .num{font-family:var(--display);font-size:var(--fs-num-lignes);line-height:1;font-weight:500}
:host([design="lignes"]) .day.available:hover{transform:none;box-shadow:inset 0 -2px 0 var(--accent)}
:host([design="lignes"]) .day.can-end:hover{box-shadow:inset 0 -2px 0 var(--accent)}
:host([design="lignes"]) .minstay{border-radius:0;border:0;border-left:3px solid var(--accent);background:none;padding-left:10px}
:host([design="lignes"]) .day.start,:host([design="lignes"]) .day.end{box-shadow:inset 0 -3px 0 var(--accent);color:var(--ink);background:none!important}
:host([design="lignes"]) .day.start .num,:host([design="lignes"]) .day.end .num{color:var(--accent-strong)}
:host([design="lignes"]) .day.start .cap,:host([design="lignes"]) .day.end .cap{color:var(--accent-strong)!important}
:host([design="lignes"]) .day.within{box-shadow:inset 0 -3px 0 var(--within-bg);background:none!important}
:host([design="lignes"]) .day.past{opacity:.3}
:host([design="lignes"]) .dots{bottom:auto;top:9px;left:auto;right:8px;justify-content:flex-end}
:host([design="lignes"]) .nav button{border-radius:0;border:0;border-bottom:1px solid var(--line)}
:host([design="lignes"]) .nav h3{font-family:var(--display);font-size:calc(var(--fs-nav) * 1.45);text-transform:uppercase;letter-spacing:.5px}
:host([design="lignes"]) .pick{border-radius:0;border:0;border-top:2px solid var(--accent);background:none;padding:16px 0 0}
:host([design="lignes"]) .pick .book{border-radius:0}:host([design="lignes"]) .pick .nights button{border-radius:0}
:host([design="lignes"]) .retry{border-radius:0}
@keyframes pulse{50%{opacity:.4}}@keyframes reveal{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@container (max-width:640px){.months{grid-template-columns:1fr}}
@container (max-width:420px){.room,.rooms.single .room{grid-template-columns:1fr}.room>img{height:150px;min-height:0}.root{--day-h:50px;--fs-num:12px;--fs-cap:8px;--fs-h2:34px;--fs-price:28px;--circle:30px;--fs-num-lignes:17px}.body{padding:15px 13px 16px}.day{border-radius:6px}.weekdays,.grid{gap:3px}.head{min-height:140px;padding:18px 18px 16px}.foot{display:block}.foot a{display:block;margin-top:6px}.pick{padding:14px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;

  const SHELL = `<div class="root"><header class="head" id="head"><img id="photo" alt="" hidden><span class="eyebrow" id="eyebrow"></span><h2 id="title"></h2><p id="tagline"></p></header>
<div class="body">
<div class="top"><div class="occupancy" id="occupancy"></div><span class="live" id="live" role="status"></span></div>
<div class="stage" id="stage">
<div class="view-month" id="viewMonth">
<div class="nav"><button type="button" id="prev" aria-label="Mois précédent">‹</button><h3 id="month" aria-live="polite"></h3><button type="button" id="next" aria-label="Mois suivant">›</button></div>
<div class="minstay" id="minstay" hidden role="note"><b>2</b><span id="minstayText"></span></div>
<div class="months" id="months"></div>
<div class="key"><span><i></i><span id="keyLeft">Tarif « dès », par nuit, pour la composition choisie</span></span><span><b></b>Nuit choisie : arrivée → départ</span></div>
<div class="notice" id="notice" role="status"></div>
<button type="button" class="retry" id="retry" hidden>Actualiser les disponibilités ↻</button>
<div class="pick" id="pick" hidden tabindex="-1" aria-live="polite"></div>
</div>
<div class="view-list" id="viewList" hidden tabindex="-1" aria-live="polite"></div>
</div>
<div class="foot"><span id="footText"></span><a id="siteLink" target="_blank" rel="noopener">Voir sur le site du parc ↗</a></div>
</div></div>`;

  const api = {LODGES, byId, addDays, nightsBetween, monthStart, monthEnd, shiftMonth, parisToday, clampOccupancy, apiUrl, normalize, combine, combineMaps, bookingUrl, fetchRange};

  if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
    class ParcCalendrier extends HTMLElement {
      static get observedAttributes() {return ['logement', 'chambre', 'adultes', 'enfants', 'ages', 'mois', 'photo', 'titre', 'sous-titre'];}
      constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this._cache = new Map(); this._req = 0; this._verify = 0; this._results = new Map();
        this._loading = false; this._failed = false; this._selected = null; this._nights = null; this._mounted = false;
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
        if (!v || v.status !== 'available') return null;
        const nights = this._nights || v.nights;
        return {date: v.date, departure: addDays(v.date, nights), nights, minNights: v.nights, price: v.price, room: v.room.name, roomId: v.room.id, adults: this._occ.adults, children: this._occ.children, url: bookingUrl(v, this._occ, true, nights)};
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
        this.$('keyLeft').textContent = this._lodge.ids ? 'Un point par logement disponible · tarif « dès » par nuit' : 'Tarif « dès », par nuit, pour la composition choisie';
      }
      _mount() {
        this.shadowRoot.innerHTML = `<style>${STYLE}</style>${SHELL}`;
        this.$('prev').addEventListener('click', () => this._move(-1));
        this.$('next').addEventListener('click', () => this._move(1));
        this.$('retry').addEventListener('click', () => this._load(true));
        this.$('months').addEventListener('click', e => {const b = e.target.closest('button[data-date]'); if (b && !b.disabled) this._pick(b.dataset.date);});
        const onPanel = e => {if (e.target.closest('#clear')) this._clear(true); else if (e.target.closest('#less')) this._adjust(-1); else if (e.target.closest('#more')) this._adjust(1);};
        this.$('pick').addEventListener('click', onPanel); this.$('viewList').addEventListener('click', onPanel);
        this.$('occupancy').addEventListener('change', () => this._readOccupancy());
      }
      _paintHead() {
        if (!this._lodge) return;
        const img = this.$('photo'), photo = this.getAttribute('photo') || this._lodge.photo;
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
      // Nombre de nuits consécutives disponibles à partir de l’arrivée (même logement pour la vue d’ensemble), borné par le séjour maximum.
      _run(arrival) {
        const first = this._results.get(arrival);
        if (!first) return 1;
        let n = 0, date = arrival;
        while (n < first.maxNights) {
          const v = this._forRoom(this._results.get(date), first.room);
          if (!v || v.status !== 'available') break;
          n++; date = addDays(date, 1);
        }
        return Math.max(n, first.nights);
      }
      // Dans la vue d’ensemble, la valeur d’une date pour un logement précis ; ailleurs, la valeur elle-même.
      _forRoom(value, room) {
        if (!value || !this._lodge.ids) return value;
        return room && value.byRoom ? value.byRoom[room.id] : value;
      }
      _stay() {
        const arrival = this._selected;
        if (!arrival) return null;
        const value = this._results.get(arrival), min = value ? value.nights : 1, nights = this._nights || min;
        return {arrival, nights, min, max: this._run(arrival), departure: addDays(arrival, nights)};
      }
      _canEnd(stay, date) {
        if (!stay || date <= stay.arrival) return false;
        const n = nightsBetween(stay.arrival, date), first = this._results.get(stay.arrival), v = this._forRoom(this._results.get(date), first && first.room);
        return n >= stay.min && n <= stay.max && !(v && v.noDeparture);
      }
      _cells(month) {
        const today = parisToday(), start = new Date(month + 'T12:00:00Z'), days = Number(monthEnd(month).slice(8)), stay = this._stay();
        let html = '<span aria-hidden="true"></span>'.repeat((start.getUTCDay() + 6) % 7);
        for (let day = 1; day <= days; day++) {
          const date = month.slice(0, 8) + String(day).padStart(2, '0');
          const past = date < today, v = this._results.get(date);
          const status = past ? 'past' : this._loading ? 'loading' : v ? v.status : 'unknown';
          const isStart = !!stay && date === stay.arrival, isEnd = !!stay && date === stay.departure, within = !!stay && date > stay.arrival && date < stay.departure;
          const available = status === 'available', canEnd = !!stay && !this._loading && this._canEnd(stay, date), active = available || canEnd;
          const classes = ['day', status, isStart ? 'start' : '', isEnd ? 'end' : '', within ? 'within' : '', canEnd && !isEnd ? 'can-end' : ''].filter(Boolean).join(' ');
          const caption = past ? '' : status === 'loading' ? '…' : isStart ? 'arrivée' : isEnd ? 'départ' : within ? '' : available ? money(v.price) : status === 'full' ? 'Complet' : status === 'closed' ? 'Fermé' : 'À vérifier';
          const detail = past ? 'date passée' : status === 'loading' ? 'chargement' : isStart ? 'jour d’arrivée choisi' : isEnd ? 'jour de départ' : available ? `dès ${money(v.price)} par nuit${v.nights > 1 ? `, séjour minimum ${plural(v.nights, 'nuit')}` : ''}${this._lodge.ids ? `, ${plural(v.offers.length, 'logement')} disponible${v.offers.length > 1 ? 's' : ''} dont ${v.room.name}` : ''}${v.unknown ? ', autres logements à vérifier' : ''}` : status === 'full' ? 'complet' : status === 'closed' ? 'arrivée impossible ce jour' : 'disponibilité à vérifier';
          const extra = canEnd && !isEnd ? ', choisir comme jour de départ' : '';
          html += `<button type="button" class="${classes}" data-date="${date}"${active ? '' : ' disabled'} aria-label="${esc(cap(fmt(date, {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})) + ', ' + detail + extra)}" aria-pressed="${isStart || isEnd}"><span class="num">${day}</span><span class="cap">${caption}</span>${available && v.nights > 1 && !within ? `<span class="min">${v.nights} nuits min.</span>` : ''}${available && this._lodge.ids && !isStart && !isEnd ? `<span class="dots" aria-hidden="true">${v.offers.map(o => `<i style="background:${o.room.color}"></i>`).join('')}</span>` : ''}</button>`;
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
        const partial = !this._loading && !this._failed && !!this._results.partial;
        this.$('live').textContent = this._loading ? 'Connexion…' : this._failed ? 'Connexion indisponible' : partial ? 'Données partielles' : '';
        this.$('notice').textContent = this._loading ? '' : this._failed ? 'Les disponibilités ne peuvent pas être chargées. Réessayez ou utilisez le moteur officiel.' : partial ? 'Un logement n’a pas répondu : ses dates sont marquées « à vérifier ». Réessayez.' : !any ? 'Aucune date disponible pour cette composition sur la période affichée. Essayez le mois suivant ou une autre composition.' : '';
        this.$('retry').hidden = this._loading || !(this._failed || partial);
        const mins = Array.from(this._results.values()).filter(v => v.status === 'available' && v.date >= today).map(v => v.nights);
        const lowest = mins.length ? Math.min(...mins) : 1, highest = mins.length ? Math.max(...mins) : 1;
        const box = this.$('minstay');
        box.hidden = this._loading || highest <= 1;
        if (!box.hidden) {
          box.querySelector('b').textContent = String(lowest > 1 ? lowest : highest);
          this.$('minstayText').textContent = lowest > 1 ? `Séjour minimum de ${plural(lowest, 'nuit')} : un clic choisit ${plural(lowest, 'nuit')} d’affilée, puis la durée s’ajuste.` : `Certaines dates demandent ${plural(highest, 'nuit')} minimum : c’est indiqué sous le prix, et un clic choisit alors ${plural(highest, 'nuit')} d’affilée.`;
        }
        if (!this._selected) this.$('footText').textContent = 'Choisissez une date d’arrivée.';
      }
      _showList(show) {
        const stage = this.$('stage'), month = this.$('viewMonth'), list = this.$('viewList');
        if (show) {
          if (stage.classList.contains('list')) return;
          clearTimeout(this._slideTimer);
          list.hidden = false; void list.offsetWidth; stage.classList.add('list');
          this._slideTimer = setTimeout(() => {month.hidden = true;}, 380);
        } else if (stage.classList.contains('list')) {
          clearTimeout(this._slideTimer);
          month.hidden = false; void month.offsetWidth; stage.classList.remove('list');
          this._slideTimer = setTimeout(() => {list.hidden = true;}, 380);
        }
      }
      _paintError(message) {this.$('head').style.display = 'none'; this.$('minstay').hidden = true; this.$('notice').textContent = message; this.$('live').textContent = 'Configuration'; this.$('months').innerHTML = ''; this.$('occupancy').innerHTML = ''; this.$('month').textContent = ''; this.$('pick').hidden = true;}
      _clear(focus) {
        const date = this._selected; this._verify++; if (this._verifier) this._verifier.abort();
        this._selected = null; this._nights = null; this._paintPick(null);
        if (date) {this._paintGrid(); if (focus) {const b = this.shadowRoot.querySelector(`[data-date="${date}"]`); if (b) b.focus({preventScroll: true});}}
      }
      // Un clic choisit la nuit du jour cliqué (ses deux jours). Un clic plus loin déplace le départ si les nuits intermédiaires sont disponibles.
      _pick(date) {
        const stay = this._stay(), v = this._results.get(date);
        if (stay && date !== stay.arrival && this._canEnd(stay, date)) {this._setNights(nightsBetween(stay.arrival, date)); return;}
        if (v && v.status === 'available') this._select(date);
      }
      _adjust(step) {const stay = this._stay(); if (stay) this._setNights(Math.min(stay.max, Math.max(stay.min, stay.nights + step)));}
      _setNights(nights) {
        const value = this._selected && this._results.get(this._selected);
        if (!value || value.status !== 'available' || nights === this._nights) return;
        this._nights = nights; this._paintGrid(); this._paintPick(value, 'Départ déplacé. Le tarif total est confirmé sur le moteur officiel.'); this._emit();
      }
      _select(date) {
        const value = this._results.get(date);
        if (!value || value.status !== 'available') return;
        this._selected = date; this._nights = value.nights; this._paintGrid(); this._paintPick(value, 'Vérification de la date auprès de D-EDGE…');
        (this._lodge.ids ? this.$('viewList') : this.$('pick')).focus({preventScroll: true});
        const req = ++this._verify; if (this._verifier) this._verifier.abort(); this._verifier = new AbortController();
        fetchRange(this._lodge, date, date, this._occ, this._verifier.signal).then(map => {
          if (req !== this._verify) return;
          const fresh = map.get(date);
          if (fresh) {this._results.set(date, fresh); if (this._nights < fresh.nights) this._nights = fresh.nights;}
          const current = this._results.get(date);
          this._paintGrid();
          this._paintPick(current, fresh && fresh.status === 'available' ? 'Disponibilité confirmée à l’instant. Prix final et conditions confirmés sur le moteur officiel.' : 'Cette date n’est plus confirmée pour cette composition. Choisissez une autre date ou vérifiez sur le moteur officiel.');
          this._emit();
        }).catch(() => {if (req !== this._verify) return; this._paintPick(value, 'Vérification impossible pour le moment : le moteur officiel confirmera la disponibilité.'); this._emit();});
      }
      // Vue d’ensemble : le mois glisse et laisse place aux logements disponibles cette nuit, avec photo, prix et réservation.
      _paintList(value, hint) {
        const list = this.$('viewList');
        if (!value) {this._showList(false); this.$('footText').textContent = 'Choisissez une date d’arrivée.'; return;}
        const o = this._occ, offers = value.offers || [], count = offers.length, nights = this._nights || value.nights, stay = this._stay(), max = stay ? stay.max : value.nights;
        const who = `${plural(o.adults, 'adulte')}${o.children ? `, ${plural(o.children, 'enfant')}` : ''}`;
        const short = d => cap(fmt(d, {weekday: 'short', day: 'numeric', month: 'long'}));
        const stepper = count ? `<div class="nights" role="group" aria-label="Durée du séjour"><span>Durée</span><button type="button" id="less" aria-label="Une nuit de moins"${nights <= value.nights ? ' disabled' : ''}>−</button><strong aria-live="polite">${plural(nights, 'nuit')}</strong><button type="button" id="more" aria-label="Une nuit de plus"${nights >= max ? ' disabled' : ''}>+</button></div>` : '';
        const card = x => {const n = Math.max(nights, x.nights); return `<article class="room"><img src="${x.room.photo || ''}" alt="${esc(x.room.name)}" loading="lazy"><div class="room-info"><span class="eyebrow">${esc(x.room.eyebrow || '')}</span><h4>${esc(x.room.name)}</h4><a class="room-more" href="${SITE}${x.room.page}" target="_blank" rel="noopener">Découvrir le logement ↗</a><div class="room-price">${money(x.price)}<small>la nuit · dès${x.nights > 1 ? ` · ${plural(x.nights, 'nuit')} min.` : ''}</small></div><a class="reserve" href="${bookingUrl(x, o, true, n)}" target="_blank" rel="noopener" aria-label="Réserver ${esc(x.room.name)}, ${plural(n, 'nuit')} à partir du ${short(value.date)}, dès ${money(x.price)} la nuit">Réserver ${plural(n, 'nuit')} <span>↗</span></a></div></article>`;};
        list.innerHTML = `<button type="button" class="text" id="clear">← Changer de date</button>` +
          `<span class="eyebrow">${short(value.date)} → ${short(addDays(value.date, nights))} · ${plural(nights, 'nuit')} · ${who}</span>` +
          `<h3>${count === 1 ? 'Votre logement' : count > 1 ? 'Choisissez votre logement' : 'Cette nuit n’est plus confirmée'}</h3>` +
          `<p class="status">${count ? `${plural(count, 'logement')} disponible${count > 1 ? 's' : ''} pour cette nuit. ` : 'La disponibilité a changé. Choisissez une autre date. '}${esc(hint || '')}${value.unknown ? ' Vérification incomplète : d’autres logements peuvent être disponibles.' : ''}${count && max > value.nights ? ` Jusqu’à ${plural(max, 'nuit')} d’affilée.` : ''}</p>` +
          stepper + `<div class="rooms${count === 1 ? ' single' : ''}">${offers.map(card).join('')}</div>` +
          (count ? `<p class="note">Tarif par nuit pour ${who}, hors taxe de séjour. Disponibilités, prix final et conditions confirmés sur le moteur officiel.</p>` : `<a class="book" href="${bookingUrl(value, o, false, nights)}" target="_blank" rel="noopener">Voir d’autres dates sur le moteur officiel <span>↗</span></a>`) +
          `<a class="more" href="${bookingUrl(value, o, false, nights)}" target="_blank" rel="noopener">Tous les hébergements à ces dates ↗</a>`;
        this.$('footText').textContent = `Tarif pour ${who}, hors taxe de séjour. Total confirmé sur le moteur officiel.`;
        this._showList(true);
      }
      _emit() {this.dispatchEvent(new CustomEvent('parc-calendrier:selection', {bubbles: true, composed: true, detail: this.selection}));}
      _paintPick(value, hint) {
        if (this._lodge.ids) return this._paintList(value, hint);
        const el = this.$('pick');
        if (!value) {el.hidden = true; el.innerHTML = ''; this.$('footText').textContent = 'Choisissez une date d’arrivée.'; return;}
        const o = this._occ, available = value.status === 'available', nights = this._nights || value.nights;
        const who = `${plural(o.adults, 'adulte')}${o.children ? `, ${plural(o.children, 'enfant')}` : ''}`;
        const stay = plural(nights, 'nuit');
        const badge = value.nights > 1 ? `<span class="badge">Séjour minimum : ${plural(value.nights, 'nuit')}</span>` : '';
        const run = this._stay(), max = run ? run.max : value.nights;
        const stepper = available ? `<div class="nights" role="group" aria-label="Durée du séjour"><span>Durée</span><button type="button" id="less" aria-label="Une nuit de moins"${nights <= value.nights ? ' disabled' : ''}>−</button><strong aria-live="polite">${plural(nights, 'nuit')}</strong><button type="button" id="more" aria-label="Une nuit de plus"${nights >= max ? ' disabled' : ''}>+</button></div>` : '';
        const short = d => cap(fmt(d, {weekday: 'short', day: 'numeric', month: 'long'}));
        el.hidden = false;
        el.innerHTML = `<span class="eyebrow">${short(value.date)} → ${short(addDays(value.date, nights))} · ${stay} · ${who}</span>` +
          (this._lodge.ids && value.room ? `<span class="lodge">${esc(value.room.name)}</span>` : '') + badge + stepper +
          (available ? `<span class="price">${money(value.price)}<small>par nuit · dès</small></span><a class="book" href="${bookingUrl(value, o, true, nights)}" target="_blank" rel="noopener">Réserver ${plural(nights, 'nuit')} sur le moteur officiel <span>↗</span></a>` : `<span class="price">Indisponible</span><a class="book" href="${bookingUrl(value, o, false, nights)}" target="_blank" rel="noopener">Voir d’autres dates sur le moteur officiel <span>↗</span></a>`) +
          (this._lodge.ids && available && value.offers.length > 1 ? `<div class="others"><span class="eyebrow">Aussi disponible${value.offers.length > 2 ? 's' : ''} cette nuit</span>${value.offers.slice(1).map(x => `<a href="${bookingUrl(x, o, true, Math.max(nights, x.nights))}" target="_blank" rel="noopener"><i style="background:${x.room.color}"></i><span>${esc(x.room.name)}</span><b>${money(x.price)}</b><small>par nuit · dès</small><em>↗</em></a>`).join('')}</div>` : '') +
          (this._lodge.id || !available ? '' : `<a class="more" href="${bookingUrl(value, o, false, nights)}" target="_blank" rel="noopener">Tous les hébergements à ces dates ↗</a>`) +
          `<span class="hint">${esc(hint || '')}${available ? (max > value.nights ? ` Jusqu’à ${plural(max, 'nuit')} d’affilée : cliquez un jour plus loin pour déplacer le départ, ou utilisez − et +.` : ' Les nuits suivantes ne sont pas disponibles : une seule nuit possible à cette date.') : ''}</span><button type="button" class="text" id="clear">← Changer de date</button>`;
        this.$('footText').textContent = `Tarif pour ${who}, hors taxe de séjour. Total confirmé sur le moteur officiel.`;
      }
    }
    api.ParcCalendrier = ParcCalendrier;
    if (!customElements.get('parc-calendrier')) customElements.define('parc-calendrier', ParcCalendrier);
  }
  root.parcCalendrier = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
