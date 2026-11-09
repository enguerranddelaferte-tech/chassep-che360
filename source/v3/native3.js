/* ----- Appli des stores (App Store, Google Play), construite avec Capacitor -----
   Même code que le site. Dans l’appli installée depuis un store :
   - elle se connecte à la vraie base (comme le site GitHub) ;
   - les abonnements ne sont pas vendus (règles Apple et Google : paiement intégré obligatoire,
     décision en attente) : la page Abonnement montre seulement l’offre du compte ;
   - les connexions Google / Facebook sont masquées (Google les bloque dans une appli) ;
   - les liens vers d’autres sites s’ouvrent dans le navigateur du téléphone. */
function S3Native(){try{return!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())}catch{return!1}}
function S3NativeOS(){try{return window.Capacitor.getPlatform()}catch{return"web"}}
function S3NativePlugin(n){try{return window.Capacitor.Plugins[n]||null}catch{return null}}
(function(){
  if(!S3Native())return;
  try{document.documentElement.classList.add("cap-native","cap-"+S3NativeOS())}catch{}
  /* liens externes : navigateur du téléphone (ou navigateur intégré) */
  document.addEventListener("click",ev=>{
    let a=ev.target&&ev.target.closest&&ev.target.closest("a[href]");if(!a)return;
    let h=a.getAttribute("href")||"";
    if(!/^https?:\/\//i.test(h)||h.indexOf(location.origin)===0)return;
    ev.preventDefault();ev.stopPropagation();
    let br=S3NativePlugin("Browser");
    try{br?br.open({url:h}):window.open(h,"_blank")}catch{location.href=h}
  },!0);
  /* barre d’état : le contenu commence sous la barre (Android) */
  try{let sbp=S3NativePlugin("StatusBar");sbp&&S3NativeOS()==="android"&&sbp.setOverlaysWebView&&sbp.setOverlaysWebView({overlay:!1})}catch{}
  /* bouton retour Android : page précédente, sinon on quitte */
  try{let app=S3NativePlugin("App");app&&app.addListener&&app.addListener("backButton",d=>{
    let m=document.querySelector(".modal-backdrop .modal-close,.modal .modal-close");if(m){m.click();return}
    d&&d.canGoBack||history.length>1?history.back():app.exitApp&&app.exitApp()})}catch{}
  /* écran de démarrage : caché dès que l’appli est affichée */
  let hide=()=>{try{let sp=S3NativePlugin("SplashScreen");sp&&sp.hide&&sp.hide()}catch{}};
  document.readyState==="complete"?setTimeout(hide,300):window.addEventListener("load",()=>setTimeout(hide,300));
})();
function S3NativeOffer(t){
  let u=w.user,id=u&&u.plan||"free",nm=(typeof Es<"u"&&Es[id]&&Es[id].name)||{free:"Gratuit",chasse:"Premium Chasse",peche:"Premium Pêche",combo:"Combo 360°"}[id]||"Gratuit";
  C(t,q({title:"Mon offre",subtitle:"Ce que comprend votre compte"},
    e("div.stack",{style:{maxWidth:"640px"}},
      k({title:"Votre offre"},e("div.row",{style:{gap:"10px",alignItems:"center"}},b("crown"),e("b",{style:{fontSize:"20px"}},u?nm:"Pas encore de compte"))),
      e("p",{style:{margin:0}},"La sécurité (SOS, viseur 30°, sortie, alertes), la communauté, la carte IGN, les recettes et l’annuaire sont gratuits pour tous."),
      e("p.small.muted",{style:{margin:0}},"Les abonnements ne sont pas encore proposés dans l’application mobile."))));
}

/* Page « Installer l’appli » (#/telecharger ou #/installer), ouverte à tous : le lien à envoyer.
   L’appli web (PWA) s’installe depuis le navigateur, sur Android, iPhone et ordinateur. */
function S3DownloadPage(t){
  let ios=typeof S3IsIOS=="function"?S3IsIOS():/iPhone|iPad|iPod/i.test(navigator.userAgent),android=/Android/i.test(navigator.userAgent),done=typeof S3Standalone=="function"&&S3Standalone();
  let step=(n,txt)=>e("div.row",{style:{gap:"12px",alignItems:"flex-start"}},e("b",{style:{minWidth:"22px",color:"var(--accent)"}},n),e("span",txt));
  let andr=k({title:"Android"},e("div.stack",{style:{gap:"8px"}},
    step("1","Ouvrez ce lien dans Chrome."),step("2","Touchez « Installer l’appli » ci-dessus, ou le menu ⋮ puis « Installer l’application »."),step("3","L’icône Chasse & Pêche 360° apparaît avec vos applications.")));
  let iph=k({title:"iPhone"},e("div.stack",{style:{gap:"8px"}},
    step("1","Ouvrez ce lien dans Safari."),step("2","Touchez Partager (le carré avec une flèche), puis « Sur l’écran d’accueil »."),step("3","Touchez « Ajouter » : l’appli s’ouvre ensuite depuis son icône, en plein écran.")));
  let pc=k({title:"Ordinateur"},e("p",{style:{margin:0}},"Dans Chrome ou Edge, touchez « Installer l’appli » ci-dessus, ou l’icône d’installation dans la barre d’adresse."));
  C(t,q({title:"Installer l’appli",subtitle:"Chasse & Pêche 360° sur votre téléphone, sans passer par un store"},
    e("div.stack",{style:{maxWidth:"640px"}},
      done?e("div.panel",e("b","L’appli est déjà installée sur cet appareil.")):e("div.stack",{style:{gap:"10px"}},
        x("Installer l’appli",{kind:"primary",icon:"download",onClick:()=>{typeof S3Install=="function"?S3Install():null}}),
        e("p.small.muted",{style:{margin:0}},"Gratuite, quelques secondes, rien à télécharger depuis un store. Elle se met à jour toute seule.")),
      ios?iph:android?andr:pc,ios?andr:iph,ios||android?pc:andr,
      x("Ouvrir l’appli sans l’installer",{kind:"ghost",href:"#/communaute"}))));
}
