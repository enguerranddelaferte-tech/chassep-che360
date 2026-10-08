# Rendu procédural « réaliste » des bandeaux de saison (8 scènes) -> ../img/saison-<saison>-<mode>.webp
# Ciel + nuages, collines en perspective atmosphérique, feuillages texturés, eau avec reflet, faune ombrée, grain.
import numpy as np, cv2, math, random, os, sys
from PIL import Image, ImageDraw, ImageFilter
W,H=1600,400
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','img')
os.makedirs(OUT,exist_ok=True)
def hx(c): c=c.lstrip('#'); return np.array([int(c[i:i+2],16)/255 for i in (0,2,4)],dtype=np.float32)
def lerp(a,b,t): return a+(b-a)*t
def sm(x,a,b): t=np.clip((x-a)/(b-a),0,1); return t*t*(3-2*t)
def noise2(h,w,cy,cx,seed):
    r=np.random.default_rng(seed).random((cy+4,cx+4)).astype(np.float32)
    return cv2.resize(r,(w+0,h+0),interpolation=cv2.INTER_CUBIC)
def fbm2(h,w,cy,cx,seed,oct=5,p=.5):
    out=np.zeros((h,w),np.float32);a=1;tot=0
    for o in range(oct):
        out+=a*noise2(h,w,max(1,cy*2**o),max(1,cx*2**o),seed+o*17);tot+=a;a*=p
    out/=tot;return (out-out.min())/(out.max()-out.min()+1e-6)
def fbm1(n,cells,seed,oct=5,p=.5):
    out=np.zeros(n,np.float32);a=1;tot=0
    for o in range(oct):
        r=np.random.default_rng(seed+o*13).random(cells*2**o+4).astype(np.float32)
        out+=a*cv2.resize(r.reshape(1,-1),(n,1),interpolation=cv2.INTER_CUBIC)[0];tot+=a;a*=p
    out/=tot;return (out-out.min())/(out.max()-out.min()+1e-6)
def to_img(a): return Image.fromarray((np.clip(a,0,1)*255).astype(np.uint8))
def blend(base,rgba_img,blur=0):
    im=rgba_img.resize((W,H),Image.LANCZOS) if rgba_img.size!=(W,H) else rgba_img
    if blur: im=im.filter(ImageFilter.GaussianBlur(blur))
    a=np.asarray(im,dtype=np.float32)/255
    return base*(1-a[...,3:4])+a[...,:3]*a[...,3:4]
def haze(c,hc,t): return lerp(c,hc,t)

# ---------------------------------------------------------------- ciel
def sky(sc):
    ys=np.linspace(0,1,H)[:,None,None]
    stops=sc['sky'];pos=[p for p,_ in stops];cols=[hx(c) for _,c in stops]
    img=np.zeros((H,W,3),np.float32)
    for ch in range(3):
        img[...,ch]=np.interp(ys[:,0,0],pos,[c[ch] for c in cols])[:,None]
    sx,sy=sc['sun'];rr=np.hypot((np.arange(W)[None,:]/W-sx)*2.2,(np.arange(H)[:,None]/H-sy)*1.0)
    g=np.exp(-rr*rr*sc.get('sunk',9))[...,None]*hx(sc['suncol'])*sc['sunI']
    img=img+g
    # nuages
    cl=fbm2(H,W,3,6,sc['seed'],6,.55);cl2=fbm2(H,W,5,9,sc['seed']+5,5,.5)
    cov=sc['cloud'];m=sm(cl*.7+cl2*.3,1-cov,1-cov+.28)*sm(1-np.arange(H)[:,None]/(H*.62),0,.5)
    shade=np.clip(1.08-cl2*.5,0,1)[...,None]
    ccol=hx(sc.get('cloudcol','#FFFFFF'))*shade+hx(sc['suncol'])*.12*(1-shade)
    img=img*(1-m[...,None]*.9)+ccol*m[...,None]*.9
    return img
# ---------------------------------------------------------------- relief & végétation
def ridge(base,amp,seed,cells=6,oct=5,rough=.5):
    f=fbm1(W,cells,seed,oct,rough)
    return (base+amp*(f-.5)*2)*H
def hill(img,rd,col,hc,t,texture=.05,rim=.08,seed=0,bottom=H):
    ys=np.arange(H)[:,None];m=(ys>=rd[None,:]).astype(np.float32)
    m=cv2.GaussianBlur(m,(0,0),.8)
    c=haze(hx(col),hx(hc),t)
    depth=np.clip((ys-rd[None,:])/80,0,1)[...,None]
    tex=fbm2(H,W,12,24,seed+1,4)[...,None]
    shade=c*(1-texture+texture*2*tex)*(1-.18*depth)+hx(hc)*0
    shade=shade+rim*np.exp(-(ys-rd[None,:])/14)[...,None]*(1-t)
    return img*(1-m[...,None])+shade*m[...,None]
def mist(img,y0,y1,col,amt,seed):
    ys=np.arange(H)[:,None]/H;band=np.exp(-((ys-(y0+y1)/2)/((y1-y0)/2))**2)
    n=fbm2(H,W,2,5,seed,4)
    a=(band*(.45+.9*n)*amt)[...,None]
    return img*(1-a)+hx(col)*a
def layer():
    im=Image.new('RGBA',(W*2,H*2),(0,0,0,0));return im,ImageDraw.Draw(im)
def deciduous(d,x,y,h,cols,rnd,light=(.7,-.7),trunk='#4B3A2B',n=190,spread=1.0):
    X,Y=x*2,y*2;hh=h*2
    d.line([(X,Y),(X+rnd.uniform(-3,3),Y-hh*.45)],fill=trunk,width=max(2,int(hh*.035)))
    for _ in range(n):
        a=rnd.uniform(0,2*math.pi);r=math.sqrt(rnd.random())
        px=X+math.cos(a)*r*hh*.34*spread;py=Y-hh*.62+math.sin(a)*r*hh*.34
        cr=hh*rnd.uniform(.032,.06)
        L=(math.cos(a)*light[0]+math.sin(a)*light[1])*r*.5+.5
        c=hx(rnd.choice(cols))*(.62+.55*L)
        d.ellipse([px-cr,py-cr,px+cr,py+cr],fill=tuple(int(v*255) for v in np.clip(c,0,1))+(255,))
