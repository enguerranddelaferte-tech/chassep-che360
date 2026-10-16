/* ===== Chasse & Pêche 360° 3.0 — coque, navigation, recherche, chargements différés ===== */
var S3={sheet:null,palette:null,title:null,bound:!1,closed:null};
function S3Adm(u){return!!u&&["admin","moderator"].includes(u.role)}
function S3Groups(all){
  let u=w.user,adm=S3Adm(u),gs=adm?AdmNavFor(u.role):GxNavR(xl);
  !IsLaunch()&&u&&u.isManager&&!adm&&(gs=[...gs,{group:"Espace pro",items:[["/pro","Tableau de bord territoire","chart"]]}]);
  return all?gs:gs.filter(g=>!g.season||g.season===w.season)
}
function S3Find(p){
  let best=null;
  S3Groups(!0).forEach(g=>g.items.forEach(i=>{(p===i[0]||p.startsWith(i[0]+"/"))&&(!best||i[0].length>best.path.length)&&(best={path:i[0],label:i[1],icon:i[2],group:g.group})}));
  if(!best){let extra={"/profil":["Mon profil","Compte"],"/notifications":["Notifications","Compte"],"/abonnement":["Offres & abonnement","Compte"],"/reglementation":["Réglementation","Terrain"],"/sortie":["Sortie en cours","Terrain"],"/historique":["Historique des sorties","Terrain"],"/sortie-detail":["Détail de sortie","Terrain"],"/recettes":["Recettes","Cuisine & commerce"],"/battues":["Chasse","Chasse"],"/gestion":["Gestion de territoire","Chasse"],"/journee":["Ma journée de chasse","Chasse"]};
    let k=Object.keys(extra).filter(x=>p===x||p.startsWith(x+"/")).sort((a,b2)=>b2.length-a.length)[0];k&&(best={path:k,label:extra[k][0],group:extra[k][1]})}
  return best
}
function S3Mark(){return e("span.brand-mark",{html:document.getElementById("logo-tpl").innerHTML})}
function S3Season(cls){
  let el=e("div.season"+(cls?"."+cls:""),{role:"group","aria-label":"Mode d’activité"},
    e("button",{type:"button","aria-pressed":String(w.season==="chasse"),onclick:()=>S3Switch("chasse")},b("deer"),e("span","Chasse")),
    e("button",{type:"button","aria-pressed":String(w.season==="peche"),onclick:()=>S3Switch("peche")},b("fish"),e("span","Pêche")));
  return el
}
function S3Switch(s){if(s===w.season)return;S3SheetClose();an(s)}
function S3Flash(s){document.querySelectorAll(".mode-flash").forEach(x=>x.remove());let f=e("div.mode-flash",{role:"status"},b(s==="peche"?"fish":"deer"),s==="peche"?"Mode pêche":"Mode chasse");document.body.append(f),setTimeout(()=>f.remove(),1400)}
function S3ModeTab(){
  let u=w.user;if(S3Adm(u))return["/admin/zones","Zones","target"];
  return w.season==="chasse"?IsLaunch()?["/angle-30","Tir 30°","target"]:["/battues","Chasse","flag"]:["/carnet","Carnet","book"]
}
function S3Logout(){S3SheetClose();ve({title:"Se déconnecter ?",text:"Vous pourrez vous reconnecter à tout moment avec votre adresse e-mail.",confirm:"Se déconnecter"}).then(ok=>ok&&Oi())}
function S3Theme(){Ln(w.theme==="dark"?"light":"dark")}
function S3Role(u){return u.role==="admin"?"Administrateur":u.role==="moderator"?"Modérateur":{chasseur:"Chasseur",pecheur:"Pêcheur",mixte:"Chasseur & pêcheur",usager:"Usager de la nature"}[u.profile]||"Membre"}

