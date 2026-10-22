
/* ----- Partage (option 1) : feuille de partage du téléphone, repli sur copie du texte ----- */
/* Sert aux publications du fil (texte + photo) et aux éléments de l’album (photo ou lien). */
function S3IsDesk(){return !/Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent||"")&&!(navigator.maxTouchPoints>1&&/Mac/.test(navigator.platform||""))}
async function S3ShareCopy(txt){
  if(!txt)return false;
  try{await navigator.clipboard.writeText(txt);return true}catch{}
  try{let t=document.createElement("textarea");t.value=txt;t.style.position="fixed";t.style.opacity="0";document.body.append(t);t.select();let ok=document.execCommand("copy");t.remove();return ok}catch{return false}
}
async function S3ShareDl(d){
  try{
    let blob=d.file||null,name="publication";
    if(!blob&&d.img)blob=await (await fetch(d.img)).blob();
    if(!blob&&d.video)blob=await (await fetch(d.video)).blob();
    if(!blob)return A("Aucune photo ni vidéo à télécharger.","warn");
    let ext=/video/.test(blob.type)?(/quicktime/.test(blob.type)?".mov":".mp4"):/png/.test(blob.type)?".png":".jpg";
    let u=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=u;a.download=name+ext;document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(u),60000);
  }catch{A("Téléchargement impossible.","warn")}
}
/* Ordinateur : passerelle — texte copié, fichier à télécharger, liens vers Instagram et Facebook */
function S3ShareDesk(d,copied){
  let txt=[d.text,d.url].filter(Boolean).join("\n\n"),hasMedia=!!(d.file||d.img||d.video);
  let fb=d.url?"https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(d.url):"https://www.facebook.com/";
  let m=Le({title:"Partager sur Instagram ou Facebook",body:e("div.stack",
    e("p",{style:{margin:0}},copied?"Le texte est copié. Il ne reste qu’à le coller (Ctrl+V ou Cmd+V).":"Copiez le texte, puis collez-le dans la publication."),
    e("ol",{style:{margin:0,paddingLeft:"20px"}},
      hasMedia?e("li","Téléchargez la photo ou la vidéo."):null,
      e("li","Ouvrez Instagram ou Facebook et créez une publication."),
      hasMedia?e("li","Ajoutez le fichier téléchargé (glissez-le dans la fenêtre)."):null,
      e("li","Collez le texte.")),
    e("div.row.wrap",{style:{gap:"8px"}},
      x("Copier le texte",{icon:"check",kind:"ghost",size:"sm",onClick:async()=>{(await S3ShareCopy(txt))?A("Texte copié.","ok"):A("Copie impossible.","warn")}}),
      hasMedia?x("Télécharger le fichier",{icon:"download",kind:"ghost",size:"sm",onClick:()=>S3ShareDl(d)}):null,
      x("Ouvrir Instagram",{icon:"send",kind:"primary",size:"sm",href:"https://www.instagram.com/"}),
      x("Ouvrir Facebook",{icon:"send",kind:"primary",size:"sm",href:fb})))});
  document.querySelectorAll(".modal a[href^='https://www.instagram.com'],.modal a[href^='https://www.facebook.com']").forEach(a=>{a.target="_blank";a.rel="noopener"});
}
async function S3ShareData(d){
  let txt=[d.text,d.url].filter(Boolean).join("\n\n");
  let copied=await S3ShareCopy(txt);
  if(S3IsDesk()){S3ShareDesk(d,copied);return "desk"}
  let data={title:d.title||"Chasse & Pêche 360°",text:d.text||""};
  if(d.url)data.url=d.url;
  if(d.file&&navigator.canShare&&navigator.canShare({files:[d.file]}))data.files=[d.file];
  else if(d.img){
    try{
      let blob=await (await fetch(d.img)).blob(),f=new File([blob],"publication.jpg",{type:blob.type||"image/jpeg"});
      if(navigator.canShare&&navigator.canShare({files:[f]}))data.files=[f];
    }catch{}
  }
  if(navigator.share){
    try{await navigator.share(data);if(copied)A("Texte copié : il ne reste qu’à le coller dans Instagram ou Facebook.","ok");return "shared"}
    catch(err){if(err&&err.name==="AbortError")return "cancel"}
  }
  return copied?"copied":"none";
}
function S3ShareBtn(getData){
  return x("Partager",{icon:"send",kind:"ghost",size:"sm",onClick:async()=>{
    let r=await S3ShareData(getData());
    if(r==="copied")A("Texte copié : collez-le dans Instagram ou Facebook, avec la photo.","ok");
    else if(r==="none")A("Partage indisponible sur cet appareil.","warn");
  }});
}
function S3ShareInject(){
  if(!Mt)return;
  Mt.querySelectorAll("article.post:not([data-shr])").forEach(a=>{
    a.dataset.shr="1";
    let act=a.querySelector(".post-actions");if(!act)return;
    act.append(S3ShareBtn(()=>{
      let img=a.querySelector(".photo img"),who=(a.querySelector("a[href^='#/profil/']")||{}).textContent||"",
          txt=(a.querySelector(".post-text")||{}).textContent||"";
      let url=/github\.io$/.test(location.hostname)?location.href.split("#")[0]:"";
      let vid=a.querySelector(".photo video");
      try{S3AmbShareLog(S3PostAuthor(a))}catch{}
      return {text:(who?who+" : ":"")+txt+(vid?"\nVidéo : "+vid.src:""),img:img?img.src:"",video:vid?vid.src:"",url,title:"Chasse & Pêche 360°"};
    }));
  });
}
var S3ShareObs=null;
function S3ShareWatch(){
  if(S3ShareObs||!Mt)return;
  let tm=null;
  S3ShareObs=new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>{try{S3ShareInject()}catch{}try{S3AmbBadges()}catch{}try{S3RoleSync()}catch{}},150)});
  S3ShareObs.observe(Mt,{childList:true,subtree:true});
}

/* Ambassadeurs : juste après une publication, proposer de la partager sur Instagram, Facebook… (feuille de partage du téléphone) */
async function S3AmbCross(d){
  try{
    if(!S3Amb.id||!d||!navigator.onLine)return;
    let lv=window.__s3LastVid,file=d.file||null,img="";
    if(!file&&d.photo&&lv&&lv.url===d.photo)file=lv.file;
    else if(!file&&d.photo&&/^data:image\//.test(d.photo))img=d.photo;
    let ok=await ve({title:"Publier aussi ailleurs ?",text:"Votre publication est en ligne sur Chasse & Pêche 360°. Voulez-vous aussi la publier sur Instagram, Facebook ou une autre application ?",confirm:"Oui, partager"});
    if(!ok)return;
    let r=await S3ShareData({text:d.text||d.caption||"",img,file});
    if(r==="copied")A("Texte copié : collez-le dans Instagram ou Facebook avec votre photo ou vidéo.","ok");
    else if(r==="none")A("Partage indisponible sur cet appareil.","warn");
  }catch{}
}
