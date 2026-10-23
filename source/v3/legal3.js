/* ----- Mentions légales (3.0) et suppression du compte ----- */
/* Les champs « à compléter » seront remplis dès réception du nom de la structure et du SIRET. */
const S3Legal={
  maj:"23 octobre 2026",
  editeur:"[Nom de la structure — en cours d’immatriculation]",
  forme:"[Forme juridique — à compléter]",
  siege:"[Adresse du siège — à compléter]",
  siret:"[SIRET — en cours d’attribution]",
  directeur:"[Nom du directeur ou de la directrice de la publication — à compléter]",
  contact:"[Adresse e-mail de contact — à compléter]"
};
function S3LegalPage(t){
  let todo=v2=>/^\[/.test(v2)?e("span.legal-todo",v2):v2;
  let sec=(title,...kids)=>e("section.legal-sec",e("h2",title),...kids);
  let dl=rows=>e("dl.legal-dl",rows.flatMap(([a,b2])=>[e("dt",a),e("dd",todo(b2))]));
  C(t,q({title:"Mentions légales",subtitle:"Dernière mise à jour : "+S3Legal.maj},
    e("div.legal",
      e("p.legal-note","Certaines informations sur l’éditeur sont en cours d’attribution et seront ajoutées dès que possible."),
      sec("Éditeur de l’application",
        e("p","L’application Chasse & Pêche 360°, accessible à l’adresse enguerranddelaferte-tech.github.io/chassep-che360, est éditée par :"),
        dl([["Structure",S3Legal.editeur],["Forme juridique",S3Legal.forme],["Siège",S3Legal.siege],["SIRET",S3Legal.siret],["Directeur de la publication",S3Legal.directeur],["Contact",S3Legal.contact]])),
      sec("Hébergement",
        e("p",e("b","Application : "),"GitHub, Inc. (service GitHub Pages), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis."),
        e("p",e("b","Données et comptes : "),"Supabase Pte. Ltd., 65 Chulia Street #38-02/03, OCBC Centre, Singapour 049513. Les données sont stockées en France, dans la région Paris (eu-west-3) d’Amazon Web Services.")),
      sec("Propriété intellectuelle",
        e("p","Le nom Chasse & Pêche 360°, le logo, les textes, la mise en page et le code de l’application sont protégés. Toute reproduction ou réutilisation sans autorisation écrite de l’éditeur est interdite."),
        e("p","Les photos, vidéos et textes publiés par les membres restent leur propriété. En les publiant, chaque membre autorise leur affichage dans l’application, et garantit en détenir les droits.")),
      sec("Contenus des membres et signalements",
        e("p","Les membres sont responsables de ce qu’ils publient. Tout contenu illicite ou contraire à la charte de la communauté peut être signalé avec le bouton « Signaler » présent sur chaque publication. L’équipe examine les signalements et retire les contenus concernés."),
        e("p","Pour toute autre demande (autorités, ayants droit), écrivez à l’adresse de contact indiquée ci-dessus.")),
      sec("Informations de réglementation",
        e("p","Les dates d’ouverture, quotas, angles de tir et autres règles affichés dans l’application sont donnés à titre indicatif. Seuls les arrêtés préfectoraux, les règlements des fédérations et les textes officiels font foi. Vérifiez-les avant chaque sortie.")),
      sec("Données personnelles",
        e("p","L’application traite les données nécessaires à son fonctionnement : compte, publications, messages et, si vous l’activez, votre position pendant une sortie. Elles ne sont ni vendues ni cédées."),
        e("p","Vous pouvez à tout moment consulter et modifier vos informations depuis votre profil, et supprimer votre compte et vos contenus depuis Mon profil › Supprimer mon compte. Vous pouvez aussi adresser une réclamation à la CNIL (cnil.fr)."),
        e("p","Le détail des traitements figurera dans la politique de confidentialité.")),
      sec("Droit applicable",
        e("p","Les présentes mentions sont régies par le droit français.")))));
}
/* Bloc « Mon compte » ajouté en bas de Mon profil */
function S3AcctBox(){
  if(!w.user||!Mt)return;
  let pg=Mt.querySelector(".page");if(!pg||pg.querySelector(".acct-zone"))return;
  pg.append(e("section.card.acct-zone",
    e("h3",{style:{margin:"0 0 6px"}},"Mon compte"),
    e("p.small.muted",{style:{margin:"0 0 12px"}},"La suppression efface votre profil, vos publications, commentaires, messages, photos, vidéos, sorties et territoires. Elle est définitive."),
    e("div.row.wrap",{style:{gap:"8px"}},
      x("Supprimer mon compte",{kind:"danger",icon:"trash",onClick:S3AcctDelete}),
      x("Aide",{kind:"ghost",href:"#/aide"})),
    e("label.check",{style:{marginTop:"14px"}},e("input",{type:"checkbox",checked:(()=>{try{return localStorage.getItem("cp360.noTrack")!=="1"}catch{return true}})(),onchange:ev=>{try{ev.target.checked?localStorage.removeItem("cp360.noTrack"):localStorage.setItem("cp360.noTrack","1")}catch{}A(ev.target.checked?"Mesure d’audience activée.":"Mesure d’audience désactivée sur cet appareil.")}}),
      e("span","Mesure d’audience",e("div.hint.muted.small","Compte les ouvertures de l’appli (pays, type d’appareil), sans publicité ni traceur tiers. Décochez pour la refuser sur cet appareil."))),
    e("p.tiny.muted",{style:{margin:"12px 0 0"}},e("a",{href:"#/cgu"},"Conditions d’utilisation")," · ",e("a",{href:"#/confidentialite"},"Confidentialité")," · ",e("a",{href:"#/mentions-legales"},"Mentions légales"))));
}
function S3AcctDelete(){
  let live=window.cp360Sb&&window.cp360Sb.on&&window.cp360Sb.on();
  let inp=e("input.input",{type:"text",autocomplete:"off",autocapitalize:"characters","aria-label":"Tapez SUPPRIMER pour confirmer",placeholder:"SUPPRIMER"});
  let msg=e("p.small",{role:"status",style:{margin:0,minHeight:"1.4em"}}),dlg,busy=false;
  let go=x("Supprimer définitivement",{kind:"danger",onClick:async()=>{
    if(busy)return;
    if(inp.value.trim().toUpperCase()!=="SUPPRIMER"){msg.textContent="Tapez SUPPRIMER pour confirmer.";inp.focus();return}
    if(live&&!navigator.onLine){msg.textContent="Vous êtes hors ligne. Reconnectez-vous à Internet puis réessayez.";return}
    busy=true;go.disabled=!0;msg.textContent="Suppression en cours…";
    try{
      if(live){
        let tok=await window.cp360Sb.bearer();
        if(!tok)throw new Error("Session expirée : reconnectez-vous puis réessayez.");
        let r=await fetch(window.cp360Sb.URL+"/functions/v1/delete-account",{method:"POST",headers:{apikey:window.cp360Sb.KEY,Authorization:"Bearer "+tok,"Content-Type":"application/json"},body:JSON.stringify({confirm:"SUPPRIMER"})});
        let j={};try{j=await r.json()}catch{}
        if(!r.ok||!j.ok)throw new Error(j.error||"Suppression impossible pour le moment. Réessayez plus tard.");
      }
      try{Object.keys(localStorage).filter(k2=>/^cp360/.test(k2)&&k2!=="cp360.theme").forEach(k2=>localStorage.removeItem(k2))}catch{}
      try{sessionStorage.clear()}catch{}
      dlg.close();
      Oi();
      setTimeout(()=>{try{S3Login.open&&S3Login.open.close()}catch{}location.hash="#/communaute"},60);
      A(live?"Votre compte et vos contenus ont été supprimés.":"Compte de démonstration supprimé de cet appareil.","ok",{timeout:8000});
    }catch(er){busy=false;go.disabled=!1;msg.textContent=er.message}
  }});
  dlg=Le({title:"Supprimer mon compte ?",body:e("div.stack",
    e("p",{style:{margin:0}},"Tout ce que vous avez créé sera effacé : profil, publications, commentaires, messages, photos, vidéos, sorties, territoires, spots et carnet. Vous serez retiré des groupes et conversations partagés."),
    w.user&&w.user.plan&&w.user.plan!=="free"?e("p.small",{style:{margin:0}},"Votre abonnement s’arrête avec le compte."):null,
    e("div.field",e("label","Tapez SUPPRIMER pour confirmer"),inp),msg),
    actions:[x("Annuler",{kind:"ghost",onClick:()=>dlg.close()}),go]});
}