function Sl(){
  let u=w.user,adm=S3Adm(u),closed=new Set(Pe.get("navClosed",[]));
  /* Barre latérale (PC) */
  let nav=e("div.sb-scroll");
  S3Groups().forEach(g=>{
    let grp=e("div.nav-group",{class:closed.has(g.group)?"closed":""});
    grp.append(e("button",{type:"button","aria-expanded":String(!closed.has(g.group)),onclick:()=>{let c=grp.classList.toggle("closed");c?closed.add(g.group):closed.delete(g.group),Pe.set("navClosed",[...closed]),grp.firstChild.setAttribute("aria-expanded",String(!c))}},e("span",g.group),b("chevron")));
    g.items.forEach(([p,l,ic,ct])=>grp.append(e("a.nav-link",{href:"#"+p,title:l,dataset:{path:p,counter:ct||""}},b(ic),e("span",l),ct?e("span.count",{hidden:!0}):null)));
    nav.append(grp)
  });
  let side=e("nav.sidebar",{"aria-label":"Navigation principale"},
    e("div.sb-top",
      e("div.sb-brand-row",kl(),e("button.icon-btn.rail-toggle.rail-keep",{type:"button","aria-label":"Replier le menu",title:"Replier / déplier le menu",onclick:()=>{let r=document.documentElement.classList.toggle("rail");Pe.set("rail",r)}},b("menu"))),
      adm?e("span.adm-tag",b("shield"),u.role==="admin"?"Console admin":"Modération"):S3Season("block"),
      e("button.sb-search",{type:"button",onclick:()=>S3Palette()},b("search"),e("span","Rechercher"),e("kbd","Ctrl K"))),
    nav,
    e("div.sb-foot",
      adm?null:e("a.nav-link",{href:"#/abonnement",title:"Offres & abonnement",dataset:{path:"/abonnement"}},b("crown"),e("span","Offres & abonnement")),
      e("div.side-user",
        e("a.side-user-link",{href:"#/profil",title:"Mon profil",dataset:{path:"/profil"}},oe(u,34),e("div",e("b",u.name),e("div.tiny.muted",S3Role(u)))),
        e("button.icon-btn",{type:"button","aria-label":"Thème jour / nuit",title:"Thème jour / nuit",dataset:{themeIc:"1"},onclick:S3Theme},b(w.theme==="dark"?"sun":"moon")),
        e("button.icon-btn.rail-keep",{type:"button","aria-label":"Se déconnecter",title:"Se déconnecter",onclick:S3Logout},b("logout")))));
  /* Barre du haut */
  let net=e("span.net-status",{hidden:w.online},b("offline"),e("span","Hors ligne")),
    bell=e("button.icon-btn",{type:"button","aria-label":"Notifications",title:"Notifications",onclick:()=>ge("/notifications")},b("bell"),e("span.dot",{hidden:!0}));
  S3.title=e("div.tb-title",e("b",""),e("span",""));
  let top=e("header.topbar",
    e("a.tb-brand",{href:"#"+StartPath(),"aria-label":"Accueil Chasse & Pêche 360°"},S3Mark()),
    S3.title,
    adm?null:S3Season(),
    e("button.tb-search",{type:"button",onclick:()=>S3Palette()},b("search"),e("span","Rechercher une personne, une page…"),e("kbd","Ctrl K")),
    e("div.spacer"),
    TripPillEl(),net,
    e("button.icon-btn.tb-find",{type:"button","aria-label":"Rechercher",title:"Rechercher",onclick:()=>S3Palette()},b("search")),
    bell);
  /* Barre d'onglets (mobile) */
  let tabs;
  if(adm)tabs=e("nav.tabbar",{"aria-label":"Navigation rapide"},
    [["/admin/tableau","Tableau","chart"],["/admin/articles","Articles","book"],["/admin/signalements","Signalements","alert"],S3ModeTab()].map(([p,l,ic])=>e("a",{href:"#"+p,dataset:{path:p}},b(ic),e("span",l))),
    e("button.tab",{type:"button",onclick:()=>S3SheetOpen()},b("menu"),e("span","Menu"),e("span.tab-badge",{hidden:!0})));
  else{let mt=S3ModeTab();tabs=e("nav.tabbar",{"aria-label":"Navigation rapide"},
    e("a",{href:"#/communaute",dataset:{path:"/communaute"}},b("users"),e("span","Actualité")),
    e("a",{href:"#/carte",dataset:{path:"/carte"}},b("map"),e("span","Carte")),
    e("button.tab-sos",{type:"button","aria-label":"Envoyer un SOS",onclick:()=>ht()},"SOS"),
    e("a.tab-season",{href:"#"+mt[0],dataset:{path:mt[0]}},b(mt[2]),e("span",mt[1])),
    e("button.tab",{type:"button","aria-label":"Menu et compte",onclick:()=>S3SheetOpen()},b("menu"),e("span","Menu"),e("span.tab-badge",{hidden:!0})))}
  Mt=e("main.content",{id:"content",tabindex:-1});
  let fab=e("button.sos-fab",{type:"button","aria-label":"Envoyer un SOS",onclick:()=>ht()},b("sos"),"SOS");
  S3.sheet=null;
  Ot=e("div.shell",side,e("div.main",top,Mt),tabs,fab),B(Gi,Ot);
  document.documentElement.classList.toggle("rail",!!Pe.get("rail",!1));
  S3Unread();
  if(!S3.bound){S3.bound=!0;
    j.on("season",s=>{Ot=null,S3Flash(s)});
    window._sl||(window._sl=1,j.on("season",z=>{let q2=Li();z==="peche"&&(q2.startsWith("/battues")||q2.startsWith("/tableau-de-chasse")||q2.startsWith("/angle-30")||q2.startsWith("/sortie/chasse")||q2.startsWith("/historique/chasse")||q2.startsWith("/reglementation/chasse"))?ge(q2.startsWith("/sortie/")?"/sortie/peche":q2.startsWith("/historique/")?"/historique/peche":q2.startsWith("/reglementation/")?"/reglementation/peche":"/carnet"):z==="chasse"&&(q2.startsWith("/carnet")||q2.startsWith("/spots")||q2.startsWith("/niveaux-eau")||q2.startsWith("/sortie/peche")||q2.startsWith("/historique/peche")||q2.startsWith("/reglementation/peche"))?ge(q2.startsWith("/sortie/")?"/sortie/chasse":q2.startsWith("/historique/")?"/historique/chasse":q2.startsWith("/reglementation/")?"/reglementation/chasse":IsLaunch()?"/angle-30":"/battues"):Ie()}));
    j.on("theme",t2=>{document.querySelectorAll("[data-theme-ic]").forEach(bt=>{W(bt),bt.append(b(t2==="dark"?"sun":"moon"))})});
    j.on("online",m=>{document.querySelectorAll(".net-status").forEach(x=>x.hidden=m),A(m?"Connexion rétablie. Synchronisation en cours.":"Vous êtes hors ligne. Vos saisies sont conservées et seront envoyées au retour du réseau.",m?"ok":"warn")});
    j.on("unread",S3Unread);
    document.addEventListener("keydown",ev=>{let k=ev.key&&ev.key.toLowerCase();if((ev.ctrlKey||ev.metaKey)&&k==="k"){ev.preventDefault(),w.user&&S3Palette()}else if(k==="/"&&!ev.ctrlKey&&!ev.metaKey&&!/^(input|textarea|select)$/i.test(document.activeElement&&document.activeElement.tagName||"")&&!(document.activeElement&&document.activeElement.isContentEditable)&&w.user){ev.preventDefault(),S3Palette()}})
  }
}
function S3Unread(){
  if(!Ot)return;let n=w.unread.notifications,m=w.unread.messages;
  Ot.querySelectorAll(".topbar .icon-btn .dot").forEach(d=>{d.hidden=!n,d.textContent=n>9?"9+":n});
  Ot.querySelectorAll('[data-counter="messages"] .count').forEach(f=>{f.hidden=!m,f.textContent=m});
  Ot.querySelectorAll(".tabbar .tab-badge").forEach(f=>{f.hidden=!m,f.textContent=m>9?"9+":m});
  S3.sheet&&S3.sheet.querySelectorAll('[data-counter="messages"] .count').forEach(f=>{f.hidden=!m,f.textContent=m})
}

