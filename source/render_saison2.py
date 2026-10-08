# Rendu 2 — ambiance sobre / cinéma : forêts continues en couches brumeuses, eau à reflets, silhouettes lointaines (pas de dessins « cartoon »)
import numpy as np, cv2, math, random, os, sys
from PIL import Image, ImageDraw, ImageFilter
import render_saison as R
from render_saison import hx,lerp,sm,fbm1,fbm2,sky,layer,grade,water_scene,deer_parts,heron_parts,render_parts,mist,W,H,OUT
def forest(img,sp,hc,seed,wl=None):
    ys=np.arange(H)[:,None].astype(np.float32);x=np.arange(W)
    base=(sp['base']+sp.get('amp',.02)*(fbm1(W,sp.get('cells',6),seed)-.5)*2)*H
    rel=sp.get('relief',14);top=base.copy()
    rng=np.random.default_rng(seed)
    kind=sp['kind']
    if kind in('dec','mixed'):
        d=(fbm1(W,int(W/sp.get('gr',34)),seed+3,4,.62)-.5)*2*rel+(fbm1(W,int(W/9),seed+4,3,.6)-.5)*rel*.5
        top=np.minimum(top,base-rel*.8+ -d)
    if kind in('con','mixed'):
        sc=sp.get('spacing',9);hh=np.zeros(W,np.float32);xs=np.arange(-20,W+20,sc)
        for xc in xs+rng.uniform(-sc*.4,sc*.4,len(xs)):
            h=rng.uniform(sp['hmin'],sp['hmax'])*(.6+.8*fbm1(W,5,seed+9)[int(np.clip(xc,0,W-1))]);w=h*.2+2
            prof=np.clip(h*(1-np.abs(x-xc)/w),0,None)
            prof=prof*(0.9+0.1*np.sign(np.sin((x-xc)*.9))) # dents de scie légères
            hh=np.maximum(hh,prof)
        topc=base-hh
        top=topc if kind=='con' else np.minimum(top,topc)
    if wl is not None: top=np.minimum(top,wl)
    m=(ys>=top[None,:]).astype(np.float32);m=cv2.GaussianBlur(m,(0,0),.7)
    pal=[hx(c) for c in sp['cols']]
    p=fbm2(H,W,3,9,seed+5,4)[...,None];p=np.clip((p-.25)*1.7,0,1)
    n=len(pal);idx=p*(n-1);i0=np.floor(idx).astype(int)[...,0];i1=np.clip(i0+1,0,n-1);f=idx-np.floor(idx)
    P=np.stack(pal);col=P[i0]*(1-f)+P[i1]*f
    tex=fbm2(H,W,90,300,seed+9,3,.65)[...,None]
    depth=np.clip((ys-top[None,:])/(rel+sp.get('shade',70)),0,1)[...,None]
    rim=np.exp(-(ys-top[None,:])/16)[...,None]
    bright=(.78+.55*tex)*(1-.38*depth)+sp.get('rim',.18)*rim
    c=col*bright
    c=lerp(c,hx(hc),sp['t'])
    out=img*(1-m[...,None])+c*m[...,None]
    return out,top
def meadow(img,sc,y0,seed):
    ys=np.arange(H)[:,None].astype(np.float32)
    t=np.clip((ys-y0)/(H-y0),0,1)
    c0,c1=hx(sc['field'][0]),hx(sc['field'][1])
    base=lerp(c0,c1,t[...,None]**.8)
    st=fbm2(H,W,70,5,seed+1,4)[...,None]
    fine=fbm2(H,W,200,500,seed+2,3,.7)[...,None]
    c=base*(.70+.5*st*.7+.75*fine*(.5+t[...,None]))
    m=(ys>=y0).astype(np.float32);m=cv2.GaussianBlur(m,(0,0),1.0)
    out=img*(1-m[...,None])+c*m[...,None]
    # flou de profondeur progressif au premier plan
    bl=cv2.GaussianBlur(out,(0,0),3.2)
    k=sm(ys/H,.82,1.0)[...,None]
    return out*(1-k)+bl*k
