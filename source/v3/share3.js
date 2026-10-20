
/* ----- Partage (option 1) : feuille de partage du téléphone, repli sur copie du texte ----- */
/* Sert aux publications du fil (texte + photo) et aux éléments de l’album (photo ou lien). */
async function S3ShareData(d){
  let data={title:d.title||"Chasse & Pêche 360°",text:d.text||""};
  if(d.url)data.url=d.url;
  if(d.img){
    try{
      let blob=await (await fetch(d.img)).blob(),f=new File([blob],"publication.jpg",{type:blob.type||"image/jpeg"});
      if(navigator.canShare&&navigator.canShare({files:[f]}))data.files=[f];
    }catch{}
  }
  if(navigator.share){
    try{await navigator.share(data);return "shared"}
    catch(err){if(err&&err.name==="AbortError")return "cancel"}
  }
  let txt=[d.text,d.url].filter(Boolean).join("\n\n");
  try{await navigator.clipboard.writeText(txt);return "copied"}catch{return "none"}
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
      return {text:(who?who+" : ":"")+txt+(vid?"\nVidéo : "+vid.src:""),img:img?img.src:"",url,title:"Chasse & Pêche 360°"};
    }));
  });
}
var S3ShareObs=null;
function S3ShareWatch(){
  if(S3ShareObs||!Mt)return;
  let tm=null;
  S3ShareObs=new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>{try{S3ShareInject()}catch{}},150)});
  S3ShareObs.observe(Mt,{childList:true,subtree:true});
}
