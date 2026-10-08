const V="cp360-v47",TILES="cp360-tiles",STATIC="cp360-static",SHELL=["./","index.html","manifest.webmanifest","icon.svg"],MAXT=500;
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>![V,TILES,STATIC].includes(x)).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
async function trim(c,n){const k=await c.keys();if(k.length>n)await Promise.all(k.slice(0,k.length-n).map(x=>c.delete(x)))}
// cache d'abord, mise à jour en arrière-plan : affichage immédiat, même hors ligne
function swr(r,name){return caches.open(name).then(async c=>{const m=await c.match(r);const net=fetch(r).then(n=>{if(n&&(n.ok||n.type==="opaque"))c.put(r,n.clone());return n}).catch(()=>null);return m||(await net)||(name===V?c.match("index.html"):Response.error())})}
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
if(u.hostname.includes("data.geopf.fr")||u.hostname.includes("tile.openstreetmap")||u.hostname.endsWith(".tile.openstreetmap.org")){e.respondWith(caches.open(TILES).then(async c=>{const m=await c.match(r);if(m)return m;try{const n=await fetch(r);if(n.ok){c.put(r,n.clone());trim(c,MAXT)}return n}catch{return Response.error()}}));return}
if(u.hostname==="cdnjs.cloudflare.com"||u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){e.respondWith(swr(r,STATIC));return}
if(u.origin===location.origin){e.respondWith(swr(r,V))}});