def conifer(d,x,y,h,col,rnd,snow=False,light=.5):
    X,Y=x*2,y*2;hh=h*2;w=hh*.22
    d.line([(X,Y),(X,Y-hh*.15)],fill='#3A2C22',width=max(2,int(hh*.03)))
    tiers=7
    for i in range(tiers):
        t=i/(tiers-1);ty=Y-hh*.12-hh*.84*t;tw=w*(1-t*.88)*1.35;th=hh*.2
        for side in (-1,1):
            c=hx(col)*(1.0+.25*side*light-.1*t)
            cc=tuple(int(v*255) for v in np.clip(c,0,1))+(255,)
            pts=[(X,ty-th*.9),(X+side*tw,ty+th*.1)]
            for k in range(6):
                pts.append((X+side*tw*(1-k/6)+rnd.uniform(-2,2),ty+th*.1+ (k%2)*th*.12))
            d.polygon(pts+[(X,ty+th*.1)],fill=cc)
        if snow:
            d.polygon([(X,ty-th*.9),(X+tw*.55,ty-th*.15),(X+tw*.2,ty-th*.3),(X,ty-th*.25),(X-tw*.2,ty-th*.3),(X-tw*.55,ty-th*.15)],fill=(246,248,252,235))
def poplar(d,x,y,h,cols,rnd):
    X,Y=x*2,y*2;hh=h*2
    d.line([(X,Y),(X,Y-hh*.2)],fill='#5A4634',width=max(2,int(hh*.025)))
    for _ in range(95):
        t=rnd.random();py=Y-hh*.18-hh*.8*t;wd=hh*.1*math.sin(math.pi*min(1,t*.95+.05))**.7+hh*.02
        px=X+rnd.uniform(-wd,wd);cr=hh*rnd.uniform(.03,.05)
        L=.5+.5*(px-X)/(wd+1)
        c=hx(rnd.choice(cols))*(.65+.5*L)
        d.ellipse([px-cr,py-cr,px+cr,py+cr],fill=tuple(int(v*255) for v in np.clip(c,0,1))+(255,))
def bare(d,x,y,h,col,rnd,snow=False):
    X,Y=x*2,y*2;hh=h*2
    def br(x0,y0,ang,ln,w,dep):
        if dep==0 or ln<4:return
        x1=x0+math.cos(ang)*ln;y1=y0-math.sin(ang)*ln
        d.line([(x0,y0),(x1,y1)],fill=col,width=max(1,int(w)))
        if snow and dep>2: d.line([(x0,y0-1),(x1,y1-1)],fill=(240,245,250,200),width=max(1,int(w*.4)))
        for s in (-1,1): br(x1,y1,ang+s*rnd.uniform(.35,.6),ln*rnd.uniform(.62,.75),w*.7,dep-1)
        if rnd.random()<.5: br(x1,y1,ang+rnd.uniform(-.15,.15),ln*.7,w*.7,dep-1)
    br(X,Y,math.pi/2+rnd.uniform(-.1,.1),hh*.32,hh*.03,6)
# ---------------------------------------------------------------- faune
def chaikin(pts,n=2):
    p=list(pts)
    for _ in range(n):
        q=[]
        for i in range(len(p)):
            a=p[i];b=p[(i+1)%len(p)]
            q+= [(a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25),(a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75)]
        p=q
    return p
SS=4
def shade_part(mask,pal,seed=0):
    # mask L (SSx) -> RGBA ombrée : lumière du haut-droit, ventre sombre, texture
    m=np.asarray(mask,dtype=np.float32)/255
    ys,xs=np.nonzero(m>.5)
    if len(ys)==0:return np.zeros(m.shape+(4,),np.float32)
    y0,y1=ys.min(),ys.max();x0,x1=xs.min(),xs.max()
    gy=np.clip((np.arange(m.shape[0])[:,None]-y0)/max(1,y1-y0),0,1)
    gx=np.clip((np.arange(m.shape[1])[None,:]-x0)/max(1,x1-x0),0,1)
    t=np.clip(gy*.85+(1-gx)*.15,0,1)
    L,M,D=hx(pal[0]),hx(pal[1]),hx(pal[2])
    c=np.where((t<.45)[...,None],lerp(L,M,(t/.45)[...,None]),lerp(M,D,((t-.45)/.55)[...,None]))
    n=noise2(m.shape[0],m.shape[1],40,40,seed+3)[...,None]
    c=c*(.88+.24*n)
    # liseré de lumière en haut
    sh=np.roll(m,SS*3,axis=0);rim=np.clip(m-sh,0,1)[...,None]
    c=c+rim*.22
    return np.dstack([np.clip(c,0,1),m])
