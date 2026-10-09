# 40) Gestion de territoire (territoires gérés, chasses, plan de chasse, vie du groupe) — exécuté par patches.py
_gx_srv=open(D+'js_gestion_server.js',encoding='utf-8').read()
_gx_cli=open(D+'js_gestion.js',encoding='utf-8').read()
rep('huntads:"hda",terrshares:"tsh"},Xn=class','huntads:"hda",terrshares:"tsh",gestion:"gst",huntgx:"hgx",gxreqs:"gxr"},Xn=class')
rep('"huntads","terrshares"];$i.forEach','"huntads","terrshares","gestion","huntgx","gxreqs"];$i.forEach')
rep('\nBe.get("/articles",(t,r)=>{ArtSeed()', '\n'+_gx_srv+'\nBe.get("/articles",(t,r)=>{ArtSeed()')
rep('var wl,Hi=H(()=>{wl=Ui({', _gx_cli+'\nvar wl,Hi=H(()=>{wl=Ui({"./views/gestion.js":()=>Promise.resolve().then(()=>(GxI(),GxM)),')
rep('Z("/bourse",te("market"));','Z("/bourse",te("market"));Z("/gestion",te("gestion"));')
# pages de gestion accessibles (le reste du mode lancement est conservé)
rep('if(IsLaunch()&&/^\\/(battues|prelevements|pro)(\\/|$)|^\\/territoires\\//.test(t))return ge("/carte");','')
# menu Chasse : « Gestion de territoire » sous « Mes territoires »
rep('.map(i=>i[0]==="/territoires"?["/territoires","Mes territoires","pin"]:i)','.flatMap(i=>i[0]==="/territoires"?[["/territoires","Mes territoires","pin"],["/gestion","Gestion de territoire","users"]]:[i])')
# offre Premium
rep('"map.offline":"chasse peche combo".split(" ")};','"map.offline":"chasse peche combo".split(" "),"territory.manage":["chasse","combo"]};')
# page du territoire géré : onglets supplémentaires, calques, plan de chasse
rep(r'Ne([["postes","Postes"],["membres","Membres"],["plan","Plan de chasse & bracelets"],["battues","Chasses"],["annonces","Annonces"],["reglement","R\xE8glement"]],a,',
    r'Ne([["postes","Postes"],["carte","Carte & gibier"],["membres","Membres"],["plan","Plan de chasse & bracelets"],["battues","Chasses"],["groupe","Vie du groupe"],["annonces","Annonces"],["reglement","R\xE8glement"],["bail","Bail & acc\xE8s"]],a,')
rep('async function Ss(t,{id:r}){let n=window.L,i=await v.get(`/territories/${r}`),a="postes"','async function Ss(t,{id:r}){let n=window.L,i=await v.get(`/territories/${r}`),a=(i.kind==="personal"&&setTimeout(()=>ge("/territoires"),0),"postes")')
rep('function T(){m(),W(o);let E=i.isManager;if(a==="postes")','function T(){m(),W(o);GxLayers(d,i,a);let E=i.isManager;if(GxTab(a,o,i,d,S))return;if(a==="postes")')
rep('k({title:"Bracelets"},P)),v.get(`/territories/${i.id}/tags`)','GxPlanExtra(i,S),k({title:"Bracelets"},P)),v.get(`/territories/${i.id}/tags`)')
rep(r'Fi=[["manager","Responsable"],["chasseur","Chasseur"],["traqueur","Traqueur"],["garde","Garde-chasse"]]', r'Fi=[["manager","Responsable"],["chefligne","Chef de ligne"],["chasseur","Chasseur"],["traqueur","Traqueur"],["garde","Garde-chasse"],["invite","Invit\xE9"]]')
rep(r'if(n.members.some(s=>s.userId===i.id))throw new ce(409,"Cette personne est d\xE9j\xE0 membre.");', r'if(n.members.some(s=>s.userId===i.id))throw new ce(409,"Cette personne est d\xE9j\xE0 membre.");if(!n.b2bPlan&&n.members.length>=10)throw new ce(402,"Offre Premium : 10 membres maximum par territoire g\xE9r\xE9. Passez \xE0 l’offre Soci\xE9t\xE9 de chasse / ACCA pour un nombre illimit\xE9.",{feature:"territory.b2b"});')
# page d'une chasse : présence, tirage au sort, suivi en direct, gibier blessé, bilan
rep('function R(){if(W(c),!i.me)return;','function R(){if(W(c),GxHuntExtras(c,i,T,async()=>{i=await v.get(`/hunts/${r}`);y();P();R();N()}),!i.me)return;')
rep(r'C(t,q({title:i.name,subtitle:`${i.type} \xB7 ${i.city} \xB7 ${M.num(i.surface)} ha`', r'C(t,q({title:i.name,subtitle:[i.type,i.city,M.num(i.surface)+" ha"].filter(Boolean).join(" \xB7 ")')
