# exécuté par build.py (variables : s, rep, D)
js_sortie=open(D+'js_sortie.js',encoding='utf-8').read()
js_sortie=js_sortie.replace('function TripPillEl(){let a=','function TripPillEl(){try{ProxStart()}catch{}let a=') if 'function TripPillEl(){let a=' in js_sortie else js_sortie.replace('function TripPillEl(){','function TripPillEl(){try{ProxStart()}catch{}',1)
js_tools=open(D+'js_tools.js',encoding='utf-8').read()
js_tools=js_tools.replace('function TExportDlg(q1){','function HasF(f){return((w.user&&w.user.features)||[]).includes(f)}\nfunction TExportDlg(q1){if(!HasF("territory.export"))return j.emit("premium",{error:"L’export GPX / KML / GeoJSON fait partie des offres Premium. Le partage par lien reste gratuit."});',1)
js_qa=open(D+'js_qa.js',encoding='utf-8').read()
js_server=open(D+'js_server.js',encoding='utf-8').read()

# 1) code client avant la table des vues + entrées de la table
rep('var wl,Hi=H(()=>{wl=Ui({', js_sortie+'\n'+js_tools+'\n'+js_qa+'\nvar wl,Hi=H(()=>{wl=Ui({"./views/sortie.js":()=>Promise.resolve().then(()=>(SorI(),SorM)),"./views/qa.js":()=>Promise.resolve().then(()=>(QaI(),QaM)),"./views/eau.js":()=>Promise.resolve().then(()=>(EauI(),EauM)),"./views/share.js":()=>Promise.resolve().then(()=>(ShrI(),ShrM)),')

# 2) serveur : collections + routes
rep('ambassadors:"amb"},Xn=class','ambassadors:"amb",questions:"qst",groups:"grp"},Xn=class')
rep('"announcements","ambassadors"];$i.forEach','"announcements","ambassadors","questions","groups"];$i.forEach')
rep('Be.get("/articles",(t,r)=>{ArtSeed()', js_server+'\nBe.get("/articles",(t,r)=>{ArtSeed()')
rep(r'if(_.territories.count(a=>a.ownerId===t.user.id)>=3)throw new ce(400,"Vous pouvez créer jusqu’à 3 territoires personnels.");'.replace(r'é','é').replace(r'’','’').replace(r'à','à') if False else 'if(_.territories.count(a=>a.ownerId===t.user.id)>=3)throw new ce(400,"Vous pouvez créer jusqu’à 3 territoires personnels.");',
    'if(_.territories.count(a=>a.ownerId===t.user.id)>=3)throw new ce(400,"Vous pouvez créer jusqu’à 3 territoires personnels.");if(t.user.plan==="free"&&_.territories.count(a=>a.ownerId===t.user.id)>=1)throw new ce(402,"L’offre gratuite inclut 1 territoire. Premium : jusqu’à 3 territoires, exports GPX/KML et cartes hors ligne.");')

# 3) offres
rep(r'"map.offline":["chasse","peche","combo"]}', r'"map.offline":["chasse","peche","combo"],"territory.export":["chasse","peche","combo"]}')
rep(r'tagline:"R\xE9seau, messagerie, recettes, annuaire, carte de base"', r'tagline:"S\xE9curit\xE9 (SOS, 30\xB0, Sortie en cours), 1 territoire, entraide, carte de base"')
rep(r'tagline:"Cartes HD, m\xE9t\xE9o d\xE9taill\xE9e, vent, suivi des bracelets"', r'tagline:"Cartes HD, hors ligne, 3 territoires, exports GPX/KML, m\xE9t\xE9o d\xE9taill\xE9e, vent"')
rep(r'tagline:"Bathym\xE9trie, carnet illimit\xE9, statistiques, spots confidentiels"', r'tagline:"Bathym\xE9trie, carnet illimit\xE9, hors ligne, 3 territoires, exports, spots confidentiels"')

# 4) routes, navigation, accès public au partage
rep('Z("/notifications",te("notifications"));','Z("/notifications",te("notifications"));Z("/sortie",te("sortie"));Z("/questions",te("qa"));Z("/groupes",te("qa"));Z("/niveaux-eau",te("eau"));Z("/partage/:data",te("share"));')
rep('.startsWith("/articles"))return ge("/connexion")','.startsWith("/articles")&&!t.startsWith("/partage"))return ge("/connexion")')
rep(r'["/securite","S\xE9curit\xE9 & alertes","shield"]]}', r'["/securite","S\xE9curit\xE9 & alertes","shield"],["/sortie","Sortie en cours","clock"]]}')
rep(r'["/articles","Articles","book"],["/messages","Messagerie","chat","messages"]]', r'["/articles","Articles","book"],["/questions","Entraide & groupes","users"],["/messages","Messagerie","chat","messages"]]')
rep(r'["/reglementation","R\xE9glementation","law"]]}', r'["/reglementation","R\xE9glementation","law"],["/niveaux-eau","Niveaux d’eau","drop"]]}')

