/* Viseur 30° guidé : on vise l'obstacle de gauche, puis celui de droite ; l'appli retire 30° (+ marge) vers l'intérieur */
function A30Nl(h){return["N","NE","E","SE","S","SO","O","NO"][Math.round((((h%360)+360)%360)/45)%8]}
function A30Calc(L,R,m){let span=((R-L)%360+360)%360,ex=30+m,width=span-2*ex;return{span:span,ex:ex,width:width,free:width>0?[((L+ex)%360+360)%360,((R-ex)%360+360)%360]:null}}
function A30Wedge(cx,cy,r,from,to){let sp=((to-from)%360+360)%360;if(sp<.5)return"";let p=b0=>[cx+r*Math.sin(b0*Math.PI/180),cy-r*Math.cos(b0*Math.PI/180)],a=p(from),z=p(from+sp);return"M"+cx+" "+cy+"L"+a[0].toFixed(1)+" "+a[1].toFixed(1)+"A"+r+" "+r+" 0 "+(sp>180?1:0)+" 1 "+z[0].toFixed(1)+" "+z[1].toFixed(1)+"Z"}
function A30Plan(L,R,m){let c=A30Calc(L,R,m),cx=110,cy=110,r=92,pt=(b0,k0)=>[(cx+(k0||r)*Math.sin(b0*Math.PI/180)).toFixed(1),(cy-(k0||r)*Math.cos(b0*Math.PI/180)).toFixed(1)],red="",grn="";
if(c.width<=0)red='<path d="'+A30Wedge(cx,cy,r,L-c.ex,R+c.ex)+'" fill="#D2513F" fill-opacity=".45"/>';
else{red='<path d="'+A30Wedge(cx,cy,r,L-c.ex,L+c.ex)+'" fill="#D2513F" fill-opacity=".45"/><path d="'+A30Wedge(cx,cy,r,R-c.ex,R+c.ex)+'" fill="#D2513F" fill-opacity=".45"/>';grn='<path d="'+A30Wedge(cx,cy,r,c.free[0],c.free[1])+'" fill="#3F7A55" fill-opacity=".6"/>'}
let l1=pt(L),r1=pt(R),lt=pt(L,r+13),rt=pt(R,r+13),n=pt(0,r+13);
let svg=ChSvg('<svg viewBox="-12 -8 244 236" width="100%" style="max-width:280px;display:block;margin:0 auto" role="img" aria-label="Schéma vu de dessus : zone de tir entre vos deux voisins"><circle cx="110" cy="110" r="92" fill="#F4E1DC" stroke="#9AA39E" stroke-width="1"/>'+red+grn+
'<line x1="110" y1="110" x2="'+l1[0]+'" y2="'+l1[1]+'" stroke="#131B19" stroke-width="2" stroke-dasharray="4 3"/><line x1="110" y1="110" x2="'+r1[0]+'" y2="'+r1[1]+'" stroke="#131B19" stroke-width="2" stroke-dasharray="4 3"/>'+
'<circle cx="'+l1[0]+'" cy="'+l1[1]+'" r="5" fill="#131B19"/><circle cx="'+r1[0]+'" cy="'+r1[1]+'" r="5" fill="#131B19"/>'+
'<g font-family="sans-serif" font-size="11" font-weight="700" fill="#131B19" text-anchor="middle"><text x="'+lt[0]+'" y="'+(+lt[1]+4)+'">G</text><text x="'+rt[0]+'" y="'+(+rt[1]+4)+'">D</text><text x="'+n[0]+'" y="'+(+n[1]+4)+'" fill="#6A746F">N</text></g>'+
'<circle cx="110" cy="110" r="6" fill="#D95A10" stroke="#fff" stroke-width="2"/><line id="a30n" x1="110" y1="110" x2="110" y2="30" stroke="#E3B04B" stroke-width="3" stroke-linecap="round" visibility="hidden"/></svg>');
svg._needle=h=>{let nd=svg.querySelector("#a30n");if(!nd)return;if(h==null){nd.setAttribute("visibility","hidden");return}let q1=pt(h,80);nd.setAttribute("x2",q1[0]);nd.setAttribute("y2",q1[1]);nd.setAttribute("visibility","visible")};return svg}
function A30Heading(ev){if(ev.webkitCompassHeading!=null&&isFinite(ev.webkitCompassHeading))return ev.webkitCompassHeading;if(!ev.absolute||ev.alpha==null)return null;let d=Math.PI/180,x=(ev.beta||0)*d,y=(ev.gamma||0)*d,z=ev.alpha*d,cY=Math.cos(y),cZ=Math.cos(z),sX=Math.sin(x),sY=Math.sin(y),sZ=Math.sin(z),Vx=-cZ*sY-sZ*sX*cY,Vy=-sZ*sY+cZ*sX*cY,h=Math.atan(Vx/Vy);if(Vy<0)h+=Math.PI;else if(Vx<0)h+=2*Math.PI;return h*180/Math.PI}
async function Ang30(t){
let FV=62,step=0,m=+Pe.get("ang30:m",5),Lh=null,Rh=null,hm=0,sm=null,lastEv=0,st=null,rf=0,wl=null,live=null,pf=!1,noCam=!1,onEv=null;
let host=e("div"),vd=e("video",{style:{position:"absolute",inset:"0",width:"100%",height:"100%",objectFit:"cover"}}),cv=e("canvas",{style:{position:"absolute",inset:"0",width:"100%",height:"100%",touchAction:"none"}}),
stage=e("div",{style:{position:"relative",height:"min(50dvh,500px)",background:"linear-gradient(160deg,#1c2a26,#0b1210)",borderRadius:"14px",overflow:"hidden"}},vd,cv),
hl=(a,b0)=>((b0-a+540)%360)-180,inArc=(h,f,to)=>((h-f+360)%360)<=((to-f+360)%360),
cur=()=>sm!=null&&Date.now()-lastEv<3000?sm:null,
dir=()=>{let c=cur();return c!=null?c:hm};
vd.muted=!0;vd.autoplay=!0;vd.setAttribute("playsinline","");
onEv=ev=>{let h=A30Heading(ev);if(h==null||!isFinite(h))return;lastEv=Date.now();sm=sm==null?h:(sm+.3*hl(sm,h)+360)%360};
cv.onpointermove=ev=>{cur()==null&&ev.buttons&&(hm=((hm-ev.movementX*FV/cv.clientWidth)%360+360)%360)};
async function startSensors(){navigator.wakeLock&&!wl&&navigator.wakeLock.request("screen").then(s=>{wl=s}).catch(()=>{});
try{typeof DeviceOrientationEvent<"u"&&DeviceOrientationEvent.requestPermission&&await DeviceOrientationEvent.requestPermission()}catch{}
window.addEventListener("deviceorientationabsolute",onEv);window.addEventListener("deviceorientation",onEv);
if(!st&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){try{st=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:!1});vd.srcObject=st;vd.play().catch(()=>{});noCam=!1}catch{noCam=!0}}else if(!st)noCam=!0;
cancelAnimationFrame(rf);rf=requestAnimationFrame(draw)}
function stopSensors(){cancelAnimationFrame(rf);window.removeEventListener("deviceorientationabsolute",onEv);window.removeEventListener("deviceorientation",onEv);st&&st.getTracks().forEach(z=>z.stop());st=null;wl&&wl.release().catch(()=>{});wl=null}
function draw(){let W=cv.clientWidth,H=cv.clientHeight;if(!W){rf=requestAnimationFrame(draw);return}(cv.width!==W||cv.height!==H)&&(cv.width=W,cv.height=H);
let c=cv.getContext("2d"),hd=dir(),X=d=>(d/FV+.5)*W,res=step===3?A30Calc(Lh,Rh,m):null;c.clearRect(0,0,W,H);
if(res){for(let x=0;x<W;x+=4){let b0=((hd+(x/W-.5)*FV)%360+360)%360,ok=res.free&&inArc(b0,res.free[0],res.free[1]);
if(ok)c.fillStyle="rgba(63,122,85,.45)";else{let nr=inArc(b0,Lh-res.ex,Lh+res.ex)||inArc(b0,Rh-res.ex,Rh+res.ex)||res.width<=0&&inArc(b0,Lh-res.ex,Rh+res.ex);c.fillStyle=nr?"rgba(210,81,63,.55)":"rgba(210,81,63,.28)"}c.fillRect(x,0,4,H)}}
c.font="600 13px Barlow, sans-serif";c.textAlign="center";c.fillStyle="#fff";c.strokeStyle="rgba(255,255,255,.75)";c.lineWidth=1;
for(let d=Math.ceil((hd-FV/2)/10)*10;d<=hd+FV/2;d+=10){let x=X(d-hd);c.beginPath();c.moveTo(x,H);c.lineTo(x,H-(d%30===0?18:10));c.stroke();d%30===0&&c.fillText(String(((d%360)+360)%360),x,H-24)}
let mark=(b0,lab,col)=>{let d=hl(hd,b0);if(Math.abs(d)<FV/2){let x=X(d);c.strokeStyle=col;c.fillStyle=col;c.lineWidth=3;c.setLineDash([6,5]);c.beginPath();c.moveTo(x,64);c.lineTo(x,H-40);c.stroke();c.setLineDash([]);c.fillText(lab,x,58)}else{c.fillStyle=col;c.fillText(d<0?"◀ "+lab:lab+" ▶",d<0?64:W-64,H/2+30)}};
if(Lh!=null)mark(Lh,"Obstacle gauche","#8EC5FF");if(Rh!=null)mark(Rh,"Obstacle droit","#8EC5FF");
if(res&&res.free){mark(res.free[0],"début zone","#9BE3B1");mark(res.free[1],"fin zone","#9BE3B1")}
c.strokeStyle="#fff";c.lineWidth=2;c.beginPath();c.moveTo(W/2,H/2-26);c.lineTo(W/2,H/2+26);c.moveTo(W/2-26,H/2);c.lineTo(W/2+26,H/2);c.stroke();
let banner,col;if(step===1){banner="1/2 · Visez l’obstacle de GAUCHE";col="#2F6F8F"}else if(step===2){banner="2/2 · Visez l’obstacle de DROITE";col="#2F6F8F"}
else{let ok=res.free&&inArc(hd,res.free[0],res.free[1]);banner=ok?"TIR AUTORISÉ":"TIR INTERDIT";col=ok?"#3F7A55":"#D2513F";ok||pf||!res||pf===!1&&navigator.vibrate&&navigator.vibrate([120,70,120]);pf=!ok}
c.fillStyle=col;c.fillRect(0,0,W,34);c.fillStyle="#fff";c.font="700 18px Barlow Condensed, sans-serif";c.fillText(banner+" · "+Math.round(hd)+"° "+A30Nl(hd),W/2,23);
if(noCam){c.font="600 12px Barlow, sans-serif";c.fillStyle="rgba(255,255,255,.8)";c.fillText("Caméra indisponible : visée sur fond neutre",W/2,H-44)}
if(cur()==null){c.font="600 12px Barlow, sans-serif";c.fillStyle="#FFD27A";c.fillText("Boussole indisponible : faites glisser pour tourner",W/2,H/2-44)}
live&&live._needle(cur());rf=requestAnimationFrame(draw)}
function intro(){step=0;stopSensors();W(host);live=null;top0();
let nb=(n,tx)=>e("div.row",{style:{gap:"12px",alignItems:"flex-start"}},e("span",{style:{flex:"none",width:"30px",height:"30px",borderRadius:"50%",background:"var(--blaze,#D95A10)",color:"#fff",display:"grid",placeItems:"center",fontWeight:"700"}},String(n)),e("div",tx));
C(host,e("div.grid.g-main",e("div.stack",
x("Commencer",{icon:"camera",kind:"primary",size:"block",onClick:async()=>{await startSensors();aim(1)}}),
k({title:"Comment ça marche"},e("div.stack",
nb(1,e("div",e("b","Visez l’obstacle de gauche")," : le dernier voisin, poste ou obstacle de votre côté gauche. Touchez « Valider ».")),
nb(2,e("div",e("b","Visez l’obstacle de droite")," : le dernier de l’autre côté. Touchez « Valider ».")),
nb(3,e("div",e("b","Lisez la zone"),". L’appli retire 30° vers l’intérieur à partir de chaque obstacle. Ce qui reste au milieu, en vert, est votre zone de tir."))),
e("p.tiny.muted",{style:{margin:"12px 0 0"}},"Tenez le téléphone droit, en portrait, comme pour prendre une photo. Si la boussole semble fausse, faites quelques « 8 » dans l’air avec le téléphone.")),
k({title:"Réglage"},e("div.field",e("label","Marge de précision de la boussole, en plus des 30°"),ke([["0","0°"],["5","5°"],["10","10°"]],String(m),v1=>{m=+v1;Pe.set("ang30:m",m);intro()})),e("p.tiny.muted",{style:{margin:"6px 0 0"}},"Une boussole de téléphone se trompe souvent de 5 à 15°. Par défaut, l’appli ajoute 5° de sécurité de chaque côté : les zones interdites font alors "+(2*(30+m))+"° chacune."))),
e("div.stack",k({title:"Exemple vu de dessus"},A30Plan(300,60,m),e("div.sector-legend",{style:{marginTop:"10px"}},e("span",e("i",{style:{background:"#D2513F"}}),"Interdit"),e("span",e("i",{style:{background:"#3F7A55"}}),"Zone de tir"),e("span","G / D : vos obstacles")),
e("p.tiny.muted",{style:{margin:"8px 0 0"}},"Exemple : obstacles à 300° et 60° (écart de 120°) : il reste une zone de tir de "+Math.max(0,Math.round(A30Calc(300,60,m).width))+"°.")),
e("a.btn.ghost.block",{href:"#/angle-30-carte",style:{textAlign:"center"}},"Calculateur sur carte (voisins GPS)"),
e("p.tiny.muted",{style:{margin:0}},"Aide visuelle : elle ne remplace ni les consignes du chef de ligne, ni l’identification de la cible et de l’arrière-plan (routes, habitations, promeneurs)."))))}
function top0(){try{window.scrollTo(0,0);let c=document.getElementById("content");c&&(c.scrollTop=0)}catch{}}
function aim(n){step=n;W(host);live=null;top0();
let rd=e("div.small.muted",{style:{textAlign:"center",margin:"2px 0"}},n===1?"Placez le réticule sur le dernier obstacle à gauche.":"Placez le réticule sur le dernier obstacle à droite."),
go=x(n===1?"Valider : obstacle de gauche":"Valider : obstacle de droite",{icon:"check",kind:"primary",size:"block",onClick:()=>{let h=dir();if(n===1){Lh=h;aim(2)}else{Rh=h;result()}}}),
back=x(n===1?"Annuler":"Retour",{kind:"ghost",size:"block",onClick:()=>n===1?intro():aim(1)});
C(host,e("div.stack",stage,rd,go,back,e("p.tiny.muted",{style:{margin:0,textAlign:"center"}},"La caméra sert d’écran de visée : elle ne détecte ni personnes, ni routes, ni habitations.")))}
function result(){step=3;W(host);top0();let res=A30Calc(Lh,Rh,m),f0=a=>Math.round(((a%360)+360)%360),warn=[];
live=A30Plan(Lh,Rh,m);pf=!1;
if(res.span>180)warn.push("Les deux obstacles sont à plus de 180° l’un de l’autre : vérifiez que vous avez bien visé la gauche en premier, puis la droite. Au besoin, refaites.");
if(res.span<10)warn.push("Les deux visées sont presque identiques : refaites en visant deux obstacles différents.");
if(cur()==null)warn.push("La boussole n’a pas répondu : les directions viennent de votre glissement à l’écran. Ne vous y fiez pas pour tirer.");
let head=res.free?e("div.panel",{style:{background:"#3F7A55",color:"#fff",borderColor:"transparent"}},e("div.display",{style:{fontSize:"26px",fontWeight:700,lineHeight:1.1}},"Zone de tir : "+f0(res.free[0])+"° → "+f0(res.free[1])+"°"),e("div.small",{style:{marginTop:"4px"}},"Largeur "+Math.round(res.width)+"° · direction centrale "+f0(res.free[0]+res.width/2)+"° ("+A30Nl(res.free[0]+res.width/2)+"). Hors de cette zone : ne tirez pas.")):e("div.panel",{style:{background:"#D2513F",color:"#fff",borderColor:"transparent"}},e("div.display",{style:{fontSize:"26px",fontWeight:700,lineHeight:1.1}},"Aucune zone de tir ici"),e("div.small",{style:{marginTop:"4px"}},"Vos deux obstacles sont trop proches ("+Math.round(res.span)+"° d’écart, il en faut plus de "+(2*res.ex)+"°). Ne tirez pas à ce poste, ou prévenez le chef de ligne."));
C(host,e("div.grid.g-main",e("div.stack",stage,head,warn.map(z=>e("div.panel",{style:{borderColor:"var(--ember,#E08A2E)"}},e("div.small",z)))),
e("div.stack",k({title:"Vue de dessus"},live,e("div.sector-legend",{style:{marginTop:"10px"}},e("span",e("i",{style:{background:"#D2513F"}}),"Interdit : "+res.ex+"° de part et d’autre, et tout le reste"),e("span",e("i",{style:{background:"#3F7A55"}}),"Zone de tir")),e("p.tiny.muted",{style:{margin:"8px 0 0"}},"Gauche "+f0(Lh)+"° · droite "+f0(Rh)+"° · marge boussole "+m+"°.")),
x("Refaire (nouveau poste)",{icon:"target",kind:"primary",size:"block",onClick:()=>aim(1)}),x("Terminer",{kind:"ghost",size:"block",onClick:intro}),
e("p.tiny.muted",{style:{margin:0}},"Aide visuelle : elle ne remplace ni les consignes du chef de ligne, ni l’identification de la cible et de l’arrière-plan."))))}
C(t,q({title:"Angle de 30°",subtitle:"Visez vos deux voisins : l’application calcule votre zone de tir. Gratuit pour tous."},host));
intro();
return()=>{stopSensors()}}
var A30M={};le(A30M,{default:()=>Ang30});var A30I=H(()=>{});
