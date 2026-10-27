/* ----- Fonctions activées (3.0) -----
   L’équipe choisit dans Admin › Fonctions de l’appli ce qui est visible par les membres.
   Une fonction coupée disparaît du menu, de l’accueil et des liens, et son adresse renvoie vers l’accueil.
   Rien n’est supprimé : on la rallume d’un clic, sans mise à jour.
   Réglage enregistré dans la base (table app_settings, clé « modules ») ; en démo, sur l’appareil. */
const S3FEAT=[
  {id:"territoires",label:"Territoires & gestion de territoire",hint:"Territoires, postes, calendrier, membres, plan de chasse, espace pro",paths:["/territoires","/gestion","/pro"],off:!0},
  {id:"battues",label:"Organisation de battues",hint:"Battues, traques, journée de chasse",paths:["/battues","/journee","/partage-journee"],off:!0},
  {id:"suivi",label:"Suivi en direct (GPS)",hint:"Position partagée en temps réel",paths:["/suivi"],off:!0},
  {id:"bourse",label:"Bourse & annonces de chasse",hint:"Petites annonces entre membres, annonces de chasse",paths:["/bourse","/annonces-chasse"],off:!0},
  {id:"chien",label:"Chien de sang",hint:"Recherche au sang",paths:["/chien-de-sang"],off:!0},
  {id:"groupes",label:"Entraide & groupes",hint:"Questions, groupes de discussion",paths:["/questions","/groupes"],off:!0},
  {id:"salaison",label:"Salaison & séchage",hint:"Calculateur de salaison",paths:["/salaison"],off:!0},
  {id:"eau",label:"Niveaux d’eau",hint:"Hauteurs et débits des rivières",paths:["/niveaux-eau"],off:!0},
  {id:"angle30",label:"Viseur & calculateur 30°",hint:"Sécurité au tir",paths:["/angle-30","/angle-30-carte"]},
  {id:"sorties",label:"Sorties & historique",hint:"Sortie en cours, historique, détail",paths:["/sortie","/historique","/sortie-detail"]},
  {id:"tableau",label:"Tableau de chasse",hint:"Bilan de la saison",paths:["/tableau-de-chasse"]},
  {id:"carnet",label:"Carnet de pêche & spots",hint:"Prises, spots personnels",paths:["/carnet","/spots"]},
  {id:"meteo",label:"Météo terrain",hint:"",paths:["/meteo"]},
  {id:"carte",label:"Carte terrain",hint:"",paths:["/carte"]},
  {id:"recettes",label:"Recettes",hint:"",paths:["/recettes"]},
  {id:"annuaire",label:"Annuaire des pros",hint:"",paths:["/annuaire"]},
  {id:"articles",label:"Articles",hint:"",paths:["/articles"]},
  {id:"messages",label:"Messagerie",hint:"",paths:["/messages"]}
];
const S3FeatKey="cp360.modules.v1";
var S3FeatOff=(()=>{try{let v=JSON.parse(localStorage.getItem(S3FeatKey)||"null");if(v&&Array.isArray(v.off))return new Set(v.off)}catch{}return new Set(S3FEAT.filter(f=>f.off).map(f=>f.id))})();
function S3FeatOf(p){p=(p||"").split("?")[0];let best=null;S3FEAT.forEach(f=>f.paths.forEach(x2=>{(p===x2||p.startsWith(x2+"/"))&&(!best||x2.length>best[1].length)&&(best=[f,x2])}));return best&&best[0]}
function S3ModOk(p){if(w.user&&S3Adm(w.user))return!0;let f=S3FeatOf(p);return!f||!S3FeatOff.has(f.id)}
function S3FeatStyle(){
  let st=document.getElementById("s3-feat-css");st||(st=document.createElement("style"),st.id="s3-feat-css",document.head.append(st));
  if(w.user&&S3Adm(w.user)){st.textContent="";return}
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
  if(!S3ModOk(p)){A("Cette fonction arrive bientôt dans l’appli.");ge("/accueil");return!0}
  return!1
}
/* ---------- Admin ---------- */
function S3FeatPage(t){
  if(!w.user||!S3Adm(w.user)){C(t,q({title:"Fonctions de l’appli"}),e("p.muted","Réservé à l’équipe."));return}
  let real=!!(window.cp360Sb&&window.cp360Sb.on&&window.cp360Sb.on()),sel=new Set(S3FeatOff);
  let row=f=>{let cb=e("input",{type:"checkbox",checked:!sel.has(f.id),onchange:()=>{cb.checked?sel.delete(f.id):sel.add(f.id);st.textContent=cb.checked?"Visible":"Masquée";st.className="feat-st"+(cb.checked?" on":"")}}),
      st=e("span.feat-st"+(sel.has(f.id)?"":".on"),sel.has(f.id)?"Masquée":"Visible");
    return e("label.feat-row",cb,e("span.feat-txt",e("b",f.label),f.hint?e("span.small.muted",f.hint):null),st)};
  let later=S3FEAT.filter(f=>f.off),core=S3FEAT.filter(f=>!f.off);
  let save=x("Enregistrer",{icon:"check",kind:"primary",onClick:async()=>{
    let off=[...sel];
    if(real){let r=await S3Sb("POST","app_settings?on_conflict=key",{key:"modules",value:{off},updated_at:new Date().toISOString()},{Prefer:"resolution=merge-duplicates,return=minimal"});
      if(!r||!r.ok){A("Enregistrement impossible : vérifiez la connexion.","err");return}}
    S3FeatApply(off,!1);A(real?"Fonctions mises à jour pour tous les membres.":"Fonctions mises à jour (démo : sur cet appareil).","ok");
  }});
  C(t,q({title:"Fonctions de l’appli",subtitle:"Ce que les membres voient. Une fonction masquée reste dans l’appli : on la rallume d’un clic, sans mise à jour."}),
    k({title:"Prévues pour plus tard",sub:"Masquées au lancement"},e("div.feat-list",later.map(row))),
    k({title:"Cœur de l’appli",sub:"Visibles au lancement"},e("div.feat-list",core.map(row))),
    e("p.small.muted","Toujours visibles : accueil, fil d’actualité, profil, amis, ambassadeurs, sécurité, réglementation, abonnement. L’équipe (admin) voit tout."),
    e("div.row",{style:{gap:"8px"}},save));
}
function S3FeatAdminLink(p){
  if(!(p==="/admin"||p==="/admin/tableau")||!w.user||!S3Adm(w.user)||!Mt)return;
  let pg=Mt.querySelector(".page");if(!pg||pg.querySelector(".feat-admin"))return;
  let n=S3FEAT.filter(f=>S3FeatOff.has(f.id)).length;
  let box=k({cls:"feat-admin",title:"Fonctions de l’appli"},e("p.small.muted",{style:{margin:"0 0 10px"}},n?`${n} fonction${n>1?"s":""} masquée${n>1?"s":""} pour les membres (lancement progressif).`:"Toutes les fonctions sont visibles."),
    x("Choisir les fonctions visibles",{icon:"eye",kind:"primary",onClick:()=>{location.hash="#/admin/fonctions"}}));
  let h=pg.querySelector(".page-head");h?h.after(box):pg.prepend(box);
}
