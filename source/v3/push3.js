/* ----- Alertes sur le téléphone, même appli fermée (Web Push) ----- */
function S3IsIOS(){return/iPhone|iPad|iPod/.test(navigator.userAgent)||navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1}
function S3Standalone(){try{return!!navigator.standalone||matchMedia("(display-mode: standalone)").matches}catch{return!1}}
async function S3PushState(){
  let sb=window.cp360Sb,hosted=!!(sb&&sb.on&&sb.on());
  if(!hosted)return"artifact";
  if(!sb.session||!sb.session())return"nosession";
  if(S3IsIOS()&&!S3Standalone())return"ios-install";
  if(!("serviceWorker"in navigator)||!("PushManager"in window)||!("Notification"in window))return"unsupported";
  if(Notification.permission==="denied")return"denied";
  try{let reg=await Promise.race([navigator.serviceWorker.ready,new Promise(r=>setTimeout(()=>r(null),3e3))]),sub=reg&&await reg.pushManager.getSubscription();if(sub&&Notification.permission==="granted")return"on"}catch{}
  return"off"
}
var S3PushTxt={
  artifact:["Disponible dans l’appli installée","Les alertes appli fermée passent par la version installée sur votre téléphone (site de l’appli ajouté à l’écran d’accueil). Cet aperçu ne peut pas les recevoir."],
  nosession:["Connectez votre compte","Les alertes arrivent sur les comptes enregistrés. Connectez-vous avec votre adresse e-mail pour les activer."],
  "ios-install":["Ajoutez d’abord l’appli à l’écran d’accueil","Sur iPhone : touchez Partager puis « Sur l’écran d’accueil », ouvrez l’appli depuis son icône, puis revenez ici pour activer les alertes (iOS 16.4 ou plus récent)."],
  unsupported:["Non pris en charge sur ce navigateur","Utilisez Chrome, Edge, Firefox ou Safari récent pour recevoir les alertes."],
  denied:["Alertes bloquées","Vous avez refusé les notifications. Autorisez-les dans les réglages du navigateur pour ce site, puis revenez ici."],
  off:["Recevez les alertes, même appli fermée","SOS à proximité, début et fin de traque, messages et demandes d’ami s’affichent sur votre écran verrouillé."],
  on:["Alertes activées sur cet appareil","Vous recevrez les SOS, les traques, les messages et les demandes d’ami même quand l’appli est fermée."]
};
function S3PushCard(compact){
  let box=e("div.push-card",{"aria-live":"polite"},e("div.row",e("span.ic",b("bell")),e("div.grow",e("b","Alertes sur ce téléphone"),e("div.small.muted","Vérification…"))));
  let draw=async()=>{
    let st=await S3PushState(),[t,txt]=S3PushTxt[st],acts=[];
    st==="off"&&acts.push(x("Activer les alertes",{icon:"bell",kind:"primary",size:"sm",onClick:async ev=>{let bt=ev.currentTarget;bt.disabled=!0;try{await window.cp360Sb.enablePush()}finally{bt.disabled=!1,draw()}}}));
    st==="on"&&acts.push(x("Afficher une alerte d’essai",{icon:"bell",size:"sm",onClick:async()=>{try{let reg=await navigator.serviceWorker.ready;await reg.showNotification("Chasse & Pêche 360°",{body:"Les alertes fonctionnent sur cet appareil.",tag:"cp360-test",icon:"icon.svg",badge:"icon.svg",data:{link:"#/notifications"}});A("Alerte d’essai envoyée : regardez le haut de l’écran.")}catch{A("Impossible d’afficher l’alerte d’essai.","warn")}}}));
    st==="nosession"&&acts.push(x("Se connecter",{size:"sm",kind:"primary",href:"#/connexion"}));
    box.className="push-card "+st;
    B(box,e("div.row",{style:{alignItems:"flex-start"}},e("span.ic",b(st==="on"?"check":st==="denied"?"alert":"bell")),e("div.grow",e("b",t),compact&&st==="on"?null:e("div.small.muted",txt))),acts.length?e("div.push-acts",acts):null)
  };
  draw();return box
}
function S3PushNudge(){
  if(Pe.get("pushNudge",0)>Date.now())return null;
  let slot=e("div");
  S3PushState().then(st=>{if(st!=="off"&&st!=="ios-install")return;
    let card=S3PushCard(!0);card.classList.add("nudge");
    card.append(e("button.icon-btn.push-x",{type:"button","aria-label":"Plus tard",title:"Plus tard",onclick:()=>{Pe.set("pushNudge",Date.now()+7*864e5),slot.remove()}},b("close")));
    C(slot,card)});
  return slot
}
function S3PushInject(p){
  if(!Mt||!w.user)return;
  if(p==="/notifications"){let pg=Mt.querySelector(".page");if(pg&&!pg.querySelector(".push-card")){let h=pg.querySelector(".page-head");h&&h.after(S3PushCard())}
    Mt.querySelectorAll(".page-head .actions .btn").forEach(bt=>{/Activer les alertes/.test(bt.textContent)&&bt.remove()})}
  if(p==="/profil"){let pg=Mt.querySelector(".page");if(pg&&!pg.querySelector(".push-card")){let h=pg.querySelector(".page-head");h&&h.after(S3PushCard())}}
}
