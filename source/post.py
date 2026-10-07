# post-traitement (exécuté par build.py après patches.py) : données différées, minification, chargement non bloquant
import json as _j, re as _re, subprocess as _sp
_stats={}
# 1) données volumineuses sorties du JavaScript : lues (JSON.parse) seulement quand une page en a besoin
_dec=_j.JSONDecoder()
_blocks=[]
_lazy_def='function LazyData(id){let v=null,g=()=>v||(v=JSON.parse(document.getElementById(id).textContent));return new Proxy({},{get:(t,k)=>g()[k],has:(t,k)=>k in g(),ownKeys:()=>Reflect.ownKeys(g()),getOwnPropertyDescriptor:(t,k)=>{let d=Object.getOwnPropertyDescriptor(g(),k);d&&(d.configurable=!0);return d}})}\n'
_first=True
for _name,_id in (('REG_DEPT','d-regdept'),('REG_NAT','d-regnat'),('SG_DATA','d-sang')):
    _key='const '+_name+'='
    _i=s.index(_key)
    _val,_end=_dec.raw_decode(s,_i+len(_key))
    _js=_j.dumps(_val,ensure_ascii=False,separators=(',',':'))
    _blocks.append((_id,_js))
    s=s[:_i]+(_lazy_def if _first else '')+'const '+_name+'=LazyData("'+_id+'")'+s[_end:]
    _first=False
_data_html=''.join('<script type="application/json" id="%s">%s</script>'%(i,j.replace('</','<\\/').replace('<!--','<\\!--')) for i,j in _blocks)
_k=s.rindex('</body>');s=s[:_k]+_data_html+s[_k:]
_stats['donnees_differees_ko']=round(sum(len(j) for _,j in _blocks)/1024)

# 2) minification JS / CSS (esbuild, sans renommage des identifiants)
_ES='/opt/npm-tools/node_modules/esbuild'
_node='''const e=require(%r);let s=require("fs").readFileSync(0,"utf8");process.stdout.write(e.transformSync(s,{loader:process.argv[1],minify:process.argv[1]==="css",minifyWhitespace:!0,minifySyntax:!0,legalComments:"none",target:"es2020"}).code)'''%_ES
def _min(code,loader):
    r=_sp.run(['node','-e',_node,loader],input=code.encode('utf-8'),capture_output=True)
    if r.returncode!=0: raise SystemExit('esbuild: '+r.stderr.decode()[:400])
    return r.stdout.decode('utf-8')
_before=len(s)
def _min_blocks(tag,loader,pred):
    global s
    out=[];pos=0
    for m in _re.finditer(r'(<%s(?:\s[^>]*)?>)(.*?)(</%s>)'%(tag,tag),s,_re.S):
        body=m.group(2)
        if not pred(m.group(1),body): continue
        out.append(s[pos:m.start(2)]);out.append(_min(body,loader).rstrip('\n'));pos=m.end(2)
    out.append(s[pos:]);s=''.join(out)
_min_blocks('style','css',lambda o,b:len(b)>200)
_min_blocks('script','js',lambda o,b:'src=' not in o and 'application/json' not in o and len(b)>200)
_stats['minification_ko']=round((_before-len(s))/1024)

# 3) polices non bloquantes, préconnexion Leaflet
_f='<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@500;600;700&display=swap">'
assert s.count(_f)==1
s=s.replace(_f,'<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin><link rel="preload" as="script" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js">'+_f.replace('rel="stylesheet"','rel="stylesheet" media="print" onload="this.media=\'all\'"')+'<noscript>'+_f+'</noscript>')
print('post:',_stats)
