const V="cp360-v162",TILES="cp360-tiles",ZONES="cp360-zones",STATIC="cp360-static",SHELL=["./","index.html","manifest.webmanifest","icons/icon-192.png"],MAXT=3000;
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL.map(x=>new Request(x,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>![V,TILES,ZONES,STATIC].includes(x)).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
async function trim(c,n){const k=await c.keys();if(k.length>n)await Promise.all(k.slice(0,k.length-n).map(x=>c.delete(x)))}
// Cartes : les zones téléchargées (marquées cp360z=1) vont dans ZONES, gardées sans limite ;
// les morceaux vus en naviguant vont dans TILES (3000 au plus). Requête CORS pour obtenir une
// réponse lisible et peu coûteuse en place ; si le serveur la refuse, on sert sans garder.
async function tile(u){const z=u.href.includes("&cp360z=1");const key=u.href.replace("&cp360z=1","");
const zc=await caches.open(ZONES);let m=await zc.match(key);if(m)return m;const tc=await caches.open(TILES);m=await tc.match(key);
if(m){if(z){zc.put(key,m.clone()).catch(()=>{})}return m}
try{const n=await fetch(new Request(key,{mode:"cors",credentials:"omit"}));if(n&&n.ok){(z?zc:tc).put(key,n.clone()).then(()=>z||trim(tc,MAXT)).catch(()=>{})}return n}
catch{try{return await fetch(key,{mode:"no-cors"})}catch{return Response.error()}}}
// cache d'abord, mise à jour en arrière-plan : affichage immédiat, même hors ligne
function swr(r,name){return caches.open(name).then(async c=>{const m=await c.match(r);const net=fetch(r).then(n=>{if(n&&(n.ok||n.type==="opaque"))c.put(r,n.clone());return n}).catch(()=>null);return m||(await net)||(name===V?c.match("index.html"):Response.error())})}
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
if(u.hostname.includes("data.geopf.fr")||u.hostname.endsWith("tile.openstreetmap.org")){e.respondWith(tile(u));return}
if(u.hostname==="cdnjs.cloudflare.com"||u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){e.respondWith(swr(r,STATIC));return}
if(u.origin===location.origin){if(r.mode==="navigate"||u.pathname.endsWith("/")||u.pathname.endsWith("index.html")){e.respondWith(caches.open(V).then(c=>Promise.race([fetch(new Request(u.href,{cache:"no-cache",credentials:"same-origin"})).then(n=>{if(n&&n.ok)c.put(r,n.clone());return n}),new Promise((_,j)=>setTimeout(j,4e3))]).catch(async()=>await c.match(r)||await c.match("index.html")||Response.error())));return}e.respondWith(swr(r,V))}});

self.addEventListener("push",e=>{let d={};try{d=e.data?e.data.json():{}}catch{}const sos=d.tag==="sos"||d.title==="Alerte";const o={body:d.body||"",tag:sos?"sos-"+Date.now():d.tag||"cp360",renotify:d.tag==="msg"||sos,icon:"icons/icon-192.png",badge:"icons/icon-32.png",lang:"fr",timestamp:Date.now(),data:{link:d.link||"#/notifications"}};if(sos){o.requireInteraction=true;o.vibrate=[400,200,400,200,400]}else o.vibrate=[200,100,200];e.waitUntil(self.registration.showNotification(d.title||"Chasse & Pêche 360°",o))});
self.addEventListener("notificationclick",e=>{e.notification.close();const link=(e.notification.data&&e.notification.data.link)||"#/notifications";e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{for(const c of cs){if("focus"in c){c.focus();c.postMessage({type:"nav",link});return}}return self.clients.openWindow("./"+link)}))});
