/* ----- Exploitation (3.0) : remontée des erreurs, tableau de suivi du lancement (admin) ----- */
var S3Err={n:0,seen:{}};
function S3ErrSend(msg,src){
  try{
    if(!window.cp360Sb||!window.cp360Sb.on||!window.cp360Sb.on())return;
    msg=String(msg||"").slice(0,500);if(!msg||/ResizeObserver loop|Script error\.?$/.test(msg))return;
    if(S3Err.n>=5||S3Err.seen[msg])return;S3Err.n++;S3Err.seen[msg]=1;
    S3Sb("POST","client_errors",{msg,src:String(src||"").slice(0,300),path:(location.hash||"").split("?")[0].slice(0,120),ua:navigator.userAgent.slice(0,200),ver:"3.0"},{Prefer:"return=minimal"}).catch(()=>{});
  }catch{}
}
window.addEventListener("error",ev=>S3ErrSend(ev.message,(ev.filename||"").split("/").pop()+":"+ev.lineno+":"+ev.colno));
window.addEventListener("unhandledrejection",ev=>{let r=ev.reason;if(r&&(r.status===401||r.status===403||r.status===0))return;S3ErrSend(r&&r.message?r.message:String(r),r&&r.stack?String(r.stack).split("\n")[1]:"promise")});

/* Encart « Lancement » sur le tableau de bord admin */
async function S3LaunchAdmin(p){
  if(!(p==="/admin"||p==="/admin/tableau")||!w.user||!S3Adm(w.user)||!Mt)return;
  let pg=Mt.querySelector(".page");if(!pg||pg.querySelector(".launch-admin"))return;
  let r=await S3Sb("POST","rpc/admin_launch_stats",{});
  if(!(r&&r.ok&&r.json))return;
  if(location.hash.split("?")[0]!=="#"+p||pg.querySelector(".launch-admin"))return;
  let s=r.json,tile=(n,l,sub)=>e("div.amb-stat",e("b",String(n)),e("span",l),sub?e("small",sub):null);
  let days=s.by_day||[],max=Math.max(1,...days.map(d=>d.n));
  let bars=e("div.la-bars",{role:"img","aria-label":"Inscriptions par jour sur 30 jours"},days.map(d=>e("i",{title:d.d+" : "+d.n,style:{height:Math.max(2,Math.round(d.n/max*100))+"%"}})));
  let box=e("section.card.launch-admin",
    e("div.row",{style:{justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap",gap:"8px"}},e("h3",{style:{margin:0}},"Lancement"),e("span.small.muted","inscriptions, places, codes, erreurs")),
    e("div.amb-stats",{style:{marginTop:"12px"}},
      tile(s.users,"comptes",s.today?"+"+s.today+" aujourd’hui":null),
      tile(s.week,"sur 7 jours"),
      tile(Math.max(0,30-s.pioneers)+" / 30","places Pionnier libres"),
      tile(Math.max(0,500-s.pioneers-s.founders)+" / 500","places Fondateurs libres"),
      tile(s.invites_used,"invitations utilisées"),
      tile(s.errors7,"erreurs sur 7 jours")),
    e("div",{style:{marginTop:"14px"}},e("div.small.muted",{style:{marginBottom:"6px"}},"Inscriptions par jour, 30 derniers jours (max "+max+")"),bars),
    (s.by_code||[]).length?e("div",{style:{marginTop:"14px"}},e("div.small.muted",{style:{marginBottom:"6px"}},"Inscrits par code ambassadeur"),
      e("div.list",s.by_code.map(c=>e("div.list-row",e("div.grow",e("div.t",c.name),e("div.s","code "+c.code)),e("b",String(c.n)))))):null,
    (s.last_errors||[]).length?e("details",{style:{marginTop:"14px"}},e("summary.small","Dernières erreurs chez les utilisateurs"),
      e("div.list",s.last_errors.map(x2=>e("div.list-row",e("div.grow",e("div.t",{style:{fontWeight:500,fontSize:"14px"}},x2.msg),e("div.s",new Date(x2.at).toLocaleString("fr-FR")+" · "+(x2.path||""))))))):null);
  let svc=e("div.small.svc-state",{style:{marginTop:"12px"}},"Service de modération des photos : vérification…");box.append(svc);
  S3Sb("POST","rpc/moderation_service_status",{}).then(r2=>{
    let v=r2&&r2.ok&&r2.json;if(!v){svc.textContent="Service de modération des photos : état indisponible.";return}
    let ago=v.last?Math.round((Date.now()-new Date(v.last))/60000):null;
    let ok=v.configured&&!(v.waiting>0&&(ago==null||ago>30));
    svc.className="small svc-state "+(v.configured?(ok?"svc-ok":"svc-warn"):"svc-off");
    svc.textContent="Service de modération des photos : "+(!v.configured?"pas encore branché (voir le guide d’installation).":
      (ok?"en marche":"à vérifier")+" · dernière analyse "+(ago==null?"jamais":ago<60?"il y a "+ago+" min":"il y a "+Math.round(ago/60)+" h")+
      " · "+v.analysed7+" photo(s) analysée(s) et "+v.flagged7+" signalée(s) sur 7 jours"+(v.waiting?" · "+v.waiting+" en attente":"")+".");
  }).catch(()=>{});
  let h=pg.querySelector(".page-head");h?h.after(box):pg.prepend(box);
}
