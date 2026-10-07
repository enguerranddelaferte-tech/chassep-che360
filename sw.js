const V="cp360-v30",SHELL=["./","index.html","manifest.webmanifest","icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!=="cp360-tiles").map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
if(u.hostname.includes("data.geopf.fr")||u.hostname.includes("tile")){e.respondWith(caches.open("cp360-tiles").then(async c=>{const m=await c.match(r);if(m)return m;try{const n=await fetch(r);if(n.ok)c.put(r,n.clone());return n}catch{return m||Response.error()}}));return}
if(u.origin===location.origin||u.hostname.includes("cdnjs")){e.respondWith(caches.match(r).then(m=>fetch(r).then(n=>{if(n.ok)caches.open(V).then(c=>c.put(r,n.clone()));return n}).catch(()=>m||caches.match("index.html"))))}});
