/* ===== Calculateur de salaisons (charcuterie sèche, gibier) : valeurs indicatives ===== */
const SAL_TYPES={saucisson:{label:"Saucisson / saucisse sèche (viande hachée)",salt:2.8,sugar:.3,pepper:.2,fat:30,loss:33,weeks:"selon le diamètre : environ 2 à 3 semaines à 30 mm, 3 à 5 semaines à 40 mm, 5 à 8 semaines à 60 mm"},entier:{label:"Pièce entière (jambon, longe, filet) en salage à sec",salt:5,sugar:.5,pepper:.2,fat:0,loss:33,weeks:"plusieurs mois selon le poids et l’épaisseur (salage, repos, puis séchage lent)"}};
const SAL_SP={sanglier:{label:"Sanglier",fat:30,warn:"Sanglier : une analyse trichine est obligatoire avant toute consommation. Le sel et le séchage ne détruisent pas le parasite : ne consommez cru ou séché que de la viande dont l’analyse est négative."},cervide:{label:"Cerf, chevreuil, daim",fat:30,warn:"Viande très maigre : ajoutez du gras de porc ferme (environ 30 %) pour un saucisson moelleux. Gras et viande doivent être bien froids au hachage."},porc:{label:"Porc",fat:25,warn:"Le porc d’élevage peut être concerné par la trichine selon la filière : respectez la réglementation sanitaire en vigueur."},autre:{label:"Autre viande",fat:25,warn:""}};
function SalCalc(o){let kg=+o.kg||0,g=kg*1e3,T=SAL_TYPES[o.type],f=T.fat?Math.max(0,Math.min(50,+o.fat||0))/100:0,meat=g*(1-f),fat=g*f,saltPct=Math.max(0,+o.salt||0),nitPct=Math.max(0,+o.nit||0),saltG=g*saltPct/100,cureG=0,plainG=saltG,nit=0,max=nitPct>0?150/(nitPct*10):0;
if(o.cure&&nitPct>0){cureG=Math.min(saltG,g*max/1e3);plainG=saltG-cureG;nit=cureG/g*1e3*nitPct*10}
let sugar=g*(+o.sugar||0)/100,pepper=g*(+o.pepper||0)/100,loss=Math.max(0,Math.min(60,+o.loss||0))/100;
return{g,meat,fat,saltG,cureG,plainG,nit,sugar,pepper,final:g*(1-loss),lostG:g*loss}}
async function SalView(t){let o={type:"saucisson",sp:"sanglier",kg:2,salt:2.8,sugar:.3,pepper:.2,fat:30,loss:33,cure:!0,nit:.6},out=e("div.stack"),opts=e("div.stack");
function fmt(n){return(Math.round(n*10)/10).toLocaleString("fr-FR")+" g"}
function field(label,key,{step=.1,min=0,hint}={}){let inp=e("input.input",{type:"number",inputmode:"decimal",step:String(step),min:String(min),value:String(o[key]),"aria-label":label,oninput:ev=>{o[key]=+ev.target.value;draw()}});return e("div.field",e("label",label),inp,hint?e("div.hint",hint):null)}
function setType(v){o.type=v;let T=SAL_TYPES[v];o.salt=T.salt;o.sugar=T.sugar;o.pepper=T.pepper;o.loss=T.loss;o.fat=T.fat?SAL_SP[o.sp].fat:0;form()}
function form(){W(opts);C(opts,k({title:"Votre préparation"},e("div.field",e("label","Type de salaison"),ke(Object.entries(SAL_TYPES).map(([a,b2])=>[a,b2.label]),o.type,setType)),e("div.field",{style:{marginTop:"12px"}},e("label","Viande"),Je(Object.entries(SAL_SP).map(([a,b2])=>[a,b2.label]),o.sp,v=>{o.sp=v;if(SAL_TYPES[o.type].fat)o.fat=SAL_SP[v].fat;form()})),e("div.form-grid",{style:{marginTop:"12px"}},field("Poids total du mélange (kg)","kg",{step:.1,min:.1,hint:"Viande + gras, avant ajout des ingrédients."}),SAL_TYPES[o.type].fat?field("Part de gras (%)","fat",{step:1,hint:"Gras dur de porc recommandé."}):null,field("Sel total (% du poids)","salt",{step:.1,hint:o.type==="entier"?"Souvent 4 à 6 % en salage à sec.":"Souvent 2,5 à 3 %."}),field("Sucre / dextrose (%)","sugar",{step:.1}),field("Poivre (%)","pepper",{step:.1}),field("Perte de poids visée (%)","loss",{step:1,hint:"Souvent 30 à 35 % pour une pièce sèche."}))),k({title:"Sel nitrité"},e("div.field",ke([["1","Avec sel nitrité"],["0","Sans nitrite"]],o.cure?"1":"0",v=>{o.cure=v==="1";form();draw()})),o.cure?e("div.form-grid",{style:{marginTop:"12px"}},field("Teneur en nitrite du sel (%)","nit",{step:.05,hint:"Lue sur l’emballage (souvent 0,5 à 0,6 %)."})):e("p.small.muted",{style:{margin:"10px 0 0"}},"Sans nitrite, la couleur sera plus grise et la protection contre certains germes est moindre : soyez très rigoureux sur le sel, la température et l’hygiène.")));draw()}
function draw(){let r=SalCalc(o),T=SAL_TYPES[o.type],S=SAL_SP[o.sp],row=(a,b2,c)=>e("div.list-row",{style:{padding:"10px 0"}},e("div.grow",e("div.t",a),c?e("div.s",c):null),e("div.end.mono-num",e("b",b2)));
W(out);
if(!(r.g>0)){C(out,V({icon:"law",title:"Indiquez un poids",text:"Entrez le poids du mélange pour obtenir les quantités."}));return}
let lines=[];
if(T.fat)lines.push(row("Viande maigre",fmt(r.meat)),row("Gras de porc",fmt(r.fat)));else lines.push(row("Pièce de viande",fmt(r.g)));
if(o.cure&&r.cureG>0)lines.push(row("Sel nitrité",fmt(r.cureG),"Teneur "+o.nit+" % de nitrite"));
if(r.plainG>.05)lines.push(row(o.cure?"Sel fin sans nitrite (complément)":"Sel fin",fmt(r.plainG)));
if(r.sugar>0)lines.push(row("Sucre ou dextrose",fmt(r.sugar)));
if(r.pepper>0)lines.push(row("Poivre",fmt(r.pepper)));
let warns=[];
if(S.warn)warns.push(S.warn);
if(o.cure&&r.nit>0)warns.push("Nitrite apporté : environ "+Math.round(r.nit)+" mg par kg de produit. La limite européenne d’incorporation est de 150 mg/kg : le calcul plafonne le sel nitrité à cette valeur et complète avec du sel fin. Pesez à 0,1 g près et mélangez bien.");
if(o.salt<2&&o.type==="saucisson")warns.push("Moins de 2 % de sel est faible pour un saucisson sec : le risque microbien augmente.");
if(o.salt>0&&o.salt<4&&o.type==="entier")warns.push("Moins de 4 % de sel est faible pour une pièce entière en salage à sec.");
warns.push("Conditions de séchage habituelles : environ 12 à 15 °C et 75 à 85 % d’humidité, à l’abri de la lumière et bien ventilé. Chaque pièce se pèse au début puis régulièrement.");
warns.push("Produit cru : déconseillé aux femmes enceintes, aux jeunes enfants et aux personnes fragiles.");
C(out,k({title:"Quantités à peser"},e("div.list",lines),e("div.row.between.small",{style:{borderTop:"1px solid var(--line)",paddingTop:"10px",marginTop:"6px"}},e("span","Total des ajouts"),e("b.mono-num",fmt(r.cureG+r.plainG+r.sugar+r.pepper)))),
k({title:"Objectif de séchage"},e("div.grid.g-2",it(M.num(Math.round(r.final))+" g","Poids final visé"),it(M.num(Math.round(r.lostG))+" g","À perdre")),e("p.small.muted",{style:{margin:"10px 0 0"}},"Durée indicative : "+T.weeks+".")),
k({title:"À savoir",cls:"tint"},e("div.stack",{style:{gap:"8px"}},warns.map(w2=>e("div.row",{style:{alignItems:"flex-start",gap:"10px"}},b("shield"),e("div.grow.small",w2))))),
e("div.tiny.muted","Outil indicatif, fondé sur des pratiques courantes : il ne remplace ni la réglementation sanitaire ni les conseils d’un professionnel (boucher-charcutier, fédération de chasseurs, DDPP)."))}
C(t,q({title:"Calculateur de salaisons",subtitle:"Quantités de sel, de sel nitrité et d’ingrédients pour vos saucissons et salaisons de gibier."},e("div.grid.g-main",opts,out)));form()}
var SalM={};le(SalM,{default:()=>SalView});var SalI=H(()=>{});
