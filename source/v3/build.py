import re,os,json,sys
sys.path.insert(0,os.path.dirname(__file__))
from cssfilter import filt
B='/tmp/claude-0/-home-claude/5dee9c6a-b1c6-50c2-87dc-d15a837078d6/scratchpad/'
src=open(B+'v2/source.html').read()
blocks={}
def grab(pat):
    m=re.search(pat,src,re.S); assert m,pat; return m.group(1)
leaflet_css=grab(r'<style>(\.leaflet-pane.*?)</style>')
app_css=open(B+'v2/app.css').read()
ux70=grab(r'<style id="ux70">(.*?)</style>')
logo=grab(r'(<template id="logo-tpl">.*?</template>)')
logo='<template id="logo-tpl"><img src="data:image/png;base64,'+open(B+'logo3/b64_96.txt').read()+'" alt="" width="96" height="96"></template>'
bundle=open(B+'v2/bundle.js').read()
from ang30 import patch_ang30
bundle=patch_ang30(bundle)
datas={i:grab(r'<script type="application/json" id="'+i+r'">(.*?)</script>') for i in ['d-regdept','d-regnat','d-sang']}
saison=grab(r'<script>\s*(\(function\(\)\{try\{var o=JSON\.parse\(localStorage\.getItem\("cp360\.saison".*?)</script>')

def rep(s,old,new,count=1):
    n=s.count(old)
    assert n==count,(old[:80],n)
    return s.replace(old,new)
def cut(s,start,end,new):
    i=s.find(start); assert i>=0,start
    j=s.find(end,i); assert j>=0,end
    return s[:i]+new+s[j:]

