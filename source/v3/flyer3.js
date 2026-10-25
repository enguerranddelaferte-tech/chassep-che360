/* ----- Ambassadeurs (3.0) : choisir son code et créer un visuel à publier, avec QR code ----- */
const S3FlyFormats=[
  {id:"carre",label:"Carré",w:1080,h:1080},
  {id:"portrait",label:"Portrait",w:1080,h:1350},
  {id:"story",label:"Story",w:1080,h:1920},
  {id:"a5",label:"Affiche A5",w:1748,h:2480}
];
const S3FlyThemes={
  chasse:{bg:"img/fond-chasse.webp?v=3",acc:"#F26F21",acc2:"#FFB27A",pos:[.5,.4],word:"chasse"},
  peche:{bg:"img/fond-peche.webp?v=3",acc:"#4FC3E8",acc2:"#9FD4E6",pos:[.4,.6],word:"pêche"}
};
function S3FlyUrl(code){return (typeof S3SiteURL==="string"?S3SiteURL:location.origin+location.pathname)+"#/communaute?invite="+encodeURIComponent(code)}
function S3FlyImg(src){return new Promise(ok=>{let im=new Image();im.onload=()=>ok(im);im.onerror=()=>ok(null);im.src=src})}
/* QR code dessiné en carrés nets, avec sa marge blanche */
function S3FlyQR(c,text,x0,y0,size){
  let q;try{q=qrcodegen.QrCode.encodeText(text,qrcodegen.QrCode.Ecc.MEDIUM)}catch{return !1}
  let n=q.size+8,m=size/n;c.fillStyle="#FFFFFF";c.fillRect(x0,y0,size,size);c.fillStyle="#131B19";
  for(let y=0;y<q.size;y++)for(let x=0;x<q.size;x++)if(q.getModule(x,y))c.fillRect(Math.floor(x0+(x+4)*m),Math.floor(y0+(y+4)*m),Math.ceil(m),Math.ceil(m));
  return !0;
}
function S3FlyWrap(c,txt,maxW){let words=String(txt).split(" "),lines=[],cur="";words.forEach(wd=>{let t=cur?cur+" "+wd:wd;if(c.measureText(t).width>maxW&&cur){lines.push(cur);cur=wd}else cur=t});cur&&lines.push(cur);return lines}
async function S3FlyDraw(cv,o){
  let F=S3FlyFormats.find(f=>f.id===o.fmt)||S3FlyFormats[0],T=S3FlyThemes[o.theme]||S3FlyThemes.chasse,W2=F.w,H2=F.h,u=W2/1080*(F.id==="story"?1.12:1);
  cv.width=W2;cv.height=H2;let c=cv.getContext("2d");
  try{await document.fonts.load("700 60px Barlow");await document.fonts.load("700 60px 'Barlow Condensed'")}catch{}
  let ff=(wt,px,cond)=>wt+" "+Math.round(px*u)+"px "+(cond?"'Barlow Condensed', Barlow, ":"Barlow, ")+"Arial, sans-serif";
  /* fond : photo recadrée + voile sombre */
  let style=o.style||"photo",photoH=style==="carte"?Math.round(H2*({carre:.42,portrait:.44,story:.46,a5:.42}[F.id])):H2;
  c.fillStyle="#131B19";c.fillRect(0,0,W2,H2);
  let bg=await S3FlyImg(T.bg);
  if(bg){let s=Math.max(W2/bg.width,photoH/bg.height),dw=bg.width*s,dh=bg.height*s;c.drawImage(bg,(W2-dw)*T.pos[0],(photoH-dh)*T.pos[1],dw,dh)}
  if(style==="photo"){let g=c.createLinearGradient(0,0,0,H2);g.addColorStop(0,"rgba(19,27,25,.55)");g.addColorStop(.42,"rgba(19,27,25,.35)");g.addColorStop(1,"rgba(19,27,25,.92)");c.fillStyle=g;c.fillRect(0,0,W2,H2)}
  else{let g=c.createLinearGradient(0,0,0,photoH*.5);g.addColorStop(0,"rgba(19,27,25,.6)");g.addColorStop(1,"rgba(19,27,25,0)");c.fillStyle=g;c.fillRect(0,0,W2,photoH*.5);
    if(style==="bandeau"){let g2=c.createLinearGradient(0,H2*.25,0,H2*.62);g2.addColorStop(0,"rgba(19,27,25,0)");g2.addColorStop(1,"rgba(19,27,25,.55)");c.fillStyle=g2;c.fillRect(0,H2*.25,W2,H2*.4)}}
  let pad=72*u,y=pad;
  /* en-tête : logo + nom de l'appli */
  let logo=await S3FlyImg("icons/icon-512.png"),ls=96*u;
  if(logo){c.save();c.beginPath();c.roundRect?c.roundRect(pad,y,ls,ls,22*u):c.rect(pad,y,ls,ls);c.clip();c.drawImage(logo,pad,y,ls,ls);c.restore()}
  c.fillStyle="#F3F0E8";c.font=ff("700",46,!0);c.textBaseline="middle";c.fillText("Chasse & Pêche 360°",pad+(logo?ls+24*u:0),y+ls/2);
  c.textBaseline="alphabetic";
  /* mention légale de partenariat (loi du 9 juin 2023) */
  let extraH=0;
  let headerBottom=y+ls+extraH,site=(typeof S3SiteURL==="string"?S3SiteURL:"").replace(/^https?:\/\//,"").replace(/\/$/,""),N=" ";
  /* Textes adaptés à chaque format */
  const TX={
    carre:{title:"L’appli des chasseurs et des pêcheurs",sub:"",promo:"Avec mon code, le Combo à 29,99"+N+"€ au lieu de 44,99"+N+"€ la 1re année."},
    portrait:{title:"Rejoignez-moi sur l’appli des chasseurs et des pêcheurs",sub:"Sorties, carte, météo et sécurité au poste, réunis dans une seule appli.",promo:"Avec mon code, tarif Fondateurs la 1re année : Combo 29,99"+N+"€ au lieu de 44,99"+N+"€, Chasse ou Pêche 19,99"+N+"€ au lieu de 29,99"+N+"€."},
    story:{title:"Rejoignez-moi sur l’appli des chasseurs et des pêcheurs !",sub:"",promo:"Tarif Fondateurs avec mon code : Combo 29,99"+N+"€ au lieu de 44,99"+N+"€"},
    a5:{title:"L’appli des chasseurs et des pêcheurs",list:["Fil d’actualité et communauté","Carte, territoires, météo et lune","Sorties suivies et bouton SOS","Calculateur d’angle de 30° au poste"],promo:"Avec mon code, tarif Fondateurs la 1re année : Combo 29,99"+N+"€ au lieu de 44,99"+N+"€ · Chasse ou Pêche 19,99"+N+"€ au lieu de 29,99"+N+"€"}
  }[F.id];
  let title=o.title||TX.title,amb=("Ambassadeur"+(o.name?" · "+o.name:"")).toUpperCase().slice(0,48);
  let pill=(cx,cy0,h,align,mw)=>{let csz=88;c.font=ff("700",csz,!0);while(c.measureText(o.code).width+56*u>(mw||W2-pad*2)&&csz>36){csz-=4;c.font=ff("700",csz,!0)}
    let w=c.measureText(o.code).width+56*u,x0=align==="center"?cx-w/2:cx;c.fillStyle=T.acc;if(c.roundRect){c.beginPath();c.roundRect(x0,cy0,w,h,18*u);c.fill()}else c.fillRect(x0,cy0,w,h);
    c.fillStyle="#131B19";c.textBaseline="middle";c.textAlign="left";c.fillText(o.code,x0+28*u,cy0+h/2+3*u);c.textBaseline="alphabetic";return w};
  if(style!=="photo"){S3FlyAlt(c,{F,T,o,u,ff,W2,H2,pad,headerBottom,photoH,style,TX,title,amb,site,pill})}
  else if(F.id==="carre"||F.id==="portrait"){
    /* Publication : code + tarif à gauche, QR à droite, message au-dessus */
    let urlY=H2-pad*0.55,bottom=urlY-34*u,qs=(F.id==="carre"?280:320)*u,qx=W2-pad-qs,qy=bottom-qs;
    let hasQR=S3FlyQR(c,S3FlyUrl(o.code),qx,qy,qs);
    if(hasQR){c.fillStyle="#FFFFFF";c.font=ff("600",24);c.textAlign="center";c.fillText("Scannez pour vous inscrire",qx+qs/2,qy-16*u);c.textAlign="left"}
    let colW=W2-pad*2-(hasQR?qs+44*u:0);
    c.font=ff("600",28);let promo=S3FlyWrap(c,TX.promo,colW),plh=37*u;
    let py=bottom-(promo.length-1)*plh;c.fillStyle="#F3F0E8";promo.forEach((l,i)=>c.fillText(l,pad,py+i*plh));
    let codeH=104*u,codeY=py-28*u-26*u-codeH;pill(pad,codeY,codeH,"left",colW);
    c.font=ff("700",28);c.fillStyle=T.acc2;c.fillText("MON CODE",pad,codeY-14*u);
    let zoneTop=Math.min(codeY-14*u-28*u,hasQR?qy-16*u-24*u:1e9)-40*u;
    let hs=F.id==="carre"?80:88,head,sub=[],lh,slh=40*u,blockH;
    if(TX.sub){c.font=ff("500",30);sub=S3FlyWrap(c,TX.sub,W2-pad*2)}
    for(;;){c.font=ff("700",hs,!0);head=S3FlyWrap(c,title,W2-pad*2);lh=hs*u*1.04;blockH=42*u+head.length*lh+(sub.length?14*u+sub.length*slh:0);if(zoneTop-blockH>=headerBottom+30*u||hs<=48)break;hs-=6}
    if(zoneTop-blockH<headerBottom+30*u){sub=[];blockH=42*u+head.length*lh}
    let yy=zoneTop-blockH;
    c.fillStyle=T.acc2;c.font=ff("700",28);c.fillText(amb,pad,yy+28*u);yy+=42*u;
    c.fillStyle="#F3F0E8";c.font=ff("700",hs,!0);head.forEach(l=>{yy+=lh;c.fillText(l,pad,yy-lh*.18)});
    if(sub.length){yy+=14*u;c.font=ff("500",30);c.fillStyle="#D9D4C7";sub.forEach(l=>{yy+=slh;c.fillText(l,pad,yy-8*u)})}
    c.font=ff("500",22);c.fillStyle="rgba(243,240,232,.75)";c.fillText(site,pad,urlY);
  }else{
    /* Story et affiche : une colonne centrée, de haut en bas ; tailles réduites si besoin pour tout faire tenir */
    let story=F.id==="story",cx=W2/2,maxW=W2-pad*2;
    let top=story?Math.max(headerBottom+50*u,250*u):headerBottom+60*u,bot=story?H2-280*u:H2-pad*0.8-(o.collab?44*u:0);
    let qs0=(story?420:560),hs0=(story?88:100),k=1,items,total;
    for(let it2=0;it2<14;it2++){
      items=[];let add=(h,draw,gap)=>items.push({h,draw,gap:gap||0});
      add(34*u,yy=>{c.fillStyle=T.acc2;c.font=ff("700",30);c.textAlign="center";c.fillText(amb,cx,yy+30*u)});
      let hs=Math.round(hs0*k);c.font=ff("700",hs,!0);let head=S3FlyWrap(c,title,maxW),lh=hs*u*1.04;
      add(head.length*lh,yy=>{c.fillStyle="#F3F0E8";c.font=ff("700",hs,!0);c.textAlign="center";head.forEach((l,i)=>c.fillText(l,cx,yy+(i+1)*lh-lh*.18))},18*u);
      if(TX.list){let fs=Math.round(36*Math.min(1,k+.1)),lh2=fs*1.45*u;add(TX.list.length*lh2,yy=>{c.font=ff("500",fs);c.fillStyle="#E6E1D5";c.textAlign="center";TX.list.forEach((l,i)=>c.fillText(l,cx,yy+(i+1)*lh2-12*u))},30*u)}
      let qs=qs0*k*u;
      add(qs+50*u,yy=>{c.fillStyle="#FFFFFF";c.font=ff("600",30);c.textAlign="center";c.fillText(story?"Scannez ou utilisez mon code":"Scannez pour vous inscrire",cx,yy+30*u);S3FlyQR(c,S3FlyUrl(o.code),cx-qs/2,yy+50*u,qs)},40*u);
      let codeH=112*u;add(40*u+codeH,yy=>{c.font=ff("700",28);c.fillStyle=T.acc2;c.textAlign="center";c.fillText("MON CODE",cx,yy+28*u);pill(cx,yy+40*u,codeH,"center")},34*u);
      c.font=ff("600",32);let promo=S3FlyWrap(c,TX.promo,maxW*(story?.88:1)),plh=42*u;
      add(promo.length*plh,yy=>{c.font=ff("600",32);c.fillStyle="#F3F0E8";c.textAlign="center";promo.forEach((l,i)=>c.fillText(l,cx,yy+(i+1)*plh-10*u))},24*u);
      add(36*u,yy=>{c.font=ff(story?"500":"600",story?24:30);c.fillStyle="rgba(243,240,232,.8)";c.textAlign="center";c.fillText(site,cx,yy+30*u)},story?28*u:20*u);
      total=items.reduce((a2,it)=>a2+it.h+it.gap,0);
      if(total<=bot-top)break;k*=.93;
    }
    let free=Math.max(0,bot-top-total),yy=top+free*.12,qi=TX.list?3:2;
    items.forEach((it,i)=>{yy+=it.gap+(i===qi?free*.5:0);it.draw(yy);yy+=it.h});
    c.textAlign="left";
  }
  /* mention légale de partenariat (loi du 9 juin 2023) : en petit, en bas, mais lisible */
  if(o.collab){let dark=style==="carte";c.font=ff("600",21);let t="Collaboration commerciale",tw=c.measureText(t).width+22*u,th=32*u,
      bx=W2-pad-tw,by=(F.id==="story"?H2-232*u:H2-pad*0.55-th+9*u);
    if(F.id==="story"||(style==="photo"&&F.id==="a5"))bx=W2/2-tw/2;
    c.fillStyle=dark?"rgba(19,27,25,.08)":"rgba(19,27,25,.55)";if(c.roundRect){c.beginPath();c.roundRect(bx,by,tw,th,8*u);c.fill()}else c.fillRect(bx,by,tw,th);
    c.fillStyle=dark?"#4A5550":"rgba(243,240,232,.92)";c.textAlign="left";c.fillText(t,bx+11*u,by+th-10*u)}
  return cv;
}
/* Styles « carte » (photo en haut, panneau clair) et « bandeau » (photo pleine, bande sombre en bas) */
function S3FlyAlt(c,P){
  let {F,T,o,u,ff,W2,H2,pad,headerBottom,photoH,style,TX,title,amb,site,pill}=P,carte=style==="carte";
  let ink=carte?"#131B19":"#F3F0E8",soft=carte?"#4A5550":"#D9D4C7",lab=carte?(o.theme==="peche"?"#1B4757":"#9C3B05"):T.acc2;
  let qs=({carre:250,portrait:290,story:330,a5:330}[F.id])*u,urlY=H2-pad*0.55,rowBottom=urlY-40*u;
  if(F.id==="story"){rowBottom=H2-290*u;urlY=H2-262*u}
  let colW=W2-pad*2-qs-44*u;c.font=ff("600",27);let promo=S3FlyWrap(c,TX.promo,colW),plh=36*u,codeH=96*u;
  let rowTopEst=rowBottom-Math.max(qs+36*u,(promo.length-1)*plh+51*u+codeH+38*u);
  let panelTop;
  if(carte){panelTop=photoH;c.fillStyle="#F3F0E8";c.fillRect(0,panelTop,W2,H2-panelTop);c.fillStyle=T.acc;c.fillRect(0,panelTop-10*u,W2,10*u)}
  else{panelTop=Math.min(H2*(1-({carre:.38,portrait:.34,story:.30,a5:.33}[F.id])),rowTopEst-46*u);c.fillStyle="#131B19";c.fillRect(0,panelTop,W2,H2-panelTop);c.fillStyle=T.acc;c.fillRect(0,panelTop,W2,10*u)}
  /* rangée du bas : code + tarif à gauche, QR à droite */
  let qx=W2-pad-qs,qy=rowBottom-qs;S3FlyQR(c,S3FlyUrl(o.code),qx,qy,qs);
  c.fillStyle=ink;c.font=ff("600",22);c.textAlign="center";c.fillText("Scannez pour vous inscrire",qx+qs/2,qy-14*u);c.textAlign="left";
  c.font=ff("600",27);let py=rowBottom-(promo.length-1)*plh;
  c.fillStyle=ink;promo.forEach((l,i)=>c.fillText(l,pad,py+i*plh));
  let codeY=py-27*u-24*u-codeH;pill(pad,codeY,codeH,"left",colW);
  c.font=ff("700",26);c.fillStyle=lab;c.fillText("MON CODE",pad,codeY-12*u);
  let rowTop=Math.min(codeY-12*u-26*u,qy-14*u-22*u);
  c.font=ff("500",22);c.fillStyle=carte?"#66726C":"rgba(243,240,232,.75)";c.fillText(site,pad,urlY);
  /* message */
  let maxW=W2-pad*2,hs=({carre:70,portrait:80,story:84,a5:84}[F.id]),head,lh,sub=[],list=TX.list||null,slh=40*u,blockH,top0,bot0;
  if(carte){top0=panelTop+44*u;bot0=rowTop-36*u}else{top0=headerBottom+50*u;bot0=panelTop-50*u}
  if(TX.sub){c.font=ff("500",30);sub=S3FlyWrap(c,TX.sub,maxW)}
  for(;;){c.font=ff("700",hs,!0);head=S3FlyWrap(c,title,maxW);lh=hs*u*1.04;
    blockH=40*u+head.length*lh+(sub.length?12*u+sub.length*slh:0)+(list?16*u+list.length*44*u:0);
    if(blockH<=bot0-top0||hs<=44)break;hs-=4}
  if(blockH>bot0-top0&&list){list=null;blockH=40*u+head.length*lh+(sub.length?12*u+sub.length*slh:0)}
  if(blockH>bot0-top0&&sub.length){sub=[];blockH=40*u+head.length*lh}
  let yy=carte?top0:bot0-blockH;
  c.fillStyle=lab;c.font=ff("700",26);c.fillText(amb,pad,yy+26*u);yy+=40*u;
  c.fillStyle=ink;c.font=ff("700",hs,!0);head.forEach(l=>{yy+=lh;c.fillText(l,pad,yy-lh*.18)});
  if(sub.length){yy+=12*u;c.font=ff("500",30);c.fillStyle=soft;sub.forEach(l=>{yy+=slh;c.fillText(l,pad,yy-8*u)})}
  if(list){yy+=16*u;c.font=ff("500",30);list.forEach(l=>{yy+=44*u;c.fillStyle=T.acc;c.fillRect(pad,yy-20*u,10*u,10*u);c.fillStyle=soft;c.fillText(l,pad+26*u,yy-8*u)})}
}
function S3AmbFlyer(code,name){
  let o={fmt:"carre",theme:"chasse",style:"carte",code,name:name||"",collab:!0,title:""};
  let cv=e("canvas",{style:{width:"100%",height:"auto",display:"block",borderRadius:"12px",background:"#131b19"}}),busy=0,again=0;
  async function draw(){if(busy){again=1;return}busy=1;try{await S3FlyDraw(cv,o)}catch{}busy=0;if(again){again=0;draw()}}
  let seg=(arr,key)=>ke(arr,o[key],v=>{o[key]=v;draw()});
  let titleIn=e("input.input",{maxLength:70,placeholder:"Laissez vide : titre adapté au format",oninput:ev=>{o.title=ev.target.value.trim();draw()}});
  let collab=e("label.row",{style:{gap:"8px",alignItems:"center"}},e("input",{type:"checkbox",checked:!0,onchange:ev=>{o.collab=ev.target.checked;draw()}}),e("span.small","Afficher « Collaboration commerciale » sur l’image"));
  let fname=()=>"chasse-peche-360-"+code.toLowerCase()+"-"+o.fmt+".png";
  let share=x("Partager l’image",{icon:"send",kind:"primary",onClick:()=>cv.toBlob(async b=>{
    if(!b)return;let f=new File([b],fname(),{type:"image/png"});
    try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:"Chasse & Pêche 360°",text:"Avec mon code "+code+" : "+S3FlyUrl(code)});return}}catch(er){if(er&&er.name==="AbortError")return}
    let u2=URL.createObjectURL(b),a=e("a",{href:u2,download:fname()});document.body.append(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(u2)},4e3);A("Image enregistrée sur cet appareil.","ok")},"image/png")});
  let dl=x("Télécharger",{icon:"download",kind:"ghost",onClick:()=>cv.toBlob(b=>{if(!b)return;let u2=URL.createObjectURL(b),a=e("a",{href:u2,download:fname()});document.body.append(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(u2)},4e3)},"image/png")});
  let dlg=Le({title:"Créer un visuel avec mon code",wide:!0,body:e("div.stack",{style:{gap:"12px"}},
      e("div.field",{style:{margin:0}},e("label","Format"),seg(S3FlyFormats.map(f=>[f.id,f.label]),"fmt")),
      e("div.field",{style:{margin:0}},e("label","Style"),seg([["carte","Photo + panneau"],["bandeau","Bandeau"],["photo","Pleine photo"]],"style")),
      e("div.field",{style:{margin:0}},e("label","Ambiance"),seg([["chasse","Chasse"],["peche","Pêche"]],"theme")),
      e("div.field",{style:{margin:0}},e("label","Titre (facultatif)"),titleIn),
      collab,
      e("div",{style:{maxWidth:"420px",margin:"0 auto",width:"100%"}},cv),
      e("p.tiny.muted",{style:{margin:0}},"Le QR code ouvre l’appli avec votre code déjà rempli. Sur vos réseaux, gardez la mention « Collaboration commerciale » visible pendant toute la publication (loi du 9 juin 2023).")),
    actions:[x("Fermer",{kind:"ghost",onClick:()=>dlg.close()}),dl,share]});
  draw();
}
/* L'ambassadeur choisit lui-même son code : l'ancien reste valable (QR et flyers déjà publiés) */
function S3AmbMyCodeDlg(cur){
  return new Promise(done=>{
    let inp=e("input.input",{type:"text",value:cur||"",maxLength:16,autocomplete:"off","aria-label":"Mon code",style:{textTransform:"uppercase",fontWeight:700,letterSpacing:"1px"}}),
      msg=e("p.small.muted",{role:"status",style:{margin:0}},"4 à 16 lettres ou chiffres, sans espace ni accent. Ex. : FLORIAN, SOLOGNE41. Votre ancien code continue de fonctionner (QR codes et visuels déjà publiés)."),res=null,dlg;
    let go=x("Enregistrer",{kind:"primary",onClick:async()=>{
      let v=inp.value.toUpperCase().replace(/[^A-Z0-9]/g,"");
      if(v.length<4||v.length>16){msg.textContent="Le code doit faire entre 4 et 16 lettres ou chiffres.";msg.style.color="var(--danger,#D2513F)";return}
      go.disabled=!0;let r=await S3Sb("POST","rpc/set_my_amb_code",{p_code:v});go.disabled=!1;
      if(!r||!r.ok){msg.textContent=(r&&r.json&&r.json.message)||"Enregistrement impossible.";msg.style.color="var(--danger,#D2513F)";return}
      res=r.json;dlg.close();A("Votre code est maintenant "+res+".","ok");
    }});
    inp.addEventListener("input",()=>{let p=inp.selectionStart;inp.value=inp.value.toUpperCase().replace(/[^A-Z0-9]/g,"");try{inp.setSelectionRange(p,p)}catch{}});
    dlg=Le({title:"Choisir mon code",body:e("div.stack",e("div.field",e("label","Mon code"),inp),msg),actions:[x("Annuler",{kind:"ghost",onClick:()=>dlg.close()}),go],onClose:()=>done(res)});
  });
}
