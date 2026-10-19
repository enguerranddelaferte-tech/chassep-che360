
/* ----- Vidéos courtes (3.0) : fil vertical plein écran, publication ouverte à tous les membres ----- */
/* Fichiers dans le bucket « shorts » (public en lecture), lignes dans la table shorts. MP4 ou MOV, 9:16 (ou 3:4), 720 px mini, 3 min max, 100 Mo max. */
var S3Sh={registered:!1};
const S3ShMax={sec:180,bytes:104857600,minSide:720,ratioMin:1.25,ratioMax:2};
function S3ShRegister(){
  if(S3Sh.registered)return;
  S3Sh.registered=!0;
  Z("/courts",S3ShPage);
}
function S3ShUrl(path){return window.cp360Sb.URL+"/storage/v1/object/public/shorts/"+path}
function S3ShCheck(file){
  return new Promise((ok,ko)=>{
    if(!/^video\/(mp4|quicktime)$/.test(file.type))return ko("Format non accepté : MP4 ou MOV uniquement.");
    if(file.size>S3ShMax.bytes)return ko("Vidéo trop lourde : 100 Mo maximum.");
    let v=document.createElement("video"),url=URL.createObjectURL(file);
    v.preload="metadata";
    v.onloadedmetadata=()=>{
      URL.revokeObjectURL(url);
      let w2=v.videoWidth,h2=v.videoHeight,ratio=h2/Math.max(1,w2);
      if(v.duration>S3ShMax.sec+.5)return ko("Vidéo trop longue : 3 minutes maximum.");
      if(!(ratio>=S3ShMax.ratioMin&&ratio<=S3ShMax.ratioMax))return ko("Format vertical requis : 9:16 (ou 3:4). Votre vidéo est en paysage ou dans un autre format.");
      if(Math.min(w2,h2)<S3ShMax.minSide)return ko("Résolution trop faible : 720 px minimum sur le petit côté.");
      ok(v.duration);
    };
    v.onerror=()=>{URL.revokeObjectURL(url);ko("Vidéo illisible.")};
    v.src=url;
  });
}
async function S3ShUpload(file,caption){
  let tok=await window.cp360Sb.bearer();
  if(!tok)throw new Error("session");
  let ext=file.type==="video/quicktime"?"mov":"mp4",
      path=w.user.id+"/"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)+"."+ext;
  let up=await fetch(window.cp360Sb.URL+"/storage/v1/object/shorts/"+path,{method:"POST",headers:{Authorization:"Bearer "+tok,apikey:window.cp360Sb.KEY,"Content-Type":file.type,"x-upsert":"false"},body:file});
  if(!up.ok)throw new Error("upload");
  let r=await S3Sb("POST","shorts",{owner_id:w.user.id,path,caption:caption.trim()},{Prefer:"return=minimal"});
  if(!r.ok){fetch(window.cp360Sb.URL+"/storage/v1/object/shorts/"+path,{method:"DELETE",headers:{Authorization:"Bearer "+tok,apikey:window.cp360Sb.KEY}}).catch(()=>{});throw new Error("row")}
}
async function S3ShNames(ids){
  if(!ids.length)return {};
  let r=await S3Sb("GET","profiles_public?select=id,data&id=in.("+ids.map(encodeURIComponent).join(",")+")");
  let out={};
  if(r&&r.ok&&Array.isArray(r.json))r.json.forEach(p=>out[p.id]=(p.data&&p.data.name)||"Membre");
  return out;
}
function S3ShCard(s,names,mine,reload){
  let v=e("video",{src:S3ShUrl(s.path),playsinline:"",loop:"",muted:"",controls:"",preload:"metadata",style:{width:"100%",height:"100%",objectFit:"contain",background:"#000"}});
  let del=mine?x("Supprimer",{size:"sm",kind:"ghost",onClick:async()=>{
    if(!(await ve({title:"Supprimer cette vidéo ?",text:"Elle disparaîtra du fil pour tout le monde.",confirm:"Supprimer",danger:!0})))return;
    let d=await S3Sb("DELETE","shorts?id=eq."+encodeURIComponent(s.id));
    d.ok?(A("Vidéo supprimée."),reload()):A("Suppression impossible.","warn");
  }}):null;
  return e("section.short",{"aria-label":"Vidéo courte"},
    e("div.short-media",v),
    e("div.short-info",e("b",names[s.owner_id]||"Membre"),s.caption?e("p",s.caption):null,del));
}
async function S3ShPage(t){
  let feed=e("div.shorts-feed",{"aria-busy":"true"});
  let form=null;
  const load=async()=>{
    let r=await S3Sb("GET","shorts?select=id,owner_id,path,caption,created_at&order=created_at.desc&limit=100");
    W(feed);feed.removeAttribute("aria-busy");
    let rows=r&&r.ok&&Array.isArray(r.json)?r.json:null;
    if(!rows){C(feed,V({icon:"play",title:"Fil indisponible",text:"Réessayez dans un instant."}));return}
    if(!rows.length){C(feed,V({icon:"play",title:"Aucune vidéo pour le moment",text:w.user?"Soyez le premier à publier une vidéo courte.":"Connectez-vous pour publier."}));return}
    let names=await S3ShNames([...new Set(rows.map(s=>s.owner_id))]);
    rows.forEach(s=>C(feed,S3ShCard(s,names,!!(w.user&&w.user.id===s.owner_id),load)));
  };
  if(w.user)form=S3ShForm(load);
  C(t,q({title:"Vidéos courtes",subtitle:"Publiées par les membres : vidéos verticales, 3 minutes maximum."}),form||null,feed);
  load();
}
function S3ShForm(done){
  let file=e("input",{type:"file",accept:"video/mp4,video/quicktime","aria-label":"Choisir une vidéo",style:{width:"100%"}}),
      cap=e("input",{type:"text",maxLength:300,placeholder:"Légende (facultatif)","aria-label":"Légende",style:{minHeight:"var(--touch)",width:"100%",padding:"0 12px",borderRadius:"var(--r-sm)",border:"1px solid var(--line-strong)",background:"var(--surface)",color:"inherit"}}),
      msg=e("p.tiny.muted",{role:"status","aria-live":"polite",style:{margin:"6px 0 0"}});
  let go=x("Publier la vidéo",{icon:"check",kind:"primary",size:"block",onClick:async()=>{
    if(!file.files||!file.files[0]){msg.textContent="Choisissez une vidéo.";return}
    go.disabled=!0;msg.textContent="Vérification de la vidéo…";
    try{
      await S3ShCheck(file.files[0]);
      msg.textContent="Envoi en cours…";
      await S3ShUpload(file.files[0],cap.value);
      A("Vidéo publiée.","ok");
      file.value="";cap.value="";msg.textContent="";
      done();
    }catch(err){
      msg.textContent=typeof err==="string"?err:(err&&err.message==="session"?"Votre session a expiré : reconnectez-vous.":"Publication impossible pour le moment.");
    }
    go.disabled=!1;
  }});
  return e("details.card.shorts-form",{style:{margin:"0 0 14px"}},
    e("summary",{style:{cursor:"pointer",fontWeight:600}},"Publier une vidéo"),
    e("div.stack",{style:{marginTop:"10px"}},e("div.field",e("label","Vidéo verticale 9:16 (3 min max, 100 Mo max, MP4 ou MOV)"),file),e("div.field",e("label","Légende"),cap),go,msg));
}
