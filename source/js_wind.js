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
function WindLayer(){let L=_e(),map,cv,cx,lg,g=null,parts=[],raf=0,tm=0,busy=0,key="",reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches,last=0;
const lay=L.Layer.extend({onAdd(m){map=m;let host=m.getContainer();cv=document.createElement("canvas");cv.className="wind-canvas";cv.setAttribute("aria-hidden","true");host.appendChild(cv);cx=cv.getContext("2d");
lg=document.createElement("div");lg.className="wind-legend";lg.setAttribute("role","status");lg.textContent="Vent : chargement…";host.appendChild(lg);
m.on("movestart zoomstart",clear).on("moveend zoomend resize",sched);size();load();loop()},
onRemove(m){cancelAnimationFrame(raf);clearTimeout(tm);m.off("movestart zoomstart",clear).off("moveend zoomend resize",sched);cv&&cv.remove();lg&&lg.remove();cv=lg=cx=null}});
function size(){let h=map.getContainer(),dpr=Math.min(window.devicePixelRatio||1,2);cv.width=h.clientWidth*dpr;cv.height=h.clientHeight*dpr;cx.setTransform(dpr,0,0,dpr,0,0);cv._w=h.clientWidth;cv._h=h.clientHeight;seed()}
function clear(){cx&&cx.clearRect(0,0,cv._w,cv._h)}
function sched(){clearTimeout(tm);tm=setTimeout(()=>{if(!cv)return;size();load()},350)}
function seed(){let n=Math.min(550,Math.round(cv._w*cv._h/2000));parts=[];for(let i=0;i<n;i++)parts.push(np())}
function np(){return{x:Math.random()*cv._w,y:Math.random()*cv._h,a:Math.floor(Math.random()*70)}}
async function load(){if(!map||busy)return;let b=map.getBounds(),k=[b.getSouth(),b.getNorth(),b.getWest(),b.getEast()].map(v=>v.toFixed(2)).join(",");if(k===key&&g)return;busy=1;
try{g=await WindGrid(b);key=k}catch(er){try{let c=map.getCenter(),w0=await v.get(`/weather?lat=${c.lat}&lng=${c.lng}`),cu=w0.current;g={nx:2,ny:2,s:c.lat-1,n:c.lat+1,w:c.lng-1,e:c.lng+1,time:null,spd:[cu.wind,cu.wind,cu.wind,cu.wind],dir:[cu.windDir,cu.windDir,cu.windDir,cu.windDir]};key=k}catch{g=null;lg&&(lg.textContent="Vent indisponible")}}
busy=0;legend();if(reduce)arrows()}
function legend(){if(!g||!lg||!map)return;let c=map.getCenter(),[u,vv]=WindAt(g,c.lat,c.lng),sp=Math.hypot(u,vv),dir=(Math.atan2(-u,-vv)*180/Math.PI+360)%360;
lg.replaceChildren();let t=document.createElement("b");t.textContent=`Vent ${WindCompass(dir)} · ${Math.round(sp)} km/h`;let r=document.createElement("span");r.className="wind-ramp";r.innerHTML=[["#3b82f6","<8"],["#06b6d4","8–18"],["#f59e0b","18–30"],["#ef4444","30+"]].map(([c1,l1])=>`<i style="background:${c1}"></i>${l1}`).join("");lg.append(t,r)}
function arrows(){if(!g||!cx)return;clear();let step=70;for(let y=step/2;y<cv._h;y+=step)for(let x=step/2;x<cv._w;x+=step){let ll=map.containerPointToLatLng([x,y]),[u,vv]=WindAt(g,ll.lat,ll.lng),sp=Math.hypot(u,vv);if(sp<.5)continue;let a=Math.atan2(-vv,u);cx.save();cx.translate(x,y);cx.rotate(a);cx.strokeStyle=WindColor(sp);cx.lineWidth=2;cx.lineCap="round";let L2=10+Math.min(sp,40)*.5;cx.beginPath();cx.moveTo(-L2,0);cx.lineTo(L2,0);cx.moveTo(L2-6,-4);cx.lineTo(L2,0);cx.lineTo(L2-6,4);cx.stroke();cx.restore()}}
function loop(){raf=requestAnimationFrame(loop);if(reduce||!cx||!g||document.hidden)return;let t=performance.now();if(t-last<33)return;last=t;
cx.globalCompositeOperation="destination-out";cx.fillStyle="rgba(0,0,0,.12)";cx.fillRect(0,0,cv._w,cv._h);cx.globalCompositeOperation="source-over";cx.lineWidth=1.6;cx.lineCap="round";
for(let p of parts){let ll=map.containerPointToLatLng([p.x,p.y]),[u,vv]=WindAt(g,ll.lat,ll.lng),sp=Math.hypot(u,vv),k=.05,nx2=p.x+u*k,ny2=p.y-vv*k;
cx.strokeStyle=WindColor(sp);cx.globalAlpha=Math.min(.9,.35+sp/40);cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(nx2,ny2);cx.stroke();p.x=nx2;p.y=ny2;p.a++;
if(p.a>90||p.x<0||p.y<0||p.x>cv._w||p.y>cv._h){Object.assign(p,np());p.a=0}}cx.globalAlpha=1}
return new lay()}
