/* ----- Espace ambassadeur (3.0) : publication de liens en lot, affichage sur la fiche publique ----- */
/* Un ambassadeur est un compte relié à une fiche (table ambassador_links, gérée par l’admin).
   Il publie ses liens d’un coup (table amb_posts) ; la fiche publique les affiche aussitôt. */
var S3Amb={uid:null,id:null,checked:!1,routed:!1};
var S3AmbRe=/^https:\/\/(www\.)?(instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+|youtube\.com\/watch\?v=[A-Za-z0-9_-]+|youtu\.be\/[A-Za-z0-9_-]+)/;
function S3Sb(method,path,body,extra){
  try{return window.cp360Sb.rest(method,path,body,extra)}catch{return Promise.resolve({ok:!1,status:0,json:null})}
}
function S3AmbParse(txt){
  return txt.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).map(l=>{
    let[a,...r]=l.split("|"),url=a.trim().split(/\s+/)[0]||"";
    url=url.replace(/[?&](igsh|si|utm_[a-z]+)=[^&]*/g,"").replace(/[?&]$/,"");
    return{url,title:r.join("|").trim(),ok:S3AmbRe.test(url)}
  })
}
/* Routes 3.0 enregistrées tôt (avant la première navigation), au format attendu par le routeur : module {default} */
var S3Routes=!1;
function S3EarlyRoutes(){
  if(S3Routes)return;S3Routes=!0;
  Z("/espace-ambassadeur",()=>Promise.resolve({default:t=>S3AmbPage(t)}));
  Z("/mentions-legales",()=>Promise.resolve({default:t=>S3LegalPage(t)}));
  Z("/cgu",()=>Promise.resolve({default:t=>S3CguPage(t)}));
  Z("/confidentialite",()=>Promise.resolve({default:t=>S3PrivPage(t)}));
  Z("/aide",()=>Promise.resolve({default:t=>S3HelpPage(t)}));
  Z("/charte-ambassadeur",()=>Promise.resolve({default:t=>S3CharterPage(t)}));
  try{S3ShRegister()}catch{}
  try{A30DeskRoutes()}catch{}
  Z("/admin/annuaire",()=>Promise.resolve({default:t=>S3PartDirPage(t)}));
  Z("/admin/emplacements",()=>Promise.resolve({default:t=>S3PartPlacePage(t)}));
  Z("/admin/fonctions",()=>Promise.resolve({default:t=>S3FeatPage(t)}));
  try{S3FeatLoad()}catch{}
  try{["/admin/annuaire","/admin/emplacements","/admin/fonctions"].forEach(p=>{let i=Jr.findIndex(r=>r.pattern===p);if(i>0)Jr.unshift(Jr.splice(i,1)[0])})}catch{}
}
async function S3AmbCheck(){
  if(!w.user||!window.cp360Sb||!window.cp360Sb.on||!window.cp360Sb.on()){S3Amb.id=null;return null}
  if(S3Amb.uid===w.user.id&&S3Amb.checked)return S3Amb.id;
  if(S3Amb.uid===w.user.id&&S3Amb.p)return S3Amb.p;
  S3Amb.uid=w.user.id;S3Amb.id=null;
  S3Amb.p=S3Sb("GET","ambassador_links?select=ambassador_id,ambassador_name&user_id=eq."+encodeURIComponent(w.user.id)).then(r=>{
    let row=r&&r.ok&&Array.isArray(r.json)&&r.json[0];
    S3Amb.checked=!!(r&&r.ok);S3Amb.id=row?row.ambassador_id:null;S3Amb.name=row?row.ambassador_name:null;S3Amb.p=null;
    return S3Amb.id;
  }).catch(()=>{S3Amb.p=null;return null});
  return S3Amb.p;
}
async function S3AmbBoot(){
  S3AmbFiches().catch(()=>{});
  S3EarlyRoutes();
  let id=await S3AmbCheck();
  if(id){S3AmbMenu();S3AmbHideShorts()}
}
function S3AmbRoute(){S3EarlyRoutes()}
/* Compte ambassadeur : pas d’entrée « Vidéos courtes » dans le menu (elle est dans Mon espace ambassadeur) */
function S3AmbHideShorts(){
  document.querySelectorAll('#mainmenu [data-path="/courts"]').forEach(l=>{let g=l.closest(".nav-group");(g&&g.querySelectorAll(".nav-link").length===1?g:l).remove()});
}
function S3AmbMenu(){
  let sb=document.querySelector("#mainmenu .sb-scroll");
  if(!sb||sb.querySelector('[data-path="/espace-ambassadeur"]'))return;
  let key="navg:Ambassadeur",closed=Pe.get(key,0)===1,items=e("div.nav-items");
  let head=e("button.nav-group-h",{type:"button","aria-expanded":String(!closed),onclick:()=>{let c=grp.classList.toggle("closed");head.setAttribute("aria-expanded",String(!c));Pe.set(key,c?1:0)}},e("span","Ambassadeur"),b("chevron"));
  let grp=e("div.nav-group"+(closed?".closed":""),head,items);
  items.append(e("a.nav-link",{href:"#/espace-ambassadeur",title:"Mon espace ambassadeur",dataset:{path:"/espace-ambassadeur"}},b("play"),e("span","Mon espace ambassadeur")));
  sb.append(grp);
}
/* Ma fiche : l’ambassadeur complète lui-même sa fiche publique (champs autorisés seulement) */
function S3AmbFicheBox(id){
  const st={minHeight:"var(--touch)",padding:"0 12px",borderRadius:"var(--r-sm)",border:"1px solid var(--line-strong)",background:"var(--surface)",color:"inherit",width:"100%",boxSizing:"border-box"};
  let a=(window.__ambDb||[]).find(x2=>x2.id===id)||{};
  let f={speciality:e("input",{type:"text",maxLength:140,style:st,value:a.speciality||"",id:"af-sp"}),
         channelUrl:e("input",{type:"url",maxLength:200,placeholder:"https://www.youtube.com/@…",style:st,value:a.channelUrl||"",id:"af-ch"}),
         handle:e("input",{type:"text",maxLength:60,placeholder:"@pseudo Instagram",style:st,value:a.handle||"",id:"af-ha"}),
         season:e("select",{style:{...st,padding:"0 10px"},id:"af-se"},e("option",{value:"chasse"},"Chasse"),e("option",{value:"peche"},"Pêche"),e("option",{value:"both"},"Chasse et pêche")),
         tags:e("input",{type:"text",maxLength:200,placeholder:"Séparés par des virgules",style:st,value:Array.isArray(a.tags)?a.tags.join(", "):"",id:"af-ta"}),
         bio:e("textarea",{rows:5,maxLength:800,style:{...st,padding:"10px 12px"},id:"af-bi"},a.bio||"")};
  f.season.value=a.season||"chasse";
  let msg=e("p.tiny.muted",{role:"status",style:{margin:"6px 0 0"}});
  let fld=(lab,el,hint)=>e("div.field",e("label",{for:el.id},lab),el,hint?e("span.hint",hint):null);
  let save=x("Enregistrer ma fiche",{kind:"primary",size:"block",onClick:async()=>{
    let url=f.channelUrl.value.trim();
    if(url&&!/^https:\/\//.test(url)){msg.textContent="Le lien de la chaîne doit commencer par https://";return}
    save.disabled=!0;msg.textContent="Enregistrement…";
    let r=await S3Sb("POST","rpc/update_my_amb_fiche",{patch:{speciality:f.speciality.value.trim(),channelUrl:url||null,handle:f.handle.value.trim()||null,season:f.season.value,
      tags:f.tags.value.split(",").map(t=>t.trim()).filter(Boolean).slice(0,12),bio:f.bio.value.trim()}});
    save.disabled=!1;
    if(r&&r.ok){msg.textContent="Fiche mise à jour : elle est visible tout de suite.";A("Fiche enregistrée.","ok");S3AmbFiches().then(()=>{S3Amb.prevEl&&S3AmbPreview(S3Amb.prevEl,id)}).catch(()=>{})}
    else msg.textContent="Enregistrement impossible. Réessayez ou reconnectez-vous.";
  }});
  return e("div.stack",{style:{gap:"10px"}},
    fld("Spécialité",f.speciality,"Ex. : battues au sanglier, pêche des carnassiers"),
    fld("Chaîne YouTube",f.channelUrl),fld("Instagram",f.handle),fld("Saison",f.season),fld("Thèmes",f.tags),fld("Présentation",f.bio),save,msg);
}
async function S3AmbPage(t){
  let head=(sub,acts)=>q({title:"Mon espace ambassadeur",subtitle:sub,actions:acts||[]});
  if(!w.user){C(t,head("Réservé aux ambassadeurs."),V({icon:"user",title:"Connectez-vous",text:"Connectez-vous avec votre compte ambassadeur pour ouvrir votre espace."}));return}
  C(t,head("Chargement…"));
  let id=await S3AmbCheck();
  W(t);
  if(!id){
    let adm=S3Adm(w.user);
    C(t,head(adm?"Vous êtes administrateur, sans fiche d’ambassadeur.":"Cet espace est réservé aux ambassadeurs.",adm?[x("Gérer les ambassadeurs",{icon:"crown",kind:"primary",href:"#/admin/ambassadeurs"})]:[]),
      V({icon:"crown",title:adm?"Aucune fiche reliée à votre compte":"Espace réservé",text:adm?"Pour donner ce statut à quelqu’un : Admin › Utilisateurs, colonne Rôle, choisissez « Ambassadeur ».":"Cet espace est ouvert aux ambassadeurs choisis par l’équipe 360°. Contactez-nous pour en faire partie."}));
    return;
  }
  try{await S3AmbFiches()}catch{}
  let fiche=(window.__ambDb||[]).find(x2=>x2.id===id)||{},name=fiche.name||S3Amb.name||"Ma fiche";
  let ta=e("textarea",{id:"amb-bulk",rows:6,"aria-label":"Liens de publications, un par ligne",placeholder:"https://www.instagram.com/p/…\nhttps://www.youtube.com/watch?v=… | Titre facultatif",style:{width:"100%",boxSizing:"border-box"}}),
      msg=e("p.small.muted",{role:"status","aria-live":"polite",style:{margin:"8px 0 0"}}),
      list=e("div.list"),
      go=x("Publier ces liens",{icon:"check",kind:"primary",size:"block",onClick:async()=>{
        let rows=S3AmbParse(ta.value),good=rows.filter(r=>r.ok);
        if(!rows.length){msg.textContent="Collez au moins un lien.";return}
        if(!good.length){msg.textContent="Aucun lien valide : il faut un lien de publication Instagram (/p/ ou /reel/) ou YouTube (watch?v=).";return}
        go.disabled=!0;
        let today=new Date().toISOString().slice(0,10),
            r=await S3Sb("POST","amb_posts",good.map(g=>({ambassador_id:id,url:g.url,title:g.title,published_on:today})),{Prefer:"resolution=ignore-duplicates,return=representation"});
        go.disabled=!1;
        if(!r.ok){msg.textContent=r.status===401||r.status===403?"Votre session a expiré : reconnectez-vous.":"Publication impossible pour le moment. Réessayez.";A("Publication impossible.","warn");return}
        let added=Array.isArray(r.json)?r.json.length:good.length,dup=good.length-added,bad=rows.length-good.length;
        msg.textContent=added+" publication(s) mise(s) en ligne"+(dup?", "+dup+" déjà présente(s)":"")+(bad?", "+bad+" ignorée(s) : lien non reconnu":"")+".";
        A(added?added+" publication(s) en ligne.":"Ces liens étaient déjà publiés.",added?"ok":"warn");
        ta.value="";S3AmbList(list,id);
      }});
  let quick=e("div.stack",{style:{gap:"10px"}},
    e("p.small.muted",{style:{margin:0}},"Après chaque publication, l’appli vous propose de la partager sur Instagram ou Facebook (le texte est copié, il ne reste qu’à le coller)."),
    e("div.row.wrap",{style:{gap:"8px"}},
      x("Publier dans le fil",{icon:"send",kind:"primary",onClick:()=>S3FeedCompose()}),
      x("Publier une vidéo courte",{icon:"play",kind:"ghost",onClick:()=>S3ShCompose()})));
  let prev=e("div.amb-prev");S3AmbPreview(prev,id);S3Amb.prevEl=prev;
  C(t,head("Fiche : "+name),
    e("div.grid.g-main",
      e("div.stack",
        k({title:"Mon code ambassadeur",sub:"vos avantages et votre code à partager"},S3AmbCodeBox()),
        k({title:"Mes statistiques",sub:"abonnés, publications, partages"},S3AmbStatsBox()),
        k({title:"Publier"},quick),
        k({title:"Ajouter des liens à ma fiche",sub:"Instagram ou YouTube, en lot"},e("div.field",e("label",{for:"amb-bulk"},"Liens, un par ligne"),ta),e("p.tiny.muted",{style:{margin:"0 0 10px"}},"Dans Instagram : « … » puis « Copier le lien ». Pour un titre, ajoutez « | » puis le titre après le lien."),go,msg)),
      e("div.stack",
        k({title:"Aperçu de ma fiche",sub:"ce que voient les membres"},prev),
        k({title:"Modifier ma fiche"},S3AmbFicheBox(id)),
        k({title:"Mes liens publiés",sub:"sur ma fiche publique"},list))));
  S3AmbList(list,id);
}
/* Code personnel : tarif Fondateurs pour les personnes qui s’inscrivent avec, compteur d’inscrits */
function S3AmbCodeBox(){
  let box=e("div.stack.amb-code",{style:{gap:"10px"}},e("p.small.muted",{style:{margin:0}},"Chargement…"));
  S3AmbCodeFill(box);
  return box;
}
function S3AmbCodeFill(box){
  S3Sb("POST","rpc/my_amb_code",{}).then(r=>{
    W(box);
    let c=r&&r.ok&&r.json;
    box.append(e("div.row",{style:{gap:"10px",alignItems:"center",flexWrap:"wrap"}},e("span.launch-chip.pio","Combo 360° offert"),e("span.small","tant que vous êtes ambassadeur")));
    if(!c||!c.code){box.append(e("p.small.muted",{style:{margin:0}},"Votre code est en préparation. Revenez dans un instant."));return}
    let url=S3FlyUrl(c.code);
    box.append(
      e("div.amb-code-row",e("code",c.code),e("span.small",(c.signups||0)+" inscrit"+((c.signups||0)>1?"s":"")+" avec votre code")),
      e("div.row.wrap",{style:{gap:"8px"}},
        x("Créer un visuel avec QR code",{icon:"camera",kind:"primary",onClick:()=>S3AmbFlyer(c.code,(S3Amb&&S3Amb.name)||(w.user&&w.user.name)||"")}),
        x("Choisir mon code",{kind:"ghost",onClick:async()=>{let nc=await S3AmbMyCodeDlg(c.code);if(nc){W(box);box.append(e("p.small.muted",{style:{margin:0}},"Chargement…"));S3AmbCodeFill(box)}}})),
      e("p.small",{style:{margin:0}},"Les personnes qui s’inscrivent avec votre code ont le tarif Fondateurs, même quand les 500 places sont parties."),
      e("div.row.wrap",{style:{gap:"8px"}},
        x("Partager mon lien",{icon:"send",kind:"ghost",onClick:async()=>{
          let res=await S3ShareData({text:"Rejoins-moi sur Chasse & Pêche 360°, l’appli des chasseurs et des pêcheurs. Avec mon code "+c.code+" tu as le tarif Fondateurs :",url,title:"Chasse & Pêche 360°"});
          if(res==="copied")A("Lien copié : collez-le dans un message ou en bio.","ok");
        }}),
        x("Copier le lien",{kind:"ghost",onClick:async()=>{try{await navigator.clipboard.writeText(url);A("Lien copié.","ok")}catch{A(url,"info")}}})),
      e("p.tiny.muted",{style:{margin:0}},"Rappel : le Combo offert est un avantage. Quand vous parlez de l’appli sur vos réseaux, indiquez « Collaboration commerciale » ou « Partenariat » (loi du 9 juin 2023 sur l’influence commerciale). ",e("a",{href:"#/charte-ambassadeur"},"Lire la charte ambassadeur"),"."));
  }).catch(()=>{W(box);box.append(e("p.small.muted",{style:{margin:0}},"Code indisponible pour le moment."))});
}
async function S3AmbList(list,id){
  let r=await S3Sb("GET","amb_posts?ambassador_id=eq."+encodeURIComponent(id)+"&select=id,url,title,published_on&order=created_at.desc&limit=300");
  W(list);
  let rows=r&&r.ok&&Array.isArray(r.json)?r.json:[];
  if(!rows.length){C(list,e("p.muted",{style:{margin:0}},"Aucune publication pour le moment."));return}
  rows.forEach(p=>C(list,e("div.list-row",
    e("span.ic",b(/youtube|youtu\.be/.test(p.url)?"play":"camera")),
    e("div.grow",e("div.t",p.title||"Publication"),e("div.s",(p.published_on||"")+" · "+p.url.replace(/^https:\/\/(www\.)?/,"").slice(0,48))),
    x("Supprimer",{size:"sm",kind:"ghost",onClick:async()=>{
      if(!(await ve({title:"Supprimer cette publication ?",text:"Elle disparaîtra de votre fiche publique.",confirm:"Supprimer"})))return;
      let d=await S3Sb("DELETE","amb_posts?id=eq."+encodeURIComponent(p.id));
      d.ok?(A("Publication supprimée."),S3AmbList(list,id)):A("Suppression impossible.","warn")
    }}))));
}
async function S3AmbInject(p){
  if(p==="/admin/ambassadeurs"){
    if(!S3Adm(w.user))return;
    let pg=Mt&&Mt.querySelector(".page");
    if(!pg||pg.querySelector(".amb-admin"))return;
    let box=await S3AmbAdminBox();
    if(location.hash.split("?")[0]!==p)return;
    let h=pg.querySelector(".page-head");
    h?h.after(box):pg.prepend(box);
    return;
  }
  if(!p.startsWith("/ambassadeurs/"))return;
  let id=decodeURIComponent(p.split("/")[2]||"");
  if(!id)return;
  let r=await S3Sb("GET","amb_posts?ambassador_id=eq."+encodeURIComponent(id)+"&select=url,title,published_on&order=published_on.desc,created_at.desc&limit=50");
  if(!(r&&r.ok&&Array.isArray(r.json)&&r.json.length))return;
  if(location.hash.split("?")[0]!==p)return;
  let pg=Mt&&Mt.querySelector(".page");
  if(!pg||pg.querySelector(".amb-extra"))return;
  let box=k({title:"Publications ajoutées par l’ambassadeur",sub:"liens vers les publications"},e("div.list",r.json.map(x2=>e("a.list-row",{href:x2.url,target:"_blank",rel:"noopener"},e("span.ic",b(/youtube|youtu\.be/.test(x2.url)?"play":"camera")),e("div.grow",e("div.t",x2.title||"Publication"),e("div.s",x2.published_on||"")),e("div.end",b("chevron"))))));
  box.classList.add("amb-extra");
  pg.append(box);
}

/* ----- Fiches ambassadeur : lues dans la table ambassadors (base partagée) ----- */
async function S3AmbFiches(){
  let r=await S3Sb("GET","ambassadors?select=id,data&deleted_at=is.null&order=created_at.asc&limit=500");
  if(r&&r.ok&&Array.isArray(r.json))window.__ambDb=r.json.map(x=>({...(x.data||{}),id:x.id}));
  return window.__ambDb||[];
}
function S3AmbSlug(t){
  return String(t||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40)||"ambassadeur";
}

/* ----- Admin : fiches ambassadeur, puis statut ambassadeur d’un compte ----- */
async function S3AmbAdminBox(){
  let fiches=await S3AmbFiches(),arr=fiches;
  const inputStyle={minHeight:"var(--touch)",padding:"0 12px",borderRadius:"var(--r-sm)",border:"1px solid var(--line-strong)",background:"var(--surface)",color:"inherit",width:"100%"};
  let pick=e("select.field-select",{"aria-label":"Fiche ambassadeur",style:{...inputStyle,padding:"0 10px"}},
    e("option",{value:"__new"},"Créer une fiche au nom de la personne"),arr.map(a=>e("option",{value:a.id},a.name||a.id)));
  let q=e("input",{type:"search",placeholder:"Nom de la personne (2 lettres minimum)","aria-label":"Chercher une personne",autocomplete:"off",style:inputStyle}),
      found=e("div.list"),linked=e("div.list"),msg=e("p.tiny.muted",{role:"status",style:{margin:"6px 0 0"}});
  let tm=null;
  /* --- formulaire fiche : créer ou modifier --- */
  let edit=e("select.field-select",{"aria-label":"Fiche à modifier",style:{...inputStyle,padding:"0 10px"}},e("option",{value:""},"+ Nouvelle fiche"),arr.map(a=>e("option",{value:a.id},a.name||a.id)));
  let f={name:e("input",{type:"text",maxLength:80,style:inputStyle,"aria-label":"Nom"}),
         handle:e("input",{type:"text",maxLength:60,placeholder:"@pseudo (facultatif)",style:inputStyle,"aria-label":"Pseudo"}),
         channelUrl:e("input",{type:"url",placeholder:"https://www.youtube.com/@…",style:inputStyle,"aria-label":"Chaîne"}),
         season:e("select",{"aria-label":"Saison",style:{...inputStyle,padding:"0 10px"}},e("option",{value:"chasse"},"Chasse"),e("option",{value:"peche"},"Pêche"),e("option",{value:"both"},"Chasse et pêche")),
         speciality:e("input",{type:"text",maxLength:140,style:inputStyle,"aria-label":"Spécialité"}),
         tags:e("input",{type:"text",maxLength:200,placeholder:"Séparés par des virgules",style:inputStyle,"aria-label":"Thèmes"}),
         bio:e("textarea",{rows:4,maxLength:800,style:{...inputStyle,padding:"10px 12px"},"aria-label":"Présentation"})};
  let fmsg=e("p.tiny.muted",{role:"status",style:{margin:"6px 0 0"}});
  const fill=(a)=>{
    f.name.value=a?a.name||"":"";f.handle.value=a&&a.handle||"";f.channelUrl.value=a&&a.channelUrl||"";
    f.season.value=a&&a.season||"chasse";f.speciality.value=a&&a.speciality||"";f.tags.value=a&&Array.isArray(a.tags)?a.tags.join(", "):"";f.bio.value=a&&a.bio||"";
  };
  edit.addEventListener("change",()=>fill(arr.find(a=>a.id===edit.value)||null));
  fill(null);
  const refreshPick=(selId)=>{
    W(pick);W(edit);
    C(edit,e("option",{value:""},"+ Nouvelle fiche"));
    arr.forEach(a=>{C(pick,e("option",{value:a.id},a.name||a.id));C(edit,e("option",{value:a.id},a.name||a.id))});
    pick.prepend(e("option",{value:"__new"},"Créer une fiche au nom de la personne"));
    if(selId){pick.value=selId;edit.value=selId}
  };
  let save=x("Enregistrer la fiche",{kind:"primary",size:"block",onClick:async()=>{
    let name=f.name.value.trim(),url=f.channelUrl.value.trim();
    if(name.length<2){fmsg.textContent="Indiquez au moins le nom de l’ambassadeur.";return}
    if(url&&!/^https:\/\//.test(url)){fmsg.textContent="Le lien de la chaîne doit commencer par https://";return}
    let existing=edit.value?arr.find(a=>a.id===edit.value):null,
        id=existing?existing.id:"amb_"+S3AmbSlug(name)+"_"+Date.now().toString(36),
        data={...(existing||{}),id,real:!0,name,handle:f.handle.value.trim()||null,channelUrl:url||null,season:f.season.value,speciality:f.speciality.value.trim(),
              tags:f.tags.value.split(",").map(t=>t.trim()).filter(Boolean).slice(0,12),bio:f.bio.value.trim(),videos:existing&&Array.isArray(existing.videos)?existing.videos:[]};
    save.disabled=!0;
    let r=await S3Sb("POST","ambassadors?on_conflict=id",{id,data},{Prefer:"resolution=merge-duplicates,return=minimal"});
    save.disabled=!1;
    if(!r.ok){fmsg.textContent="Enregistrement impossible : "+(r.status===401||r.status===403?"vous n’êtes pas administrateur ou la session a expiré.":"vérifiez la base.");return}
    arr=await S3AmbFiches();
    refreshPick(id);fill(arr.find(a=>a.id===id));
    fmsg.textContent="Fiche enregistrée : elle est visible dans la liste des ambassadeurs.";
    A("Fiche enregistrée.","ok");
  }});
  const loadLinks=async()=>{
    let [r,rc,rs]=await Promise.all([S3Sb("GET","ambassador_links?select=user_id,user_name,ambassador_id,ambassador_name&order=created_at.desc"),S3Sb("GET","amb_codes?select=code,amb_id"),S3Sb("GET","users?select=data->>referredBy&data->>referredBy=not.is.null")]);
    W(linked);
    let rows=r&&r.ok&&Array.isArray(r.json)?r.json:null;
    let codes=new Map(rc&&rc.ok&&Array.isArray(rc.json)?rc.json.map(c=>[c.amb_id,c.code]):[]),cnt={};
    (rs&&rs.ok&&Array.isArray(rs.json)?rs.json:[]).forEach(u=>{let k2=u.referredBy;if(k2)cnt[k2]=(cnt[k2]||0)+1});
    if(!rows){C(linked,e("p.muted",{style:{margin:0}},"Liste indisponible."));return}
    if(!rows.length){C(linked,e("p.muted",{style:{margin:0}},"Aucun compte ambassadeur pour le moment."));return}
    rows.forEach(l=>C(linked,e("div.list-row",
      e("span.ic",b("user")),
      e("div.grow",e("div.t",l.user_name||"Compte sans nom"),e("div.s","Fiche : "+(l.ambassador_name||l.ambassador_id)+" · Combo offert · code "+(codes.get(l.ambassador_id)||"—")+" · "+(cnt[l.ambassador_id]||0)+" inscrit(s)")),
      x("Code",{size:"sm",kind:"ghost",onClick:()=>S3AmbCodeDlg(l.ambassador_id,codes.get(l.ambassador_id)||"").then(c=>{if(c)loadLinks()})}),
      x("Retirer",{size:"sm",kind:"ghost",onClick:async()=>{
        if(!(await ve({title:"Retirer le statut ambassadeur ?",text:"Cette personne ne pourra plus publier sur la fiche, et son Combo offert s’arrête (elle revient à son offre d’avant).",confirm:"Retirer"})))return;
        let d=await S3Sb("DELETE","ambassador_links?user_id=eq."+encodeURIComponent(l.user_id));
        d.ok?(A("Statut retiré."),loadLinks()):A("Suppression impossible.","warn")
      }}))));
  };
  const search=async()=>{
    let s=q.value.trim();
    W(found);
    if(s.length<2)return;
    let us=[];
    try{let r=await v.get("/auth/users?q="+encodeURIComponent(s));us=Array.isArray(r)?r:(r&&r.users)||[]}catch{}
    if(!us.length){C(found,e("p.muted",{style:{margin:0}},"Aucune personne trouvée."));return}
    us.slice(0,8).forEach(u=>C(found,e("div.list-row",
      oe(u,34),
      e("div.grow",e("div.t",u.name||"Sans nom"),e("div.s",u.city||"")),
      x("Rendre ambassadeur",{size:"sm",kind:"primary",onClick:async()=>{
        let fid=pick.value,fname=pick.options[pick.selectedIndex]?pick.options[pick.selectedIndex].textContent:"";
        let r={ok:!1,status:0};
        try{if(fid==="__new"||!fid){let f=await S3AmbCreateFor(u);fid=f.id;fname=f.name;arr=await S3AmbFiches();refreshPick()}await S3AmbLink(u,fid,fname);r={ok:!0}}catch(er){r={ok:!1,status:/administrateur/.test(er.message)?403:0}}
        if(r.ok){A(u.name+" est maintenant ambassadeur."),msg.textContent="Enregistré. La personne verra son espace au prochain chargement de l’appli.";loadLinks()}
        else A("Enregistrement impossible : "+(r.status===401||r.status===403?"vous n’êtes pas administrateur ou la session a expiré.":"vérifiez la base."),"warn")
      }}))));
  };
  q.addEventListener("input",()=>{clearTimeout(tm);tm=setTimeout(search,250)});
  loadLinks();
  return e("div.card.amb-admin",
    e("h3",{style:{margin:"0 0 4px"}},"Fiches ambassadeur"),
    e("p.tiny.muted",{style:{margin:"0 0 12px"}},"Créez une fiche pour une nouvelle personne, ou modifiez une fiche existante. Les fiches enregistrées apparaissent aussitôt dans la liste publique."),
    e("div.stack",
      e("div.field",e("label","Fiche"),edit),
      e("div.field",e("label","Nom"),f.name),
      e("div.grid.g-2",e("div.field",e("label","Pseudo"),f.handle),e("div.field",e("label","Saison"),f.season)),
      e("div.field",e("label","Lien de la chaîne"),f.channelUrl),
      e("div.field",e("label","Spécialité"),f.speciality),
      e("div.field",e("label","Thèmes"),f.tags),
      e("div.field",e("label","Présentation"),f.bio),
      save,fmsg),
    e("h3",{style:{margin:"18px 0 4px",fontSize:"16px"}},"Donner le statut ambassadeur"),
    e("p.tiny.muted",{style:{margin:"0 0 12px"}},"Donne le statut ambassadeur à un compte existant et le relie à une fiche. Il pourra ensuite publier ses liens en lot."),
    e("div.stack",
      e("div.field",e("label","Fiche d’ambassadeur"),pick),
      e("div.field",e("label","Personne"),q),
      found,msg,
      e("h3",{style:{margin:"14px 0 6px",fontSize:"16px"}},"Ambassadeurs actuels"),
      linked));
}

/* ----- Admin : faire d’un utilisateur un ambassadeur en un geste (liste des utilisateurs ou page Ambassadeurs) ----- */
async function S3AmbCreateFor(u){
  let name=(u.name||"").trim()||"Ambassadeur",
      id="amb_"+S3AmbSlug(name)+"_"+Date.now().toString(36),
      season=u.profile==="pecheur"?"peche":u.profile==="chasseur"?"chasse":"both",
      data={id,real:!0,name,handle:null,channelUrl:null,season,speciality:"",tags:[],bio:"",videos:[]};
  let r=await S3Sb("POST","ambassadors?on_conflict=id",{id,data},{Prefer:"resolution=merge-duplicates,return=minimal"});
  if(!r.ok)throw new Error(r.status===401||r.status===403?"Vous n’êtes pas administrateur ou la session a expiré.":"Création de la fiche impossible.");
  try{await S3AmbFiches()}catch{}
  return {id,name};
}
async function S3AmbLink(u,fid,fname){
  let r=await S3Sb("POST","ambassador_links?on_conflict=user_id",{user_id:u.id,user_name:u.name||"",ambassador_id:fid,ambassador_name:fname},{Prefer:"resolution=merge-duplicates,return=minimal"});
  if(!r.ok)throw new Error(r.status===401||r.status===403?"Vous n’êtes pas administrateur ou la session a expiré.":"Enregistrement impossible.");
  try{let set=await S3AmbUsers();set.add(u.id)}catch{}
}
function S3AmbCodeDlg(ambId,cur){
  return new Promise(done=>{
    let inp=e("input.input",{type:"text",value:cur,maxLength:16,autocomplete:"off","aria-label":"Code ambassadeur",style:{textTransform:"uppercase"}}),
        msg=e("p.small.muted",{role:"status",style:{margin:0}},"4 à 16 lettres ou chiffres, sans espace. Ex. : FLORIAN, CHASSEHD."),res=null,dlg;
    let go=x("Enregistrer",{kind:"primary",onClick:async()=>{
      go.disabled=!0;
      let r=await S3Sb("POST","rpc/set_amb_code",{p_amb:ambId,p_code:inp.value});
      go.disabled=!1;
      if(!r.ok){msg.textContent=(r.json&&r.json.message)||"Enregistrement impossible.";return}
      res=r.json;dlg.close();A("Code enregistré : "+res,"ok");
    }});
    dlg=Le({title:"Code ambassadeur",body:e("div.stack",e("div.field",e("label","Code"),inp),msg),actions:[x("Annuler",{kind:"ghost",onClick:()=>dlg.close()}),go],onClose:()=>done(res)});
  });
}
function S3AmbMakeDlg(u){
  return new Promise(async done=>{
    let fiches=[];try{fiches=await S3AmbFiches()}catch{}
    let sel=e("select.input",{"aria-label":"Fiche ambassadeur"},
      e("option",{value:"__new"},"Créer une fiche au nom de "+(u.name||"cette personne")),
      fiches.map(a=>e("option",{value:a.id},"Relier à la fiche existante : "+(a.name||a.id))));
    let msg=e("p.small.muted",{role:"status",style:{margin:0}}),ok=false,dlg;
    let go=x("Rendre ambassadeur",{kind:"primary",onClick:async()=>{
      go.disabled=!0;msg.textContent="Enregistrement…";
      try{
        let f=sel.value==="__new"?await S3AmbCreateFor(u):{id:sel.value,name:(fiches.find(a=>a.id===sel.value)||{}).name||sel.value};
        await S3AmbLink(u,f.id,f.name);
        ok=true;dlg.close();
        A((u.name||"La personne")+" est maintenant ambassadeur. Sa fiche se complète dans Admin › Ambassadeurs.","ok");
      }catch(er){msg.textContent=er.message;go.disabled=!1}
    }});
    dlg=Le({title:"Rendre ambassadeur",body:e("div.stack",
      e("p",{style:{margin:0}},(u.name||"Cette personne")+" gardera tout le reste de l’appli et aura en plus son espace ambassadeur, un badge sur ses publications, ses statistiques, le Combo 360° offert tant qu’il est ambassadeur et un code personnel à partager."),
      e("div.field",e("label","Fiche publique"),sel),msg),
      actions:[x("Annuler",{kind:"ghost",onClick:()=>dlg.close()}),go],onClose:()=>done(ok)});
  });
}
async function S3RoleChange(u,val,selEl){
  let set=await S3AmbUsers(),was=set.has(u.id),prev=was?"ambassador":(u.role==="moderator"?"moderator":"user");
  if(val==="ambassador"){
    if(was)return true;
    let ok=await S3AmbMakeDlg(u);
    if(!ok&&selEl)selEl.value=prev;
    return true;
  }
  if(was){
    let yes=await ve({title:"Retirer le statut ambassadeur ?",text:"La fiche publique reste en place, mais cette personne ne pourra plus publier dessus et son Combo offert s’arrête.",confirm:"Retirer"});
    if(!yes){if(selEl)selEl.value=prev;return true}
    let d=await S3Sb("DELETE","ambassador_links?user_id=eq."+encodeURIComponent(u.id));
    if(!d.ok){A("Retrait impossible.","warn");if(selEl)selEl.value=prev;return true}
    set.delete(u.id);A("Statut ambassadeur retiré.","ok");
    if(val===(u.role==="moderator"?"moderator":"user"))return true;
  }
  return false;
}
/* Affiche « Ambassadeur » dans la colonne Rôle pour les comptes déjà reliés */
async function S3RoleSync(){
  if(!Mt||!S3Adm(w.user))return;
  let sels=Mt.querySelectorAll("select[data-uid]:not([data-rs])");if(!sels.length)return;
  let set=await S3AmbUsers();
  sels.forEach(s=>{s.dataset.rs="1";if(set.has(s.dataset.uid))s.value="ambassador"});
}

/* Aperçu de la fiche publique, directement dans « Mon espace ambassadeur » */
async function S3AmbPreview(box,id){
  let a=(window.__ambDb||[]).find(x2=>x2.id===id)||{};
  let seas={chasse:"Chasse",peche:"Pêche",both:"Chasse et pêche"}[a.season]||"";
  let ini=String(a.name||"?").split(/\s+/).map(s2=>s2[0]||"").join("").slice(0,2).toUpperCase();
  W(box);
  box.append(
    e("div.row",{style:{gap:"12px",alignItems:"center"}},
      e("div.amb-prev-av",ini),
      e("div.grow",e("b",{style:{fontSize:"18px"}},a.name||"Ma fiche"),
        e("div.small.muted",[a.handle,seas].filter(Boolean).join(" · ")||"Ambassadeur"))),
    a.speciality?e("p",{style:{margin:"10px 0 0",fontWeight:600}},a.speciality):null,
    a.bio?e("p.small",{style:{margin:"6px 0 0",whiteSpace:"pre-line"}},a.bio):e("p.small.muted",{style:{margin:"6px 0 0"}},"Ajoutez une présentation pour que les membres vous connaissent."),
    Array.isArray(a.tags)&&a.tags.length?e("div.row.wrap",{style:{gap:"6px",marginTop:"8px"}},a.tags.map(t2=>e("span.amb-tag",t2))):null,
    a.channelUrl?e("a.small",{href:a.channelUrl,target:"_blank",rel:"noopener",style:{display:"inline-block",marginTop:"8px"}},"Chaîne YouTube ↗"):null);
  let r=await S3Sb("GET","amb_posts?ambassador_id=eq."+encodeURIComponent(id)+"&select=url,title,published_on&order=published_on.desc,created_at.desc&limit=3");
  if(r&&r.ok&&Array.isArray(r.json)&&r.json.length)box.append(e("div.small.muted",{style:{margin:"12px 0 4px"}},"Dernières publications sur la fiche"),
    e("div.list",r.json.map(x2=>e("a.list-row",{href:x2.url,target:"_blank",rel:"noopener"},e("span.ic",b(/youtube|youtu\.be/.test(x2.url)?"play":"camera")),e("div.grow",e("div.t",x2.title||"Publication"),e("div.s",x2.published_on||""))))));
}