/* ----- Feuille « Menu » (mobile / tablette) ----- */
function S3SheetOpen(){
  let u=w.user;if(!u)return;S3SheetClose(!0);
  let p=Li(),adm=S3Adm(u),body=e("div.sheet-body");
  C(body,
    e("div.menu-user",
      e("div.row",oe(u,46),e("div.grow",e("b",u.name),e("div.tiny.muted",S3Role(u)+(u.email?" · "+u.email:"")))),
      e("div.menu-user-act",x("Profil et réglages",{icon:"user",size:"sm",href:"#/profil"}),x("Se déconnecter",{icon:"logout",size:"sm",kind:"ghost",onClick:S3Logout}))),
    adm?null:S3PushCard(!0),
    adm?null:S3Season("block"),
    e("button.menu-search",{type:"button",onclick:()=>{S3SheetClose(),S3Palette()}},b("search"),e("span","Rechercher une personne, une page…")));
  S3Groups().forEach(g=>{
    body.append(e("section.menu-group",e("h3",e("span",g.group),e("i")),e("div.menu-tiles",g.items.map(([path,l,ic,ct])=>e("a.menu-tile",{href:"#"+path,class:p===path||p.startsWith(path+"/")?"active":"",dataset:{counter:ct||""},onclick:()=>S3SheetClose()},b(ic),e("span",l),ct?e("span.count",{hidden:!0}):null)))))
  });
  body.append(e("div.menu-foot",
    adm?null:x("Offres & abonnement",{icon:"crown",href:"#/abonnement"}),
    x(w.theme==="dark"?"Thème jour":"Thème nuit",{icon:w.theme==="dark"?"sun":"moon",onClick:()=>{S3SheetClose(),S3Theme()}}),
    x("Notifications",{icon:"bell",href:"#/notifications"})));
  body.addEventListener("click",ev=>{ev.target.closest(".menu-foot a,.menu-user a")&&S3SheetClose()});
  let panel=e("div.sheet-panel",{role:"dialog","aria-modal":"true","aria-label":"Menu"},e("div.sheet-grip"),e("div.sheet-head",e("b.display",{style:{fontSize:"24px",flex:"1"}},"Menu"),e("button.icon-btn",{type:"button","aria-label":"Fermer le menu",onclick:()=>S3SheetClose()},b("close"))),body),
    sh=e("div.sheet",e("div.sheet-back",{onclick:()=>S3SheetClose()}),panel);
  document.body.append(sh),S3.sheet=sh,S3Unread();
  requestAnimationFrame(()=>requestAnimationFrame(()=>sh.setAttribute("open","")));
  let y0=null;panel.addEventListener("touchstart",ev=>{body.scrollTop<=0&&(y0=ev.touches[0].clientY)},{passive:!0});
  panel.addEventListener("touchmove",ev=>{if(y0==null)return;let d=ev.touches[0].clientY-y0;d>0&&(panel.style.transform=`translateY(${d}px)`,panel.style.transition="none")},{passive:!0});
  panel.addEventListener("touchend",ev=>{if(y0==null)return;let d=ev.changedTouches[0].clientY-y0;panel.style.transition="",panel.style.transform="",y0=null,d>110&&S3SheetClose()});
  S3.sheetKey=ev=>{ev.key==="Escape"&&S3SheetClose()};document.addEventListener("keydown",S3.sheetKey)
}
function S3SheetClose(now){
  let sh=S3.sheet;if(!sh)return;S3.sheet=null;S3.sheetKey&&document.removeEventListener("keydown",S3.sheetKey);
  if(now){sh.remove();return}sh.removeAttribute("open"),setTimeout(()=>sh.remove(),260)
}

