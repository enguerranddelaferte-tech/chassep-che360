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
async function S3AmbBoot(){
  S3AmbFiches().catch(()=>{});
  try{S3ShRegister()}catch{}
  if(!w.user||!window.cp360Sb||!window.cp360Sb.on||!window.cp360Sb.on())return;
  if(S3Amb.uid===w.user.id&&S3Amb.checked)return;
  S3Amb.uid=w.user.id,S3Amb.checked=!0,S3Amb.id=null;
  let r=await S3Sb("GET","ambassador_links?select=ambassador_id");
  let row=r&&r.ok&&Array.isArray(r.json)&&r.json[0];
  if(!row)return;
  S3Amb.id=row.ambassador_id;
  S3AmbRoute();S3AmbMenu();
}
function S3AmbRoute(){
  if(S3Amb.routed)return;
  S3Amb.routed=!0;
  Z("/espace-ambassadeur",S3AmbPage);
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
function S3AmbPage(t){
  if(!w.user){C(t,q({title:"Mon espace ambassadeur"},V({icon:"user",title:"Connectez-vous",text:"Cet espace est réservé aux ambassadeurs."})));return}
  if(!S3Amb.id){C(t,q({title:"Mon espace ambassadeur"},V({icon:"user",title:"Espace réservé",text:"Cet espace est ouvert aux ambassadeurs. Contactez l’équipe pour être ajouté."})));return}
  let id=S3Amb.id,ta=e("textarea",{id:"amb-bulk",rows:7,"aria-label":"Liens de publications, un par ligne",placeholder:"https://www.instagram.com/p/…\nhttps://www.youtube.com/watch?v=… | Titre facultatif"}),
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
  C(t,q({title:"Mon espace ambassadeur",subtitle:"Collez vos liens d’un coup : ils apparaissent sur votre fiche publique."},
    e("div.grid.g-main",
      e("div.stack",k({title:"Ajouter des publications"},e("div.field",e("label","Liens, un par ligne"),ta),e("p.tiny.muted",{style:{margin:"0 0 10px"}},"Dans Instagram : « … » puis « Copier le lien ». Pour un titre, ajoutez « | » puis le titre après le lien."),go,msg)),
      e("div.stack",k({title:"Mes publications",sub:"sur ma fiche publique"},list)))));
  S3AmbList(list,id);
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
    arr.length?arr.map(a=>e("option",{value:a.id},a.name||a.id)):e("option",{value:""},"Aucune fiche d’ambassadeur"));
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
    if(!arr.length)C(pick,e("option",{value:""},"Aucune fiche d’ambassadeur"));
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
    let r=await S3Sb("GET","ambassador_links?select=user_id,user_name,ambassador_id,ambassador_name&order=created_at.desc");
    W(linked);
    let rows=r&&r.ok&&Array.isArray(r.json)?r.json:null;
    if(!rows){C(linked,e("p.muted",{style:{margin:0}},"Liste indisponible."));return}
    if(!rows.length){C(linked,e("p.muted",{style:{margin:0}},"Aucun compte ambassadeur pour le moment."));return}
    rows.forEach(l=>C(linked,e("div.list-row",
      e("span.ic",b("user")),
      e("div.grow",e("div.t",l.user_name||"Compte sans nom"),e("div.s","Fiche : "+(l.ambassador_name||l.ambassador_id))),
      x("Retirer",{size:"sm",kind:"ghost",onClick:async()=>{
        if(!(await ve({title:"Retirer le statut ambassadeur ?",text:"Cette personne ne pourra plus publier sur la fiche.",confirm:"Retirer"})))return;
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
        if(!fid){A("Créez d’abord une fiche d’ambassadeur.","warn");return}
        let r=await S3Sb("POST","ambassador_links?on_conflict=user_id",{user_id:u.id,user_name:u.name||"",ambassador_id:fid,ambassador_name:fname},{Prefer:"resolution=merge-duplicates,return=minimal"});
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
