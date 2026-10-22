var SalPresets=[
 {id:"maison",label:"Ma recette",sel:4,sucre:2,poivre:1,perte:35,nit:"0",note:"Votre dosage : 4 % de sel, 2 % de sucre, 1 % de poivre. C’est un dosage salé pour une salaison à dose fixe : la plupart des recettes visent 2,5 à 3 % de sel."},
 {id:"magret",label:"Magret",sel:2.8,sucre:1,poivre:.5,perte:30,nit:"0",note:"Magret de canard ou d’oie : 2,5 à 3 % de sel, sous vide (environ 2,5 jours pour 3 cm), puis 2 à 3 semaines de séchage. Le sel nitrité est facultatif pour un séchage aussi court."},
 {id:"filet",label:"Filet de cervidé",sel:2.8,sucre:1,poivre:.3,perte:38,nit:"1",note:"Chevreuil, biche, cerf façon bresaola : 2,5 à 3 % de sel dont une part de sel nitrité, car le séchage dure 3 à 5 semaines. Genièvre, laurier, thym : 0,2 à 0,5 % au goût."},
 {id:"noix",label:"Noix de sanglier",sel:3,sucre:.5,poivre:.4,perte:35,nit:"1",note:"Noix, épaule roulée ou « coppa » de sanglier : 3 % de sel avec sel nitrité, séchage de plusieurs semaines. Analyse trichine obligatoire avant toute préparation crue."},
 {id:"saucisson",label:"Saucisson",sel:2.6,sucre:.4,poivre:.3,perte:38,nit:"1",note:"Mêlée gibier + gras de porc : 26 g de sel par kilo de mêlée dont 20 g de sel nitrité au plus, 3 à 5 g de dextrose (ou de sucre) pour la fermentation, 3 g de poivre."}];
/* Nitrite : depuis le 9 octobre 2025, 80 mg/kg au plus, exprimés en ion nitrite (règlement UE 2023/2108),
   soit environ 120 mg de nitrite de sodium : 20 g de sel nitrité à 0,6 % par kilo. Le reste du sel en sel fin. */
