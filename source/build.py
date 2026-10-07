import re,sys,os
D=os.path.dirname(os.path.abspath(__file__))+'/'
lines=open(D+'v1.html',encoding='utf-8').read().split('\n')
css=open(D+'v2.css',encoding='utf-8').read()
head='\n'.join(lines[:672])            # lignes 1..672 : tête + CSS Leaflet
tail='\n'.join(lines[1344:])          # ligne 1345 : </head> ...
s=head+'\n<style>'+css+'</style>\n'+tail

def rep(a,b,count=1):
    global s
    n=s.count(a)
    assert n==count,(n,a[:90])
    s=s.replace(a,b)

rep('<title>Chasse &amp; Pêche 360° — démo (Copy)</title>','<title>Chasse &amp; Pêche 360° 2.0</title>')
rep('<meta name="theme-color" content="#F1EDDF">','<meta name="theme-color" content="#F3F0E8">')

# cartes réelles : afficher le volet de tuiles (masqué en démo)
rep('window.cp360Real=/[?&]cartes=reelles/.test(location.search);','window.cp360Real=!!window.__REAL||/[?&]cartes=reelles/.test(location.search);document.documentElement.classList.toggle("cp360-real",!!window.cp360Real);')

# barre basse téléphone : SOS au centre
rep('e("a.tab-season",{href:"#/battues",dataset:{path:"/battues"}},b("flag"),"Chasse"),e("a",{href:"#/messages",dataset:{path:"/messages"}},b("chat"),"Messages"),e("button",{type:"button",onclick:()=>p(!0)},b("menu"),"Menu"))',
    'e("button.tab-sos",{type:"button","aria-label":"Envoyer un SOS",onclick:()=>ht()},"SOS"),e("a.tab-season",{href:"#/battues",dataset:{path:"/battues"}},b("flag"),"Chasse"),e("button.tab",{type:"button",onclick:()=>p(!0)},b("menu"),"Menu"))')

exec(open(D+'patches.py',encoding='utf-8').read()) if os.path.exists(D+'patches.py') else None

open(D+'v2.html','w',encoding='utf-8').write(s)
inj='<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon.svg"><script>window.__REAL=1;if("serviceWorker" in navigator&&location.protocol==="https:")addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}))</script></head>'
open(D+'../index.html','w',encoding='utf-8').write(s.replace('</head>',inj,1))
print('v2.html',len(s))
