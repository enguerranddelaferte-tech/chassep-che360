/* ----- Fréquentation (3.0) : encadré du tableau de bord admin -----
   Chiffres calculés par la base (fonction admin_audience), sans les appareils de l'équipe.
   Chaque appareil reçoit un identifiant anonyme gardé d'une visite à l'autre (aucune donnée personnelle). */
function S3AudNum(n){return (n||0).toLocaleString("fr-FR")}
async function S3AudBox(p){
  if(!(p==="/admin"||p==="/admin/tableau")||!w.user||!S3Adm(w.user)||!Mt)return;
  let pg=Mt.querySelector(".page");if(!pg||pg.querySelector(".aud-box"))return;
  let body=e("div.aud-body",e("p.small.muted",{style:{margin:0}},"Chargement…"));
  let noTrack=(()=>{try{return localStorage.getItem("cp360.noTrack")==="1"}catch{return!1}})();
  let tg=e("label.aud-me",e("input",{type:"checkbox",checked:noTrack,onchange:ev=>{try{ev.target.checked?localStorage.setItem("cp360.noTrack","1"):localStorage.removeItem("cp360.noTrack")}catch{}A(ev.target.checked?"Cet appareil n’est plus compté dans les visites.":"Cet appareil est de nouveau compté.","ok")}}),e("span","Ne pas compter cet appareil (vos propres visites sans être connecté)"));
  let box=k({cls:"aud-box",title:"Fréquentation",sub:"hors équipe"},body,tg);
  let anchor=pg.querySelector(".feat-admin")||pg.querySelector(".part-admin")||pg.querySelector(".page-head");anchor?anchor.after(box):pg.prepend(box);
  if(!(window.cp360Sb&&window.cp360Sb.on&&window.cp360Sb.on())){C(body,e("p.small.muted",{style:{margin:0}},"Disponible sur l’appli en ligne (pas en démonstration)."));return}
  let r=null;try{r=await S3Sb("POST","rpc/admin_audience",{})}catch{}
  W(body);if(!r||!r.ok||!r.json){C(body,e("p.small.muted",{style:{margin:0}},"Statistiques indisponibles pour le moment."));return}
  let d=r.json,max=Math.max(1,...(d.per_day||[]).map(x2=>x2.n)),tile=(v,l)=>e("div.aud-tile",e("b",S3AudNum(v)),e("span",l));
  let dev=d.devices_30d||{},devTot=Object.values(dev).reduce((a,b2)=>a+b2,0)||1,devTxt=Object.entries(dev).sort((a,b2)=>b2[1]-a[1]).map(([kk,n])=>`${({telephone:"téléphone",ordinateur:"ordinateur",tablette:"tablette"})[kk]||kk} ${Math.round(n*100/devTot)} %`).join(" · ");
  C(body,
    e("div.aud-tiles",tile(d.uniq_today,"visiteurs aujourd’hui"),tile(d.uniq_7d,"visiteurs sur 7 jours"),tile(d.uniq_30d,"visiteurs sur 30 jours"),tile(d.new_7d,"nouveaux sur 7 jours")),
    e("div.aud-chart",{role:"img","aria-label":"Visiteurs par jour sur 14 jours"},(d.per_day||[]).map(x2=>{let dt=new Date(x2.day+"T12:00:00");return e("div.aud-col",{title:`${dt.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})} : ${x2.n} visiteur${x2.n>1?"s":""}`},e("span.aud-n",x2.n?String(x2.n):""),e("i",{style:{height:Math.max(2,Math.round(x2.n/max*100))+"%"}}),e("span.aud-d",String(dt.getDate())))})),
    e("p.small",{style:{margin:"10px 0 0"}},e("b","Comptes membres : "),`${S3AudNum(d.accounts)} inscrit${d.accounts>1?"s":""} hors équipe · ${S3AudNum(d.accounts_new_7d)} nouveau${d.accounts_new_7d>1?"x":""} cette semaine · ${S3AudNum(d.accounts_active_7d)} connecté${d.accounts_active_7d>1?"s":""} cette semaine`),
    devTxt?e("p.small.muted",{style:{margin:"4px 0 0"}},"Appareils (30 jours) : "+devTxt):null,
    e("p.tiny.muted",{style:{margin:"6px 0 0"}},"Compteur de visiteurs uniques fiable à partir du 28 octobre 2026 : avant, chaque nouvel onglet comptait comme un visiteur. Les appareils de l’équipe sont exclus."));
}
