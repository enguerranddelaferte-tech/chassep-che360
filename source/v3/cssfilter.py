import re
KIT=set("""shell sidebar brand brand-mark brand-name nav-group nav-link count locked side-user side-user-link main topbar spacer mobile-brand season net-status icon-btn dot me-chip content full tabbar tab tab-sos tab-season sos-fab scrim mobile-back page page-head titles actions crumb grid g-2 g-3 g-4 g-main span-2 stack row wrap between grow panel flush tint danger panel-head sub link-more stat v l d btn primary ghost sm block xl critical c-sos c-30 c-drive c-fish c-sortie badge accent hunt fish nature ok warn gold live chips chip avatar tabs seg on list list-row t s ic end table-wrap data num field label hint err input invalid form-grid check search toolbar modal-back modal wide modal-head modal-body modal-foot toasts toast empty loader spin skeleton meter lock muted small tiny mono-num display sep kv bars b hbar prose photo dropzone stars guest-bar guest-top guest-cta more home-map home-map-canvas home-chip home-open hero-weather big trip-pill late prem sr-only active link-more""".split())
def rules(css):
    i=0;out=[]
    while i<len(css):
        j=css.find('{',i)
        if j<0:break
        sel=css[i:j].strip()
        d=1;k=j+1
        while d:
            c=css[k]
            if c=='{':d+=1
            elif c=='}':d-=1
            k+=1
        out.append((sel,css[j+1:k-1]));i=k
    return out
def keep(sel):
    for part in split_sel(sel):
        p=re.sub(r'url\([^)]*\)','',part)
        p=re.sub(r':(?:not|is|has|where)\(','(',p)
        cls=set(re.findall(r'\.([A-Za-z_][\w-]*)',p))
        if not cls: 
            if re.search(r'\[data-role=admin\]|\[data-saison|\[data-banniere|^:root|^body|^html|^\*|^a$|^img|^button|^:focus|^\[hidden|^:where',part.strip()): continue
            return True
        if cls-KIT: return True
    return False
def split_sel(sel):
    parts=[];d=0;cur=''
    for ch in sel:
        if ch=='(':d+=1
        if ch==')':d-=1
        if ch==',' and d==0: parts.append(cur);cur=''
        else: cur+=ch
    parts.append(cur);return parts
def filt(css,log=None):
    out=[]
    for sel,body in rules(css):
        if sel.startswith('@media') or sel.startswith('@supports'):
            inner=filt(body,log)
            if inner: out.append(sel+'{'+inner+'}')
        elif sel.startswith('@keyframes'):
            if not re.search(r'sosPulse',sel): out.append(sel+'{'+body+'}')
        elif sel.startswith('@'): out.append(sel+'{'+body+'}')
        else:
            parts=[p for p in split_sel(sel) if keep(p)]
            if parts: out.append(','.join(parts)+'{'+body+'}')
            elif log is not None: log.append(sel)
    return ''.join(out)
if __name__=='__main__':
    import sys
    s=open(sys.argv[1]).read()
    log=[]
    r=filt(s,log)
    open(sys.argv[2],'w').write(r)
    print(len(s),'->',len(r),'dropped',len(log))