def render_parts(parts,s,pos,base,seed=0,flip=False,shadow=True,alpha=1.0,blur=0,ground=True,rot=None):
    """parts: [(type,data,pal,width)] ; coordonnées en unités (sol y=0, x vers la droite)"""
    x,y=pos
    allp=[p for t,dd,pal,wd in parts for p in (dd if t!='line' else dd)]
    xs=[q[0] for t,dd,pal,wd in parts for q in dd];ys_=[q[1] for t,dd,pal,wd in parts for q in dd]
    ux0,ux1,uy0,uy1=min(xs)-8,max(xs)+8,min(ys_)-8,max(ys_)+8
    cw=int((ux1-ux0)*s*SS)+8;ch=int((uy1-uy0)*s*SS)+8
    def P(q):
        px=(q[0]-ux0)*s*SS+4
        if flip: px=cw-px
        return (px,(q[1]-uy0)*s*SS+4)
    out=np.zeros((ch,cw,4),np.float32)
    for i,(t,dd,pal,wd) in enumerate(parts):
        mk=Image.new('L',(cw,ch),0);dr=ImageDraw.Draw(mk)
        pts=[P(q) for q in dd]
        if t=='poly': dr.polygon(chaikin(pts,2) if len(pts)>3 else pts,fill=255)
        elif t=='sharp': dr.polygon(pts,fill=255)
        elif t=='line':
            dr.line(chaikin(pts,2) if False else pts,fill=255,width=max(1,int(wd*s*SS)),joint='curve')
            for q in (pts[0],pts[-1]):
                rr=wd*s*SS/2;dr.ellipse([q[0]-rr,q[1]-rr,q[0]+rr,q[1]+rr],fill=255)
        elif t=='ell':
            (cx,cy),(rx,ry)=pts[0],(dd[1][0]*s*SS,dd[1][1]*s*SS);dr.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],fill=255)
        mk=mk.filter(ImageFilter.GaussianBlur(.8))
        r=shade_part(mk,pal,seed+i)
        a=r[...,3:4]
        out[...,:3]=out[...,:3]*(1-a)+r[...,:3]*a;out[...,3:4]=np.clip(out[...,3:4]+a*(1-out[...,3:4]),0,1)
    im=Image.fromarray((out*255).astype(np.uint8),'RGBA')
    fw,fh=max(2,int(cw/SS)),max(2,int(ch/SS))
    im=im.resize((fw,fh),Image.LANCZOS)
    if blur: im=im.filter(ImageFilter.GaussianBlur(blur))
    # ombre portée au sol
    px=int(x-(0-ux0)*s) if not flip else int(x-(0-ux0)*s)
    ox=int(x-(-ux0)*s-(0 if not flip else 0));oy=int(y-(-uy0)*s)
    if flip: ox=int(x-(cw/SS-(-ux0)*s))
    if rot is not None:
        im=im.rotate(rot,expand=True,resample=Image.BICUBIC);fw,fh=im.size;ox=int(x-fw/2);oy=int(y-fh/2)
    if shadow:
        sh=np.zeros((H,W),np.float32);ww=(ux1-ux0)*s*.42
        cv2.ellipse(sh,(int(x),int(y)+1),(int(ww),max(2,int(s*3.2))),0,0,360,1,-1)
        sh=cv2.GaussianBlur(sh,(0,0),3)*.5*alpha
        base=base*(1-sh[...,None]*.9)
    arr=np.asarray(im,dtype=np.float32)/255;arr[...,3]*=alpha
    # coller
    y_a,x_a=oy,ox
    ys0,xs0=max(0,y_a),max(0,x_a);ye,xe=min(H,y_a+fh),min(W,x_a+fw)
    if ye<=ys0 or xe<=xs0:return base
    sub=arr[ys0-y_a:ye-y_a,xs0-x_a:xe-x_a]
    base[ys0:ye,xs0:xe]=base[ys0:ye,xs0:xe]*(1-sub[...,3:4])+sub[...,:3]*sub[...,3:4]
    return base
# silhouettes (unités ; sol y=0 ; tête vers +x)
def deer_parts(coat,stag=True):
    body=[(-20,-46),(-8,-50),(6,-49),(16,-48),(23,-56),(28,-64),(31,-69),(31,-73),(35,-77),(37,-70),(39,-68),(47,-60),(51,-58),(48,-54),(41,-55),(35,-52),(31,-44),(26,-34),(22,-27),(21,-18),(21,-6),(22,0),(16,0),(16,-8),(15,-20),(13,-25),(4,-25),(-6,-26),(-11,-26),(-12,-18),(-10,-8),(-9,0),(-15,0),(-17,-8),(-21,-18),(-25,-26),(-29,-36),(-28,-44),(-29,-47)]
    far=[('line',[(10,-30),(10,-8),(9,0)],(coat[1],coat[2],coat[2]),3.4),('line',[(-18,-26),(-17,-8),(-18,0)],(coat[1],coat[2],coat[2]),3.6)]
    ant=[]
    if stag:
        ac=('#CDBE9E','#9C8E70','#5E5340')
        ant=[('line',[(31,-70),(27,-84),(22,-96),(16,-104)],ac,2.2),('line',[(27,-84),(34,-90)],ac,1.6),('line',[(24,-92),(31,-99)],ac,1.6),('line',[(22,-96),(14,-93)],ac,1.5),('line',[(18,-102),(21,-111)],ac,1.5),
             ('line',[(28,-71),(25,-82),(21,-93),(17,-100)],('#A99A7A','#7C705A','#4B4333'),2.0)]
    return far+[('poly',body,coat,0)]+ant
def boar_parts(c=('#6A584A','#41332A','#1E1712')):
    body=[(-33,-22),(-26,-31),(-12,-36),(2,-37),(14,-35),(24,-30),(32,-25),(38,-22),(46,-15),(52,-12),(52,-8),(47,-6),(40,-8),(34,-10),(30,-10),(28,-6),(27,0),(22,0),(22,-8),(20,-12),(8,-12),(-8,-12),(-14,-12),(-16,-8),(-16,0),(-22,0),(-23,-8),(-26,-14),(-31,-18)]
    return [('line',[(14,-14),(14,-6),(14,0)],(c[1],c[2],c[2]),4.2),('line',[(-6,-14),(-6,-6),(-7,0)],(c[1],c[2],c[2]),4.2),('poly',body,c,0),
            ('sharp',[(30,-32),(33,-42),(37,-30)],c,0),('line',[(-10,-36),(-4,-42),(2,-38),(8,-43),(14,-36)],(c[1],c[2],c[2]),2.2),('line',[(-33,-23),(-39,-18),(-38,-12)],c,1.5)]
def fox_parts():
    c=('#E58A3C','#C0601F','#6E2E0E')
    body=[(-14,-16),(-6,-21),(6,-21),(14,-19),(19,-24),(22,-30),(23,-36),(26,-30),(28,-37),(30,-29),(31,-26),(38,-21),(39,-19),(33,-17),(26,-16),(19,-13),(18,-6),(18,0),(15,0),(14,-8),(10,-12),(0,-11),(-8,-11),(-10,-6),(-10,0),(-13,0),(-14,-8),(-16,-12)]
    tail=[(-14,-16),(-28,-22),(-42,-16),(-46,-8),(-40,-4),(-28,-8),(-15,-9)]
    return [('line',[(6,-12),(6,-5),(5,0)],('#7A3A14','#4C2209','#2A1205'),2.6),('poly',tail,c,0),('poly',body,c,0),('poly',[(-46,-8),(-40,-4),(-37,-9),(-42,-14)],('#FFFFFF','#EDE3D2','#BFB5A2'),0),
            ('poly',[(31,-19),(38,-20),(39,-19),(33,-17),(28,-16)],('#FFF6EA','#E9DCC8','#BDAF98'),0),('line',[(14,-10),(14,-4),(14,0)],('#2A1A10','#1D120A','#120A05'),2.4)]
