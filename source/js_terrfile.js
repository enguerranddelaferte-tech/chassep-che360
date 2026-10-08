/* ===== Territoire : affichage lisible sur la carte (remplissage + trait contrasté, sans les ponts de jonction) ===== */
function TerrShape(L_,bd,pop,cs){cs=cs||{f:"#E3600B",s:"#D9480F"};let ring=bd.slice(),n=ring.length,key=p=>Math.round(p[0]*1e6)+","+Math.round(p[1]*1e6),E=new Set();
for(let i=0;i<n;i++)E.add(key(ring[i])+">"+key(ring[(i+1)%n]));
let runs=[],cur=null;for(let i=0;i<n;i++){let a=ring[i],b=ring[(i+1)%n];if(E.has(key(b)+">"+key(a))){cur=null;continue}if(!cur){cur=[a];runs.push(cur)}cur.push(b)}
let g=L_.featureGroup(),fill=L_.polygon(ring,{stroke:!1,fillColor:cs.f,fillOpacity:.22});pop&&fill.bindPopup(pop);fill.addTo(g);
runs.length&&(L_.polyline(runs,{color:"#fff",weight:6,opacity:.85,interactive:!1,lineJoin:"round"}).addTo(g),L_.polyline(runs,{color:cs.s,weight:3,opacity:1,dashArray:cs.d||null,interactive:!1,lineJoin:"round"}).addTo(g));return g}
function TerrFit(map,terrs,force){let L_=_e(),b=null;terrs.forEach(t=>{if(t&&t.boundary&&t.boundary.length>2){let bb=L_.latLngBounds(t.boundary);b=b?b.extend(bb):bb}});if(!b)return;
try{if(force||!map._tfit&&!map.getBounds().intersects(b)){map._tfit=1;map.fitBounds(b,{padding:[40,40],maxZoom:16})}}catch{}}
