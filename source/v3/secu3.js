/* ----- Sans réseau, en vrai (3.0) : SOS, météo gardée, zones de carte ----- */

/* SOS (version en ligne) : l’alerte est d’abord écrite sur le téléphone, puis envoyée à la base.
   On ne dit « envoyé » qu’après avoir vérifié qu’elle est bien arrivée sur le serveur.
   Sinon : 112, coordonnées, SMS, et l’alerte part toute seule au retour du réseau. */
var S3Sos={id:null,at:0,watch:null};
function S3SosCo(s){return `${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`}
function S3SosSms(s){let nm=w.user&&w.user.name||"";return `sms:?body=${encodeURIComponent("SOS "+nm+" "+S3SosCo(s)+" https://www.google.com/maps?q="+s.lat.toFixed(5)+","+s.lng.toFixed(5))}`}
async function S3SosOnServer(id){
  try{let sb=window.cp360Sb,tk=await sb.bearer();if(!tk)return!1;
    let r=await sb.http("GET","/rest/v1/alerts?select=id&id=eq."+encodeURIComponent(id),void 0,{Authorization:"Bearer "+tk},6000);
    return!!(r&&r.ok&&Array.isArray(r.json)&&r.json.length)}catch{return!1}}
async function S3SosPush(id){
  /* jusqu’à 3 essais en 12 s : envoi de la file, puis vérification sur le serveur */
  if(!navigator.onLine)return!1;
  for(let k=0;k<3;k++){
    if(navigator.onLine){try{await Promise.race([window.cp360Sb.flush(),new Promise(z=>setTimeout(z,5000))])}catch{}
      if(await S3SosOnServer(id))return!0}
    await new Promise(z=>setTimeout(z,k<2?2000:0))}
  return!1}
function S3SosWatch(id){
  clearInterval(S3Sos.watch);let n=0;
  let tick=async()=>{if(++n>480){clearInterval(S3Sos.watch);return}
    if(!navigator.onLine)return;
    try{await window.cp360Sb.flush()}catch{}
    if(await S3SosOnServer(id)){clearInterval(S3Sos.watch);S3Sos.id=null;
      A("Votre alerte SOS vient de partir dans l’appli, avec votre position.","ok",{title:"SOS envoyé",timeout:0});
      try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch{}}};
  S3Sos.watch=setInterval(tick,15000);window.addEventListener("online",()=>setTimeout(tick,1500),{once:!0});
}
async function S3SosLive(c){
  let{s,n,t,a,i,o}=c;
  /* un deuxième appui ne crée pas une deuxième alerte : on réessaie d’envoyer la première */
  let id=S3Sos.id&&Date.now()-S3Sos.at<20*6e4?S3Sos.id:null,u=null;
  if(!id){try{u=await v.post("/sos",{location:{lat:s.lat,lng:s.lng},text:n.value,huntId:t||void 0});id=u&&u.alert&&u.alert.id}catch{}
    if(id){S3Sos.id=id;S3Sos.at=Date.now()}}
  B(a,e("div.panel",e("div.row",e("div.spin",{style:{width:"22px",height:"22px"}}),e("div.grow",e("b","Envoi de l’alerte…"),e("div.small","Vérification que l’alerte est bien partie.")))),
    e("a.btn.danger.block.xl",{href:"tel:112"},b("phone"),"Appeler le 112"));
  let ok=id?await S3SosPush(id):!1;
  if(ok){S3Sos.id=null;o.close();
    let cm=Le({title:"SOS envoyé",body:e("div.stack",
      e("p","L’alerte est partie avec votre position : les participants de la chasse, les responsables du territoire et les pratiquants à moins de 5 km sont prévenus. Restez joignable et appelez les secours."),
      e("div.grid.g-2",i.map(([d,p])=>e("a.btn",{href:`tel:${d}`},b("phone"),`${d} · ${p}`))),
      e("a.btn.ghost",{href:S3SosSms(s)},b("send"),"Envoyer ma position par SMS à un proche")),
      actions:[x("Voir l’alerte",{kind:"primary",onClick:()=>{cm.close(),ge(`/securite/${id}`)}})]});
    return}
  B(a,e("div.panel.danger",e("b","Pas de réseau : l’alerte n’est pas encore partie."),
      e("p",id?"Elle partira toute seule dans l’appli dès que le réseau revient. N’attendez pas : appelez le 112 (il passe sur tous les réseaux disponibles) et donnez ces coordonnées :":"Appelez le 112 (il passe sur tous les réseaux disponibles) et donnez ces coordonnées :")),
    e("p",{style:{fontSize:"24px",fontWeight:"700",textAlign:"center",margin:"6px 0",letterSpacing:".02em"}},S3SosCo(s)),
    e("a.btn.danger.block.xl",{href:"tel:112"},b("phone"),"Appeler le 112"),
    e("a.btn.block",{href:S3SosSms(s)},b("send"),"Envoyer ma position par SMS"),
    e("p.small.muted",{style:{margin:"6px 0 0"}},"Un SMS passe souvent là où Internet ne passe pas."));
  id&&S3SosWatch(id);
}

