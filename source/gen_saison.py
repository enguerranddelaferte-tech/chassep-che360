# Génère le CSS des fonds de saison (motifs SVG discrets) -> saison.css
import urllib.parse,math,random
def uri(svg): return 'url("data:image/svg+xml,'+urllib.parse.quote(svg.replace('\n',''),safe="/:=,;'()- ")+'")'
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
            x,y=random.uniform(10,W-10),random.uniform(10,H-10)
            if all((x-a)**2+(y-b)**2>70**2 for a,b in pts): break
        pts.append((x,y));out+=fn(x,y,i)
    return out
import re
def poplar(x,y,h,fill,trunk='#6B4A2B'):
    w=h*0.2
    return f'<rect x="{x-1.5}" y="{y-h*0.18}" width="3" height="{h*0.18}" fill="{trunk}"/><ellipse cx="{x}" cy="{y-h*0.58}" rx="{w}" ry="{h*0.42}" fill="{fill}"/>'
def flower5(x,y,r,col,ctr='#FFD23F'):
    s=''.join(f'<ellipse transform="translate({x},{y}) rotate({a}) translate(0,{-r*0.75})" rx="{r*0.42}" ry="{r*0.6}" fill="{col}"/>' for a in (0,72,144,216,288))
    return s+f'<circle cx="{x}" cy="{y}" r="{r*0.3}" fill="{ctr}"/>'
def lav(x,y,h,col,stem):
    return f'<path d="M{x},{y} L{x},{y-h}" stroke="{stem}" stroke-width="1.4"/>'+''.join(f'<ellipse cx="{x+(k%2*2-1)*1.2:.1f}" cy="{y-h+k*3.2:.1f}" rx="1.9" ry="2.6" fill="{col}"/>' for k in range(5))
def alpha(c,k):
    m=re.match(r'rgba\((\d+),(\d+),(\d+),([\d.]+)\)',c)
    return f'rgba({m[1]},{m[2]},{m[3]},{float(m[4])*k:.3f})'
# --- palettes 2.0 : automne = été indien ; hiver = aube givrée ; printemps = prairie fleurie ; été = lavande & blé
S={
'printemps':dict(
  tint=('rgba(190,225,120,.20)','rgba(255,244,190,.14)'), glow='rgba(255,243,170,.40)',
  hill=('#79BB58','#B4DB80'),hill_d=('#2F4D2C','#284326'),
  motif=lambda col,rot=None: scatter(13,lambda x,y,i:petal(x,y,7+(i%3)*2,random.randint(0,180),col[i%len(col)])),
  col=['#F7B8CB','#FFFFFF','#D9C2F5'],col_d=['#C98BA0','#8F8AA8','#9C86B8'],
  extra=lambda:''.join(flower5(x,y,5.5,c,ctr) for x,y,c,ctr in [(40,158,'#FFFFFF','#FFD23F'),(110,166,'#D9C2F5','#FFFFFF'),(190,154,'#FFD23F','#E39A2D'),(260,164,'#FFFFFF','#FFD23F'),(340,157,'#F7B8CB','#FFFFFF'),(420,167,'#D9C2F5','#FFFFFF'),(490,155,'#FFFFFF','#FFD23F'),(560,163,'#FFD23F','#E39A2D')])),
'ete':dict(
  tint=('rgba(120,190,235,.16)','rgba(255,226,150,.18)'), glow='rgba(255,224,120,.50)',
  hill=('#D8BC5E','#A9BA78'),hill_d=('#5A4A22','#3F4A2E'),
  motif=lambda col,rot=None: scatter(11,lambda x,y,i:f'<circle cx="{x}" cy="{y}" r="{2+(i%3)}" fill="{col[i%len(col)]}"/>'),
  col=['#FFF2B0','#FFFFFF','#BFE3F7'],col_d=['#B59A52','#7C8FA0','#8A7D50'],
  extra=lambda:''.join(lav(x,188-(x%16),30+(x%5)*3,'#8E6FC0' if (x//22)%3 else '#A98BD6','#6E8A4E') for x in range(14,600,22))),
'automne':dict(
  tint=('rgba(240,170,60,.22)','rgba(214,110,70,.11)'), glow='rgba(255,196,90,.46)',
  hill=('#B9702F','#DDA85A'),hill_d=('#4B3320','#5A3D22'),
  motif=lambda col,rot=None: scatter(12,lambda x,y,i:leaf(x,y,9+(i%3)*3,random.randint(0,360),col[i%len(col)])),
  col=['#C8412B','#E8962A','#F0C040','#9E3B2E'],col_d=['#A5493A','#B8792C','#B89A3A','#7E3A33'],
  extra=lambda:''.join(poplar(x,196-(x%24)/4,62+(x%7)*7,'#E0A53A' if (x//30)%2 else '#C9822E') for x in range(30,600,66))),
'hiver':dict(
  tint=('rgba(170,185,235,.22)','rgba(250,225,235,.16)'), glow='rgba(255,208,222,.55)',
  hill=('#E9EEF7','#B9C6DE'),hill_d=('#34415A','#2A3550'),
  motif=lambda col,rot=None: scatter(15,lambda x,y,i:flake(x,y,5+(i%3)*2,col[i%len(col)]) if i%2==0 else f'<circle cx="{x}" cy="{y}" r="{1.8+(i%3)*0.6}" fill="{col[i%len(col)]}"/>'),
  col=['#FFFFFF','#BFD3F2','#F2CFE0'],col_d=['#9DB4CC','#7F97B0','#B5A0C0'],
  extra=lambda:''.join(pine(x,200-34+(x%24)/3,64+(x%5)*8,'#3F5A63','#FFFFFF') for x in range(30,600,80))),
}
css='/* Fonds de saison 2.0 (généré par gen_saison.py) : automne été indien · hiver aube givrée · printemps prairie fleurie · été lavande & blé. Accents inchangés (orange chasse, bleu pêche) */\n'
for name,d in S.items():
    for dark in (False,True):
        random.seed(11)
        col=d['col_d'] if dark else d['col']
        mot=uri(tile('<g opacity="'+('.30' if dark else '.45')+'">'+d['motif'](col)+'</g>'))
        h1,h2=(d['hill_d'] if dark else d['hill'])
        ex=d['extra']()
        if dark: ex=ex.replace('#FFFFFF','#9DB4CC')
        land=uri(hills(h1,h2,ex))
        t1,t2=d['tint']
        sel=f':root[data-saison="{name}"]'+(':is([data-theme="dark"])' if dark else ':not([data-theme="dark"]):not([data-theme="contrast"])')
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