# salaison : dosages affinés (sel nitrité, contrôle du dosage, saumure)
bundle=cut(bundle,'var SalPresets=','var ArtAct=',open(B+'v3/sal3.js').read())
bundle=rep(bundle,'preset:"maison",ep:"4",forme:"plate"}','preset:"maison",ep:"4",forme:"plate",nit:"0",nitPct:"0.6",bm:"litre",bw:"1",bp:"9",bv:"1000",bep:"3"}')
bundle=rep(bundle,'if(!w.user&&t!=="/connexion"&&t!=="/communaute"&&','if(!w.user&&t!=="/connexion"&&t!=="/communaute"&&!/^\\/(mentions-legales|cgu|confidentialite|aide|charte-ambassadeur)$/.test(t)&&')
bundle=rep(bundle,'!/^\\/(admin|articles|securite|ambassadeurs|communaute|profil)/.test(t)','!/^\\/(admin|articles|securite|ambassadeurs|communaute|profil|mentions-legales|cgu|confidentialite|aide|charte-ambassadeur)/.test(t)')
bundle=rep(bundle,'onsubmit:async f=>{if(f.preventDefault(),p.hidden=!0,!!d.validate()){','onsubmit:async f=>{if(f.preventDefault(),p.hidden=!0,!!d.validate()&&(s==="login"||S3ConsentOk(f.target))){')
bundle=rep(bundle,'},p,d.el,m)','},p,d.el,s==="login"?null:S3ConsentEl(),m)')
# mesure d'audience : refus possible
bundle=rep(bundle,'function track(kind){if(!on())return;','function track(kind){if(!on())return;try{if(localStorage.getItem("cp360.noTrack")==="1")return}catch{}')
bundle=rep(bundle,'e("article.panel.post",e("div.post-head",oe(t.author,44),e("div.grow",e("a",{href:`#/profil/${t.author.id}`','e("article.panel.post",{dataset:{pid:t.id||""}},e("div.post-head",oe(t.author,44),e("div.grow",e("a",{href:`#/profil/${t.author.id}`')
shell=open(B+'v3/feat3.js').read()+'\n'+open(B+'v3/shell3.js').read()+'\n'+open(B+'v3/amb3.js').read()+'\n'+open(B+'v3/album3.js').read()+'\n'+open(B+'v3/share3.js').read()+'\n'+open(B+'v3/shorts3.js').read()+'\n'+open(B+'v3/post3.js').read()+'\n'+open(B+'v3/login3.js').read()+'\n'+open(B+'v3/notif3.js').read()+'\n'+open(B+'v3/offline3.js').read()+'\n'+open(B+'v3/launch3.js').read()+'\n'+open(B+'v3/legal3.js').read()+'\n'+open(B+'v3/pages3.js').read()+'\n'+open(B+'v3/ops3.js').read()+'\n'+open(B+'v3/mod3.js').read()+'\n'+open(B+'v3/photo30.js').read()+'\n'+open(B+'v3/qr3.js').read()+'\n'+open(B+'v3/media3.js').read()+'\n'+open(B+'v3/part3.js').read()+'\n'+open(B+'v3/flyer3.js').read()+'\n'+open(B+'v3/aud3.js').read()
home=open(B+'v3/home3.js').read()
# 0b. publications : photo/vidéo depuis le téléphone, lecteur vidéo dans le fil
bundle=rep(bundle,'accept:"image/*",capture:"environment",hidden:!0,onchange:async F=>{let $=F.target.files[0];$&&(p(await Gr($)),S())}','accept:l.video?"image/*,video/*":"image/*",hidden:!0,onchange:async F=>{let $=F.target.files[0];$&&(p(await S3PhotoPick($,Gr)),S())}')
bundle=rep(bundle,'{name:"photo",label:"Photo",type:"photo"}],onSubmit:async d=>{if(!d.text||!d.text.trim())','{name:"photo",label:"Photo",type:"photo",video:!0}],onSubmit:async d=>{if(!d.text||!d.text.trim())')
bundle=rep(bundle,'t.photo?e("div.photo",e("img",{src:t.photo,alt:"",loading:"eager"})):null','t.photo?e("div.photo",S3Media(t.photo,"",!1)):null')
# Photos hors de la base : conversion juste avant l'envoi au serveur
bundle=rep(bundle,'if(ups.length){for(let i=0;i<ups.length;i+=40){','for(const x of ups){try{if(window.cp360Media){const nr=await window.cp360Media(n,x[2],Ut[n]&&Ut[n].items.get(x[1]));if(nr!==x[2]){q.get(x[0])===x[2]&&q.set(x[0],nr);x[2]=nr}}}catch{}}if(ups.length){for(let i=0;i<ups.length;i+=40){')
# Relecture complète toutes les 30 min au lieu de 3 min (les changements arrivent toujours toutes les 20 s)
bundle=rep(bundle,'const full=tick%9===0','const full=tick%90===0')
# Partenaires : fiches et marques de démonstration masquées en ligne, logo dans l'annuaire
DEMO='!(typeof S3PartReal=="function"&&S3PartReal()&&S3PartIsDemo(%s))'
bundle=rep(bundle,'let T=$=>G.directory.insert({partner:!1,offer:null,rating:4.5,...$})','let T=$=>G.directory.insert({partner:!1,offer:null,rating:4.5,demo:!0,...$})')
bundle=rep(bundle,'G.partners.insert({name:','G.partners.insert({demo:!0,name:',count=4)
bundle=rep(bundle,'l=be.directory.all(u=>(!n||n==="tous"||u.category===n)&&(!i||In(u.name+" "+u.city).includes(In(i))))','l=be.directory.all(u=>(!n||n==="tous"||u.category===n)&&(!i||In(u.name+" "+u.city).includes(In(i)))&&'+DEMO%'u'+')')
bundle=rep(bundle,'n.sponsor?k({cls:"tint"}','n.sponsor&&'+DEMO%'n'+'?k({cls:"tint"}')
bundle=rep(bundle,'o=z.partners.all()','o=z.partners.all(p=>'+DEMO%'p'+')')
bundle=rep(bundle,'e("span.ic",{style:{color:c.partner?"var(--gold)":null}},b("store"))','c.logo?e("img.dir-logo",{src:c.logo,alt:"",loading:"lazy"}):e("span.ic",{style:{color:c.partner?"var(--gold)":null}},b("store"))')
# Fil : pages de 10, page suivante chargée automatiquement en arrivant en bas
bundle=rep(bundle,'let o=s.slice(0,15),nx=s.length>15?o[o.length-1].createdAt:null','let o=s.slice(0,10),nx=s.length>10?o[o.length-1].createdAt:null')
bundle=rep(bundle,'B(a,n?x("Voir plus",{kind:"ghost",onClick:()=>s(!1)}):null)','B(a,n?x("Voir plus",{kind:"ghost",onClick:()=>s(!1)}):null),n&&typeof S3AutoMore=="function"&&S3AutoMore(a,()=>s(!1))')
bundle=rep(bundle,'e("img",{src:n[l.name],alt:"Aper\\xE7u"})','S3Media(n[l.name],"Aper\\xE7u")')
bundle=rep(bundle,'T=e("input",{type:"file",accept:l.video?"image/*,video/*":"image/*",hidden:!0,onchange:async F=>{let $=F.target.files[0];$&&(p(await S3PhotoPick($,Gr)),S())}});d=e("div",e("div.dropzone",{role:"button",tabindex:0,onclick:()=>T.click(),onkeydown:F=>{F.key==="Enter"&&T.click()}},b("camera"),e("div","Prendre ou choisir une photo")),T,g),S();break}','T=null;d=e("div",S3PickUI(!!l.video,async($,st)=>{p(await S3PhotoPick($,Gr,st)),S()}),g),S();break}')
bundle=rep(bundle,'{name:"photo",label:"Photo",type:"photo"}]),u=x("Publier",{kind:"primary",icon:"send",onClick:async()=>{','{name:"photo",label:"Photo",type:"photo",video:!0}]),u=x("Publier",{kind:"primary",icon:"send",onClick:async()=>{if(window.__s3VidBusy){A("Vid\\xE9o en cours d\\u2019envoi : patientez avant de publier.","warn");return}')
bundle=rep(bundle,'type:"photo",video:!0}],onSubmit:async d=>{','type:"photo",video:!0}],onSubmit:async d=>{if(window.__s3VidBusy){let m=new Error("Vid\\xE9o en cours d\\u2019envoi : patientez avant de publier.");throw m.fields={photo:m.message},m}')
bundle=rep(bundle,'}await v.post("/feed",d)}}','}await v.post("/feed",d);S3OfflineNote();setTimeout(()=>S3AmbCross(d),400)}}')
bundle=rep(bundle,'try{await v.post("/feed",l.values),A("Publi\\xE9 !"),Ie()}','try{let sv={...l.values};await v.post("/feed",sv),A("Publi\\xE9 !"),Ie(),S3OfflineNote(),setTimeout(()=>S3AmbCross(sv),400)}')
bundle=rep(bundle,'setTimeout(()=>{let c=u.querySelector("input:not([type=hidden]),select,textarea");c&&c.focus()},30)','setTimeout(()=>{if(window.matchMedia&&matchMedia("(pointer:coarse)").matches)return;let c=u.querySelector("input:not([type=hidden]),select,textarea");c&&c.focus()},30)')
bundle=rep(bundle,'const j0=r.json||{};if(!j0.access_token)','return authFinish(r.json||{},mode)}async function authFinish(j0,mode){if(!j0.access_token)')
bundle=rep(bundle,'return{canPush,enablePush,','return{authFinish,canPush,enablePush,')
bundle=rep(bundle,'ge=t=>{location.hash=t}','ge=t=>{if(t==="/connexion"&&typeof S3LoginOpen=="function"&&S3LoginOpen())return;location.hash=t}')
bundle='(function(){try{var h=location.hash||"";if(/access_token=/.test(h)&&!/^#\\//.test(h)){sessionStorage.setItem("cp360.oauth",h.slice(1));history.replaceState(null,"",location.pathname+location.search+"#/communaute")}else if(/error_description=/.test(h)&&!/^#\\//.test(h)){sessionStorage.setItem("cp360.oautherr",h.slice(1));history.replaceState(null,"",location.pathname+location.search+"#/communaute")}}catch(e){}})();\n'+bundle
bundle=rep(bundle,'e("select.input",{style:{minHeight:"36px",width:"auto"},onchange:async o=>{try{await v.patch("/admin/users/"+u.id,{role:o.target.value}),A("R\\xF4le mis \\xE0 jour.")}catch(er){A(er.message,"err")}}},[["user","Utilisateur"],["moderator","Mod\\xE9rateur"]].map(([k0,l0])=>e("option",{value:k0,selected:u.role==="moderator"==(k0==="moderator")},l0)))','e("select.input",{style:{minHeight:"36px",width:"auto"},"data-uid":u.id,"aria-label":"R\\xF4le",onchange:async o=>{let vv=o.target.value;if(await S3RoleChange(u,vv,o.target))return;try{await v.patch("/admin/users/"+u.id,{role:vv}),u.role=vv,A("R\\xF4le mis \\xE0 jour.")}catch(er){A(er.message,"err")}}},[["user","Utilisateur"],["moderator","Mod\\xE9rateur"],["ambassador","Ambassadeur"]].map(([k0,l0])=>e("option",{value:k0,selected:k0!=="ambassador"&&u.role==="moderator"==(k0==="moderator")},l0)))')
bundle=rep(bundle,'function Yr(t){for(let r of Jr)','function Yr(t){try{S3EarlyRoutes()}catch{}for(let r of Jr)')
bundle=rep(bundle,'data:{name:String(vals.name||"").trim(),profile:vals.profile||"mixte"}','data:{name:String(vals.name||"").trim(),profile:vals.profile||"mixte",invite:String(vals.invite||"").trim().toUpperCase()}')
# 1. remplace la coque Sl()
bundle=cut(bundle,'function Sl(){','function Il(t){',shell)
# 1b. fiches ambassadeur : la base (table ambassadors) s'ajoute au catalogue local
bundle=rep(bundle,'_.ambassadors.all())','(window.__ambDb||[]).reduce((L,d)=>{let i=L.findIndex(x=>x.id===d.id);i<0?L.push(d):L[i]=d;return L},_.ambassadors.all()).filter(d=>!["amb_feliew","amb_marius","amb_chassehd"].includes(d.id)))')
bundle=rep(bundle,'AmbData.filter(a=>a.real&&!_.ambassadors.get(a.id))','AmbData.filter(a=>a.real&&!["amb_feliew","amb_marius","amb_chassehd"].includes(a.id)&&!_.ambassadors.get(a.id))')
# 2. remplace l'accueil
bundle=cut(bundle,'async function ka(t){','function al(t){',home)
# 3. routeur : chargements différés, squelette, décor
bundle=rep(bundle,'Mt.classList.toggle("full",t==="/carte"),B(Mt,e("div.loader",e("div.spin")));try{let n=await r.loader(),i=e("div");un=await n.default(i,r.params),B(Mt,i),Mt.scrollTop=0,window.scrollTo(0,0)}',
 'Mt.classList.toggle("full",t==="/carte"),B(Mt,S3Skel());try{await Need3(t);let n=await r.loader(),i=e("div");un=await n.default(i,r.params),B(Mt,i),Mt.scrollTop=0,window.scrollTo(0,0),S3Deco(t)}')
