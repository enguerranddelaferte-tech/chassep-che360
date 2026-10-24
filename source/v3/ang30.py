# Patch de la page « Angle de 30° » (2.0 -> 3.0) : rubrique figée, aperçu partageable, cap lissé.
NEWDRAW = r'''function drawCover(c,img,W2,H2){let s=Math.max(W2/img.width,H2/img.height),iw=img.width*s,ih=img.height*s;c.drawImage(img,(W2-iw)/2,(H2-ih)/2,iw,ih)}
function snapBg(){try{if(!vd.videoWidth)return null;let c=document.createElement("canvas");c.width=vd.videoWidth;c.height=vd.videoHeight;c.getContext("2d").drawImage(vd,0,0);return c}catch{return null}}
function paint(c,W2,H2,hd,FVx,res,noCross){
  let tF=Math.tan(Math.min(FVx,170)*Math.PI/360),X2=d=>noCross?(d/FVx+.5)*W2:(.5+.5*Math.tan(Math.max(-80,Math.min(80,d))*Math.PI/180)/tF)*W2,B2=x2=>noCross?(x2/W2-.5)*FVx:Math.atan((x2/W2-.5)*2*tF)*180/Math.PI;
  if(res)for(let x2=0;x2<W2;x2+=4){let b0=((hd+B2(x2+2))%360+360)%360;if(res.free&&inArc(b0,res.free[0],res.free[1]))c.fillStyle="rgba(63,122,85,.45)";else{let nr=inArc(b0,Lh-res.ex,Lh+res.ex)||inArc(b0,Rh-res.ex,Rh+res.ex)||res.width<=0&&inArc(b0,Lh-res.ex,Rh+res.ex);c.fillStyle=nr?"rgba(210,81,63,.55)":"rgba(210,81,63,.28)"}c.fillRect(x2,0,4,H2)}
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
  let pad=25,span=Math.min(320,((Rh-Lh+360)%360)+2*pad),start=((Lh-pad)%360+360)%360,W2=cv.clientWidth||360,H2=cv.clientHeight||420,ppd=10,PH=Math.max(240,Math.min(900,Math.round(ppd*FV*H2/W2)));
  let can=document.createElement("canvas");can.width=Math.round(span*ppd),can.height=PH;let g=can.getContext("2d");g.fillStyle="#0b1210",g.fillRect(0,0,can.width,PH);
  pano={state:"cap",start,span,ppd,can,g,cov:new Uint8Array(Math.ceil(span)+1),t:0};panoHide();fzRef&&fzRef()}
function panoAuto(W2,H2){let ppd=10,PH=Math.max(240,Math.min(900,Math.round(ppd*FV*H2/W2))),can=document.createElement("canvas");can.width=360*ppd,can.height=PH;let g=can.getContext("2d");g.fillStyle="#0b1210",g.fillRect(0,0,can.width,PH);return{state:"cap",auto:!0,start:0,span:360,ppd,can,g,cov:new Uint8Array(361),t:0}}
function panoCov(){if(!pano)return 0;let n=0;for(let i=0;i<pano.cov.length;i++)n+=pano.cov[i];return n/pano.cov.length}
let hh=[];function hAt(t0){for(let i=hh.length-1;i>0;i--)if(hh[i-1][0]<=t0){let a=hh[i-1],b=hh[i],f=(t0-a[0])/Math.max(1,b[0]-a[0]);return (a[1]+hl2(a[1],b[1])*f+360)%360}return hh.length?hh[0][1]:null}
function panoGrab(W2,H2,hd){let P=pano,tn=performance.now();if(tn-P.t<45||!vd.videoWidth)return;P.t=tn;
  const wd=6;let rel=((hd-P.start)%360+360)%360;if(rel>=360-wd)rel-=360;if(rel>P.span+wd/2)return;
  let vw=vd.videoWidth,vh=vd.videoHeight,s=Math.max(W2/vw,H2/vh),dW=W2/s,dH=H2/s,k=dW/2/Math.tan(FV*Math.PI/360)*Math.PI/180,sw=k*wd;
  /* calibrage automatique du champ de vision : décalage de l’image entre deux prises comparé à la rotation mesurée */
  try{let pr=visGray(vd,(vw-dW)/2,(vh-dH)/2,dW,dH,160,30),col=new Float32Array(160);for(let y=0;y<30;y++)for(let x=0;x<160;x++)col[x]+=pr[y*160+x]/30;
    if(P.pp){let dth=hl2(P.ph,hd);if(Math.abs(dth)>1&&Math.abs(dth)<9){let bs=0,bv=-2,cc={};for(let sh=-45;sh<=45;sh++){let a0=Math.max(20,20-sh),a1=Math.min(140,140-sh),ma=0,mb=0,nn=a1-a0;if(nn<60)continue;for(let x=a0;x<a1;x++)ma+=col[x],mb+=P.pp[x+sh];ma/=nn,mb/=nn;let sa=0,sb=0,cr=0;for(let x=a0;x<a1;x++){let u=col[x]-ma,v=P.pp[x+sh]-mb;sa+=u*u,sb+=v*v,cr+=u*v}let nc=sa>nn&&sb>nn?cr/Math.sqrt(sa*sb):-2;cc[sh]=nc;nc>bv&&(bv=nc,bs=sh)}
      if(cc[bs-1]!=null&&cc[bs+1]!=null){let dn=cc[bs-1]-2*bv+cc[bs+1];dn<0&&(bs+=(cc[bs-1]-cc[bs+1])/(2*dn))}
      bv>.9&&Math.abs(bs)>2&&Math.abs(bs)<44&&(P.fs=P.fs||[]).push(Math.abs(bs)/Math.abs(dth))}}
    P.pp=col,P.ph=hd}catch{}
  try{let dr=r9=>P.g.drawImage(vd,vw/2-sw/2,(vh-dH)/2,sw,dH,(r9-wd/2)*P.ppd,0,wd*P.ppd,P.can.height);dr(rel);P.span>=360&&(rel<wd&&dr(rel+360),rel>360-wd&&dr(rel-360))}catch{return}
  for(let d=Math.ceil(rel-wd/2);d<=Math.floor(rel+wd/2);d++)d>=0&&d<P.cov.length&&(P.cov[d]=1);
  !P.auto&&panoCov()>=.97&&panoDone()}
function panoCalib(){try{let f=(pano.fs||[]).slice().sort((a,b)=>a-b);if(f.length>=8){let pm=f[f.length>>1],fh=2*Math.atan(80*Math.PI/180/pm)*180/Math.PI;for(let it=0;it<6;it++){let U=.75*Math.tan(fh*Math.PI/360);fh=2*Math.atan(80*Math.PI/180/(pm/(1+U*U/3)))*180/Math.PI}let vw=vd.videoWidth,vh=vd.videoHeight,W=cv.clientWidth,H=cv.clientHeight,s0=Math.max(W/vw,H/vh),fr=Math.min(1,W/(s0*vw)),D=2*Math.atan(Math.tan(fh*Math.PI/360)/fr*Math.hypot(vw,vh)/vw)*180/Math.PI;
    if(fh>35&&fh<100&&D>50&&D<120){dv=Math.round(D),Pe.set("ang30:d",dv),A("Champ de vision de la caméra calibré automatiquement : "+Math.round(fh)+"° en largeur.","ok")}}}catch{}}
function panoAutoEnd(){if(pano&&pano.auto&&pano.state==="cap"){panoCalib();pano.state="done";pano.show=!1;vis=null;vok=!1}}
function panoDone(){if(!pano)return;panoCalib();pano.state="done";pano.show=!0;vis=null;vok=!1;navigator.vibrate&&navigator.vibrate(60);panoShow();fzRef&&fzRef()}
function recale(side){let tgt=side==="L"?Lh:Rh,cu=dh!=null?dh:dir();if(tgt==null||cu==null)return;let d=hl2(cu,tgt);vadj=(vadj+d+540)%360-180;dh=tgt;hh=[];pano&&pano.state==="done"&&(pano.start=(pano.start+d+360)%360,vis=null);A("Recalé sur l’obstacle de "+(side==="L"?"gauche":"droite")+" ("+(d>0?"+":"")+d.toFixed(1)+"°).","ok")}
function panoCancel(){pano=null;vis=null;vok=!1;panoHide();fzRef&&fzRef()}
function panoLive(){if(!pano)return;pano.show=!1;panoHide();fzRef&&fzRef()}
function panoView(){if(!pano)return;pano.show=!0;panoShow();fzRef&&fzRef()}
/* ---- Repère visuel : la caméra est comparée au panorama pour corriger la dérive du gyroscope ---- */
const VPD=2,VH=24;
function visGray(src,sx,sy,sw,sh,w,h){let c2=visGray.c||(visGray.c=document.createElement("canvas"));c2.width=w,c2.height=h;let g=c2.getContext("2d",{willReadFrequently:!0});g.drawImage(src,sx,sy,sw,sh,0,0,w,h);let d=g.getImageData(0,0,w,h).data,o=new Float32Array(w*h);for(let i=0;i<w*h;i++)o[i]=.299*d[i*4]+.587*d[i*4+1]+.114*d[i*4+2];return o}
function visTrack(raw,W2,H2){
  if(!pano||pano.state!=="done"||!vd.videoWidth)return (raw+vadj+360)%360;
  let tn=performance.now();if(tn-vT<140)return (raw+vadj+360)%360;vT=tn;
  try{
    let P=pano;if(!vis){let pw=Math.round(P.span*VPD);vis={pw,pd:visGray(P.can,0,0,P.can.width,P.can.height,pw,VH),bad:0}}
    let vw=vd.videoWidth,vh2=vd.videoHeight,s=Math.max(W2/vw,H2/vh2),dW=W2/s,dH=H2/s,LW=Math.max(20,Math.round(FV*VPD));
    let L=visGray(vd,(vw-dW)/2,(vh2-dH)/2,dW,dH,LW,VH),x0=Math.round(LW*.2),pwid=Math.round(LW*.6),r0=4,rh=VH-8;
    let tot=0,mA=0;for(let y=0;y<rh;y++)for(let x=0;x<pwid;x++)mA+=L[(y+r0)*LW+x0+x];mA/=pwid*rh;for(let y=0;y<rh;y++)for(let x=0;x<pwid;x++){let v=L[(y+r0)*LW+x0+x]-mA;tot+=v*v}if(tot<pwid*rh*4){vok=!1;return (raw+vadj+360)%360}
    let pred=((raw+vadj-P.start)%360+360)%360;if(pred>P.span+30&&pred<330){vok=!1;return (raw+vadj+360)%360}pred>180&&(pred-=360);
    let pc=Math.round(pred*VPD),best=-2,bx=0,sec=-2,pd=vis.pd,pw=vis.pw,minW=Math.round(pwid*.45);
    for(let dx=-26;dx<=26;dx++){let cx=pc+dx,lft=cx-Math.round(pwid/2),a0=Math.max(0,-lft),a1=Math.min(pwid,pw-lft),w=a1-a0;if(w<minW)continue;let n=w*rh;
      let mL=0;for(let y=0;y<rh;y++){let lr=(y+r0)*LW+x0;for(let x=a0;x<a1;x++)mL+=L[lr+x]}mL/=n;let sL=0;for(let y=0;y<rh;y++){let lr=(y+r0)*LW+x0;for(let x=a0;x<a1;x++){let v=L[lr+x]-mL;sL+=v*v}}if(sL<n*4)continue;
      for(let dy=-3;dy<=3;dy++){let mP=0;for(let y=0;y<rh;y++){let row=(y+r0+dy)*pw+lft;for(let x=a0;x<a1;x++)mP+=pd[row+x]}mP/=n;
        let sP=0,cr=0;for(let y=0;y<rh;y++){let row=(y+r0+dy)*pw+lft,lr=(y+r0)*LW+x0;for(let x=a0;x<a1;x++){let a=pd[row+x]-mP;sP+=a*a;cr+=a*(L[lr+x]-mL)}}
        if(sP<n*4)continue;let ncc=cr/Math.sqrt(sP*sL)*(.85+.15*w/pwid);
        if(ncc>best){Math.abs(cx-bx)>4&&(sec=Math.max(sec,best));best=ncc,bx=cx}else Math.abs(cx-bx)>4&&ncc>sec&&(sec=ncc)}}
    vconf=best;
    if(best>.55&&(best-sec>.03||best>.9)){let vhd=(P.start+bx/VPD)%360,tgt=hl2(raw,vhd),d=hl2(vadj,tgt);
      if(Math.abs(d)>6&&vok){vis.bad++;if(vis.bad<3)return (raw+vadj+360)%360}
      vis.bad=0,vadj=(vadj+d*(vok?.35:1)+360)%360;vadj>180&&(vadj-=360);vok=!0}
    else vok=!1;
  }catch{vok=!1}
  return (raw+vadj+360)%360}

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
function apercu(){if(pano&&pano.state==="done"&&pano.show)return panoExport();
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
  if(pano&&pano.state==="done"&&pano.show){rf=requestAnimationFrame(draw);return}
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
  let raw=visTrack(dir(),W2,H2),tnow=performance.now();hh.push([tnow,raw]);while(hh.length>40)hh.shift();if(dh==null)dh=raw;else{let d=hl2(dh,raw);dh=(dh+d*(Math.abs(d)>.5?.3:.06)+360)%360}
  let c=cv.getContext("2d"),hd=dh,res=step===3?A30Calc(Lh,Rh,m):null;
  c.clearRect(0,0,W2,H2),paint(c,W2,H2,hd,FV,res);
  let ok=banner(c,W2,H2,hd,res);
  if((step===1||step===2)&&!noCam&&vd.videoWidth){pano||(pano=panoAuto(W2,H2));if(pano.auto&&pano.state==="cap"){let ha=hAt(tnow-70);ha!=null&&panoGrab(W2,H2,ha)}}
  if(pano&&pano.state==="cap"&&!pano.auto){let hl=hAt(tnow-70);hl!=null&&panoGrab(W2,H2,hl);let P=pano,pc=panoCov(),rel=((hd-P.start)%360+360)%360,bw=W2-40;
    c.fillStyle="#2F6F8F",c.fillRect(0,0,W2,34),c.fillStyle="#fff",c.font="700 17px Barlow Condensed, sans-serif",c.textAlign="center",c.fillText("PANORAMA · tournez lentement vers la droite · "+Math.round(pc*100)+" %",W2/2,23);
    c.fillStyle="rgba(19,27,25,.75)",c.fillRect(16,H2-64,bw+8,22);for(let d=0;d<P.cov.length;d++)c.fillStyle=P.cov[d]?"#9BE3B1":"rgba(255,255,255,.25)",c.fillRect(20+d*bw/P.span,H2-60,Math.max(1,bw/P.span),14);
    rel<=P.span&&(c.fillStyle="#FFD27A",c.fillRect(20+rel*bw/P.span-2,H2-66,4,26));pano&&pano.state==="cap"&&fzRef&&P.lastPc!==Math.round(pc*20)&&(P.lastPc=Math.round(pc*20))}
  if(step===3&&res){!ok&&pf===!1&&navigator.vibrate&&navigator.vibrate([120,70,120]);pf=!ok}
  c.textAlign="center",noCam&&(c.font="600 12px Barlow, sans-serif",c.fillStyle="rgba(255,255,255,.8)",c.fillText("Caméra indisponible : visée sur fond neutre",W2/2,H2-44)),
  cur()==null&&(c.font="600 12px Barlow, sans-serif",c.fillStyle="#FFD27A",c.fillText("Boussole indisponible : faites glisser pour tourner",W2/2,H2/2-44)),
  cur()!=null&&(c.font="600 12px Barlow, sans-serif",c.fillStyle=!cmp.locked()||cmp.mode()!=="gyro"?"#FFD27A":"rgba(155,227,177,.95)",c.fillText(cmp.locked()?cmp.mode()==="gyro"?"Repère verrouillé (gyroscope seul)"+(cmp.holding()?" · stabilisé par la caméra":""):"Gyroscope indisponible : mesure impossible":"Calibrage : tenez le téléphone immobile…",W2/2,H2-6)),
  pano&&pano.state==="done"&&(c.font="700 13px Barlow, sans-serif",c.textAlign="center",c.fillStyle=vok?"rgba(155,227,177,.98)":"#FFD27A",c.fillText(vok?"Repère visuel verrouillé sur le panorama · pas de dérive":"Repère visuel : visez la zone filmée pour recaler",W2/2,H2-44));
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
    ang = _rep(ang, 'noCam=!1,onEv=null,host=e("div")', 'noCam=!1,onEv=null,dh=null,frozen=null,fzRef=null,pano=null,pv=null,pcv=null,vis=null,vadj=0,vok=!1,vT=0,vconf=0,host=e("div")')
    ang = _cut(ang, 'function draw(){', 'function intro(){', NEWDRAW)
    ang = _rep(ang, 'function intro(){step=0,', 'function intro(){frozen=null,pano=null,panoHide(),step=0,')
    ang = _rep(ang, 'function aim(n){step=n,', 'function aim(n){frozen=null,n===1&&(pano=null,vadj=0,vis=null,vok=!1),panoHide(),step=n,')
    ang = _rep(ang, 'function result(){step=3,W(host),top0(),rb.style.display="block";let res=A30Calc(Lh,Rh,m),f0=a=>Math.round((a%360+360)%360),warn=[]',
        'function result(){step=3,frozen=null,keepPano||(pano&&pano.auto?panoAutoEnd():(pano=null,panoHide())),keepPano=!1,W(host),top0(),rb.style.display="block";'
        'let mgBox=e("div.field",{style:{margin:0}},e("label","Marge en plus des 30\xB0"),ke([["0","Aucune (30\xB0 exacts)"],["5","+5\xB0"],["10","+10\xB0"]],String(m),v9=>{m=+v9,Pe.set("ang30:marge",m),keepPano=!0,result(),requestAnimationFrame(()=>{pano&&pano.state==="done"&&pano.show&&panoShow()})}),e("div.row",{style:{gap:"8px",flexWrap:"wrap",marginTop:"10px"}},x("Recaler sur l\u2019obstacle gauche",{icon:"target",size:"sm",onClick:()=>recale("L")}),x("Recaler sur l\u2019obstacle droit",{icon:"target",size:"sm",onClick:()=>recale("R")})),e("p.tiny.muted",{style:{margin:"6px 0 0"}},"En cas de doute, visez un de vos obstacles et touchez \xAB Recaler \xBB : l\u2019angle repart exactement de lui."));'
        'let fzBox=e("div.stack",{style:{gap:"8px"}}),fzUI=()=>{W(fzBox);let row=e("div.row",{style:{gap:"8px",flexWrap:"wrap"}});'
        'if(pano&&pano.state==="cap")C(fzBox,e("p.small",{style:{margin:0}},"Partez de l’obstacle de gauche et tournez lentement vers la droite, téléphone bien droit, jusqu’après l’obstacle de droite. Le panorama se termine tout seul."),row),C(row,x("Terminer le panorama",{icon:"check",kind:"primary",size:"sm",onClick:panoDone}),x("Annuler",{kind:"ghost",size:"sm",onClick:panoCancel}));'
        'else if(pano&&pano.state==="done"&&pano.show)C(fzBox,e("p.small.muted",{style:{margin:0}},"Image figée de toute la zone : faites-la glisser pour voir les obstacles. Vert : zone de tir ; rouge : interdit ; gris : partie non filmée. En revenant au direct, le panorama sert de repère visuel : l’angle ne dérive plus."),row),C(row,x("Revenir au direct",{icon:"camera",kind:"primary",size:"sm",onClick:panoLive}),x("Aperçu à partager",{icon:"download",size:"sm",onClick:apercu}),x("Refaire le panorama",{kind:"ghost",size:"sm",onClick:panoStart}));'
        'else if(pano&&pano.state==="done"&&!pano.auto)C(fzBox,e("p.small",{style:{margin:0}},"Repère visuel actif : la caméra se recale sur le panorama dès qu’elle voit la zone filmée, ce qui supprime la dérive. Gardez le téléphone droit."),row),C(row,x("Voir le panorama",{icon:"eye",kind:"primary",size:"sm",onClick:panoView}),x("Refaire le panorama",{size:"sm",onClick:panoStart}),x("Arrêter le repère visuel",{kind:"ghost",size:"sm",onClick:panoCancel}));'
        'else C(fzBox,e("p.small",{style:{margin:0}},pano&&pano.auto?"Repère visuel actif sur tout ce que la caméra a vu pendant les deux visées : l’angle se recale tout seul, sans dérive. Pour l’étendre à toute la zone, faites le panorama (10 secondes).":"Conseil : faites le panorama (10 secondes). Il sert ensuite de repère visuel et empêche l’angle de dériver."),row),C(row,x("Panorama de la zone",{icon:"camera",kind:"primary",size:"sm",onClick:panoStart}),x("Aperçu à partager",{icon:"download",size:"sm",onClick:apercu}))};fzRef=fzUI,fzUI();'
        'let res=A30Calc(Lh,Rh,m),f0=a=>Math.round((a%360+360)%360),warn=[]')
    ang = _rep(ang, 'e("div.stack",stage,head,', 'e("div.stack",stage,fzBox,head,mgBox,')
    # Marge : 0 par défaut (30° réglementaires exacts), marge facultative proposée à l'utilisateur
    ang = _rep(ang, 'm=+Pe.get("ang30:m",5)', 'm=+Pe.get("ang30:marge",0),keepPano=!1')
    ang = _rep(ang, 'Pe.set("ang30:m",m)', 'Pe.set("ang30:marge",m)')
    ang = _rep(ang, 'e("label","Marge de s\\xE9curit\\xE9, en plus des 30\\xB0"),ke([["0","0\\xB0"],["5","5\\xB0"],["10","10\\xB0"]]',
        'e("label","Marge en plus des 30\\xB0 (facultative)"),ke([["0","Aucune : 30\\xB0 exacts"],["5","+5\\xB0"],["10","+10\\xB0"]]')
    ang = _rep(ang, '"L\\u2019angle est mesur\\xE9 au gyroscope seul, sans la boussole. Par d\\xE9faut, l\\u2019appli ajoute 5\\xB0 de s\\xE9curit\\xE9 de chaque c\\xF4t\\xE9 : les zones interdites font alors "+2*(30+m)+"\\xB0 chacune."',
        '(m?"Avec cette marge, les zones interdites font "+2*(30+m)+"\\xB0 chacune (30\\xB0 r\\xE9glementaires + "+m+"\\xB0 de chaque c\\xF4t\\xE9).":"Calcul r\\xE9glementaire : 30\\xB0 de part et d\\u2019autre de la direction de chaque voisin, soit une zone interdite de 60\\xB0 autour de chacun. Ajoutez une marge si vous voulez plus de s\\xE9curit\\xE9.")+" L\\u2019angle est mesur\\xE9 au gyroscope, sans la boussole."')
    ang = _rep(ang, '\\xB7 marge boussole "+m+"\\xB0."', '\\xB7 "+(m?"marge ajout\\xE9e : "+m+"\\xB0 de chaque c\\xF4t\\xE9.":"30\\xB0 exacts, sans marge.")')
    return bundle[:k] + ang + bundle[end:]
