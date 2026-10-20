
/* ----- Vidéos courtes (3.0) : fil vertical plein écran, publication ouverte à tous les membres ----- */
/* Fichiers dans le bucket « shorts » (public en lecture), lignes dans la table shorts. MP4 ou MOV à l’envoi, compressés en MP4 H.264 (50 Mo max stockés), 9:16 (ou 3:4), 720 px mini, 3 min max. */
var S3Sh={registered:!1};
const S3ShMax={sec:180,bytes:314572800,outBytes:52428800,minSide:720,ratioMin:1.25,ratioMax:2};
/* Compression à l’envoi (ffmpeg.wasm, chargé à la demande) : H.264 720 px de large, 30 i/s, ~1,2 Mbit/s, AAC 96 kbit/s. */
const S3ShFF={base:"https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd",ff:"https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js",util:"https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/umd/index.js",inst:null};
function S3ShRegister(){
  if(S3Sh.registered)return;
  S3Sh.registered=!0;
  Z("/courts",S3ShPage);
}
function S3ShUrl(path){return window.cp360Sb.URL+"/storage/v1/object/public/shorts/"+path}
function S3ShCheck(file){
  return new Promise((ok,ko)=>{
    let okType=/^video\/(mp4|quicktime|x-m4v)$/.test(file.type)||(!file.type&&/\.(mp4|mov|m4v)$/i.test(file.name||""));
    if(!okType)return ko("Format non accepté : MP4 ou MOV uniquement.");
    if(file.size>S3ShMax.bytes)return ko("Vidéo trop lourde à l’envoi : 300 Mo maximum avant compression.");
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
function S3ShScript(src){return new Promise((ok,ko)=>{let el=document.createElement("script");el.src=src;el.onload=ok;el.onerror=()=>ko(new Error("script"));document.head.append(el)})}
async function S3ShLoadFF(){
  if(S3ShFF.inst)return S3ShFF.inst;
  if(!window.FFmpegWASM)await S3ShScript(S3ShFF.ff);
  if(!window.FFmpegUtil)await S3ShScript(S3ShFF.util);
  let ff=new window.FFmpegWASM.FFmpeg();
  await ff.load({
    coreURL:await window.FFmpegUtil.toBlobURL(S3ShFF.base+"/ffmpeg-core.js","text/javascript"),
    wasmURL:await window.FFmpegUtil.toBlobURL(S3ShFF.base+"/ffmpeg-core.wasm","application/wasm"),
    classWorkerURL:await window.FFmpegUtil.toBlobURL(S3ShFF.ff.replace(/ffmpeg\.js$/,"814.ffmpeg.js"),"text/javascript")
  });
  S3ShFF.inst=ff;return ff;
}
function S3ShRaw(file){
  let mov=/quicktime/.test(file.type||"")||/\.mov$/i.test(file.name||"");
  return new Blob([file],{type:mov?"video/quicktime":"video/mp4"});
}
const S3ShDirect=20971520;
async function S3ShCompress(file,onPct){
  if(file.size<=S3ShDirect){onPct&&onPct(100);return S3ShRaw(file)}
  try{return await S3ShCompressFF(file,onPct)}
  catch(err){
    console.error("Compression vidéo impossible",err);
    if(file.size<=S3ShMax.outBytes)return S3ShRaw(file);
    throw new Error("compress");
  }
}
function S3ShExt(blob){return blob.type==="video/quicktime"?".mov":".mp4"}
async function S3ShCompressFF(file,onPct){
  let ff=await S3ShLoadFF(),prog=({progress})=>onPct&&onPct(Math.round(Math.min(1,Math.max(0,progress))*100));
  ff.on("progress",prog);
  try{
    await ff.writeFile("in.mp4",new Uint8Array(await file.arrayBuffer()));
    await ff.exec(["-i","in.mp4","-vf","scale=720:-2,fps=30","-c:v","libx264","-preset","ultrafast","-crf","30","-maxrate","1200k","-bufsize","2400k","-pix_fmt","yuv420p","-c:a","aac","-b:a","96k","-ac","2","-movflags","+faststart","out.mp4"]);
    let data=await ff.readFile("out.mp4");
    return new Blob([data.buffer],{type:"video/mp4"});
  }finally{
    try{ff.off&&ff.off("progress",prog);await ff.deleteFile("in.mp4");await ff.deleteFile("out.mp4")}catch{}
  }
}
async function S3ShUpload(blob,caption){
  let tok=await window.cp360Sb.bearer();
  if(!tok)throw new Error("session");
  let path=w.user.id+"/"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)+S3ShExt(blob);
  let up=await fetch(window.cp360Sb.URL+"/storage/v1/object/shorts/"+path,{method:"POST",headers:{Authorization:"Bearer "+tok,apikey:window.cp360Sb.KEY,"Content-Type":blob.type||"video/mp4","x-upsert":"false"},body:blob});
  if(!up.ok)throw new Error("upload");
  let r=await S3Sb("POST","shorts",{owner_id:w.user.id,path,caption:caption.trim()},{Prefer:"return=minimal"});
  if(!r.ok){fetch(window.cp360Sb.URL+"/storage/v1/object/shorts/"+path,{method:"DELETE",headers:{Authorization:"Bearer "+tok,apikey:window.cp360Sb.KEY}}).catch(()=>{});throw new Error("row")}
}
async function S3ShRemoveFile(path){
  try{
    let tok=await window.cp360Sb.bearer();
    if(tok)await fetch(window.cp360Sb.URL+"/storage/v1/object/shorts/"+path,{method:"DELETE",headers:{Authorization:"Bearer "+tok,apikey:window.cp360Sb.KEY}});
  }catch{}
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
    if(!d.ok){A("Suppression impossible.","warn");return}
    S3ShRemoveFile(s.path);
    A("Vidéo supprimée."),reload();
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
  let file=e("input",{type:"file",accept:"video/mp4,video/quicktime,.mp4,.mov,.m4v","aria-label":"Choisir une vidéo",style:{width:"100%"}}),
      cap=e("input",{type:"text",maxLength:300,placeholder:"Légende (facultatif)","aria-label":"Légende",style:{minHeight:"var(--touch)",width:"100%",padding:"0 12px",borderRadius:"var(--r-sm)",border:"1px solid var(--line-strong)",background:"var(--surface)",color:"inherit"}}),
      msg=e("p.tiny.muted",{role:"status","aria-live":"polite",style:{margin:"6px 0 0"}});
  let go=x("Publier la vidéo",{icon:"check",kind:"primary",size:"block",onClick:async()=>{
    if(!file.files||!file.files[0]){msg.textContent="Choisissez une vidéo.";return}
    go.disabled=!0;msg.textContent="Vérification de la vidéo…";
    try{
      await S3ShCheck(file.files[0]);
      msg.textContent="Compression : 0 %. Sur téléphone, cela peut prendre plusieurs minutes.";
      let out=await S3ShCompress(file.files[0],pct=>{msg.textContent="Compression : "+pct+" %. Sur téléphone, cela peut prendre plusieurs minutes."});
      if(out.size>S3ShMax.outBytes)throw "Vidéo encore trop lourde après compression (50 Mo max) : raccourcissez-la.";
      msg.textContent="Envoi en cours…";
      await S3ShUpload(out,cap.value);
      A("Vidéo publiée.","ok");
      file.value="";cap.value="";msg.textContent="";
      done();
    }catch(err){
      msg.textContent=typeof err==="string"?err:(err&&err.message==="session"?"Votre session a expiré : reconnectez-vous.":"Publication impossible pour le moment. Si le problème continue, la compression n’a peut-être pas pu se charger.");
    }
    go.disabled=!1;
  }});
  return e("details.card.shorts-form",{style:{margin:"0 0 14px"}},
    e("summary",{style:{cursor:"pointer",fontWeight:600}},"Publier une vidéo"),
    e("div.stack",{style:{marginTop:"10px"}},e("div.field",e("label","Vidéo verticale 9:16 (3 min max, MP4 ou MOV, compressée automatiquement)"),file),e("div.field",e("label","Légende"),cap),go,msg));
}