var SalNitMax=80;
function SalNitPerKg(pct){let p=SalNum(pct)||.6;return SalNitMax/.667/(p*10)}
function SalCalc(st){
 let ings=[["sel","Sel","var(--muted)"],["sucre","Sucre ou dextrose","var(--gold)"],["poivre","Poivre","var(--text)"]],out={},pin={};
 let wIn=e("input.input",{id:"sal-w",type:"number",inputmode:"decimal",min:"0",step:"any",value:st.w,"aria-label":"Poids de la pièce",oninput:z=>{st.w=z.target.value;up()}});
 let unitBox=e("div");
 let ru=()=>B(unitBox,ke([["kg","kg"],["g","g"]],st.unit,u=>{if(u===st.unit)return;let v=SalNum(wIn.value);if(v)wIn.value=u==="g"?String(Math.round(v*1e3)):String(+(v/1e3).toFixed(3));st.w=wIn.value;st.unit=u;up()}));
 ru();
 let rows=ings.map(([id,lbl,col])=>{out[id]=e("span","0");pin[id]=e("input",{id:"sal-p-"+id,type:"number",inputmode:"decimal",step:"0.1",min:"0",value:st[id],"aria-label":"Pourcentage de "+lbl.toLowerCase(),oninput:z=>{st[id]=z.target.value;st.preset="";rp();up()}});return e("div.sal-row",e("span.sal-dot",{style:{background:col}}),e("div",e("b",lbl),e("span.sal-pct",pin[id],"%")),e("div.sal-g",out[id],e("small","g")))});
 /* sel nitrité : part du sel */
 let nitG=e("span","0"),finG=e("span","0"),nitInfo=e("p.small",{style:{margin:"6px 0 0"}}),nitBox=e("div"),nitRows=e("div.sal-sub");
 let pctIn=e("input",{id:"sal-nitpct",type:"number",inputmode:"decimal",step:"0.1",min:"0.1",value:st.nitPct,"aria-label":"Teneur en nitrite du sel nitrité",oninput:z=>{st.nitPct=z.target.value;up()}});
 C(nitRows,
  e("div.sal-row",e("span.sal-dot",{style:{background:"var(--brick)"}}),e("div",e("b","dont sel nitrité"),e("span.sal-pct","teneur ",pctIn,"% (voir le paquet)")),e("div.sal-g",nitG,e("small","g"))),
  e("div.sal-row",e("span.sal-dot",{style:{background:"var(--muted)"}}),e("div",e("b","dont sel fin"),e("span.sal-pct","pour compléter le sel")),e("div.sal-g",finG,e("small","g"))),
  nitInfo);
 let rn=()=>{B(nitBox,ke([["0","Sel fin seul"],["1","Avec sel nitrité"]],st.nit,v=>{st.nit=v;rn();up()}));nitRows.hidden=st.nit!=="1"};
 rn();
 let tot=e("b","0 g"),note=e("p.small.muted",{style:{margin:"10px 0 0"}}),chk=e("div.sal-chk");
 let presetBox=e("div");
 let rp=()=>{B(presetBox,Je(SalPresets.map(p=>[p.id,p.label]),st.preset,id=>{let p=SalPresets.find(z=>z.id===id);if(!p)return;st.preset=id;ings.forEach(([k2])=>{st[k2]=String(p[k2]);pin[k2].value=st[k2]});st.perte=String(p.perte);pIn.value=st.perte;st.nit=p.nit;rn();rp();up()}));let p=SalPresets.find(z=>z.id===st.preset);note.textContent=p?p.note:"Dosage personnalisé."};
 let pIn=e("input.input",{id:"sal-perte",type:"number",inputmode:"decimal",min:"0",max:"70",step:"1",value:st.perte,style:{width:"90px"},oninput:z=>{st.perte=z.target.value;up()}});
 let nIn=e("input.input",{id:"sal-now",type:"number",inputmode:"decimal",min:"0",step:"any",placeholder:"ex. 1 050",value:st.now,oninput:z=>{st.now=z.target.value;up()}});
 let target=e("b.display",{style:{fontSize:"34px",lineHeight:"1"}},"0 g"),gauge=e("i",{style:{left:"0%"}}),gw=e("div.sal-gauge",gauge),status=e("div.small",{style:{minHeight:"22px"}});
 let eIn=e("input.input",{id:"sal-ep",type:"number",inputmode:"decimal",min:"0",step:"0.5",value:st.ep,style:{width:"110px"},oninput:z=>{st.ep=z.target.value;ud()}});
 let dOut=e("b.display",{style:{fontSize:"34px",lineHeight:"1"}},"0 jour"),dF=e("div.small.muted"),fLbl=e("label",{for:"sal-ep"}),fBox=e("div");
 let rf=()=>{B(fBox,ke([["plate","Pièce plate"],["ronde","Pièce ronde"]],st.forme,f=>{st.forme=f;rf();ud()}));fLbl.textContent=st.forme==="ronde"?"Rayon (cm)":"Épaisseur (cm)"};
 function ud(){let v=SalNum(st.ep),d=v?v/2+1:0,ds=d.toLocaleString("fr-FR",{maximumFractionDigits:1});dOut.textContent=v?ds+(d>=2?" jours":" jour"):"—";dF.textContent=v?`${v.toLocaleString("fr-FR")} cm ÷ 2 + 1 = ${ds} j au minimum`:"Mesurez la pièce au plus épais.";SalSave(st)}
 rf();ud();
 rp();
 function up(){
  let G=SalNum(st.w)*(st.unit==="kg"?1e3:1),sum=0;
  ings.forEach(([id])=>{let g=G*SalNum(st[id])/100;sum+=g;out[id].textContent=SalFmt(g)});
  tot.textContent=SalFmt(sum)+" g";
  /* sel nitrité */
  let salt=G*SalNum(st.sel)/100,pct=SalNum(st.nitPct)||.6,perKg=SalNitPerKg(pct),ng=Math.min(salt,G/1e3*perKg),fg=Math.max(0,salt-ng);
  nitG.textContent=SalFmt(ng);finG.textContent=SalFmt(fg);
  let ion=G?ng/(G/1e3)*pct*10*.667:0;
  nitInfo.innerHTML=G?`Nitrite apporté : <b>${Math.round(ion)} mg/kg</b> (en ion nitrite), pour ${SalNitMax} mg/kg au plus. Soit ${SalFmt(perKg)} g de sel nitrité à ${String(pct).replace(".",",")} % par kilo au maximum.`:"Indiquez le poids de la pièce.";
  /* contrôle du dosage */
  let s=SalNum(st.sel),pr=Math.min(70,SalNum(st.perte)),fin=s&&pr<100?s/(1-pr/100):0,msg="",cls="";
  if(!s){msg="Indiquez un pourcentage de sel.";cls=""}
  else if(s<2){msg=`Moins de 2 % de sel : la pièce n’est pas assez protégée pour un séchage. Restez entre 2,5 et 3 %.`;cls="bad"}
  else if(s<2.5){msg=`${SalFmt(s)} % : dosage doux, réservé aux pièces fines séchées peu de temps (magret). Environ ${SalFmt(fin)} % de sel dans la pièce finie.`;cls="mid"}
  else if(s<=3.2){msg=`${SalFmt(s)} % : dosage classique. Environ ${SalFmt(fin)} % de sel dans la pièce finie, une fois ${SalFmt(pr)} % d’eau perdus.`;cls="ok"}
  else if(s<=3.5){msg=`${SalFmt(s)} % : bien salé. Environ ${SalFmt(fin)} % de sel dans la pièce finie.`;cls="mid"}
  else{msg=`${SalFmt(s)} % : très salé pour une salaison à dose fixe. Le sel se concentre au séchage : environ ${SalFmt(fin)} % dans la pièce finie. La plupart des recettes visent 2,5 à 3 %.`;cls="bad"}
  chk.className="sal-chk "+cls;chk.textContent=msg;
  if(st.nit!=="1"&&s&&pr>=35)chk.textContent+=" Pour un séchage de plusieurs semaines, une part de sel nitrité est conseillée.";
  let tg=G*(1-pr/100);target.textContent=SalFmt(tg)+" g";
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
   k({title:"Doses de salaison",sub:"en % du poids de la pièce parée"},
    e("div.field",e("label",{for:"sal-w"},"Poids de la pièce parée"),e("div.sal-w",wIn,unitBox)),
    e("div",{style:{margin:"14px 0 6px"}},e("div.small.muted",{style:{marginBottom:"6px"}},"Préréglages"),presetBox),
    e("div.sal-res",rows),
    e("div",{style:{margin:"6px 0 4px"}},nitBox),
    nitRows,
    e("div.sal-total",e("span",{style:{fontWeight:600}},"Mélange total"),tot),
    chk,
    note,
    x("Revenir à 4 / 2 / 1 %",{kind:"ghost",size:"sm",icon:"swap",onClick:()=>{st.preset="maison";ings.forEach(([k2],i)=>{st[k2]=String([4,2,1][i]);pin[k2].value=st[k2]});st.perte="35";pIn.value="35";st.nit="0";rn();rp();up()}})),
   k({title:"Suivi du séchage",sub:"poids à atteindre"},
    e("div.row.wrap",{style:{gap:"14px",alignItems:"flex-end"}},e("div.field",e("label",{for:"sal-perte"},"Perte visée (%)"),pIn),e("div",e("div.small.muted","Poids cible"),target)),
    e("hr.sep"),
    e("div.field",e("label",{for:"sal-now"},"Pesée du jour (g)"),nIn),
    gw,SalScale(),
    status,
    e("p.small.muted",{style:{margin:"12px 0 0"}},"Repères : 30 % pour un magret, 35 à 40 % pour un filet ou une noix, 35 à 40 % pour un saucisson. Une pièce qui perd trop vite durcit en surface et reste humide au cœur."))),
  e("div.grid.g-2",
   k({title:"Durée de salaison",sub:"à dose fixe : épaisseur ÷ 2 + 1, en jours"},
    e("div.row.wrap",{style:{gap:"16px",alignItems:"flex-end"}},fBox,e("div.field",fLbl,eIn),e("div",e("div.small.muted","Temps de salaison"),dOut)),
    e("div",{style:{marginTop:"10px"}},dF),
    e("p.small.muted",{style:{margin:"8px 0 0"}},"Pièce plate (magret, filet aplati) : mesurez l’épaisseur. Pièce ronde (noix, filet roulé) : mesurez le rayon. Au réfrigérateur entre 0 et 4 °C, en retournant chaque jour. À dose fixe, quelques jours de plus ne salent pas davantage : dans le doute, prolongez jusqu’à ce que la pièce soit ferme à cœur.")),
   k({title:"Saumure",sub:"poisson avant fumage, pièces à fumer"},SalBrine(st))),
  e("div.sal-tip",e("b","Bon à savoir : "),"la salaison à dose fixe ne sale jamais trop, puisque tout le sel pesé est absorbé. Pesez au gramme près, et au dixième de gramme pour le sel nitrité, les épices et les petites pièces.")
 )
}
function SalBrine(st){
 let box=e("div"),res=e("div"),mBox=e("div");
 let num=(id,lbl,key,step,w)=>{let i=e("input.input",{id,type:"number",inputmode:"decimal",min:"0",step,value:st[key],style:{width:w||"110px"},oninput:z=>{st[key]=z.target.value;calc()}});return e("div.field",e("label",{for:id},lbl),i)};
 let draw=()=>{
  B(mBox,ke([["litre","Saumure rapide"],["equi","À l’équilibre"]],st.bm,v=>{st.bm=v;draw()}));
  W(box);
  if(st.bm==="equi")C(box,e("div.row.wrap",{style:{gap:"12px",alignItems:"flex-end"}},num("sal-bw","Eau (litres)","bw","0.1"),num("sal-bv","Viande ou poisson (g)","bv","10","140px"),num("sal-bp","Sel visé (%)","bep","0.1","90px")),
   e("p.small.muted",{style:{margin:"8px 0 0"}},"Le sel est calculé sur le poids total eau + pièce : la pièce ne peut pas devenir plus salée que la saumure. Laissez plusieurs jours au réfrigérateur, sans risque d’excès."));
  else C(box,e("div.row.wrap",{style:{gap:"12px",alignItems:"flex-end"}},num("sal-bw","Eau (litres)","bw","0.1"),num("sal-bp2","Saumure (%)","bp","0.5","90px")),
   e("p.small.muted",{style:{margin:"8px 0 0"}},"8 à 10 % (80 à 100 g par litre) pour des filets de poisson : 1 à 2 h pour une truite, 2 à 3 h pour un filet épais, au réfrigérateur. Le temps compte : ne l’oubliez pas."));
  C(box,res);calc();
 };
 let calc=()=>{
  let L=SalNum(st.bw),sel,suc,txt;
  if(st.bm==="equi"){let tot=L*1e3+SalNum(st.bv),p=SalNum(st.bep);sel=tot*p/100;suc=tot*.5/100;txt=`pour ${SalFmt(tot)} g d’eau et de pièce`}
  else{sel=L*SalNum(st.bp)*10;suc=sel/4;txt=`dans ${String(L||0).replace(".",",")} L d’eau froide`}
  B(res,e("div.sal-total",{style:{marginTop:"12px"}},e("span",{style:{fontWeight:600}},"Sel"),e("b",SalFmt(sel)+" g")),
   e("p.small.muted",{style:{margin:"6px 0 0"}},txt+" · sucre facultatif : "+SalFmt(suc)+" g."));
  SalSave(st);
 };
 draw();
 return e("div",e("div",{style:{marginBottom:"10px"}},mBox),box);
}
