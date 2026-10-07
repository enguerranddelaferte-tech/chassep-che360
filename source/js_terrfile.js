/* ===== Territoire : import d'un fichier (GeoJSON ou JSON simple) ===== */
function TerrFileParse(txt){let j=JSON.parse(txt),feats=j.type==="FeatureCollection"?j.features:j.type==="Feature"?[j]:j.type?[{type:"Feature",geometry:j,properties:{}}]:null;
if(!feats){let b=Array.isArray(j.boundary)?j.boundary.filter(p=>Array.isArray(p)&&isFinite(p[0])&&isFinite(p[1])):[];return{name:j.name||"",city:j.city||"",ring:b.length>=3?b:null,places:(j.places||[]).filter(p=>p&&isFinite(p.lat)&&isFinite(p.lng)).map(p=>({name:String(p.name||"Lieu").slice(0,40),type:String(p.type||"").slice(0,30),lat:+p.lat,lng:+p.lng})),note:j.notes||""}}
let outers=[],holes=[],places=[],name="",city="",note="";
const ll=c=>[c[1],c[0]],cen=r=>{let a=0,b=0;r.forEach(p=>{a+=p[0];b+=p[1]});return[a/r.length,b/r.length]};
feats.forEach(f=>{if(!f||!f.geometry)return;let g=f.geometry,p=f.properties||{};name=name||p.name&&f.geometry.type!=="Point"&&p.kind!=="reserve"&&p.name||name;city=city||p.city||"";note=note||p.notes||"";
if(g.type==="Point"){places.push({name:String(p.name||"Lieu").slice(0,40),type:String(p.type||"").slice(0,30),lat:g.coordinates[1],lng:g.coordinates[0]});return}
let polys=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];
if(p.kind==="reserve"){polys.forEach(pl=>{let c=cen(pl[0].map(ll));places.push({name:String(p.name||"Réserve").slice(0,40),type:String(p.type||"Danger"),lat:c[0],lng:c[1]})});return}
polys.forEach(pl=>{pl.forEach((ring,i)=>{let r=PcClose(ring.map(ll));if(r.length<3)return;let a=PcArea2(r);if(i===0){outers.push(a<0?r.slice().reverse():r)}else{holes.push(a>0?r.slice().reverse():r)}})})});
let all=outers.sort((a,b)=>PcArea2(b)-PcArea2(a)).concat(holes.filter(h=>Math.abs(PcArea2(h))>1e-9)),ring=null;
if(all.length){ring=all.length>1?PcJoin(all):all[0];if(ring.length>2500)ring=PcSimplify(ring,2500)}
return{name,city,ring,places:places.slice(0,50),note,parts:outers.length,holes:holes.length}}
function TerrFile(){let inp=e("input",{type:"file",accept:".geojson,.json,application/json,application/geo+json",hidden:!0});
inp.addEventListener("change",async()=>{let f=inp.files&&inp.files[0];if(!f)return;
try{if(f.size>8e6)throw new Error("Fichier trop volumineux (8 Mo maximum).");let r=TerrFileParse(await f.text());if(!r.ring&&!r.places.length)throw new Error("Aucun contour ni lieu trouvé dans ce fichier.");
let ss=l._draw||TerrDraw();ss.set(r.ring,r.places,r.name,r.city,r.note||"Fichier importé : vérifiez le contour avant d’enregistrer.");A("Fichier importé : vérifiez puis touchez « Terminer ».")}
catch(er){A(er.message&&!/JSON/.test(er.message)?er.message:"Fichier illisible : il faut un GeoJSON valide.","err")}});
document.body.appendChild(inp);inp.click();setTimeout(()=>inp.remove(),60000)}
/* ===== Territoire : affichage lisible sur la carte (remplissage + trait contrasté, sans les ponts de jonction) ===== */
function TerrShape(L_,bd,pop){let ring=bd.slice(),n=ring.length,key=p=>Math.round(p[0]*1e6)+","+Math.round(p[1]*1e6),E=new Set();
for(let i=0;i<n;i++)E.add(key(ring[i])+">"+key(ring[(i+1)%n]));
let runs=[],cur=null;for(let i=0;i<n;i++){let a=ring[i],b=ring[(i+1)%n];if(E.has(key(b)+">"+key(a))){cur=null;continue}if(!cur){cur=[a];runs.push(cur)}cur.push(b)}
let g=L_.featureGroup(),fill=L_.polygon(ring,{stroke:!1,fillColor:"#E3600B",fillOpacity:.22});pop&&fill.bindPopup(pop);fill.addTo(g);
runs.length&&(L_.polyline(runs,{color:"#fff",weight:6,opacity:.85,interactive:!1,lineJoin:"round"}).addTo(g),L_.polyline(runs,{color:"#D9480F",weight:3,opacity:1,interactive:!1,lineJoin:"round"}).addTo(g));return g}
function TerrFit(map,terrs,force){let L_=_e(),b=null;terrs.forEach(t=>{if(t&&t.boundary&&t.boundary.length>2){let bb=L_.latLngBounds(t.boundary);b=b?b.extend(bb):bb}});if(!b)return;
try{if(force||!map._tfit&&!map.getBounds().intersects(b)){map._tfit=1;map.fitBounds(b,{padding:[40,40],maxZoom:16})}}catch{}}