/* ----- Recherche rapide (Ctrl K) ----- */
function S3Norm(s){return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}
function S3Items(){
  let u=w.user,adm=S3Adm(u),out=[];
  S3Groups(!0).forEach(g=>g.items.forEach(([p,l,ic])=>out.push({sec:g.season&&g.season!==w.season?g.group+" (autre mode)":g.group,label:l,icon:ic,hint:g.group,run:()=>{g.season&&g.season!==w.season&&an(g.season),ge(p)}})));
  let act=[];
  adm||act.push({label:"Envoyer un SOS",icon:"sos",hint:"Alerte GPS immédiate",run:()=>ht()});
  adm||act.push({label:w.season==="chasse"?"Passer en mode pêche":"Passer en mode chasse",icon:w.season==="chasse"?"fish":"deer",hint:"Change les outils affichés",run:()=>an(w.season==="chasse"?"peche":"chasse")});
  act.push({label:"Mon profil et réglages",icon:"user",hint:"Compte",run:()=>ge("/profil")},
    {label:"Notifications",icon:"bell",hint:"Compte",run:()=>ge("/notifications")},
    {label:w.theme==="dark"?"Thème jour":"Thème nuit",icon:w.theme==="dark"?"sun":"moon",hint:"Affichage",run:S3Theme});
  adm||act.push({label:"Offres & abonnement",icon:"crown",hint:"Compte",run:()=>ge("/abonnement")});
  act.push({label:"Se déconnecter",icon:"logout",hint:"Compte",run:S3Logout});
  act.forEach(a=>a.sec="Actions");
  return[...act.slice(0,2),...out,...act.slice(2)]
}
/* ----- Recherche globale : pages, actions, personnes, amis, ambassadeurs, contenus ----- */
var S3Idx={at:0,p:null,data:null};
function S3Safe(p){return p.catch(()=>null)}
function S3LoadIdx(){
  if(S3Idx.data&&S3Idx.uid===(w.user&&w.user.id)&&Date.now()-S3Idx.at<60000)return Promise.resolve(S3Idx.data);
  return S3Idx.p||(S3Idx.p=(async()=>{
    let[fr,amb,art,rec,qa,grp,spm,spp,lst,dir]=await Promise.all([S3Safe(v.get("/friends")),S3Safe(v.get("/ambassadors")),S3Safe(v.get("/articles")),S3Safe(v.get("/recipes")),S3Safe(v.get("/questions")),S3Safe(v.get("/groups")),S3Safe(v.get("/spots?scope=mine")),S3Safe(v.get("/spots?scope=public")),S3Safe(v.get("/listings")),S3Safe(v.get("/directory"))]);
    let out=[],seenSp=new Set,friendIds=new Set;
    (fr&&fr.friends||[]).forEach(f=>{let u=f.user;if(!u)return;friendIds.add(u.id);out.push({sec:"Amis",kind:"person",user:u,label:u.name,hint:"Ami"+(u.city?" · "+u.city:"")+(f.status?" · en sortie":""),keys:[u.city,"ami amis"],run:()=>ge("/profil/"+u.id)})});
    (fr&&fr.received||[]).forEach(f=>{let u=f.user;u&&out.push({sec:"Amis",kind:"person",user:u,label:u.name,hint:"Demande d’ami reçue",keys:["demande ami"],run:()=>ge("/amis")})});
    let ambs=amb&&(amb.ambassadors||amb)||[];Array.isArray(ambs)&&ambs.forEach(a=>out.push({sec:"Ambassadeurs",icon:"crown",label:a.name,hint:[a.handle,a.speciality].filter(Boolean).join(" · "),keys:[(a.tags||[]).join(" "),"ambassadeur youtube chaine"],run:()=>ge("/ambassadeurs/"+a.id)}));
    (amb&&amb.latest||[]).forEach(d=>d&&d.title&&out.push({sec:"Vidéos",icon:"play",label:d.title,hint:"Vidéo · "+(d.ambassadorName||""),keys:[d.ambassadorName,"video"],run:()=>ge("/ambassadeurs/"+d.ambassadorId)}));
    (Array.isArray(art)?art:[]).forEach(a=>out.push({sec:"Articles",icon:"book",label:a.title,hint:[a.topic,a.author&&a.author.name].filter(Boolean).join(" · "),keys:[a.summary,a.author&&a.author.name,a.activity,"article"],run:()=>ge("/articles/"+a.id)}));
    let recs=rec&&(rec.items||rec.recipes||rec);Array.isArray(recs)&&recs.forEach(r=>out.push({sec:"Recettes",icon:"chef",label:r.title,hint:[r.species,r.category].filter(Boolean).join(" · "),keys:[(r.ingredients||[]).map(i=>Array.isArray(i)?i[2]:i).join(" "),"recette"],run:()=>ge("/recettes/"+r.id)}));
    (Array.isArray(qa)?qa:[]).forEach(z=>out.push({sec:"Entraide",icon:"chat",label:z.title,hint:"Question"+(z.answers?" · "+M.plural(Array.isArray(z.answers)?z.answers.length:z.answers,"réponse","réponses"):""),keys:[z.body,z.activity,"question"],run:()=>{Pe.set("qa:tab","q"),ge("/questions")}}));
    (Array.isArray(grp)?grp:[]).forEach(g=>out.push({sec:"Entraide",icon:"users",label:g.name,hint:"Groupe local · "+g.department+" · "+M.plural(g.members||0,"membre","membres"),keys:[g.description,"groupe"],run:()=>{Pe.set("qa:tab","g"),ge("/groupes")}}));
    [...(spm||[]),...(spp||[])].forEach(s=>{if(!s||seenSp.has(s.id))return;seenSp.add(s.id);out.push({sec:"Spots",icon:"pin",label:s.name,hint:(s.userId===(w.user&&w.user.id)?"Mon spot":"Spot partagé")+(s.species?" · "+(Array.isArray(s.species)?s.species.join(", "):s.species):""),keys:[s.notes,s.type,"spot peche"],run:()=>{w.season!=="peche"&&an("peche"),ge("/spots")}})});
    (Array.isArray(lst)?lst:[]).forEach(l=>out.push({sec:"Bourse",icon:"swap",label:l.title,hint:"Annonce"+(l.city?" · "+l.city:""),keys:[l.description,l.category,"bourse annonce"],run:()=>ge("/bourse")}));
    (Array.isArray(dir)?dir:[]).forEach(d=>out.push({sec:"Annuaire",icon:"store",label:d.name,hint:[d.category,d.city].filter(Boolean).join(" · "),keys:[d.address,d.offer,"professionnel annuaire"],run:()=>ge("/annuaire")}));
    out.forEach(it=>it.hay=S3Norm([it.label,it.hint,...(it.keys||[])].filter(Boolean).join(" ")));
    S3Idx.data={items:out,friendIds},S3Idx.uid=w.user&&w.user.id,S3Idx.at=Date.now(),S3Idx.p=null;return S3Idx.data
  })().catch(()=>(S3Idx.p=null,{items:[],friendIds:new Set})))
}
var S3Order=["Actions","Amis","Personnes","Ambassadeurs","Vidéos","Articles","Entraide","Recettes","Spots","Bourse","Annuaire"];
function S3Palette(){
  if(S3.palette)return;let base=S3Items(),idx=null,people=[],peopleQ="",sel=0,shown=[],tm=null,reqN=0;
  let inp=e("input",{type:"search",placeholder:"Personne, ami, ambassadeur, article, page…","aria-label":"Rechercher",autocomplete:"off",spellcheck:!1}),
    list=e("div.palette-list",{role:"listbox"}),
    status=e("span.palette-status"),
    close=()=>{clearTimeout(tm),back.remove(),S3.palette=null,document.removeEventListener("keydown",key,!0)},
    pick=it=>{close(),setTimeout(()=>it.run(),0)},
    score=(it,q)=>{let l=S3Norm(it.label);return(l.startsWith(q[0])?4:0)+(l.split(/\s+/).some(wd=>wd.startsWith(q[0]))?2:0)+(it.sec==="Amis"?1:0)},
    icon=it=>it.kind==="person"?e("span.ic.pic",oe(it.user,34)):e("span.ic",b(it.icon||"search")),
    row=(it,i,q)=>e("button.palette-item",{type:"button",role:"option","aria-selected":String(i===sel),onclick:()=>pick(it),onmousemove:()=>{sel!==i&&(sel=i,mark())}},icon(it),e("div.grow",e("b",it.label),e("span",it.hint||(q?it.sec:""))),it.kind==="person"&&it.isFriend?L("Ami","ok"):null),
    draw=()=>{
      let raw=inp.value.trim(),q=S3Norm(raw).split(/\s+/).filter(Boolean);W(list);
      if(!q.length){shown=base;let last=null;
        base.forEach((it,i)=>{it.sec!==last&&(last=it.sec,list.append(e("div.palette-sec",it.sec))),list.append(row(it,i))});
        idx&&idx.items.some(x=>x.sec==="Amis")&&(list.prepend(e("div.palette-sec","Mes amis"),e("div.palette-chips",idx.items.filter(x=>x.sec==="Amis").slice(0,8).map(x=>e("button.palette-chip",{type:"button",onclick:()=>pick(x)},oe(x.user,24),x.label.split(" ")[0])))));
        status.textContent="";return}
      let pool=[...base,...(idx?idx.items:[]),...people.filter(p=>!(idx&&idx.friendIds.has(p.user.id)))];
      let hit=pool.filter(it=>{let h=it.hay||S3Norm(it.label+" "+it.sec+" "+(it.hint||""));return q.every(t=>h.includes(t))});
      let groups=new Map;hit.forEach(it=>{let s=S3Order.includes(it.sec)?it.sec:"Pages";groups.has(s)||groups.set(s,[]),groups.get(s).push(it)});
      let order=["Amis","Personnes","Pages","Actions","Ambassadeurs","Vidéos","Articles","Entraide","Recettes","Spots","Bourse","Annuaire"];
      shown=[];order.forEach(s=>{let g=groups.get(s);if(!g)return;g.sort((a,b2)=>score(b2,q)-score(a,q));let lim=s==="Pages"?6:5;g.slice(0,lim).forEach(it=>{it._sec=s,shown.push(it)})});
      sel=Math.min(sel,Math.max(0,shown.length-1));
      if(!shown.length){status.textContent="";list.append(e("div.palette-empty",idx?"Aucun résultat pour « "+raw+" ».":"Recherche en cours…"));return}
      let last=null;shown.forEach((it,i)=>{it._sec!==last&&(last=it._sec,list.append(e("div.palette-sec",it._sec))),list.append(row(it,i,!0))});
      status.textContent=hit.length>shown.length?"Meilleurs résultats":M.plural(shown.length,"résultat","résultats")
    },
    mark=()=>{list.querySelectorAll(".palette-item").forEach((x2,i)=>x2.setAttribute("aria-selected",String(i===sel)));let c=list.querySelectorAll(".palette-item")[sel];c&&c.scrollIntoView({block:"nearest"})},
    findPeople=()=>{let raw=inp.value.trim();if(raw.length<2){people=[],peopleQ="";return}if(raw===peopleQ)return;peopleQ=raw;let n=++reqN;
      v.get("/auth/users?q="+encodeURIComponent(raw)).then(us=>{if(n!==reqN)return;people=(us||[]).map(u=>{let f=idx&&idx.friendIds.has(u.id);return{sec:"Personnes",kind:"person",user:u,isFriend:f,label:u.name,hint:[{chasseur:"Chasseur",pecheur:"Pêcheur",mixte:"Chasseur & pêcheur",usager:"Usager de la nature"}[u.profile],u.city].filter(Boolean).join(" · "),hay:S3Norm(u.name+" "+(u.city||"")),run:()=>ge("/profil/"+u.id)}}),draw()}).catch(()=>{})},
    key=ev=>{if(ev.key==="Escape"){ev.preventDefault(),close()}else if(ev.key==="ArrowDown"){ev.preventDefault(),sel=Math.min(shown.length-1,sel+1),mark()}else if(ev.key==="ArrowUp"){ev.preventDefault(),sel=Math.max(0,sel-1),mark()}else if(ev.key==="Enter"&&document.activeElement===inp){ev.preventDefault(),shown[sel]&&pick(shown[sel])}};
  inp.addEventListener("input",()=>{sel=0,draw(),clearTimeout(tm),tm=setTimeout(findPeople,180)});
  let back=e("div.palette-back",{role:"dialog","aria-modal":"true","aria-label":"Recherche","onmousedown":ev=>{ev.target===back&&close()}},
    e("div.palette",e("label.palette-in",b("search"),inp,e("kbd","Échap")),list,e("div.palette-foot",e("span","↑ ↓ pour choisir"),e("span","Entrée pour ouvrir"),status)));
  document.body.append(back),S3.palette=back,document.addEventListener("keydown",key,!0),draw(),setTimeout(()=>inp.focus(),20);
  S3LoadIdx().then(d=>{idx=d,people.forEach(p=>p.isFriend=d.friendIds.has(p.user.id)),S3.palette&&draw()})
}

