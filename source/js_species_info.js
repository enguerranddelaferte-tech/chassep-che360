/* ===== Fiches espèces : description, période, reproduction (informations générales, indicatives) ===== */
const SP_INFO={
"Cerf élaphe":["Plus grand cervidé de France, robe brun-roux, le mâle porte des bois qui tombent chaque hiver. Vit en grands massifs forestiers.","Rut (brame) de la mi-septembre à la mi-octobre ; mise bas en mai-juin."],
"Cerf sika":["Cervidé d’origine asiatique, plus petit que le cerf élaphe, robe tachetée l’été. Présent localement en forêt.","Rut en octobre ; mise bas en mai-juin."],
"Chevreuil":["Petit cervidé (20 à 30 kg), discret, qui vit en lisière de bois et en plaine.","Rut de la mi-juillet à la mi-août ; mise bas en mai-juin."],
"Daim":["Cervidé à robe tachetée et bois palmés, issu de parcs et de forêts où il a été introduit.","Rut en octobre ; mise bas en juin."],
"Chamois isard":["Bovidé de montagne des Pyrénées, agile sur les pentes, aux cornes recourbées en crochet.","Rut en novembre-décembre ; naissances en mai-juin."],
"Mouflon méditerranéen":["Mouflon de montagne, mâle aux grandes cornes enroulées, introduit en Corse puis sur le continent.","Rut à l’automne ; naissances au printemps."],
"Sanglier":["Suidé de 60 à 150 kg, vit en groupes de laies et de jeunes, très adaptable (forêt, marais, cultures).","Reproduction possible toute l’année, avec un pic de naissances de mars à mai ; rut surtout de novembre à janvier."],
"Lièvre brun":["Lagomorphe de plaine, il se tient au gîte le jour et sort au crépuscule.","Reproduction de février à octobre, avec plusieurs portées."],
"Lapin de garenne":["Petit lagomorphe qui vit en garennes (terriers collectifs).","Reproduction surtout de la fin de l’hiver à la fin de l’été."],
"Renard":["Canidé de taille moyenne (6 à 8 kg), omnivore, présent dans tous les milieux.","Accouplement de décembre à février ; naissances en mars-avril."],
"Faisan de chasse":["Oiseau sédentaire, mâle à plumage coloré ; souvent issu d’élevage et de lâchers.","Nidification d’avril à juin."],
"Perdrix rouge":["Galliforme des terrains secs et ouverts, plumage gris-bleu et flancs rayés.","Nidification d’avril à juin."],
"Perdrix grise":["Perdrix des plaines cultivées, vit en compagnies.","Nidification d’avril à juin."],
"Bécasse des bois":["Oiseau de passage au bec long, discret, active à la tombée de la nuit en sous-bois.","Nidifie au nord et à l’est de l’Europe de mars à juillet ; elle est présente chez nous surtout d’octobre à mars."],
"Pigeon ramier":["Plus grand pigeon d’Europe, tache blanche sur le cou, vit en groupes dans les champs et les bois.","Reproduction de mars à octobre, plusieurs couvées."],
"Canard colvert":["Canard le plus commun, le mâle a la tête verte ; fréquente étangs, rivières et marais.","Nidification de mars à juin."],
"Corneille noire":["Corvidé noir, intelligent et très répandu.","Nidification de mars à juin."],
"Pie bavarde":["Corvidé noir et blanc aux longues plumes de queue.","Nidification d’avril à juin."],
"Brochet":["Carnassier allongé pouvant dépasser un mètre, à l’affût dans les herbiers.","Fraie de février à avril, sur les prairies inondées et les bords végétalisés."],
"Sandre":["Carnassier de grandes eaux calmes ou lentes, aux yeux clairs et aux dents fines.","Fraie en avril-mai ; le mâle garde le nid."],
"Black-bass":["Carnassier d’origine américaine des eaux calmes, à grande bouche.","Fraie en mai-juin sur un nid creusé par le mâle."],
"Perche":["Poisson rayé à nageoire dorsale épineuse, vit en bancs.","Fraie de mars à mai ; les œufs forment un ruban accroché à la végétation."],
"Truite fario":["Salmonidé des eaux vives, fraîches et oxygénées, robe tachetée.","Fraie de novembre à janvier ; les frayères (graviers) sont protégées."],
"Truite arc-en-ciel":["Salmonidé originaire d’Amérique du Nord, bande rosée sur le flanc ; souvent issu de lâchers.","Reproduction naturelle rare chez nous, en hiver et au printemps."],
"Omble de fontaine":["Salmonidé de petits cours d’eau froids, ventre orangé et points rouges cerclés de bleu.","Fraie d’octobre à décembre."],
"Ombre commun":["Poisson de rivières vives, grande nageoire dorsale en voile.","Fraie en mars-avril."],
"Saumon atlantique":["Migrateur qui naît en rivière, grandit en mer et remonte se reproduire.","Fraie en novembre-décembre, en amont des rivières."],
"Anguille jaune":["Migratrice au corps de serpent ; sa reproduction a lieu en mer des Sargasses, loin de nos rivières.","Pas de reproduction en eau douce française."],
"Alose":["Grand poisson migrateur argenté qui remonte les fleuves.","Fraie de mai à juin."],
"Carpe commune":["Grand poisson de plans d’eau et de rivières lentes, qui fouille le fond.","Fraie de mai à juillet, en eau chaude."],
"Silure":["Plus grand poisson d’eau douce d’Europe, pouvant dépasser deux mètres ; introduit.","Fraie de mai à juillet, en eau chaude."],
"Gardon, brème, tanche":["Poissons paisibles des eaux calmes, très communs.","Fraie de mai à juin, en eau chaude."],
"Huchon":["Grand salmonidé des rivières de l’Est, aujourd’hui rare.","Fraie de mars à mai."]
};
function SpOpen(r,ch,locals){
let info=SP_INFO[r[0]],note=ch?r[2]:r[3],ok=ch?r[3]:r[4],sec=(t,...b)=>e("div",{style:{marginTop:"14px"}},e("div.tiny.muted",{style:{fontWeight:"700",textTransform:"uppercase",letterSpacing:".5px"}},t),...b);
let body=e("div.stack",{style:{gap:"0"}},
e("div.row",{style:{gap:"8px",flexWrap:"wrap",alignItems:"center"}},L(r[1],"gold"),ok?L("Règle nationale confirmée","accent","check"):L("À vérifier","gold")),
sec("Description",e("p.small",{style:{margin:"4px 0 0",lineHeight:"1.55"}},info?info[0]:"Fiche détaillée à compléter pour cette espèce. La catégorie ("+r[1]+") donne le cadre général.")),
sec(ch?"Période de chasse":"Période de pêche",e("p.small",{style:{margin:"4px 0 0",lineHeight:"1.55"}},ch?"Les dates d’ouverture et de clôture sont fixées chaque saison par arrêté préfectoral et varient selon le département : consultez l’encadré « Dans ce département » ou l’arrêté en vigueur.":(note&&/(Ouverture|Fermeture|période|Pêche)/i.test(note)?note:"Période fixée par arrêté préfectoral : voir la réglementation de votre département."))),
sec("Période de reproduction",e("p.small",{style:{margin:"4px 0 0",lineHeight:"1.55"}},info?info[1]:"Non renseignée pour cette espèce."),e("div.tiny.muted",{style:{marginTop:"2px"}},"Dates indicatives : elles varient selon l’année, le climat et la région.")),
sec("Réglementation",e("p.small",{style:{margin:"4px 0 0",lineHeight:"1.55"}},(ch?note:"Taille minimale nationale : "+r[2]+(note&&!/(Ouverture|Fermeture|période|Pêche)/i.test(note)?" · "+note:""))||"Pas de particularité nationale connue ; voir les arrêtés locaux."))
);
if(locals&&locals.length)C(body,sec("Dans ce département",...locals));
C(body,e("div.tiny.muted",{style:{marginTop:"16px"}},"Les textes officiels (arrêté ministériel, arrêté préfectoral, fédération) font foi."));
Le({title:r[0],body,wide:!0})}
