/* ----- Publication hors ligne (3.0) ----- */
/* Texte et photos : déjà gardés sur l’appareil par la file de synchro, envoyés au retour du réseau.
   Vidéos : gardées dans le téléphone (IndexedDB), compressées et envoyées au retour du réseau,
   puis la publication est complétée. Une pastille indique ce qui attend. */
var S3Off={db:null,busy:false,count:0,pill:null};
function S3OffDb(){
  if(!S3Off.db)S3Off.db=new Promise((ok,ko)=>{let r=indexedDB.open("cp360-offline",1);r.onupgradeneeded=()=>r.result.createObjectStore("videos");r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)});
  return S3Off.db;
}
async function S3OffTx(mode,fn){
  let db=await S3OffDb();
  return new Promise((ok,ko)=>{let tx=db.transaction("videos",mode),st=tx.objectStore("videos"),out;fn(st,v2=>{out=v2});tx.oncomplete=()=>ok(out);tx.onerror=()=>ko(tx.error)});
}
function S3OffPut(key,rec){return S3OffTx("readwrite",st=>st.put(rec,key))}
function S3OffDel(key){return S3OffTx("readwrite",st=>st.delete(key))}
function S3OffAll(){
  return S3OffTx("readonly",(st,set)=>{let out=[],c=st.openCursor();c.onsuccess=()=>{let cur=c.result;if(cur){out.push([cur.key,cur.value]);cur.continue()}else set(out)}});
}
async function S3OffKeep(file){
  let key="v"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  await S3OffPut(key,{file:file,uid:w.user&&w.user.id,at:Date.now(),url:null});
  S3OffCount();
  return "offline-video:"+key;
}
async function S3OffCount(){try{let all=await S3OffAll();S3Off.count=all.filter(([,r])=>!w.user||r.uid===w.user.id).length}catch{S3Off.count=0}S3OffPillDraw()}
/* Envoi des vidéos en attente */
async function S3OffRun(){
  if(S3Off.busy||!navigator.onLine||!w.user||!S3NfLive())return;
  S3Off.busy=true;
  try{
    let all=await S3OffAll();
    for(let [key,rec] of all){
      if(rec.uid!==w.user.id)continue;
      if(Date.now()-rec.at>7*864e5){await S3OffDel(key);continue}
      let tok=await window.cp360Sb.bearer();if(!tok)break;
      if(!rec.url){
        let out=await S3ShCompress(rec.file,()=>{});
        if(out.size>S3ShMax.outBytes){A("Une vidéo en attente est trop lourde (50 Mo max) : elle n’a pas été envoyée.","warn");await S3OffDel(key);continue}
        let path=w.user.id+"/posts/"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)+S3ShExt(out);
        await S3VidPut(path,out,tok,()=>{});
        rec.url=S3ShUrl(path);await S3OffPut(key,rec);
      }
      let marker="offline-video:"+key;
      let r=await S3Sb("GET","posts?select=id,data&data->>photo=eq."+encodeURIComponent(marker));
      let row=r&&r.ok&&Array.isArray(r.json)&&r.json[0];
      if(!row)continue; /* la publication n’est pas encore arrivée en base : on réessaiera */
      let p=await S3Sb("PATCH","posts?id=eq."+encodeURIComponent(row.id),{data:{...row.data,photo:rec.url}},{Prefer:"return=minimal"});
      if(p&&p.ok){await S3OffDel(key);A("Votre vidéo enregistrée hors ligne est en ligne.","ok")}
    }
  }catch(err){console.error("Envoi hors ligne",err)}
  finally{S3Off.busy=false;S3OffCount()}
}
/* Pastille : hors ligne, envois en attente */
function S3OffPillDraw(){
  let st=null;try{st=window.cp360Sb&&window.cp360Sb.status&&window.cp360Sb.status()}catch{}
  let pend=(st&&st.pending)||0,vids=S3Off.count||0,off=!navigator.onLine,txt="";
  if(off)txt="Hors ligne"+(pend||vids?" · "+(pend+vids)+" envoi"+(pend+vids>1?"s":"")+" en attente":" · vos publications partiront au retour du réseau");
  else if(vids)txt=vids+" vidéo"+(vids>1?"s":"")+" en cours d’envoi…";
  if(!S3Off.pill){S3Off.pill=e("div.offline-pill",{role:"status","aria-live":"polite",hidden:!0});document.body.append(S3Off.pill)}
  S3Off.pill.textContent=txt;S3Off.pill.hidden=!txt;S3Off.pill.classList.toggle("off",off);
}
function S3OfflineNote(){
  if(!navigator.onLine)A("Hors ligne : votre publication est enregistrée sur l’appareil et partira dès le retour du réseau.","info");
}
window.addEventListener("online",()=>{try{window.cp360Sb&&window.cp360Sb.flush&&window.cp360Sb.flush()}catch{}setTimeout(S3OffRun,1500);S3OffPillDraw()});
window.addEventListener("offline",S3OffPillDraw);
setInterval(()=>{S3OffPillDraw();if(navigator.onLine&&S3Off.count)S3OffRun()},30000);
setTimeout(()=>{S3OffCount().then(()=>S3OffRun())},5000);