# 5) barre du haut : pastille de sortie
rep('e("header.topbar",o,i,e("div.spacer"),a,s)','e("header.topbar",o,i,e("div.spacer"),TripPillEl(),a,s)')

# 6) accueil
rep(r'i=w.user,a=new Date().getHours()', r'i=w.user,mt=(await v.get("/territories").catch(()=>[])).filter(z=>z.kind==="personal").length,a=new Date().getHours()') if False else None
rep(r'let r=w.position,n=await v.get(`/home?lat=${r.lat}&lng=${r.lng}`),i=w.user,', r'let r=w.position,n=await v.get(`/home?lat=${r.lat}&lng=${r.lng}`),mt=(await v.get("/territories").catch(()=>[])).filter(z=>z.kind==="personal").length,i=w.user,')
rep(r',w.season==="chasse"?(IsLaunch()?e("a.c-drive",{href:"#/carte?territoire=1"}', r',e("a.c-sortie",{href:"#/sortie"},b("clock"),e("div",e("b","SORTIE"),e("span","Pr\xE9venir un proche"))),w.season==="chasse"?(IsLaunch()?e("a.c-drive",{href:"#/carte?territoire=1"}')
rep(r'k({},ee(M.num(n.stats.harvests),"Pr\xE9l\xE8vements d\xE9clar\xE9s"))', r'k({},ee(M.num(IsLaunch()?mt:n.stats.harvests),IsLaunch()?"Territoire(s) d\xE9limit\xE9(s)":"Pr\xE9l\xE8vements d\xE9clar\xE9s"))')

# 7) Mes territoires : partager / exporter
rep(r'x("Modifier",{icon:"edit",size:"sm",href:`#/carte?territoire=edit:${q.id}`}),', r'x("Modifier",{icon:"edit",size:"sm",href:`#/carte?territoire=edit:${q.id}`}),x("Partager",{icon:"send",size:"sm",onClick:()=>TShareDlg(q)}),x("Exporter",{icon:"download",size:"sm",onClick:()=>TExportDlg(q)}),')

# 8) calculateur 30° : territoire actif



# 9) calculateur 30° : nouvelle organisation (verdict -> actions -> cadran ; carte / zones / règle en onglets)
j=s.find('async function sa(t)'); a=s.find('C(t,q({title:"Calculateur d',j); b=s.find(';let m=De(u,{zoom:16})',a)
assert 0<j<a<b
skel=r"""let tabsDef=[["map","Carte"],["zones","Zones et voisins"],["rule","Règle des 30°"]],paneMap=e("div",k({flush:!0},u)),paneZ=e("div",{hidden:!0},k({title:"Voisins et zones pris en compte"},p)),paneR=e("div",{hidden:!0},k({cls:"tint",title:"La règle des 30°"},e("p.small",{style:{marginTop:0}},"À son poste, le chasseur ne tire jamais dans un angle de 30° de part et d’autre de la direction de chacun de ses voisins (soit un secteur de 60°)."),e("div.sector-legend",e("span",e("i",{style:{background:"var(--brick)"}}),"Secteur interdit"),e("span",e("i",{style:{background:"#6DB287"}}),"Secteur de tir possible")),e("p.tiny.muted",{style:{marginBottom:0}},"Aide visuelle : elle ne remplace ni les consignes du chef de ligne, ni l’identification de l’arrière-plan (routes, habitations, promeneurs)."))),panes={map:paneMap,zones:paneZ,rule:paneR},tabEl=e("div.seg.a30-tabs",{role:"tablist"},tabsDef.map(([k1,l1])=>e("button",{type:"button",role:"tab",class:k1==="map"?"on":"","data-k":k1,onclick:ev=>{tabEl.querySelectorAll("button").forEach(z=>z.classList.toggle("on",z===ev.currentTarget));Object.entries(panes).forEach(([n1,el])=>el.hidden=n1!==k1);k1==="map"&&setTimeout(()=>{try{m.invalidateSize()}catch{}},60)}},l1)));C(t,q({title:"Calculateur d’angle de 30°",subtitle:"Visez : l’appli vous dit si le tir est interdit vers un voisin ou une zone. Gratuit pour tous."},e("div.a30",e("div.a30-main",d,TerrActiveEl(),k({title:"Point de calcul"},c)),e("div.a30-side",tabEl,paneMap,paneZ,paneR))))"""
s=s[:a]+skel+s[b:]

