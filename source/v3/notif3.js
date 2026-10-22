/* ----- Notifications utiles & ambassadeurs (3.0) ----- */
/* Les notifications « un ami a publié » et « nouvelle publication / vidéo d’un ambassadeur suivi »
   sont créées par la base (déclencheurs sur posts et shorts). Ici : synchro des ambassadeurs suivis,
   badge « Ambassadeur » sur les publications, comptage des partages et statistiques de l’ambassadeur. */
var S3Nf={users:null,loading:null,synced:null,pulled:null};
function S3NfLive(){return !!(window.cp360Sb&&window.cp360Sb.on&&window.cp360Sb.on())}
/* Ambassadeurs suivis : le choix local (bouton Suivre) est recopié en base pour recevoir les alertes */
async function S3FollowSync(){
  if(!S3NfLive()||!w.user)return;
  let uid=w.user.id,local=(Pe.get("ambFollow",[])||[]).slice().sort();
  if(S3Nf.pulled!==uid){
    S3Nf.pulled=uid;
    let r=await S3Sb("GET","amb_follows?select=amb_id");
    if(r&&r.ok&&Array.isArray(r.json)){
      let srv=r.json.map(x2=>x2.amb_id),merged=[...new Set([...local,...srv])].sort();
      if(merged.join()!==local.join()){Pe.set("ambFollow",merged);local=merged}
      S3Nf.synced=srv.slice().sort().join("|");
    }
  }
  let key=local.join("|");
  if(key===S3Nf.synced)return;
  let prev=S3Nf.synced?S3Nf.synced.split("|").filter(Boolean):[];
  let add=local.filter(a=>!prev.includes(a)),del=prev.filter(a=>!local.includes(a));
  S3Nf.synced=key;
  try{
    if(add.length)await S3Sb("POST","amb_follows?on_conflict=user_id,amb_id",add.map(a=>({user_id:uid,amb_id:a})),{Prefer:"resolution=ignore-duplicates,return=minimal"});
    if(del.length)await S3Sb("DELETE","amb_follows?user_id=eq."+uid+"&amb_id=in.("+del.map(encodeURIComponent).join(",")+")");
  }catch{S3Nf.synced=null}
}
setInterval(()=>{try{S3FollowSync()}catch{}},4000);
/* Badge « Ambassadeur » sur les publications du fil */
async function S3AmbUsers(){
  if(S3Nf.users)return S3Nf.users;
  if(!S3NfLive())return new Set();
  if(!S3Nf.loading)S3Nf.loading=S3Sb("POST","rpc/amb_user_ids",{}).then(r=>{S3Nf.users=new Set(r&&r.ok&&Array.isArray(r.json)?r.json.map(x2=>x2.user_id):[]);return S3Nf.users}).catch(()=>new Set());
  return S3Nf.loading;
}
function S3PostAuthor(a){
  let l=a.querySelector("a[href^='#/profil/']");
  return l?decodeURIComponent(l.getAttribute("href").slice(9).split(/[?#/]/)[0]):"";
}
async function S3AmbBadges(){
  if(!Mt||!S3NfLive())return;
  let set=await S3AmbUsers();if(!set.size)return;
  Mt.querySelectorAll("article.post:not([data-ambb])").forEach(a=>{
    a.dataset.ambb="1";
    let id=S3PostAuthor(a);if(!id||!set.has(id))return;
    let l=a.querySelector("a[href^='#/profil/']");
    l&&l.after(e("span.amb-badge",{title:"Ambassadeur Chasse & Pêche 360°"},b("crown"),"Ambassadeur"));
  });
}
async function S3AmbShareLog(authorId){
  try{if(!authorId||!S3NfLive())return;let set=await S3AmbUsers();if(set.has(authorId))S3Sb("POST","rpc/log_amb_share",{author:authorId})}catch{}
}
/* Statistiques dans « Mon espace ambassadeur » */
function S3AmbStatsBox(){
  let box=e("div.amb-stats",e("p.small.muted",{style:{margin:0}},"Chargement des statistiques…"));
  S3Sb("POST","rpc/amb_stats",{}).then(r=>{
    W(box);
    let s=r&&r.ok&&r.json;
    if(!s){box.append(e("p.small.muted",{style:{margin:0}},"Statistiques indisponibles pour le moment."));return}
    let tile=(n,l,sub)=>e("div.amb-stat",e("b",String(n)),e("span",l),sub?e("small",sub):null);
    box.append(
      tile(s.followers,"abonnés",s.followers30?"+"+s.followers30+" en 30 jours":null),
      tile(s.posts,"publications"),
      tile(s.shorts,"vidéos courtes"),
      tile(s.likes,"j’aime reçus"),
      tile(s.comments,"commentaires reçus"),
      tile(s.shares,"partages",s.shares30?s.shares30+" en 30 jours":null),
      tile(s.signups||0,"inscrits avec ton code",s.code?"code "+s.code:null));
  }).catch(()=>{W(box);box.append(e("p.small.muted",{style:{margin:0}},"Statistiques indisponibles pour le moment."))});
  return box;
}
