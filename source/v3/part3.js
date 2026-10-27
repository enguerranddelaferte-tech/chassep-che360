/* ----- Partenaires (3.0) -----
   1) Annuaire des pros géré depuis l'admin (ajout, modification, retrait, case « Partenaire », offre, logo).
   2) Emplacements « Présenté par » : un bandeau discret sur un module (calculateur 30°, météo, carnet…),
      entre une date de début et de fin, avec compteurs d'affichages et de clics (sans donnée personnelle). */
const S3PartCats=[["armurerie","Armurerie"],["peche","Articles de pêche"],["traiteur","Venaison & traiteur"],["guide","Guide"],["veterinaire","Vétérinaire"],["taxidermiste","Taxidermiste"]];
const S3PartDemo=new Set(["Armurerie de Sologne","Pêche & Loire","Venaison du Beuvron","Guide pêche Loire Nature","Clinique vétérinaire des Bruyères","Taxidermie Solognote","Chasse & Nature Center","Le Moulinet Solognot","Boucherie gibier Martin","Sologne Aventure Guides","Magimix","Lava","OptiVision","Rivière Outdoor"]);
const S3PartMods=[["angle30","Calculateur 30°","/angle-30"],["meteo","Météo terrain","/meteo"],["carnet","Carnet de pêche","/carnet"],["recettes","Recettes","/recettes"],["annuaire","Annuaire des pros","/annuaire"],["carte","Carte","/carte"],["communaute","Fil d’actualité","/communaute"]];
function S3PartReal(){try{return !!(window.cp360Sb&&window.cp360Sb.on&&window.cp360Sb.on())}catch{return !1}}
/* En ligne, les fiches et marques de démonstration ne sont plus montrées */
function S3PartIsDemo(x){return !!x&&(x.demo||S3PartDemo.has(x.name)||S3PartDemo.has(x.sponsor))}
async function S3PartGeo(q){
  for(let u of ["https://data.geopf.fr/geocodage/search?limit=1&q=","https://api-adresse.data.gouv.fr/search/?limit=1&q="]){
    try{let r=await fetch(u+encodeURIComponent(q));if(!r.ok)continue;let j=await r.json(),f=j&&j.features&&j.features[0];
      if(f&&f.geometry&&f.geometry.coordinates)return {lat:f.geometry.coordinates[1],lng:f.geometry.coordinates[0],label:f.properties&&f.properties.label}}catch{}}
  return null;
}
async function S3PartLogo(file){
  if(!file)return null;
  let d=await S3AlbCompress(file);
  return (typeof S3PhFromData=="function"&&await S3PhFromData(d))||d;
}
/* ---------- Admin : annuaire des pros ---------- */
function S3PartDirDlg(cur,done){
  cur=cur||{};
  let f={};
  let inp=(k,lab,ph,type)=>{f[k]=e("input.input",{type:type||"text",value:cur[k]||"",placeholder:ph||""});return e("div.field",{style:{margin:0}},e("label",lab),f[k])};
  f.category=e("select.input",S3PartCats.map(([v,l])=>e("option",{value:v,selected:cur.category===v},l)));
  f.offer=e("input.input",{value:cur.offer||"",maxLength:90,placeholder:"ex. : −10 % sur les cartouches pour les membres"});
  f.partner=e("input",{type:"checkbox",checked:!!cur.partner});
  f.logo=e("input",{type:"file",accept:"image/*"});
  let msg=e("p.small.muted",{role:"status",style:{margin:0}},""),dlg;
  let save=x(cur.id?"Enregistrer":"Ajouter à l’annuaire",{kind:"primary",onClick:async()=>{
    let v=k=>(f[k].value||"").trim(),name=v("name"),addr=v("address"),city=v("city");
    if(!name||!city){msg.textContent="Indiquez au moins le nom et la ville.";return}
    save.disabled=!0;msg.textContent="Recherche de l’adresse…";
    try{
      let loc=cur.location;
      if(!loc||addr!==(cur.address||"")||city!==(cur.city||"")){let g=await S3PartGeo(addr+" "+city);if(!g){msg.textContent="Adresse introuvable : vérifiez l’adresse et la ville.";save.disabled=!1;return}loc={lat:g.lat,lng:g.lng}}
      let logo=cur.logo||null;if(f.logo.files&&f.logo.files[0]){msg.textContent="Envoi du logo…";logo=await S3PartLogo(f.logo.files[0])}
      let row={name,category:f.category.value,address:addr,city,phone:v("phone"),website:v("website")||null,location:loc,partner:f.partner.checked,offer:v("offer")||null,logo,rating:cur.rating||null};
      if(cur.id)Ut.directory.update(cur.id,row);else Ut.directory.insert(row);
      dlg.close();A(cur.id?"Fiche mise à jour.":"Fiche ajoutée à l’annuaire.","ok");done&&done();
    }catch(er){msg.textContent="Enregistrement impossible : "+(er&&er.message||er);save.disabled=!1}
  }});
  dlg=Le({title:cur.id?"Modifier la fiche":"Ajouter un pro à l’annuaire",body:e("div.stack",{style:{gap:"10px"}},
    inp("name","Nom","Armurerie du Centre"),
    e("div.field",{style:{margin:0}},e("label","Catégorie"),f.category),
    inp("address","Adresse","12 rue de la République"),inp("city","Ville","Romorantin-Lanthenay"),
    inp("phone","Téléphone","02 54 …","tel"),inp("website","Site internet","https://…","url"),
    e("div.field",{style:{margin:0}},e("label","Offre pour les membres (facultatif)"),f.offer),
    e("label.row",{style:{gap:"8px",alignItems:"center"}},f.partner,e("span","Partenaire : badge doré, repère doré sur la carte, en tête de liste")),
    e("div.field",{style:{margin:0}},e("label","Logo (facultatif)"),f.logo),msg),
    actions:[x("Annuler",{kind:"ghost",onClick:()=>dlg.close()}),save]});
}
function S3PartDirPage(t){
  if(!w.user||!S3Adm(w.user)){C(t,q({title:"Annuaire des pros"}),e("p.muted","Réservé à l’équipe."));return}
  let list=e("div.list"),add=x("Ajouter un pro",{icon:"plus",kind:"primary",onClick:()=>S3PartDirDlg(null,draw)});
  function draw(){
    W(list);let rows=Ut.directory.all(d=>!(S3PartReal()&&S3PartIsDemo(d))).sort((a,b)=>(b.partner?1:0)-(a.partner?1:0)||String(a.name).localeCompare(b.name));
    if(!rows.length){C(list,e("p.muted",{style:{margin:0}},"Aucune fiche pour le moment. Ajoutez votre première armurerie partenaire."));return}
    rows.forEach(d=>C(list,e("div.list-row",
      d.logo?e("img",{src:d.logo,alt:"",style:{width:"40px",height:"40px",objectFit:"contain",borderRadius:"8px",background:"#fff",flex:"none"}}):e("span.ic",b("store")),
      e("div.grow",e("div.t",d.name," ",d.partner?L("Partenaire","gold","crown"):null),e("div.s",((S3PartCats.find(c=>c[0]===d.category)||[0,d.category])[1])+" · "+(d.city||"")+(d.offer?" · "+d.offer:""))),
      x("Modifier",{size:"sm",kind:"ghost",onClick:()=>S3PartDirDlg(d,draw)}),
      x("Retirer",{size:"sm",kind:"ghost",onClick:async()=>{if(!confirm("Retirer « "+d.name+" » de l’annuaire ?"))return;Ut.directory.remove(d.id);draw()}}))));
  }
  C(t,q({title:"Annuaire des pros",subtitle:"Armureries, magasins, guides, vétérinaires, taxidermistes : les fiches visibles par tous les membres."},
    e("div.row",{style:{gap:"8px",flexWrap:"wrap"}},add)),
    k({title:"Fiches"},list));
  draw();
}
/* ---------- Admin : emplacements « Présenté par » ---------- */
function S3PartPlaceDlg(cur,done){
  cur=cur||{};
  let today=new Date().toISOString().slice(0,10);
  let f={brand:e("input.input",{value:cur.brand||"",placeholder:"Nom de la marque"}),
    module:e("select.input",S3PartMods.map(([v,l])=>e("option",{value:v,selected:cur.module===v},l))),
    text:e("input.input",{value:cur.text||"",maxLength:80,placeholder:"ex. : Optiques de précision pour la chasse"}),
    url:e("input.input",{type:"url",value:cur.url||"",placeholder:"https://…"}),
    starts:e("input.input",{type:"date",value:cur.starts_on||today}),ends:e("input.input",{type:"date",value:cur.ends_on||""}),
    active:e("input",{type:"checkbox",checked:cur.active!==!1}),logo:e("input",{type:"file",accept:"image/*"})};
  let msg=e("p.small.muted",{role:"status",style:{margin:0}},""),dlg;
  let save=x(cur.id?"Enregistrer":"Créer l’emplacement",{kind:"primary",onClick:async()=>{
    let brand=f.brand.value.trim();if(!brand){msg.textContent="Indiquez la marque.";return}
    save.disabled=!0;msg.textContent="Enregistrement…";
    try{
      let logo=cur.logo||null;if(f.logo.files&&f.logo.files[0]){msg.textContent="Envoi du logo…";logo=await S3PartLogo(f.logo.files[0])}
      if(logo&&/^data:/.test(logo)&&logo.length>4e5)throw new Error("logo trop lourd");
      let row={brand,module:f.module.value,text:f.text.value.trim(),url:f.url.value.trim()||null,logo,starts_on:f.starts.value||today,ends_on:f.ends.value||null,active:f.active.checked};
      let r=cur.id?await S3Sb("PATCH","placements?id=eq."+cur.id,row,{Prefer:"return=minimal"}):await S3Sb("POST","placements",row,{Prefer:"return=minimal"});
      if(!r||!r.ok)throw new Error(r&&r.status===403?"réservé aux administrateurs":"serveur indisponible");
      dlg.close();A("Emplacement enregistré.","ok");S3Part.cache=null;done&&done();
    }catch(er){msg.textContent="Enregistrement impossible : "+(er&&er.message||er);save.disabled=!1}
  }});
  dlg=Le({title:cur.id?"Modifier l’emplacement":"Nouvel emplacement « Présenté par »",body:e("div.stack",{style:{gap:"10px"}},
    e("div.field",{style:{margin:0}},e("label","Marque"),f.brand),
    e("div.field",{style:{margin:0}},e("label","Où l’afficher"),f.module),
    e("div.field",{style:{margin:0}},e("label","Phrase courte (facultative)"),f.text),
    e("div.field",{style:{margin:0}},e("label","Lien (site de la marque)"),f.url),
    e("div.row",{style:{gap:"10px"}},e("div.field.grow",{style:{margin:0}},e("label","Début"),f.starts),e("div.field.grow",{style:{margin:0}},e("label","Fin (facultative)"),f.ends)),
    e("div.field",{style:{margin:0}},e("label","Logo"),f.logo),
    e("label.row",{style:{gap:"8px",alignItems:"center"}},f.active,e("span","Actif")),msg),
    actions:[x("Annuler",{kind:"ghost",onClick:()=>dlg.close()}),save]});
}
function S3PartPlacePage(t){
  if(!w.user||!S3Adm(w.user)){C(t,q({title:"Emplacements partenaires"}),e("p.muted","Réservé à l’équipe."));return}
  let list=e("div.list",e("p.muted",{style:{margin:0}},"Chargement…"));
  async function draw(){
    let r=await S3Sb("GET","placements?select=*&order=created_at.desc");W(list);
    if(!r||!r.ok){C(list,e("p.muted",{style:{margin:0}},"Liste indisponible (connexion au serveur nécessaire)."));return}
    if(!r.json.length){C(list,e("p.muted",{style:{margin:0}},"Aucun emplacement. Créez le premier pour afficher « Présenté par … » sur un module."));return}
    let today=new Date().toISOString().slice(0,10);
    r.json.forEach(p=>{let live=p.active&&p.starts_on<=today&&(!p.ends_on||p.ends_on>=today),mod=(S3PartMods.find(m=>m[0]===p.module)||[0,p.module])[1];
      C(list,e("div.list-row",p.logo?e("img",{src:p.logo,alt:"",style:{width:"40px",height:"40px",objectFit:"contain",borderRadius:"8px",background:"#fff",flex:"none"}}):e("span.ic",b("gift")),
        e("div.grow",e("div.t",p.brand+" · "+mod," ",live?L("En ligne","ok"):L("Hors ligne","")),e("div.s",(p.starts_on||"")+(p.ends_on?" → "+p.ends_on:"")+" · "+p.views+" affichages · "+p.clicks+" clics"+(p.views?" ("+(Math.round(p.clicks/p.views*1000)/10)+" %)":""))),
        x("Modifier",{size:"sm",kind:"ghost",onClick:()=>S3PartPlaceDlg(p,draw)}),
        x("Supprimer",{size:"sm",kind:"ghost",onClick:async()=>{if(!confirm("Supprimer l’emplacement de « "+p.brand+" » ?"))return;await S3Sb("DELETE","placements?id=eq."+p.id,void 0,{Prefer:"return=minimal"});S3Part.cache=null;draw()}})))});
  }
  C(t,q({title:"Emplacements partenaires",subtitle:"Un bandeau « Présenté par » discret, avec le logo et le lien de la marque, sur le module choisi et entre les dates choisies."},
    e("div.row",{style:{gap:"8px"}},x("Nouvel emplacement",{icon:"plus",kind:"primary",onClick:()=>S3PartPlaceDlg(null,draw)}))),k({title:"Emplacements"},list),
    e("p.tiny.muted","Les compteurs ne gardent aucune donnée sur les membres : seulement le nombre d’affichages et de clics. Chaque bandeau porte la mention « Partenaire »."));
  draw();
}
/* Raccourcis dans l'admin */
function S3PartAdminLinks(p){
  if(!(p==="/admin"||p==="/admin/tableau"||p==="/admin/partenaires")||!w.user||!S3Adm(w.user)||!Mt)return;
  let pg=Mt.querySelector(".page");if(!pg||pg.querySelector(".part-admin"))return;
  let box=k({cls:"part-admin",title:"Partenaires visibles dans l’appli"},e("p.small.muted",{style:{margin:"0 0 10px"}},"Fiches de l’annuaire (armureries, pros) et bandeaux « Présenté par » sur les modules."),
    e("div.row",{style:{gap:"8px",flexWrap:"wrap"}},x("Gérer l’annuaire des pros",{icon:"store",kind:"primary",onClick:()=>{location.hash="#/admin/annuaire"}}),x("Emplacements « Présenté par »",{icon:"gift",kind:"ghost",onClick:()=>{location.hash="#/admin/emplacements"}})));
  let h=pg.querySelector(".page-head");h?h.after(box):pg.prepend(box);
}
/* ---------- Côté membres : bandeau « Présenté par » ---------- */
const S3Part={cache:null,at:0,seen:new Set()};
async function S3PartList(){
  if(S3Part.cache&&Date.now()-S3Part.at<6e5)return S3Part.cache;
  if(!S3PartReal())return [];
  try{let r=await S3Sb("GET","placements?select=id,brand,module,text,logo,url&order=created_at.desc");S3Part.cache=r&&r.ok&&Array.isArray(r.json)?r.json:[];S3Part.at=Date.now()}catch{S3Part.cache=[]}
  return S3Part.cache;
}
async function S3PartInject(p){
  if(!Mt)return;let m=S3PartMods.find(x2=>x2[2]===p);if(!m)return;
  let list=await S3PartList(),pl=list.find(x2=>x2.module===m[0]);
  let pg=Mt.querySelector(".page");if(!pl||!pg||pg.querySelector(".part-band"))return;
  if(location.hash.split("?")[0]!=="#"+p)return;
  let hit=k2=>{try{S3Sb("POST","rpc/placement_hit",{p_id:pl.id,p_kind:k2},{Prefer:"return=minimal"}).catch(()=>{})}catch{}};
  let band=e(pl.url?"a.part-band":"div.part-band",pl.url?{href:pl.url,target:"_blank",rel:"noopener sponsored",onclick:()=>hit("click")}:{},
    pl.logo?e("img",{src:pl.logo,alt:""}):null,
    e("span.part-txt",e("span.part-by","Présenté par ",e("b",pl.brand)),pl.text?e("span.part-sub",pl.text):null),
    e("span.part-tag","Partenaire"));
  let h=pg.querySelector(".page-head");h?h.after(band):pg.prepend(band);
  let key=pl.id+"|"+p;if(!S3Part.seen.has(key)){S3Part.seen.add(key);hit("view")}
}
