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

shell=open(B+'v3/shell3.js').read()+'\n'+open(B+'v3/amb3.js').read()+'\n'+open(B+'v3/album3.js').read()+'\n'+open(B+'v3/share3.js').read()+'\n'+open(B+'v3/shorts3.js').read()+'\n'+open(B+'v3/post3.js').read()
home=open(B+'v3/home3.js').read()
# 0b. publications : photo/vidéo depuis le téléphone, lecteur vidéo dans le fil
bundle=rep(bundle,'accept:"image/*",capture:"environment",hidden:!0,onchange:async F=>{let $=F.target.files[0];$&&(p(await Gr($)),S())}','accept:l.video?"image/*,video/*":"image/*",hidden:!0,onchange:async F=>{let $=F.target.files[0];$&&(p(await S3PhotoPick($,Gr)),S())}')
bundle=rep(bundle,'{name:"photo",label:"Photo",type:"photo"}],onSubmit:async d=>{if(!d.text||!d.text.trim())','{name:"photo",label:"Photo",type:"photo",video:!0}],onSubmit:async d=>{if(!d.text||!d.text.trim())')
bundle=rep(bundle,'t.photo?e("div.photo",e("img",{src:t.photo,alt:"",loading:"eager"})):null','t.photo?e("div.photo",S3Media(t.photo,"",!0)):null')
bundle=rep(bundle,'e("img",{src:n[l.name],alt:"Aper\\xE7u"})','S3Media(n[l.name],"Aper\\xE7u")')
bundle=rep(bundle,'T=e("input",{type:"file",accept:l.video?"image/*,video/*":"image/*",hidden:!0,onchange:async F=>{let $=F.target.files[0];$&&(p(await S3PhotoPick($,Gr)),S())}});d=e("div",e("div.dropzone",{role:"button",tabindex:0,onclick:()=>T.click(),onkeydown:F=>{F.key==="Enter"&&T.click()}},b("camera"),e("div","Prendre ou choisir une photo")),T,g),S();break}','T=null;d=e("div",S3PickUI(!!l.video,async($,st)=>{p(await S3PhotoPick($,Gr,st)),S()}),g),S();break}')
bundle=rep(bundle,'{name:"photo",label:"Photo",type:"photo"}]),u=x("Publier",{kind:"primary",icon:"send",onClick:async()=>{','{name:"photo",label:"Photo",type:"photo",video:!0}]),u=x("Publier",{kind:"primary",icon:"send",onClick:async()=>{if(window.__s3VidBusy){A("Vid\\xE9o en cours d\\u2019envoi : patientez avant de publier.","warn");return}')
bundle=rep(bundle,'type:"photo",video:!0}],onSubmit:async d=>{','type:"photo",video:!0}],onSubmit:async d=>{if(window.__s3VidBusy){let m=new Error("Vid\\xE9o en cours d\\u2019envoi : patientez avant de publier.");throw m.fields={photo:m.message},m}')
bundle=rep(bundle,'}await v.post("/feed",d)}}','}await v.post("/feed",d);setTimeout(()=>S3AmbCross(d),400)}}')
bundle=rep(bundle,'try{await v.post("/feed",l.values),A("Publi\\xE9 !"),Ie()}','try{let sv={...l.values};await v.post("/feed",sv),A("Publi\\xE9 !"),Ie(),setTimeout(()=>S3AmbCross(sv),400)}')
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
# polices
fonts='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&display=swap"><link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin><link rel="dns-prefetch" href="https://api.open-meteo.com"><link rel="dns-prefetch" href="https://data.geopf.fr">'
icon=grab(r'(<link rel="icon"[^>]*>)')
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
<link rel="apple-touch-icon" href="icon.svg">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Chasse&amp;Pêche">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
'''
gh=html.replace('<div id="app">','</head>\n<body>\n<div id="app">',1)+'</body>\n</html>\n'
open(GH+'index.html','w').write(head+gh)
for k,vv in datas.items(): open(GH+'data/'+k+'.json','w').write(vv)
print('gh index',len(head+gh))
