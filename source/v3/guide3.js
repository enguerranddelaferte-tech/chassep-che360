/* ----- Guide des fonctions (3.0) : page #/guide, ouverte à tous, avec ou sans compte -----
   Une fiche par fonction : à quoi ça sert, comment faire, un exemple, un conseil, l’offre et un lien.
   NOUVELLE FONCTION = NOUVELLE FICHE : ajouter un objet dans S3GUIDE avec « added » (date de sortie)
   et « feat » (id de S3FEAT) si la fonction peut être mise en « Plus tard » : la fiche n’apparaît
   alors que lorsque la fonction est lancée. Les fiches des fonctions sorties après le lancement portent « Nouveau » pendant 45 jours. */
const S3GUIDE_SECS=[
  ["demarrer","Premiers pas"],["communaute","Communauté"],["securite","Sécurité"],["terrain","Carte & météo"],
  ["chasse","Chasse"],["peche","Pêche"],["cuisine","Cuisine & pros"],["compte","Compte & offres"]];
const S3GUIDE=[
  /* Premiers pas */
  {id:"compte",sec:"demarrer",t:"Créer son compte",plan:"Gratuit",added:"2026-11-02",
   what:"Le fil d’actualité se consulte sans compte. Le compte sert à publier, commenter, écrire à vos amis et garder vos sorties, prises et prélèvements.",
   steps:["Touchez « Se connecter », puis « Créer un compte ».","Indiquez votre prénom, votre e-mail et un mot de passe, et choisissez votre pratique : chasse, pêche ou les deux.","Si quelqu’un vous a donné un code (invitation ou ambassadeur), saisissez-le à ce moment-là.","Ouvrez le lien reçu par e-mail : votre compte est confirmé et vous êtes connecté."],
   ex:"Paul a reçu le code d’un ambassadeur. Il le saisit à l’inscription : il obtient le tarif Fondateurs pour son abonnement.",
   tip:"Pas d’e-mail reçu ? Regardez dans les courriers indésirables.",link:["/connexion","Créer mon compte"]},
  {id:"installer",sec:"demarrer",t:"Installer l’appli sur l’écran d’accueil",plan:"Gratuit",added:"2026-11-02",
   what:"Installée, l’appli s’ouvre en plein écran comme une application classique et reçoit les alertes même fermée. Rien à télécharger sur un magasin d’applications.",
   steps:["iPhone : ouvrez l’appli dans Safari, touchez Partager puis « Sur l’écran d’accueil ».","Android : dans Chrome, menu ⋮ puis « Installer l’application », ou le bouton « Installer l’appli ».","Ordinateur : bouton « Installer l’appli » en haut de l’écran (Chrome, Edge)."],
   ex:"Sophie installe l’appli sur son iPhone : l’icône Chasse & Pêche apparaît à côté de ses autres applis.",
   tip:"Les mises à jour se font toutes seules : rien à réinstaller."},
  {id:"reperes",sec:"demarrer",t:"Se repérer dans l’appli",plan:"Gratuit",added:"2026-11-02",
   what:"L’appli s’ouvre sur le fil d’actualité. Tout le reste est à un geste.",
   steps:["En haut : le bouton Chasse / Pêche, la recherche et les notifications.","En bas : Actualité, Carte, SOS au centre, Tir 30° (Carnet en mode pêche) et Menu.","Le Menu regroupe toutes les rubriques par thème.","En faisant défiler une page, les barres se cachent pour laisser la place ; elles reviennent dès que vous remontez."],
   ex:"En septembre, Marc est en mode Chasse : l’appli est verte. Le dimanche, il touche « Pêche » : elle passe en bleu et la barre du bas propose le Carnet.",
   tip:"Le mode Chasse ou Pêche change aussi les menus, la carte et les couleurs."},
  {id:"affichage",sec:"demarrer",t:"Régler l’affichage",plan:"Gratuit",added:"2026-11-02",
   what:"Chacun règle l’appli à son goût dans Profil › Affichage.",
   steps:["Thème : Jour, Nuit ou Contraste élevé (lecture en plein soleil).","Page d’ouverture : Fil d’actualité, Accueil, Carte, Météo, Sécurité, Messagerie…","Taille d’affichage : Confortable, Compact ou Très compact, pour voir plus de choses sur un petit écran."],
   ex:"Jacques prépare ses sorties chaque matin : il choisit la Météo comme page d’ouverture.",
   tip:"La page d’ouverture s’applique à la connexion suivante ; la taille d’affichage est propre à chaque appareil.",link:["/profil","Ouvrir mon profil"]},

  /* Communauté */
  {id:"fil",sec:"communaute",t:"Le fil d’actualité",plan:"Gratuit",added:"2026-11-02",
   what:"Les sorties, photos et récits des membres. Tout le monde peut le lire ; il faut un compte pour publier, aimer et commenter.",
   steps:["Touchez « Publier », écrivez quelques lignes et ajoutez une photo ou une vidéo.","Choisissez le thème : Chasse, Pêche ou Nature, et un lieu si vous le souhaitez.","Filtrez le fil avec Chasse, Pêche, Nature ou Amis.","Aimez, commentez, ou partagez une publication sur Instagram, Facebook, WhatsApp…"],
   ex:"Après sa matinée à l’étang, Sophie publie la photo de son brochet de 86 cm, remis à l’eau, avec un mot sur la température de l’eau.",
   tip:"Pas de réseau ? Publiez quand même : la publication part toute seule au retour du réseau.",link:["/communaute","Ouvrir le fil"]},
  {id:"courts",sec:"communaute",t:"Les vidéos courtes",plan:"Gratuit",added:"2026-11-02",
   what:"Un fil de vidéos verticales en plein écran, publiées par les membres. On fait défiler d’un geste.",
   steps:["Menu › Vidéos › Vidéos courtes.","Pour publier : choisissez une vidéo verticale de votre téléphone (1 minute maximum).","L’appli la compresse avant l’envoi : pas besoin de la retoucher."],
   ex:"Hugo filme le départ de ses chiens au rapproché et la publie en vidéo courte le soir même.",
   tip:"Filmez à la verticale : la vidéo occupera tout l’écran.",link:["/courts","Voir les vidéos"]},
  {id:"amis",sec:"communaute",t:"Amis",plan:"Gratuit",added:"2026-11-02",
   what:"Retrouvez vos compagnons de chasse ou de pêche et suivez leurs publications.",
   steps:["Menu › Amis, onglet « Trouver » : recherchez un membre par son nom.","Touchez « Ajouter en ami » : il reçoit votre demande et l’accepte de son côté.","Le filtre « Amis » du fil n’affiche plus que leurs publications."],
   ex:"Luc ajoute les membres de son ACCA en amis et ne rate plus leurs tableaux du week-end.",link:["/amis","Mes amis"]},
  {id:"messages",sec:"communaute",feat:"messages",t:"Messagerie",plan:"Gratuit",added:"2026-11-02",
   what:"Écrivez en privé à un membre, ou créez une conversation de groupe.",
   steps:["Menu › Messagerie, puis « Nouvelle conversation ».","Choisissez une ou plusieurs personnes, donnez un nom au groupe si besoin.","Une notification prévient de chaque nouveau message."],
   ex:"Avant l’ouverture, Marc crée le groupe « Équipe du samedi » pour fixer l’heure du rendez-vous.",link:["/messages","Ouvrir la messagerie"]},
  {id:"articles",sec:"communaute",feat:"articles",t:"Articles",plan:"Gratuit",added:"2026-11-02",
   what:"Des articles plus longs, écrits par les membres : sécurité, technique, cuisine, nature.",
   steps:["Menu › Articles pour les lire, avec un filtre par thème.","Pour écrire le vôtre : « Déposer un article », un titre, un résumé et le texte.","Les articles apparaissent aussi dans le fil d’actualité."],
   ex:"Nadia, garde-pêche bénévole, écrit un article sur les bons gestes de remise à l’eau.",link:["/articles","Lire les articles"]},
  {id:"ambassadeurs",sec:"communaute",t:"Ambassadeurs",plan:"Gratuit",added:"2026-11-02",
   what:"Des passionnés choisis par l’équipe : leur fiche, leurs réseaux et leurs dernières vidéos.",
   steps:["Menu › Ambassadeurs, avec un filtre Chasse ou Pêche.","Touchez « Suivre » : vous êtes prévenu de leurs nouvelles publications et vidéos.","Leurs publications portent le badge « Ambassadeur » dans le fil."],
   ex:"Camille suit un ambassadeur pêcheur au leurre et reçoit une alerte à chaque nouvelle vidéo.",
   tip:"Le code d’un ambassadeur, saisi à l’inscription, donne le tarif Fondateurs.",link:["/ambassadeurs","Voir les ambassadeurs"]},
  {id:"album",sec:"communaute",t:"Album du profil",plan:"Gratuit",added:"2026-11-02",
   what:"Votre vitrine : vos plus belles photos et vos vidéos YouTube ou Instagram, sur votre profil.",
   steps:["Profil › Album, puis « Ajouter à l’album ».","Une photo (compressée automatiquement) ou un lien vidéo YouTube / Instagram.","Choisissez pour chacune : publique ou privée."],
   ex:"Inès range dans son album les photos de ses plus belles recettes de gibier.",link:["/profil","Mon album"]},
  {id:"signaler",sec:"communaute",t:"Charte, signalement et blocage",plan:"Gratuit",added:"2026-11-02",
   what:"Une communauté sûre : respect de tous, pas de photo choquante, pas de spot exact sans floutage.",
   steps:["Sous une publication, un commentaire ou un profil : « Signaler ».","Choisissez le motif ; l’équipe examine le signalement.","Un membre vous importune ? Sous l’une de ses publications, « Bloquer » : vous ne voyez plus ses publications ni ses commentaires, et il n’en est pas prévenu.","Pour débloquer : Mon profil, rubrique Affichage, « Membres bloqués »."],
   ex:"Un membre publie la position exacte d’un poste : Paul le signale, l’équipe retire la publication.",
   tip:"Les photos publiées passent aussi par une modération automatique.",link:["/cgu","Lire les règles"]},

  /* Sécurité */
  {id:"sos",sec:"securite",t:"Le bouton SOS",plan:"Gratuit pour tous",added:"2026-11-02",
   what:"En cas d’accident, un geste suffit : l’alerte part avec votre position GPS.",
   steps:["Touchez le bouton SOS, toujours au centre de la barre du bas.","Touchez « Envoyer l’alerte SOS » : elle part avec votre position.","Elle prévient les participants de la chasse, les responsables du territoire et les pratiquants à moins de 5 km."],
   ex:"Pendant une traque, un participant fait une chute grave : son voisin de poste déclenche le SOS, les autres chasseurs savent où le rejoindre.",
   tip:"Appelez aussi le 112 : l’appli ne prévient pas les secours. Sans réseau, l’appli vous le dit et propose le 112 et un SMS de votre position ; l’alerte part dès le retour du réseau.",link:["/securite","Ouvrir la sécurité"]},
  {id:"sortie",sec:"securite",feat:"sorties",t:"Sortie : prévenir un proche",plan:"Gratuit pour tous",added:"2026-11-02",
   what:"Avant de partir seul, dites où vous allez et quand vous rentrez. Si vous ne rentrez pas, votre proche est prévenu.",
   steps:["Accueil › « Sortie » (en mode chasse ou pêche).","Indiquez le lieu, avec ou sans chien, l’heure de retour prévue et le proche à prévenir, puis « Démarrer la sortie ».","À l’heure prévue, l’appli vous demande de confirmer que vous êtes rentré ou de prolonger la sortie ; touchez « Je suis rentré » à votre retour."],
   ex:"Jacques part seul à la passée du soir et prévoit son retour à 20 h 30. Il touche « Je suis rentré » en arrivant à la voiture.",
   tip:"Chaque sortie est ensuite gardée dans l’historique des sorties.",link:["/sortie","Préparer une sortie"]},
  {id:"alertes",sec:"securite",t:"Sécurité & alertes terrain",plan:"Gratuit",added:"2026-11-02",
   what:"Les signalements terrain près de vous, et les chasses en cours autour de vous.",
   steps:["Menu › Sécurité.","« Signaler un danger » : animal blessé, clôture arrachée, danger sur un chemin…","Consultez les alertes et les chasses en cours à proximité."],
   ex:"Nadia prépare une balade en VTT : elle voit qu’une chasse est en cours sur son parcours et décale sa boucle.",link:["/securite","Voir les alertes"]},
  {id:"viseur",sec:"securite",feat:"angle30",t:"Le viseur 30°",plan:"Gratuit pour tous · téléphone et tablette",added:"2026-11-02",
   what:"Au poste, l’appli vous montre votre zone de tir en retirant 30° de chaque côté de vos voisins.",
   steps:["Barre du bas › Tir 30°.","Visez l’obstacle de gauche (dernier voisin, poste) et prenez la photo.","Visez l’obstacle de droite de la même façon.","Lisez la zone : ce qui reste au milieu est votre zone de tir."],
   ex:"À son poste, Marc photographie ses deux voisins : l’appli lui montre sa zone de tir, qu’il repère ensuite avec un piquet.",
   tip:"C’est une aide visuelle : les consignes du directeur de chasse priment toujours. Une marge de +5° ou +10° peut être ajoutée.",link:["/angle-30","Ouvrir le viseur"]},

  /* Carte & météo */
  {id:"carte",sec:"terrain",feat:"carte",t:"La carte terrain",plan:"Carte IGN gratuite · couches avancées en Premium",added:"2026-11-02",
   what:"La carte IGN pour se repérer, avec votre position.",
   steps:["Barre du bas › Carte.","Touchez le bouton de position pour vous centrer.","Changez de couche : IGN pour tous ; photo aérienne, cadastre, vent animé et cartes hors ligne en Premium ; bathymétrie en pêche."],
   ex:"Avant la battue, Luc affiche la photo aérienne et le cadastre pour voir les limites des parcelles.",
   tip:"Avec Premium, « Zone hors ligne » garde le secteur affiché sur le téléphone, pour l’avoir sans réseau au fond des bois. Les zones gardées se suppriment une par une.",link:["/carte","Ouvrir la carte"]},
  {id:"meteo",sec:"terrain",feat:"meteo",t:"Météo terrain et horaires de tir",plan:"Gratuit · détail et vent animé en Premium",added:"2026-11-02",
   what:"Le temps à votre position, utile au chasseur et au pêcheur.",
   steps:["Menu › Météo terrain.","Vent et rafales, pression et sa tendance, lune, lever et coucher du soleil, prévisions heure par heure.","En chasse : le début et la fin du tir du jour. En pêche : un indice d’activité du poisson."],
   ex:"Le vent tourne au nord-est demain matin : Marc choisit un poste où le gibier ne l’aura pas sous le vent.",
   tip:"Horaires de tir : 1 h avant le lever et 1 h après le coucher du soleil, sauf arrêté préfectoral.",link:["/meteo","Voir la météo"]},

  /* Chasse */
  {id:"tableau",sec:"chasse",feat:"tableau",t:"Tableau de chasse",plan:"20 prélèvements gratuits · illimité en Premium",added:"2026-11-02",
   what:"Votre carnet personnel de prélèvements, avec des statistiques par saison et par espèce.",
   steps:["Menu Chasse › Tableau de chasse, puis « Noter un prélèvement ».","Espèce, nombre, poids, lieu et numéro de bracelet.","Consultez vos statistiques par saison et par espèce."],
   ex:"En fin de saison, Hugo retrouve d’un coup d’œil ses 12 sangliers et 4 chevreuils, et le poids total.",
   tip:"Carnet personnel, sans valeur légale : les déclarations officielles (ChassAdapt, carnet papier) restent obligatoires.",link:["/tableau-de-chasse","Mon tableau"]},
  {id:"historique",sec:"chasse",feat:"sorties",t:"Historique des sorties",plan:"Gratuit",added:"2026-11-02",
   what:"Chaque sortie, chasse ou pêche, avec son départ, son retour, sa durée et sa trace.",
   steps:["Menu Chasse (ou Pêche) › Historique des sorties.","Touchez une sortie pour voir son détail et sa trace sur la carte."],
   ex:"Sophie compare ses sorties d’octobre pour retrouver le jour où les carnassiers étaient les plus actifs.",link:["/historique/tous","Mes sorties"]},
  {id:"reglementation",sec:"chasse",t:"Réglementation",plan:"Gratuit",added:"2026-11-02",
   what:"Ouverture, clôture et espèces chassables ou pêchables de votre département.",
   steps:["Menu › Réglementation.","Choisissez votre département ; le mode Chasse ou Pêche change les informations affichées."],
   ex:"Paul chasse dans un département voisin ce week-end : il vérifie la date de clôture du lièvre.",
   tip:"Information indicative : les arrêtés officiels font foi.",link:["/reglementation","Voir la réglementation"]},

  /* Pêche */
  {id:"carnet",sec:"peche",feat:"carnet",t:"Carnet de prises",plan:"20 prises gratuites · illimité et statistiques en Premium Pêche",added:"2026-11-02",
   what:"Le carnet du pêcheur, rempli tout seul : position, météo, pression et lune s’ajoutent automatiquement.",
   steps:["Mode Pêche › barre du bas › Carnet, puis « Nouvelle prise ».","Espèce, taille, poids, leurre, et une photo si vous voulez.","Le reste se remplit seul, même sans réseau."],
   ex:"Sophie note son brochet : 86 cm, 4,2 kg, au leurre souple. L’appli ajoute 14 °C, pression en hausse, premier quartier de lune.",link:["/carnet","Mon carnet"]},
  {id:"spots",sec:"peche",feat:"carnet",t:"Mes spots",plan:"5 spots gratuits · illimités et confidentiels en Premium Pêche",added:"2026-11-02",
   what:"Vos coins de pêche enregistrés sur la carte, à retrouver facilement.",
   steps:["Menu Pêche › Mes spots, puis « Nouveau spot ».","Placez le spot sur la carte, donnez-lui un nom et une note.","Avec Premium, un spot peut rester confidentiel : visible de vous seul."],
   ex:"Luc enregistre « Bras mort des saules » et y retrouve ses meilleures prises dans le carnet.",link:["/spots","Mes spots"]},

  /* Cuisine & pros */
  {id:"recettes",sec:"cuisine",feat:"recettes",t:"Recettes",plan:"Gratuit",added:"2026-11-02",
   what:"Gibier et poisson, étape par étape, avec le temps, la difficulté et les robots de cuisine.",
   steps:["Menu › Recettes, avec un filtre par type.","Ouvrez une recette pour suivre les étapes.","Proposez la vôtre : « Proposer une recette »."],
   ex:"Inès propose son civet de chevreuil ; d’autres membres le cuisinent et laissent un commentaire.",link:["/recettes","Voir les recettes"]},
  {id:"annuaire",sec:"cuisine",feat:"annuaire",t:"Annuaire des pros",plan:"Gratuit",added:"2026-11-02",
   what:"Les professionnels de la chasse et de la pêche près de chez vous, sur une carte et en liste.",
   steps:["Menu › Annuaire.","Cherchez par type (armurerie, magasin de pêche, venaison, guide…) ou par ville.","Touchez une fiche pour l’adresse, le téléphone et l’itinéraire."],
   ex:"La veille de l’ouverture, Marc cherche une armurerie ouverte le samedi près de Romorantin.",link:["/annuaire","Ouvrir l’annuaire"]},

  /* Compte & offres */
  {id:"profil",sec:"compte",t:"Mon profil",plan:"Gratuit",added:"2026-11-02",
   what:"Votre photo, votre commune, votre présentation et votre pratique, plus un aide-mémoire du permis et de la carte de pêche.",
   steps:["Menu › Mon profil, puis « Modifier ».","Ajoutez une photo et quelques mots sur vous.","Renseignez l’aide-mémoire du permis si vous le souhaitez."],
   ex:"Paul indique « Chasseur à l’arc, Sologne » : ses amis le retrouvent plus facilement.",
   tip:"L’aide-mémoire du permis ne remplace pas le permis original lors d’un contrôle.",link:["/profil","Mon profil"]},
  {id:"notifs",sec:"compte",t:"Notifications et alertes",plan:"Gratuit",added:"2026-11-02",
   what:"Choisissez ce qui vous est envoyé : messages, amis, ambassadeurs suivis, alertes sécurité.",
   steps:["Acceptez les notifications quand l’appli le propose.","Réglez-les dans Menu › Notifications et alertes.","Sur iPhone, elles ne marchent qu’avec l’appli installée sur l’écran d’accueil (iOS 16.4 ou plus récent)."],
   ex:"Sophie ne garde que les messages et les alertes sécurité pour ne pas être dérangée.",link:["/notifications","Mes notifications"]},
  {id:"horsligne",sec:"compte",t:"Sans réseau",plan:"Gratuit",added:"2026-11-02",
   what:"Au bois ou au bord de l’eau, l’appli continue de fonctionner, à condition de l’avoir ouverte une fois avec du réseau.",
   steps:["Publiez, ajoutez une prise ou un prélèvement comme d’habitude : une pastille indique ce qui attend, tout part au retour du réseau, vidéos comprises.","Météo : l’appli garde les dernières prévisions reçues et les affiche avec leur heure. Sans prévision gardée, elle l’indique, sans rien inventer.","Carte : avant de partir, ouvrez la carte sur votre secteur et touchez « Zone hors ligne » (Premium). Les zones gardées sont listées et se suppriment une par une.","SOS sans réseau : l’appli le dit clairement, propose d’appeler le 112 et d’envoyer votre position par SMS, puis envoie l’alerte toute seule au retour du réseau."],
   ex:"Pas une barre de réseau à l’étang : Luc note trois prises, elles s’envoient sur le chemin du retour.",
   tip:"Préparez la veille, avec du réseau : ouvrez la météo et téléchargez la zone de carte de votre sortie."},
  {id:"offres",sec:"compte",t:"Offres et abonnements",plan:"Gratuit, Premium Chasse, Premium Pêche, Combo 360°",added:"2026-11-02",
   what:"La sécurité est gratuite pour tous. Les offres Premium ajoutent les cartes avancées, l’illimité et les statistiques.",
   steps:["Gratuit : SOS, viseur 30°, sortie, communauté, carte IGN, 20 prises ou prélèvements, 5 spots, recettes, annuaire.","Premium Chasse ou Premium Pêche : 29,99 € par an.","Combo 360° : les deux réunis, 44,99 € par an.","Menu › Abonnement pour comparer et souscrire."],
   ex:"Marc chasse et pêche : il prend le Combo plutôt que deux Premium, et économise 15 € par an.",
   tip:"Les 30 premiers inscrits sont Pionniers (1 an de Combo offert), les 500 premiers Fondateurs (tarifs de lancement).",link:["/abonnement","Voir les offres"]},
  {id:"supprimer",sec:"compte",t:"Supprimer son compte",plan:"Gratuit",added:"2026-11-02",
   what:"Vous pouvez partir quand vous voulez.",
   steps:["Menu › Mon profil › « Supprimer mon compte ».","Confirmez : tout ce que vous avez créé est effacé, définitivement."],
   ex:"",link:["/confidentialite","Vos données"]}
];
const S3GuideMaj="9 novembre 2026";
/* « Nouveau » : seulement pour les fonctions sorties après le lancement (mi-janvier 2027), pendant 45 jours */
const S3GuideLaunch="2027-01-15";
function S3GuideNew(g){try{return String(g.added)>S3GuideLaunch&&Date.now()-new Date(g.added).getTime()<45*864e5}catch{return!1}}
function S3GuideList(){return S3GUIDE.filter(g=>(!g.feat||!(typeof S3FeatOff<"u"&&S3FeatOff.has(g.feat)))&&!(g.id==="offres"&&typeof S3Native=="function"&&S3Native()))}
function S3GuidePage(t){
  let list=S3GuideList(),st={q:"",sec:"tous"},box=e("div.gd-list"),
    norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,""),
    hay=g=>norm([g.t,g.what,g.ex,g.tip,...(g.steps||[])].join(" ")),
    open=new Set(((location.hash.split("?")[1]||"").match(/f=([a-z0-9-]+)/)||[])[1]?[RegExp.$1]:[]);
  let card=g=>{
    let d=e("details.gd-card",{id:"g-"+g.id,open:open.has(g.id)||!!st.q},
      e("summary",e("span.gd-t",g.t),S3GuideNew(g)?e("span.gd-new","Nouveau"):null),
      e("div.gd-body",
        e("p.gd-what",g.what),
        g.plan?e("p.gd-plan",g.plan):null,
        e("h4","Comment faire"),
        e("ol.gd-steps",(g.steps||[]).map(s=>e("li",s))),
        g.ex?e("div.gd-ex",e("b","Exemple"),e("span",g.ex)):null,
        g.tip?e("p.gd-tip",g.tip):null,
        g.link?e("div.row",{style:{gap:"8px",marginTop:"4px"}},x(g.link[1],{kind:"ghost",href:"#"+g.link[0]})):null));
    return d};
  let draw=()=>{
    let qv=norm(st.q.trim()),rows=list.filter(g=>(st.sec==="tous"||g.sec===st.sec)&&(!qv||hay(g).includes(qv)));
    if(!rows.length){B(box,e("p.muted","Aucune fiche ne correspond. Essayez un autre mot, ou écrivez-nous depuis l’Aide."));return}
    B(box,S3GUIDE_SECS.filter(([id])=>rows.some(g=>g.sec===id)).map(([id,name])=>e("section.gd-sec",e("h2",name),rows.filter(g=>g.sec===id).map(card))));
  };
  let search=e("input.input.gd-search",{type:"search",placeholder:"Rechercher : SOS, carnet, vent, mot de passe…","aria-label":"Rechercher dans le guide",oninput:ev=>{st.q=ev.target.value;draw()}});
  let chips=e("div.gd-chips",[["tous","Tout"],...S3GUIDE_SECS].map(([id,name])=>{let c=e("button.gd-chip",{type:"button","aria-pressed":String(id===st.sec),onclick:()=>{st.sec=id;chips.querySelectorAll(".gd-chip").forEach(b2=>b2.setAttribute("aria-pressed",String(b2===c)));draw()}},name);return c}));
  let soon=typeof S3FEAT<"u"?S3FEAT.filter(f=>S3FeatOff.has(f.id)).map(f=>f.label):[];
  C(t,q({title:"Guide de l’appli",subtitle:"Toutes les fonctions, expliquées simplement, avec un exemple. Mis à jour le "+S3GuideMaj+"."},
    e("div.gd",
      search,chips,box,
      soon.length?e("div.gd-soon",e("b","Bientôt dans l’appli"),e("span",soon.join(" · ")),e("span.small.muted","Chaque fonction aura sa fiche ici le jour de sa sortie.")):null,
      e("p.small.muted",{style:{margin:0}},"Une question sans réponse ? ",e("a",{href:"#/aide"},"Aide et questions fréquentes"),"."))));
  draw();
  if(open.size)setTimeout(()=>{try{document.getElementById("g-"+[...open][0]).scrollIntoView({block:"start"})}catch{}},60);
}
