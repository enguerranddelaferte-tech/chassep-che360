/* ----- Pré-modération (3.0) : les 3 premières publications d’un nouveau membre attendent une validation ----- */
/* La règle est appliquée par la base (déclencheur post_moderation + règle de lecture). Ici : affichage et validation. */
var S3Mod={at:0,rows:null,p:null,told:{}};
function S3ModStaff(){return !!(w.user&&(S3Adm(w.user)||w.user.role==="moderator"))}
async function S3ModPending(force){
  if(!w.user||!S3NfLive())return [];
  if(!force&&S3Mod.rows&&Date.now()-S3Mod.at<20000)return S3Mod.rows;
  if(!S3Mod.p)S3Mod.p=S3Sb("GET","posts?select=id,data,created_at&deleted_at=is.null&data->>moderation=eq.pending&order=created_at.asc&limit=100").then(r=>{
    S3Mod.rows=r&&r.ok&&Array.isArray(r.json)?r.json:[];S3Mod.at=Date.now();S3Mod.p=null;return S3Mod.rows;
  }).catch(()=>{S3Mod.p=null;return []});
  return S3Mod.p;
}
async function S3ModDecide(id,ok,reason){
  let r=await S3Sb("POST","rpc/moderate_post",{p_id:id,p_ok:ok,p_reason:reason||null});
  if(!r.ok){A("Action impossible : "+((r.json&&r.json.message)||"vérifiez votre connexion."),"warn");return false}
  A(ok?"Publication validée : elle est visible dans le fil.":"Publication refusée. L’auteur est prévenu.","ok");
  S3Mod.rows=(S3Mod.rows||[]).filter(x2=>x2.id!==id);
  return true;
}
function S3ModRefuse(id){
  return new Promise(done=>{
    let reasons=["Photo choquante ou animal blessé exhibé","Position exacte d’un spot ou d’un poste","Contenu hors charte ou illicite","Publicité non autorisée"];
    let sel=e("select.input",{"aria-label":"Motif"},reasons.map(r2=>e("option",{value:r2},r2)),e("option",{value:""},"Autre (sans motif)"));
    let dlg,res=false;
    let go=x("Refuser",{kind:"danger",onClick:async()=>{go.disabled=!0;res=await S3ModDecide(id,false,sel.value);go.disabled=!1;if(res)dlg.close()}});
    dlg=Le({title:"Refuser la publication ?",body:e("div.stack",e("p",{style:{margin:0}},"Elle ne sera pas publiée. L’auteur reçoit une notification avec le motif."),e("div.field",e("label","Motif"),sel)),
      actions:[x("Annuler",{kind:"ghost",onClick:()=>dlg.close()}),go],onClose:()=>done(res)});
  });
}
/* Dans le fil : bandeau sur les publications en attente (auteur) ou boutons de validation (équipe) */
async function S3ModMark(){
  if(!Mt||!w.user||!S3NfLive())return;
  let arts=[...Mt.querySelectorAll("article.post[data-pid]:not([data-modck])")];
  if(!arts.length)return;
  let rows=await S3ModPending(),ids=new Set(rows.map(x2=>x2.id)),staff=S3ModStaff();
  arts.forEach(a=>{
    a.dataset.modck="1";
    let id=a.dataset.pid;if(!ids.has(id))return;
    a.classList.add("post-pending");
    let bar=staff
      ?e("div.mod-bar",e("span",b("shield")," En attente de validation",(()=>{let r0=rows.find(x3=>x3.id===id),v0=r0&&r0.data&&r0.data.vision;return v0&&v0.flag?" · "+S3VisionText(v0):""})()),e("div.row",{style:{gap:"6px"}},
          x("Valider",{size:"sm",kind:"primary",onClick:async()=>{if(await S3ModDecide(id,true)){a.classList.remove("post-pending");bar.remove()}}}),
          x("Refuser",{size:"sm",kind:"ghost",onClick:async()=>{if(await S3ModRefuse(id))a.remove()}})))
      :e("div.mod-bar",e("span",b("clock")," En attente de validation · visible par vous seul"));
    a.prepend(bar);
    if(!staff&&!S3Mod.told[id]){S3Mod.told[id]=1;A("Vos premières publications sont relues par l’équipe avant d’apparaître dans le fil. Vous serez prévenu dès la validation.","info",{timeout:8000})}
  });
}
/* File d’attente sur la page Admin › Signalements */
async function S3ModQueue(p){
  if(p!=="/admin/signalements"||!S3ModStaff()||!Mt)return;
  let pg=Mt.querySelector(".page");if(!pg||pg.querySelector(".mod-queue"))return;
  let rows=await S3ModPending(true);
  if(location.hash.split("?")[0]!=="#"+p||pg.querySelector(".mod-queue"))return;
  let list=e("div.list"),box=e("section.card.mod-queue",
    e("div.row",{style:{justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap",gap:"8px"}},e("h3",{style:{margin:0}},"Publications à valider"),e("span.small.muted",rows.length?rows.length+" en attente":"aucune en attente")),
    e("p.small.muted",{style:{margin:"4px 0 10px"}},"Les 3 premières publications de chaque nouveau membre passent ici avant d’apparaître dans le fil. Ambassadeurs et équipe ne sont pas concernés."),list);
  let names={};try{(await S3Sb("GET","users?select=id,data->>name&id=in.("+[...new Set(rows.map(r2=>r2.data&&r2.data.authorId).filter(Boolean))].map(encodeURIComponent).join(",")+")")).json.forEach(u=>names[u.id]=u.name)}catch{}
  if(!rows.length)list.append(e("p.muted",{style:{margin:0}},"Rien à valider pour le moment."));
  rows.forEach(r2=>{
    let d=r2.data||{},ph=d.photo||d.image||null;
    let row=e("div.list-row.mod-row",
      ph?S3Media(ph,"",false):e("span.ic",b("chat")),
      e("div.grow",e("div.t",names[d.authorId]||"Nouveau membre"),e("div.s",new Date(r2.created_at).toLocaleString("fr-FR")),e("p.small",{style:{margin:"4px 0 0",whiteSpace:"pre-wrap"}},String(d.text||"").slice(0,400)),d.vision?e("p.small.mod-vision",{style:{margin:"6px 0 0"}},b("eye")," Analyse YOLOv8 : "+S3VisionText(d.vision)):null),
      e("div.row",{style:{gap:"6px",flexWrap:"wrap"}},
        x("Valider",{size:"sm",kind:"primary",onClick:async()=>{if(await S3ModDecide(r2.id,true))row.remove()}}),
        x("Refuser",{size:"sm",kind:"ghost",onClick:async()=>{if(await S3ModRefuse(r2.id))row.remove()}})));
    list.append(row);
  });
  let h=pg.querySelector(".page-head");h?h.after(box):pg.prepend(box);
}