/* Météo : on garde les dernières prévisions réelles reçues ; sans réseau, on les montre avec leur heure.
   Plus jamais de météo inventée. */
const S3WxKey="cp360.wx.saved";
function S3WxDist(a,b2,c,d){let x2=(c-a)*Math.PI/180,y=(d-b2)*Math.PI/180,q2=Math.sin(x2/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(y/2)**2;return 2*6371*Math.asin(Math.sqrt(q2))}
function WxSave(t,r,a){try{if(!a||a.source==="saved"||a.source==="none"||!Array.isArray(a.hourly))return;
  let L2=(JSON.parse(localStorage.getItem(S3WxKey)||"[]")||[]).filter(z=>S3WxDist(t,r,z.lat,z.lng)>5);
  L2.unshift({lat:t,lng:r,at:Date.now(),data:{source:a.source,current:a.current,hourly:a.hourly,daily:a.daily||[],gustsEstimated:a.gustsEstimated}});
  localStorage.setItem(S3WxKey,JSON.stringify(L2.slice(0,4)))}catch{}}
function WxSaved(t,r){try{
  let now=Date.now(),best=null;
  (JSON.parse(localStorage.getItem(S3WxKey)||"[]")||[]).forEach(z=>{let dk=S3WxDist(t,r,z.lat,z.lng);if(dk<=30&&now-z.at<72*36e5&&(!best||z.at>best.at))best=z});
  if(!best)return null;
  let d=JSON.parse(JSON.stringify(best.data)),h=(d.hourly||[]).filter(x2=>new Date(x2.time).getTime()>now-36e5);
  if(!h.length)return null;
  let cur={...d.current};["temp","wind","windDir","gusts","code","pressure","humidity","feels","rain"].forEach(k2=>{h[0][k2]!=null&&(cur[k2]=h[0][k2])});
  d.current=cur;d.hourly=h;d.daily=(d.daily||[]).filter(x2=>x2.date>=new Date().toISOString().slice(0,10));
  d.source="saved";d.savedAt=best.at;d.origin=best.data.source;
  try{typeof WxNow=="function"&&(d.nowcast=WxNow({},{time:h[0].time},h,0))}catch{}
  return d}catch{return null}}
function WxNone(t,r){return{source:"none",current:{temp:0,feels:0,humidity:0,pressure:0,pressureTrend:0,wind:0,windDir:0,gusts:0,code:0,rain:0},hourly:[],daily:[]}}
function WxSavedTxt(o){let at=new Date(o.savedAt||Date.now()),j=new Date().toDateString()===at.toDateString();
  return "prévisions reçues "+(j?"à ":"le "+at.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})+" à ")+at.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})+" · sans réseau"}

/* Zones de carte hors ligne : rangées à part par le service worker (cache « cp360-zones », sans limite),
   liste sur l’appareil, suppression zone par zone. */
const S3ZoneKey="cp360.zones";
function S3Zones(){try{return JSON.parse(localStorage.getItem(S3ZoneKey)||"[]")||[]}catch{return[]}}
function S3ZonesSet(L2){try{localStorage.setItem(S3ZoneKey,JSON.stringify(L2))}catch{}}
/* même découpage que le téléchargement (fonction na du bundle), recopié pour ne dépendre de rien */
function S3ZoneNa(t,r,n){let i=[],rad=d=>d*Math.PI/180,a=(o,l)=>Math.floor((o+180)/360*2**l),s=(o,l)=>Math.floor((1-Math.log(Math.tan(rad(o))+1/Math.cos(rad(o)))/Math.PI)/2*2**l);
  for(let o=r;o<=n;o++){let l=a(t.getWest(),o),u=a(t.getEast(),o),c=s(t.getNorth(),o),d=s(t.getSouth(),o);for(let p=l;p<=u;p++)for(let m=c;m<=d;m++)i.push({z:o,x:p,y:m})}return i}
function S3ZoneTiles(z){
  let bb={getSouth:()=>z.b[0],getWest:()=>z.b[1],getNorth:()=>z.b[2],getEast:()=>z.b[3]},a=S3ZoneNa(bb,Math.max(10,z.z-2),Math.min(17,z.z+2)),
    tpl=(t,r)=>`https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${t}&STYLE=normal&FORMAT=${r}&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`;
  a.length>900&&(a=S3ZoneNa(bb,Math.max(10,z.z-1),Math.min(17,z.z+1)));
  let s=[];z.layers.forEach(c=>a.forEach(d=>s.push(tpl(c,c.includes("ORTHO")?"image/jpeg":"image/png").replace("{z}",d.z).replace("{x}",d.x).replace("{y}",d.y))));return s}
