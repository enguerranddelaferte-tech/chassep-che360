#!/usr/bin/env python3
"""Consolide sang_raw/*.json -> sang-data.json (publié sur Pages) + js_sang_data.js (embarqué).
Usage : python3 sang_update.py <date-liste-officielle JJ/MM/AAAA>"""
import json,glob,re,sys,datetime
src=sys.argv[1] if len(sys.argv)>1 else "01/10/2026"
D={};seen=set();n=0
for f in sorted(glob.glob('sang_raw/*.json')):
    d=json.load(open(f))
    for r in d['rows']:
        dp=d['dpt'] if d['dpt']!='autres' else r.get('dpt','')
        if dp=='20': dp='20'
        t1,t2=r.get('tel1',''),r.get('tel2','')
        if not (t1 or t2): continue
        if not all(re.fullmatch(r'0\d( \d\d){4}',t) for t in (t1,t2) if t): continue
        key=(dp,r['name'],t1,t2)
        if key in seen: continue
        seen.add(key);n+=1
        D.setdefault(dp,[]).append([r['name'],r['cp'],r['ville'].title(),t1,t2])
for v in D.values(): v.sort(key=lambda z:z[2]+z[0])
out={"source":"UNUCR — liste officielle des conducteurs agréés","sourceUrl":"https://www.unucr.fr/conducteurs","listDate":src,"fetched":datetime.date.today().isoformat(),"count":n,"d":D}
json.dump(out,open('../sang-data.json','w'),ensure_ascii=False,separators=(',',':'))
open('js_sang_data.js','w',encoding='utf-8').write("const SG_DATA="+json.dumps(out,ensure_ascii=False,separators=(',',':'))+";\n")
print(n,"conducteurs,",len(D),"départements")
