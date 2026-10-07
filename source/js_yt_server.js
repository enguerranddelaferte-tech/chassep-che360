xe.post("/admin/ambassadors/:id/videos/sync",et(async(t,r)=>{ki(t);AmbAll();let a=z.ambassadors.get(t.params.id);if(!a)throw new nn(404,"Ambassadeur introuvable.");
let vs=Array.isArray(t.body&&t.body.videos)?t.body.videos.slice(0,30):[],idOf=u=>(/[?&]v=([\w-]{6,})/.exec(String(u||""))||[])[1]||u,seen=new Set(),out=[];
vs.forEach(o=>{if(!o||!o.url||!o.title)return;let i=idOf(o.url);if(seen.has(i))return;seen.add(i);let dt=o.date?new Date(o.date):new Date();out.push({id:"yt_"+i,title:String(o.title).slice(0,140),url:o.url,duration:o.duration||null,date:(isNaN(dt)?new Date():dt).toISOString(),season:a.season==="peche"?"peche":"chasse",yt:!0})});
(a.videos||[]).forEach(o=>{let i=idOf(o.url);if(!seen.has(i)){seen.add(i);out.push(o)}});
out.sort((p,q)=>(+new Date(q.date)||0)-(+new Date(p.date)||0));r.json(z.ambassadors.update(a.id,{videos:out.slice(0,40),real:!0,syncedAt:new Date().toISOString()}))}));
