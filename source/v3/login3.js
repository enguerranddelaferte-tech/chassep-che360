/* ----- Connexion en fenêtre (3.0) : feuille du bas sur téléphone, fenêtre centrée sur ordinateur, fond flouté ----- */
/* La page /connexion reste disponible pour les liens directs (e-mails, favoris). */
var S3Login={open:null,providers:null};
function S3LoginIcon(p){
  if(p==="google")return e("span",{"aria-hidden":"true",style:{display:"inline-flex",marginRight:"8px"},html:'<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>'});
  return e("span",{"aria-hidden":"true",style:{display:"inline-flex",marginRight:"8px"},html:'<svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M13.4 19.5v-6h2l.3-2.4h-2.3V9.6c0-.7.2-1.2 1.2-1.2h1.2V6.3c-.2 0-1-.1-1.8-.1-1.8 0-3 1.1-3 3.1v1.8H9v2.4h2v6h2.4z"/></svg>'});
}
async function S3LoginProviders(){
  if(S3Login.providers)return S3Login.providers;
  try{
    let r=await fetch(window.cp360Sb.URL+"/auth/v1/settings",{headers:{apikey:window.cp360Sb.KEY}});
    let j=await r.json();S3Login.providers=(j&&j.external)||{};
  }catch{S3Login.providers={}}
  return S3Login.providers;
}
async function S3LoginSocial(p){
  let live=window.cp360Sb&&window.cp360Sb.on&&window.cp360Sb.on();
  if(!live){
    let mail=prompt((p==="google"?"Compte Google":"Compte Facebook")+" — adresse e-mail (démonstration) :","");
    if(!mail)return;
    try{let back=location.hash,m=await v.post("/auth/social",{provider:p,email:mail,name:mail.split("@")[0]});S3Login.open&&S3Login.open.close();await Vn(m.token,m.user);S3LoginBack(back)}catch(m){A(m.message,"err")}
    return;
  }
  let pv=await S3LoginProviders();
  if(!pv[p]){A((p==="google"?"La connexion Google":"La connexion Facebook")+" n’est pas encore activée. Utilisez votre adresse e-mail pour l’instant.","warn");return}
  try{sessionStorage.setItem("cp360.oauthBack",location.hash||"#/communaute")}catch{}
  let to=location.origin+location.pathname;
  location.href=window.cp360Sb.URL+"/auth/v1/authorize?provider="+p+"&redirect_to="+encodeURIComponent(to);
}
function S3LoginBack(back){
  if(back&&!/^#\/connexion/.test(back))setTimeout(()=>{location.hash=back},60);
}
/* Retour de Google / Facebook : les jetons ont été mis de côté au chargement (voir le tout début du script) */
async function S3OAuthFinish(){
  let raw=null,err=null;
  try{raw=sessionStorage.getItem("cp360.oauth");err=sessionStorage.getItem("cp360.oautherr");sessionStorage.removeItem("cp360.oauth");sessionStorage.removeItem("cp360.oautherr")}catch{}
  if(err){let q=new URLSearchParams(err);A("Connexion impossible : "+(q.get("error_description")||"refusée")+".","err");return}
  if(!raw||!window.cp360Sb||!window.cp360Sb.authFinish)return;
  let q=new URLSearchParams(raw),tok=q.get("access_token");
  if(!tok)return;
  A("Connexion en cours…","info");
  try{
    let r=await fetch(window.cp360Sb.URL+"/auth/v1/user",{headers:{apikey:window.cp360Sb.KEY,Authorization:"Bearer "+tok}});
    let u=await r.json();
    if(!r.ok||!u||!u.id)throw new Error("Session refusée.");
    let g=await window.cp360Sb.authFinish({access_token:tok,refresh_token:q.get("refresh_token"),expires_at:+q.get("expires_at")||0,expires_in:+q.get("expires_in")||3600,user:{id:u.id,email:u.email}},"signup");
    let back=null;try{back=sessionStorage.getItem("cp360.oauthBack");sessionStorage.removeItem("cp360.oauthBack")}catch{}
    await Vn(g.token,g.user);S3LoginBack(back);
    A("Bienvenue "+String((g.user&&g.user.name)||"").split(" ")[0]+" !","ok");
  }catch(m){A((m&&m.message)||"Connexion impossible.","err")}
}
function S3LoginOpen(tab){
  if(w.user)return false;
  if(/^#\/connexion/.test(location.hash||""))return false;
  if(S3Login.open)return true;
  let back=location.hash,mode=tab==="register"?"register":"login",live=window.cp360Sb&&window.cp360Sb.on&&window.cp360Sb.on();
  let body=e("div.stack.login-body"),dlg;
  let draw=()=>{
    W(body);
    let d=jt(mode==="login"?[{name:"email",label:"Adresse e-mail",type:"email",required:!0,full:!0,autocomplete:"email"},{name:"password",label:"Mot de passe",type:"password",required:!0,full:!0,autocomplete:"current-password"}]:[{name:"name",label:"Prénom et nom",required:!0,full:!0},{name:"email",label:"Adresse e-mail",type:"email",required:!0,full:!0,autocomplete:"email"},{name:"password",label:"Mot de passe",type:"password",required:!0,full:!0,hint:"6 caractères minimum",autocomplete:"new-password"},{name:"profile",label:"Je suis plutôt…",type:"seg",full:!0,value:"mixte",options:[["chasseur","Chasseur"],["pecheur","Pêcheur"],["mixte","Les deux"],["usager","Promeneur"]]},{name:"invite",label:"Code d’invitation ou d’ambassadeur (facultatif)",full:!0,value:S3LInviteCode(),placeholder:"Ex. : PA1B2C3D"}]);
    let err=e("div.panel.danger",{hidden:!0,style:{padding:"10px 14px"}}),btn=x(mode==="login"?"Se connecter":"Créer mon compte",{kind:"primary",size:"block",type:"submit"});
    let form=e("form.stack",{novalidate:!0,onsubmit:async f=>{
      f.preventDefault();err.hidden=!0;if(!d.validate())return;if(mode!=="login"&&!S3ConsentOk(form))return;btn.disabled=!0;
      try{
        let g=await(live?window.cp360Sb.auth(mode,d.values):v.post(mode==="login"?"/auth/login":"/auth/register",d.values));
        dlg&&dlg.close();S3Login.open=null;await Vn(g.token,g.user);S3LoginBack(back);
      }catch(g){d.setErrors&&d.setErrors(g.fields);err.textContent=g.message;err.hidden=!1}
      finally{btn.disabled=!1}
    }},err,d.el,mode==="login"?null:S3ConsentEl(),btn);
    C(body,
      ke([["login","Se connecter"],["register","Créer un compte"]],mode,m2=>{mode=m2;draw();try{dlg.el.querySelector(".modal-head h2").textContent=mode==="login"?"Bon retour !":"Créer votre compte"}catch{}}),
      form,
      e("div.row",{style:{margin:"2px 0",color:"var(--muted)"}},e("hr.sep.grow"),e("span.small","ou"),e("hr.sep.grow")),
      e("div.grid.g-2.login-social",
        x("",{kind:"ghost",size:"block",onClick:()=>S3LoginSocial("google")}),
        x("",{kind:"ghost",size:"block",onClick:()=>S3LoginSocial("facebook")})),
      mode==="login"?null:e("p.tiny.muted",{style:{margin:"-4px 0 0",textAlign:"center"}},"Avec Google ou Facebook, vous acceptez aussi les conditions d’utilisation et confirmez avoir au moins 15 ans."),
      x("Continuer sans compte",{kind:"ghost",size:"block",onClick:()=>{dlg&&dlg.close()}}),
      e("p.tiny.muted",{style:{margin:0,textAlign:"center"}},e("a",{href:"#/connexion",onclick:()=>{dlg&&dlg.close()}},"Ouvrir la page de connexion complète")," · ",e("a",{href:"#/mentions-legales",onclick:()=>{dlg&&dlg.close()}},"Mentions légales"))
    );
    let sb=body.querySelectorAll(".login-social .btn");
    if(sb[0]){sb[0].textContent="";sb[0].append(S3LoginIcon("google"),e("span",mode==="login"?"Continuer avec Google":"S’inscrire avec Google"))}
    if(sb[1]){sb[1].textContent="";sb[1].append(S3LoginIcon("facebook"),e("span",mode==="login"?"Continuer avec Facebook":"S’inscrire avec Facebook"))}
  };
  draw();
  dlg=Le({title:mode==="login"?"Bon retour !":"Créer votre compte",body,onClose:()=>{S3Login.open=null}});
  S3Login.open=dlg;
  try{dlg.el.classList.add("login-modal");dlg.el.parentElement.classList.add("login-back")}catch{}
  if(live)S3LoginProviders();
  return true;
}
/* Les liens « Se connecter » ouvrent la fenêtre au lieu de quitter la page */
document.addEventListener("click",ev=>{
  let a=ev.target&&ev.target.closest&&ev.target.closest('a[href="#/connexion"],a[href="#/inscription"]');
  if(!a||a.closest(".login-modal"))return;
  if(S3LoginOpen(/inscription/.test(a.getAttribute("href"))?"register":"login")){ev.preventDefault();ev.stopPropagation()}
},true);
