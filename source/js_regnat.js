/* ===== Réglementation : règles nationales vérifiées (chasse / pêche) ===== */
var RegNatEl;
function RegNatBox(){return RegNatEl||(RegNatEl=e("div.stack"))}
function RegNatDraw(n){let box=RegNatBox(),D=REG_NAT[n];if(!D)return;W(box);
let host=u=>{try{return new URL(u).hostname.replace(/^www\./,"")}catch(_){return"source"}};
C(box,e("div.panel-head",{style:{marginTop:"22px"}},e("h2",n==="chasse"?"Règles nationales de la chasse":"Règles nationales de la pêche en eau douce"),e("span.sub","Recherchées sur des sources officielles le "+new Date(D.verifiedOn).toLocaleDateString("fr-FR"))));
C(box,e("div.panel.tint",e("div.row",b("info"),e("div.small",n==="peche"?"Le préfet peut relever les tailles minimales et fixer d’autres périodes ou quotas : le tableau par département ci-dessus est indicatif, et l’arrêté préfectoral de votre département fait foi. Les minima nationaux sont rappelés plus bas (brochet 50 cm, sandre 40 cm, black-bass 30 cm, truite 23 cm).":"Dates, plans de chasse et jours de chasse dépendent de l’arrêté préfectoral et du schéma départemental de gestion cynégétique (SDGC) de votre département : le tableau ci-dessus est indicatif. Demandez-les à votre fédération départementale des chasseurs."))));
D.sections.forEach((s,i)=>{let det=e("details",{style:{background:"var(--panel,#fff)",borderRadius:"var(--r,14px)",padding:"2px 16px",border:"1px solid var(--line,#0001)"}});if(i===0)det.open=!0;
C(det,e("summary",{style:{cursor:"pointer",padding:"14px 0",fontWeight:"700",display:"flex",justifyContent:"space-between",gap:"10px"}},e("span",s.title),e("span.tiny.muted",s.items.length+" point"+(s.items.length>1?"s":""))));
s.items.forEach(it=>C(det,e("div",{style:{padding:"10px 0",borderTop:"1px solid var(--line,#0001)"}},
e("div.small",{style:{lineHeight:"1.55"}},it.text),
e("div.row",{style:{gap:"8px",marginTop:"6px",flexWrap:"wrap",alignItems:"center"}},it.confidence==="verifie"?L("Confirmé","accent","check"):L("À vérifier localement","gold"),
it.source?e("a.tiny",{href:it.source,target:"_blank",rel:"noopener noreferrer"},"Source : "+host(it.source)+" ↗"):null))));
C(box,det)});
C(box,e("div.tiny.muted","Les textes officiels (Légifrance, préfectures, fédérations) font foi. Une information signalée « À vérifier localement » dépend du département, du cours d’eau ou d’un arrêté qui change chaque saison."))}

/* ===== fiche départementale (arrêtés préfectoraux et fédérations) ===== */
function RegDeptList(){return Object.keys(REG_DEPT).sort().map(c=>({code:c,name:REG_DEPT[c].n}))}
function RegDeptDraw(n,code,box,qt){W(box);let D=REG_DEPT[code],pad=e("div.stack",{style:{padding:"16px"}});C(box,pad);
const norm=s=>(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,""),host=u=>{try{return new URL(u).hostname.replace(/^www\./,"")}catch(_){return"source"}};
const conf=k=>k?L("Source officielle","accent","check"):L("À vérifier","gold"),src=u=>u?e("a.tiny",{href:u,target:"_blank",rel:"noopener noreferrer"},host(u)+" ↗"):null;
let sec=n==="chasse"?(D&&D.c):(D&&D.p),spec=((sec&&sec.e)||[]).filter(x=>!qt||norm(x.s).includes(norm(qt))),infos=(sec&&sec.i)||[];
C(pad,e("div.row",{style:{justifyContent:"space-between",gap:"8px",flexWrap:"wrap",alignItems:"center"}},e("h3",{style:{margin:0}},D?`${code} · ${D.n}`:`Département ${code}`),sec&&sec.s?L("Saison "+sec.s,"gold"):null));
if(n==="chasse"&&sec){let kv=[];sec.o&&kv.push(["Ouverture générale",sec.o]);sec.f&&kv.push(["Clôture générale",sec.f]);sec.j&&kv.push(["Jours sans chasse",sec.j]);kv.length&&C(pad,rt(kv))}
if(!spec.length&&!infos.length){C(pad,e("div.panel.tint",e("div.row",b("info"),e("div.small",qt?"Aucune espèce ne correspond à votre recherche.":(n==="chasse"?"L’arrêté préfectoral de ce département n’a pas pu être lu pour l’instant. Reportez-vous aux règles nationales ci-dessous et à l’arrêté d’ouverture et de clôture de la préfecture ou de votre fédération des chasseurs.":"La réglementation locale de la pêche n’a pas pu être lue pour ce département. Reportez-vous aux règles nationales ci-dessous (tailles minimales, quotas) et à l’arrêté préfectoral ou à votre fédération de pêche.")))))}
if(spec.length)C(pad,e("div.table-wrap",$e(n==="peche"?[{label:"Espèce",render:x=>e("b",x.s)},{label:"Catégorie",render:x=>x.c||"—"},{label:"Taille min.",num:!0,render:x=>x.z?L(x.z+" cm","fish"):"—"},{label:"Quota/jour",num:!0,render:x=>x.q===0?L("Interdit","danger"):(x.q??"—")},{label:"Période",render:x=>x.p||"—"},{label:"À savoir",render:x=>e("span.small",x.n||"")},{label:"Fiabilité",render:x=>e("div",conf(x.k),src(x.u))}]:[{label:"Espèce",render:x=>e("b",x.s)},{label:"Période",render:x=>e("span.small",x.p||"—")},{label:"Mode",render:x=>e("span.small",x.m||"—")},{label:"À savoir",render:x=>e("span.small",x.n||"")},{label:"Fiabilité",render:x=>e("div",conf(x.k),src(x.u))}],spec)));
if(infos.length&&!qt)C(pad,e("div.stack",e("h4",{style:{margin:"6px 0 0"}},"Règles locales"),...infos.map(x=>e("div",{style:{padding:"8px 0",borderTop:"1px solid var(--line,#0001)"}},e("div.small",{style:{lineHeight:"1.5"}},x.t),e("div.row",{style:{gap:"8px",marginTop:"4px",flexWrap:"wrap",alignItems:"center"}},conf(x.k),src(x.u))))));
let ln=(D&&D.l)||{},links=[];n==="chasse"?(ln.fdc&&links.push(["Fédération des chasseurs",ln.fdc]),ln.arretes&&links.push(["Arrêtés",ln.arretes]),links.push(["Fédérations départementales (FNC)","https://www.chasseurdefrance.com/"])):(ln.peche&&links.push(["Fédération de pêche",ln.peche]),links.push(["Fédérations de pêche","https://www.federationpeche.fr/"]),links.push(["Acheter une carte","https://www.cartedepeche.fr/"]));
C(pad,e("div.row",{style:{gap:"8px",flexWrap:"wrap"}},...links.map(l=>e("a.btn.ghost.sm",{href:l[1],target:"_blank",rel:"noopener noreferrer"},l[0]+" ↗"))))}