def hare_parts():
    c=('#C9AE88','#9C8260','#5C4833')
    body=[(-12,-2),(-14,-10),(-11,-18),(-4,-22),(2,-22),(8,-26),(12,-32),(16,-35),(20,-35),(24,-32),(22,-29),(17,-28),(12,-22),(11,-12),(11,0),(14,0),(-6,0)]
    return [('poly',body,c,0),('ell',[(-5,-9),(10,9)],c,0),('poly',[(9,-33),(6,-52),(10,-52),(13,-34)],c,0),('poly',[(12,-33),(14,-51),(18,-50),(16,-33)],('#B9A07D','#8C7554','#4E3D2A'),0),('ell',[(-14,-12),(3.4,3.4)],('#FFFFFF','#EEE6D8','#C9BFAE'),0)]
def pheasant_parts():
    return [('line',[(-1,-9),(-1,0)],('#6B5A3A','#4C3F28','#2E2515'),1.6),('line',[(3,-9),(4,0)],('#6B5A3A','#4C3F28','#2E2515'),1.6),
            ('poly',[(-6,-14),(-30,-11),(-44,-3),(-30,-9),(-8,-8)],('#C98A4E','#9C5E2B','#5E3516'),0),
            ('poly',[(-9,-15),(-4,-20),(6,-21),(11,-18),(11,-11),(4,-7),(-5,-8)],('#D9893B','#AE5B1D','#5E2E0B'),0),
            ('poly',[(8,-19),(10,-26),(14,-26),(13,-18)],('#3B8F78','#1F6B55','#0F3A2E'),0),('ell',[(12,-28),(3.6,3.4)],('#2F8F76','#1B6A55','#0C3A2E'),0),
            ('sharp',[(15,-28),(20,-27),(15,-26)],('#E8D9A8','#C9B77A','#8A7A4A'),0),('ell',[(10,-27.5),(1.9,1.6)],('#C23B2B','#A02A1B','#6A1C11'),0)]
def duck_parts():
    return [('poly',[(-16,-6),(-10,-1),(8,-1),(14,-5),(12,-9),(0,-11),(-9,-10)],('#B9B7AE','#8E8D85','#55544D'),0),('poly',[(-18,-10),(-9,-9),(-12,-5)],('#2A2A28','#1A1A18','#0E0E0D'),0),
            ('poly',[(8,-8),(12,-5),(14,-3),(8,-1)],('#8A4E34','#6B3A26','#3E2015'),0),('poly',[(9,-9),(10,-14),(13,-15),(14,-9)],('#FFFFFF','#E8E8E4','#BDBDB6'),0),('ell',[(12,-15.5),(4.6,4.2)],('#2F9B73','#1A7455','#0E4A36'),0),
            ('sharp',[(15.5,-16),(22,-14.5),(15.5,-13)],('#F2D04A','#D9B12E','#9A7E16'),0)]
def heron_parts(c=('#B9C5D1','#8B98A6','#55626F')):
    return [('line',[(-1,-34),(-1,-2),(-2,0)],('#B8A66A','#8E7D45','#5B4E27'),1.7),('line',[(4,-32),(6,-14),(6,0)],('#B8A66A','#8E7D45','#5B4E27'),1.7),
            ('poly',[(-16,-44),(-6,-40),(6,-42),(10,-36),(2,-30),(-8,-30),(-14,-34)],c,0),
            ('line',[(7,-40),(15,-48),(8,-58),(10,-68),(15,-74)],('#E8EDF2','#C5CFD9','#8E9AA6'),3.2),
            ('ell',[(16,-76),(3.8,3.2)],('#F5F7F9','#DCE3EA','#A9B3BD'),0),('sharp',[(19,-77),(36,-74),(19,-74)],('#F0C23B','#D19F1D','#8E6A0B'),0),
            ('line',[(12,-78),(2,-84)],('#1E242B','#14181D','#0A0C0F'),1.4)]
def fish_parts(L,h,back,belly,fin):
    H_=L*h
    body=[(L/2,0),(L*.3,-H_*.85),(0,-H_*1.05),(-L*.25,-H_*.62),(-L*.36,-H_*.22),(-L*.36,H_*.22),(-L*.25,H_*.6),(0,H_*.95),(L*.3,H_*.8)]
    tail=[(-L*.34,0),(-L*.52,-H_*1.15),(-L*.47,0),(-L*.52,H_*1.15)]
    dors=[(L*.08,-H_*1.0),(-L*.12,-H_*1.9),(-L*.22,-H_*.7)]
    return [('poly',tail,fin,0),('poly',dors,fin,0),('poly',body,(belly,back,back),0),('ell',[(L*.33,-H_*.25),(max(1.4,L*.03),max(1.4,L*.03))],('#FFFFFF','#EDEDED','#222222'),0)]
