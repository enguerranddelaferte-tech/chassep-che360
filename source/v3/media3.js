/* ----- Photos hors de la base (3.0) -----
   Les photos ne sont plus rangées dans la base de données : à l'envoi, chaque photo est déposée dans le stockage
   de fichiers (dossier du membre), en deux tailles : entière (1 600 px max) et miniature (640 px) pour le fil.
   La base ne garde que l'adresse. Les messages privés, spots et territoires ne sont pas concernés. */
const S3PH={tables:new Set(["posts","comments","catches","harvests","listings","articles","recipes","huntads","users","ambassadors","groups","questions"]),cache:new Map(),fail:0};
function S3PhBase(){return (window.cp360Sb&&window.cp360Sb.URL||"")+"/storage/v1/object/public/photos/"}
function S3PhIsUrl(s){return typeof s==="string"&&s.indexOf("/storage/v1/object/public/photos/")>0&&/\.jpg(\?|$)/.test(s)}
function S3PhThumb(s){return S3PhIsUrl(s)&&!/_t\.jpg(\?|$)/.test(s)?s.replace(/\.jpg(\?|$)/,"_t.jpg$1"):s}
function S3PhFull(s){return typeof s==="string"?s.replace(/_t\.jpg(\?|$)/,".jpg$1"):s}
async function S3PhHash(str){
  try{let h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(str));return Array.from(new Uint8Array(h)).slice(0,14).map(b=>b.toString(16).padStart(2,"0")).join("")}
  catch{let h=0;for(let i=0;i<str.length;i+=7)h=(h*31+str.charCodeAt(i))|0;return "x"+(h>>>0).toString(16)+str.length.toString(16)}
}
function S3PhJpeg(src,max,q){
  return new Promise((ok,ko)=>{let im=new Image();im.onload=()=>{try{let sc=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.max(1,Math.round(im.width*sc));c.height=Math.max(1,Math.round(im.height*sc));
    let x2=c.getContext("2d");x2.fillStyle="#fff";x2.fillRect(0,0,c.width,c.height);x2.drawImage(im,0,0,c.width,c.height);c.toBlob(b=>b?ok(b):ko(new Error("jpeg")),"image/jpeg",q)}catch(er){ko(er)}};im.onerror=()=>ko(new Error("image"));im.src=src});
}
async function S3PhPut(path,blob){
  let tok=window.cp360Sb&&window.cp360Sb.bearer?await window.cp360Sb.bearer():null;if(!tok)throw new Error("session");
  let r=await fetch(window.cp360Sb.URL+"/storage/v1/object/photos/"+path,{method:"POST",headers:{Authorization:"Bearer "+tok,apikey:window.cp360Sb.KEY,"Content-Type":"image/jpeg","cache-control":"max-age=31536000"},body:blob});
  if(r.ok)return;let t="";try{t=await r.text()}catch{}
  if(r.status===409||/Duplicate|already exists/i.test(t))return;throw new Error("upload "+r.status+" "+t.slice(0,80));
}
/* Dépose une photo (data:image…) et renvoie son adresse ; null si impossible (elle reste alors telle quelle) */
async function S3PhFromData(d){
  if(typeof d!=="string"||!/^data:image\//.test(d))return d;
  if(S3PH.cache.has(d))return S3PH.cache.get(d);
  let uid=w.user&&w.user.id;if(!uid||!window.cp360Sb||!window.cp360Sb.on||!window.cp360Sb.on())return null;
  try{
    let h=await S3PhHash(d),base=uid+"/"+h,full=await S3PhJpeg(d,1600,.82),th=await S3PhJpeg(d,640,.72);
    await S3PhPut(base+".jpg",full);await S3PhPut(base+"_t.jpg",th);
    let u=S3PhBase()+base+".jpg";S3PH.cache.set(d,u);return u;
  }catch(er){S3PH.fail++;return null}
}
/* Appelé par la synchronisation juste avant l'envoi d'une ligne : remplace les photos intégrées par leur adresse */
window.cp360Media=async function(n,row,local){
  if(!row||!S3PH.tables.has(n))return row;
  let found=new Set(),walk=v=>{if(typeof v==="string"){v.length>2000&&/^data:image\//.test(v)&&found.add(v);return}if(v&&typeof v==="object")for(let k in v)walk(v[k])};
  walk(row);if(!found.size)return row;
  let map=new Map();for(let d of found){let u=await S3PhFromData(d);u&&u!==d&&map.set(d,u)}
  if(!map.size)return row;
  let swap=v=>{if(typeof v==="string")return map.has(v)?map.get(v):v;if(Array.isArray(v))return v.map(swap);if(v&&typeof v==="object"){let o={};for(let k in v)o[k]=swap(v[k]);return o}return v};
  if(local&&typeof local==="object"){let fix=o=>{for(let k in o){let v=o[k];if(typeof v==="string"&&map.has(v))o[k]=map.get(v);else if(v&&typeof v==="object")fix(v)}};try{fix(local)}catch{}}
  return swap(row);
};
/* Plein écran pour voir la photo entière (le fil n'affiche que la miniature) */
function S3PhView(src){
  let im=e("img",{src:src,alt:"",style:{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}}),ov;
  ov=e("div",{role:"dialog","aria-label":"Photo",onclick:()=>ov.remove(),style:{position:"fixed",inset:"0",zIndex:"9999",background:"rgba(10,14,13,.94)",display:"flex",alignItems:"center",justifyContent:"center",padding:"12px",cursor:"zoom-out"}},im,
    e("button",{type:"button","aria-label":"Fermer",style:{position:"absolute",top:"12px",right:"12px",width:"44px",height:"44px",borderRadius:"22px",border:"0",background:"rgba(255,255,255,.15)",color:"#fff",fontSize:"24px"}},"×"));
  let esc=ev=>{if(ev.key==="Escape"){ov.remove();document.removeEventListener("keydown",esc)}};document.addEventListener("keydown",esc);
  document.body.append(ov);
}
/* Durée maximale d'une vidéo : 1 minute pour les membres, sans limite de durée pour les ambassadeurs (taille maximale inchangée) */
function S3VidMaxSec(){return typeof S3Amb!=="undefined"&&S3Amb&&S3Amb.id?Infinity:60}
function S3VidTooLong(){return "Vidéo trop longue : 1 minute maximum (sans limite pour les ambassadeurs)."}
/* Fil : charge automatiquement la page suivante quand on arrive en bas */
function S3AutoMore(host,fn){
  if(!host||!("IntersectionObserver" in window))return;
  let done=!1,io=new IntersectionObserver(en=>{if(done)return;if(en.some(x2=>x2.isIntersecting)){done=!0;io.disconnect();fn()}},{rootMargin:"600px 0px"});
  setTimeout(()=>{host.isConnected&&io.observe(host)},50);
}
