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

# --- faune (silhouettes) : origine = pied au sol ; dir=-1 pour retourner
def _g(x,y,s,d,body):
    s=s*1.45
    return f'<g transform="translate({x},{y}) scale({s*d:.2f},{s})">{body}</g>'
def deer(x,y,s,col,antlers=True,d=1):
    legs=''.join(f'<path d="M{a},-22 L{b},0" stroke="{col}" stroke-width="2.4" stroke-linecap="round"/>' for a,b in [(-12,-13),(-8,-7),(11,12),(15,17)])
    ant=f'<path d="M24,-50 L21,-64 M22,-58 L28,-63 M21,-64 L17,-69 M21,-64 L24,-70" stroke="{col}" stroke-width="1.7" fill="none" stroke-linecap="round"/>' if antlers else f'<path d="M24,-50 L23,-58" stroke="{col}" stroke-width="1.5" fill="none"/>'
    return _g(x,y,s,d,f'{legs}<ellipse cx="0" cy="-26" rx="18" ry="8" fill="{col}"/><path d="M11,-31 L20,-47 L26,-45 L20,-26 Z" fill="{col}"/><ellipse cx="28" cy="-47" rx="6.5" ry="3.2" transform="rotate(20 28 -47)" fill="{col}"/><ellipse cx="23" cy="-51" rx="2" ry="4" transform="rotate(-30 23 -51)" fill="{col}"/><ellipse cx="-18" cy="-30" rx="2.5" ry="4" fill="{col}"/>{ant}')
def boar(x,y,s,col,d=1):
    legs=''.join(f'<path d="M{a},-9 L{b},0" stroke="{col}" stroke-width="3" stroke-linecap="round"/>' for a,b in [(-14,-14),(-8,-8),(10,10),(15,16)])
    return _g(x,y,s,d,f'{legs}<ellipse cx="0" cy="-17" rx="21" ry="11" fill="{col}"/><path d="M17,-24 L36,-15 L36,-10 L17,-7 Z" fill="{col}"/><ellipse cx="36" cy="-13" rx="3" ry="3.5" fill="{col}"/><path d="M20,-27 L24,-36 L27,-26 Z" fill="{col}"/><path d="M-12,-27 L-6,-32 L0,-28 L6,-32 L12,-27" stroke="{col}" stroke-width="1.8" fill="none"/><path d="M-21,-20 q-6,-3 -3,-10" stroke="{col}" stroke-width="1.6" fill="none"/>')
def pheasant(x,y,s,col,tail='#8A4B2C',d=1):
    return _g(x,y,s,d,f'<path d="M-1,-8 L-1,0 M3,-8 L4,0" stroke="{col}" stroke-width="1.6"/><path d="M-8,-12 Q-26,-12 -36,-3 Q-20,-8 -8,-9 Z" fill="{tail}"/><ellipse cx="0" cy="-12" rx="9" ry="5" transform="rotate(-10)" fill="{col}"/><ellipse cx="9" cy="-19" rx="2.5" ry="5" fill="{col}"/><circle cx="11" cy="-25" r="3.2" fill="{col}"/><path d="M14,-25 L18,-24 L14,-23 Z" fill="{col}"/>')
def hare(x,y,s,col,d=1):
    return _g(x,y,s,d,f'<ellipse cx="-5" cy="-9" rx="10" ry="9" fill="{col}"/><ellipse cx="5" cy="-11" rx="6" ry="8" fill="{col}"/><ellipse cx="11" cy="-22" rx="5" ry="4" fill="{col}"/><ellipse cx="8" cy="-33" rx="2" ry="8" transform="rotate(-10 8 -33)" fill="{col}"/><ellipse cx="13" cy="-33" rx="2" ry="8" transform="rotate(10 13 -33)" fill="{col}"/><circle cx="-15" cy="-11" r="2.8" fill="{col}"/>')
def fox(x,y,s,col,tail='#E8D9C4',d=1):
    legs=''.join(f'<path d="M{a},-10 L{b},0" stroke="{col}" stroke-width="2" stroke-linecap="round"/>' for a,b in [(-10,-11),(-6,-6),(7,8),(11,12)])
    return _g(x,y,s,d,f'{legs}<ellipse cx="0" cy="-14" rx="14" ry="6" fill="{col}"/><path d="M13,-17 L24,-18 L31,-13 L24,-11 L14,-11 Z" fill="{col}"/><path d="M16,-18 L18,-27 L22,-18 Z M21,-18 L25,-26 L26,-17 Z" fill="{col}"/><path d="M-13,-14 Q-30,-22 -35,-8 Q-24,-6 -13,-10 Z" fill="{col}"/><path d="M-30,-12 Q-34,-9 -35,-8 Q-31,-8 -27,-9 Z" fill="{tail}"/>')