/* ----- Décor de page : sur-titre, titre de barre ----- */
function S3Deco(p){
  let f=S3Find(p),ph=Mt&&Mt.querySelector(".page-head .titles");
  if(ph&&f&&!ph.querySelector(".eyebrow")){let h1=ph.querySelector("h1");h1&&h1.before(e("div.eyebrow",f.group))}
  if(S3.title){let h=Mt&&Mt.querySelector(".page-head h1");S3.title.firstChild.textContent=f?f.label:h?h.textContent:"Chasse & Pêche 360°",S3.title.lastChild.textContent=f?f.group:""}
  document.title=(f?f.label+" · ":"")+"Chasse & Pêche 360°";
  try{S3PushInject(p)}catch{}
}
function S3Skel(){return e("div.page-skel",{"aria-busy":"true","aria-label":"Chargement"},e("i.skeleton",{style:{height:"14px",width:"90px"}}),e("i.skeleton",{style:{height:"38px",width:"min(360px,70%)"}}),e("i.skeleton",{style:{height:"120px"}}),e("i.skeleton",{style:{height:"220px"}}))}

/* ----- Chargements différés : carte (Leaflet) et données ----- */
function S3Script(src){return new Promise((ok,ko)=>{let s=document.createElement("script");s.src=src,s.async=!1,s.onload=ok,s.onerror=ko,document.head.append(s)})}
var S3MapFail=0;
function MapLib3(quiet){
  if(window.L&&window.L.map)return Promise.resolve(!0);
  return window.__mapLib||(window.__mapLib=(async()=>{try{await S3Script("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js")}catch(er){window.__mapLib=null;quiet||S3MapFail++||A("La bibliothèque de carte n’a pas pu se charger (bloqueur de contenu ou réseau) : les cartes ne s’afficheront pas.","err");return!1}try{await S3Script("https://cdn.jsdelivr.net/npm/leaflet-rotate@0.2.8/dist/leaflet-rotate-src.js")}catch{}return!0})())
}
window.cp360MapLib=MapLib3;
var S3NoMap=/^\/(communaute|ambassadeurs|articles|connexion|abonnement|recettes|salaison|notifications|questions|groupes|amis|messages|reglementation|profil|admin\/(tableau|utilisateurs|abonnements|articles|signalements|annonces|journal|partenaires|ambassadeurs))(\/|$)/;
var S3Data={},S3DataP={};
function Data3(id){return S3DataP[id]||(S3DataP[id]=fetch("data/"+id+".json").then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(d=>(S3Data[id]=d,d)).catch(er=>{delete S3DataP[id];throw er}))}
function Data3Sync(id){
  if(S3Data[id])return S3Data[id];
  let el=document.getElementById(id);if(el)return S3Data[id]=JSON.parse(el.textContent);
  try{let x2=new XMLHttpRequest;x2.open("GET","data/"+id+".json",!1),x2.send();if(x2.status>=200&&x2.status<300||x2.status===0&&x2.responseText)return S3Data[id]=JSON.parse(x2.responseText)}catch{}
  return{}
}
async function Need3(p){
  let w8=[];
  S3NoMap.test(p)||w8.push(MapLib3());
  p.startsWith("/reglementation")&&w8.push(Data3("d-regdept").catch(()=>{}),Data3("d-regnat").catch(()=>{}));
  p.startsWith("/chien-de-sang")&&w8.push(Data3("d-sang").catch(()=>{}));
  w8.length&&await Promise.race([Promise.all(w8),new Promise(r=>setTimeout(r,9000))])
}
function S3Idle(fn){(window.requestIdleCallback||(f=>setTimeout(f,1200)))(fn,{timeout:4000})}
window.addEventListener("load",()=>S3Idle(()=>{MapLib3(!0);setTimeout(()=>["d-regnat","d-regdept","d-sang"].forEach(id=>Data3(id).catch(()=>{})),2500)}));

