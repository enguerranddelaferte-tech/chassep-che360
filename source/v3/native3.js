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
