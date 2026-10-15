(() => {
 const SITE='https://www.parc-animalier-pyrenees.com/', MEDIA=SITE+'medias_front/pages/';
 // Les sept calendriers relevés sur le site le 15 octobre 2026 : page, identifiant D-EDGE et limites de voyageurs du widget officiel.
 const CALENDARS=[
  {logement:'tous',asset:'parc',wide:true,attrs:{mois:'2'},page:'hebergements',photo:MEDIA+'045810035120000437parcanimalierdespyrenees-ayzacost-photoaspheries.jpg',note:'Widget D-EDGE sans filtre : meilleur prix par date · jusqu’à 10 adultes et 10 enfants'},
  {logement:'taniere',asset:'interior',page:'dormir-avec-les-ours-bruns',photo:MEDIA+'033817taniere.jpg',note:'Widget D-EDGE · logement 140910 · 2 adultes, 1 enfant maximum'},
  {logement:'refuge',asset:'black',page:'dormir-avec-les-loups-noirs',photo:MEDIA+'042005ecolodge_le_refuge_pap-19.jpg',note:'Widget D-EDGE · logement 140908 · 5 adultes, 4 enfants maximum'},
  {logement:'trappeur',asset:'trappeur',page:'nuits-insolites',photo:MEDIA+'115802trappeur.jpg',note:'Widget D-EDGE · logement 140907 · 4 adultes, 3 enfants maximum · réservations ouvertes à partir de février 2027'},
  {logement:'asian',asset:'panda',page:'dormir-avec-les-pandas-roux',photo:MEDIA+'011910shutterstock_32201191.jpg',note:'Widget D-EDGE · logement 163456 · 5 adultes, 4 enfants maximum'},
  {logement:'grange',asset:'grange',attrs:{adultes:'4',theme:'sombre'},page:'la-grange',photo:MEDIA+'115115la_grange_parc_animalier_des_pyrenees-33.jpg',note:'Widget D-EDGE · gîte 140905 · 10 adultes, 9 enfants maximum · 2 nuits minimum'},
  {logement:'moulin',asset:'moulin',page:'le-moulin',photo:MEDIA+'114008le_moulin_parc_animalier_des_pyrenees-21.jpg',note:'Widget D-EDGE · gîte 140906 · 5 adultes, 4 enfants maximum'}
 ];
 const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const attrs=c=>Object.entries(c.attrs||{}).map(([k,v])=>` ${k}="${v}"`).join('');
 const tag=c=>`<parc-calendrier logement="${c.logement}"${attrs(c)} photo="${c.photo}"></parc-calendrier>`;
 document.getElementById('embed-grid').innerHTML=CALENDARS.map(c=>`<article class="embed-card${c.wide?' wide':''}"><parc-calendrier logement="${c.logement}"${attrs(c)} photo="${ASSETS[c.asset]}"></parc-calendrier><div class="embed-meta"><div class="site"><a href="${SITE}page/${c.page}" target="_blank" rel="noopener">/page/${c.page} ↗</a><small>${c.note}</small></div><div class="snippet"><pre><code>${esc(tag(c))}</code></pre><button class="copy" type="button">Copier</button></div></div></article>`).join('');
 document.querySelectorAll('.embed-section .copy').forEach(button=>button.addEventListener('click',async()=>{
  const code=button.parentElement.querySelector('code');
  try{await navigator.clipboard.writeText(code.textContent);button.textContent='Copié ✓';button.classList.add('done');}
  catch(e){const range=document.createRange();range.selectNodeContents(code);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);button.textContent='Sélectionné';}
  setTimeout(()=>{button.textContent='Copier';button.classList.remove('done');},1800);
 }));
})();