/* ----- Observateur unique : mot de passe visible, tableaux qui débordent, clavier mobile ----- */
(function(){
  var O='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',X2='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.9 17.9A10.9 10.9 0 0 1 12 19c-7 0-11-7-11-7a19 19 0 0 1 5-5.7M9.9 5.2A10 10 0 0 1 12 5c7 0 11 7 11 7a19 19 0 0 1-2.2 3.2M1 1l22 22"/><path d="M14.1 14.1a3 3 0 0 1-4.2-4.2"/></svg>';
  function eye(i){if(i.dataset.eye)return;i.dataset.eye=1;var wr=document.createElement("span");wr.className="pw-wrap",i.parentNode.insertBefore(wr,i),wr.appendChild(i);var bt=document.createElement("button");bt.type="button",bt.className="pw-eye",bt.setAttribute("aria-label","Afficher le mot de passe"),bt.innerHTML=O,bt.addEventListener("click",function(ev){ev.preventDefault();var h=i.type==="password";i.type=h?"text":"password",bt.innerHTML=h?X2:O,bt.setAttribute("aria-label",h?"Masquer le mot de passe":"Afficher le mot de passe"),i.focus()}),wr.appendChild(bt)}
  var q=0;function run(){q=0;document.querySelectorAll("input[type=password]:not([data-eye])").forEach(eye);document.querySelectorAll(".table-wrap,.tabs").forEach(function(x3){x3.classList.toggle("more",x3.scrollWidth>x3.clientWidth+4&&x3.scrollLeft+x3.clientWidth<x3.scrollWidth-4)})}
  function sch(){q||(q=requestAnimationFrame(run))}
  function start(){new MutationObserver(function(ms){for(var i=0;i<ms.length;i++)if(ms[i].addedNodes.length){sch();return}}).observe(document.body,{childList:!0,subtree:!0}),sch()}
  document.body?start():document.addEventListener("DOMContentLoaded",start);
  addEventListener("resize",sch,{passive:!0});document.addEventListener("scroll",function(ev){ev.target&&ev.target.classList&&(ev.target.classList.contains("table-wrap")||ev.target.classList.contains("tabs"))&&sch()},{capture:!0,passive:!0});
  var vv=window.visualViewport;vv&&vv.addEventListener("resize",function(){document.documentElement.classList.toggle("kb-open",window.innerHeight-vv.height>150&&window.innerWidth<1024)});
})();

