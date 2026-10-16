# Patch de la page « Angle de 30° » (2.0 -> 3.0) : rubrique figée, aperçu partageable, cap lissé.
NEWDRAW = r'''function drawCover(c,img,W2,H2){let s=Math.max(W2/img.width,H2/img.height),iw=img.width*s,ih=img.height*s;c.drawImage(img,(W2-iw)/2,(H2-ih)/2,iw,ih)}
function snapBg(){try{if(!vd.videoWidth)return null;let c=document.createElement("canvas");c.width=vd.videoWidth;c.height=vd.videoHeight;c.getContext("2d").drawImage(vd,0,0);return c}catch{return null}}
function paint(c,W2,H2,hd,FVx,res){
  let X2=d=>(d/FVx+.5)*W2;
  if(res)for(let x2=0;x2<W2;x2+=4){let b0=((hd+(x2/W2-.5)*FVx)%360+360)%360;if(res.free&&inArc(b0,res.free[0],res.free[1]))c.fillStyle="rgba(63,122,85,.45)";else{let nr=inArc(b0,Lh-res.ex,Lh+res.ex)||inArc(b0,Rh-res.ex,Rh+res.ex)||res.width<=0&&inArc(b0,Lh-res.ex,Rh+res.ex);c.fillStyle=nr?"rgba(210,81,63,.55)":"rgba(210,81,63,.28)"}c.fillRect(x2,0,4,H2)}
  c.font="600 13px Barlow, sans-serif",c.textAlign="center",c.fillStyle="#fff",c.strokeStyle="rgba(255,255,255,.75)",c.lineWidth=1;
  for(let d=Math.ceil((hd-FVx/2)/10)*10;d<=hd+FVx/2;d+=10){let x2=X2(d-hd);c.beginPath(),c.moveTo(x2,H2),c.lineTo(x2,H2-(d%30===0?18:10)),c.stroke(),d%30===0&&c.fillText(String((d%360+360)%360),x2,H2-24)}
  let mark=(b0,lab,col2)=>{let d=hl2(hd,b0);if(Math.abs(d)<FVx/2){let x2=X2(d);c.strokeStyle=col2,c.fillStyle=col2,c.lineWidth=3,c.setLineDash([6,5]),c.beginPath(),c.moveTo(x2,64),c.lineTo(x2,H2-40),c.stroke(),c.setLineDash([]),c.fillText(lab,x2,58)}else c.fillStyle=col2,c.fillText(d<0?"◀ "+lab:lab+" ▶",d<0?64:W2-64,H2/2+30)};
  Lh!=null&&mark(Lh,"Obstacle gauche","#8EC5FF"),Rh!=null&&mark(Rh,"Obstacle droit","#8EC5FF"),res&&res.free&&(mark(res.free[0],"début zone","#9BE3B1"),mark(res.free[1],"fin zone","#9BE3B1"));
  c.strokeStyle="#fff",c.lineWidth=2,c.beginPath(),c.moveTo(W2/2,H2/2-26),c.lineTo(W2/2,H2/2+26),c.moveTo(W2/2-26,H2/2),c.lineTo(W2/2+26,H2/2),c.stroke()
}
function banner(c,W2,H2,hd,res){
  let txt,col,ok=!!(res&&res.free&&inArc(hd,res.free[0],res.free[1]));
  if(step===1)txt="1/2 · Visez l’obstacle de GAUCHE",col="#2F6F8F";
  else if(step===2)txt="2/2 · Visez l’obstacle de DROITE",col="#2F6F8F";
  else txt=ok?"TIR AUTORISÉ":"TIR INTERDIT",col=ok?"#3F7A55":"#D2513F";
  c.fillStyle=col,c.fillRect(0,0,W2,34),c.fillStyle="#fff",c.font="700 18px Barlow Condensed, sans-serif",c.textAlign="center",c.fillText(txt+" · "+Math.round(hd)+"° "+A30Nl(hd),W2/2,23);
  return ok
}
function freeze(){frozen={bg:snapBg(),hd:dh!=null?dh:dir(),FV:FV,drawn:!1,W:0,H:0};vd.style.visibility="hidden";fzRef&&fzRef()}
function unfreeze(){frozen=null;vd.style.visibility="";fzRef&&fzRef()}
function apercu(){
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
    ang = _rep(ang, 'noCam=!1,onEv=null,host=e("div")', 'noCam=!1,onEv=null,dh=null,frozen=null,fzRef=null,host=e("div")')
    ang = _cut(ang, 'function draw(){', 'function intro(){', NEWDRAW)
    ang = _rep(ang, 'function intro(){step=0,', 'function intro(){frozen=null,vd.style.visibility="",step=0,')
    ang = _rep(ang, 'function aim(n){step=n,', 'function aim(n){frozen=null,vd.style.visibility="",step=n,')
    ang = _rep(ang, 'function result(){step=3,W(host),top0(),rb.style.display="block";let res=A30Calc(Lh,Rh,m),f0=a=>Math.round((a%360+360)%360),warn=[]',
        'function result(){step=3,frozen=null,vd.style.visibility="",W(host),top0(),rb.style.display="block";'
        'let fzBox=e("div.row",{style:{gap:"8px",flexWrap:"wrap"}}),fzUI=()=>{W(fzBox),frozen?C(fzBox,x("Reprendre le direct",{icon:"camera",size:"sm",onClick:unfreeze}),x("Aperçu à partager",{icon:"download",kind:"primary",size:"sm",onClick:apercu})):C(fzBox,x("Figer l’image",{icon:"camera",kind:"primary",size:"sm",onClick:freeze}),x("Aperçu à partager",{icon:"download",size:"sm",onClick:apercu}))};fzRef=fzUI,fzUI();'
        'let res=A30Calc(Lh,Rh,m),f0=a=>Math.round((a%360+360)%360),warn=[]')
    ang = _rep(ang, 'e("div.stack",stage,head,', 'e("div.stack",stage,fzBox,head,')
    return bundle[:k] + ang + bundle[end:]
