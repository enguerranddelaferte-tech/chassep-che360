/* ----- Viseur 30° : méthode photo (3.0) ----- */
/* Aucune boussole ni gyroscope : l'angle est lu sur la photo, grâce à l'angle de champ de l'objectif
   (focale équivalente 35 mm lue dans la photo, ou réglage). On touche l'obstacle, l'appli trace la limite des 30°. */
async function A30Exif(file){
  try{
    let buf=await file.slice(0,262144).arrayBuffer(),v=new DataView(buf);
    if(v.getUint16(0)!==0xFFD8)return {};
    let o=2;
    while(o+4<v.byteLength){
      let mk=v.getUint16(o),ln=v.getUint16(o+2);
      if(mk===0xFFE1&&v.getUint32(o+4)===0x45786966){
        let t=o+10,le=v.getUint16(t)===0x4949,g16=p=>v.getUint16(t+p,le),g32=p=>v.getUint32(t+p,le);
        let readIFD=off=>{let n=g16(off),r={};for(let i=0;i<n;i++){let e0=off+2+i*12,tag=g16(e0),typ=g16(e0+2),val;
          if(typ===3)val=g16(e0+8);else if(typ===4)val=g32(e0+8);else if(typ===5){let p=g32(e0+8);val=g32(p)/Math.max(1,g32(p+4))}else val=null;r[tag]=val}return r};
        let i0=readIFD(g32(4)),ex=i0[0x8769]?readIFD(i0[0x8769]):{};
        return {f35:ex[0xA405]||null,f:ex[0x920A]||null,orient:i0[0x0112]||1};
      }
      if(mk===0xFFDA||ln<2)break;o+=2+ln;
    }
  }catch{}
  return {};
}
const A30PH={lensKey:"ang30:f35"};
function A30PhotoTan(st){let f35=st.f35||26,td=43.2666/(2*f35);return td*st.W/Math.hypot(st.W,st.H)}
/* Dessine une photo annotée : obstacle, limite des 30° (+ marge), zone interdite / autorisée */
function A30PhotoDraw(cv,st,side,m,cw){
  let ch=Math.round(cw*st.H/st.W),dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.round(cw*dpr),cv.height=Math.round(ch*dpr),cv.style.width=cw+"px",cv.style.height=ch+"px";
  let c=cv.getContext("2d");c.setTransform(dpr,0,0,dpr,0,0);c.drawImage(st.img,0,0,cw,ch);
  let out={ok:!1};
  if(st.x==null){return out}
  let th=A30PhotoTan(st),fpx=(cw/2)/th,x0=st.x*cw/st.W,a0=Math.atan((x0-cw/2)/fpx),ex=(30+m)*Math.PI/180,aL=side==="L"?a0+ex:a0-ex,xl=Math.abs(aL)<1.5?cw/2+fpx*Math.tan(aL):(side==="L"?1e9:-1e9);
  out.inside=xl>4&&xl<cw-4;out.ok=out.inside;out.xl=xl;
  let red="rgba(210,81,63,.32)",grn="rgba(63,122,85,.30)";
  if(side==="L"){c.fillStyle=red,c.fillRect(0,0,Math.max(0,Math.min(cw,xl)),ch);out.inside&&(c.fillStyle=grn,c.fillRect(xl,0,cw-xl,ch))}
  else{c.fillStyle=red,c.fillRect(Math.max(0,xl),0,cw-Math.max(0,xl),ch);out.inside&&(c.fillStyle=grn,c.fillRect(0,0,xl,ch))}
  let fs=Math.max(12,Math.round(cw/32));c.font="700 "+fs+"px Barlow, sans-serif";c.textAlign="center";
  let lab=(x,t,col,y)=>{let w=c.measureText(t).width+12;c.fillStyle="rgba(19,27,25,.78)";c.fillRect(Math.min(cw-w-2,Math.max(2,x-w/2)),y-fs,w,fs+8);c.fillStyle=col;c.fillText(t,Math.min(cw-w/2-2,Math.max(w/2+2,x)),y+1)};
  c.setLineDash([8,6]),c.lineWidth=3,c.strokeStyle="#8EC5FF",c.beginPath(),c.moveTo(x0,0),c.lineTo(x0,ch),c.stroke(),c.setLineDash([]);
  lab(x0,"Obstacle "+(side==="L"?"gauche":"droit"),"#8EC5FF",fs+6);
  if(out.inside){
    c.lineWidth=5,c.strokeStyle="#FFD27A",c.beginPath(),c.moveTo(xl,0),c.lineTo(xl,ch),c.stroke();
    lab(xl,(side==="L"?"Limite 30°"+(m?" +"+m+"°":"")+" · tir possible →":"← tir possible · limite 30°"+(m?" +"+m+"°":"")),"#FFD27A",ch-14);
  }
  return out;
}
/* ----- Panorama filmé (photo + vidéo) : assemblage optique image par image, sans capteur -----
   Chaque image du film est ramenée en coordonnées cylindriques (degrés), puis on mesure de combien elle
   a glissé par rapport à l'image clé précédente. Les deux photos sont ensuite retrouvées dans le panorama :
   elles fixent l'échelle exacte (objectif lu dans la photo) et la position des obstacles. */