def silhouette(img,parts,s,x,y,seed,hc,haze,alpha=.9,flip=False):
    pal=lambda c:(c,c,c)
    P=[(t,d,pal(sc_),w) for (t,d,_p,w),sc_ in zip(parts,[sp for sp in [None]*len(parts)])] if False else None
    return img
def sil_parts(parts,col):
    return [(t,d,(col,col,col),w) for t,d,_p,w in parts]
def birds(img,rnd,n,y0,y1,col,s0,s1):
    lay,d=layer()
    cx=rnd.uniform(.2,.8)*W*2;cy=rnd.uniform(y0,y1)*2
    for i in range(n):
        x=cx+rnd.uniform(-160,160)*2;y=cy+rnd.uniform(-40,40);s=rnd.uniform(s0,s1)*2
        d.line([(x-s,y-s*.35),(x,y),(x+s,y-s*.35)],fill=col+(210,),width=3,joint='curve')
    a=np.asarray(lay.resize((W,H),Image.LANCZOS).filter(ImageFilter.GaussianBlur(.5)),dtype=np.float32)/255
    return img*(1-a[...,3:4])+a[...,:3]*a[...,3:4]
def boat(img,x,y,s,col,hc):
    lay,d=layer();X,Y=x*2,y*2;S=s*2
    d.polygon([(X-34*S,Y-6*S),(X+36*S,Y-6*S),(X+26*S,Y+3*S),(X-24*S,Y+3*S)],fill=col+(255,))
    d.ellipse([X-3*S,Y-30*S,X+3*S,Y-24*S],fill=col+(255,))
    d.polygon([(X-5*S,Y-24*S),(X+5*S,Y-24*S),(X+6*S,Y-6*S),(X-6*S,Y-6*S)],fill=col+(255,))
    d.line([(X+4*S,Y-20*S),(X+40*S,Y-44*S)],fill=col+(255,),width=max(2,int(1.3*S)))
    d.line([(X+40*S,Y-44*S),(X+44*S,Y-2*S)],fill=(60,60,60,160),width=1)
    for rx,al in ((10,120),(20,80),(32,45)):
        d.ellipse([X+44*S-rx*S*1.2,Y-1.5*S-rx*S*.18,X+44*S+rx*S*1.2,Y-1.5*S+rx*S*.18],outline=(255,255,255,al),width=2)
    a=np.asarray(lay.resize((W,H),Image.LANCZOS).filter(ImageFilter.GaussianBlur(.5)),dtype=np.float32)/255
    a[...,:3]=lerp(a[...,:3],hx(hc),.18)
    return img*(1-a[...,3:4])+a[...,:3]*a[...,3:4]
def rings(img,x,y,rnd,col='#FFFFFF'):
    lay,d=layer();X,Y=x*2,y*2
    for r,al in ((12,150),(26,100),(44,60),(66,30)):
        d.ellipse([X-r*2,Y-r*.42,X+r*2,Y+r*.42],outline=(255,255,255,al),width=2)
    a=np.asarray(lay.resize((W,H),Image.LANCZOS).filter(ImageFilter.GaussianBlur(.6)),dtype=np.float32)/255
    return img*(1-a[...,3:4])+a[...,:3]*a[...,3:4]
def veil(img,sc,seed):
    # voile de brume global bas + lueur
    return mist(img,.48,.66,sc['horizon'],sc.get('fog',.55),seed)
