
/* ----- Album du profil (3.0) : photos compressées et liens vidéo, par personne ----- */
/* Table albums : photo (data-URL JPEG ≤ 1 Mo) ou vidéo (lien YouTube / Instagram). Visibilité : public ou privé. */
var S3AlbRe=/^https:\/\/(www\.)?(instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+|youtube\.com\/watch\?v=[A-Za-z0-9_-]+|youtu\.be\/[A-Za-z0-9_-]+)/;
function S3AlbId(p){
  if(p==="/profil")return w.user?w.user.id:null;
  let m=String(p).match(/^\/profil\/([^/?]+)$/);
  return m?decodeURIComponent(m[1]):null;
}
function S3AlbCompress(file){
  return new Promise((ok,ko)=>{
    let url=URL.createObjectURL(file),img=new Image();
    img.onload=()=>{
      let sc=Math.min(1,1080/Math.max(img.width,img.height)),c=document.createElement("canvas");
      c.width=Math.max(1,Math.round(img.width*sc));c.height=Math.max(1,Math.round(img.height*sc));
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(url);
      let q=.75,d=c.toDataURL("image/jpeg",q);
      while(d.length>8e5&&q>.4){q-=.1;d=c.toDataURL("image/jpeg",q)}
      d.length>8e5?ko(new Error("trop lourde")):ok(d);
    };
    img.onerror=()=>{URL.revokeObjectURL(url);ko(new Error("illisible"))};
    img.src=url;
  });
}
function S3AlbItem(a,mine,reload){
  let del=mine?x("Supprimer",{size:"sm",kind:"ghost",onClick:async()=>{
    if(!(await ve({title:"Supprimer cet élément ?",text:"Il disparaîtra de votre album.",confirm:"Supprimer"})))return;
    let d=await S3Sb("DELETE","albums?id=eq."+encodeURIComponent(a.id));
    d.ok?(A("Élément supprimé."),reload()):A("Suppression impossible.","warn");
  }}):null;
  let tag=a.visibility==="private"?e("span.tag.tiny",mine?"Privé":""):null;
  let share=S3ShareBtn(()=>a.kind==="photo"
    ?{text:a.caption||"",img:a.photo,title:"Photo de l’album"}
    :{text:a.caption||"",url:a.url,title:"Vidéo"});
  if(a.kind==="photo")return e("figure.alb-item",e("img",{src:a.photo,alt:a.caption||"Photo de l’album",loading:"lazy",decoding:"async"}),
    e("figcaption",e("span",a.caption||""),tag,share,del));
  return e("div.alb-item.alb-video",
    e("a",{href:a.url,target:"_blank",rel:"noopener",class:"alb-video-link"},b("play"),e("span",a.caption||"Vidéo")),
    e("div.alb-foot",tag,share,del));
}
async function S3AlbBox(uid){
  let mine=!!(w.user&&w.user.id===uid),msg=e("p.tiny.muted",{role:"status","aria-live":"polite",style:{margin:"6px 0 0"}});
  let grid=e("div.alb-grid");
  const load=async()=>{
    let r=await S3Sb("GET","albums?owner_id=eq."+encodeURIComponent(uid)+"&select=id,kind,photo,url,caption,visibility,created_at&order=created_at.desc&limit=200");
    W(grid);
    let rows=r&&r.ok&&Array.isArray(r.json)?r.json:null;
    if(!rows){C(grid,e("p.muted",{style:{margin:0}},"Album indisponible pour le moment."));return}
    if(!rows.length){C(grid,e("p.muted",{style:{margin:0}},mine?"Votre album est vide : ajoutez une photo ou un lien vidéo.":"Aucun élément pour le moment."));return}
    rows.forEach(a=>C(grid,S3AlbItem(a,mine,load)));
  };
  let form=null;
  if(mine){
    const inp={border:"1px solid var(--line-strong)",borderRadius:"var(--r-sm)",background:"var(--surface)",color:"inherit",minHeight:"var(--touch)",padding:"0 12px",width:"100%"};
    let file=e("input",{type:"file",accept:"image/jpeg,image/png,image/webp",style:{width:"100%"},"aria-label":"Choisir une photo"}),
        cap=e("input",{type:"text",maxLength:200,placeholder:"Légende (facultatif)",style:inp,"aria-label":"Légende"}),
        vis=e("select",{style:{...inp,padding:"0 10px"},"aria-label":"Visibilité"},e("option",{value:"public"},"Public"),e("option",{value:"private"},"Privé (moi seul)")),
        vid=e("input",{type:"url",placeholder:"https://www.youtube.com/watch?v=… ou https://www.instagram.com/p/…",style:inp,"aria-label":"Lien vidéo"});
    let pb=x("Ajouter la photo",{icon:"camera",kind:"primary",size:"block",onClick:async()=>{
      if(!file.files||!file.files[0]){msg.textContent="Choisissez une photo.";return}
      pb.disabled=!0;msg.textContent="Préparation de la photo…";
      try{
        let d=await S3AlbCompress(file.files[0]);
        let r=await S3Sb("POST","albums",{owner_id:w.user.id,kind:"photo",photo:d,caption:cap.value.trim(),visibility:vis.value},{Prefer:"return=minimal"});
        if(r.ok){A("Photo ajoutée à l’album."),file.value="",cap.value="",msg.textContent="";load()}
        else msg.textContent=r.status===401||r.status===403?"Votre session a expiré : reconnectez-vous.":"Ajout impossible pour le moment.";
      }catch{msg.textContent="Photo trop lourde ou illisible : essayez une image plus petite."}
      pb.disabled=!1;
    }});
    let vb=x("Ajouter le lien vidéo",{icon:"play",kind:"ghost",size:"block",onClick:async()=>{
      let url=vid.value.trim().replace(/[?&](igsh|si|utm_[a-z]+)=[^&]*/g,"").replace(/[?&]$/,"");
      if(!S3AlbRe.test(url)){msg.textContent="Lien non reconnu : il faut un lien YouTube (watch?v=) ou Instagram (/p/ ou /reel/).";return}
      vb.disabled=!0;
      let r=await S3Sb("POST","albums",{owner_id:w.user.id,kind:"video",url,caption:cap.value.trim(),visibility:vis.value},{Prefer:"return=minimal"});
      vb.disabled=!1;
      if(r.ok){A("Vidéo ajoutée à l’album."),vid.value="",cap.value="",msg.textContent="";load()}
      else msg.textContent=r.status===401||r.status===403?"Votre session a expiré : reconnectez-vous.":"Ajout impossible pour le moment.";
    }});
    form=e("div.stack",
      e("div.field",e("label","Photo"),file),
      e("div.field",e("label","Lien vidéo"),vid),
      e("div.field",e("label","Légende"),cap),
      e("div.field",e("label","Visibilité"),vis),
      pb,vb,msg);
  }
  load();
  return e("section.card.alb-box",
    e("h3",{style:{margin:"0 0 4px"}},"Album"),
    e("p.tiny.muted",{style:{margin:"0 0 12px"}},mine?"Vos photos et vidéos. Les photos sont compressées automatiquement.":"Photos et vidéos partagées par cette personne."),
    form?e("details.alb-add",e("summary",{style:{cursor:"pointer",fontWeight:600,marginBottom:"10px"}},"Ajouter à l’album"),form):null,
    grid);
}
async function S3AlbInject(p){
  let uid=S3AlbId(p);
  if(!uid)return;
  if(!(window.cp360Sb&&window.cp360Sb.on&&window.cp360Sb.on()))return; /* pas de base hors ligne : l’album est réservé à la version connectée */
  let pg=Mt&&Mt.querySelector(".page");
  if(!pg||pg.querySelector(".alb-box"))return;
  let box=await S3AlbBox(uid);
  if(location.hash.split("?")[0]!==p)return;
  pg.querySelector(".alb-box")||pg.append(box);
}