def fish(x,y,L,col,d=1,rot=0,op=1,h=.2):
    L=L*1.4;H=L*h
    b=f'<path d="M{L/2:.1f},0 C{L*.25:.1f},{-H*1.3:.1f} {-L*.18:.1f},{-H*1.1:.1f} {-L*.3:.1f},{-H*.15:.1f} L{-L/2:.1f},{-H*.8:.1f} L{-L/2:.1f},{H*.8:.1f} L{-L*.3:.1f},{H*.15:.1f} C{-L*.18:.1f},{H*1.1:.1f} {L*.25:.1f},{H*1.3:.1f} {L/2:.1f},0 Z" fill="{col}"/><path d="M{L*.05:.1f},{-H*1.05:.1f} L{-L*.15:.1f},{-H*1.9:.1f} L{-L*.2:.1f},{-H*.95:.1f} Z" fill="{col}"/><circle cx="{L*.33:.1f}" cy="{-H*.25:.1f}" r="{max(1.2,L*.035):.1f}" fill="#FFFFFF"/>'
    return f'<g opacity="{op}" transform="translate({x},{y}) rotate({rot}) scale({d},1)">{b}</g>'
def splash(x,y,col='#FFFFFF'):
    return f'<ellipse cx="{x}" cy="{y}" rx="13" ry="3" fill="none" stroke="{col}" stroke-width="1.5" opacity=".8"/><ellipse cx="{x}" cy="{y}" rx="22" ry="5" fill="none" stroke="{col}" stroke-width="1" opacity=".5"/><circle cx="{x-9}" cy="{y-9}" r="1.8" fill="{col}"/><circle cx="{x+8}" cy="{y-12}" r="1.5" fill="{col}"/><circle cx="{x+15}" cy="{y-5}" r="1.3" fill="{col}"/>'
def duck(x,y,s,body='#8B7355',head='#2F6B4F',d=1):
    return _g(x,y,s,d,f'<path d="M-12,-3 L-17,-8 L-9,-5 Z" fill="{body}"/><ellipse cx="0" cy="-3" rx="12" ry="5.5" fill="{body}"/><circle cx="9" cy="-11" r="4.2" fill="{head}"/><path d="M8,-8 L10,-5 L7,-5 Z" fill="{head}"/><path d="M12.5,-11 L18,-9.5 L12.5,-8.5 Z" fill="#E3B04B"/><path d="M-14,1 q14,3 28,0" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity=".7"/>')
def heron(x,y,s,col='#6F7F8C',d=1):
    return _g(x,y,s,d,f'<path d="M-2,-26 L-2,0 M3,-26 L5,-8" stroke="{col}" stroke-width="1.6"/><ellipse cx="0" cy="-32" rx="11" ry="5" transform="rotate(-22 0 -32)" fill="{col}"/><path d="M7,-35 Q16,-42 9,-52 Q6,-58 11,-62" stroke="{col}" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="12" cy="-63" r="3" fill="{col}"/><path d="M14,-64 L26,-62 L14,-61 Z" fill="#E3B04B"/><path d="M-9,-35 L-18,-30 L-8,-30 Z" fill="{col}"/>')