const A30SW={ppt:4,ppd:6,bands:[[-9,0],[0,9]],w0:-70,w1:340};
function A30Gray(src,w,h,cv){cv=cv||document.createElement("canvas");if(cv.width!==w)cv.width=w;if(cv.height!==h)cv.height=h;let c=cv.getContext("2d",{willReadFrequently:!0});c.drawImage(src,0,0,w,h);let d=c.getImageData(0,0,w,h).data,g=new Float32Array(w*h);for(let i=0,j=0;i<g.length;i++,j+=4)g[i]=.299*d[j]+.587*d[j+1]+.114*d[j+2];return g}
function A30Cum(g,w,h){let H1=h+1,cu=new Float32Array(w*H1);for(let x0=0;x0<w;x0++){let a=0,b=x0*H1;for(let y=0;y<h;y++){a+=g[y*w+x0];cu[b+y+1]=a}}return cu}
/* Profil cylindrique : moyenne de deux bandes horizontales (au-dessus / au-dessous de l'horizon), une valeur par 1/ppt degré.
   s = échelle « degrés du panorama » / « vrais degrés » de l'image. */
function A30Prof(cu,w,h,f,s){
  let pt=A30SW.ppt,R=Math.PI/180,lim=Math.atan((w/2-1)/f)/R*s,k0=Math.ceil(-lim*pt),k1=Math.floor(lim*pt),n=k1-k0+1,H1=h+1,bd=A30SW.bands,b=bd.map(()=>new Float32Array(n));
  for(let k=0;k<n;k++){let ut=(k0+k)/pt/s*R,xf=w/2+f*Math.tan(ut)-.5,x0=Math.floor(xf),fr=xf-x0,cs=Math.cos(ut);
    for(let bi=0;bi<bd.length;bi++){let y1=Math.round(h/2+f*Math.tan(bd[bi][0]/s*R)/cs),y2=Math.round(h/2+f*Math.tan(bd[bi][1]/s*R)/cs),v=NaN;
      if(x0>=0&&x0<w-1&&y1>=0&&y2<=h&&y2>y1){let p=x0*H1,q=p+H1;v=((cu[p+y2]-cu[p+y1])*(1-fr)+(cu[q+y2]-cu[q+y1])*fr)/(y2-y1)}
      b[bi][k]=v}}
  return {o:k0,n,b};
}
/* Corrélation normalisée (par bande) de B décalé de j échantillons sur A */
function A30Ncc(A,B,j,minOv){
  let lo=Math.max(0,A.o-B.o-j),hi=Math.min(B.n,A.o+A.n-B.o-j),cov=0,va=0,vb=0,N=0;
  for(let bi=0;bi<A.b.length;bi++){let ab=A.b[bi],bb=B.b[bi],sa=0,sb=0,saa=0,sbb=0,sab=0,n=0,off=B.o+j-A.o;
    for(let k=lo;k<hi;k++){let a=ab[k+off],c=bb[k];if(a!==a||c!==c)continue;sa+=a;sb+=c;saa+=a*a;sbb+=c*c;sab+=a*c;n++}
    if(n>1){cov+=sab-sa*sb/n;va+=saa-sa*sa/n;vb+=sbb-sb*sb/n;N+=n}}
  if(N<minOv||va<1e-3||vb<1e-3)return -2;return cov/Math.sqrt(va*vb);
}
function A30Match(A,B,j0,j1,minOv,prior){
  let best={c:-9,j:j0,r:-2},cs={};
  for(let j=j0;j<=j1;j++){let c=A30Ncc(A,B,j,minOv);cs[j]=c;let sc=c>-2&&prior?c-prior(j):c;if(sc>best.c)best={c:sc,j,r:c}}
  let cm=cs[best.j-1],cp=cs[best.j+1],sub=0,c0=best.r;
  if(cm>-2&&cp>-2){let den=cm-2*c0+cp;if(den<0)sub=Math.max(-.5,Math.min(.5,.5*(cm-cp)/den))}
  return {c:c0,sc:best.c,j:best.j+sub};
}
/* Demi-angle (tangente) horizontal de la vidéo, estimé à partir de l'objectif de la photo ; l'échelle exacte est recalée ensuite */
function A30VidTan(st,vw,vh){let td=43.2666/(2*(st.f35||26)),tl=td*Math.max(st.W,st.H)/Math.hypot(st.W,st.H);return vw>=vh?tl:tl*vw/vh}
function A30PhA0(st){let fpx=(st.W/2)/A30PhotoTan(st);return Math.atan((st.x-st.W/2)/fpx)*180/Math.PI}
/* Retrouve les deux photos dans le panorama : échelle commune s, centre de chaque photo (degrés du panorama) */
function A30SweepSolve(P,sides,Hend){
  let pt=A30SW.ppt,prep=st=>{let w=400,h=Math.max(2,Math.round(w*st.H/st.W)),g=A30Gray(st.img,w,h);return {cu:A30Cum(g,w,h),w,h,f:(w/2)/A30PhotoTan(st)}};
  let pL=prep(sides.L),pR=prep(sides.R),aL=A30PhA0(sides.L),aR=A30PhA0(sides.R);
  let one=(pp,s,exp)=>{let B=A30Prof(pp.cu,pp.w,pp.h,pp.f,s),half=Math.floor(B.n/2),j0=P.o-B.o-half,j1=P.o+P.n-B.o-half,
      prior=j=>{let dv=Math.abs(j/pt-exp(s));return dv>20?.004*(dv-20):0};
    let r=A30Match(P,B,j0,j1,Math.round(B.n*A30SW.bands.length*.45),prior);return {c:r.c,sc:r.sc,ctr:r.j/pt}};
  /* centre attendu : obstacle gauche au début du film (0°), obstacle droit à la fin */
  let expL=s=>-s*aL,expR=s=>Hend-s*aR,best=null,tryS=s=>{let L=one(pL,s,expL),R=one(pR,s,expR),ok=L.ctr+s*aL<R.ctr+s*aR,sc=L.sc+R.sc-(ok?0:1);if(!best||sc>best.sc)best={s,sc,L,R};return sc};
  for(let i=0;i<=36;i++)tryS(.7*Math.pow(1.45/.7,i/36));
  let s0=best.s;for(let i=-6;i<=6;i++)i&&tryS(s0*(1+i*.004));
  let b=best;return {ok:b.L.c>=.5&&b.R.c>=.5&&b.L.ctr+b.s*aL<b.R.ctr+b.s*aR,s:b.s,cL:b.L.c,cR:b.R.c,PcL:b.L.ctr,PcR:b.R.ctr,edge:b.s<.72||b.s>1.42};
}
/* Dessin du panorama annoté */
function A30SweepDraw(cv,pz,sides,m,cw){
  let ppd=pz.ppd,sw=(pz.cmax-pz.cmin)*ppd,sc=cw/sw,ch=Math.round(pz.can.height*sc),dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.round(cw*dpr),cv.height=Math.round(ch*dpr),cv.style.width=cw+"px",cv.style.height=ch+"px";
  let c=cv.getContext("2d");c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle="#131b19";c.fillRect(0,0,cw,ch);
  c.drawImage(pz.can,(pz.cmin-A30SW.w0)*ppd,0,sw,pz.can.height,0,0,cw,ch);
  let s=pz.s,PL=pz.PcL+s*A30PhA0(sides.L),PR=pz.PcR+s*A30PhA0(sides.R),ex=s*(30+m),YL=PL+ex,YR=PR-ex,X=wd=>(wd-pz.cmin)*ppd*sc,zone=(YR-YL)/s,between=(PR-PL)/s;
  let red="rgba(210,81,63,.34)",grn="rgba(63,122,85,.30)";
  if(YL<YR){c.fillStyle=red;c.fillRect(0,0,Math.max(0,X(YL)),ch);c.fillRect(X(YR),0,Math.max(0,cw-X(YR)),ch);c.fillStyle=grn;c.fillRect(X(YL),0,X(YR)-X(YL),ch)}
  else{c.fillStyle=red;c.fillRect(0,0,cw,ch)}
  let fs=Math.max(11,Math.round(cw/40));c.font="700 "+fs+"px Barlow, sans-serif";c.textAlign="center";
  let lab=(x0,t,col,y)=>{let w=c.measureText(t).width+12,cx=Math.min(cw-w/2-2,Math.max(w/2+2,x0));c.fillStyle="rgba(19,27,25,.8)";c.fillRect(cx-w/2,y-fs,w,fs+8);c.fillStyle=col;c.fillText(t,cx,y+1)};
  c.setLineDash([8,6]);c.lineWidth=3;c.strokeStyle="#8EC5FF";[PL,PR].forEach(p=>{c.beginPath();c.moveTo(X(p),0);c.lineTo(X(p),ch);c.stroke()});c.setLineDash([]);
  lab(X(PL),"Obstacle gauche","#8EC5FF",fs+6);lab(X(PR),"Obstacle droit","#8EC5FF",2*fs+16);
  if(YL<YR){c.lineWidth=4;c.strokeStyle="#FFD27A";[YL,YR].forEach(p=>{c.beginPath();c.moveTo(X(p),0);c.lineTo(X(p),ch);c.stroke()});
    lab((X(YL)+X(YR))/2,"Zone de tir : "+Math.round(zone)+"° de large","#fff",ch-14)}
  else lab(cw/2,"Pas de zone de tir : obstacles trop proches","#FFB4A8",ch-14);
  return {zone,between};
}
/* Pictogramme : téléphone tenu à l'horizontale (paysage) */
function A30Landscape(txt){
  let i=document.createElement("span");i.setAttribute("aria-hidden","true");i.style.cssText="flex:none;display:inline-flex";
  i.innerHTML='<svg width="64" height="44" viewBox="0 0 64 44" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="12" width="46" height="26" rx="5"/><circle cx="48" cy="25" r="1.6" fill="currentColor"/><path d="M14 7c6-5 16-5 22 0"/><path d="M32 3l4 4-5 2"/></svg>';
  return e("div.row",{style:{gap:"12px",alignItems:"center",padding:"10px 12px",borderRadius:"12px",background:"rgba(47,111,143,.10)",color:"var(--ink,#1d2a27)"}},i,e("div.small",txt));
}
function A30Photo(host,m0,back){
  let m=+Pe.get("ang30:marge",0)||m0||0,sides={L:null,R:null},step="L";
  const lensOpts=[["13","Ultra grand-angle (13 mm)"],["24","Principal 24 mm"],["26","Principal 26 mm"],["28","Principal 28 mm"],["35","Principal 35 mm"]];
  function pickInput(capture,onFile){let i=e("input",{type:"file",accept:"image/*",hidden:!0,onchange:ev=>{let f=ev.target.files[0];ev.target.value="";f&&onFile(f)}});capture&&i.setAttribute("capture","environment");document.body.append(i);i.click();setTimeout(()=>i.remove(),60000)}
  async function load(f){
    let ex=await A30Exif(f),img;
    try{img=await createImageBitmap(f)}catch{img=await new Promise((ok,ko)=>{let im=new Image();im.onload=()=>ok(im);im.onerror=ko;im.src=URL.createObjectURL(f)})}
    let W0=img.width||img.naturalWidth,H0=img.height||img.naturalHeight;
    return {img,W:W0,H:H0,f35:ex.f35||+Pe.get(A30PH.lensKey,26),lensSrc:ex.f35?"photo":"reglage",x:null};
  }
  function view(){
    W(host);
    if(step==="done")return result();
    if(step==="sweep")return sweep();
    let side=step,st=sides[side],other=side==="L"?"gauche":"droite";
    let head=e("div.panel",{style:{background:"#2F6F8F",color:"#fff",borderColor:"transparent"}},
      e("div.display",{style:{fontSize:"22px",fontWeight:700}},(side==="L"?"1/2":"2/2")+" · Photo de l’obstacle de "+other),
      e("div.small",{style:{marginTop:"4px"}},side==="L"?"Placez le dernier obstacle de gauche (voisin, poste, chemin…) dans la moitié GAUCHE de la photo, avec de la place à sa droite.":"Placez le dernier obstacle de droite dans la moitié DROITE de la photo, avec de la place à sa gauche."));
    let tips=A30Landscape([e("b","Tenez le téléphone à l’horizontale (paysage)."),e("br")," La photo couvre alors environ 69° de large au lieu de 53° : la limite des 30° y entre avec de la marge. Sans zoom, objectif principal, téléphone bien droit."]);
    let portrait=st&&st.W<st.H?e("div.panel.stack",{style:{gap:"8px",borderColor:"#E0A030",background:"rgba(224,160,48,.12)"}},
      e("b","Photo prise en portrait (à la verticale)"),
      e("div.small","Elle ne couvre qu’environ "+Math.round(2*Math.atan(A30PhotoTan(st))*180/Math.PI)+"° de large : la limite des 30° risque de sortir de la photo. Reprenez-la téléphone à l’horizontale pour plus de largeur. Vous pouvez aussi continuer avec celle-ci si la ligne jaune apparaît."),
      x("Reprendre en paysage",{icon:"camera",kind:"primary",size:"sm",onClick:()=>pickInput(!0,async f=>{sides[side]=await load(f);sides.pano=null;view()})})):null;
    let shoot=e("div.row",{style:{gap:"8px",flexWrap:"wrap"}},
      x(st?"Reprendre la photo":"Prendre la photo",{icon:"camera",kind:st?"ghost":"primary",onClick:()=>pickInput(!0,async f=>{sides[side]=await load(f);sides.pano=null;view()})}),
      x("Choisir une photo",{icon:"plus",kind:"ghost",onClick:()=>pickInput(!1,async f=>{sides[side]=await load(f);sides.pano=null;view()})}));
    if(!st){C(host,e("div.stack",head,shoot,tips,x("Retour",{kind:"ghost",onClick:()=>side==="L"?back():(step="L",view())})));return}
    let cv=e("canvas",{style:{display:"block",width:"100%",borderRadius:"12px",touchAction:"none",cursor:"crosshair"}}),wrap=e("div",{style:{position:"relative"}},cv);
    let loupe=e("canvas",{width:160,height:160,style:{position:"absolute",width:"120px",height:"120px",borderRadius:"50%",border:"3px solid #FFD27A",pointerEvents:"none",display:"none",boxShadow:"0 4px 16px rgba(0,0,0,.4)"}});wrap.append(loupe);
    let msg=e("p.small",{style:{margin:0}}),go=x(side==="L"?"Valider et passer à la photo de droite":"Valider",{icon:"check",kind:"primary",size:"block",onClick:()=>{step=side==="L"?"R":"done";view()}});
    let lensSel=e("select.input",{"aria-label":"Objectif utilisé",onchange:ev=>{st.f35=+ev.target.value;st.lensSrc="reglage";Pe.set(A30PH.lensKey,st.f35);redraw()}},lensOpts.map(([v,l])=>e("option",{value:v,selected:String(Math.round(st.f35))===v},l)));
    if(!lensOpts.some(o=>+o[0]===Math.round(st.f35)))lensSel.prepend(e("option",{value:String(st.f35),selected:!0},"Lu dans la photo : "+Math.round(st.f35)+" mm"));
    let lensInfo=e("div.small.muted",st.lensSrc==="photo"?"Objectif lu dans la photo : "+Math.round(st.f35)+" mm (équivalent 24×36), champ "+Math.round(2*Math.atan(A30PhotoTan(st))*180/Math.PI)+"° en largeur.":"Objectif non indiqué dans la photo : choisissez-le ci-dessous (en général « Principal 26 mm »).");
    let nudge=d=>{if(st.x==null)return;let th=A30PhotoTan(st),fpx=(st.W/2)/th,a=Math.atan((st.x-st.W/2)/fpx)+d*Math.PI/180;st.x=st.W/2+fpx*Math.tan(a);redraw()};
    let fine=e("div.row",{style:{gap:"8px",flexWrap:"wrap",alignItems:"center"}},e("span.small","Ajuster l’obstacle :"),x("◀ 0,2°",{size:"sm",kind:"ghost",onClick:()=>nudge(-.2)}),x("0,2° ▶",{size:"sm",kind:"ghost",onClick:()=>nudge(.2)}));
    function redraw(){
      let cw=Math.min(wrap.clientWidth||host.clientWidth||360,900),r=A30PhotoDraw(cv,st,side,m,cw);
      go.disabled=!r.ok;fine.style.display=st.x==null?"none":"";
      msg.textContent=st.x==null?"Touchez l’obstacle sur la photo (vous pouvez zoomer avec la loupe en gardant le doigt appuyé).":
        r.inside?"La ligne jaune est la limite des 30°"+(m?" + "+m+"° de marge":"")+". Repérez un arbre, un piquet ou une souche sur cette ligne : ce sera votre repère au poste.":
        "La limite des 30° sort de la photo : reprenez-la en plaçant l’obstacle plus "+(side==="L"?"à gauche":"à droite")+", ou en tenant le téléphone en paysage.";
      msg.style.color=st.x!=null&&!r.inside?"var(--danger,#D2513F)":"";
    }
    let pos=ev=>{let r=cv.getBoundingClientRect();return {x:(ev.clientX-r.left)/r.width,y:(ev.clientY-r.top)/r.height,cx:ev.clientX-r.left,cy:ev.clientY-r.top}};
    let showLoupe=p=>{let lc=loupe.getContext("2d"),sx=p.x*st.W,sy=p.y*st.H,sz=Math.max(40,st.W/14);lc.clearRect(0,0,160,160);lc.drawImage(st.img,sx-sz/2,sy-sz/2,sz,sz,0,0,160,160);lc.strokeStyle="#FFD27A",lc.lineWidth=2,lc.beginPath(),lc.moveTo(80,0),lc.lineTo(80,160),lc.stroke();loupe.style.display="block";loupe.style.left=Math.max(0,p.cx-60)+"px";loupe.style.top=Math.max(0,p.cy-150)+"px"};
    cv.onpointerdown=ev=>{cv.setPointerCapture&&cv.setPointerCapture(ev.pointerId);let p=pos(ev);st.x=Math.max(0,Math.min(st.W,p.x*st.W));showLoupe(p);redraw()};
    cv.onpointermove=ev=>{if(!ev.buttons&&ev.pointerType==="mouse")return;if(ev.pressure===0&&ev.pointerType!=="mouse")return;let p=pos(ev);st.x=Math.max(0,Math.min(st.W,p.x*st.W));showLoupe(p);redraw()};
    cv.onpointerup=cv.onpointercancel=()=>{loupe.style.display="none"};
    C(host,e("div.stack",head,portrait,wrap,msg,fine,go,e("div.field",e("label","Objectif utilisé"),lensSel),lensInfo,
      e("div.field",e("label","Marge en plus des 30°"),ke([["0","Aucune (30° exacts)"],["5","+5°"],["10","+10°"]],String(m),v9=>{m=+v9;Pe.set("ang30:marge",m);view()})),
      shoot,x(side==="L"?"Retour":"Revenir à la photo de gauche",{kind:"ghost",onClick:()=>side==="L"?back():(step="L",view())})));
    requestAnimationFrame(redraw);
  }
  function sweep(){
    let SW=A30SW,pt=SW.ppt,ppd=SW.ppd,R=Math.PI/180,dead=!1,stream=null,raf=0;
    let pv=e("video",{style:{display:"block",width:"100%",maxHeight:"50vh",objectFit:"contain",background:"#000",borderRadius:"12px"}});pv.muted=!0;pv.playsInline=!0;pv.autoplay=!0;pv.setAttribute("playsinline","");pv.setAttribute("muted","");
    let mark=e("div",{style:{position:"absolute",left:"50%",top:0,bottom:0,width:"3px",marginLeft:"-1.5px",background:"#FFD27A",boxShadow:"0 0 4px rgba(0,0,0,.7)",pointerEvents:"none"}});
    let vbox=e("div",{style:{position:"relative"}},pv,mark);
    let info=e("p.small",{style:{margin:0}},"Ouverture de la caméra…"),prev=e("canvas",{style:{display:"none",width:"100%",borderRadius:"8px",background:"#131b19"}});
    let bGo=x("Départ : je vise l’obstacle de gauche",{icon:"camera",kind:"primary",size:"block",onClick:()=>begin()}),bEnd=x("Arrivé à l’obstacle de droite",{icon:"check",kind:"primary",size:"block",onClick:()=>finish()});
    bGo.disabled=!0;bEnd.style.display="none";
    let okPort=!1,rot=A30Landscape([e("b","Tournez le téléphone à l’horizontale."),e("br")," En paysage, chaque image couvre plus large : l’assemblage est plus sûr, même si vous tournez un peu vite."]),
      bPort=x("Continuer à la verticale quand même",{kind:"ghost",size:"sm",onClick:()=>{okPort=!0;orient()}});
    rot.style.display=bPort.style.display="none";
    let orient=()=>{if(S.run||!pv.videoWidth)return;let pr=pv.videoWidth<pv.videoHeight;rot.style.display=pr?"":"none";bPort.style.display=pr&&!okPort?"":"none";bGo.disabled=pr&&!okPort};
    let head=e("div.panel",{style:{background:"#2F6F8F",color:"#fff",borderColor:"transparent"}},
      e("div.display",{style:{fontSize:"22px",fontWeight:700}},"Filmer la zone"),
      e("div.small",{style:{marginTop:"4px"}},"Téléphone à l’horizontale. Placez l’obstacle de gauche sur le trait jaune et appuyez sur Départ. Tournez ensuite lentement sur vous-même vers la droite, téléphone droit, jusqu’à l’obstacle de droite, puis appuyez sur Arrivé."));
    let close=()=>{dead=!0;cancelAnimationFrame(raf);try{stream&&stream.getTracks().forEach(t=>t.stop())}catch{}},
      leave=()=>{close();step="done";view()};
    C(host,e("div.stack",head,rot,vbox,info,prev,bGo,bPort,bEnd,
      e("p.tiny.muted",{style:{margin:0}},"Rien n’est enregistré ni envoyé : les images servent seulement à assembler le panorama sur cet appareil. Tournez sur place (pivotez autour du téléphone, sans marcher), sans zoom."),
      x("Annuler",{kind:"ghost",onClick:leave})));
    let S={run:0,K:null,HK:0,H:0,Hp:0,lost:0,cmin:1e9,cmax:-1e9,t:0,tp:0},G=null;
    let nW=Math.round((SW.w1-SW.w0)*pt),sum=SW.bands.map(()=>new Float32Array(nW)),cnt=SW.bands.map(()=>new Float32Array(nW)),Wo=Math.round(SW.w0*pt);
    let tc=document.createElement("canvas"),pc=document.createElement("canvas"),px=pc.getContext("2d");
    function setup(){
      let vw=pv.videoWidth,vh=pv.videoHeight,th=A30VidTan(sides.L,vw,vh),TW=200,TH=Math.max(2,Math.round(TW*vh/vw));
      G={vw,vh,th,TW,TH,fS:(TW/2)/th,fV:(vw/2)/th,lim:Math.atan(th)/R};
      G.k=ppd*180/(Math.PI*G.fV);pc.width=Math.round((SW.w1-SW.w0)*ppd);pc.height=Math.ceil(vh*G.k)+2;px.fillStyle="#131b19";px.fillRect(0,0,pc.width,pc.height);
    }
    function paint(H,lo,hi){
      for(let u=lo;u<hi;u+=1.5){let u1=Math.min(hi,u+1.5),xa=G.vw/2+G.fV*Math.tan(u*R),xb=G.vw/2+G.fV*Math.tan(u1*R);xa=Math.max(0,xa);xb=Math.min(G.vw,xb);if(xb-xa<.5)continue;
        let uc=(u+u1)/2,dh=G.vh*Math.cos(uc*R)*G.k;try{px.drawImage(pv,xa,0,xb-xa,G.vh,(H+u-SW.w0)*ppd,pc.height/2-dh/2,(u1-u)*ppd+.6,dh)}catch{}}
      S.cmin=Math.min(S.cmin,H+Math.max(lo,-G.lim)),S.cmax=Math.max(S.cmax,H+Math.min(hi,G.lim));
    }
    function add(F,H){let base=Math.round(H*pt)+F.o-Wo;for(let bi=0;bi<F.b.length;bi++){let fb=F.b[bi],sb=sum[bi],cb=cnt[bi];for(let k=0;k<F.n;k++){let i=base+k,v=fb[k];if(i<0||i>=nW||v!==v)continue;sb[i]+=v;cb[i]++}}}
    function grab(){let g=A30Gray(pv,G.TW,G.TH,tc);return A30Prof(A30Cum(g,G.TW,G.TH),G.TW,G.TH,G.fS,1)}
    function frame(){
      if(pv.videoWidth!==G.vw||pv.videoHeight!==G.vh){S.run=0;bEnd.style.display="none";info.textContent="Le téléphone a changé de sens pendant le film : gardez-le à l’horizontale du début à la fin, puis recommencez.";info.style.color="var(--danger,#D2513F)";reset();return}
      let F=grab();
      if(!S.K){S.K=F;S.HK=0;S.H=0;add(F,0);paint(0,-G.lim,.4);S.Hp=0;return}
      let pred=Math.round((S.H-S.HK)*pt),r=A30Match(S.K,F,pred-8*pt,pred+8*pt,Math.round(F.n*F.b.length*.35));
      if(r.c<.55){S.lost++;if(S.lost>3)info.textContent="Image perdue : revenez un peu en arrière, puis tournez plus lentement.",info.style.color="var(--danger,#D2513F)";return}
      S.lost=0;let d=r.j/pt;S.H=S.HK+d;add(F,S.H);
      if(S.H>S.Hp+.3){paint(S.H,S.Hp-S.H-.4,.4);S.Hp=S.H}
      if(Math.abs(d)>.25*2*G.lim){S.K=F;S.HK=S.H}
      info.style.color="";info.textContent=S.H<-8?"Tournez vers la droite : de l’obstacle de gauche vers celui de droite.":"Tournez lentement vers la droite, jusqu’à l’obstacle de droite : le panorama se construit ci-dessous.";
      if(S.H>SW.w1-G.lim-5)finish();
    }
    function preview(){if(S.cmax<=S.cmin)return;let sw=(S.cmax-S.cmin)*ppd,cw=prev.clientWidth||340,ch=Math.max(40,Math.round(pc.height*Math.min(1,cw/sw)));
      prev.width=cw;prev.height=ch;let c=prev.getContext("2d");c.fillStyle="#131b19";c.fillRect(0,0,cw,ch);let sc=Math.min(cw/sw,ch/pc.height);c.drawImage(pc,(S.cmin-SW.w0)*ppd,0,sw,pc.height,0,0,sw*sc,pc.height*sc);prev.style.display="block"}
    function loop(){if(dead)return;if(!host.isConnected){close();return}
      let now=performance.now();if(S.run&&pv.readyState>=2&&now-S.t>=40){S.t=now;try{frame()}catch(er){}}
      if(S.run&&now-S.tp>300){S.tp=now;preview()}
      if(!S.run)orient();
      raf=requestAnimationFrame(loop)}
    function begin(){if(S.run)return;setup();S.run=1;bGo.style.display="none";bEnd.style.display="";info.textContent="Tournez lentement vers la droite…";S.t=0}
    function finish(){
      if(!S.run)return;S.run=0;try{if(S.K)paint(S.H,S.Hp-S.H-.4,G.lim)}catch{}
      bEnd.style.display="none";
      if(S.H<15){info.textContent="Balayage trop court : recommencez en allant jusqu’à l’obstacle de droite.";info.style.color="var(--danger,#D2513F)";reset();return}
      info.style.color="";info.textContent="Assemblage du panorama…";
      setTimeout(()=>{
        let P={o:Wo,n:nW,b:sum.map((sb,bi)=>{let o=new Float32Array(nW),cb=cnt[bi];for(let i=0;i<nW;i++)o[i]=cb[i]?sb[i]/cb[i]:NaN;return o})},r;
        try{r=A30SweepSolve(P,sides,S.H)}catch(er){r={ok:!1}}
        window.__a30sweep={H:S.H,cmin:S.cmin,cmax:S.cmax,res:r};
        if(!r.ok){info.textContent="Les photos n’ont pas été retrouvées dans le film (mouvement trop rapide, lumière, ou film qui ne part pas de l’obstacle de gauche). Vos deux photos restent valables ; vous pouvez recommencer le film.";info.style.color="var(--danger,#D2513F)";reset();return}
        sides.pano={can:pc,ppd,cmin:S.cmin,cmax:S.cmax,s:r.s,PcL:r.PcL,PcR:r.PcR,conf:Math.min(r.cL,r.cR),edge:r.edge};
        close();step="done";view();
      },30);
    }
    function reset(){S.K=null;S.H=S.Hp=S.HK=0;S.cmin=1e9;S.cmax=-1e9;sum.forEach(a=>a.fill(0));cnt.forEach(a=>a.fill(0));if(G){px.fillStyle="#131b19";px.fillRect(0,0,pc.width,pc.height)}bGo.style.display="";bGo.textContent="";bGo.append(document.createTextNode("Recommencer : je vise l’obstacle de gauche"));}
    (async()=>{
      try{if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw 0;
        stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},audio:!1});
        if(dead){close();return}pv.srcObject=stream;try{await pv.play()}catch{}
        let t0=Date.now();while(!pv.videoWidth&&Date.now()-t0<5000)await new Promise(r=>setTimeout(r,100));
        if(!pv.videoWidth)throw 0;setup();bGo.disabled=!1;orient();info.textContent="Visez l’obstacle de gauche avec le trait jaune, puis appuyez sur Départ.";raf=requestAnimationFrame(loop);
      }catch(er){info.textContent="Caméra indisponible : autorisez l’accès à la caméra pour filmer la zone. Vos deux photos restent valables.";info.style.color="var(--danger,#D2513F)"}
    })();
  }
  function compose(){
    let cw=1080,dp=Math.min(2,window.devicePixelRatio||1),pz=null,parts=["L","R"].map(sd=>{let cv=document.createElement("canvas");A30PhotoDraw(cv,sides[sd],sd,m,cw/dp);return cv});
    if(sides.pano){let cv=document.createElement("canvas");pz=A30SweepDraw(cv,sides.pano,sides,m,cw/dp);parts.unshift(cv)}
    let H=parts.reduce((a,p)=>a+p.height,0)+170,out=document.createElement("canvas");out.width=parts[0].width;out.height=H;let c=out.getContext("2d");c.fillStyle="#131b19";c.fillRect(0,0,out.width,H);
    let y=0;parts.forEach(p=>{c.drawImage(p,0,y);y+=p.height});
    c.fillStyle="#fff";c.font="700 34px Barlow, sans-serif";c.textAlign="left";c.fillText("Zone de tir : entre les deux lignes jaunes"+(m?" (30° + "+m+"° de marge)":" (30° réglementaires)"),24,y+50);
    c.font="600 24px Barlow, sans-serif";c.fillStyle="rgba(255,255,255,.8)";c.fillText(pz?"Panorama filmé (zone de "+Math.round(pz.zone)+"° de large), puis photos des obstacles de gauche et de droite":"Haut : obstacle de gauche · Bas : obstacle de droite · méthode photo, sans boussole",24,y+92);
    c.fillText(new Date().toLocaleString("fr-FR")+" · Chasse & Pêche 360° · aide visuelle, à valider sur le terrain",24,y+132);
    return out;
  }
  function share(){
    compose().toBlob(async blob=>{
      if(!blob){A("Image impossible à créer ici.","warn");return}
      let file=new File([blob],"reperes-30-degres.png",{type:"image/png"});
      try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:"Repères de tir 30°"});return}}catch(er){if(er&&er.name==="AbortError")return}
      let u=URL.createObjectURL(blob),a=e("a",{href:u,download:"reperes-30-degres.png"});document.body.append(a),a.click(),setTimeout(()=>{a.remove(),URL.revokeObjectURL(u)},4e3);
      A("Image enregistrée : elle reste sur cet appareil.","ok");
    },"image/png");
  }
  function result(){
    let cvL=e("canvas",{style:{display:"block",width:"100%",borderRadius:"12px"}}),cvR=e("canvas",{style:{display:"block",width:"100%",borderRadius:"12px"}}),gl=e("div.stack",{style:{gap:"6px"}},e("b","Côté gauche : à partir de la ligne jaune"),cvL),gr=e("div.stack",{style:{gap:"6px"}},e("b","Côté droit : jusqu’à la ligne jaune"),cvR);
    let pz=sides.pano,pcv=e("canvas",{style:{display:"block",width:"100%",borderRadius:"12px"}}),pinfo=e("div.small");
    let pblock=pz?e("div.stack",{style:{gap:"6px"}},e("b","Vue d’ensemble filmée"),pcv,pinfo,
        e("div.row",{style:{gap:"8px",flexWrap:"wrap"}},x("Refilmer la zone",{icon:"camera",kind:"ghost",size:"sm",onClick:()=>{step="sweep";view()}}),x("Retirer le panorama",{kind:"ghost",size:"sm",onClick:()=>{sides.pano=null;view()}}))):
      e("div.panel.stack",{style:{gap:"8px"}},e("b","Facultatif : filmer la zone pour voir l’ensemble"),
        e("div.small","Partez de l’obstacle de gauche et tournez lentement jusqu’à celui de droite. L’appli assemble le film en panorama, y retrouve vos deux photos et y place les deux lignes jaunes, avec la largeur de la zone de tir."),
        x("Filmer la zone",{icon:"camera",kind:"ghost",onClick:()=>{step="sweep";view()}}));
    C(host,e("div.stack",
      e("div.panel",{style:{background:"#3F7A55",color:"#fff",borderColor:"transparent"}},
        e("div.display",{style:{fontSize:"24px",fontWeight:700}},"Votre zone de tir : entre les deux lignes jaunes"),
        e("div.small",{style:{marginTop:"4px"}},(m?"30° réglementaires + "+m+"° de marge":"30° réglementaires exacts")+". Choisissez un repère fixe sur chaque ligne (arbre, piquet, souche) : au poste, tirez seulement entre ces deux repères.")),
      pblock,
      e("div.grid.g-2",gl,gr),
      e("div.row",{style:{gap:"8px",flexWrap:"wrap"}},x("Partager l’image des repères",{icon:"download",kind:"primary",onClick:share}),x("Refaire la photo de gauche",{kind:"ghost",onClick:()=>{step="L";view()}}),x("Refaire la photo de droite",{kind:"ghost",onClick:()=>{step="R";view()}})),
      e("p.tiny.muted",{style:{margin:0}},"La méthode photo n’utilise ni boussole ni gyroscope : rien ne dérive. Elle suppose une photo prise téléphone droit, sans zoom, avec l’objectif indiqué. Aide visuelle : elle ne remplace ni les consignes du chef de ligne, ni l’identification de la cible et de l’arrière-plan."),
      x("Terminer",{kind:"ghost",size:"block",onClick:back})));
    requestAnimationFrame(()=>{if(pz){let r=A30SweepDraw(pcv,pz,sides,m,pcv.parentElement.clientWidth||340);
        pinfo.textContent="Entre les deux obstacles : "+Math.round(r.between)+"°. "+(r.zone>0?"Zone de tir : "+Math.round(r.zone)+"° de large (en vert).":"Il n’y a pas de zone de tir : il faut au moins "+(60+2*m)+"° entre les obstacles.")+" Le panorama sert à voir l’ensemble ; les lignes exactes sont celles des photos."+(pz.edge||pz.conf<.65?" Assemblage peu sûr : refilmez plus lentement si les lignes ne tombent pas aux mêmes repères que sur les photos.":"");
        if(r.zone<=0)pinfo.style.color="var(--danger,#D2513F)"}
      A30PhotoDraw(cvL,sides.L,"L",m,cvL.parentElement.clientWidth||340);A30PhotoDraw(cvR,sides.R,"R",m,cvR.parentElement.clientWidth||340)});
  }
  view();
}
