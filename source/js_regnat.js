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
