// Photos et vidéos dans les publications (pour tous les membres connectés)
const S3VidRe=/\.(mp4|mov|m4v)(\?|$)/i;
function S3Media(src,alt,eager){
  if(!src)return null;
  let isVid=/^data:video\//.test(src)||(S3VidRe.test(src)&&!/^data:image\//.test(src));
  if(isVid)return e("video",{src:src,controls:true,playsinline:true,preload:"metadata",style:{width:"100%",borderRadius:"12px"}});
  return e("img",{src:src,alt:alt||"",loading:eager?"eager":"lazy"});
}
function S3VidDur(file){
  return new Promise(res=>{
    let v=document.createElement("video"),u=URL.createObjectURL(file);
    v.preload="metadata";
    v.onloadedmetadata=()=>{URL.revokeObjectURL(u);res(v.duration||0)};
    v.onerror=()=>{URL.revokeObjectURL(u);res(0)};
    v.src=u;
  });
}
function S3VidPut(path,blob,tok,onPct){
  return new Promise((ok,ko)=>{
    let x2=new XMLHttpRequest();
    x2.open("POST",window.cp360Sb.URL+"/storage/v1/object/shorts/"+path);
    x2.setRequestHeader("Authorization","Bearer "+tok);
    x2.setRequestHeader("apikey",window.cp360Sb.KEY);
    x2.setRequestHeader("Content-Type",blob.type||"video/mp4");
    x2.upload.onprogress=ev=>{ev.lengthComputable&&onPct(Math.round(ev.loaded/ev.total*100))};
    x2.onload=()=>x2.status>=200&&x2.status<300?ok():ko(new Error("upload "+x2.status+" "+(x2.responseText||"").slice(0,120)));
    x2.onerror=()=>ko(new Error("network"));
    x2.send(blob);
  });
}
async function S3PhotoPick(file,gr,st){
  st=st||(()=>{});
  let isVid=/^video\//.test(file.type||"")||/\.(mp4|mov|m4v)$/i.test(file.name||"");
  if(!isVid){st("");return gr(file);}
  if(!window.cp360Sb||!window.cp360Sb.on||!window.cp360Sb.on()){st("Connectez-vous pour publier une vidéo.");return null;}
  if(file.size>S3ShMax.bytes){st("Vidéo trop lourde : 300 Mo maximum avant compression.");return null;}
  let dur=await S3VidDur(file);
  if(dur>S3ShMax.sec+.5){st("Vidéo trop longue : 3 minutes maximum.");return null;}
  window.__s3VidBusy=true;
  try{
    st("Compression de la vidéo… (sur téléphone, cela peut prendre un moment)");
    let out=await S3ShCompress(file,pct=>st("Compression de la vidéo : "+pct+" %"));
    if(out.size>S3ShMax.outBytes){st("Vidéo trop lourde après compression (50 Mo max). Essayez une vidéo plus courte.");return null;}
    let tok=await window.cp360Sb.bearer();
    if(!tok)throw new Error("session");
    let path=w.user.id+"/posts/"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)+S3ShExt(out);
    st("Envoi de la vidéo : 0 %");
    await S3VidPut(path,out,tok,pct=>st("Envoi de la vidéo : "+pct+" %"));
    st("Vidéo prête. Vous pouvez publier.");
    let u=S3ShUrl(path);window.__s3LastVid={url:u,file:file};
    return u;
  }catch(err){
    console.error("Vidéo de publication",err);
    let m=String(err&&err.message||err);
    st(m==="compress"?"La compression a échoué et la vidéo dépasse 50 Mo. Essayez une vidéo plus courte.":m==="session"?"Session expirée : reconnectez-vous.":"Envoi impossible ("+m+"). Réessayez.");
    return null;
  }finally{window.__s3VidBusy=false}
}
// Boutons : prendre une photo, filmer une vidéo, ou choisir un fichier
function S3PickUI(video,onFile){
  let mk=(accept,capture)=>{
    let i=e("input",{type:"file",accept:accept,hidden:true,onchange:async ev=>{let f=ev.target.files[0];ev.target.value="";if(f)await onFile(f,setSt)}});
    if(capture)i.setAttribute("capture","environment");
    return i;
  };
  let stEl=e("div.small.muted",{style:{width:"100%",marginTop:"6px"}}),setSt=t=>{stEl.textContent=t||""};
  let cam=mk("image/*",true),vid=video?mk("video/*",true):null,gal=mk(video?"image/*,video/*":"image/*",false);
  let btn=(icon,label,inp)=>x(label,{icon:icon,kind:"ghost",size:"sm",onClick:()=>inp.click()});
  return e("div.row.wrap",{style:{gap:"8px"}},btn("camera","Prendre une photo",cam),vid?x("Filmer une vidéo",{icon:"play",kind:"ghost",size:"sm",onClick:()=>{try{S3ShLoadFF().catch(()=>{})}catch{}vid.click()}}):null,btn("plus","Choisir un fichier",gal),cam,vid,gal,stEl);
}