# ---------------------------------------------------------------- eau
def water_scene(img,wl,sc,rnd):
    """reflète la partie haute (0..wl) dans l'eau (wl..H)"""
    top=img[:wl].copy()
    nrow=H-wl
    refl=top[::-1][:nrow]
    if refl.shape[0]<nrow: refl=np.vstack([refl,np.repeat(refl[-1:],nrow-refl.shape[0],0)])
    # ondulation + flou vertical progressif
    ys=np.arange(nrow)[:,None]
    n1=fbm2(nrow,W,3,40,sc['seed']+90,3)
    disp=((n1-.5)*26*(.3+ys/nrow))
    xs=(np.arange(W)[None,:]+disp).astype(np.float32);yy=np.repeat(np.arange(nrow)[:,None],W,1).astype(np.float32)
    refl=cv2.remap(refl.astype(np.float32),xs,yy,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT)
    refl=cv2.GaussianBlur(refl,(0,0),sigmaX=2.2,sigmaY=1.2)
    wc=hx(sc['water']);wd=hx(sc['water2'])
    depth=np.clip(ys/nrow,0,1)[...,None]
    base=lerp(wc,wd,depth)
    mixk=sc.get('refl',.62)*(1-.4*depth)
    water=base*(1-mixk)+refl*mixk
    # traînées horizontales + brillances
    st=fbm2(nrow,W,60,3,sc['seed']+77,3)
    water=water*(.93+.14*st[...,None])
    glint=np.clip((fbm2(nrow,W,90,30,sc['seed']+31,2)-.72)*5,0,1)*sm(np.arange(W)[None,:]/W,.45,.95)
    water=water+glint[...,None]*hx(sc['suncol'])*sc.get('glint',.45)*(1-depth)
    out=img.copy();out[wl:]=water
    # ligne de rive adoucie
    return out
def reeds(img,rnd,col,head,xs,base_y,hmin,hmax,blur=0,alpha=1,sway=1):
    lay,d=layer()
    for x in xs:
        hh=rnd.uniform(hmin,hmax)*2;X=x*2;Y=base_y*2;lean=rnd.uniform(-.14,.14)*sway
        pts=[(X,Y)]
        for k in range(1,9):
            t=k/8;pts.append((X+math.sin(lean*3)*hh*t*t*.5+lean*hh*t*t,Y-hh*t))
        cc=tuple(int(v*255) for v in hx(col)*rnd.uniform(.8,1.15))
        d.line(pts,fill=cc+(255,),width=max(2,int(hh*.014)))
        if head and rnd.random()<.8:
            hx_,hy_=pts[-3];ln=hh*.12
            d.ellipse([hx_-ln*.14,hy_-ln*.5,hx_+ln*.14,hy_+ln*.5],fill=tuple(int(v*255) for v in hx(head))+(255,))
    a=np.asarray(lay.resize((W,H),Image.LANCZOS).filter(ImageFilter.GaussianBlur(blur)) if blur else lay.resize((W,H),Image.LANCZOS),dtype=np.float32)/255
    return img*(1-a[...,3:4]*alpha)+a[...,:3]*a[...,3:4]*alpha
def grass(img,rnd,y0,y1,cols,n,hmin,hmax,blur=0,alpha=1,wob=.2):
    lay,d=layer()
    for _ in range(n):
        x=rnd.uniform(0,W)*2;y=rnd.uniform(y0,y1)*2;hh=rnd.uniform(hmin,hmax)*2;lean=rnd.uniform(-wob,wob)
        c=hx(rnd.choice(cols))*rnd.uniform(.8,1.2)
        d.line([(x,y),(x+lean*hh*.5,y-hh*.55),(x+lean*hh,y-hh)],fill=tuple(int(v*255) for v in np.clip(c,0,1))+(255,),width=max(1,int(hh*.05)))
    im=lay.resize((W,H),Image.LANCZOS)
    if blur: im=im.filter(ImageFilter.GaussianBlur(blur))
    a=np.asarray(im,dtype=np.float32)/255
    return img*(1-a[...,3:4]*alpha)+a[...,:3]*a[...,3:4]*alpha
def specks(img,rnd,n,y0,y1,cols,rmin,rmax,blur=0,alpha=1,shape='ell'):
    lay,d=layer()
    for _ in range(n):
        x=rnd.uniform(0,W)*2;y=rnd.uniform(y0,y1)*2;r=rnd.uniform(rmin,rmax)*2
        c=tuple(int(v*255) for v in np.clip(hx(rnd.choice(cols))*rnd.uniform(.85,1.1),0,1))+(int(255*rnd.uniform(.6,1)),)
        if shape=='leaf': d.ellipse([x-r,y-r*.55,x+r,y+r*.55],fill=c)
        else: d.ellipse([x-r,y-r,x+r,y+r],fill=c)
    im=lay.resize((W,H),Image.LANCZOS)
    if blur: im=im.filter(ImageFilter.GaussianBlur(blur))
    a=np.asarray(im,dtype=np.float32)/255
    return img*(1-a[...,3:4]*alpha)+a[...,:3]*a[...,3:4]*alpha
def grade(img,sc,seed):
    g=sc.get('grade',(1,1,1));img=img*np.array(g,np.float32)
    lum=img.mean(-1,keepdims=True);s=sc.get('sat',1.0);img=lum+(img-lum)*s
    yy,xx=np.mgrid[0:H,0:W];v=1-.28*(((xx/W-.5)*1.6)**2+((yy/H-.5)*1.3)**2)
    img=img*v[...,None]
    rng=np.random.default_rng(seed);img=img+rng.normal(0,.011,img.shape).astype(np.float32)
    return np.clip(img,0,1)

# ---------------------------------------------------------------- scènes
COAT_RED=('#C08A5C','#94623D','#55371F');COAT_ROE=('#B9835A','#8E5E3A','#4C3220');COAT_WIN=('#A99A88','#7C6B5B','#453A31')
def splash(img,x,y,rnd,col='#FFFFFF'):
    lay,d=layer()
    X,Y=x*2,y*2
    for k in range(34):
        a=rnd.uniform(-math.pi*.95,-math.pi*.05);v=rnd.uniform(10,46);px=X+math.cos(a)*v*1.3;py=Y+math.sin(a)*v*1.5;r=rnd.uniform(1.5,4.2)
        d.ellipse([px-r,py-r,px+r,py+r],fill=(255,255,255,rnd.randint(150,235)))
    for rx,al in ((26,150),(44,90),(64,45)):
        d.ellipse([X-rx*2,Y-rx*.5,X+rx*2,Y+rx*.5],outline=(255,255,255,al),width=3)
    im=lay.resize((W,H),Image.LANCZOS).filter(ImageFilter.GaussianBlur(.6))
    a=np.asarray(im,dtype=np.float32)/255
    return img*(1-a[...,3:4])+a[...,:3]*a[...,3:4]
