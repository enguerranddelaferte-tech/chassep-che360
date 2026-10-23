/* ----- Analyse des photos par YOLOv8 (3.0) ----- */
/* Le modèle YOLOv8n-cls tourne sur l’appareil, dans un Web Worker : la photo ne part nulle part pour être analysée.
   Seuls les libellés trouvés accompagnent la publication. Une espèce protégée probable ou une tenue légère
   envoie la publication en validation (règle appliquée par la base). */
var S3V={worker:null,ready:null,seq:0,cb:{},byPhoto:new Map(),off:false};
/* Repères utiles : [indices ImageNet, libellé français, type, seuil] — type « p » = espèce protégée, « t » = tenue légère, « g » = repère */
const S3VGroups=[
  [[269,270,271],"Loup","p",.45],[[287],"Lynx","p",.45],[[294],"Ours brun","p",.5],[[360],"Loutre","p",.5],[[337],"Castor","p",.5],
  [[350],"Bouquetin","p",.85],[[21],"Milan (rapace)","p",.5],[[22],"Aigle","p",.5],[[23],"Vautour","p",.5],[[24],"Chouette ou hibou","p",.5],
  [[127],"Cigogne blanche","p",.5],[[128],"Cigogne noire","p",.5],[[129],"Spatule","p",.5],[[130],"Flamant rose","p",.5],
  [[131,132],"Héron ou aigrette","p",.5],[[133],"Butor","p",.5],[[134],"Grue cendrée","p",.5],[[138],"Outarde","p",.5],
  [[92],"Guêpier","p",.5],[[10,11],"Petit passereau protégé","p",.6],[[25],"Salamandre","p",.5],[[26,27],"Triton","p",.5],[[31],"Rainette","p",.5],
  [[33,34],"Tortue marine","p",.5],[[394],"Esturgeon","p",.6],
  [[445,459,639,842,655],"Tenue légère","t",.5],
  [[351,352,353],"Cervidé","g",.3],[[342,343],"Sanglier","g",.3],[[330,331,332],"Lièvre ou lapin","g",.3],[[277,278,279,280],"Renard","g",.3],
  [[362],"Blaireau","g",.3],[[97,98,99],"Canard ou oie","g",.3],[[80,81,82,83,85,86],"Gibier à plumes","g",.3],
  [[0,1,390,391,395],"Poisson","g",.3],[[758],"Moulinet","g",.3],[[764,413],"Arme","g",.3],[Array.from({length:118},(_,i)=>151+i),"Chien","g",.35]
];
function S3VBase(){return new URL("models/",location.href).href}
function S3VWorker(){
  if(S3V.ready)return S3V.ready;
  S3V.ready=new Promise((ok,ko)=>{
    try{
      let src=S3YoloEngine.toString()+"\nvar run=null;self.onmessage=async function(e){var m=e.data;try{"+
        "if(m.t==='load'){var r=await Promise.all([fetch(m.base+'yolov8n-cls.json').then(function(x){if(!x.ok)throw new Error('modele '+x.status);return x.json()}),fetch(m.base+'yolov8n-cls.bin').then(function(x){if(!x.ok)throw new Error('modele '+x.status);return x.arrayBuffer()})]);run=S3YoloEngine(r[0],r[1]);self.postMessage({t:'ready',size:r[0].size});}"+
        "else if(m.t==='run'){var p=run(m.x);self.postMessage({t:'res',id:m.id,p:p},[p.buffer]);}"+
        "}catch(err){self.postMessage({t:'err',id:m.id,e:String(err&&err.message||err)})}};";
      let wk=new Worker(URL.createObjectURL(new Blob([src],{type:"text/javascript"})));
      wk.onmessage=ev=>{let m=ev.data;
        if(m.t==="ready"){S3V.size=m.size;ok(wk);return}
        if(m.t==="err"&&m.id==null){S3V.off=true;ko(new Error(m.e));return}
        let c=S3V.cb[m.id];if(!c)return;delete S3V.cb[m.id];m.t==="res"?c.ok(m.p):c.ko(new Error(m.e))};
      wk.onerror=ev=>{S3V.off=true;ko(new Error(ev.message||"worker"))};
      wk.postMessage({t:"load",base:S3VBase()});
      S3V.worker=wk;
    }catch(er){S3V.off=true;ko(er)}
  });
  S3V.ready.catch(()=>{});
  return S3V.ready;
}
/* Prétraitement identique à l’entraînement : petit côté à 224 px, recadrage central, RVB entre 0 et 1 */
async function S3VPixels(file,size){
  let bmp=await createImageBitmap(file);
  let s=Math.min(bmp.width,bmp.height),cv=document.createElement("canvas");cv.width=cv.height=size;
  let cx=cv.getContext("2d",{willReadFrequently:true});cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality="high";
  cx.drawImage(bmp,(bmp.width-s)/2,(bmp.height-s)/2,s,s,0,0,size,size);try{bmp.close()}catch{}
  let d=cx.getImageData(0,0,size,size).data,n=size*size,x=new Float32Array(3*n);
  for(let i=0;i<n;i++){x[i]=d[i*4]/255;x[n+i]=d[i*4+1]/255;x[2*n+i]=d[i*4+2]/255}
  return x;
}
function S3VRules(p){
  let found=[],flag=null,flagLabel=null;
  S3VGroups.forEach(([ids,label,kind,th])=>{
    let s=0;ids.forEach(i=>{s+=p[i]});
    if(s>=th)found.push({label,kind,p:Math.round(s*100)/100});
  });
  found.sort((a,b)=>b.p-a.p);
  let prot=found.find(f=>f.kind==="p"),ten=found.find(f=>f.kind==="t");
  if(prot){flag="espece-protegee";flagLabel=prot.label}else if(ten){flag="tenue";flagLabel=ten.label}
  let top=[...p.keys()].sort((a,b)=>p[b]-p[a]).slice(0,3).map(i=>[i,Math.round(p[i]*100)/100]);
  return {model:"yolov8n-cls",at:new Date().toISOString(),found:found.slice(0,4),top,flag,flagLabel};
}
async function S3VisionAnalyze(file){
  if(S3V.off||typeof Worker==="undefined"||typeof createImageBitmap==="undefined")return null;
  let wk=await S3VWorker();
  let x=await S3VPixels(file,S3V.size||224),id=++S3V.seq;
  let p=await new Promise((ok,ko)=>{S3V.cb[id]={ok,ko};wk.postMessage({t:"run",id,x},[x.buffer]);setTimeout(()=>{if(S3V.cb[id]){delete S3V.cb[id];ko(new Error("délai"))}},30000)});
  return S3VRules(p);
}
/* Lancé quand une photo est choisie dans une publication ; le résultat est rattaché à la photo */
function S3VisionStart(file,photo,st){
  if(!photo||typeof photo!=="string"||S3V.off)return;
  st=st||(()=>{});
  let pr=S3VisionAnalyze(file).then(r=>{
    if(r)console.info("Analyse YOLOv8 :",S3VisionText(r));
    if(r&&r.flag==="espece-protegee")st("Analyse automatique : possible "+r.flagLabel.toLowerCase()+", espèce protégée. Votre publication sera vérifiée par l’équipe avant d’être visible.");
    else if(r&&r.flag==="tenue")st("Analyse automatique : la photo sera vérifiée par l’équipe avant d’être visible.");
    return r;
  }).catch(er=>{console.warn("Analyse photo indisponible :",er&&er.message);return null});
  S3V.byPhoto.set(photo,pr);
  if(S3V.byPhoto.size>20)S3V.byPhoto.delete(S3V.byPhoto.keys().next().value);
}
/* À la publication : attend l’analyse quelques secondes au plus, sans jamais bloquer */
async function S3VisionFor(photo){
  let pr=photo&&S3V.byPhoto.get(photo);if(!pr)return null;
  let r=await Promise.race([pr,new Promise(ok=>setTimeout(()=>ok(null),6000))]);
  return r||null;
}
/* Libellé lisible pour l’équipe */
function S3VisionText(v){
  if(!v)return "";
  let f=(v.found||[]).map(x2=>x2.label+" "+Math.round(x2.p*100)+" %").join(", ");
  return (v.flag==="espece-protegee"?"Espèce protégée probable : "+v.flagLabel+". ":v.flag==="tenue"?"Tenue légère probable. ":"")+(f?"Repéré : "+f+".":"Rien de particulier repéré.");
}
