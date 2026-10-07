/* ===== conducteurs de chien de sang : recherche du grand gibier blessé ===== */
const SG_REG=[
["Auvergne-Rhône-Alpes","Liste officielle UNUCR par délégation"],["Bourgogne-Franche-Comté","Haute-Saône (70) : liste de la Fédération des chasseurs · Saône-et-Loire (71) : liste de la Fédération"],
["Bretagne","Finistère (29) : UDUCR 29 sur le site de la Fédération"],["Centre-Val de Loire","Loiret (45) : liste ANCGG / UNUCR"],["Corse","Liste officielle UNUCR"],["Grand Est","Liste officielle UNUCR par délégation"],
["Hauts-de-France","Liste officielle UNUCR par délégation"],["Île-de-France","Liste officielle UNUCR par délégation"],["Normandie","Liste officielle UNUCR par délégation"],["Nouvelle-Aquitaine","Liste officielle UNUCR par délégation"],
["Occitanie","Liste officielle UNUCR par délégation"],["Pays de la Loire","Loire-Atlantique (44) : page « chien de rouge » de la Fédération"],["Provence-Alpes-Côte d’Azur","Bouches-du-Rhône (13) : liste de la Fédération"]];
const SG_LINKS={
"Centre-Val de Loire":[["Loiret (45) : conducteurs agréés UNUCR","https://www.ancgg.org/ad45/liste-conducteurs-de-chiens-de-sang-agrees-unucr/"]],
"Bourgogne-Franche-Comté":[["Haute-Saône (70) : conducteurs UNUCR","https://www.fdchasseurs70.fr/conducteurs-unucr-70/"]],
"Pays de la Loire":[["Loire-Atlantique (44) : chien de rouge","https://www.chasse44.fr/"]],
"Bretagne":[["Finistère (29) : UDUCR 29","https://www.fdc29.com/"]],
"Provence-Alpes-Côte d’Azur":[["Bouches-du-Rhône (13) : fédération","https://www.fdc-13.com/"]]};
function SgKey(){return "sang.contacts"}
function SgLoad(){return Pe.get(SgKey(),[])}
function SgSave(a){Pe.set(SgKey(),a)}
async function SgView(t){let reg="",mine=e("div.stack"),regBox=e("div.stack");
const tel=s=>(s||"").replace(/[^\d+]/g,"");
function drawMine(){W(mine);let a=SgLoad();
if(!a.length){C(mine,e("div.small.muted","Aucun contact enregistré. Ajoutez ici le conducteur de votre secteur : numéro, commune, remarque. Ils restent sur cet appareil."));return}
a.forEach(c=>C(mine,e("div.row",{style:{gap:"10px",alignItems:"center",flexWrap:"wrap",padding:"10px 0",borderTop:"1px solid var(--line,#0001)"}},
e("div.small",{style:{flex:"1 1 160px",minWidth:0}},e("b",c.name),e("div.tiny.muted",[c.place,c.dept&&"("+c.dept+")",c.note].filter(Boolean).join(" · "))),
e("div.row",{style:{gap:"8px",flexWrap:"wrap"}},c.phone?e("a.btn.primary.sm",{href:"tel:"+tel(c.phone)},"Appeler "+c.phone):null,
x("Supprimer",{size:"sm",kind:"ghost",icon:"trash",onClick:async()=>{await ve({title:"Supprimer ce contact ?",text:c.name,confirm:"Supprimer",danger:!0})&&(SgSave(SgLoad().filter(z=>z.id!==c.id)),drawMine())}})))))}
async function add(){await Q({title:"Ajouter un conducteur",intro:"Recopiez les coordonnées depuis la liste officielle de votre fédération ou de l’UNUCR.",submit:"Enregistrer",fields:[{name:"name",label:"Nom et prénom",required:!0},{name:"phone",label:"Téléphone",placeholder:"06 00 00 00 00",required:!0},{name:"place",label:"Commune"},{name:"dept",label:"Département",placeholder:"45"},{name:"note",label:"Remarque (facultatif)",placeholder:"Chien : teckel, brachet…"}],onSubmit:async i=>{let a=SgLoad();a.push({id:"s"+Date.now().toString(36),name:i.name.trim(),phone:i.phone.trim(),place:(i.place||"").trim(),dept:(i.dept||"").trim(),note:(i.note||"").trim()});SgSave(a);drawMine();A("Contact ajouté.")}})}
function drawReg(){W(regBox);let L2=SG_LINKS[reg]||[];
C(regBox,e("div.small",reg?(SG_REG.find(z=>z[0]===reg)||[])[1]:"Choisissez votre région pour voir les listes officielles."));
L2.forEach(l=>C(regBox,e("a.btn.ghost.sm",{href:l[1],target:"_blank",rel:"noopener noreferrer",style:{justifyContent:"flex-start",whiteSpace:"normal",textAlign:"left"}},l[0]+" ↗")));
if(reg)C(regBox,e("a.btn.primary.sm",{href:"https://www.unucr.fr/conducteurs",target:"_blank",rel:"noopener noreferrer",style:{whiteSpace:"normal"}},"Liste officielle des conducteurs agréés UNUCR ↗"))}
let sel=e("select",{onchange:ev=>{reg=ev.target.value;drawReg()}},e("option",{value:""},"— Ma région —"),...SG_REG.map(z=>e("option",{value:z[0]},z[0])));
C(t,q({title:"Conducteurs de chien de sang",subtitle:"Retrouver un grand gibier blessé : que faire, et qui appeler selon votre région."},e("div.stack",
k({},e("div.row",{style:{gap:"10px",alignItems:"flex-start"}},b("info"),e("div",e("h3",{style:{margin:"0 0 6px"}},"Après un tir sur un grand gibier blessé"),
e("ol.small",{style:{margin:0,paddingLeft:"18px",lineHeight:"1.6"}},e("li","Ne piétinez pas le lieu du tir et n’y lancez pas de chien non spécialisé."),e("li","Repérez le poste, la direction de fuite, et balisez les indices (sang, poils, os) sans les ramasser."),e("li","Ne poursuivez pas l’animal : laissez-le se coucher, le temps compte."),e("li","Appelez rapidement un conducteur agréé de votre secteur, puis prévenez le responsable de la chasse.")))),
e("div.small.muted",{style:{marginTop:"10px"}},"Le conducteur agréé UNUCR (Union Nationale pour l’Utilisation de Chiens de Rouge) intervient avec un chien de rouge, de manière bénévole ; un défraiement est d’usage, à voir avec lui.")),
k({title:"Contacts par région"},e("div.field",e("label","Région"),sel),regBox,
e("div.small.muted",{style:{marginTop:"10px"}},"L’UNUCR publie la liste officielle des conducteurs agréés et des délégations départementales : "),
e("a.btn.ghost.sm",{href:"https://www.unucr.fr/delegations-et-assocations-departementales",target:"_blank",rel:"noopener noreferrer",style:{marginTop:"6px"}},"Délégations et associations départementales ↗")),
k({title:"Mes contacts",action:x("Ajouter",{icon:"plus",kind:"primary",size:"sm",onClick:add})},mine),
e("div.panel.tint",e("div.row",b("info"),e("div.small","Les numéros évoluent : ils ne sont pas intégrés ici pour éviter toute information périmée. Vérifiez-les sur la liste officielle de l’UNUCR ou auprès de votre Fédération départementale des chasseurs, puis enregistrez vos contacts. Le 112 reste le numéro d’urgence en cas d’accident corporel."))))));
drawReg();drawMine()}
var SgM={};le(SgM,{default:()=>SgView});var SgI=H(()=>{});