def put(img,parts,s,x,y,seed,flip=False,**kw): return render_parts(parts,s,(x*W,y*H),img,seed,flip,**kw)
def draw_trees(img,rd,specs,rnd,blur=0):
    lay,d=layer()
    for kind,n,hmin,hmax,pal in specs:
        for _ in range(n):
            x=rnd.uniform(0,W);y=rd[int(min(W-1,x))]+rnd.uniform(-2,6);h=rnd.uniform(hmin,hmax)
            if kind=='dec':deciduous(d,x,y,h,pal,rnd)
            elif kind=='con':conifer(d,x,y,h,pal[0],rnd,False)
            elif kind=='consnow':conifer(d,x,y,h,pal[0],rnd,True)
            elif kind=='pop':poplar(d,x,y,h,pal,rnd)
            elif kind=='bare':bare(d,x,y,h,pal[0],rnd,snow=len(pal)>1)
    im=lay.resize((W,H),Image.LANCZOS)
    if blur: im=im.filter(ImageFilter.GaussianBlur(blur))
    a=np.asarray(im,dtype=np.float32)/255
    return img*(1-a[...,3:4])+a[...,:3]*a[...,3:4]
def build(key,sc):
    rnd=random.Random(sc['seed']);img=sky(sc);hc=sc['horizon'];mode=key[1]
    wl=int(sc['wl']*H) if mode=='peche' else None
    for i,(base,amp,col,t,cells) in enumerate(sc['hills']):
        rd=ridge(base,amp,sc['seed']+i*7,cells)
        if wl is not None: rd=np.minimum(rd,wl+1)
        img=hill(img,rd,col,hc,t,seed=sc['seed']+i)
        for ti,specs in sc.get('trees',[]):
            if ti==i: img=draw_trees(img,rd,specs,rnd,blur=sc['blur'][i] if 'blur' in sc and i<len(sc['blur']) else 0)
        if i<len(sc['hills'])-1 and sc.get('mist',0): img=mist(img,rd.min()/H,rd.max()/H+.04,hc,sc['mist']*(1 if i<2 else .6),sc['seed']+i)
    if mode=='chasse':
        gy0=int(sc['hills'][-1][0]*H)
        # texture de sol
        if sc.get('ground')=='wheat':
            img=grass(img,rnd,gy0,H,['#D9B957','#C9A545','#E6CB74','#B8923A'],5200,18,46,.0,1,.12)
        elif sc.get('ground')=='snow':
            n=fbm2(H,W,6,12,sc['seed']+4,4);yy=np.arange(H)[:,None]/H
            img=img*(1-sm(yy,.62,.66)[...,None]*0)+0
        elif sc.get('ground')=='leaves':
            img=specks(img,rnd,520,gy0+4,H,['#C8532B','#E39A2D','#9E3B2E','#D9B040'],1.4,3.6,0,.85,'leaf')
            img=grass(img,rnd,gy0,H,['#8C7A3A','#A58C44','#6F6B30'],2400,10,26,0,.9)
        else:
            img=grass(img,rnd,gy0,H,sc['grass'],3600,10,30,0,.9)
        for (kind,x,y,sz,flip) in sc['animals']:
            parts={'stag':lambda:deer_parts(sc['coat'],True),'roe':lambda:deer_parts(sc['coat'],False),'boar':boar_parts,'fox':fox_parts,'hare':hare_parts,'pheasant':pheasant_parts}[kind]()
            img=put(img,parts,sz,x,y,sc['seed'],flip)
        # herbes d'avant-plan floues (profondeur de champ)
        fg=sc.get('fg',sc.get('grass',['#6BAA4B']))
        img=grass(img,rnd,H-4,H+10,fg,150,30,58,2.8,.8,.25)
    else:
        img=water_scene(img,wl,sc,rnd)
        for (kind,x,y,sz,flip,al) in sc.get('under',[]):
            L,h,back,belly,fin=sc['fish'][kind]
            img=put(img,fish_parts(L,h,back,belly,fin),sz,x,y,sc['seed'],flip,shadow=False,alpha=al,blur=1.3)
        if sc.get('ice'):
            lay,d=layer()
            for _ in range(26):
                x=rnd.uniform(0,W*2);y=rnd.uniform(wl*2+30,H*2);pts=[(x,y)]
                for k in range(rnd.randint(3,6)):x+=rnd.uniform(-60,90);y+=rnd.uniform(-14,14);pts.append((x,y))
                d.line(pts,fill=(255,255,255,150),width=2)
            a=np.asarray(lay.resize((W,H),Image.LANCZOS).filter(ImageFilter.GaussianBlur(.7)),dtype=np.float32)/255;img=img*(1-a[...,3:4])+a[...,:3]*a[...,3:4]
            img=specks(img,rnd,60,wl+10,H,['#FFFFFF','#EEF4FA'],5,13,4,.4)
        for (kind,x,sz,flip) in sc.get('floating',[]):
            if kind=='duck': img=put(img,duck_parts(),sz,x,sc['wl']+.1,sc['seed'],flip,shadow=False)
        for (x,y,r) in sc.get('pads',[]):
            lay,d=layer();X,Y=x*2,y*2
            d.ellipse([X-r*2,Y-r*.7,X+r*2,Y+r*.7],fill=(int(255*.30),int(255*.58),int(255*.28),235))
            d.ellipse([X-r*.4,Y-r*.4,X+r*.4,Y+r*.2],fill=(247,190,205,255))
            a=np.asarray(lay.resize((W,H),Image.LANCZOS),dtype=np.float32)/255;img=img*(1-a[...,3:4])+a[...,:3]*a[...,3:4]
        for (x,y,sz,flip,rot,kind) in sc.get('jump',[]):
            L,h,back,belly,fin=sc['fish'][kind]
            img=splash(img,x*W+10*(1 if not flip else -1),wl+int(sz*5),rnd)
            img=put(img,fish_parts(L,h,back,belly,fin),sz,x,y,sc['seed'],flip,shadow=False,rot=rot)
        for (kind,x,y,sz,flip) in sc.get('standing',[]):
            img=put(img,heron_parts(sc.get('heron',('#B9C5D1','#8B98A6','#55626F'))),sz,x,y,sc['seed'],flip,shadow=False)
        if sc.get('reed'):
            r=sc['reed']
            img=reeds(img,rnd,r[0],r[1],[rnd.uniform(0,W) for _ in range(r[2])],H+4,r[3],r[4],0,1)
            img=reeds(img,rnd,r[0],r[1],[rnd.uniform(0,W*.2) if k%2 else rnd.uniform(W*.8,W) for k in range(30)],H+16,r[4]*.9,r[4]*1.45,2.2,.9)
    # particules d'ambiance
    pt=sc.get('part')
    if pt:
        img=specks(img,rnd,pt['n'],0,H,pt['cols'],pt['r0'],pt['r1'],pt.get('blur',1.5),pt.get('al',.8),pt.get('shape','ell'))
    return grade(img,sc,sc['seed'])