bundle=rep(bundle,'if(!w.user){Ot=null;let n=await r.loader(),c=e("main.content",{id:"content",tabindex:-1}),h=e("header.topbar.guest-top",kl(),e("div.spacer"),x("Ambassadeurs",{kind:"ghost",href:"#/ambassadeurs"}),x("Se connecter",{kind:"primary",href:"#/connexion"}));B(Gi,e("div.main",h,c,e("div.guest-bar",e("span","Rejoignez la communaut\\xE9"),x("Se connecter",{kind:"primary",href:"#/connexion"})))),Mt=c;',
 'if(!w.user){Ot=null;document.documentElement.dataset.role="";await Need3(t);let n=await r.loader(),c=e("main.content",{id:"content",tabindex:-1}),h=e("header.topbar.guest-top",e("a.tb-brand",{href:"#/communaute"},S3Mark(),e("span.brand-name","Chasse & P\\xEAche 360\\xB0")),e("div.spacer"),x("Articles",{kind:"ghost",size:"sm",href:"#/articles"}),e("button.btn.sm.tonal.guest-install",{type:"button",hidden:!0,onclick:()=>S3Install(),title:"Installer l\\u2019appli"},b("download"),e("span","Installer")),x("Ambassadeurs",{kind:"ghost",size:"sm",href:"#/ambassadeurs"}));B(Gi,e("div.main",h,c,e("div.guest-bar",e("span","Rejoignez la communaut\\xE9",e("small","Chasse, p\\xEAche et nature, toute l\\u2019ann\\xE9e")),x("Cr\\xE9er un compte",{kind:"ghost",size:"sm",href:"#/connexion?inscription=1"}),x("Se connecter",{kind:"primary",href:"#/connexion"})))),Mt=c;')
