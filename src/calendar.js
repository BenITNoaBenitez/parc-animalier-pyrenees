(() => {
  const C=ParkCalendar, $=id=>document.getElementById(id);
  const money=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:Number.isInteger(n)?0:2}).format(n);
  const longDate=d=>new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));
  const initial=C.parisToday().slice(0,7)+'-01';
  let month=initial, results=new Map(), selected=null, loading=false, monthRequest=0, selectionRequest=0;
  let monthController, selectionController;
  const cache=new Map();
  const page=room=>'https://www.parc-animalier-pyrenees.com/page/'+room.page;
  async function fetchRoom(room, from, to, signal) {
    const url=new URL('https://websdk.d-edge.com/bestprice');
    url.search=new URLSearchParams({...CONFIG,fromDate:from,toDate:to,adults:'2',behavior:'lowerMinstay',currency:'EUR',locale:'fr_FR',output:'json',s:'1',version:'0.0.1',roomIds:String(room.id),hotelCurrency:'EUR'});
    const response=await fetch(url,{signal,credentials:'omit'});
    if(!response.ok) throw new Error('D-EDGE indisponible');
    return C.normalize(await response.json(),room);
  }
  async function fetchAll(from,to,signal) {
    const timeout=new AbortController(), timer=setTimeout(()=>timeout.abort(),18000);
    const abort=()=>timeout.abort();
    signal.addEventListener('abort',abort,{once:true});
    if(signal.aborted)timeout.abort();
    const combined=timeout.signal;
    try {
      const settled=await Promise.allSettled(C.rooms.map(r=>fetchRoom(r,from,to,combined)));
      if(signal.aborted) throw new DOMException('Aborted','AbortError');
      return new Map(settled.flatMap((result,i)=>result.status==='fulfilled'?[[C.rooms[i].id,result.value]]:[]));
    } finally {clearTimeout(timer);signal.removeEventListener('abort',abort);}
  }
  function renderMonth() {
    const start=new Date(month+'T12:00:00Z'), today=C.parisToday();
    $('month-title').textContent=new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric',timeZone:'UTC'}).format(start);
    $('previous-month').disabled=month<=today.slice(0,7)+'-01';
    const end=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+1,0,12));
    $('month-grid').setAttribute('aria-busy',String(loading));
    let html='<span aria-hidden="true"></span>'.repeat((start.getUTCDay()+6)%7);
    for(let day=1;day<=end.getUTCDate();day++) {
      const date=month.slice(0,8)+String(day).padStart(2,'0'), past=date<today;
      const state=C.combine(date,results), active=!past&&!loading&&state.available.length>0;
      const status=past?'past':loading?'loading':state.status;
      const caption=past?'':loading?'…':status==='available'?money(state.price):status==='full'?'Complet':status==='restricted'?'Min./règles':'À vérifier';
      const label=`${longDate(date)} ${start.getUTCFullYear()}, ${past?'date passée':loading?'chargement':state.available.length?`${state.available.length} logement${state.available.length>1?'s':''}, dès ${money(state.price)}${state.unknown?', autres logements à vérifier':''}`:status==='full'?'complet pour une nuit et deux adultes':status==='restricted'?'non réservable pour une nuit':'disponibilité inconnue'}`;
      html+=`<button class="day ${status}${selected===date?' selected':''}" data-date="${date}" ${active?'':'disabled'} aria-label="${label}" aria-pressed="${selected===date}"><span class="day-number">${day}</span><span class="day-caption">${caption}</span>${active?`<span class="room-dots" aria-hidden="true">${state.available.map(o=>`<i style="background:${o.room.color}"></i>`).join('')}</span>`:''}</button>`;
    }
    $('month-grid').innerHTML=html;
    const incomplete=C.rooms.some(room=>!results.has(room.id))||Array.from({length:end.getUTCDate()},(_,i)=>month.slice(0,8)+String(i+1).padStart(2,'0')).some(date=>date>=today&&C.combine(date,results).unknown);
    $('live-status').textContent=loading?'Connexion…':!results.size?'Connexion indisponible':incomplete?'Données partielles':'D-EDGE · en direct';
    $('calendar-notice').textContent=loading?'':results.size===0?'Les disponibilités ne peuvent pas être chargées. Réessayez ou consultez le moteur officiel.':incomplete?'Certaines disponibilités restent à vérifier. Les dates proposées sont celles confirmées par les logements qui ont répondu.':!$('month-grid').querySelector('.available')?'Aucune nuit disponible dans cette configuration ce mois-ci. Consultez le mois suivant.':'';
    $('retry').hidden=loading||!incomplete;
  }
  function clearSelection() {
    selectionRequest++;selectionController?.abort();selected=null;
    $('selection').hidden=true;$('date-view').hidden=false;
  }
  async function loadMonth(force=false) {
    const request=++monthRequest;monthController?.abort();monthController=new AbortController();clearSelection();
    const currentMonth=month, hit=cache.get(currentMonth);
    if(!force&&hit&&Date.now()-hit.time<60000){results=hit.data;loading=false;renderMonth();return;}
    loading=true;results=new Map();renderMonth();
    const d=new Date(month+'T12:00:00Z'),end=C.iso(new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0,12)));
    try {
      const data=await fetchAll(month<C.parisToday()?C.parisToday():month,end,monthController.signal);
      if(request!==monthRequest)return;
      results=data;if(data.size===4)cache.set(currentMonth,{time:Date.now(),data});
    } catch(e){if(request!==monthRequest)return;results=new Map();}
    if(request===monthRequest){loading=false;renderMonth();}
  }
  async function selectDate(date) {
    const request=++selectionRequest;selectionController?.abort();selectionController=new AbortController();selected=date;renderMonth();
    const selection=$('selection');selection.hidden=false;$('date-view').hidden=true;
    $('selected-dates').textContent=`${longDate(date)} → ${longDate(C.nextDate(date))} · 1 nuit · 2 adultes`;
    $('selection-title').textContent='Vos logements disponibles';$('selection-status').textContent='Vérification de cette nuit auprès des quatre logements…';$('room-results').innerHTML='';
    selection.focus({preventScroll:true});
    let checked;
    try{checked=await fetchAll(date,date,selectionController.signal);}catch(e){if(request!==selectionRequest)return;checked=new Map();}
    if(request!==selectionRequest)return;
    // Replace only this date; failed requests become unknown, never falsely "complet".
    C.rooms.forEach(room=>{const map=new Map(results.get(room.id)||[]);map.delete(date);const value=checked.get(room.id)?.get(date);if(value)map.set(date,value);results.set(room.id,map);});
    cache.delete(month);renderMonth();
    const state=C.combine(date,checked), count=state.available.length;
    $('selection-title').textContent=count===1?'Votre logement':count>1?'Choisissez votre logement':'Cette nuit n’est plus confirmée';
    $('selection-status').textContent=state.unknown?'Vérification incomplète : d’autres logements peuvent être disponibles. Réessayez ou consultez le moteur officiel.':count===0?'La disponibilité a changé. Choisissez une autre date.':`${count} logement${count>1?'s':''} disponible${count>1?'s':''} pour cette nuit.`;
    $('room-results').className='room-results'+(count===1?' single':'');
    $('room-results').innerHTML=state.available.map(offer=>`<article class="room-result" data-room="${offer.room.id}"><img src="${ASSETS[offer.room.asset]}" alt="${offer.room.name}"><div class="room-info"><span class="eyebrow">${offer.room.animal}</span><h3>${offer.room.name}</h3><a class="room-more" href="${page(offer.room)}" target="_blank" rel="noopener">Découvrir le logement ↗</a><div class="room-price">${money(offer.price)}<small>la nuit · pour 2</small></div><a class="reserve-link" href="${C.bookingUrl(offer)}" target="_blank" rel="noopener" aria-label="Réserver ${offer.room.name}, ${longDate(date)}, ${money(offer.price)}">Réserver ce séjour <span>↗</span></a></div></article>`).join('');
    if(state.unknown){const retry=document.createElement('button');retry.className='retry';retry.textContent='Revérifier cette date ↻';retry.addEventListener('click',()=>selectDate(date));$('room-results').append(retry);}
  }
  $('month-grid').addEventListener('click',e=>{const button=e.target.closest('button[data-date]');if(button&&!button.disabled)selectDate(button.dataset.date);});
  function moveMonth(offset){const d=new Date(month+'T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+offset);month=C.iso(d);loadMonth();}
  $('previous-month').addEventListener('click',()=>moveMonth(-1));$('next-month').addEventListener('click',()=>moveMonth(1));
  $('retry').addEventListener('click',()=>loadMonth(true));
  $('clear-selection').addEventListener('click',()=>{const date=selected;clearSelection();renderMonth();const button=$('month-grid').querySelector(`[data-date="${date}"]`);if(button)button.focus({preventScroll:true});});
  window.addEventListener('offline',()=>{monthRequest++;monthController?.abort();clearSelection();cache.clear();results=new Map();loading=false;renderMonth();});
  window.addEventListener('online',()=>loadMonth(true));
  loadMonth();
})();
