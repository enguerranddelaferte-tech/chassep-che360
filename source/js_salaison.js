var SalM={};le(SalM,{default:()=>SalV});var SalI=H(()=>{X(),re(),ie(),ae()});
var SalKey="cp360.salaison.v1";
function SalLoad(){let d={tab:"calc",w:"1.5",unit:"kg",sel:"4",sucre:"2",poivre:"1",perte:"35",now:"",preset:"maison",ep:"4",forme:"plate"};try{let s=JSON.parse(localStorage.getItem(SalKey)||"null");if(s&&typeof s=="object")Object.assign(d,s)}catch(_){}return d}
function SalSave(s){try{localStorage.setItem(SalKey,JSON.stringify(s))}catch(_){}}
function SalNum(v){let n=parseFloat(String(v==null?"":v).replace(",","."));return isFinite(n)&&n>0?n:0}
function SalFmt(g){if(!isFinite(g)||g<=0)return"0";let d=g<10?1:0;return g.toLocaleString("fr-FR",{minimumFractionDigits:d,maximumFractionDigits:d})}
var SalPresets=[
 {id:"maison",label:"Ma recette",sel:4,sucre:2,poivre:1,perte:35,note:"Votre dosage : 4 % de sel, 2 % de sucre, 1 % de poivre."},
 {id:"magret",label:"Magret",sel:3,sucre:1,poivre:.5,perte:30,note:"Magret de canard ou d’oie : salaison sous vide selon l’épaisseur (environ 2 à 2,5 jours pour 2 à 3 cm), puis 2 à 3 semaines de séchage."},
 {id:"filet",label:"Filet de cervidé",sel:3,sucre:1.5,poivre:.5,perte:38,note:"Chevreuil, biche, cerf façon bresaola : salaison selon l’épaisseur (environ 4 jours pour 6 cm), puis 3 à 5 semaines de séchage."},
 {id:"saucisson",label:"Saucisson",sel:2.7,sucre:.5,poivre:.4,perte:38,note:"Mêlée gibier + gras de porc : 26 à 28 g de sel par kilo, de préférence du sel nitrité dosé par le fabricant."}
];
var SalCss=`
.sal-res{display:flex;flex-direction:column}
.sal-row{display:grid;grid-template-columns:12px minmax(0,1fr) auto;gap:12px;align-items:center;padding:12px 0;border-top:1px solid var(--line)}
.sal-row:first-child{border-top:0}
.sal-dot{width:12px;height:12px;border-radius:50%}
.sal-row b{display:block;font-weight:600}
.sal-pct{display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-size:14px;margin-top:2px}
.sal-pct input{width:4.2em;min-height:34px;padding:4px 8px;border-radius:8px;border:1px solid var(--line-strong);background:var(--surface);text-align:right;font-variant-numeric:tabular-nums}
.sal-g{font:700 30px/1 var(--font-display);font-variant-numeric:tabular-nums;text-align:right}
.sal-g small{font-size:.55em;color:var(--muted);margin-left:2px}
.sal-total{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-top:10px;padding:12px 14px;border-radius:var(--r);background:var(--accent-soft)}
.sal-total b{font:700 24px/1 var(--font-display);font-variant-numeric:tabular-nums}
.sal-w{display:flex;gap:10px;align-items:stretch;flex-wrap:wrap}
.sal-w .input{flex:1 1 140px;min-width:0;font:700 30px/1 var(--font-display);font-variant-numeric:tabular-nums}
.sal-gauge{position:relative;height:14px;border-radius:7px;background:linear-gradient(90deg,var(--surface-3) 0 50%,color-mix(in srgb,var(--ok) 55%,transparent) 50% 66.67%,color-mix(in srgb,var(--warn) 45%,transparent) 66.67% 83.33%,color-mix(in srgb,var(--brick) 40%,transparent) 83.33% 100%);margin:10px 0 6px}
.sal-gauge i{position:absolute;top:-5px;width:4px;height:24px;border-radius:2px;background:var(--text);transform:translateX(-2px)}
.sal-gauge-l{position:relative;height:18px;font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}
.sal-gauge-l span{position:absolute;top:0;transform:translateX(-50%);white-space:nowrap}
.sal-gauge-l span:first-child{transform:none}
.sal-gauge-l span:last-child{transform:translateX(-100%)}
.sal-legend{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:13px;color:var(--text-2);margin-top:6px}
.sal-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.sal-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
@media(max-width:760px){.sal-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}}
.sal-tile{border:1px solid var(--line);border-radius:var(--r);padding:14px;background:var(--surface-2)}
.sal-tile b{display:block;font:700 26px/1.05 var(--font-display)}
.sal-tile span{font-size:13px;color:var(--muted)}
.sal-steps{margin:0;padding-left:22px;display:flex;flex-direction:column;gap:8px}
.sal-steps li::marker{font-family:var(--font-display);font-weight:700;color:var(--accent)}
.sal-fiche{border:1px solid var(--line);border-radius:var(--r-lg);background:var(--surface);overflow:hidden}
.sal-fiche+.sal-fiche{margin-top:12px}
.sal-fiche summary{list-style:none;cursor:pointer;padding:16px 18px;display:flex;flex-direction:column;gap:8px}
.sal-fiche summary::-webkit-details-marker{display:none}
.sal-fiche summary h3{margin:0;font:700 23px/1.1 var(--font-display)}
.sal-fiche[open] summary{border-bottom:1px solid var(--line)}
.sal-fiche .sal-fbody{padding:16px 18px;display:flex;flex-direction:column;gap:14px}
.sal-meta{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:14px;color:var(--text-2)}
.sal-meta span b{font-weight:700}
.sal-warn{border-left:4px solid var(--brick);background:color-mix(in srgb,var(--brick) 9%,transparent);border-radius:0 var(--r) var(--r) 0;padding:12px 14px;font-size:15px}
.sal-tip{border-left:4px solid var(--accent);background:var(--accent-soft);border-radius:0 var(--r) var(--r) 0;padding:12px 14px;font-size:15px}
.sal-src a{color:var(--accent)}
.sal-prose p{margin:0 0 10px;max-width:68ch}
`;
function SalScale(){return e("div",e("div.sal-gauge-l",[[0,"0 %"],[50,"30 %"],[66.67,"40 %"],[83.33,"50 %"],[100,"60 %"]].map(([p,l])=>e("span",{style:{left:p+"%"}},l))),e("div.sal-legend",e("span",e("i",{style:{background:"var(--surface-3)"}}),"humide, continuer"),e("span",e("i",{style:{background:"color-mix(in srgb,var(--ok) 55%,transparent)"}}),"prêt (magret, filet, saucisson)"),e("span",e("i",{style:{background:"color-mix(in srgb,var(--warn) 45%,transparent)"}}),"sec"),e("span",e("i",{style:{background:"color-mix(in srgb,var(--brick) 40%,transparent)"}}),"très sec")))}
function SalV(t){
 let st=SalLoad(),body=e("div"),tb=e("div.tabs",{role:"tablist","aria-label":"Rubriques"});
 let tabs=[["calc","Calculateur"],["methodes","Méthodes"],["sechage","Séchage"],["fiches","Fiches pièces"],["securite","Sécurité"]];
 if(!tabs.some(z=>z[0]===st.tab))st.tab="calc";
 let rt=()=>{W(tb);tabs.forEach(([id,lbl])=>tb.append(e("button",{type:"button",role:"tab","aria-selected":String(id===st.tab),onclick:()=>{st.tab=id;SalSave(st);rt();sh();window.scrollTo(0,0)}},lbl)))};
 let panes={calc:()=>SalCalc(st),methodes:SalMeth,sechage:SalSech,fiches:SalFiches,securite:SalSecu};
 let sh=()=>B(body,panes[st.tab]());
 C(t,e("style",{html:SalCss}),q({title:"Salaison & séchage",subtitle:"Saler, sécher et fumer le gibier et le poisson à la maison : doses, conditions de séchage, fiches par pièce et règles sanitaires.",back:{href:"#/recettes",label:"Recettes"},tabs:tb},body));
 rt();sh();
}
function SalCalc(st){
 let ings=[["sel","Sel","var(--muted)"],["sucre","Sucre","var(--gold)"],["poivre","Poivre","var(--text)"]],out={},pin={};
 let wIn=e("input.input",{id:"sal-w",type:"number",inputmode:"decimal",min:"0",step:"any",value:st.w,"aria-label":"Poids de la pièce",oninput:z=>{st.w=z.target.value;up()}});
 let unitBox=e("div");
 let ru=()=>B(unitBox,ke([["kg","kg"],["g","g"]],st.unit,u=>{if(u===st.unit)return;let v=SalNum(wIn.value);if(v)wIn.value=u==="g"?String(Math.round(v*1e3)):String(+(v/1e3).toFixed(3));st.w=wIn.value;st.unit=u;up()}));
 ru();
 let rows=ings.map(([id,lbl,col])=>{out[id]=e("span","0");pin[id]=e("input",{id:"sal-p-"+id,type:"number",inputmode:"decimal",step:"0.1",min:"0",value:st[id],"aria-label":"Pourcentage de "+lbl.toLowerCase(),oninput:z=>{st[id]=z.target.value;st.preset="";rp();up()}});return e("div.sal-row",e("span.sal-dot",{style:{background:col}}),e("div",e("b",lbl),e("span.sal-pct",pin[id],"%")),e("div.sal-g",out[id],e("small","g")))});
 let tot=e("b","0 g"),note=e("p.small.muted",{style:{margin:"10px 0 0"}});
 let presetBox=e("div");
 let rp=()=>{B(presetBox,Je(SalPresets.map(p=>[p.id,p.label]),st.preset,id=>{let p=SalPresets.find(z=>z.id===id);if(!p)return;st.preset=id;ings.forEach(([k2])=>{st[k2]=String(p[k2]);pin[k2].value=st[k2]});st.perte=String(p.perte);pIn.value=st.perte;up()}));let p=SalPresets.find(z=>z.id===st.preset);note.textContent=p?p.note:"Dosage personnalisé."};
 let pIn=e("input.input",{id:"sal-perte",type:"number",inputmode:"decimal",min:"0",max:"70",step:"1",value:st.perte,style:{width:"90px"},oninput:z=>{st.perte=z.target.value;up()}});
 let nIn=e("input.input",{id:"sal-now",type:"number",inputmode:"decimal",min:"0",step:"any",placeholder:"ex. 1 050",value:st.now,oninput:z=>{st.now=z.target.value;up()}});
 let target=e("b.display",{style:{fontSize:"34px",lineHeight:"1"}},"0 g"),gauge=e("i",{style:{left:"0%"}}),gw=e("div.sal-gauge",gauge),status=e("div.small",{style:{minHeight:"22px"}});
 let eIn=e("input.input",{id:"sal-ep",type:"number",inputmode:"decimal",min:"0",step:"0.5",value:st.ep,style:{width:"110px"},oninput:z=>{st.ep=z.target.value;ud()}});
 let dOut=e("b.display",{style:{fontSize:"34px",lineHeight:"1"}},"0 jour"),dF=e("div.small.muted"),fLbl=e("label",{for:"sal-ep"}),fBox=e("div");
 let rf=()=>{B(fBox,ke([["plate","Pièce plate"],["ronde","Pièce ronde"]],st.forme,f=>{st.forme=f;rf();ud()}));fLbl.textContent=st.forme==="ronde"?"Rayon (cm)":"Épaisseur (cm)"};
 function ud(){let v=SalNum(st.ep),d=v?v/2+1:0,ds=d.toLocaleString("fr-FR",{maximumFractionDigits:1});dOut.textContent=v?ds+(d>=2?" jours":" jour"):"—";dF.textContent=v?`${v.toLocaleString("fr-FR")} cm ÷ 2 + 1 = ${ds} j`:"Mesurez la pièce au plus épais.";SalSave(st)}
 rf();ud();
 rp();
 function up(){
  let G=SalNum(st.w)*(st.unit==="kg"?1e3:1),sum=0;
  ings.forEach(([id])=>{let g=G*SalNum(st[id])/100;sum+=g;out[id].textContent=SalFmt(g)});
  tot.textContent=SalFmt(sum)+" g";
  let pr=Math.min(70,SalNum(st.perte)),tg=G*(1-pr/100);target.textContent=SalFmt(tg)+" g";
  let now=SalNum(st.now);
  if(G&&now){let lost=Math.max(0,(G-now)/G*100);gauge.style.left=Math.min(100,lost/60*100)+"%";gw.hidden=!1;
   if(now>G)status.textContent="La pesée du jour dépasse le poids de départ : vérifiez les unités (tout en grammes).";
   else if(lost<pr)status.innerHTML=`<b>${SalFmt(lost)} % de perte</b> · encore ${SalFmt(now-tg)} g à perdre avant l’objectif.`;
   else if(lost<=pr+8)status.innerHTML=`<b style="color:var(--ok)">${SalFmt(lost)} % de perte · objectif atteint.</b> Goûtez une tranche, puis mettez sous vide au frais.`;
   else status.innerHTML=`<b style="color:var(--warn)">${SalFmt(lost)} % de perte · pièce très sèche.</b> Mettez-la sous vide quelques jours pour que l’humidité se répartisse.`}
  else{gw.hidden=!0;status.textContent="Pesez la pièce chaque semaine et notez le poids ici (en grammes)."}
  SalSave(st)
 }
 up();
 return e("div.stack",
  e("div.grid.g-2",
   k({title:"Doses de salaison",sub:"selon le poids de la pièce"},
    e("div.field",e("label",{for:"sal-w"},"Poids de la pièce parée"),e("div.sal-w",wIn,unitBox)),
    e("div",{style:{margin:"14px 0 6px"}},e("div.small.muted",{style:{marginBottom:"6px"}},"Préréglages"),presetBox),
    e("div.sal-res",rows),
    e("div.sal-total",e("span",{style:{fontWeight:600}},"Mélange total"),tot),
    note,
    x("Revenir à 4 / 2 / 1 %",{kind:"ghost",size:"sm",icon:"swap",onClick:()=>{st.preset="maison";ings.forEach(([k2],i)=>{st[k2]=String([4,2,1][i]);pin[k2].value=st[k2]});st.perte="35";pIn.value="35";rp();up()}})),
   k({title:"Suivi du séchage",sub:"poids à atteindre"},
    e("div.row.wrap",{style:{gap:"14px",alignItems:"flex-end"}},e("div.field",e("label",{for:"sal-perte"},"Perte visée (%)"),pIn),e("div",e("div.small.muted","Poids cible"),target)),
    e("hr.sep"),
    e("div.field",e("label",{for:"sal-now"},"Pesée du jour (g)"),nIn),
    gw,SalScale(),
    status,
    e("p.small.muted",{style:{margin:"12px 0 0"}},"Repères : 30 à 35 % pour un magret ou un filet, 35 à 40 % pour un saucisson. Une pièce qui perd trop vite durcit en surface et reste humide au cœur."))),
  k({title:"Durée de salaison",sub:"épaisseur ÷ 2 + 1, en jours"},
   e("div.row.wrap",{style:{gap:"16px",alignItems:"flex-end"}},fBox,e("div.field",fLbl,eIn),e("div",e("div.small.muted","Temps de salaison"),dOut)),
   e("div",{style:{marginTop:"10px"}},dF),
   e("p.small.muted",{style:{margin:"8px 0 0"}},"Pièce plate (magret, filet aplati) : mesurez l’épaisseur. Pièce ronde (noix, filet roulé, jambonneau) : mesurez le rayon. Salaison au réfrigérateur entre 0 et 4 °C, en retournant la pièce chaque jour.")),
  e("div.sal-tip",e("b","Bon à savoir : "),"la salaison à dose fixe ne sale jamais trop, puisque tout le sel pesé est absorbé. Utilisez une balance précise au gramme près, au dixième de gramme pour les petites pièces et les épices.")
 )
}
function SalMeth(){
 let m=[
  {t:"Salaison à dose fixe",s:"à sec, « à l’équilibre »",pour:"Magrets, filets, noix, petits jambons",steps:["Pesez la pièce parée, puis le sel, le sucre et les épices au pourcentage voulu (le calculateur s’en charge).","Frottez la pièce avec tout le mélange et enfermez-la sous vide ou dans un sac zip bien chassé.","Laissez au réfrigérateur entre 0 et 4 °C en retournant chaque jour. Durée : épaisseur en cm ÷ 2 + 1 jours (pour une pièce ronde, prenez le rayon). Un magret de 3 cm demande 2,5 jours, un filet de 6 cm 4 jours.","La pièce est prête quand elle est ferme au toucher sur toute son épaisseur. Rincez rapidement, épongez, puis passez au séchage."],tip:"La méthode la plus sûre pour débuter : le résultat ne dépend pas du temps de contact."},
  {t:"Salaison en excès",s:"au gros sel",pour:"Jambons, magrets à la manière traditionnelle",steps:["Couvrez le fond d’un plat de gros sel, posez la pièce et recouvrez-la entièrement.","Respectez la durée : 12 à 24 h pour un magret, 24 à 48 h pour un filet, environ 1 jour par kilo pour un jambon.","Rincez, épongez soigneusement, poivrez et laissez reposer 24 à 48 h au frais pour que le sel se répartisse.","Passez au séchage."],tip:"Plus rapide, mais un oubli de quelques heures donne une pièce trop salée."},
  {t:"Saumure",s:"salaison humide",pour:"Filets de poisson avant fumage, pièces destinées au fumage à chaud",steps:["Dissolvez 80 à 100 g de sel par litre d’eau froide (saumure à 8–10 %), avec un peu de sucre si vous le souhaitez.","Immergez les filets : 1 à 3 h selon l’épaisseur, au réfrigérateur.","Rincez, épongez et laissez sécher à découvert au frais 6 à 12 h : la surface devient légèrement collante, c’est elle qui accroche la fumée.","Fumez à froid ou à chaud."],tip:"Pour une saumure longue sur une viande, préférez une saumure à l’équilibre calculée sur le poids total eau + viande."},
  {t:"Fumage",s:"à froid ou à chaud",pour:"Truite, saumon, brochet, magret, saucisson",steps:["À froid : fumée sous 25 °C, plusieurs heures. Le produit reste cru et se conserve grâce au sel et au séchage.","À chaud : 60 à 80 °C, le produit cuit en fumant. À consommer comme un plat cuisiné.","Utilisez de la sciure de feuillus non traités (hêtre, chêne, arbres fruitiers), jamais de résineux.","Laissez reposer une nuit au frais avant de trancher."],tip:"Le fumage aromatise mais ne détruit ni la trichine ni les parasites du poisson."}
 ];
 return e("div.grid.g-2",m.map(z=>k({title:z.t,sub:z.s},e("div.small",{style:{marginBottom:"10px"}},e("span.muted","Pour : "),z.pour),e("ol.sal-steps",z.steps.map(s=>e("li",s))),e("div.sal-tip",{style:{marginTop:"12px"}},z.tip))))
}
function SalSech(){
 let probs=[["Croûtage : extérieur dur, cœur mou","Air trop sec ou trop ventilé, séchage trop rapide","Remontez l’humidité, réduisez la ventilation. Mettez la pièce sous vide 1 à 2 semaines au frais pour égaliser."],["Moisissure blanche poudreuse","Fleur normale, souvent recherchée","Rien à faire. Elle protège la pièce et régule le séchage."],["Taches vertes ou bleues","Humidité trop élevée","Essuyez avec un linge imbibé de vinaigre, baissez l’humidité, espacez les pièces."],["Moisissure noire, rose ou poilue","Contamination","Si elle a pénétré la chair, jetez la pièce."],["Odeur aigre, putride, surface gluante","Altération","Jetez sans goûter."],["Pièce qui ne perd pas de poids","Air trop humide ou trop froid","Remontez la température vers 13–15 °C, faites circuler l’air."]];
 return e("div.stack",
  k({title:"Les bonnes conditions"},
   e("div.sal-tiles",
    e("div.sal-tile",e("span","Température"),e("b","10–15 °C"),e("span","idéal vers 12–13 °C")),
    e("div.sal-tile",e("span","Humidité"),e("b","70–80 %"),e("span","hygromètre indispensable")),
    e("div.sal-tile",e("span","Air"),e("b","Léger"),e("span","circulation douce, pas de courant direct")),
    e("div.sal-tile",e("span","Lumière"),e("b","Obscurité"),e("span","à l’abri des insectes")))),
  e("div.grid.g-2",
   k({title:"Pas à pas"},e("ol.sal-steps",
    e("li",e("b","Préparer. "),"Après salaison, rincez, épongez et assaisonnez (poivre, piment d’Espelette, genièvre écrasé, herbes)."),
    e("li",e("b","Envelopper. "),"Torchon propre ou étamine pour un magret, filet à rôti pour un filet ou une noix, boyau naturel pour un saucisson. Notez le poids de départ et la date."),
    e("li",e("b","Étuver (saucisson seulement). "),"2 à 3 jours entre 18 et 24 °C pour lancer la fermentation, puis passez au séchoir."),
    e("li",e("b","Sécher. "),"Suspendez sans que les pièces se touchent. Pesez chaque semaine."),
    e("li",e("b","Affiner. "),"À l’objectif de perte, mettez sous vide au frais une à deux semaines : la texture devient homogène."))),
   k({title:"Où sécher ?"},e("div.sal-prose",
    e("p",e("b","Cave ou cellier : "),"la solution traditionnelle si la température reste stable sous 15 °C. Surveillez l’humidité."),
    e("p",e("b","Réfrigérateur : "),"possible pour un magret dans un torchon, en bas du frigo. L’air y est froid et sec : le séchage est plus long et la croûte plus marquée."),
    e("p",e("b","Cave à vin ou frigo aménagé : "),"le plus régulier. Un petit ventilateur et un humidificateur pilotés par un régulateur donnent des résultats reproductibles."),
    e("p",e("b","Sacs de séchage perméables : "),"ils laissent sortir l’humidité au réfrigérateur sans croûtage. Pratiques pour débuter.")))),
  k({title:"Repères de perte de poids",sub:"poids perdu / poids de départ"},
   e("div.sal-gauge",{style:{marginTop:"4px"}}),SalScale(),
   e("div.sal-meta",{style:{marginTop:"12px"}},e("span",e("b","25–30 % "),"magret tendre"),e("span",e("b","30–35 % "),"magret, filet de cervidé"),e("span",e("b","35–40 % "),"bresaola, saucisson"),e("span",e("b","40 % et plus "),"saucisson sec, jambon"))),
  k({title:"Problèmes courants",flush:!0},e("div.table-wrap",e("table.data",e("thead",e("tr",e("th","Ce que vous voyez"),e("th","Cause probable"),e("th","Que faire"))),e("tbody",probs.map(r=>e("tr",r.map((c,i)=>e("td",i===0?e("b",c):c))))))))
 )
}
var SalF=[
 {t:"Magret de canard séché",cat:"Gibier d’eau",lvl:"Débutant",sal:"épaisseur ÷ 2 + 1 j (≈ 2,5 j) ou 12–24 h au gros sel",sec:"2–3 semaines",perte:"30 %",steps:["Parez le magret en laissant le gras, entaillez légèrement la peau en croisillons.","Salez à dose fixe (3 % de sel, 1 % de sucre) sous vide, ou enfouissez 12 à 24 h dans le gros sel.","Rincez, épongez, couvrez de poivre concassé, éventuellement d’un peu de piment d’Espelette.","Enveloppez dans un torchon et suspendez en cave, ou posez sur une grille en bas du réfrigérateur.","Tranchez finement quand la perte atteint environ 30 %."]},
 {t:"Filet de chevreuil façon bresaola",cat:"Grand gibier",lvl:"Intermédiaire",sal:"épaisseur ÷ 2 + 1 j sous vide (≈ 4 j pour 6 cm)",sec:"3–5 semaines",perte:"35–40 %",steps:["Choisissez une noix ou un filet bien paré, sans membrane ni impact de balle.","Mélangez sel (3 %), sucre (1,5 %), poivre, genièvre écrasé, laurier et thym ; frottez et mettez sous vide.","Retournez chaque jour au réfrigérateur pendant épaisseur en cm ÷ 2 + 1 jours (le calculateur donne la durée), jusqu’à ce que la pièce soit ferme sur toute l’épaisseur.","Rincez, épongez, ficelez ou glissez dans un filet, pesez et suspendez au séchoir.","À l’objectif, affinez une à deux semaines sous vide avant de trancher très fin."]},
 {t:"Noix ou jambon de sanglier",cat:"Grand gibier",lvl:"Avancé",sal:"1 j par kilo (gros sel) ou épaisseur ÷ 2 + 1 j (dose fixe)",sec:"2 à 8 mois selon la taille",perte:"35–40 %",warn:"Jamais sans analyse trichine négative. Le sel, le fumage et la congélation domestique ne détruisent pas la trichine du sanglier.",steps:["Faites analyser la carcasse (trichine) avant toute préparation crue.","Désossez ou gardez une noix isolée : plus la pièce est petite, plus le séchage est sûr pour un premier essai.","Salez, puis laissez reposer 2 à 3 semaines au froid pour que le sel atteigne le cœur.","Lavez, séchez, poivrez, protégez la face non couverte de couenne (saindoux et farine).","Séchez lentement à 12–15 °C en surveillant l’humidité, plusieurs mois pour un jambon entier."]},
 {t:"Saucisson de gibier",cat:"Grand gibier",lvl:"Avancé",sal:"Sel dans la mêlée",sec:"4–6 semaines",perte:"35–40 %",warn:"Sanglier : analyse trichine obligatoire avant toute préparation crue. Le sel nitrité, dosé par le fabricant, protège contre le botulisme dans les longs séchages.",steps:["Préparez 60 à 70 % de viande de gibier et 30 à 40 % de gras de porc dur (bardière, gorge), le tout bien froid.","Hachez gros, ajoutez 26 à 28 g de sel par kilo (de préférence sel nitrité), un peu de sucre, poivre, ail, et un ferment si vous en avez.","Mélangez jusqu’à ce que la mêlée colle, embossez serré dans un boyau naturel, piquez les bulles d’air.","Étuvez 2 à 3 jours entre 18 et 24 °C, puis séchez à 12–15 °C et 70–80 % d’humidité.","Le saucisson est prêt quand il a perdu 35 à 40 % de son poids et qu’il est ferme jusqu’au centre."]},
 {t:"Gravlax de truite ou de saumon",cat:"Poisson",lvl:"Débutant",sal:"24–48 h",sec:"Aucun",perte:"—",warn:"Poisson consommé cru : congelez d’abord 24 h à −20 °C ou 96 h à −18 °C, à cœur. La salaison ne détruit pas les parasites.",steps:["Congelez le filet au préalable (voir l’encadré), puis décongelez-le au réfrigérateur.","Mélangez à parts égales sel et sucre, environ 40 g de chaque pour 500 g de filet, avec poivre et aneth.","Couvrez la chair, filmez, placez sous un poids au réfrigérateur et retournez toutes les 12 h.","Après 24 à 48 h, rincez, épongez, et tranchez finement en biais.","Se conserve 4 à 5 jours au froid, bien emballé."]},
 {t:"Truite fumée à froid",cat:"Poisson",lvl:"Intermédiaire",sal:"1–3 h en saumure",sec:"6–12 h (pellicule)",perte:"10–15 %",warn:"Fumage à froid = poisson cru : congélation préalable obligatoire contre les parasites.",steps:["Levez les filets d’une truite congelée au préalable, retirez les arêtes.","Plongez-les 1 à 2 h dans une saumure à 8–10 % (80 à 100 g de sel par litre).","Rincez, épongez, laissez sécher à découvert au réfrigérateur jusqu’à ce que la surface soit collante.","Fumez sous 25 °C pendant 6 à 12 h avec une sciure de hêtre ou d’arbre fruitier.","Laissez reposer une nuit au frais, sous vide, avant de trancher."]}
];
function SalFiches(){
 let f="tous",list=e("div");
 let cats=[["tous","Toutes"],["gibier","Gibier"],["poisson","Poisson"]];
 let r=()=>B(list,SalF.filter(z=>f==="tous"||(f==="poisson"?z.cat==="Poisson":z.cat!=="Poisson")).map(z=>e("details.sal-fiche",
  e("summary",e("div.row.wrap",{style:{gap:"6px"}},L(z.cat,z.cat==="Poisson"?"fish":"hunt"),L(z.lvl,z.lvl==="Avancé"?"warn":z.lvl==="Débutant"?"ok":"")),e("h3",z.t),
   e("div.sal-meta",e("span",e("b","Salaison : "),z.sal),e("span",e("b","Séchage : "),z.sec),e("span",e("b","Perte : "),z.perte))),
  e("div.sal-fbody",z.warn?e("div.sal-warn",e("b","Sécurité : "),z.warn):null,e("ol.sal-steps",z.steps.map(s=>e("li",s)))))));
 r();
 return e("div.stack",e("div.toolbar",Je(cats,f,v2=>{f=v2;r()})),list)
}
function SalSecu(){
 return e("div.stack",
  e("div.grid.g-2",
   k({title:"Sanglier et trichine",cls:"danger"},e("div.sal-prose",
    e("p","Le sanglier peut porter la trichine, un parasite transmis par la viande. Seule la cuisson à cœur à 71 °C le détruit avec certitude."),
    e("p","La salaison seule, le fumage et la congélation au congélateur domestique ne suffisent pas. Pour toute charcuterie crue (saucisson, jambon, viande fumée ou séchée), faites analyser la carcasse."),
    e("p","L’analyse est obligatoire pour un repas de chasse, un repas associatif ou une vente ; elle est fortement recommandée pour une consommation privée. Renseignez-vous auprès de votre fédération départementale."))),
   k({title:"Poisson cru et parasites",cls:"danger"},e("div.sal-prose",
    e("p","Gravlax, poisson mariné ou fumé à froid restent crus. Congelez-les au préalable : 24 h à −20 °C ou 96 h à −18 °C, à cœur."),
    e("p","Le sel, la marinade au citron ou à l’huile et le fumage à froid ne tuent pas ces parasites. Une cuisson au-delà de 60 °C les détruit."),
    e("p","Vérifiez la température de votre congélateur avec un thermomètre : beaucoup de congélateurs domestiques restent autour de −18 °C.")))),
  k({title:"Sel nitrité",cls:"tint"},e("div.sal-prose",
   e("p","Le sel nitrité est un sel déjà dosé en nitrite par le fabricant. Il garde la couleur rose de la viande et protège contre le botulisme dans les saucissons et les séchages longs."),
   e("p","Respectez la dose indiquée sur le paquet et ne le mélangez pas à du nitrite pur. Rangez-le hors de portée des enfants et étiquetez-le clairement : il ressemble au sel de table."))),
  k({title:"Hygiène et chaîne du froid"},e("ol.sal-steps",
   e("li","Refroidissez le gibier rapidement après la chasse ; pour le sanglier, limitez la maturation à 24–48 h au froid."),
   e("li","N’utilisez que des pièces saines, sans souillure ni zone touchée par la balle."),
   e("li","Travaillez sur un plan propre, avec des ustensiles lavés, et gardez viande et gras au froid jusqu’au dernier moment."),
   e("li","Notez sur chaque pièce la date, le poids de départ et la recette."),
   e("li","Au moindre doute (odeur, texture gluante, moisissure profonde), jetez sans goûter."))),
  e("p.small.muted","Ces conseils s’adressent aux particuliers et ne remplacent pas les règles sanitaires officielles ni l’avis d’un professionnel."),
  k({title:"Sources"},e("ul.small.sal-src",{style:{margin:0,paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"6px"}},
   e("li",e("a",{href:"https://www.anses.fr/fr/content/la-trichinellose",target:"_blank",rel:"noopener"},"ANSES : la trichinellose")),
   e("li",e("a",{href:"https://ancgg.org/wp-content/uploads/2020/09/pr%C3%A9cautions-trichine.pdf",target:"_blank",rel:"noopener"},"ANCGG : précautions trichine")),
   e("li",e("a",{href:"https://www.lhotellerie-restauration.fr/sos-experts/question-reponse/ver-anisakis-peut-on-l-eliminer-dans-un-simple-congelateur-44505",target:"_blank",rel:"noopener"},"L’Hôtellerie-Restauration : anisakis et congélation")),
   e("li",e("a",{href:"https://draaf.auvergne-rhone-alpes.agriculture.gouv.fr/IMG/pdf/rapport_technique_complet_sauci-sans-nitr.pdf",target:"_blank",rel:"noopener"},"DRAAF Auvergne-Rhône-Alpes : fabrication du saucisson sec")))))
}