# E() : verdict + actions + cadran
i0=s.find('function E(){if(W(d)',j); i1=s.find('let P=y=>{let R=y.webkitCompassHeading',i0); assert 0<i0<i1
newE=r"""function E(){if(W(d),!o){C(d,e("div.a30-v.idle",e("div.a30-v-ic",b("target")),e("div.grow",e("b","Calcul en cours…"),e("div.small","Position GPS, puis secteurs interdits."))));return}let y=l!=null&&o.sectors.find(N=>tl(l,N.from,N.to)),R=l==null?e("div.a30-v.idle",e("div.a30-v-ic",b("compass")),e("div.grow",e("b",`${o.sectors.length} secteur(s) interdit(s)`),e("div.small","Activez la boussole puis visez : l’appli indique si la direction est interdite."))):e("div.a30-v."+(y?"stop":"free"),e("div.a30-v-ic",{style:{transform:`rotate(${l}deg)`,transition:"transform .2s"}},b("back")),e("div.grow",e("b",y?"TIR INTERDIT":"SECTEUR LIBRE"),e("div.small",y?`Vous visez vers ${y.label}${y.distance?` (${y.distance} m)`:""}.`:`Cap ${Math.round(l)}° — vérifiez toujours l’arrière-plan.`)));C(d,R,e("div.a30-actions",x("Viseur caméra",{icon:"camera",kind:"primary",onClick:()=>{D();cam(o,()=>l,za)}}),l==null?x("Boussole",{icon:"compass",onClick:D}):x("Ajouter une zone",{icon:"plus",onClick:()=>za((l??0)-15,(l??0)+15)})),cad(o,l),e("p.tiny.muted",{style:{margin:"2px 0 0"}},"Aide visuelle : elle ne remplace ni les consignes du chef de ligne ni l’identification de l’arrière-plan."));o._f!==!!y&&(o._f=!!y,y&&navigator.vibrate&&navigator.vibrate([150,80,150]))}
"""
s=s[:i0]+newE+s[i1:]

# $() : tableau + zones saisies dans l'onglet Zones
rep('function $(){if(W(p)','function $(){$0();o&&C(p,zl())}function $0(){if(W(p)')


# 10) Design 3.0 : accueil carte d'abord
rep(r'actions:[x("Carte terrain",{icon:"map",href:"#/carte",kind:"primary"})]},l,e("div.grid.g-main",{style:{marginTop:"18px"}}', r'},HomeMapEl(),l,e("div.grid.g-main",{style:{marginTop:"18px"}}')

# 11) menus Chasse / Pêche, sorties par activité, réglementations séparées, bouton territoire
rep('IsLaunch()?x("Mon territoire",{icon:"pin",kind:"ghost",size:"sm",onClick:()=>TerrMenu()}):null','IsLaunch()?x("Mon territoire",{icon:"pin",kind:"primary",size:"sm",onClick:()=>TerrMenu()}):null')
# LaunchNav : « Mes territoires » reste dans le menu Chasse
rep('items:g.items.filter(i=>!["/battues","/territoires","/prelevements"].includes(i[0])).flatMap(i=>i[0]==="/carte"?[i,["/territoires","Mes territoires","pin"]]:[i])',
    'items:g.items.filter(i=>!["/battues","/prelevements"].includes(i[0])).map(i=>i[0]==="/territoires"?["/territoires","Mes territoires","pin"]:i)')
# groupes du menu
rep(r'["/securite","S\xE9curit\xE9 & alertes","shield"],["/sortie","Sortie en cours","clock"]]}', r'["/securite","S\xE9curit\xE9 & alertes","shield"]]}')
rep(r'["/angle-30","Calculateur 30\xB0","target"],["/territoires","Territoires & postes","building"],["/prelevements","Pr\xE9l\xE8vements","tag"]]}',
    r'["/angle-30","Calculateur 30\xB0","target"],["/sortie/chasse","Sortie chasse","clock"],["/territoires","Territoires & postes","building"],["/reglementation/chasse","R\xE9glementation chasse","law"],["/prelevements","Pr\xE9l\xE8vements","tag"]]}')
rep(r'["/reglementation","R\xE9glementation","law"],["/niveaux-eau","Niveaux d’eau","drop"]]}',
    r'["/sortie/peche","Sortie p\xEAche","clock"],["/reglementation/peche","R\xE9glementation p\xEAche","law"],["/niveaux-eau","Niveaux d’eau","drop"]]}')
