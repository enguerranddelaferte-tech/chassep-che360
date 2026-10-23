/* ----- Pages d’information (3.0) : CGU et conditions de vente, confidentialité, aide, charte ambassadeur ----- */
/* Format des sections : [titre, bloc, bloc…] ; un bloc est un texte (paragraphe) ou un tableau de textes (liste). */
function S3DocPage(t,title,sub,secs,note){
  let todo=s=>{let parts=String(s).split(/(\[[^\]]+\])/g);return parts.map(p=>/^\[/.test(p)?e("span.legal-todo",p):p)};
  let blk=b2=>Array.isArray(b2)?e("ul.legal-ul",b2.map(li=>e("li",...todo(li)))):e("p",...todo(b2));
  C(t,q({title,subtitle:sub},
    e("div.legal",
      note?e("p.legal-note",note):null,
      secs.map(([h,...bs])=>e("section.legal-sec",{id:"s-"+S3AmbSlug(h)},e("h2",h),...bs.map(blk))),
      e("p.small.muted",{style:{margin:0}},
        e("a",{href:"#/mentions-legales"},"Mentions légales")," · ",e("a",{href:"#/cgu"},"Conditions d’utilisation")," · ",
        e("a",{href:"#/confidentialite"},"Confidentialité")," · ",e("a",{href:"#/aide"},"Aide")))));
}
const S3CguMaj="23 octobre 2026";
function S3CguPage(t){
  S3DocPage(t,"Conditions d’utilisation et de vente","Version du "+S3CguMaj,[
    ["1. Objet",
     "Les présentes conditions encadrent l’utilisation de l’application Chasse & Pêche 360° (ci-après « l’appli »), éditée par [nom de la structure] (voir les mentions légales), et la souscription de ses abonnements. Créer un compte vaut acceptation de ces conditions."],
    ["2. Accès et compte",
     ["L’appli est accessible gratuitement. Certaines fonctions sont réservées aux abonnés (offres Premium, Combo et Territoire).",
      "Il faut avoir au moins 15 ans pour créer un compte. Un mineur doit avoir l’accord d’un parent pour souscrire un abonnement payant.",
      "Vous êtes responsable de la confidentialité de votre mot de passe et des actions faites depuis votre compte.",
      "Un compte est personnel : une personne, un compte."]],
    ["3. Règles de la communauté",
     ["Respect entre chasseurs, pêcheurs, promeneurs et autres usagers de la nature.",
      "Pas de photo choquante ni d’animal blessé exhibé.",
      "Ne publiez jamais la position exacte d’un spot ou d’un poste sans l’avoir floutée.",
      "Sont interdits : les contenus illicites, le braconnage ou l’incitation à enfreindre la réglementation, les injures, le harcèlement, la publicité non autorisée, l’usurpation d’identité.",
      "Chaque contenu peut être signalé avec le bouton « Signaler ». L’équipe peut retirer un contenu, et suspendre ou fermer un compte en cas de manquement grave ou répété, après avoir indiqué le motif."]],
    ["4. Sécurité : ce que l’appli fait et ne fait pas",
     ["Le bouton SOS prévient les personnes autour de vous ; il ne remplace pas un appel au 112, à faire dans tous les cas d’urgence.",
      "Le calculateur et le viseur 30° sont une aide : ils ne remplacent ni la vigilance du tireur, ni les consignes du directeur de chasse.",
      "Les informations de réglementation, de météo et de niveaux d’eau sont indicatives. Seuls les textes officiels et les arrêtés préfectoraux font foi.",
      "Le suivi en direct dépend du réseau mobile et de la batterie : il peut s’interrompre sans prévenir."]],
    ["5. Vos contenus",
     "Vous restez propriétaire des photos, vidéos et textes que vous publiez. Vous autorisez l’éditeur à les afficher dans l’appli, pour la durée de leur publication, et garantissez en détenir les droits. Vous pouvez les supprimer à tout moment ; ils disparaissent aussi si vous supprimez votre compte."],
    ["6. Abonnements",
     ["Les prix sont affichés toutes taxes comprises sur la page « Offres & abonnement ».",
      "Les abonnements mensuels ou annuels se renouvellent automatiquement à la fin de chaque période. Pour un abonnement annuel, vous êtes prévenu par e-mail avant l’échéance.",
      "Vous pouvez résilier à tout moment depuis l’appli, en quelques clics. La résiliation prend effet à la fin de la période déjà payée.",
      "Le paiement en ligne n’est pas encore ouvert : aucune somme n’est prélevée tant qu’il ne l’est pas. Ces conditions de paiement s’appliqueront à son ouverture."]],
    ["7. Droit de rétractation",
     "Vous disposez de 14 jours après la souscription pour vous rétracter, sans avoir à donner de motif, en écrivant à l’adresse de contact. Si vous avez demandé à profiter de l’abonnement tout de suite, le remboursement est calculé au prorata des jours restants."],
    ["8. Offres de lancement",
     ["Pionniers : les 30 premiers comptes créés reçoivent 1 an de Combo 360° offert, un badge à vie et 3 codes d’invitation. À la fin de l’année offerte, le Combo repasse en offre gratuite, sauf souscription ; les Pionniers gardent alors −50 % sur leur abonnement, tant qu’il n’est pas interrompu.",
      "Fondateurs : les 500 premiers inscrits, et les personnes inscrites avec un code d’invitation ou d’ambassadeur, bénéficient des tarifs de lancement sur leur première année d’abonnement.",
      "Les places sont attribuées automatiquement, dans l’ordre de création des comptes. Un même bénéficiaire ne peut cumuler plusieurs comptes pour obtenir plusieurs avantages."]],
    ["9. Ambassadeurs",
     "Le statut d’ambassadeur est attribué par l’équipe. Il donne accès à l’espace ambassadeur et au Combo 360° offert tant que le statut est maintenu, selon la charte ambassadeur. Il peut être retiré à tout moment ; les avantages liés s’arrêtent alors."],
    ["10. Responsabilité et disponibilité",
     "L’éditeur fait de son mieux pour que l’appli fonctionne en continu, sans pouvoir le garantir (maintenance, panne réseau, service tiers). Il n’est pas responsable des contenus publiés par les membres, ni des décisions prises sur le terrain à partir des informations affichées."],
    ["11. Données personnelles",
     "Le traitement de vos données est décrit dans la politique de confidentialité. Vous pouvez supprimer votre compte à tout moment depuis Mon profil."],
    ["12. Réclamations et médiation",
     "Pour toute réclamation, écrivez à [adresse e-mail de contact]. Si aucune solution n’est trouvée, vous pouvez recourir gratuitement au médiateur de la consommation : [nom et site du médiateur — à désigner]."],
    ["13. Modification et droit applicable",
     "Ces conditions peuvent évoluer ; vous serez informé de toute modification importante avant son entrée en vigueur. Elles sont soumises au droit français."]
  ],"Certaines informations sur l’éditeur et le médiateur seront ajoutées dès leur réception.");
}
function S3PrivPage(t){
  S3DocPage(t,"Politique de confidentialité","Version du "+S3CguMaj,[
    ["Qui est responsable",
     "Le responsable du traitement est [nom de la structure], éditeur de Chasse & Pêche 360°. Contact pour toute question sur vos données : [adresse e-mail de contact]."],
    ["Ce que nous collectons",
     ["Compte : nom, adresse e-mail, mot de passe (stocké chiffré, nous ne le voyons jamais), mode de connexion (e-mail, Google ou Facebook).",
      "Profil : profil chasseur ou pêcheur, ville, département, présentation, photo, et les numéros de permis ou de carte de pêche si vous choisissez de les saisir.",
      "Contenus : publications, commentaires, messages, vidéos, recettes, articles, signalements.",
      "Terrain : territoires, postes, spots, prises, prélèvements, historique de sorties.",
      "Position : seulement si vous l’activez, pendant une sortie, un suivi en direct ou une alerte SOS.",
      "Notifications : l’adresse technique de votre appareil, si vous acceptez les notifications.",
      "Analyse des photos : les photos publiées dans le fil sont analysées par notre service de modération (modèle de reconnaissance d’images YOLOv8), hébergé sur un serveur séparé. Il repère par exemple une espèce protégée probable ; la publication est alors vérifiée par l’équipe. La photo n’est pas conservée par ce service : seuls les éléments repérés sont enregistrés avec la publication.",
      "Mesure d’audience : à l’ouverture de l’appli, le pays, le type d’appareil, la page et un identifiant de session effacé à la fermeture de l’onglet. Vous pouvez la refuser depuis Mon profil."]],
    ["Pourquoi et sur quelle base",
     ["Fournir le service, gérer le compte et les abonnements : exécution du contrat.",
      "Partager votre position pendant une sortie ou un SOS, envoyer des notifications : votre consentement, que vous pouvez retirer à tout moment dans l’appli ou les réglages du téléphone.",
      "Sécurité, modération, prévention des abus, mesure d’audience : intérêt légitime de l’éditeur."]],
    ["Qui y a accès",
     ["Les autres membres, selon ce que vous publiez et les réglages de visibilité (public, amis, groupe, participants d’une chasse).",
      "L’équipe 360°, pour l’assistance et la modération.",
      "Nos prestataires techniques : Supabase (base de données et comptes, données stockées à Paris), GitHub (diffusion de l’appli), [hébergeur du serveur de modération — à compléter], Google ou Meta si vous vous connectez avec eux, et le service de notifications de votre téléphone (Apple, Google ou Mozilla).",
      "Vos données ne sont ni vendues, ni louées, ni utilisées pour de la publicité ciblée."]],
    ["Combien de temps",
     ["Compte et contenus : tant que le compte existe. Ils sont effacés quand vous le supprimez.",
      "Journal de mesure d’audience : 13 mois au plus.",
      "Rapports d’erreurs techniques : 90 jours au plus.",
      "Données de facturation, à l’ouverture du paiement : 10 ans, comme l’exige la loi."]],
    ["Stockage sur votre appareil",
     "L’appli enregistre sur votre appareil vos préférences (thème, saison, page d’ouverture), votre session de connexion et les saisies faites hors ligne. Aucun cookie publicitaire ni traceur tiers n’est utilisé."],
    ["Vos droits",
     ["Accès, rectification, effacement, opposition, limitation et portabilité de vos données.",
      "Effacement immédiat : Mon profil › Supprimer mon compte.",
      "Pour les autres demandes, écrivez à [adresse e-mail de contact] ; réponse sous un mois.",
      "Vous pouvez adresser une réclamation à la CNIL (cnil.fr)."]],
    ["Mineurs",
     "L’appli est réservée aux personnes d’au moins 15 ans."],
    ["Sécurité",
     "Les échanges sont chiffrés (HTTPS), l’accès aux données est limité par des règles qui vérifient qui demande quoi, et les mots de passe ne sont jamais stockés en clair."]
  ],"Certaines informations sur l’éditeur seront ajoutées dès leur réception.");
}
function S3HelpPage(t){
  S3DocPage(t,"Aide","Les réponses aux questions les plus fréquentes",[
    ["Installer l’appli sur mon téléphone",
     ["iPhone : ouvrez le site dans Safari, touchez le bouton Partager puis « Sur l’écran d’accueil ».",
      "Android : dans Chrome, touchez le menu ⋮ puis « Installer l’application », ou le bouton « Installer » de l’appli.",
      "Ordinateur : bouton « Installer l’appli » en haut de l’écran (Chrome, Edge)."]],
    ["Recevoir les notifications",
     "Acceptez les notifications quand l’appli le propose, ou dans Notifications et alertes. Sur iPhone, elles ne fonctionnent qu’avec l’appli installée sur l’écran d’accueil (iOS 16.4 ou plus récent)."],
    ["Passer du mode chasse au mode pêche",
     "Utilisez le bouton Chasse / Pêche en haut du menu. Les menus, la carte et les couleurs s’adaptent à la saison choisie."],
    ["Créer mon territoire",
     "Menu Chasse › Territoires & postes, puis « Nouveau territoire » : dessinez le contour sur la carte, ajoutez vos postes et zones interdites. Vous pouvez aussi importer un plan ou une photo du territoire."],
    ["Le calculateur et le viseur 30°",
     "Depuis votre poste, ils montrent l’angle de 30° à respecter avec vos voisins de ligne. C’est une aide visuelle : les consignes du directeur de chasse priment toujours."],
    ["Le bouton SOS",
     "Il envoie votre position aux participants de la chasse, aux responsables du territoire et aux pratiquants à moins de 5 km. Appelez aussi le 112 : l’appli ne prévient pas les secours."],
    ["Utiliser l’appli sans réseau",
     "Vos publications et saisies faites hors ligne sont gardées sur le téléphone et envoyées dès le retour du réseau. Une pastille indique ce qui attend."],
    ["Pionniers, Fondateurs et codes",
     "Les 30 premiers inscrits sont Pionniers (1 an de Combo offert et 3 invitations), les 500 premiers Fondateurs (tarifs de lancement). Un code d’invitation ou d’ambassadeur se saisit à l’inscription et donne le tarif Fondateurs."],
    ["Supprimer mon compte",
     "Mon profil › Supprimer mon compte. Tout ce que vous avez créé est effacé, définitivement."],
    ["Nous écrire",
     "Une question, un bug, une idée : [adresse e-mail de contact]. Pour un contenu choquant, utilisez plutôt le bouton « Signaler » sous la publication."]
  ]);
}
function S3CharterPage(t){
  S3DocPage(t,"Charte ambassadeur","Version du "+S3CguMaj,[
    ["Le rôle d’un ambassadeur",
     "Un ambassadeur fait vivre la communauté Chasse & Pêche 360° : il publie ses sorties, partage son savoir-faire et donne envie de pratiquer la chasse et la pêche de façon sûre et respectueuse."],
    ["Ce que l’appli vous offre",
     ["Le Combo 360° offert, tant que vous êtes ambassadeur.",
      "Votre fiche publique, votre espace ambassadeur et vos statistiques.",
      "Un code personnel : les personnes inscrites avec lui ont le tarif Fondateurs, et vous voyez combien se sont inscrites."]],
    ["Vos engagements",
     ["Publier régulièrement dans l’appli (au moins une publication par mois en saison).",
      "Respecter la réglementation, les règles de sécurité et l’éthique de la chasse et de la pêche dans tout ce que vous montrez.",
      "Ne jamais montrer d’acte de braconnage, de tir dangereux ou d’animal blessé exhibé.",
      "Respecter les autres membres et les règles de la communauté (conditions d’utilisation)."]],
    ["Transparence (loi du 9 juin 2023 sur l’influence commerciale)",
     ["Quand vous parlez de l’appli sur vos réseaux, indiquez clairement « Collaboration commerciale » ou « Partenariat commercial », pendant toute la durée de la publication : le Combo offert est un avantage en nature.",
      "Si une image est retouchée ou créée par une intelligence artificielle, indiquez « Image retouchée » ou « Image virtuelle ».",
      "Depuis le 1er janvier 2026, un contrat écrit est obligatoire dès que la rémunération ou les avantages atteignent 1 000 € HT sur l’année. En dessous, cette charte fait foi."]],
    ["Fin du statut",
     "Vous pouvez arrêter quand vous le souhaitez, et l’équipe peut retirer le statut si la charte n’est pas respectée. Le Combo offert s’arrête alors et vous revenez à votre offre précédente. Votre fiche publique peut être retirée à votre demande."]
  ]);
}
/* Case à cocher obligatoire à l’inscription (CGU, confidentialité, 15 ans) */
function S3ConsentEl(){
  return e("label.check.consent-cb",{style:{alignItems:"flex-start"}},e("input",{type:"checkbox",name:"consent"}),
    e("span.small","J’ai au moins 15 ans et j’accepte les ",e("a",{href:"#/cgu",target:"_blank"},"conditions d’utilisation")," et la ",e("a",{href:"#/confidentialite",target:"_blank"},"politique de confidentialité"),"."));
}
function S3ConsentOk(root){
  let i=root&&root.querySelector(".consent-cb input");
  if(!i||i.checked)return true;
  A("Cochez la case pour accepter les conditions d’utilisation.","warn");
  try{i.focus();i.closest("label").classList.add("consent-err")}catch{}
  return false;
}
/* Avertissement en haut des pages de réglementation */
function S3RegNote(p){
  if(!/^\/reglementation/.test(p)||!Mt)return;
  let pg=Mt.querySelector(".page");if(!pg||pg.querySelector(".reg-note"))return;
  let n=e("p.legal-note.reg-note",{style:{margin:"0 0 14px"}},"Informations indicatives, mises à jour par l’équipe. Seuls les arrêtés préfectoraux, les règlements des fédérations et les textes officiels font foi : vérifiez-les avant chaque sortie.");
  let h=pg.querySelector(".page-head");h?h.after(n):pg.prepend(n);
}