bundle=rep(bundle,'un=await n.default(i,r.params),B(c,i);return}','un=await n.default(i,r.params),B(c,i),S3Deco(t);return}')
bundle=rep(bundle,'t==="/connexion"){Ot=null;let n=await r.loader();','t==="/connexion"){Ot=null;S3SheetClose(!0);let n=await r.loader();')
# 4. données : lecture différée
bundle=rep(bundle,'g=()=>v2||(v2=JSON.parse(document.getElementById(id).textContent))','g=()=>v2||(v2=Data3Sync(id))')
# 5. carte : plus de vérification au chargement (gérée par MapLib3)
bundle=rep(bundle,'window.addEventListener("load",()=>{window.L||setTimeout(()=>A("La biblioth\\xE8que de carte n\\u2019a pas pu se charger (bloqueur de contenu ou r\\xE9seau) : les cartes ne s\\u2019afficheront pas.","err"),1500)}),','')
# 6. pas de service worker (inexistant dans un artefact)
bundle=rep(bundle,'"serviceWorker"in navigator&&location.protocol!=="file:"&&!window.cp360Demo&&navigator.serviceWorker.register("/sw.js").catch(()=>{}),','')
# 7. images : chargement paresseux par défaut
# Déconnexion : retour sur le fil d'actualité (chargé en visiteur) avec la fenêtre de connexion, au lieu de rester sur une page privée vide
bundle=rep(bundle,'Reconnectez-vous.","warn"),ge("/connexion"),Xt()}','Reconnectez-vous.","warn"),S3AfterLogout()}')
# En ligne, visiteur non connecté : lecture publique de la vraie base (clé anonyme) au lieu des données de démonstration
bundle=rep(bundle,'async function rest(method,path,body,extra){const tk=await bearer();if(!tk)return{ok:!1,status:401,json:null};','async function rest(method,path,body,extra){const tk=await bearer()||(method==="GET"?KEY:null);if(!tk)return{ok:!1,status:401,json:null};')
bundle=rep(bundle,'track("open");if(!ses)return info.state;','track("open");if(!ses){try{if(Ut.users.items.has("u_marc"))T.filter(n=>!MERGE.includes(n)).forEach(n=>{try{Ut[n].load([])}catch{}})}catch{}(async()=>{const P=["posts","comments","ambassadors","articles","recipes","directory","partners","groups","questions","announcements"].filter(n=>T.includes(n));await Promise.all(P.map(async n=>{const rows=await pullTable(n,null);rows&&applyRows(n,rows,!0)}));const pr=await rest("GET","profiles_public?select=id,data");if(pr.ok&&Array.isArray(pr.json)){applying=!0;try{pr.json.forEach(p=>{const c=Ut.users.items.get(p.id);Ut.users.items.set(p.id,c?{...p.data,...c}:{...p.data})})}finally{applying=!1}}try{Nr()}catch{}if(!ses)try{Xt()}catch{}})().catch(()=>{});return info.state}')
# En ligne : les ambassadeurs viennent uniquement de la vraie base (plus de profils de démonstration fusionnés)
bundle=rep(bundle,'const MERGE=["recipes","directory","partners","articles","ambassadors"]','const MERGE=["recipes","directory","partners","articles"]')
# En ligne : pas d'ambassadeurs de démonstration (Camille, Léa…), seulement les fiches réelles
bundle=rep(bundle,'!_.ambassadors.count()&&!window.__ambS&&(','!_.ambassadors.count()&&!window.__ambS&&!(window.cp360Sb&&window.cp360Sb.on())&&(')
bundle=rep(bundle,'.filter(d=>!["amb_feliew","amb_marius","amb_chassehd"].includes(d.id))),K.get("/ambassadors"','.filter(d=>!["amb_feliew","amb_marius","amb_chassehd"].includes(d.id)).filter(d=>!(window.cp360Sb&&window.cp360Sb.on())||d.real||!AmbData.some(a=>a.id===d.id))),K.get("/ambassadors"')
# Publication dont l'auteur n'est plus connu : affichée « Membre » au lieu de faire planter tout le fil
bundle=rep(bundle,'function Hn(t,{onDelete:r}={}){if(t.kind==="video")return AmbFeed(t);','function Hn(t,{onDelete:r}={}){if(t.kind==="video")return AmbFeed(t);t.kind!=="article"&&!t.author&&(t.author={id:t.authorId||"",name:"Membre"});')
# Démo publique (/demo/) : toujours en mode démonstration, avec un stockage séparé du vrai site
bundle=rep(bundle,'function on(){try{','function on(){try{if(/\/demo\//.test(location.pathname))return!1;')
bundle=rep(bundle,'localStorage.getItem("cp360."+t)','localStorage.getItem((/\/demo\//.test(location.pathname)?"cp360d.":"cp360.")+t)')
bundle=rep(bundle,'localStorage.setItem("cp360."+t,','localStorage.setItem((/\/demo\//.test(location.pathname)?"cp360d.":"cp360.")+t,')
bundle=rep(bundle,'Mi="cp360.demo.db.v1"','Mi=/\/demo\//.test(location.pathname)?"cp360d.demo.db.v1":"cp360.demo.db.v1"')
# Statistiques : identifiant de visiteur anonyme conservé d'une visite à l'autre (et plus seulement le temps d'un onglet)
bundle=rep(bundle,'let sid=sessionStorage.getItem("cp360.sid");const fresh=!sid;fresh&&(sid=(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now()),sessionStorage.setItem("cp360.sid",sid));if(kind==="open"&&!fresh&&sessionStorage.getItem("cp360.tr"))return;','let sid=localStorage.getItem("cp360.vid");sid||(sid="v-"+(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now()),localStorage.setItem("cp360.vid",sid));if(kind==="open"&&sessionStorage.getItem("cp360.tr"))return;')
# Taille d'affichage dans Profil › Affichage
bundle=rep(bundle,'w.theme,c=>{Ln(c),v.patch("/auth/me",{settings:{theme:c}}).catch(()=>{})})),','w.theme,c=>{Ln(c),v.patch("/auth/me",{settings:{theme:c}}).catch(()=>{})})),S3ZoomField(),')
# Connexion en ligne (vraie base) : pas de comptes de démonstration ni de boutons Apple/Google (pas encore branchés)
bundle=rep(bundle,'C(a,e("div.row",{style:{margin:"18px 0",color:"var(--muted)"}},e("hr.sep.grow"),e("span.small","ou"),e("hr.sep.grow")),e("div.grid.g-2",l("apple","Continuer avec Apple"),l("google","Continuer avec Google")),e("div",{style:{marginTop:"28px"}},','window.cp360Sb&&window.cp360Sb.on()||C(a,e("div.row",{style:{margin:"18px 0",color:"var(--muted)"}},e("hr.sep.grow"),e("span.small","ou"),e("hr.sep.grow")),e("div.grid.g-2",l("apple","Continuer avec Apple"),l("google","Continuer avec Google")),e("div",{style:{marginTop:"28px"}},')
bundle=rep(bundle,'s=document.createElement(i||"div");','s=document.createElement(i||"div");i==="img"&&(s.loading="lazy",s.decoding="async");')
open(B+'v3/bundle3.js','w').write(bundle)