# routes
rep('Z("/sortie",te("sortie"));','Z("/sortie",te("sortie"));Z("/sortie/:act",te("sortie"));Z("/reglementation/:domain",te("regulations"));')
# accueil : tuile SORTIE par saison
rep('e("a.c-sortie",{href:"#/sortie"}','e("a.c-sortie",{href:"#/sortie/"+(w.season==="peche"?"peche":"chasse")}')
# réglementation : une page par activité
rep(r'async function us(t){let r=w.user.department||"41",n=w.season==="chasse"?"chasse":"peche",', r'async function us(t,pa){let r=w.user.department||"41",n=pa&&pa.domain==="chasse"?"chasse":pa&&pa.domain==="peche"?"peche":(w.season==="chasse"?"chasse":"peche"),')
rep(r'C(t,q({title:"R\xE9glementation",subtitle:"Mailles, quotas et p\xE9riodes d\u2019ouverture selon l\u2019endroit o\xF9 vous \xEAtes.",', r'C(t,q({title:n==="chasse"?"R\xE9glementation de la chasse":"R\xE9glementation de la p\xEAche",subtitle:n==="chasse"?"Esp\xE8ces, modes de chasse, p\xE9riodes et plans de chasse selon l\u2019endroit o\xF9 vous \xEAtes.":"Mailles, quotas et p\xE9riodes d\u2019ouverture selon l\u2019endroit o\xF9 vous \xEAtes.",')
rep(r'e("div.toolbar",l,ke([["peche","P\xEAche"],["chasse","Chasse"]],n,p=>{n=p,c()}),xt(', r'e("div.toolbar",l,xt(')


# 12) console admin : graphiques
js_admin=open(D+'js_admin.js',encoding='utf-8').read(); js_admin_srv=open(D+'js_admin_server.js',encoding='utf-8').read()
rep('async function AdmDashFull(t,s0){', js_admin+'\nasync function AdmDashFull(t,s0){')
rep('if(!s.moderator)return AdmDashFull(t,s);','if(!s.moderator)return AdmDashV3(t,s);')
rep('\nxe.get("/admin/users",et(', '\n'+js_admin_srv+'\nxe.get("/admin/users",et(')

rep('function km(t){if(t.user.role','function km(t){AdmSeed();if(t.user.role')

# 13) historique des sorties
js_hist=open(D+'js_hist.js',encoding='utf-8').read()
rep('var wl,Hi=H(()=>{wl=Ui({"./views/sortie.js"', js_hist+'\nvar wl,Hi=H(()=>{wl=Ui({"./views/hist.js":()=>Promise.resolve().then(()=>(HisI(),HisM)),"./views/histd.js":()=>Promise.resolve().then(()=>(HidI(),HidM)),"./views/sortie.js"')
rep('Z("/sortie",te("sortie"));Z("/sortie/:act",te("sortie"));', 'Z("/sortie",te("sortie"));Z("/historique/:act",te("hist"));Z("/sortie-detail/:id",te("histd"));Z("/sortie/:act",te("sortie"));')
rep(r'["/sortie/chasse","Sortie chasse","clock"],', r'["/sortie/chasse","Sortie chasse","clock"],["/historique/chasse","Historique des sorties","book"],')
rep(r'["/sortie/peche","Sortie p\xEAche","clock"],', r'["/sortie/peche","Sortie p\xEAche","clock"],["/historique/peche","Historique des sorties","book"],')
rep('L("Carnet de prises","fish")):null,', 'L("Carnet de prises","fish")):u&&u.kind==="trip"?TripAttach(u):null,')

