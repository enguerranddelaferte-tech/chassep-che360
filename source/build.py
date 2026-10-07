import re,sys,os
D=os.path.dirname(os.path.abspath(__file__))+'/'
lines=open(D+'v1.html',encoding='utf-8').read().split('\n')
css=open(D+'v2.css',encoding='utf-8').read()
import os as _o
css+=open(D+'saison.css',encoding='utf-8').read() if _o.path.exists(D+'saison.css') else ''
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


# œil : afficher / masquer le mot de passe sur tous les champs
EYE_CSS='.pw-wrap{position:relative;display:block;width:100%}.pw-wrap>input{width:100%;padding-right:48px!important}.pw-eye{position:absolute;right:4px;top:50%;transform:translateY(-50%);width:40px;height:40px;border:0;background:none;color:var(--text-2,#56645F);display:grid;place-items:center;border-radius:10px;cursor:pointer}.pw-eye:hover{background:rgba(0,0,0,.06)}.pw-eye svg{width:20px;height:20px}'
EYE_JS="""<script>(function(){var O='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.9 17.9A10.9 10.9 0 0 1 12 19c-7 0-11-7-11-7a19 19 0 0 1 5-5.7M9.9 5.2A10 10 0 0 1 12 5c7 0 11 7 11 7a19 19 0 0 1-2.2 3.2M1 1l22 22"/><path d="M14.1 14.1a3 3 0 0 1-4.2-4.2"/></svg>';
function wrap(i){if(i.dataset.eye)return;i.dataset.eye=1;var w=document.createElement('span');w.className='pw-wrap';i.parentNode.insertBefore(w,i);w.appendChild(i);var b=document.createElement('button');b.type='button';b.className='pw-eye';b.setAttribute('aria-label','Afficher le mot de passe');b.innerHTML=O;
b.addEventListener('click',function(ev){ev.preventDefault();var h=i.type==='password';i.type=h?'text':'password';b.innerHTML=h?X:O;b.setAttribute('aria-label',h?'Masquer le mot de passe':'Afficher le mot de passe');i.focus()});w.appendChild(b)}
function scan(){document.querySelectorAll('input[type=password]:not([data-eye])').forEach(wrap)}
new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});scan()})()</script>"""
rep('</body>','<style>'+EYE_CSS+'</style>'+EYE_JS+'</body>')
rep('</style>\n','</style>\n',1) if False else None
s=s.replace('</style>\n<','<style>'+EYE_CSS+'</style>\n<',1) if False else s

exec(open(D+'patches.py',encoding='utf-8').read()) if os.path.exists(D+'patches.py') else None

open(D+'v2.html','w',encoding='utf-8').write(s)
inj='<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon.svg"><script>window.__REAL=1;if("serviceWorker" in navigator&&location.protocol==="https:")addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}))</script></head>'
open(D+'../index.html','w',encoding='utf-8').write(s.replace('</head>',inj,1))
print('v2.html',len(s))
