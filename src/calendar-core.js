(function(root) {
  const rooms = [
    {id:140910,name:'La Tanière',animal:'Ours bruns',asset:'interior',color:'#a77c4c',page:'dormir-avec-les-ours-bruns'},
    {id:140908,name:'Le Refuge',animal:'Loups noirs',asset:'black',color:'#34575e',page:'dormir-avec-les-loups-noirs'},
    {id:140907,name:'La Cabane du Trappeur',animal:'Loups gris',asset:'grey',color:'#8c9c60',page:'nuits-insolites'},
    {id:163456,name:'Asian Lodge',animal:'Pandas roux',asset:'panda',color:'#bb6247',page:'dormir-avec-les-pandas-roux'}
  ];
  const iso = d => d.toISOString().slice(0,10);
  const nextDate = date => iso(new Date(Date.parse(date+'T12:00:00Z')+86400000));
  const parisToday = () => new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  function normalize(payload, room) {
    if (payload.error || payload.data?.code !== 200 || !Array.isArray(payload.data.data)) throw new Error('Réponse D-EDGE non reconnue');
    const map = new Map();
    for (const row of payload.data.data) {
      const date = row.bookingParams?.from, r = row.restrictions;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !r || Number(row.room)!==room.id) continue;
      const available = r.status==='Available' && Number(row.lowestRoomAvailability)>0 && !r.closedOnArrival && !r.closedOnDeparture && Number(r.minstay)<=1 && Number(r.maxstay)>=1 && Number(row.nights)===1 && row.bookingParams.to===nextDate(date) && Number(row.totalPrice)>0 && row.currency==='EUR';
      const restricted = Number(r.minstay)>1 || Number(row.nights)>1 || r.closedOnArrival || r.closedOnDeparture;
      const status = available ? 'available' : restricted ? 'restricted' : r.status==='NotAvailable' ? 'full' : 'unknown';
      const value = {room, date, status, price:available ? Number(row.totalPrice) : null, rate:row.rate};
      const prior=map.get(date);
      if (!prior || (available && (prior.status!=='available' || value.price<prior.price))) map.set(date,value);
    }
    return map;
  }
  function combine(date, results) {
    const values=rooms.map(room=>results.get(room.id)?.get(date));
    const available=values.filter(v=>v?.status==='available').sort((a,b)=>a.price-b.price);
    const unknown=values.some(v=>!v || v.status==='unknown');
    return {date,available,unknown,price:available[0]?.price,status:available.length?'available':unknown?'unknown':values.some(v=>v.status==='restricted')?'restricted':'full'};
  }
  function bookingUrl(offer) {
    const url=new URL('https://www.secure-hotel-booking.com/d-edge/Parc-Animalier-Des-Pyrenees/JLPH/');
    url.search=new URLSearchParams({arrivalDate:offer.date,departureDate:nextDate(offer.date),language:'fr-FR',selectedAdultCount:'2',roomAction:'filter',roomId:String(offer.room.id),currency:'EUR'});
    return url.href;
  }
  const api={rooms,iso,nextDate,parisToday,normalize,combine,bookingUrl};
  root.ParkCalendar=api;
  if(typeof module!=='undefined' && module.exports) module.exports=api;
})(globalThis);
