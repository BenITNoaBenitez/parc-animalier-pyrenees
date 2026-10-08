const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../src/calendar-core.js');
const date='2026-10-26';
function row(room,price=580,changes={}) {return {room:room.id,adults:2,currency:'EUR',totalPrice:price,lowestRoomAvailability:1,nights:1,bookingParams:{from:date,to:C.nextDate(date)},restrictions:{status:'Available',minstay:1,maxstay:31,closedOnArrival:false,closedOnDeparture:false},...changes};}
const payload=rows=>({error:false,data:{code:200,data:rows}});
function result(prices){return new Map(C.rooms.map((room,i)=>[room.id,C.normalize(payload([row(room,prices[i],prices[i]?{}:{lowestRoomAvailability:0,restrictions:{status:'NotAvailable',minstay:1,maxstay:31}})]),room)]));}
test('une seule disponibilité parmi quatre rend la date réservable',()=>{const state=C.combine(date,result([0,0,580,0]));assert.equal(state.available.length,1);assert.equal(state.available[0].room.id,140907);assert.equal(state.price,580);assert.equal(state.unknown,false);});
test('plusieurs logements : prix minimum et offres triées',()=>{const state=C.combine(date,result([580,729,0,680]));assert.deepEqual(state.available.map(o=>o.price),[580,680,729]);assert.equal(state.price,580);});
test('quatre indisponibilités confirmées = complet',()=>{assert.equal(C.combine(date,result([0,0,0,0])).status,'full');});
test('un service absent ne devient jamais complet',()=>{const data=result([0,0,0,0]);data.delete(163456);assert.equal(C.combine(date,data).status,'unknown');});
test('une offre confirmée reste accessible malgré un service absent',()=>{const data=result([580,0,0,0]);data.delete(163456);const state=C.combine(date,data);assert.equal(state.status,'available');assert.equal(state.unknown,true);});
test('séjour minimum et séjour de deux nuits sont exclus',()=>{for(const changes of [{nights:2},{restrictions:{status:'Available',minstay:2,maxstay:31}}]){const data=C.normalize(payload([row(C.rooms[0],580,changes)]),C.rooms[0]);assert.equal(data.get(date).status,'restricted');}});
test('arrivée/départ fermés ne donnent pas de réservation',()=>{for(const key of ['closedOnArrival','closedOnDeparture']){const r=row(C.rooms[0]);r.restrictions[key]=true;assert.equal(C.normalize(payload([r]),C.rooms[0]).get(date).status,'restricted');}});
test('mauvais logement, prix nul, mauvaise devise ou départ incorrect : pas d’offre',()=>{for(const changes of [{room:1},{totalPrice:0},{currency:'USD'},{bookingParams:{from:date,to:'2026-10-28'}}]){const data=C.normalize(payload([row(C.rooms[0],580,changes)]),C.rooms[0]);assert.notEqual(data.get(date)?.status,'available');}});
test('réponse API invalide rejetée',()=>{for(const data of [{error:true},{data:{code:500,data:[]}},{}])assert.throws(()=>C.normalize(data,C.rooms[0]));});
test('plusieurs tarifs pour un même logement : garder le moins cher',()=>{const data=C.normalize(payload([row(C.rooms[0],680),row(C.rooms[0],580)]),C.rooms[0]);assert.equal(data.get(date).price,580);});
test('lien officiel garde logement, dates, durée et voyageurs',()=>{const offer=C.combine(date,result([0,0,0,680])).available[0],url=new URL(C.bookingUrl(offer));assert.equal(url.hostname,'www.secure-hotel-booking.com');assert.equal(url.searchParams.get('roomId'),'163456');assert.equal(url.searchParams.get('roomAction'),'filter');assert.equal(url.searchParams.get('arrivalDate'),date);assert.equal(url.searchParams.get('departureDate'),'2026-10-27');assert.equal(url.searchParams.get('selectedAdultCount'),'2');});
test('passages de mois, année et heure d’hiver',()=>{assert.equal(C.nextDate('2026-12-31'),'2027-01-01');assert.equal(C.nextDate('2026-10-25'),'2026-10-26');assert.equal(C.nextDate('2028-02-28'),'2028-02-29');});
