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
    let side=step,st=sides[side],other=side==="L"?"gauche":"droite";
    let head=e("div.panel",{style:{background:"#2F6F8F",color:"#fff",borderColor:"transparent"}},
      e("div.display",{style:{fontSize:"22px",fontWeight:700}},(side==="L"?"1/2":"2/2")+" · Photo de l’obstacle de "+other),
      e("div.small",{style:{marginTop:"4px"}},side==="L"?"Placez le dernier obstacle de gauche (voisin, poste, chemin…) dans la moitié GAUCHE de la photo, avec de la place à sa droite.":"Placez le dernier obstacle de droite dans la moitié DROITE de la photo, avec de la place à sa gauche."));
    let tips=e("p.tiny.muted",{style:{margin:0}},"Téléphone bien droit, sans zoom, objectif principal. En paysage, la photo couvre plus large et la limite des 30° y entre plus facilement.");
    let shoot=e("div.row",{style:{gap:"8px",flexWrap:"wrap"}},
      x(st?"Reprendre la photo":"Prendre la photo",{icon:"camera",kind:st?"ghost":"primary",onClick:()=>pickInput(!0,async f=>{sides[side]=await load(f);view()})}),
      x("Choisir une photo",{icon:"plus",kind:"ghost",onClick:()=>pickInput(!1,async f=>{sides[side]=await load(f);view()})}));
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
    C(host,e("div.stack",head,wrap,msg,fine,go,e("div.field",e("label","Objectif utilisé"),lensSel),lensInfo,
      e("div.field",e("label","Marge en plus des 30°"),ke([["0","Aucune (30° exacts)"],["5","+5°"],["10","+10°"]],String(m),v9=>{m=+v9;Pe.set("ang30:marge",m);view()})),
      shoot,x(side==="L"?"Retour":"Revenir à la photo de gauche",{kind:"ghost",onClick:()=>side==="L"?back():(step="L",view())})));
    requestAnimationFrame(redraw);
  }
  function compose(){
    let cw=1080,parts=["L","R"].map(sd=>{let cv=document.createElement("canvas");A30PhotoDraw(cv,sides[sd],sd,m,cw/ (Math.min(2,window.devicePixelRatio||1)) );return cv});
    let H=parts.reduce((a,p)=>a+p.height,0)+170,out=document.createElement("canvas");out.width=parts[0].width;out.height=H;let c=out.getContext("2d");c.fillStyle="#131b19";c.fillRect(0,0,out.width,H);
    let y=0;parts.forEach(p=>{c.drawImage(p,0,y);y+=p.height});
    c.fillStyle="#fff";c.font="700 34px Barlow, sans-serif";c.textAlign="left";c.fillText("Zone de tir : entre les deux lignes jaunes"+(m?" (30° + "+m+"° de marge)":" (30° réglementaires)"),24,y+50);
    c.font="600 24px Barlow, sans-serif";c.fillStyle="rgba(255,255,255,.8)";c.fillText("Haut : obstacle de gauche · Bas : obstacle de droite · méthode photo, sans boussole",24,y+92);
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
    C(host,e("div.stack",
      e("div.panel",{style:{background:"#3F7A55",color:"#fff",borderColor:"transparent"}},
        e("div.display",{style:{fontSize:"24px",fontWeight:700}},"Votre zone de tir : entre les deux lignes jaunes"),
        e("div.small",{style:{marginTop:"4px"}},(m?"30° réglementaires + "+m+"° de marge":"30° réglementaires exacts")+". Choisissez un repère fixe sur chaque ligne (arbre, piquet, souche) : au poste, tirez seulement entre ces deux repères.")),
      e("div.grid.g-2",gl,gr),
      e("div.row",{style:{gap:"8px",flexWrap:"wrap"}},x("Partager l’image des repères",{icon:"download",kind:"primary",onClick:share}),x("Refaire la photo de gauche",{kind:"ghost",onClick:()=>{step="L";view()}}),x("Refaire la photo de droite",{kind:"ghost",onClick:()=>{step="R";view()}})),
      e("p.tiny.muted",{style:{margin:0}},"La méthode photo n’utilise ni boussole ni gyroscope : rien ne dérive. Elle suppose une photo prise téléphone droit, sans zoom, avec l’objectif indiqué. Aide visuelle : elle ne remplace ni les consignes du chef de ligne, ni l’identification de la cible et de l’arrière-plan."),
      x("Terminer",{kind:"ghost",size:"block",onClick:back})));
    requestAnimationFrame(()=>{A30PhotoDraw(cvL,sides.L,"L",m,cvL.parentElement.clientWidth||340);A30PhotoDraw(cvR,sides.R,"R",m,cvR.parentElement.clientWidth||340)});
  }
  view();
}
