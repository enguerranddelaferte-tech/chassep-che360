/* ===== Carte : vent animé (particules) alimenté par une grille Open-Meteo ===== */
function WindCompass(d){return["N","NE","E","SE","S","SO","O","NO"][Math.round(((d%360)+360)%360/45)%8]}
async function WindGrid(b){let nx=8,ny=6,la=[],lo=[],s=b.getSouth(),n=b.getNorth(),wst=b.getWest(),est=b.getEast(),dl=(n-s)*.15,dg=(est-wst)*.15;s-=dl;n+=dl;wst-=dg;est+=dg;
for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){la.push((s+(n-s)*j/(ny-1)).toFixed(4));lo.push((wst+(est-wst)*i/(nx-1)).toFixed(4))}
let r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la.join(",")}&longitude=${lo.join(",")}&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh`);if(!r.ok)throw new Error("vent indisponible");
let a=await r.json();a=Array.isArray(a)?a:[a];if(a.length!==nx*ny)throw new Error("vent indisponible");
return{nx,ny,s,n,w:wst,e:est,time:a[0].current&&a[0].current.time,spd:a.map(o=>o.current.wind_speed_10m),dir:a.map(o=>o.current.wind_direction_10m)}}
// vecteur (u vers l'est, v vers le nord, km/h) interpolé ; la direction météo indique d'où vient le vent
function WindAt(g,lat,lng){let fx=(lng-g.w)/(g.e-g.w)*(g.nx-1),fy=(lat-g.s)/(g.n-g.s)*(g.ny-1);fx=Math.max(0,Math.min(g.nx-1.001,fx));fy=Math.max(0,Math.min(g.ny-1.001,fy));let i=Math.floor(fx),j=Math.floor(fy),tx=fx-i,ty=fy-j,u=0,v=0;
[[0,0,(1-tx)*(1-ty)],[1,0,tx*(1-ty)],[0,1,(1-tx)*ty],[1,1,tx*ty]].forEach(([a,b,wt])=>{let k=(j+b)*g.nx+i+a,d=g.dir[k]*Math.PI/180,sp=g.spd[k];u+=-sp*Math.sin(d)*wt;v+=-sp*Math.cos(d)*wt});return[u,v]}
function WindColor(sp){return sp<8?"#3b82f6":sp<18?"#06b6d4":sp<30?"#f59e0b":"#ef4444"}
function WindLayer(){let L=_e(),map,cv,cx,lg,g=null,fld=null,parts=[],raf=0,tm=0,busy=0,key="",moving=!1,reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches,last=0;const CELL=24;
const lay=L.Layer.extend({onAdd(m){map=m;let host=m.getContainer();cv=document.createElement("canvas");cv.className="wind-canvas";cv.setAttribute("aria-hidden","true");host.appendChild(cv);cx=cv.getContext("2d");
lg=document.createElement("div");lg.className="wind-legend";lg.setAttribute("role","status");lg.textContent="Vent : chargement…";host.appendChild(lg);
m.on("movestart zoomstart",halt).on("moveend zoomend resize",sched);size();load();loop()},
onRemove(m){cancelAnimationFrame(raf);clearTimeout(tm);m.off("movestart zoomstart",halt).off("moveend zoomend resize",sched);cv&&cv.remove();lg&&lg.remove();cv=lg=cx=null;fld=null}});
function size(){let h=map.getContainer(),dpr=Math.min(window.devicePixelRatio||1,2);cv.width=h.clientWidth*dpr;cv.height=h.clientHeight*dpr;cx.setTransform(dpr,0,0,dpr,0,0);cv._w=h.clientWidth;cv._h=h.clientHeight;seed()}
function halt(){moving=!0;cx&&cx.clearRect(0,0,cv._w,cv._h)}
function sched(){clearTimeout(tm);tm=setTimeout(()=>{if(!cv)return;size();moving=!1;load()},350)}
function seed(){let n=Math.min(400,Math.round(cv._w*cv._h/2600));parts=[];for(let i=0;i<n;i++)parts.push(np())}
function np(){return{x:Math.random()*cv._w,y:Math.random()*cv._h,a:Math.floor(Math.random()*70)}}
// grille de vecteurs en pixels : un seul calcul par déplacement de carte
function build(){if(!g||!map||!cv)return;let fw=Math.ceil(cv._w/CELL)+2,fh=Math.ceil(cv._h/CELL)+2,U=new Float32Array(fw*fh),V=new Float32Array(fw*fh);
for(let j=0;j<fh;j++)for(let i=0;i<fw;i++){let ll=map.containerPointToLatLng([i*CELL,j*CELL]),w0=WindAt(g,ll.lat,ll.lng);U[j*fw+i]=w0[0];V[j*fw+i]=w0[1]}fld={fw,fh,U,V}}
function samp(x,y){let fx=x/CELL,fy=y/CELL,i=fx|0,j=fy|0,tx=fx-i,ty=fy-j,fw=fld.fw,k=j*fw+i,U=fld.U,V=fld.V;
if(i<0||j<0||i>=fw-1||j>=fld.fh-1)return[0,0];
let a=(1-tx)*(1-ty),b=tx*(1-ty),c=(1-tx)*ty,d=tx*ty;return[U[k]*a+U[k+1]*b+U[k+fw]*c+U[k+fw+1]*d,V[k]*a+V[k+1]*b+V[k+fw]*c+V[k+fw+1]*d]}
async function load(){if(!map||busy)return;let b=map.getBounds(),k=[b.getSouth(),b.getNorth(),b.getWest(),b.getEast()].map(v=>v.toFixed(2)).join(",");if(k===key&&g){build();legend();reduce&&arrows();return}busy=1;
try{g=await WindGrid(b);key=k}catch(er){try{let c=map.getCenter(),w0=await v.get(`/weather?lat=${c.lat}&lng=${c.lng}`),cu=w0.current;g={nx:2,ny:2,s:c.lat-1,n:c.lat+1,w:c.lng-1,e:c.lng+1,time:null,spd:[cu.wind,cu.wind,cu.wind,cu.wind],dir:[cu.windDir,cu.windDir,cu.windDir,cu.windDir]};key=k}catch{g=null;lg&&(lg.textContent="Vent indisponible")}}
busy=0;if(!cv)return;build();legend();if(reduce)arrows()}
function legend(){if(!g||!lg||!map)return;let c=map.getCenter(),[u,vv]=WindAt(g,c.lat,c.lng),sp=Math.hypot(u,vv),dir=(Math.atan2(-u,-vv)*180/Math.PI+360)%360;
lg.replaceChildren();let t=document.createElement("b");t.textContent=`Vent ${WindCompass(dir)} · ${Math.round(sp)} km/h`;let r=document.createElement("span");r.className="wind-ramp";r.innerHTML=[["#3b82f6","<8"],["#06b6d4","8–18"],["#f59e0b","18–30"],["#ef4444","30+"]].map(([c1,l1])=>`<i style="background:${c1}"></i>${l1}`).join("");lg.append(t,r)}
function arrows(){if(!fld||!cx)return;cx.clearRect(0,0,cv._w,cv._h);let step=70;for(let y=step/2;y<cv._h;y+=step)for(let x=step/2;x<cv._w;x+=step){let[u,vv]=samp(x,y),sp=Math.hypot(u,vv);if(sp<.5)continue;let a=Math.atan2(-vv,u);cx.save();cx.translate(x,y);cx.rotate(a);cx.strokeStyle=WindColor(sp);cx.lineWidth=2;cx.lineCap="round";let L2=10+Math.min(sp,40)*.5;cx.beginPath();cx.moveTo(-L2,0);cx.lineTo(L2,0);cx.moveTo(L2-6,-4);cx.lineTo(L2,0);cx.lineTo(L2-6,4);cx.stroke();cx.restore()}}
const COLS=["#3b82f6","#06b6d4","#f59e0b","#ef4444"],bin=sp=>sp<8?0:sp<18?1:sp<30?2:3;
function loop(){raf=requestAnimationFrame(loop);if(reduce||!cx||!fld||moving||document.hidden)return;let t=performance.now();if(t-last<33)return;last=t;
cx.globalCompositeOperation="destination-out";cx.fillStyle="rgba(0,0,0,.12)";cx.fillRect(0,0,cv._w,cv._h);cx.globalCompositeOperation="source-over";
let segs=[[],[],[],[]];
for(let p of parts){let[u,vv]=samp(p.x,p.y),sp=Math.hypot(u,vv),nx2=p.x+u*.05,ny2=p.y-vv*.05;segs[bin(sp)].push(p.x,p.y,nx2,ny2);p.x=nx2;p.y=ny2;p.a++;
if(p.a>90||p.x<0||p.y<0||p.x>cv._w||p.y>cv._h){Object.assign(p,np());p.a=0}}
cx.lineWidth=1.6;cx.lineCap="round";cx.globalAlpha=.8;for(let c=0;c<4;c++){let q=segs[c];if(!q.length)continue;cx.strokeStyle=COLS[c];cx.beginPath();for(let i=0;i<q.length;i+=4){cx.moveTo(q[i],q[i+1]);cx.lineTo(q[i+2],q[i+3])}cx.stroke()}cx.globalAlpha=1}
return new lay()}