def build2(key,sc):
    rnd=random.Random(sc['seed']);img=sky(sc);hc=sc['horizon'];mode=key[1]
    wl=int(sc['wl']*H) if mode=='peche' else None
    tops=[]
    for i,sp in enumerate(sc['layers']):
        img,top=forest(img,sp,hc,sc['seed']+i*11,wl)
        tops.append(top)
        if i<len(sc['layers'])-1: img=mist(img,sp['base']-.05,sp['base']+.06,hc,sc.get('fog',.5)*(1-.18*i),sc['seed']+i)
    if mode=='chasse':
        img=meadow(img,sc,int(sc['meadow']*H),sc['seed'])
        for (x,y,s,flip) in sc.get('far',[]):
            parts=sil_parts(deer_parts(('#2A211B',)*3,sc.get('stag',True)),sc['silcol'])
            img=render_parts(parts,s,(x*W,y*H),img,sc['seed'],flip,shadow=True,alpha=.92,blur=.5)
        img=mist(img,sc['meadow']-.03,sc['meadow']+.07,hc,sc.get('fog',.5)*.6,sc['seed']+3)
    else:
        img=water_scene(img,wl,sc,rnd)
        img=mist(img,sc['wl']-.05,sc['wl']+.05,hc,sc.get('fog',.5)*.9,sc['seed']+4)
        for (x,y) in sc.get('rise',[]): img=rings(img,x*W,y*H,rnd)
        if sc.get('boat'): bx,by,bs=sc['boat'];img=boat(img,bx*W,by*H,bs,tuple(int(v*255) for v in hx(sc['silcol'])),hc)
        if sc.get('heron'): hx_,hy_,hs,fl=sc['heron'];img=render_parts(sil_parts(heron_parts(),sc['silcol']),hs,(hx_*W,hy_*H),img,sc['seed'],fl,shadow=False,alpha=.9,blur=.4)
        if sc.get('reeds'):
            r=sc['reeds'];img=R.reeds(img,rnd,r[0],None,[rnd.uniform(0,W*.14) if k%2 else rnd.uniform(W*.86,W) for k in range(r[1])],H+4,r[2],r[3],1.2,.9)
    if sc.get('birds'): img=birds(img,rnd,*sc['birds'])
    pt=sc.get('part')
    if pt: img=R.specks(img,rnd,pt['n'],0,H,pt['cols'],pt['r0'],pt['r1'],pt.get('blur',1.6),pt.get('al',.5),pt.get('shape','ell'))
    return grade(img,sc,sc['seed'])
