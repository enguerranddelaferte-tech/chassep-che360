/* ----- Lancement (3.0) : Pionniers = bêta-testeurs actifs (4 semaines + 3 avis : Combo à 19,99 €/an à vie, badge, 3 invitations), 500 Fondateurs (tarifs de lancement) ----- */
/* Fondateur : attribué à la création du compte (handle_new_user). Pionnier : attribué chaque nuit (promote_beta_pioneers) ou par l’admin. Ici : affichage. */
var S3L={st:null,at:0,badges:null,bLoading:null};
const S3LPromo={"Premium Chasse":[29.99,19.99],"Premium Pêche":[29.99,19.99],"Combo 360°":[44.99,29.99],"Territoire Essentiel":[79,39],"Territoire Pro":[149,99]};
function S3LEuro(n){return (Math.round(n*100)/100).toFixed(n%1?2:0).replace(".",",")+" €"}
async function S3LStatus(force){
  if(!S3NfLive())return null;
  if(!force&&S3L.st&&Date.now()-S3L.at<60000)return S3L.st;
  let r=await S3Sb("POST","rpc/launch_status",{});
  if(r&&r.ok&&r.json){S3L.st=r.json;S3L.at=Date.now()}
  return S3L.st;
}
function S3LLeft(st){return st?{pio:0,fon:Math.max(0,st.founders_max-st.founders_taken),acca:Math.max(0,st.acca_max-st.acca_taken)}:null}
async function S3LMe(){
  if(!w.user||!S3NfLive())return {};
  if(S3L.me&&S3L.meId===w.user.id)return S3L.me;
  let r=await S3Sb("GET","users?select=data&id=eq."+encodeURIComponent(w.user.id));
  let d=r&&r.ok&&Array.isArray(r.json)&&r.json[0]?r.json[0].data||{}:{};
  S3L.me={tier:d.launchTier||null,until:d.planUntil||null};S3L.meId=w.user.id;return S3L.me;
}
/* Avancement vers le statut Pionnier (bêta) */
async function S3LProgress(){
  let r=await S3Sb("POST","rpc/beta_progress",{});
  return r&&r.ok&&r.json?r.json:null;
}
function S3LMeter(n,max,label){
  let k=Math.min(n,max);
  return e("div.launch-meter",e("div.row",{style:{justifyContent:"space-between",gap:"8px"}},e("span.small",label),e("b.small",k+" / "+max+(n>=max?" ✓":""))),
    e("div.launch-bar",{style:{marginTop:"4px"}},e("i",{style:{width:Math.round(100*k/max)+"%"}})));
}
/* Bandeau sur « Offres & abonnement » */
async function S3LPlans(){
  if(!Mt)return;
  let pg=Mt.querySelector(".page");if(!pg||pg.querySelector(".launch-box"))return;
  let st=await S3LStatus(),L=S3LLeft(st),me=await S3LMe(),tier=me.tier;
  if(location.hash.split("?")[0]!=="#/abonnement"||pg.querySelector(".launch-box"))return;
  let box=e("section.panel.launch-box");
  if(tier==="pionnier"){
    let until=me.until&&new Date(me.until)>new Date()?new Date(me.until).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}):"";
    box.append(e("div.row",{style:{gap:"12px",alignItems:"center"}},e("span.launch-chip.pio","Pionnier"),e("b","Merci pour vos tests et vos avis !")),
      e("p",{style:{margin:"6px 0 0"}},(until?"Votre Combo 360° est offert jusqu’au "+until+". ":"")+"Au lancement, le Combo 360° est à 19,99 € par an pour vous, à vie, tant que votre abonnement n’est pas interrompu."));
    let list=e("div.launch-invites");box.append(e("h3",{style:{margin:"14px 0 6px",fontSize:"16px"}},"Vos 3 invitations"),e("p.small.muted",{style:{margin:"0 0 8px"}},"Chaque code donne le tarif Fondateurs à un ami, même quand les 500 places sont parties."),list);
    S3Sb("POST","rpc/my_invites",{}).then(r=>{
      let rows=r&&r.ok&&Array.isArray(r.json)?r.json:[];
      if(!rows.length){list.append(e("p.small.muted",{style:{margin:0}},"Codes en préparation, revenez dans un instant."));return}
      rows.forEach(x2=>{
        let url=location.origin+location.pathname+"#/communaute?invite="+x2.code;
        list.append(e("div.launch-inv",e("code",x2.code),x2.used?e("span.small.muted","déjà utilisé"):x("Partager",{icon:"send",kind:"ghost",size:"sm",onClick:async()=>{
          let res=await S3ShareData({text:"Je t’invite sur Chasse & Pêche 360°, l’appli des chasseurs et des pêcheurs. Avec mon code "+x2.code+" tu as le tarif Fondateurs :",url,title:"Invitation Chasse & Pêche 360°"});
          if(res==="copied")A("Invitation copiée : collez-la dans un message.","ok");
        }})));
      });
    });
  }else{
    if(tier==="fondateur")box.append(e("div.row",{style:{gap:"12px",alignItems:"center",marginBottom:"10px"}},e("span.launch-chip.fon","Fondateur"),e("span","Tarifs de lancement réservés pour votre première année.")));
    box.append(e("div.row",{style:{gap:"12px",alignItems:"center"}},e("span.launch-chip.pio","Pionniers"),e("b","Testez la bêta, devenez Pionnier")),
      e("p",{style:{margin:"6px 0 0"}},"Utilisez l’appli au moins 4 semaines et envoyez-nous 3 avis depuis la page Contact. Au lancement : Combo 360° à 19,99 € par an, à vie, tant que l’abonnement n’est pas interrompu, plus le badge Pionnier et 3 invitations."));
    if(w.user){
      let pr=await S3LProgress();
      if(pr)box.append(e("div.stack",{style:{gap:"8px",marginTop:"12px",maxWidth:"420px"}},
        S3LMeter(pr.weeks||0,pr.need_weeks||4,"Semaines d’activité"),S3LMeter(pr.avis||0,pr.need_avis||3,"Avis envoyés"),
        e("p.tiny.muted",{style:{margin:0}},"Le statut est donné automatiquement chaque nuit dès que les deux sont atteints.")));
      box.append(e("div.row",{style:{gap:"8px",marginTop:"12px"}},x("Donner mon avis",{kind:"primary",size:"sm",icon:"send",href:"#/contact?sujet=avis"})));
    }
    if(L&&L.fon>0&&tier!=="fondateur")box.append(e("p.small.muted",{style:{margin:"12px 0 0"}},"Fondateurs : plus que "+L.fon+" place"+(L.fon>1?"s":"")+" sur 500 pour les tarifs de lancement."));
  }
  let h=pg.querySelector(".page-head");h?h.after(box):pg.prepend(box);
  /* tarifs barrés sur les cartes */
  let promo=(L&&L.fon>0)||tier==="fondateur"||tier==="pionnier";
  if(!promo)return;
  pg.querySelectorAll("section.plan").forEach(sec=>{
    let name=((sec.querySelector("h2")||{}).textContent||"").trim(),p=S3LPromo[name],price=sec.querySelector(".price");
    if(!p||!price||price.dataset.promo)return;
    let pio=tier==="pionnier"&&name==="Combo 360°";
    price.dataset.promo="1";
    let small=price.querySelector("small");
    W(price);price.append(e("s.launch-old",S3LEuro(p[0])),S3LEuro(pio?19.99:p[1]),small||"");
    sec.querySelector("p")&&sec.querySelector("p").before(pio?e("span.launch-chip.pio",{style:{alignSelf:"flex-start"}},"Prix Pionnier · à vie"):e("span.launch-chip.fon",{style:{alignSelf:"flex-start"}},"Offre Fondateurs · 1re année"));
  });
}
/* Badges Pionnier / Fondateur à côté des noms dans le fil */
async function S3LBadgeMap(){
  if(S3L.badges)return S3L.badges;
  if(!S3NfLive())return new Map();
  if(!S3L.bLoading)S3L.bLoading=S3Sb("POST","rpc/launch_badges",{}).then(r=>{S3L.badges=new Map(r&&r.ok&&Array.isArray(r.json)?r.json.map(x2=>[x2.user_id,x2.tier]):[]);return S3L.badges}).catch(()=>new Map());
  return S3L.bLoading;
}
async function S3LBadges(){
  if(!Mt||!S3NfLive())return;
  let m=await S3LBadgeMap();if(!m.size)return;
  Mt.querySelectorAll("article.post:not([data-lb])").forEach(a=>{
    a.dataset.lb="1";
    let id=S3PostAuthor(a),t=id&&m.get(id);if(!t)return;
    let l=a.querySelector("a[href^='#/profil/']");
    l&&l.after(e("span.launch-chip."+(t==="pionnier"?"pio":"fon"),{style:{marginLeft:"8px"}},t==="pionnier"?"Pionnier":"Fondateur"));
  });
}
/* Compteur pour les visiteurs, dans l’encart « Rejoignez la communauté » */
async function S3LGuest(){
  if(w.user||!Mt)return;
  let cta=Mt.querySelector(".guest-cta");if(!cta||cta.querySelector(".launch-guest"))return;
  let L=S3LLeft(await S3LStatus());if(cta.querySelector(".launch-guest"))return;
  let txt="Bêta ouverte : testez l’appli, donnez votre avis et devenez Pionnier (Combo 360° à 19,99 € par an, à vie)."+(L&&L.fon>0?" Plus que "+L.fon+" places Fondateurs.":"");
  cta.append(e("div.launch-guest",e("span.launch-chip.pio","Pionniers"),e("span",txt)));
}
/* Lien d’invitation : #/…?invite=CODE */
function S3LInvite(){
  try{
    let q=new URLSearchParams(location.hash.split("?")[1]||""),c=(q.get("invite")||"").trim().toUpperCase();
    if(!c)return;
    sessionStorage.setItem("cp360.invite",c);
    if(!w.user&&!S3L.invOpened){S3L.invOpened=1;setTimeout(()=>{try{S3LoginOpen("register")}catch{}},600)}
  }catch{}
}
function S3LInviteCode(){try{return sessionStorage.getItem("cp360.invite")||""}catch{return ""}}
function S3LaunchDeco(p){
  try{S3LInvite()}catch{}
  if(p==="/abonnement")S3LPlans().catch(()=>{});
  S3LGuest().catch(()=>{});
}