G=lambda c:c
SCENES={
('printemps','chasse'):dict(seed=11,sky=[(0,'#7DB4E6'),(.55,'#BFDDF2'),(1,'#EAF4EE')],sun=(.78,.30),suncol='#FFF3C4',sunI=.45,cloud=.5,horizon='#DCEBEF',mist=.5,
  hills=[(.50,.06,'#7F9FB8',.6,4),(.55,.04,'#6C9A74',.4,6),(.60,.03,'#5E9A52',.2,8),(.68,.02,'#6BAA4B',.05,5)],
  trees=[(1,[('dec',40,30,50,['#7FB25F','#97C672','#6B9E4E'])]),(2,[('dec',26,52,84,['#84BC5F','#A4D07A','#6B9E4E','#F2D8E2'])])],blur=[0,.6,0,0],
  grass=['#5E9A3C','#78B24F','#4C8A33'],fg=['#4C8A33','#6BAA4B','#8CC468'],coat=COAT_ROE,animals=[('roe',.40,.80,1.55,False),('hare',.62,.86,1.9,False),('pheasant',.84,.82,1.6,True)],
  part=dict(n=70,cols=['#F7C8D6','#FFFFFF','#E8D8F7'],r0=2,r1=4.5,blur=1.6,al=.75)),
('ete','chasse'):dict(seed=21,sky=[(0,'#5FA3E0'),(.6,'#A9D3F0'),(1,'#F3EFD8')],sun=(.8,.25),suncol='#FFF0B8',sunI=.6,cloud=.35,horizon='#E9E6CF',mist=.35,
  hills=[(.50,.05,'#8FA9B8',.55,4),(.56,.035,'#4F7F44',.3,7),(.62,.025,'#3F6E36',.15,9),(.68,.02,'#CFAE4E',.0,5)],
  trees=[(1,[('dec',44,30,52,['#4F8240','#3F6E36','#5E9A4E'])]),(2,[('dec',24,56,90,['#3F6E36','#2F5A2B','#4F8240'])])],blur=[0,.6,0,0],ground='wheat',
  coat=COAT_RED,animals=[('stag',.38,.80,1.7,False),('pheasant',.62,.86,1.7,False),('hare',.80,.84,1.9,True)],fg=['#D9B957','#E6CB74','#B8923A'],
  part=dict(n=60,cols=['#FFF4C4','#FFFFFF'],r0=1.5,r1=3.2,blur=1.3,al=.7)),
('automne','chasse'):dict(seed=31,sky=[(0,'#6F9FC9'),(.5,'#F0C79A'),(1,'#F7E2BE')],sun=(.8,.42),suncol='#FFC675',sunI=.8,sunk=6,cloud=.4,cloudcol='#FFE3C2',horizon='#EDC9A0',mist=.6,
  hills=[(.50,.05,'#B58C72',.5,4),(.56,.035,'#9C6B3A',.3,7),(.62,.025,'#8A5A2E',.15,9),(.68,.02,'#A5803E',.0,5)],
  trees=[(1,[('dec',40,30,50,['#C8532B','#E39A2D','#9E3B2E','#D9B040']),('con',10,34,56,['#2E4A38'])]),(2,[('dec',20,56,90,['#C8532B','#E39A2D','#9E3B2E','#D9B040']),('con',10,60,100,['#2E4A38'])])],blur=[0,.6,0,0],ground='leaves',
  coat=COAT_RED,animals=[('stag',.38,.80,1.7,False),('boar',.62,.88,1.6,True),('pheasant',.84,.83,1.6,True)],fg=['#8C7A3A','#A58C44','#C8532B'],
  part=dict(n=40,cols=['#C8532B','#E39A2D','#D9B040'],r0=3,r1=6,blur=1.4,al=.85,shape='leaf'),grade=(1.04,1.0,.94)),
('hiver','chasse'):dict(seed=41,sky=[(0,'#8FA6C0'),(.6,'#D9D6DC'),(1,'#F1E4E4')],sun=(.78,.4),suncol='#FFD9D0',sunI=.35,cloud=.6,cloudcol='#EDEBF2',horizon='#E6E0E6',mist=.7,
  hills=[(.50,.05,'#B7C3D6',.55,4),(.56,.035,'#E4EAF2',.3,7),(.62,.025,'#EDF1F7',.15,9),(.68,.02,'#EEF2F8',.0,5)],
  trees=[(1,[('consnow',34,34,56,['#2F4A44'])]),(2,[('consnow',18,60,104,['#2F4A44']),('bare',8,60,90,['#4A3E36','s'])])],blur=[0,.8,0,0],ground='snow',
  coat=COAT_WIN,animals=[('roe',.38,.82,1.55,False),('fox',.60,.88,1.9,False),('hare',.80,.85,1.9,True)],fg=['#E8EEF6','#D5DEEA'],grass=['#DCE5F0','#C9D6E6'],
  part=dict(n=150,cols=['#FFFFFF','#F4F8FF'],r0=1.2,r1=3.4,blur=1.0,al=.9),sat=.9),
('printemps','peche'):dict(seed=12,sky=[(0,'#7DB4E6'),(.55,'#BFDDF2'),(1,'#EAF4EE')],sun=(.78,.30),suncol='#FFF3C4',sunI=.45,cloud=.5,horizon='#DCEBEF',mist=.5,wl=.54,
  hills=[(.40,.06,'#8DB3A0',.6,4),(.48,.03,'#6FA85A',.25,7)],trees=[(1,[('dec',50,30,56,['#7FB25F','#97C672','#6B9E4E','#F2D8E2'])])],blur=[0,0],
  water='#8FC7CF',water2='#3F7F94',refl=.62,glint=.5,reed=('#5E9A3C','#7A5A3A',90,50,110),
  fish={'perch':(46,.2,'#4C6B4A','#C9D0B0',('#7B5A3A','#B9552F','#7B2F1A')),'trout':(54,.18,'#5C6B58','#D9DDD0',('#8A7A5A','#C98E5A','#7A5A3A'))},
  under=[('perch',.18,.70,1.6,False,.5),('perch',.46,.80,1.4,True,.45),('perch',.66,.70,1.7,False,.5)],jump=[(.36,.34,1.15,False,38,'trout')],floating=[('duck',.76,1.6,True),('duck',.82,1.2,True)],
  pads=[(.30,.80,13),(.52,.88,16),(.72,.82,12)],part=dict(n=50,cols=['#F7C8D6','#FFFFFF'],r0=2,r1=4,blur=1.6,al=.7)),
('ete','peche'):dict(seed=22,sky=[(0,'#5FA3E0'),(.6,'#A9D3F0'),(1,'#F3EFD8')],sun=(.8,.25),suncol='#FFF0B8',sunI=.6,cloud=.35,horizon='#E9E6CF',mist=.35,wl=.54,
  hills=[(.40,.05,'#8CA6B8',.55,4),(.48,.03,'#4F7F44',.2,7)],trees=[(1,[('dec',50,32,60,['#4F8240','#3F6E36','#5E9A4E'])])],blur=[0,0],
  water='#5FB4DC',water2='#2A6F9F',refl=.6,glint=.65,reed=('#5E9A4E','#6B4A2B',90,50,110),
  fish={'pike':(78,.1,'#4A5E3A','#CFD6B0',('#6A7A3E','#B58A3A','#5A6A2E')),'rudd':(36,.22,'#5A6B58','#E6E2CC',('#8A5A3A','#C9552F','#8A3A1A')),'trout':(54,.18,'#5C6B58','#D9DDD0',('#8A7A5A','#C98E5A','#7A5A3A'))},
  under=[('pike',.20,.74,1.6,False,.5),('rudd',.52,.82,1.5,True,.45),('rudd',.60,.70,1.3,False,.45)],jump=[(.40,.33,1.15,True,-35,'trout')],floating=[('duck',.76,1.6,False),('duck',.83,1.2,False)],
  part=dict(n=60,cols=['#FFF4C4','#FFFFFF'],r0=1.5,r1=3.2,blur=1.3,al=.7)),
('automne','peche'):dict(seed=32,sky=[(0,'#6F9FC9'),(.5,'#F0C79A'),(1,'#F7E2BE')],sun=(.8,.42),suncol='#FFC675',sunI=.8,sunk=6,cloud=.4,cloudcol='#FFE3C2',horizon='#EDC9A0',mist=.6,wl=.54,
  hills=[(.40,.05,'#B58C72',.5,4),(.48,.03,'#C98F3E',.2,7)],trees=[(1,[('pop',34,40,76,['#E0A53A','#C9822E','#F0C040']),('con',8,40,64,['#2E4A38'])])],blur=[0,0],
  water='#6F9AA0',water2='#3A606A',refl=.66,glint=.55,reed=('#B8863A','#6B4A2B',90,50,110),
  fish={'carp':(60,.28,'#7A6A3A','#D9C58A',('#8A5A2A','#C98A3A','#7A4A1A'))},under=[('carp',.20,.72,1.7,False,.5),('carp',.50,.84,1.5,True,.45)],
  jump=[(.76,.34,1.05,True,-38,'carp')],standing=[('heron',.34,.66,1.55,False)],part=dict(n=40,cols=['#C8532B','#E39A2D','#D9B040'],r0=3,r1=6,blur=1.4,al=.8,shape='leaf'),grade=(1.04,1.0,.94)),
('hiver','peche'):dict(seed=42,sky=[(0,'#8FA6C0'),(.6,'#D9D6DC'),(1,'#F1E4E4')],sun=(.78,.4),suncol='#FFD9D0',sunI=.35,cloud=.6,cloudcol='#EDEBF2',horizon='#E6E0E6',mist=.7,wl=.54,
  hills=[(.40,.05,'#B7C3D6',.55,4),(.48,.03,'#E4EAF2',.25,7)],trees=[(1,[('consnow',40,34,60,['#2F4A44']),('bare',10,40,70,['#4A3E36','s'])])],blur=[0,0],
  water='#CFE3F0',water2='#8DB4CE',refl=.35,glint=.3,ice=True,reed=('#B9A687','#8B7355',70,44,100),
  fish={'perch':(46,.2,'#4C6B7A','#C9D6DC',('#7B8A9A','#9DB4C4','#7B8A9A'))},under=[('perch',.20,.72,1.6,False,.28),('perch',.50,.84,1.4,True,.26),('perch',.74,.72,1.7,False,.28)],
  standing=[('heron',.62,.66,1.55,True)],part=dict(n=150,cols=['#FFFFFF','#F4F8FF'],r0=1.2,r1=3.4,blur=1.0,al=.9),sat=.9),
}
if __name__=='__main__':
    only=sys.argv[1:] 
    for key,sc in SCENES.items():
        name=f'{key[0]}-{key[1]}'
        if only and name not in only: continue
        img=build(key,sc)
        p=os.path.join(OUT,f'saison-{name}.webp')
        Image.fromarray((img*255).astype(np.uint8)).save(p,'WEBP',quality=72,method=6)
        print(name,os.path.getsize(p)//1024,'Ko',flush=True)