# 14) amis
js_fr_srv=open(D+'js_friends_server.js',encoding='utf-8').read(); js_fr=open(D+'js_friends.js',encoding='utf-8').read()
rep('questions:"qst",groups:"grp"},Xn=class','questions:"qst",groups:"grp",friendships:"fsh",fstatus:"fst"},Xn=class')
rep('"questions","groups"];$i.forEach','"questions","groups","friendships","fstatus"];$i.forEach')
rep('\nBe.get("/articles",(t,r)=>{ArtSeed()', '\n'+js_fr_srv+'\nBe.get("/articles",(t,r)=>{ArtSeed()')
rep('s=se.posts.all(l=>(!n||n==="tous"||l.activity===n)&&(!i||l.authorId===i));','s=se.posts.all(l=>(!n||n==="tous"||(n==="amis"?!!t.user&&FrIds(t.user.id,!0).includes(l.authorId):l.activity===n))&&(!i||l.authorId===i));')
rep('var wl,Hi=H(()=>{wl=Ui({"./views/hist.js"', js_fr+'\nvar wl,Hi=H(()=>{wl=Ui({"./views/amis.js":()=>Promise.resolve().then(()=>(FriI(),FriM)),"./views/hist.js"')
rep('Z("/sortie",te("sortie"));Z("/historique/:act"','Z("/amis",te("amis"));Z("/sortie",te("sortie"));Z("/historique/:act"')
rep(r'["/communaute","Fil d\u2019actualit\xE9","users"],', r'["/communaute","Fil d\u2019actualit\xE9","users"],["/amis","Amis","heart"],')
rep(':[x("Envoyer un message",{icon:"chat",kind:"primary",onClick:async()=>{let s=await v.post("/conversations",{memberIds:[r]})', ':[FriendBtn(r),x("Envoyer un message",{icon:"chat",kind:"ghost",onClick:async()=>{let s=await v.post("/conversations",{memberIds:[r]})')
rep('["nature","Nature"]],r,d=>{r=d,s()}','["nature","Nature"]].concat(w.user?[["amis","Amis"]]:[]),r,d=>{r=d,s()}')

# 15) suivi en direct
js_lv_srv=open(D+'js_live_server.js',encoding='utf-8').read(); js_lv=open(D+'js_live.js',encoding='utf-8').read()
rep('friendships:"fsh",fstatus:"fst"},Xn=class','friendships:"fsh",fstatus:"fst",livesessions:"liv"},Xn=class')
rep('"friendships","fstatus"];$i.forEach','"friendships","fstatus","livesessions"];$i.forEach')
rep('\nBe.get("/articles",(t,r)=>{ArtSeed()', '\n'+js_lv_srv+'\nBe.get("/articles",(t,r)=>{ArtSeed()')
rep('var wl,Hi=H(()=>{wl=Ui({"./views/amis.js"', js_lv+'\nvar wl,Hi=H(()=>{wl=Ui({"./views/suivi.js":()=>Promise.resolve().then(()=>(LivI(),LivM)),"./views/amis.js"')
rep('Z("/amis",te("amis"));','Z("/amis",te("amis"));Z("/suivi",te("suivi"));')
rep(r'["/securite","S\xE9curit\xE9 & alertes","shield"]]}', r'["/securite","S\xE9curit\xE9 & alertes","shield"],["/suivi","Suivi en direct","locate"]]}')

# 16) messagerie refondue
js_msg=open(D+'js_msg.js',encoding='utf-8').read()
rep('var wl,Hi=H(()=>{wl=Ui({"./views/suivi.js"', js_msg+'\nvar wl,Hi=H(()=>{wl=Ui({"./views/suivi.js"')
rep('"./views/messages.js":()=>Promise.resolve().then(()=>(Va(),Na))','"./views/messages.js":()=>Promise.resolve().then(()=>(MsgI(),MsgM))')

# 17) YouTube Data API : synchronisation des vidéos d'ambassadeurs
js_yt=open(D+'js_yt.js',encoding='utf-8').read()
js_yt_server=open(D+'js_yt_server.js',encoding='utf-8').read()
rep('xe.delete("/admin/ambassadors/:id/videos/:vid"', js_yt_server+'\nxe.delete("/admin/ambassadors/:id/videos/:vid"')
rep('async function AdmAmb(t){', js_yt+'\nasync function AdmAmb(t){')
rep('e("div.stack",full.map(a=>k({},e("div.row"', 'e("div.stack",YtPanel(d.ambassadors),full.map(a=>k({},e("div.row"')
rep('x("Ajouter une vidéo",{icon:"plus",size:"sm",onClick:()=>addV(a)}),', 'x("Ajouter une vidéo",{icon:"plus",size:"sm",onClick:()=>addV(a)}),YT.key()?x("Synchroniser",{icon:"play",size:"sm",kind:"ghost",onClick:()=>act(()=>YT.sync(a),"Vidéos synchronisées.")}):null,')

# 18) Viseur 30° guidé (gauche / droite / résultat)
js_ang30=open(D+'js_ang30.js',encoding='utf-8').read()
rep('var wl,Hi=H(()=>{wl=Ui({', js_ang30+'\nvar wl,Hi=H(()=>{wl=Ui({"./views/ang30.js":()=>Promise.resolve().then(()=>(A30I(),A30M)),')
rep('Z("/angle-30",te("angle30"));','Z("/angle-30",te("ang30"));Z("/angle-30-carte",te("angle30"));')
rep(r'["/angle-30","Calculateur 30\xB0","target"]', r'["/angle-30","Viseur 30\xB0","target"],["/angle-30-carte","Calculateur 30\xB0 (carte)","map"]')
