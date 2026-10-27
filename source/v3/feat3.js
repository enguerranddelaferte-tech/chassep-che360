/* ----- Fonctions activées (3.0) -----
   L’équipe choisit dans Admin › Fonctions de l’appli ce qui est visible par les membres.
   Une fonction coupée disparaît du menu, de l’accueil et des liens, et son adresse renvoie vers l’accueil.
   Rien n’est supprimé : on la rallume d’un clic, sans mise à jour.
   Réglage enregistré dans la base (table app_settings, clé « modules ») ; en démo, sur l’appareil. */
const S3FEAT=[
  {id:"messages",sec:"Communauté",label:"Messagerie",hint:"Menu : Messagerie",paths:["/messages"]},
  {id:"articles",sec:"Communauté",label:"Articles",hint:"Menu : Articles",paths:["/articles"]},
  {id:"groupes",sec:"Communauté",label:"Entraide & groupes",hint:"Menu : Entraide & groupes (questions, groupes de discussion)",paths:["/questions","/groupes"],off:!0},
  {id:"carte",sec:"Terrain",label:"Carte terrain",hint:"Menu : Carte terrain",paths:["/carte"]},
  {id:"meteo",sec:"Terrain",label:"Météo terrain",hint:"Menu : Météo terrain",paths:["/meteo"]},
  {id:"suivi",sec:"Terrain",label:"Suivi en direct (GPS)",hint:"Menu : Suivi en direct (position partagée en temps réel)",paths:["/suivi"],off:!0},
  {id:"angle30",sec:"Chasse",label:"Viseur & calculateur 30°",hint:"Menu : Viseur 30°, Calculateur 30° (carte)",paths:["/angle-30","/angle-30-carte"]},
  {id:"battues",sec:"Chasse",label:"Organisation de battues",hint:"Menu : Chasse (battues, traques, journée de chasse)",paths:["/battues","/journee","/partage-journee"],off:!0},
  {id:"territoires",sec:"Chasse",label:"Territoires & gestion de territoire",hint:"Menu : Mes territoires, Gestion de territoire, Espace pro",paths:["/territoires","/gestion","/pro"],off:!0},
  {id:"tableau",sec:"Chasse",label:"Tableau de chasse",hint:"Menu : Tableau de chasse",paths:["/tableau-de-chasse"]},
  {id:"chien",sec:"Chasse",label:"Chien de sang",hint:"Menu : Chien de sang",paths:["/chien-de-sang"],off:!0},
  {id:"carnet",sec:"Pêche",label:"Carnet de pêche & spots",hint:"Menu : Carnet de prises, Mes spots",paths:["/carnet","/spots"]},
  {id:"eau",sec:"Pêche",label:"Niveaux d’eau",hint:"Menu : Niveaux d’eau",paths:["/niveaux-eau"],off:!0},
  {id:"sorties",sec:"Chasse et Pêche",label:"Sorties & historique",hint:"Menus Chasse et Pêche : Sortie, Historique des sorties",paths:["/sortie","/historique","/sortie-detail"]},
  {id:"recettes",sec:"Cuisine & commerce",label:"Recettes",hint:"Menu : Recettes",paths:["/recettes"]},
  {id:"salaison",sec:"Cuisine & commerce",label:"Salaison & séchage",hint:"Menu : Salaison & séchage",paths:["/salaison"],off:!0},
  {id:"bourse",sec:"Cuisine & commerce",label:"Bourse & annonces de chasse",hint:"Menu : Bourse de proximité, Annonces de chasse",paths:["/bourse","/annonces-chasse"],off:!0},
  {id:"annuaire",sec:"Cuisine & commerce",label:"Annuaire des pros",hint:"Menu : Annuaire",paths:["/annuaire"]}
];
const S3FeatKey="cp360.modules.v1";
var S3FeatOff=(()=>{try{let v=JSON.parse(localStorage.getItem(S3FeatKey)||"null");if(v&&Array.isArray(v.off))return new Set(v.off)}catch{}return new Set(S3FEAT.filter(f=>f.off).map(f=>f.id))})();
function S3FeatOf(p){p=(p||"").split("?")[0];let best=null;S3FEAT.forEach(f=>f.paths.forEach(x2=>{(p===x2||p.startsWith(x2+"/"))&&(!best||x2.length>best[1].length)&&(best=[f,x2])}));return best&&best[0]}
/* En ligne comme en démo : les fonctions « Plus tard » restent visibles et utilisables, avec une mention */
function S3FeatDemo(){return!0}
/* En démonstration, tout reste visible : les fonctions prévues pour plus tard portent simplement une mention */
function S3ModOk(p){if(w.user&&S3Adm(w.user)||S3FeatDemo())return!0;let f=S3FeatOf(p);return!f||!S3FeatOff.has(f.id)}
function S3FeatStyle(){
  let st=document.getElementById("s3-feat-css");st||(st=document.createElement("style"),st.id="s3-feat-css",document.head.append(st));
  if(w.user&&S3Adm(w.user)){st.textContent="";return}
  if(S3FeatDemo()){let sel=[];S3FEAT.filter(f=>S3FeatOff.has(f.id)).forEach(f=>f.paths.forEach(x2=>sel.push(`.nav-link[data-path="${x2}"]::after`,`.nav-link[data-path^="${x2}/"]::after`)));
    st.textContent=sel.length?sel.join(",")+'{content:"Plus tard";margin-left:auto;flex:none;font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:999px;border:1px dashed currentColor;opacity:.75}':"";return}
  let sel=[];S3FEAT.filter(f=>S3FeatOff.has(f.id)).forEach(f=>f.paths.forEach(x2=>sel.push(`a[href="#${x2}"]`,`a[href^="#${x2}/"]`,`a[href^="#${x2}?"]`)));
  st.textContent=sel.length?sel.join(",")+"{display:none!important}":"";
}
function S3FeatApply(off,redraw){
  let prev=[...S3FeatOff].sort().join();S3FeatOff=new Set(off);
  try{localStorage.setItem(S3FeatKey,JSON.stringify({off:[...S3FeatOff]}))}catch{}
  S3FeatStyle();
  if(redraw&&prev!==[...S3FeatOff].sort().join()){try{Ie()}catch{}}
}
async function S3FeatLoad(){
  S3FeatStyle();
  try{if(!(window.cp360Sb&&window.cp360Sb.on&&window.cp360Sb.on()))return;
    let r=await S3Sb("GET","app_settings?select=value&key=eq.modules");
    if(r&&r.ok&&Array.isArray(r.json)&&r.json[0]&&r.json[0].value&&Array.isArray(r.json[0].value.off))S3FeatApply(r.json[0].value.off,!0)}catch{}
}
/* Appelé après chaque changement de page */
function S3FeatGuard(p){
  S3FeatStyle();
  if(S3FeatDemo()){let f=S3FeatOf(p);if(f&&S3FeatOff.has(f.id)&&!(w.user&&S3Adm(w.user))&&Mt){let pg=Mt.querySelector(".page");
    if(pg&&!pg.querySelector(".feat-demo")){let ban=e("div.feat-demo",e("b","Prévue pour plus tard"),e("span","Cette fonction est en cours de finalisation : vous pouvez déjà l’essayer, elle sera officiellement lancée prochainement."));let h=pg.querySelector(".page-head");h?h.after(ban):pg.prepend(ban)}}return!1}
  if(!S3ModOk(p)){A("Cette fonction arrive bientôt dans l’appli.");ge("/accueil");return!0}
  return!1
}
/* ---------- Admin ---------- */
function S3FeatPage(t){
  if(!w.user||!S3Adm(w.user)){C(t,q({title:"Fonctions de l’appli"}),e("p.muted","Réservé à l’équipe."));return}
  let real=!!(window.cp360Sb&&window.cp360Sb.on&&window.cp360Sb.on()),sel=new Set(S3FeatOff),dirty=!1,bar;
  let count=()=>{let n=S3FEAT.filter(f=>sel.has(f.id)).length;return n?`${n} fonction${n>1?"s":""} en « Plus tard »`:"Tout est lancé"};
  let row=f=>{
    let st=e("span.feat-st"),sw=e("button.feat-sw",{type:"button",role:"switch","aria-label":f.label}),
      paint=()=>{let on=!sel.has(f.id);sw.setAttribute("aria-checked",String(on));st.textContent=on?"Lancée":"Plus tard";st.className="feat-st"+(on?" on":"");r.classList.toggle("is-off",!on)},
      r=e("div.feat-row",e("span.feat-txt",e("b",f.label,null),e("span.small.muted",f.hint)),st,sw);
    sw.onclick=()=>{sel.has(f.id)?sel.delete(f.id):sel.add(f.id);paint();dirty=!0;bar.classList.add("show");sum.textContent=count()};
    paint();return r};
  let secs=[];S3FEAT.forEach(f=>{let g=secs.find(x2=>x2[0]===f.sec);g?g[1].push(f):secs.push([f.sec,[f]])});
  let sum=e("b",count());
  let doSave=async()=>{
    let off=[...sel];
    if(real){let r=await S3Sb("POST","app_settings?on_conflict=key",{key:"modules",value:{off},updated_at:new Date().toISOString()},{Prefer:"resolution=merge-duplicates,return=minimal"});
      if(!r||!r.ok){A("Enregistrement impossible : vérifiez la connexion.","err");return}}
    S3FeatApply(off,!1);dirty=!1;bar.classList.remove("show");A(real?"Mis à jour pour tous les membres.":"Mis à jour (démo : sur cet appareil).","ok");
  },save=()=>x("Enregistrer",{icon:"check",kind:"primary",onClick:doSave});
  bar=e("div.feat-bar",e("span",sum," · modifications non enregistrées"),save());
  C(t,q({title:"Fonctions de l’appli",subtitle:"Rangé comme dans le menu des membres. Une fonction en « Plus tard » reste visible et utilisable, avec une mention dans le menu et un bandeau sur sa page. Basculez-la sur « Lancée » le jour de sa sortie."}),
    e("p.small.muted",{style:{margin:"0 0 12px"}},"Toujours lancées : accueil, fil d’actualité, profil, amis, ambassadeurs, sécurité, réglementation, abonnement."),
    ...secs.map(([name,list])=>k({title:"Menu « "+name+" »"},e("div.feat-list",list.map(row)))),
    e("div.row",{style:{gap:"8px"}},save()),bar);
}
function S3FeatAdminLink(p){
  if(!(p==="/admin"||p==="/admin/tableau")||!w.user||!S3Adm(w.user)||!Mt)return;
  let pg=Mt.querySelector(".page");if(!pg||pg.querySelector(".feat-admin"))return;
  let n=S3FEAT.filter(f=>S3FeatOff.has(f.id)).length;
  let box=k({cls:"feat-admin",title:"Fonctions de l’appli"},e("p.small.muted",{style:{margin:"0 0 10px"}},n?`${n} fonction${n>1?"s":""} affichée${n>1?"s":""} « Plus tard » pour les membres (lancement progressif).`:"Toutes les fonctions sont lancées."),
    x("Gérer les fonctions",{icon:"eye",kind:"primary",onClick:()=>{location.hash="#/admin/fonctions"}}));
  let h=pg.querySelector(".page-head");h?h.after(box):pg.prepend(box);
}
