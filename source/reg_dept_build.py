#!/usr/bin/env python3
"""Consolide reg_dept/*.json -> js_regdept.js (const REG_DEPT, embarqué dans l'appli)."""
import json,glob
out={}
def clean(x):
    return {k:v for k,v in x.items() if v not in ("",None,[],{})}
for f in sorted(glob.glob('reg_dept/*.json')):
    d=json.load(open(f,encoding='utf-8'))
    c=d.get('chasse',{});p=d.get('peche',{})
    e={"n":d['name'],"v":d.get('verifiedOn',''),"l":clean(d.get('liens',{})),
       "c":clean({"s":c.get('saison',''),"o":c.get('ouverture',''),"f":c.get('cloture',''),"j":c.get('joursSansChasse',''),
          "e":[clean({"s":x.get('species'),"p":x.get('period'),"m":x.get('mode'),"n":x.get('note'),"u":x.get('source'),"k":1 if x.get('confidence')=='verifie' else 0}) for x in c.get('especes',[])],
          "i":[clean({"t":x.get('text'),"u":x.get('source'),"k":1 if x.get('confidence')=='verifie' else 0}) for x in c.get('infos',[])]}),
       "p":clean({"s":p.get('saison',''),
          "e":[clean({"s":x.get('species'),"c":x.get('category'),"z":x.get('minSize'),"q":x.get('dailyQuota'),"p":x.get('period'),"n":x.get('note'),"u":x.get('source'),"k":1 if x.get('confidence')=='verifie' else 0}) for x in p.get('especes',[])],
          "i":[clean({"t":x.get('text'),"u":x.get('source'),"k":1 if x.get('confidence')=='verifie' else 0}) for x in p.get('infos',[])]})}
    out[d['dpt']]=e
s="const REG_DEPT="+json.dumps(out,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+";\n"
open('js_regdept.js','w',encoding='utf-8').write(s)
print(len(out),'départements,',len(s)//1024,'Ko')
