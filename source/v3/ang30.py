# Patch de la page « Angle de 30° » (2.0 -> 3.0) : rubrique figée, aperçu partageable, cap lissé.
NEWDRAW = r'''function drawCover(c,img,W2,H2){let s=Math.max(W2/img.width,H2/img.height),iw=img.width*s,ih=img.height*s;c.drawImage(img,(W2-iw)/2,(H2-ih)/2,iw,ih)}
function snapBg(){try{if(!vd.videoWidth)return null;let c=document.createElement("canvas");c.width=vd.videoWidth;c.height=vd.videoHeight;c.getContext("2d").drawImage(vd,0,0);return c}catch{return null}}
function paint(c,W2,H2,hd,FVx,res,noCross){
  let X2=d=>(d/FVx+.5)*W2;
  if(res)for(let x2=0;x2<W2;x2+=4){let b0=((hd+(x2/W2-.5)*FVx)%360+360)%360;if(res.free&&inArc(b0,res.free[0],res.free[1]))c.fillStyle="rgba(63,122,85,.45)";else{let nr=inArc(b0,Lh-res.ex,Lh+res.ex)||inArc(b0,Rh-res.ex,Rh+res.ex)||res.width<=0&&inArc(b0,Lh-res.ex,Rh+res.ex);c.fillStyle=nr?"rgba(210,81,63,.55)":"rgba(210,81,63,.28)"}c.fillRect(x2,0,4,H2)}
  c.font="600 13px Barlow, sans-serif",c.textAlign="center",c.fillStyle="#fff",c.strokeStyle="rgba(255,255,255,.75)",c.lineWidth=1;
  for(let d=Math.ceil((hd-FVx/2)/10)*10;d<=hd+FVx/2;d+=10){let x2=X2(d-hd);c.beginPath(),c.moveTo(x2,H2),c.lineTo(x2,H2-(d%30===0?18:10)),c.stroke(),d%30===0&&c.fillText(String((d%360+360)%360),x2,H2-24)}
  let mark=(b0,lab,col2)=>{let d=hl2(hd,b0);if(Math.abs(d)<FVx/2){let x2=X2(d);c.strokeStyle=col2,c.fillStyle=col2,c.lineWidth=3,c.setLineDash([6,5]),c.beginPath(),c.moveTo(x2,64),c.lineTo(x2,H2-40),c.stroke(),c.setLineDash([]),c.fillText(lab,x2,58)}else c.fillStyle=col2,c.fillText(d<0?"◀ "+lab:lab+" ▶",d<0?64:W2-64,H2/2+30)};
  Lh!=null&&mark(Lh,"Obstacle gauche","#8EC5FF"),Rh!=null&&mark(Rh,"Obstacle droit","#8EC5FF"),res&&res.free&&(mark(res.free[0],"début zone","#9BE3B1"),mark(res.free[1],"fin zone","#9BE3B1"));
  noCross||(c.strokeStyle="#fff",c.lineWidth=2,c.beginPath(),c.moveTo(W2/2,H2/2-26),c.lineTo(W2/2,H2/2+26),c.moveTo(W2/2-26,H2/2),c.lineTo(W2/2+26,H2/2),c.stroke())
}
function banner(c,W2,H2,hd,res){
  let txt,col,ok=!!(res&&res.free&&inArc(hd,res.free[0],res.free[1]));
  if(step===1)txt="1/2 · Visez l’obstacle de GAUCHE",col="#2F6F8F";
  else if(step===2)txt="2/2 · Visez l’obstacle de DROITE",col="#2F6F8F";
  else txt=ok?"TIR AUTORISÉ":"TIR INTERDIT",col=ok?"#3F7A55":"#D2513F";
  c.fillStyle=col,c.fillRect(0,0,W2,34),c.fillStyle="#fff",c.font="700 18px Barlow Condensed, sans-serif",c.textAlign="center",c.fillText(txt+" · "+Math.round(hd)+"° "+A30Nl(hd),W2/2,23);
  return ok
}
/* ---- Panorama grand angle : on balaie la zone, l’appli assemble les tranches d’image selon le cap ---- */
function panoStart(){let res=A30Calc(Lh,Rh,m);if(!res)return;if(noCam||!vd.videoWidth){A("Caméra indisponible : le panorama a besoin de la caméra.","warn");return}
  let pad=15,span=Math.min(300,((Rh-Lh+360)%360)+2*pad),start=((Lh-pad)%360+360)%360,W2=cv.clientWidth||360,H2=cv.clientHeight||420,ppd=10,PH=Math.max(240,Math.min(900,Math.round(ppd*FV*H2/W2)));
  let can=document.createElement("canvas");can.width=Math.round(span*ppd),can.height=PH;let g=can.getContext("2d");g.fillStyle="#0b1210",g.fillRect(0,0,can.width,PH);
  pano={state:"cap",start,span,ppd,can,g,cov:new Uint8Array(Math.ceil(span)+1),t:0};panoHide();fzRef&&fzRef()}
function panoCov(){if(!pano)return 0;let n=0;for(let i=0;i<pano.cov.length;i++)n+=pano.cov[i];return n/pano.cov.length}
function panoGrab(W2,H2,hd){let P=pano,tn=performance.now();if(tn-P.t<45||!vd.videoWidth)return;P.t=tn;
  const wd=6;let rel=((hd-P.start)%360+360)%360;if(rel>=360-wd)rel-=360;if(rel>P.span+wd/2)return;
  let vw=vd.videoWidth,vh=vd.videoHeight,s=Math.max(W2/vw,H2/vh),dW=W2/s,dH=H2/s,k=dW/FV,sw=k*wd;
  try{P.g.drawImage(vd,vw/2-sw/2,(vh-dH)/2,sw,dH,(rel-wd/2)*P.ppd,0,wd*P.ppd,P.can.height)}catch{return}
  for(let d=Math.ceil(rel-wd/2);d<=Math.floor(rel+wd/2);d++)d>=0&&d<P.cov.length&&(P.cov[d]=1);
  panoCov()>=.97&&panoDone()}
function panoDone(){if(!pano)return;pano.state="done";navigator.vibrate&&navigator.vibrate(60);panoShow();fzRef&&fzRef()}
function panoCancel(){pano=null;panoHide();fzRef&&fzRef()}
function panoHide(){pv&&(pv.style.display="none");vd.style.visibility="";cv.style.visibility=""}
function panoDraw(c,Wd,Hd,res,big){let P=pano,cen=(P.start+P.span/2)%360,cw=Wd/P.span;
  c.drawImage(P.can,0,0,Wd,Hd);c.fillStyle="rgba(11,18,16,.88)";for(let d=0;d<P.cov.length;d++)P.cov[d]||c.fillRect(d*cw-.5,0,cw+1,Hd);
  paint(c,Wd,Hd,cen,P.span,res,!0);
  let f0=a=>Math.round((a%360+360)%360),txt=res&&res.free?"Zone de tir "+f0(res.free[0])+"° → "+f0(res.free[1])+"° · rouge : interdit":"Aucune zone de tir à ce poste";
  c.fillStyle=res&&res.free?"rgba(63,122,85,.92)":"rgba(210,81,63,.92)",c.fillRect(0,0,Wd,big?44:30),c.fillStyle="#fff",c.font="700 "+(big?24:15)+"px Barlow Condensed, sans-serif",c.textAlign="left";
  for(let x0=12;x0<Wd;x0+=big?900:520)c.fillText("PANORAMA · "+txt,x0,big?30:20)}
function panoShow(){if(!pano||pano.state!=="done")return;
  if(!pv){pcv=e("canvas",{style:{display:"block"}});pv=e("div",{style:{position:"absolute",inset:"0",overflowX:"auto",overflowY:"hidden",display:"none",background:"#0b1210",touchAction:"pan-x"}},pcv);stage.insertBefore(pv,rb)}
  pv.style.display="block",vd.style.visibility="hidden",cv.style.visibility="hidden";
  let Hd=stage.clientHeight||420,Wd=Math.round(pano.can.width*Hd/pano.can.height),dpr=Math.min(2,window.devicePixelRatio||1),res=A30Calc(Lh,Rh,m);
  pcv.width=Wd*dpr,pcv.height=Hd*dpr,pcv.style.width=Wd+"px",pcv.style.height=Hd+"px";let c=pcv.getContext("2d");c.scale(dpr,dpr),panoDraw(c,Wd,Hd,res,!1);
  let mid=res&&res.free?((res.free[0]+res.width/2-pano.start)%360+360)%360:pano.span/2;requestAnimationFrame(()=>{pv.scrollLeft=Math.max(0,mid/pano.span*Wd-(stage.clientWidth||360)/2)})}
function panoExport(){let P=pano,res=A30Calc(Lh,Rh,m),Wn=P.can.width,Hn=P.can.height,F2=120,f0=a=>Math.round((a%360+360)%360);
  let ex=document.createElement("canvas");ex.width=Wn,ex.height=Hn+F2;let c=ex.getContext("2d");panoDraw(c,Wn,Hn,res,!0);
  c.fillStyle="#131b19",c.fillRect(0,Hn,Wn,F2),c.textAlign="left",c.fillStyle="#fff",c.font="700 28px Barlow, sans-serif";
  c.fillText(res&&res.free?"Zone de tir : "+f0(res.free[0])+"° → "+f0(res.free[1])+"° (largeur "+Math.round(res.width)+"°)":"Aucune zone de tir à ce poste",24,Hn+42);
  c.font="600 20px Barlow, sans-serif",c.fillText("Obstacles "+f0(Lh)+"° / "+f0(Rh)+"° · marge "+m+"° · panorama de "+Math.round(P.span)+"°",24,Hn+76);
  c.fillStyle="rgba(255,255,255,.7)",c.fillText(new Date().toLocaleString("fr-FR")+" · Chasse & Pêche 360° · aide visuelle, à valider sur le terrain",24,Hn+104);
  ex.toBlob(async blob=>{
    if(!blob){A("Aperçu impossible à créer ici.","warn");return}
    let file=new File([blob],"panorama-zone-de-tir.png",{type:"image/png"});
    try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:"Panorama de la zone de tir"});return}}catch(er){if(er&&er.name==="AbortError")return}
    let u=URL.createObjectURL(blob),a=e("a",{href:u,download:"panorama-zone-de-tir.png"});document.body.append(a),a.click(),setTimeout(()=>{a.remove(),URL.revokeObjectURL(u)},4e3);
    A("Panorama enregistré : il reste sur cet appareil.","ok")
  },"image/png")}
function freeze(){frozen={bg:snapBg(),hd:dh!=null?dh:dir(),FV:FV,drawn:!1,W:0,H:0};vd.style.visibility="hidden";fzRef&&fzRef()}
function unfreeze(){frozen=null;vd.style.visibility="";fzRef&&fzRef()}
function apercu(){if(pano&&pano.state==="done")return panoExport();
  let fz=frozen||{bg:snapBg(),hd:dh!=null?dh:dir(),FV:FV},res=A30Calc(Lh,Rh,m),f0=a=>Math.round((a%360+360)%360),W0=cv.clientWidth||360,H0=cv.clientHeight||420,S=2,FOOT=96;
  if(!res)return;
  let ex=document.createElement("canvas");ex.width=W0*S;ex.height=(H0+FOOT)*S;
  let c=ex.getContext("2d");c.fillStyle="#0b1210";c.fillRect(0,0,ex.width,ex.height);
  c.save(),c.scale(S,S),fz.bg?drawCover(c,fz.bg,W0,H0):(c.fillStyle="#1c2a26",c.fillRect(0,0,W0,H0)),paint(c,W0,H0,fz.hd,fz.FV,res),banner(c,W0,H0,fz.hd,res),c.restore();
  c.fillStyle="#131b19",c.fillRect(0,H0*S,ex.width,FOOT*S),c.textAlign="left";
  let L1=res.free?"Zone de tir : "+f0(res.free[0])+"° → "+f0(res.free[1])+"° (largeur "+Math.round(res.width)+"°)":"Aucune zone de tir à ce poste",
      L2="Obstacles "+f0(Lh)+"° / "+f0(Rh)+"° · marge "+m+"° · cap de la photo "+f0(fz.hd)+"° ("+A30Nl(fz.hd)+")",
      L3=new Date().toLocaleString("fr-FR")+" · Chasse & Pêche 360° · aide visuelle, à valider sur le terrain";
  c.fillStyle="#fff",c.font="700 "+(16*S)+"px Barlow, sans-serif",c.fillText(L1,16*S,(H0+30)*S);
  c.font="600 "+(13*S)+"px Barlow, sans-serif",c.fillText(L2,16*S,(H0+56)*S);
  c.fillStyle="rgba(255,255,255,.7)",c.fillText(L3,16*S,(H0+80)*S);
  ex.toBlob(async blob=>{
    if(!blob){A("Aperçu impossible à créer ici.","warn");return}
    let file=new File([blob],"zone-de-tir-30.png",{type:"image/png"});
    try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:"Zone de tir 30°"});return}}catch(er){if(er&&er.name==="AbortError")return}
    let u=URL.createObjectURL(blob),a=e("a",{href:u,download:"zone-de-tir-30.png"});document.body.append(a),a.click(),setTimeout(()=>{a.remove(),URL.revokeObjectURL(u)},4e3);
    A("Aperçu créé : il reste sur cet appareil.","ok")
  },"image/png")
}
function draw(){FV=A30Fov(vd,cv,dv);let W2=cv.clientWidth,H2=cv.clientHeight;
  if(pano&&pano.state==="done"){rf=requestAnimationFrame(draw);return}
  if(frozen){
    if(W2&&H2&&!(frozen.drawn&&frozen.W===W2&&frozen.H===H2)){
      (cv.width!==W2||cv.height!==H2)&&(cv.width=W2,cv.height=H2);
      let c=cv.getContext("2d"),res=step===3?A30Calc(Lh,Rh,m):null;
      c.clearRect(0,0,W2,H2),frozen.bg?drawCover(c,frozen.bg,W2,H2):(c.fillStyle="#1c2a26",c.fillRect(0,0,W2,H2));
      paint(c,W2,H2,frozen.hd,frozen.FV,res),banner(c,W2,H2,frozen.hd,res);
      c.font="600 12px Barlow, sans-serif",c.fillStyle="rgba(255,255,255,.85)",c.textAlign="center",c.fillText("Image figée · « Reprendre le direct » pour rebouger",W2/2,H2-8);
      frozen.drawn=!0,frozen.W=W2,frozen.H=H2
    }
    rf=requestAnimationFrame(draw);return
  }
  if(camStab&&!noCam&&vd.readyState>=2){let tn=performance.now();if(tn-stT>80){stT=tn;try{sctx||(sc.width=96,sc.height=72,sctx=sc.getContext("2d",{willReadFrequently:!0}));sctx.drawImage(vd,0,0,96,72);let r0=still(sctx.getImageData(0,0,96,72).data,96,72);stN=r0.ok&&r0.still?stN+1:0;cmp.hold(stN>=3)}catch{cmp.hold(!1)}}}else cmp.hold(!1);
  if(!W2){rf=requestAnimationFrame(draw);return}
  (cv.width!==W2||cv.height!==H2)&&(cv.width=W2,cv.height=H2);
  let raw=dir();if(dh==null)dh=raw;else{let d=hl2(dh,raw);dh=(dh+d*(Math.abs(d)>.5?.3:.06)+360)%360}
  let c=cv.getContext("2d"),hd=dh,res=step===3?A30Calc(Lh,Rh,m):null;
  c.clearRect(0,0,W2,H2),paint(c,W2,H2,hd,FV,res);
  let ok=banner(c,W2,H2,hd,res);
  if(pano&&pano.state==="cap"){panoGrab(W2,H2,hd);let P=pano,pc=panoCov(),rel=((hd-P.start)%360+360)%360,bw=W2-40;
    c.fillStyle="#2F6F8F",c.fillRect(0,0,W2,34),c.fillStyle="#fff",c.font="700 17px Barlow Condensed, sans-serif",c.textAlign="center",c.fillText("PANORAMA · tournez lentement vers la droite · "+Math.round(pc*100)+" %",W2/2,23);
    c.fillStyle="rgba(19,27,25,.75)",c.fillRect(16,H2-64,bw+8,22);for(let d=0;d<P.cov.length;d++)c.fillStyle=P.cov[d]?"#9BE3B1":"rgba(255,255,255,.25)",c.fillRect(20+d*bw/P.span,H2-60,Math.max(1,bw/P.span),14);
    rel<=P.span&&(c.fillStyle="#FFD27A",c.fillRect(20+rel*bw/P.span-2,H2-66,4,26));pano&&pano.state==="cap"&&fzRef&&P.lastPc!==Math.round(pc*20)&&(P.lastPc=Math.round(pc*20))}
  if(step===3&&res){!ok&&pf===!1&&navigator.vibrate&&navigator.vibrate([120,70,120]);pf=!ok}
  c.textAlign="center",noCam&&(c.font="600 12px Barlow, sans-serif",c.fillStyle="rgba(255,255,255,.8)",c.fillText("Caméra indisponible : visée sur fond neutre",W2/2,H2-44)),
  cur()==null&&(c.font="600 12px Barlow, sans-serif",c.fillStyle="#FFD27A",c.fillText("Boussole indisponible : faites glisser pour tourner",W2/2,H2/2-44)),
  cur()!=null&&(c.font="600 12px Barlow, sans-serif",c.fillStyle=!cmp.locked()||cmp.mode()!=="gyro"?"#FFD27A":"rgba(155,227,177,.95)",c.fillText(cmp.locked()?cmp.mode()==="gyro"?"Repère verrouillé (gyroscope seul)"+(cmp.holding()?" · stabilisé par la caméra":""):"Gyroscope indisponible : mesure impossible":"Calibrage : tenez le téléphone immobile…",W2/2,H2-6)),
  live&&live._needle(cur()),rf=requestAnimationFrame(draw)}
'''