def L(kind,base,cols,t,**k): return dict(kind=kind,base=base,cols=cols,t=t,**k)
SC={
('printemps','chasse'):dict(seed=11,sky=[(0,'#8FAFC4'),(.5,'#CFDDD8'),(1,'#F1EAD2')],sun=(.74,.38),suncol='#FFE9B0',sunI=.5,sunk=7,cloud=.45,cloudcol='#F7F3E6',horizon='#E4E6D4',fog=.6,
  layers=[L('dec',.50,['#7B9BA6','#8CA89A'],.62,relief=8,gr=60,amp=.05,cells=4),L('dec',.55,['#6E8C6A','#8CA66C','#9DB57A'],.45,relief=14,gr=40,amp=.03),L('mixed',.60,['#5D7E4C','#7F9A55','#9CB466','#E6E2D8'],.28,relief=22,gr=30,hmin=20,hmax=44,spacing=14,amp=.02,cells=8)],
  meadow=.665,field=('#93A56C','#5F7A45'),far=[(.46,.69,.8,False)],silcol='#2C3326',stag=False,part=dict(n=80,cols=['#FFFFFF','#F3DCE4'],r0=1.2,r1=3,blur=1.8,al=.55),grade=(1.0,1.01,.98),sat=.92),
('ete','chasse'):dict(seed=21,sky=[(0,'#4F7FA8'),(.5,'#9DBAC2'),(.85,'#F0CFA0'),(1,'#F6DFB8')],sun=(.8,.55),suncol='#FFC98A',sunI=.7,sunk=6,cloud=.38,cloudcol='#FFE4C4',horizon='#EFCFA6',fog=.5,
  layers=[L('dec',.52,['#7C93A0','#8A9C98'],.6,relief=8,gr=60,amp=.05,cells=4),L('dec',.57,['#3F5C3C','#4F6E44'],.4,relief=16,gr=38,amp=.03),L('dec',.62,['#2F4A33','#3D5E3C','#566F3E'],.22,relief=24,gr=28,amp=.02,cells=8)],
  meadow=.675,field=('#C9A559','#8F7634'),far=[(.5,.70,.85,False)],silcol='#2A261C',part=dict(n=70,cols=['#FFE9B0','#FFFFFF'],r0=1.2,r1=3.2,blur=1.8,al=.5),grade=(1.03,1.0,.95),sat=.95),
('automne','chasse'):dict(seed=31,sky=[(0,'#7C98B0'),(.5,'#E5C8A4'),(1,'#F4DDB6')],sun=(.78,.5),suncol='#FFC070',sunI=.85,sunk=5,cloud=.4,cloudcol='#FFE0BC',horizon='#EBCBA0',fog=.7,
  layers=[L('dec',.52,['#A98A74','#B79470'],.58,relief=8,gr=60,amp=.05,cells=4),L('mixed',.57,['#8C6B3A','#B7752F','#A4472B','#6E6A38'],.4,relief=16,gr=36,hmin=18,hmax=34,spacing=18,amp=.03),L('mixed',.62,['#7A4A26','#B8622A','#C78A2E','#8E3A28','#4B5A38'],.22,relief=24,gr=28,hmin=26,hmax=52,spacing=16,amp=.02,cells=8)],
  meadow=.675,field=('#A98542','#6E5428'),far=[(.46,.70,.85,False),(.70,.74,.7,True)],silcol='#2B2118',birds=(9,.1,.28,(60,50,44),6,9),part=dict(n=40,cols=['#C8632B','#E39A2D'],r0=2.5,r1=5,blur=1.6,al=.6,shape='leaf'),grade=(1.04,1.0,.94),sat=.97),
('hiver','chasse'):dict(seed=41,sky=[(0,'#7E91A8'),(.55,'#BAC2CC'),(1,'#E4D9D8')],sun=(.78,.5),suncol='#FFD0C4',sunI=.4,sunk=6,cloud=.62,cloudcol='#E6E8EE',horizon='#D8D8DE',fog=.8,
  layers=[L('con',.52,['#7B8CA0'],.62,relief=6,hmin=10,hmax=22,spacing=7,amp=.04,cells=4),L('con',.57,['#475A66','#3F525C'],.45,relief=8,hmin=22,hmax=46,spacing=9,amp=.03),L('con',.63,['#27373A','#2F4440','#22313A'],.22,relief=8,hmin=40,hmax=84,spacing=11,amp=.02,cells=8,shade=100)],
  meadow=.68,field=('#E5E9F0','#C3CEDD'),far=[(.46,.71,.85,False)],silcol='#2A2C30',stag=True,part=dict(n=180,cols=['#FFFFFF'],r0=1,r1=3,blur=1.0,al=.8),grade=(.98,1.0,1.03),sat=.85),
('printemps','peche'):dict(seed=12,sky=[(0,'#8FAFC4'),(.5,'#CFDDD8'),(1,'#F1EAD2')],sun=(.74,.38),suncol='#FFE9B0',sunI=.5,sunk=7,cloud=.45,cloudcol='#F7F3E6',horizon='#E4E6D4',fog=.7,wl=.56,
  layers=[L('dec',.43,['#7B9BA6','#8CA89A'],.62,relief=8,gr=60,amp=.04,cells=4),L('dec',.50,['#6E8C6A','#8CA66C','#9DB57A','#E6E2D8'],.4,relief=20,gr=30,amp=.02,cells=7)],
  water='#9DB9B8',water2='#4F7482',refl=.72,glint=.4,boat=(.40,.64,.9),rise=[(.62,.74)],reeds=('#4C6A3C',40,60,120),silcol='#26301F',part=dict(n=60,cols=['#FFFFFF','#F3DCE4'],r0=1.2,r1=3,blur=1.8,al=.5)),
('ete','peche'):dict(seed=22,sky=[(0,'#4F7FA8'),(.5,'#9DBAC2'),(.85,'#F0CFA0'),(1,'#F6DFB8')],sun=(.8,.55),suncol='#FFC98A',sunI=.7,sunk=6,cloud=.38,cloudcol='#FFE4C4',horizon='#EFCFA6',fog=.5,wl=.56,
  layers=[L('dec',.45,['#7C93A0','#8A9C98'],.6,relief=8,gr=60,amp=.04,cells=4),L('dec',.50,['#2F4A33','#3D5E3C','#566F3E'],.3,relief=22,gr=28,amp=.02,cells=7)],
  water='#6F9DB0',water2='#2F5A74',refl=.72,glint=.7,boat=(.62,.64,.9),rise=[(.30,.76)],reeds=('#3E5A33',40,60,120),silcol='#1E241A',part=dict(n=50,cols=['#FFE9B0','#FFFFFF'],r0=1.2,r1=3.2,blur=1.8,al=.45),grade=(1.03,1.0,.95)),
('automne','peche'):dict(seed=32,sky=[(0,'#7C98B0'),(.5,'#E5C8A4'),(1,'#F4DDB6')],sun=(.78,.5),suncol='#FFC070',sunI=.85,sunk=5,cloud=.4,cloudcol='#FFE0BC',horizon='#EBCBA0',fog=.7,wl=.56,
  layers=[L('dec',.43,['#A98A74','#B79470'],.58,relief=8,gr=60,amp=.04,cells=4),L('mixed',.50,['#8C6B3A','#B7752F','#A4472B','#6E6A38','#C78A2E'],.3,relief=22,gr=26,hmin=22,hmax=44,spacing=16,amp=.02,cells=7)],
  water='#8A9C9A',water2='#3E5E66',refl=.74,glint=.6,heron=(.30,.60,.8,False),rise=[(.66,.76)],reeds=('#7A5A2E',40,60,120),silcol='#2B2118',birds=(8,.12,.3,(60,50,44),6,9),part=dict(n=36,cols=['#C8632B','#E39A2D'],r0=2.5,r1=5,blur=1.6,al=.55,shape='leaf'),grade=(1.04,1.0,.94)),
('hiver','peche'):dict(seed=42,sky=[(0,'#7E91A8'),(.55,'#BAC2CC'),(1,'#E4D9D8')],sun=(.78,.5),suncol='#FFD0C4',sunI=.4,sunk=6,cloud=.62,cloudcol='#E6E8EE',horizon='#D8D8DE',fog=.8,wl=.56,
  layers=[L('con',.44,['#7B8CA0'],.62,relief=6,hmin=10,hmax=22,spacing=7,amp=.04,cells=4),L('con',.51,['#27373A','#2F4440','#22313A'],.3,relief=8,hmin=30,hmax=64,spacing=10,amp=.02,cells=7,shade=90)],
  water='#AEBFCB',water2='#6F8799',refl=.55,glint=.25,heron=(.62,.60,.8,True),reeds=('#8A7D66',40,50,100),silcol='#2A2C30',ice=True,part=dict(n=180,cols=['#FFFFFF'],r0=1,r1=3,blur=1.0,al=.8),grade=(.98,1.0,1.03),sat=.85),
}
if __name__=='__main__':
    only=sys.argv[1:]
    for key,sc in SC.items():
        name=f'{key[0]}-{key[1]}'
        if only and name not in only: continue
        img=build2(key,sc)
        p=os.path.join(OUT,f'saison-{name}.webp')
        Image.fromarray((img*255).astype(np.uint8)).save(p,'WEBP',quality=76,method=6)
        print(name,os.path.getsize(p)//1024,'Ko',flush=True)