R=range
# --- 8 scènes : (saison, mode) -> chasse = lisière/forêt/champ, pêche = rive/étang/roselière
S={
('printemps','chasse'):dict(fauna=lambda:deer(120,172,.8,'#5A4030',False)+hare(330,180,.9,'#5A4030')+pheasant(480,178,.9,'#5A4030','#8A4B2C',-1),tint=('rgba(170,210,110,.20)','rgba(255,240,190,.14)'),glow='rgba(255,243,170,.40)',land=('hills','#79BB58','#B4DB80'),
  motif=petals(13),col=['#F7B8CB','#FFFFFF','#D9C2F5'],
  extra=lambda:''.join(oak(x,158-(x%3)*5,46+(x%5)*5,'#8CC56A' if (x//29)%2 else '#74B558') for x in R(25,600,58))+''.join(flower5(x,y,5,c,ctr) for x,y,c,ctr in [(60,186,'#FFFFFF','#FFD23F'),(170,190,'#D9C2F5','#FFFFFF'),(300,187,'#FFD23F','#E39A2D'),(430,190,'#F7B8CB','#FFFFFF'),(540,186,'#FFFFFF','#FFD23F')])),
('printemps','peche'):dict(fauna=lambda:fish(90,178,34,'#2F7F8C',1,0,.55)+fish(250,186,28,'#2F7F8C',-1,0,.5)+fish(420,172,36,'#2F7F8C',1,6,.55)+fish(335,112,38,'#4E6B78',1,-42)+splash(352,128)+duck(520,128,1,'#8B7355','#2F6B4F',-1),tint=('rgba(140,210,200,.22)','rgba(200,235,250,.16)'),glow='rgba(255,248,200,.40)',land=('lake','#A9D58A','#8FD0D0','#6DB9C4','#FFFFFF'),
  motif=petals(12),col=['#F7B8CB','#FFFFFF','#CDEFE3'],
  extra=lambda:''.join(reed(x,200,48+(x%4)*8,'#6FA85A','#7A5A3A',4 if x%2 else -4) for x in R(14,600,26) if x%78<40)+''.join(pad(x,y,11,'#5FA860','#F7B8CB') for x,y in [(210,172),(330,186),(450,170),(120,188)])),
('ete','chasse'):dict(fauna=lambda:deer(170,172,.85,'#5A3E2B',True)+pheasant(400,182,.95,'#4A3524','#8A4B2C')+hare(520,182,.9,'#5A3E2B',-1),tint=('rgba(255,214,120,.20)','rgba(255,240,200,.12)'),glow='rgba(255,224,120,.46)',land=('hills','#D9BE62','#8FA45A'),
  motif=dots(11),col=['#FFF2B0','#FFFFFF','#FFE39A'],
  extra=lambda:''.join(oak(x,146-(x%3)*4,56+(x%4)*6,'#4F7F3F') for x in R(30,600,64))+''.join(wheat(x,200,38-(x%20)) for x in R(14,600,30))),
('ete','peche'):dict(fauna=lambda:fish(150,178,62,'#2F6FA0',1,0,.5,.1)+fish(300,188,26,'#2F6FA0',-1,0,.5)+fish(470,174,34,'#2F6FA0',1,0,.5)+fish(400,106,40,'#4E6B78',-1,-40)+splash(380,126)+duck(60,128,1,'#8B7355','#2F6B4F')+duck(98,132,.8,'#B08A5A','#4A6A3A'),tint=('rgba(100,190,235,.20)','rgba(255,236,170,.16)'),glow='rgba(255,230,140,.50)',land=('lake','#9DB06A','#6EC1E4','#4FA9D6','#FFFFFF'),
  motif=dots(11),col=['#FFFFFF','#FFF2B0','#BFE3F7'],
  extra=lambda:''.join(reed(x,200,52+(x%4)*8,'#5E9A4E','#6B4A2B',4 if x%2 else -4) for x in R(14,600,26) if x%104<44)),
('automne','chasse'):dict(fauna=lambda:deer(112,176,.8,'#4A2F1E',True)+boar(360,182,.95,'#3E2A20',-1)+pheasant(520,184,.9,'#3E2A20','#8A4B2C'),tint=('rgba(214,120,60,.22)','rgba(150,90,50,.12)'),glow='rgba(255,196,90,.44)',land=('hills','#A8672F','#D49A4A'),
  motif=leaves(12),col=['#C8412B','#E8962A','#F0C040','#9E3B2E'],
  extra=lambda:''.join((pine(x,176-(x%3)*4,84+(x%4)*6,'#2F4A3A') if (x//31)%3==0 else oak(x,170-(x%3)*5,60+(x%5)*5,['#C8612B','#E39A2D','#9E3B2E'][(x//31)%3])) for x in R(28,600,62))),
('automne','peche'):dict(fauna=lambda:fish(140,178,46,'#3F6A72',1,0,.55,.26)+fish(330,188,40,'#3F6A72',-1,0,.5,.26)+fish(480,112,38,'#4E6B78',1,-42)+splash(500,128,'#F6D38A')+heron(250,150,1,'#6F7F8C'),tint=('rgba(220,150,70,.20)','rgba(120,150,170,.14)'),glow='rgba(255,200,110,.46)',land=('lake','#C9923F','#6F9AA0','#5B8A93','#F6D38A'),
  motif=leaves(10),col=['#C8412B','#E8962A','#F0C040'],
  extra=lambda:''.join(poplar(x,122-(x%2)*3,50+(x%5)*5,'#E0A53A' if (x//30)%2 else '#C9822E') for x in R(30,600,66))+''.join(reed(x,200,50+(x%4)*8,'#B8863A','#6B4A2B',4 if x%2 else -4) for x in R(14,600,26) if x%104<40)),
('hiver','chasse'):dict(fauna=lambda:deer(100,178,.85,'#33302E',False)+fox(300,182,.95,'#9A4A22')+hare(470,182,.9,'#4A4A4F',-1),tint=('rgba(150,170,210,.22)','rgba(240,235,240,.14)'),glow='rgba(255,214,225,.50)',land=('hills','#EEF1F7','#C3CEE2'),
  motif=flakes(15),col=['#FFFFFF','#BFD3F2','#F2CFE0'],
  extra=lambda:''.join(pine(x,200-30+(x%24)/3,70+(x%5)*9,'#2F4A44','#FFFFFF') for x in R(24,600,46))),
('hiver','peche'):dict(fauna=lambda:fish(120,180,34,'#7FA3BF',1,0,.45)+fish(300,188,30,'#7FA3BF',-1,0,.45)+fish(470,178,38,'#7FA3BF',1,0,.45)+heron(390,150,1,'#8794A3',-1),tint=('rgba(150,200,225,.26)','rgba(240,246,252,.16)'),glow='rgba(255,255,255,.55)',land=('lake','#E4EBF4','#D5E7F3','#BFD9EA','#FFFFFF'),
  motif=flakes(15),col=['#FFFFFF','#CFE0F0','#FFFFFF'],
  extra=lambda:''.join(pine(x,118,34+(x%4)*5,'#4A6670','#FFFFFF') for x in R(20,600,44))+''.join(reed(x,200,46+(x%4)*8,'#B9A687','#8B7355',4 if x%2 else -4) for x in R(14,600,26) if x%104<38)+''.join(crack(x,y,38,'#9BB8CF') for x,y in [(60,168),(210,178),(330,166),(470,176),(540,170)])),
}
css='/* Fonds de saison 3.0 (généré par gen_saison.py) : 4 saisons x chasse/pêche. Automne = été indien. Accents inchangés (orange chasse, bleu pêche) */\n'
for (name,mode),d in S.items():
    for dark in (False,True):
        random.seed(11)
        col=d['col']
        mot=tile('<g opacity="'+('.30' if dark else '.45')+'">'+d['motif'](col)+'</g>')
        ex=d['extra']()+d['fauna']()
        if d['land'][0]=='hills': land=hills(d['land'][1],d['land'][2],ex)
        else: land=lake(d['land'][1],d['land'][2],d['land'][3],d['land'][4],ex)
        t1,t2=d['tint']
        sel=f':root[data-saison="{name}"]'+('[data-season="peche"]' if mode=='peche' else ':not([data-season="peche"])')+(':is([data-theme="dark"])' if dark else ':not([data-theme="dark"]):not([data-theme="contrast"])')
        tint=f'linear-gradient(180deg,{alpha(t1,.4)},transparent 55%)' if dark else f'linear-gradient(180deg,{t1},{t2} 100%)'
        glow=f'radial-gradient(ellipse 60% 38% at 82% 0%,{alpha(d["glow"],.26) if dark else d["glow"]},transparent 70%)'
        photo=f'url("img/saison-{name}-{mode}.webp")'
        css+=f'{sel} {{ --saison-art: {glow}, {tint}; --saison-photo: {photo}; }}\n'
css+='''.page::before { content: ""; display: block; height: 170px; margin: 0 0 20px; border-radius: 20px; background: var(--saison-photo, none) center / cover no-repeat, var(--surface-3, #ddd); box-shadow: inset 0 0 0 1px rgba(0,0,0,.06); }
:root[data-theme="dark"] .page::before { filter: brightness(.62) saturate(.85) contrast(1.05); }
@media (min-width: 900px) { .page::before { height: 210px; } }
:root:not([data-saison]) .page::before, :root[data-theme="contrast"] .page::before, :root[data-role="admin"] .page::before { display: none; }
@media print { .page::before { display: none; } }
@media (max-width: 900px) { :root { --land-off: 70px; } }
body { background: var(--saison-art, none), var(--pattern, none), var(--bg); background-attachment: fixed; }
:root[data-theme="contrast"] body, :root[data-role="admin"] body { background: var(--bg); }
@media print { body { background: #fff !important; } }
@media (prefers-reduced-motion: no-preference) { body { transition: background-color .4s; } }
'''
open('saison.css','w',encoding='utf-8').write(css)
print(len(css))
