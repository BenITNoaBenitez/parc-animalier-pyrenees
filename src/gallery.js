(() => {
 const SITE='https://www.parc-animalier-pyrenees.com/', MEDIA=SITE+'medias_front/pages/', L=parcCalendrier.LODGES;
 const SCRIPT=EMBED_SCRIPT_TAG;
 document.querySelector('.install code').textContent=SCRIPT;
 const FALLBACK='  <a href="https://www.secure-hotel-booking.com/d-edge/Parc-Animalier-Des-Pyrenees/JLPH/">Réserver sur le moteur officiel</a>';
 // Les sept calendriers relevés sur le site le 15 octobre 2026, avec les limites de voyageurs de chaque widget officiel.
 const CALENDARS=[
  {logement:'tous',asset:'parc',wide:true,attrs:{mois:'2'},photo:'045810035120000437parcanimalierdespyrenees-ayzacost-photoaspheries.jpg',note:'Page Hébergements · les quatre nuits insolites : meilleur prix par date · jusqu’à 5 adultes et 4 enfants (le widget du site, lui, mélange lodges et gîtes)'},
  {logement:'taniere',asset:'interior',photo:'033817taniere.jpg',note:'Widget D-EDGE · logement 140910 · 2 adultes, 1 enfant maximum'},
  {logement:'refuge',asset:'black',photo:'042005ecolodge_le_refuge_pap-19.jpg',note:'Widget D-EDGE · logement 140908 · 5 adultes, 4 enfants maximum'},
  {logement:'trappeur',asset:'trappeur',photo:'115802trappeur.jpg',note:'Widget D-EDGE · logement 140907 · 4 adultes, 3 enfants maximum · réservations ouvertes à partir de février 2027'},
  {logement:'asian',asset:'panda',photo:'011910shutterstock_32201191.jpg',note:'Widget D-EDGE · logement 163456 · 5 adultes, 4 enfants maximum'},
  {logement:'grange',asset:'grange',attrs:{adultes:'4'},photo:'115115la_grange_parc_animalier_des_pyrenees-33.jpg',note:'Widget D-EDGE · gîte 140905 · 10 adultes, 9 enfants maximum · 2 nuits minimum'},
  {logement:'moulin',asset:'moulin',photo:'114008le_moulin_parc_animalier_des_pyrenees-21.jpg',note:'Widget D-EDGE · gîte 140906 · 5 adultes, 4 enfants maximum'}
 ];
 const DESIGNS=[['cases','Cases pleines'],['cercles','Cercles'],['lignes','Lignes fines']], THEMES=[['clair','Clair'],['sombre','Sombre']];
 const attrs=o=>Object.entries(o).map(([k,v])=>`${k}="${v}"`).join(' ');
 const seg=(attr,options,current)=>`<div class="seg" data-attr="${attr}" role="group">${options.map(([v,label])=>`<button type="button" data-value="${v}" aria-pressed="${v===current}">${label}</button>`).join('')}</div>`;
 const tag=(c,s)=>{const a=Object.assign({logement:c.logement},c.attrs||{});if(s.design!=='cases')a.design=s.design;if(s.theme!=='clair')a.theme=s.theme;return `${SCRIPT}\n<parc-calendrier ${attrs(a)}>\n${FALLBACK}\n</parc-calendrier>`;};
 const state=new Map(CALENDARS.map(c=>[c.logement,{design:'cases',theme:'clair'}]));
 const list=document.getElementById('gallery');
 list.innerHTML=CALENDARS.map((c,i)=>{const l=L[c.logement];return `<article class="g-card${c.wide?' wide':''}" data-logement="${c.logement}"><div class="g-visual"><parc-calendrier logement="${c.logement}" ${attrs(c.attrs||{})} design="cases" theme="clair" photo="${ASSETS[c.asset]}"></parc-calendrier></div><aside class="g-side"><div><span class="eyebrow">${String(i+1).padStart(2,'0')} / ${String(CALENDARS.length).padStart(2,'0')}</span><h2>${l.name}</h2><p class="g-sub">${l.eyebrow}</p></div><a class="g-link" href="${SITE}page/${l.page}" target="_blank" rel="noopener">/page/${l.page} ↗</a><p class="g-note">${c.note}</p><div class="g-group"><span class="eyebrow">Design</span>${seg('design',DESIGNS,'cases')}</div><div class="g-group"><span class="eyebrow">Mode</span>${seg('theme',THEMES,'clair')}</div><div class="g-group"><span class="eyebrow">Balise à coller</span><div class="snippet"><pre><code></code></pre><button class="copy" type="button">Copier</button></div></div></aside></article>`;}).join('');
 function apply(logement){
  const s=state.get(logement), card=list.querySelector(`[data-logement="${logement}"]`), el=card.querySelector('parc-calendrier'), c=CALENDARS.find(x=>x.logement===logement);
  el.setAttribute('design',s.design); el.setAttribute('theme',s.theme);
  card.querySelectorAll('.seg').forEach(g=>g.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===s[g.dataset.attr]))));
  card.querySelector('code').textContent=tag(c,s);
 }
 CALENDARS.forEach(c=>apply(c.logement));
 list.addEventListener('click',e=>{const b=e.target.closest('.seg button');if(!b)return;const card=b.closest('.g-card');state.get(card.dataset.logement)[b.closest('.seg').dataset.attr]=b.dataset.value;apply(card.dataset.logement);});
 document.querySelectorAll('[data-global]').forEach(group=>group.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;group.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));state.forEach(s=>{s[group.dataset.global]=b.dataset.value;});CALENDARS.forEach(c=>apply(c.logement));}));
 document.querySelectorAll('.copy').forEach(button=>button.addEventListener('click',async()=>{
  const code=button.parentElement.querySelector('code');
  try{await navigator.clipboard.writeText(code.textContent);button.textContent='Copié ✓';button.classList.add('done');}
  catch(e){const range=document.createRange();range.selectNodeContents(code);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);button.textContent='Sélectionné';}
  setTimeout(()=>{button.textContent='Copier';button.classList.remove('done');},1800);
 }));
 document.querySelectorAll('[data-asset]').forEach(el=>{el.src=ASSETS[el.dataset.asset];});
})();
