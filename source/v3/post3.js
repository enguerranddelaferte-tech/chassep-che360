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
async function S3PhotoPick(file,gr){
  let isVid=/^video\//.test(file.type||"")||/\.(mp4|mov|m4v)$/i.test(file.name||"");
  if(!isVid)return gr(file);
  if(!window.cp360Sb||!window.cp360Sb.on||!window.cp360Sb.on()){A("Connectez-vous pour publier une vidéo.","warn");return null;}
  if(file.size>S3ShMax.bytes){A("Vidéo trop lourde : 300 Mo maximum avant compression.","warn");return null;}
  let dur=await S3VidDur(file);
  if(dur>S3ShMax.sec){A("Vidéo trop longue : 3 minutes maximum.","warn");return null;}
  try{
    A("Compression de la vidéo en cours. Sur téléphone, cela peut prendre plusieurs minutes.","ok");
    let out=await S3ShCompress(file,()=>{});
    if(out.size>S3ShMax.outBytes){A("Vidéo encore trop lourde après compression. Essayez une vidéo plus courte.","warn");return null;}
    let tok=await window.cp360Sb.bearer();
    if(!tok)throw new Error("session");
    let path=w.user.id+"/posts/"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)+".mp4";
    let up=await fetch(window.cp360Sb.URL+"/storage/v1/object/shorts/"+path,{method:"POST",headers:{Authorization:"Bearer "+tok,apikey:window.cp360Sb.KEY,"Content-Type":"video/mp4","x-upsert":"false"},body:out});
    if(!up.ok)throw new Error("upload");
    A("Vidéo prête.","ok");
    return S3ShUrl(path);
  }catch(err){
    A("La vidéo n’a pas pu être envoyée. Vérifiez votre connexion et réessayez.","warn");
    return null;
  }
}
