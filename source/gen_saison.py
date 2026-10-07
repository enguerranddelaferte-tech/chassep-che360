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
P={}
# --- thèmes clair / sombre : (tint haut, tint bas, collines 1, collines 2, motif couleurs...)
S={
'printemps':dict(
  tint=('rgba(150,200,120,.16)','rgba(255,214,222,.12)'), glow='rgba(255,236,170,.30)',
  hill=('#8DBB6C','#A8CF86'),hill_d=('#2E4A33','#274029'),
  motif=lambda col,rot=None: scatter(13,lambda x,y,i:petal(x,y,7+(i%3)*2,random.randint(0,180),col[i%len(col)])),
  col=['#F4B6C6','#FFD9E2','#FFFFFF'],col_d=['#C98BA0','#B07890','#8FA79A'],
  extra=lambda:''.join(f'<circle cx="{x}" cy="{y}" r="3" fill="{c}"/>' for x,y,c in [(60,150,'#F4B6C6'),(130,160,'#FFFFFF'),(250,152,'#FFD27A'),(330,158,'#F4B6C6'),(440,150,'#FFFFFF'),(540,160,'#FFD27A')])),
'ete':dict(
  tint=('rgba(255,214,120,.20)','rgba(255,240,200,.10)'), glow='rgba(255,208,90,.38)',
  hill=('#E3B64F','#EFCB74'),hill_d=('#5A4A22','#4B3E1D'),
  motif=lambda col,rot=None: scatter(11,lambda x,y,i:f'<circle cx="{x}" cy="{y}" r="{2.2+(i%3)}" fill="{col[i%len(col)]}"/>'),
  col=['#F2C14E','#FFE39A','#FFFFFF'],col_d=['#9A7F34','#B59A52','#7C6C3E'],
  extra=lambda:''.join(f'<path d="M{x},200 L{x},{150-(x%20)}" stroke="#C99A2E" stroke-width="2"/><ellipse cx="{x}" cy="{146-(x%20)}" rx="3" ry="8" fill="#D9A93A"/>' for x in range(20,600,34))),
'automne':dict(
  tint=('rgba(230,150,70,.17)','rgba(190,100,50,.10)'), glow='rgba(255,190,110,.30)',
  hill=('#B8683A','#CC8451'),hill_d=('#4A2E20','#3C2519'),
  motif=lambda col,rot=None: scatter(12,lambda x,y,i:leaf(x,y,9+(i%3)*3,random.randint(0,360),col[i%len(col)])),
  col=['#D9622B','#E39A2D','#B8452A','#C98A3C'],col_d=['#A8502A','#B87A28','#8C3A22','#8F6A30'],
  extra=lambda:''.join(pine(x,200-44+(x%30)/3,70+(x%7)*6,'#8A4B2C') for x in range(40,600,90))),
'hiver':dict(
  tint=('rgba(150,190,225,.20)','rgba(235,243,252,.16)'), glow='rgba(255,255,255,.45)',
  hill=('#E8EEF5','#D5E0EC'),hill_d=('#3A4756','#2F3B49'),
  motif=lambda col,rot=None: scatter(15,lambda x,y,i:flake(x,y,5+(i%3)*2,col[i%len(col)]) if i%2==0 else f'<circle cx="{x}" cy="{y}" r="{1.8+(i%3)*0.6}" fill="{col[i%len(col)]}"/>'),
  col=['#FFFFFF','#CFE0F0','#FFFFFF'],col_d=['#9DB4CC','#7F97B0','#B5C9DD'],
  extra=lambda:''.join(pine(x,200-34+(x%24)/3,64+(x%5)*8,'#4E6B5C','#FFFFFF') for x in range(30,600,80))),
}
css='/* Fonds de saison (généré par gen_saison.py) : couleurs d’accent inchangées (orange chasse, bleu pêche) */\n'
for name,d in S.items():
    for dark in (False,True):
        random.seed(11)
        col=d['col_d'] if dark else d['col']
        mot=uri(tile('<g opacity="'+('.30' if dark else '.45')+'">'+d['motif'](col)+'</g>'))
        h1,h2=(d['hill_d'] if dark else d['hill'])
        land=uri(hills(h1,h2,d['extra']() if not dark else d['extra']().replace('#FFFFFF','#9DB4CC')))
        t1,t2=d['tint']
        sel=f':root[data-saison="{name}"]'+(':is([data-theme="dark"])' if dark else ':not([data-theme="dark"]):not([data-theme="contrast"])')
        if dark: tint=f'linear-gradient(180deg,{t1.replace(".16",".07").replace(".20",".08").replace(".17",".08").replace(".16",".07")},transparent 55%)'
        else: tint=f'linear-gradient(180deg,{t1},{t2} 100%)'
        glow=f'radial-gradient(ellipse 60% 38% at 82% 0%,{d["glow"] if not dark else d["glow"].replace(".38",".10").replace(".30",".08").replace(".45",".10")},transparent 70%)'
        op=1
        css+=f'{sel} {{ --saison-art: {land} center calc(100% - var(--land-off,0px)) / 600px 200px repeat-x, {mot} 0 0 / 420px 420px repeat, {glow}, {tint}; }}\n'
css+='''@media (max-width: 900px) { :root { --land-off: 70px; } }
body { background: var(--saison-art, none), var(--pattern, none), var(--bg); background-attachment: fixed; }
:root[data-theme="contrast"] body, :root[data-role="admin"] body { background: var(--bg); }
@media print { body { background: #fff !important; } }
@media (prefers-reduced-motion: no-preference) { body { transition: background-color .4s; } }
'''
open('saison.css','w',encoding='utf-8').write(css)
print(len(css))