function S3ZoneSave(map,layers,n){
  let bb=map.getBounds(),c=bb.getCenter(),L2=S3Zones();
  L2.unshift({id:"z"+Date.now().toString(36),at:Date.now(),b:[bb.getSouth(),bb.getWest(),bb.getNorth(),bb.getEast()],z:map.getZoom(),layers,n,c:[c.lat,c.lng]});
  S3ZonesSet(L2.slice(0,20));
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch{}}
async function S3ZoneDelete(id){
  let L2=S3Zones(),z=L2.find(q2=>q2.id===id);if(!z)return;
  let rest=L2.filter(q2=>q2.id!==id),keep=new Set();rest.forEach(q2=>{try{S3ZoneTiles(q2).forEach(u=>keep.add(u))}catch{}});
  try{let cc=await caches.open("cp360-zones");await Promise.all(S3ZoneTiles(z).filter(u=>!keep.has(u)).map(u=>cc.delete(u)))}catch{}
  S3ZonesSet(rest)}
function S3ZoneList(map){
  let box=e("div.stack",{style:{gap:"8px"}});
  let draw=()=>{let L2=S3Zones();W(box);
    C(box,e("b",L2.length?`Zones gardées sur ce téléphone (${L2.length})`:"Aucune zone gardée sur ce téléphone"));
    L2.forEach(z=>{let d=new Date(z.at);
      C(box,e("div.row",{style:{gap:"8px",alignItems:"center"}},b("map"),
        e("div.grow",e("div",`Zone du ${d.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} à ${d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}`),e("div.small.muted",`${z.n} morceaux de carte · ${z.layers.some(l=>l.includes("ORTHO"))?"plan IGN et photo aérienne":"plan IGN"}`)),
        map?x("Voir",{size:"sm",kind:"ghost",onClick:()=>{try{map.fitBounds([[z.b[0],z.b[1]],[z.b[2],z.b[3]]])}catch{}}}):null,
        x("Supprimer",{size:"sm",kind:"ghost",icon:"trash",onClick:async()=>{await S3ZoneDelete(z.id);A("Zone supprimée de ce téléphone.");draw()}})))})};
  draw();return box}

/* Bloquer un membre (exigé par Apple pour les contenus publiés par les membres) :
   la liste est gardée dans les réglages du compte ; ses publications et commentaires disparaissent du fil. */
function S3BlockedList(u){try{let L=u&&u.settings&&u.settings.blocked;return Array.isArray(L)?L.filter(x2=>x2&&x2.id):[]}catch{return[]}}
function S3BlockedHas(u,id){return!!id&&S3BlockedList(u).some(x2=>x2.id===id)}
async function S3BlockSave(L){
  if(!w.user)return;w.user.settings={...(w.user.settings||{}),blocked:L};
  try{await v.patch("/auth/me",{settings:{blocked:L}})}catch{}
  try{window.dispatchEvent(new HashChangeEvent("hashchange"))}catch{}}
async function S3Block(a){
  if(!w.user||!a||!a.id||a.id===w.user.id)return;
  if(!await ve({title:`Bloquer ${a.name||"ce membre"} ?`,text:"Vous ne verrez plus ses publications ni ses commentaires. Il n’en est pas prévenu. Vous pourrez le débloquer dans Mon profil, rubrique Affichage. Pour un contenu choquant, utilisez aussi « Signaler ».",confirm:"Bloquer",danger:!0}))return;
  let L=S3BlockedList(w.user).filter(x2=>x2.id!==a.id);L.push({id:a.id,name:a.name||"Membre"});
  await S3BlockSave(L);A(`${a.name||"Ce membre"} est bloqué.`,"ok")}
function S3BlockedField(){
  let box=e("div.field");
  let draw=()=>{let L=S3BlockedList(w.user);W(box);
    C(box,e("label","Membres bloqués"),
      L.length?e("div.stack",{style:{gap:"6px"}},L.map(m=>e("div.row",{style:{gap:"8px",alignItems:"center"}},e("span.grow",m.name),
        x("Débloquer",{size:"sm",kind:"ghost",onClick:async()=>{await S3BlockSave(S3BlockedList(w.user).filter(z=>z.id!==m.id));A(`${m.name} est débloqué.`);draw()}})))):
      e("div.small.muted","Aucun. Pour bloquer un membre, touchez « Bloquer » sous l’une de ses publications."))};
  draw();return box}
