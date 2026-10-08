# Génère le CSS des fonds de saison (motifs SVG discrets) -> saison.css
import urllib.parse,math,random
def uri(svg): return 'url("data:image/svg+xml,'+urllib.parse.quote(svg.replace('\n','').replace('"',"'"),safe="/:=,;'()- ")+'")'
def hills(color1,color2,extra,W=600,H=200,seed=1):
    # tuile horizontale continue : 2 rangées de collines + éléments
    def wave(a,ph,base,amp): 
        pts=[f"{x},{base+amp*math.sin(2*math.pi*x/W*a+ph):.1f}" for x in range(0,W+1,20)]
        return "M0,"+str(H)+" L"+" L".join(pts)+f" L{W},{H} Z"
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><path d="{wave(1,0.5,H-70,16)}" fill="{color2}"/><path d="{wave(2,2.1,H-38,12)}" fill="{color1}"/>{extra}</svg>'
def pine(x,y,h,fill,snow=None):
    w=h*0.42;t=f'<path d="M{x},{y-h} L{x+w/2},{y-h*0.35} L{x+w*0.22},{y-h*0.35} L{x+w*0.6},{y} L{x-w*0.6},{y} L{x-w*0.22},{y-h*0.35} L{x-w/2},{y-h*0.35} Z" fill="{fill}"/>'
    if snow: t+=f'<path d="M{x},{y-h} L{x+w*0.22},{y-h*0.72} L{x-w*0.22},{y-h*0.72} Z" fill="{snow}"/>'
    return t
def leaf(x,y,r,rot,fill):
    return f'<path transform="translate({x},{y}) rotate({rot})" d="M0,{-r} C{r*0.9},{-r*0.5} {r*0.8},{r*0.6} 0,{r} C{-r*0.8},{r*0.6} {-r*0.9},{-r*0.5} 0,{-r} Z" fill="{fill}"/><path transform="translate({x},{y}) rotate({rot})" d="M0,{-r} L0,{r}" stroke="rgba(0,0,0,.18)" stroke-width="1"/>'
def flake(x,y,r,col):
    s=''
    for a in (0,60,120): 
        dx=r*math.cos(math.radians(a));dy=r*math.sin(math.radians(a))
        s+=f'<path d="M{x-dx:.1f},{y-dy:.1f} L{x+dx:.1f},{y+dy:.1f}" stroke="{col}" stroke-width="1.6" stroke-linecap="round"/>'
    return s
def petal(x,y,r,rot,col):
    return f'<ellipse transform="translate({x},{y}) rotate({rot})" rx="{r*0.5}" ry="{r}" fill="{col}"/>'
def tile(items,W=420,H=420): return f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">{items}</svg>'
random.seed(7)
def scatter(n,fn,W=420,H=420):
    out='';pts=[]
    for i in range(n):
        for _ in range(30):
            x,y=round(random.uniform(10,W-10),1),round(random.uniform(10,H-10),1)
            if all((x-a)**2+(y-b)**2>70**2 for a,b in pts): break
        pts.append((x,y));out+=fn(x,y,i)
    return out
import re
def poplar(x,y,h,fill,trunk='#6B4A2B'):
    w=h*0.2
    return f'<rect x="{x-1.5}" y="{y-h*0.18:.1f}" width="3" height="{h*0.18:.1f}" fill="{trunk}"/><ellipse cx="{x}" cy="{y-h*0.58:.1f}" rx="{w:.1f}" ry="{h*0.42:.1f}" fill="{fill}"/>'
def oak(x,y,h,fill,trunk='#6B4A2B'):
    r=h*0.26
    return (f'<rect x="{x-2}" y="{y-h*0.4:.1f}" width="4" height="{h*0.4:.1f}" fill="{trunk}"/>'
            f'<circle cx="{x}" cy="{y-h*0.66:.1f}" r="{r:.1f}" fill="{fill}"/><circle cx="{x-r*0.85:.1f}" cy="{y-h*0.5:.1f}" r="{r*0.8:.1f}" fill="{fill}"/><circle cx="{x+r*0.85:.1f}" cy="{y-h*0.5:.1f}" r="{r*0.8:.1f}" fill="{fill}"/>')
