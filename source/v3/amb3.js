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