def _cut(s, start, end, new):
    i = s.find(start); assert i >= 0, start
    j = s.find(end, i); assert j >= 0, end
    return s[:i] + new + s[j:]

def _rep(s, old, new):
    n = s.count(old); assert n == 1, (old[:60], n)
    return s.replace(old, new)

def patch_ang30(bundle):
    k = bundle.find('async function Ang30(t){'); assert k >= 0
    end = bundle.find('var A30M={};', k); assert end > k
    ang = bundle[k:end]
    ang = _rep(ang, 'noCam=!1,onEv=null,host=e("div")', 'noCam=!1,onEv=null,dh=null,frozen=null,fzRef=null,pano=null,pv=null,pcv=null,host=e("div")')
    ang = _cut(ang, 'function draw(){', 'function intro(){', NEWDRAW)
    ang = _rep(ang, 'function intro(){step=0,', 'function intro(){frozen=null,pano=null,panoHide(),step=0,')
    ang = _rep(ang, 'function aim(n){step=n,', 'function aim(n){frozen=null,pano=null,panoHide(),step=n,')
    ang = _rep(ang, 'function result(){step=3,W(host),top0(),rb.style.display="block";let res=A30Calc(Lh,Rh,m),f0=a=>Math.round((a%360+360)%360),warn=[]',
        'function result(){step=3,frozen=null,pano=null,panoHide(),W(host),top0(),rb.style.display="block";'
        'let fzBox=e("div.stack",{style:{gap:"8px"}}),fzUI=()=>{W(fzBox);let row=e("div.row",{style:{gap:"8px",flexWrap:"wrap"}});'
        'if(pano&&pano.state==="cap")C(fzBox,e("p.small",{style:{margin:0}},"Partez de l’obstacle de gauche et tournez lentement vers la droite, téléphone bien droit, jusqu’après l’obstacle de droite. Le panorama se termine tout seul."),row),C(row,x("Terminer le panorama",{icon:"check",kind:"primary",size:"sm",onClick:panoDone}),x("Annuler",{kind:"ghost",size:"sm",onClick:panoCancel}));'
        'else if(pano&&pano.state==="done")C(fzBox,e("p.small.muted",{style:{margin:0}},"Image figée de toute la zone : faites-la glisser pour voir les obstacles. Vert : zone de tir ; rouge : interdit ; gris : partie non filmée."),row),C(row,x("Aperçu à partager",{icon:"download",kind:"primary",size:"sm",onClick:apercu}),x("Refaire le panorama",{icon:"camera",size:"sm",onClick:panoStart}),x("Reprendre le direct",{kind:"ghost",size:"sm",onClick:panoCancel}));'
        'else C(fzBox,row),C(row,x("Panorama de la zone",{icon:"camera",kind:"primary",size:"sm",onClick:panoStart}),x("Aperçu à partager",{icon:"download",size:"sm",onClick:apercu}))};fzRef=fzUI,fzUI();'
        'let res=A30Calc(Lh,Rh,m),f0=a=>Math.round((a%360+360)%360),warn=[]')
    ang = _rep(ang, 'e("div.stack",stage,head,', 'e("div.stack",stage,fzBox,head,')
    return bundle[:k] + ang + bundle[end:]
