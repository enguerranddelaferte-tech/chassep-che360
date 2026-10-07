/* ===== Territoire : sélection de parcelles cadastrales (API Carto IGN) ===== */
const PC_API="https://apicarto.ign.fr/api/cadastre/parcelle";
async function PcFetch(lat,lng){let ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),10000);
try{let r=await fetch(PC_API+"?geom="+encodeURIComponent(JSON.stringify({type:"Point",coordinates:[lng,lat]})),{signal:ctl.signal});if(!r.ok)throw new Error("Cadastre indisponible ("+r.status+").");let j=await r.json();return(j.features||[])[0]||null}
catch(er){throw er.name==="AbortError"?new Error("Le cadastre ne répond pas : réessayez dans un instant."):er}finally{clearTimeout(t)}}
function PcRings(f){let g=f&&f.geometry;if(!g)return[];let polys=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];return polys.map(p=>p[0].map(c=>[c[1],c[0]]))}
function PcArea2(r){let s=0;for(let i=0;i<r.length;i++){let a=r[i],b=r[(i+1)%r.length];s+=a[1]*b[0]-b[1]*a[0]}return s/2}
function PcKey(p){return Math.round(p[0]*1e6)+","+Math.round(p[1]*1e6)}
function PcClose(r){let a=r[0],b=r[r.length-1];return a[0]===b[0]&&a[1]===b[1]?r.slice(0,-1):r}
// Fusionne des polygones adjacents : les arêtes communes (parcourues en sens inverse) s'annulent, il reste le contour extérieur.
function PcUnion(rings0){let rings=rings0.map(PcClose).filter(r=>r.length>=3).map(r=>PcArea2(r)<0?r.slice().reverse():r.slice());
// ajoute les sommets manquants (jonctions en T) : un sommet situé sur l'arête d'un autre polygone la coupe
const tol=2e-6,onSeg=(p,a,b)=>{let dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy;if(!L2)return!1;let t=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L2;if(t<=1e-6||t>=1-1e-6)return!1;let qx=a[0]+t*dx-p[0],qy=a[1]+t*dy-p[1];return qx*qx+qy*qy<tol*tol};
rings=rings.map((r,ri)=>{let out=[];for(let i=0;i<r.length;i++){let a=r[i],b=r[(i+1)%r.length],ins=[];rings.forEach((o,oi)=>{if(oi===ri)return;o.forEach(p=>{if(onSeg(p,a,b))ins.push(p)})});ins.sort((p,q)=>(p[0]-a[0])**2+(p[1]-a[1])**2-((q[0]-a[0])**2+(q[1]-a[1])**2));out.push(a,...ins)}return out});
let edges=new Map();rings.forEach(r=>{for(let i=0;i<r.length;i++){let a=r[i],b=r[(i+1)%r.length],ka=PcKey(a),kb=PcKey(b);if(ka===kb)continue;let rev=kb+">"+ka;if(edges.has(rev))edges.delete(rev);else edges.set(ka+">"+kb,[a,b])}});
let next=new Map();edges.forEach(([a,b])=>{let k=PcKey(a);(next.get(k)||next.set(k,[]).get(k)).push([a,b])});
let out=[];while(next.size){let first=next.keys().next().value,ring=[],k=first,guard=0;while(guard++<5000){let lst=next.get(k);if(!lst||!lst.length)break;let[a,b]=lst.shift();if(!lst.length)next.delete(k);ring.push(a);k=PcKey(b);if(k===first)break}
if(ring.length>=3)out.push(ring);if(guard>=5000)break}
const flat=r=>{let k=r.slice(),ch=!0;while(ch&&k.length>3){ch=!1;for(let i=0;i<k.length;i++){let a=k[(i+k.length-1)%k.length],c=k[i],b=k[(i+1)%k.length],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);if(L&&Math.abs(dy*(c[0]-a[0])-dx*(c[1]-a[1]))/L<1e-6){k.splice(i,1);ch=!0;break}}}return k};
return out.map(flat).sort((a,b)=>Math.abs(PcArea2(b))-Math.abs(PcArea2(a)))}
function PcSimplify(pts,maxN){if(pts.length<=maxN)return pts;
const dp=(p,eps)=>{if(p.length<3)return p;let a=p[0],b=p[p.length-1],dmax=0,idx=0,dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);for(let i=1;i<p.length-1;i++){let d=L?Math.abs(dy*(p[i][0]-a[0])-dx*(p[i][1]-a[1]))/L:Math.hypot(p[i][0]-a[0],p[i][1]-a[1]);if(d>dmax){dmax=d;idx=i}}
return dmax>eps?dp(p.slice(0,idx+1),eps).slice(0,-1).concat(dp(p.slice(idx),eps)):[a,b]};
let eps=2e-6,r=pts;for(let i=0;i<30&&r.length>maxN;i++,eps*=1.6){let c=dp(pts.concat([pts[0]]),eps);c.pop();r=c}return r.length>=3?r:pts.slice(0,maxN)}
function PcHull(points){let p=points.slice().sort((a,b)=>a[1]-b[1]||a[0]-b[0]),cr=(o,a,b)=>(a[1]-o[1])*(b[0]-o[0])-(a[0]-o[0])*(b[1]-o[1]),lo=[],up=[];p.forEach(q=>{while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)});for(let i=p.length-1;i>=0;i--){let q=p[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}return lo.slice(0,-1).concat(up.slice(0,-1))}

// Relie plusieurs contours (parcelles séparées par une route, enclaves) en un seul contour par des ponts de largeur nulle :
// la surface et le tracé restent exactement ceux du cadastre.
function PcJoin(rings){let P=rings[0].slice();for(let k=1;k<rings.length;k++){let R=rings[k],best=1e18,ia=0,ib=0;for(let i=0;i<P.length;i++)for(let j=0;j<R.length;j++){let d=(P[i][0]-R[j][0])**2+(P[i][1]-R[j][1])**2;if(d<best){best=d;ia=i;ib=j}}
let seq=[];for(let t=0;t<=R.length;t++)seq.push(R[(ib+t)%R.length]);P=P.slice(0,ia+1).concat(seq,[P[ia]],P.slice(ia+1))}return P}