# CSS
legacy=filt(app_css)
legacy=legacy.replace('} .auth{','.auth{')
legacy=re.sub(r'\.saison-art\{[^}]*\}','',legacy)
ux=filt(ux70)
core=open(B+'v3/core3.css').read()
pw='.pw-wrap{position:relative;display:block;width:100%}.pw-wrap>input{width:100%;padding-right:48px!important}.pw-eye{position:absolute;right:4px;top:50%;transform:translateY(-50%);width:40px;height:40px;border:0;background:none;color:var(--text-2);display:grid;place-items:center;border-radius:10px;cursor:pointer}.pw-eye:hover{background:var(--surface-3)}.pw-eye svg{width:20px;height:20px}'
def mincss(c):
    c=re.sub(r'/\*.*?\*/','',c,flags=re.S)
    c=re.sub(r'\s+',' ',c)
    c=re.sub(r'\s*([{};,>])\s*',r'\1',c)
    c=re.sub(r';}','}',c)
    return c.strip()
css=mincss(leaflet_css)+mincss(legacy)+mincss(ux)+mincss(core)+pw
# Écran court à l'horizontale (téléphone, y compris avec la taille d'affichage réduite) : on garde la présentation mobile
_n=css.count('@media(min-width:900px){')+css.count('@media(min-width:900px) and')
css=css.replace('@media(min-width:900px){','@media(min-width:900px) and (min-height:561px){').replace('@media(min-width:900px) and (max-width:1100px)','@media(min-width:900px) and (min-height:561px) and (max-width:1100px)')
css=css.replace('@media(max-width:899px){','@media (max-width:899px),(max-height:560px){').replace('@media (max-width:899px){','@media (max-width:899px),(max-height:560px){')
assert _n>=4 and '@media(min-width:900px){' not in css
# polices
fonts='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&display=swap"><link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin><link rel="dns-prefetch" href="https://api.open-meteo.com"><link rel="dns-prefetch" href="https://data.geopf.fr">'
icon=grab(r'(<link rel="icon"[^>]*>)')
icon='<link rel="icon" type="image/png" href="data:image/png;base64,'+open(B+'logo3/b64_64.txt').read()+'">'
boot='(function(){try{var d=document.documentElement,g=function(k,v){try{var x=localStorage.getItem("cp360."+k);return x==null?v:JSON.parse(x)}catch(e){return v}},m=new Date().getMonth();d.dataset.season=g("season",m>=8||m<=1?"chasse":"peche");d.dataset.theme=g("theme","light");d.lang="fr"}catch(e){}})();'
html=f'''<title>Chasse &amp; Pêche 360° 3.0</title>
<meta name="theme-color" content="#F3F0E8">
<meta name="description" content="Chasse, pêche et nature : sécurité, carte terrain, sorties, communauté.">
{icon}
{fonts}
<style>{css}</style>
<script>{boot}{saison}window.__REAL=1;addEventListener("beforeinstallprompt",function(ev){{ev.preventDefault();window.__bip=ev;document.dispatchEvent(new Event("cp360:bip"))}});if("serviceWorker"in navigator&&location.protocol==="https:"&&!/claude\.ai$|claudeusercontent|anthropic/.test(location.hostname))addEventListener("load",function(){{navigator.serviceWorker.register("sw.js").catch(function(){{}})}});</script>
<div id="app"><div class="loader" style="min-height:100vh"><div class="spin"></div></div></div>
{logo}
<script>{bundle}</script>
'''
os.makedirs(B+'dist/data',exist_ok=True)
open(B+'dist/index.html','w').write(html)
for k,vv in datas.items():
    json.loads(vv)
    open(B+'dist/data/'+k+'.json','w').write(vv)
print('index',len(html),'css',len(css),'js',len(bundle),'data',sum(len(x) for x in datas.values()))

# ---- Version hébergée (GitHub Pages) ----
GH=B+'dist_gh/'
os.makedirs(GH+'data',exist_ok=True)
head='''<!doctype html>
<html lang="fr" data-theme="light" data-season="chasse">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Chasse&amp;Pêche">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
'''
gh=html.replace('<div id="app">','</head>\n<body>\n<div id="app">',1)+'</body>\n</html>\n'
open(GH+'index.html','w').write(head+gh)
for k,vv in datas.items(): open(GH+'data/'+k+'.json','w').write(vv)
print('gh index',len(head+gh))