def flower5(x,y,r,col,ctr='#FFD23F'):
    s=''.join(f'<ellipse transform="translate({x},{y}) rotate({a}) translate(0,{-r*0.75:.1f})" rx="{r*0.42:.1f}" ry="{r*0.6:.1f}" fill="{col}"/>' for a in (0,72,144,216,288))
    return s+f'<circle cx="{x}" cy="{y}" r="{r*0.3:.1f}" fill="{ctr}"/>'
def lav(x,y,h,col,stem):
    return f'<path d="M{x},{y} L{x},{y-h}" stroke="{stem}" stroke-width="1.4"/>'+''.join(f'<ellipse cx="{x+(k%2*2-1)*1.2:.1f}" cy="{y-h+k*3.2:.1f}" rx="1.9" ry="2.6" fill="{col}"/>' for k in range(5))
def wheat(x,y,h,stem='#C99A2E',ear='#D9A93A'):
    return f'<path d="M{x},{y} L{x},{y-h}" stroke="{stem}" stroke-width="2"/><ellipse cx="{x}" cy="{y-h-4}" rx="3" ry="8" fill="{ear}"/>'
def reed(x,y,h,stem,head,lean=4):
    return f'<path d="M{x},{y} Q{x+lean},{y-h*0.6:.1f} {x+lean*1.6:.1f},{y-h}" stroke="{stem}" stroke-width="1.8" fill="none"/><ellipse cx="{x+lean*1.5:.1f}" cy="{y-h+5:.1f}" rx="2.4" ry="6" fill="{head}"/>'
def pad(x,y,r,col,fl=None):
    t=f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r*0.34:.1f}" fill="{col}"/>'
    if fl: t+=f'<circle cx="{x+r*0.2:.1f}" cy="{y-r*0.2:.1f}" r="{r*0.22:.1f}" fill="{fl}"/>'
    return t
def crack(x,y,l,col):
    return f'<path d="M{x},{y} l{l*0.4:.0f},{-l*0.2:.0f} l{l*0.3:.0f},{l*0.25:.0f} l{l*0.3:.0f},{-l*0.15:.0f}" stroke="{col}" stroke-width="1.2" fill="none" opacity=".7"/>'
def lake(far,w1,w2,rip,extra,W=600,H=200):
    def wave(a,ph,base,amp):
        pts=[f"{x},{base+amp*math.sin(2*math.pi*x/W*a+ph):.1f}" for x in range(0,W+1,20)]
        return "M0,"+str(H)+" L"+" L".join(pts)+f" L{W},{H} Z"
    r=''.join(f'<path d="M{x},{y} q8,-3 16,0 t16,0" stroke="{rip}" stroke-width="1.3" fill="none" opacity=".65"/>' for x,y in [(30,150),(150,164),(270,152),(390,168),(500,156),(80,184),(220,190),(340,182),(460,192),(560,178)])
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><path d="{wave(2,1.3,H-92,9)}" fill="{far}"/>'
            f'<path d="{wave(1,0,H-78,2)}" fill="{w1}"/><path d="{wave(3,0.8,H-52,3)}" fill="{w2}"/>{r}{extra}</svg>')
def alpha(c,k):
    m=re.match(r'rgba\((\d+),(\d+),(\d+),([\d.]+)\)',c)
    return f'rgba({m[1]},{m[2]},{m[3]},{float(m[4])*k:.3f})'
def dk(svg,k=.6,base=(0x1B,0x26,0x22)):
    def f(m):
        h=m.group(0)[1:];c=[int(h[i:i+2],16) for i in (0,2,4)]
        return '#%02X%02X%02X'%tuple(round(c[i]*(1-k)+base[i]*k) for i in range(3))
    return re.sub(r'#[0-9A-Fa-f]{6}',f,svg)