/* ----- Alertes sur le téléphone, même appli fermée (Web Push) ----- */
function S3IsIOS(){return/iPhone|iPad|iPod/.test(navigator.userAgent)||navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1}
function S3Standalone(){try{return!!navigator.standalone||matchMedia("(display-mode: standalone)").matches}catch{return!1}}
async function S3PushState(){
  let sb=window.cp360Sb,hosted=!!(sb&&sb.on&&sb.on());
  if(!hosted)return"artifact";
  if(!sb.session||!sb.session())return"nosession";
  if(S3IsIOS()&&!S3Standalone())return"ios-install";
  if(!("serviceWorker"in navigator)||!("PushManager"in window)||!("Notification"in window))return"unsupported";
  if(Notification.permission==="denied")return"denied";
  try{let reg=await Promise.race([navigator.serviceWorker.ready,new Promise(r=>setTimeout(()=>r(null),3e3))]),sub=reg&&await reg.pushManager.getSubscription();if(sub&&Notification.permission==="granted")return"on"}catch{}
  return"off"
}
var S3PushTxt={
  artifact:["Disponible dans l’appli installée","Les alertes appli fermée passent par la version installée sur votre téléphone (site de l’appli ajouté à l’écran d’accueil). Cet aperçu ne peut pas les recevoir."],
  nosession:["Connectez votre compte","Les alertes arrivent sur les comptes enregistrés. Connectez-vous avec votre adresse e-mail pour les activer."],
  "ios-install":["Ajoutez d’abord l’appli à l’écran d’accueil","Sur iPhone : touchez Partager puis « Sur l’écran d’accueil », ouvrez l’appli depuis son icône, puis revenez ici pour activer les alertes (iOS 16.4 ou plus récent)."],
  unsupported:["Non pris en charge sur ce navigateur","Utilisez Chrome, Edge, Firefox ou Safari récent pour recevoir les alertes."],
  denied:["Alertes bloquées","Vous avez refusé les notifications. Autorisez-les dans les réglages du navigateur pour ce site, puis revenez ici."],
  off:["Recevez les alertes, même appli fermée","SOS à proximité, début et fin de traque, messages et demandes d’ami s’affichent sur votre écran verrouillé."],
  on:["Alertes activées sur cet appareil","Vous recevrez les SOS, les traques, les messages et les demandes d’ami même quand l’appli est fermée."]
};
function S3PushCard(compact,known){
  let box=e("div.push-card",{"aria-live":"polite"},e("div.row",e("span.ic",b("bell")),e("div.grow",e("b","Alertes sur ce téléphone"),e("div.small.muted","Vérification…"))));
  let draw=async()=>{
    let st=known||await S3PushState();known=null;let[t,txt]=S3PushTxt[st],acts=[];
    if(compact&&!["off","ios-install","denied"].includes(st)){box.remove();return}
    st==="off"&&acts.push(x("Activer les alertes",{icon:"bell",kind:"primary",size:"sm",onClick:async ev=>{let bt=ev.currentTarget;bt.disabled=!0;try{await window.cp360Sb.enablePush()}finally{bt.disabled=!1,draw()}}}));
    st==="on"&&acts.push(x("Afficher une alerte d’essai",{icon:"bell",size:"sm",onClick:async()=>{try{let reg=await navigator.serviceWorker.ready;await reg.showNotification("Chasse & Pêche 360°",{body:"Les alertes fonctionnent sur cet appareil.",tag:"cp360-test",icon:"icon.svg",badge:"icon.svg",data:{link:"#/notifications"}});A("Alerte d’essai envoyée : regardez le haut de l’écran.")}catch{A("Impossible d’afficher l’alerte d’essai.","warn")}}}));
    st==="nosession"&&acts.push(x("Se connecter",{size:"sm",kind:"primary",href:"#/connexion"}));
    box.className="push-card "+st;
    B(box,e("div.row",{style:{alignItems:"flex-start"}},e("span.ic",b(st==="on"?"check":st==="denied"?"alert":"bell")),e("div.grow",e("b",t),compact&&st==="on"?null:e("div.small.muted",txt))),acts.length?e("div.push-acts",acts):null)
  };
  draw();return box
}
function S3PushNudge(){
  if(Pe.get("pushNudge",0)>Date.now())return null;
  let slot=e("div");
  S3PushState().then(st=>{if(st!=="off"&&st!=="ios-install")return;
    let card=S3PushCard(!0,st);card.classList.add("nudge");
    card.append(e("button.icon-btn.push-x",{type:"button","aria-label":"Plus tard",title:"Plus tard",onclick:()=>{Pe.set("pushNudge",Date.now()+7*864e5),slot.remove()}},b("close")));
    C(slot,card)});
  return slot
}
function S3PushInject(p){
  if(!Mt||!w.user)return;
  if(p==="/notifications"){let pg=Mt.querySelector(".page");if(pg&&!pg.querySelector(".push-card")){let h=pg.querySelector(".page-head");h&&h.after(S3PushCard())}
    Mt.querySelectorAll(".page-head .actions .btn").forEach(bt=>{/Activer les alertes/.test(bt.textContent)&&bt.remove()})}
  if(p==="/profil"){let pg=Mt.querySelector(".page");if(pg&&!pg.querySelector(".push-card")){let h=pg.querySelector(".page-head");h&&h.after(S3PushCard())}}
}