def petals(n): return lambda col: scatter(n,lambda x,y,i:petal(x,y,7+(i%3)*2,random.randint(0,180),col[i%len(col)]))
def dots(n,r0=2): return lambda col: scatter(n,lambda x,y,i:f'<circle cx="{x}" cy="{y}" r="{r0+(i%3)}" fill="{col[i%len(col)]}"/>')
def leaves(n): return lambda col: scatter(n,lambda x,y,i:leaf(x,y,9+(i%3)*3,random.randint(0,360),col[i%len(col)]))
def flakes(n): return lambda col: scatter(n,lambda x,y,i:flake(x,y,5+(i%3)*2,col[i%len(col)]) if i%2==0 else f'<circle cx="{x}" cy="{y}" r="{1.8+(i%3)*0.6}" fill="{col[i%len(col)]}"/>')
R=range
# --- 8 scènes : (saison, mode) -> chasse = lisière/forêt/champ, pêche = rive/étang/roselière
S={
('printemps','chasse'):dict(tint=('rgba(170,210,110,.20)','rgba(255,240,190,.14)'),glow='rgba(255,243,170,.40)',land=('hills','#79BB58','#B4DB80'),
  motif=petals(13),col=['#F7B8CB','#FFFFFF','#D9C2F5'],
  extra=lambda:''.join(oak(x,158-(x%3)*5,46+(x%5)*5,'#8CC56A' if (x//29)%2 else '#74B558') for x in R(25,600,58))+''.join(flower5(x,y,5,c,ctr) for x,y,c,ctr in [(60,186,'#FFFFFF','#FFD23F'),(170,190,'#D9C2F5','#FFFFFF'),(300,187,'#FFD23F','#E39A2D'),(430,190,'#F7B8CB','#FFFFFF'),(540,186,'#FFFFFF','#FFD23F')])),
('printemps','peche'):dict(tint=('rgba(140,210,200,.22)','rgba(200,235,250,.16)'),glow='rgba(255,248,200,.40)',land=('lake','#A9D58A','#8FD0D0','#6DB9C4','#FFFFFF'),
  motif=petals(12),col=['#F7B8CB','#FFFFFF','#CDEFE3'],
  extra=lambda:''.join(reed(x,200,48+(x%4)*8,'#6FA85A','#7A5A3A',4 if x%2 else -4) for x in R(14,600,26) if x%78<40)+''.join(pad(x,y,11,'#5FA860','#F7B8CB') for x,y in [(210,172),(330,186),(450,170),(120,188)])),
('ete','chasse'):dict(tint=('rgba(255,214,120,.20)','rgba(255,240,200,.12)'),glow='rgba(255,224,120,.46)',land=('hills','#D9BE62','#8FA45A'),
  motif=dots(11),col=['#FFF2B0','#FFFFFF','#FFE39A'],
  extra=lambda:''.join(oak(x,146-(x%3)*4,56+(x%4)*6,'#4F7F3F') for x in R(30,600,64))+''.join(wheat(x,200,38-(x%20)) for x in R(14,600,30))),
('ete','peche'):dict(tint=('rgba(100,190,235,.20)','rgba(255,236,170,.16)'),glow='rgba(255,230,140,.50)',land=('lake','#9DB06A','#6EC1E4','#4FA9D6','#FFFFFF'),
  motif=dots(11),col=['#FFFFFF','#FFF2B0','#BFE3F7'],
  extra=lambda:''.join(reed(x,200,52+(x%4)*8,'#5E9A4E','#6B4A2B',4 if x%2 else -4) for x in R(14,600,26) if x%104<44)),
('automne','chasse'):dict(tint=('rgba(214,120,60,.22)','rgba(150,90,50,.12)'),glow='rgba(255,196,90,.44)',land=('hills','#A8672F','#D49A4A'),
  motif=leaves(12),col=['#C8412B','#E8962A','#F0C040','#9E3B2E'],
  extra=lambda:''.join((pine(x,176-(x%3)*4,84+(x%4)*6,'#2F4A3A') if (x//31)%3==0 else oak(x,170-(x%3)*5,60+(x%5)*5,['#C8612B','#E39A2D','#9E3B2E'][(x//31)%3])) for x in R(28,600,62))),
('automne','peche'):dict(tint=('rgba(220,150,70,.20)','rgba(120,150,170,.14)'),glow='rgba(255,200,110,.46)',land=('lake','#C9923F','#6F9AA0','#5B8A93','#F6D38A'),
  motif=leaves(10),col=['#C8412B','#E8962A','#F0C040'],
  extra=lambda:''.join(poplar(x,122-(x%2)*3,50+(x%5)*5,'#E0A53A' if (x//30)%2 else '#C9822E') for x in R(30,600,66))+''.join(reed(x,200,50+(x%4)*8,'#B8863A','#6B4A2B',4 if x%2 else -4) for x in R(14,600,26) if x%104<40)),
('hiver','chasse'):dict(tint=('rgba(150,170,210,.22)','rgba(240,235,240,.14)'),glow='rgba(255,214,225,.50)',land=('hills','#EEF1F7','#C3CEE2'),
  motif=flakes(15),col=['#FFFFFF','#BFD3F2','#F2CFE0'],
  extra=lambda:''.join(pine(x,200-30+(x%24)/3,70+(x%5)*9,'#2F4A44','#FFFFFF') for x in R(24,600,46))),
('hiver','peche'):dict(tint=('rgba(150,200,225,.26)','rgba(240,246,252,.16)'),glow='rgba(255,255,255,.55)',land=('lake','#E4EBF4','#D5E7F3','#BFD9EA','#FFFFFF'),
  motif=flakes(15),col=['#FFFFFF','#CFE0F0','#FFFFFF'],
  extra=lambda:''.join(pine(x,118,34+(x%4)*5,'#4A6670','#FFFFFF') for x in R(20,600,44))+''.join(reed(x,200,46+(x%4)*8,'#B9A687','#8B7355',4 if x%2 else -4) for x in R(14,600,26) if x%104<38)+''.join(crack(x,y,38,'#9BB8CF') for x,y in [(60,168),(210,178),(330,166),(470,176),(540,170)])),
}
css='/* Fonds de saison 3.0 (généré par gen_saison.py) : 4 saisons x chasse/pêche. Automne = été indien. Accents inchangés (orange chasse, bleu pêche) */\n'
for (name,mode),d in S.items():
    for dark in (False,True):
        random.seed(11)
        col=d['col']
        mot=tile('<g opacity="'+('.30' if dark else '.45')+'">'+d['motif'](col)+'</g>')
        ex=d['extra']()
        if d['land'][0]=='hills': land=hills(d['land'][1],d['land'][2],ex)
        else: land=lake(d['land'][1],d['land'][2],d['land'][3],d['land'][4],ex)
        if dark: mot=dk(mot,.45);land=dk(land)
        mot,land=uri(mot),uri(land)
        t1,t2=d['tint']
        sel=f':root[data-saison="{name}"]'+('[data-season="peche"]' if mode=='peche' else ':not([data-season="peche"])')+(':is([data-theme="dark"])' if dark else ':not([data-theme="dark"]):not([data-theme="contrast"])')
        tint=f'linear-gradient(180deg,{alpha(t1,.4)},transparent 55%)' if dark else f'linear-gradient(180deg,{t1},{t2} 100%)'
        glow=f'radial-gradient(ellipse 60% 38% at 82% 0%,{alpha(d["glow"],.26) if dark else d["glow"]},transparent 70%)'
        css+=f'{sel} {{ --saison-art: {land} center calc(100% - var(--land-off,0px)) / 600px 200px repeat-x, {mot} 0 0 / 420px 420px repeat, {glow}, {tint}; }}\n'
css+='''@media (max-width: 900px) { :root { --land-off: 70px; } }
body { background: var(--saison-art, none), var(--pattern, none), var(--bg); background-attachment: fixed; }
:root[data-theme="contrast"] body, :root[data-role="admin"] body { background: var(--bg); }
@media print { body { background: #fff !important; } }
@media (prefers-reduced-motion: no-preference) { body { transition: background-color .4s; } }
'''
open('saison.css','w',encoding='utf-8').write(css)
print(len(css))
