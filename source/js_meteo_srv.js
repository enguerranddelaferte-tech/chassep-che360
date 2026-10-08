const WxEl={};
async function WxJson(u,ms){const c=new AbortController(),tm=setTimeout(()=>c.abort(),ms||4500);try{const rs=await fetch(u,{signal:c.signal});if(!rs.ok)throw new Error("HTTP "+rs.status);return await rs.json()}finally{clearTimeout(tm)}}
async function WxElev(t,r){const k=t.toFixed(3)+","+r.toFixed(3);if(k in WxEl)return WxEl[k];let v=null;try{const j=await WxJson(`https://api.open-meteo.com/v1/elevation?latitude=${t}&longitude=${r}`,2500);v=Array.isArray(j.elevation)?j.elevation[0]:j.elevation;if(typeof v!=="number"||!isFinite(v))v=null}catch{v=null}if(v!=null)WxEl[k]=v;return v}
const WxNum=v=>typeof v==="number"&&isFinite(v);
const WxMods=["best_match","ecmwf_ifs025","icon_eu"];
function WxNow(o,cur,hourly,u){
 const m=o.minutely_15;
 if(m&&m.time&&m.precipitation){
  let i0=m.time.findIndex(p=>p>=cur.time);if(i0<0)i0=0;
  const v=m.precipitation.slice(i0,i0+8).map(x=>WxNum(x)?x:0);
  if(v.length>=4){
   const mm=+v.reduce((a,b)=>a+b,0).toFixed(1),on=v[0]>=.1||(cur.precipitation||0)>=.1;
   if(on){let k=v.findIndex((x,j)=>j>0&&x<.1);return{text:k<0?"Pluie en cours, au moins 2 h encore":`Pluie en cours, fin vers ${k*15} min`,soon:!1,raining:!0,mm2h:mm,fine:!0}}
   const k=v.findIndex(x=>x>=.1);
   if(k<0)return{text:"Pas de pluie prévue dans les 2 h",soon:!1,raining:!1,mm2h:0,fine:!0};
   return{text:k===0?"Pluie imminente":`Pluie dans ${k*15} min environ`,soon:k<=2,raining:!1,mm2h:mm,fine:!0}
  }
 }
 const p=hourly.slice(0,2).map(h=>h.rain||0),mx=Math.max(0,...p);
 return mx>=60?{text:`Pluie probable dans l’heure (${mx} %)`,soon:mx>=80,raining:!1,mm2h:null,fine:!1}:{text:"Pas de pluie annoncée dans l’heure",soon:!1,raining:!1,mm2h:null,fine:!1}
}
function WxSpread(multi,i){
 if(!multi||!multi.daily)return null;
 const g=(nm)=>WxMods.map(md=>{const a=multi.daily[nm+"_"+md];return a&&WxNum(a[i])?a[i]:null}).filter(WxNum);
 const T=g("temperature_2m_max"),R=g("precipitation_sum");
 if(T.length<2)return null;
 const t0=Math.min(...T),t1=Math.max(...T),r0=R.length?Math.min(...R):null,r1=R.length?Math.max(...R):null,sT=t1-t0,sR=R.length>1?r1-r0:0;
 let c=sT<=2&&sR<=2?"haute":sT<=4&&sR<=6?"moyenne":"faible";
 return{conf:c,maxLo:t0,maxHi:t1,rainLo:r0,rainHi:r1,n:T.length}
}
async function WxFetch(t,r){
 const el=await WxElev(t,r),ep=WxNum(el)?`&elevation=${Math.round(el)}`:"";
 const base=`https://api.open-meteo.com/v1/forecast?latitude=${t}&longitude=${r}${ep}&timezone=Europe%2FParis&past_days=1&forecast_days=7&wind_speed_unit=kmh`;
 const cu="temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,precipitation,cloud_cover";
 const hr="temperature_2m,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation_probability,precipitation,cloud_cover,weather_code";
 const dy="weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_gusts_10m_max,precipitation_sum";
 const main=`${base}&current=${cu}&hourly=${hr}&daily=${dy}`;
 const pA=WxJson(`${main}&models=meteofrance_seamless&minutely_15=precipitation`,4500);
 pA.catch(()=>{});
 const pM=WxJson(`${base}&hourly=precipitation_probability&daily=temperature_2m_max,precipitation_sum&models=${WxMods.join(",")}`,4500).catch(()=>null);
 let o=null,model="AROME";
 try{o=await pA;if(!(o&&o.current&&WxNum(o.current.temperature_2m)&&o.hourly&&o.hourly.temperature_2m.some(WxNum)))o=null}catch{o=null}
 if(!o){model="standard";o=await WxJson(main+"&minutely_15=precipitation",4500).catch(()=>WxJson(main,4500))}
 const multi=await pM,cur=o.current,H=o.hourly;
 const u=Math.max(0,H.time.findIndex(p=>p>=cur.time.slice(0,13)));
 const pickP=i=>{let v=H.precipitation_probability&&H.precipitation_probability[i];if(WxNum(v))return Math.round(v);if(multi&&multi.hourly){const a=multi.hourly["precipitation_probability_best_match"]||multi.hourly.precipitation_probability;if(a&&WxNum(a[i]))return Math.round(a[i])}const mm=H.precipitation&&H.precipitation[i];return WxNum(mm)?(mm>=.1?Math.min(90,Math.round(40+mm*20)):0):0};
 const hourly=H.time.slice(u,u+24).map((p,m)=>({time:p,temp:H.temperature_2m[u+m],pressure:H.pressure_msl[u+m],wind:H.wind_speed_10m[u+m],windDir:H.wind_direction_10m[u+m],gusts:WxNum(H.wind_gusts_10m&&H.wind_gusts_10m[u+m])?H.wind_gusts_10m[u+m]:null,rain:pickP(u+m),mm:WxNum(H.precipitation&&H.precipitation[u+m])?H.precipitation[u+m]:null,cloud:H.cloud_cover?H.cloud_cover[u+m]:null,code:H.weather_code[u+m]}));
 const pr=k=>{const v=H.pressure_msl[Math.max(0,u-k)];return WxNum(v)?+(cur.pressure_msl-v).toFixed(1):0};
 const D=o.daily,d0=Math.max(0,D.time.findIndex(p=>p>=cur.time.slice(0,10)));
 const daily=D.time.slice(d0).map((p,m)=>{const i=d0+m,sp=WxSpread(multi,i);let cf=sp&&sp.conf;if(cf==="haute"&&m>=5)cf="moyenne";return{date:p,code:D.weather_code[i],max:D.temperature_2m_max[i],min:D.temperature_2m_min[i],wind:D.wind_speed_10m_max[i],gusts:D.wind_gusts_10m_max?D.wind_gusts_10m_max[i]:null,rain:D.precipitation_sum[i],conf:cf||null,maxLo:sp?sp.maxLo:null,maxHi:sp?sp.maxHi:null,rainLo:sp?sp.rainLo:null,rainHi:sp?sp.rainHi:null}});
 return{source:"open-meteo",model,elevation:WxNum(el)?Math.round(el):null,models:multi?WxMods.length:1,
  current:{temp:cur.temperature_2m,feels:cur.apparent_temperature,humidity:cur.relative_humidity_2m,pressure:cur.pressure_msl,pressureTrend:pr(3),pressureTrend6:pr(6),pressureTrend24:pr(24),wind:cur.wind_speed_10m,windDir:cur.wind_direction_10m,gusts:cur.wind_gusts_10m,code:cur.weather_code,precipitation:cur.precipitation,cloud:cur.cloud_cover},
  hourly,daily,nowcast:WxNow(o,cur,hourly,u)}
}
const HbC={};
const HbB="https://hubeau.eaufrance.fr/api/";
function HbDist(a,b,c,d){const R=6371,x=(c-a)*Math.PI/180,y=(d-b)*Math.PI/180,q=Math.sin(x/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(y/2)**2;return 2*R*Math.asin(Math.sqrt(q))}
async function HbTry(urls){let er;for(const u of urls){try{return await WxJson(u,3500)}catch(x){er=x}}throw er}
async function HbHydro(t,r){
 const q=`latitude=${t}&longitude=${r}&distance=25&size=30&format=json`;
 const st=await HbTry([`${HbB}v2/hydrometrie/referentiel/stations?${q}`,`${HbB}v1/hydrometrie/referentiel/stations?${q}`]);
 const list=(st.data||[]).filter(s=>s.code_station&&WxNum(+s.latitude_station)&&WxNum(+s.longitude_station)&&s.en_service!==0&&s.en_service!==!1)
  .map(s=>({...s,d:HbDist(t,r,+s.latitude_station,+s.longitude_station)})).filter(s=>s.d<=30).sort((a,b)=>a.d-b.d).slice(0,3);
 for(const s of list){
  const get=async g=>{try{const j=await HbTry([`${HbB}v2/hydrometrie/observations_tr?code_entite=${s.code_station}&grandeur_hydro=${g}&size=12&sort=desc&format=json`,`${HbB}v1/hydrometrie/observations_tr?code_entite=${s.code_station}&grandeur_hydro=${g}&size=12&sort=desc&format=json`]);return(j.data||[]).filter(x=>WxNum(x.resultat_obs))}catch{return[]}};
  const [h,q2]=await Promise.all([get("H"),get("Q")]);
  const f=h[0]||q2[0];
  if(!f||Date.now()-new Date(f.date_obs)>48*36e5)continue;
  let trend=null,delta=null;
  if(h.length>1){const t0=new Date(h[0].date_obs).getTime();let ref=h.find(x=>t0-new Date(x.date_obs).getTime()>=3*36e5)||h[h.length-1];const dh=(t0-new Date(ref.date_obs).getTime())/36e5;if(dh>=1){delta=Math.round((h[0].resultat_obs-ref.resultat_obs)/10*(3/dh));trend=delta>=3?"up":delta<=-3?"down":"flat"}}
  return{station:s.libelle_station,river:s.libelle_cours_eau||null,dist:+s.d.toFixed(1),level:h[0]?+(h[0].resultat_obs/1000).toFixed(2):null,flow:q2[0]?+(q2[0].resultat_obs/1000).toFixed(q2[0].resultat_obs>=1e4?0:1):null,trend,delta,date:f.date_obs}
 }
 return null
}
async function HbTemp(t,r){
 const st=await WxJson(`${HbB}v1/temperature/station?latitude=${t}&longitude=${r}&distance=25&size=30&format=json`,3500);
 const list=(st.data||[]).map(s=>({s,la:+(s.latitude??s.latitude_station),lo:+(s.longitude??s.longitude_station)})).filter(x=>WxNum(x.la)&&WxNum(x.lo)&&(x.s.code_station)).map(x=>({...x,d:HbDist(t,r,x.la,x.lo)})).filter(x=>x.d<=30).sort((a,b)=>a.d-b.d).slice(0,3);
 for(const x of list){
  try{const j=await WxJson(`${HbB}v1/temperature/chronique?code_station=${x.s.code_station}&size=1&sort=desc&format=json`,3500),m=(j.data||[])[0];
   if(!m||!WxNum(+m.resultat))continue;
   const dt=m.date_mesure_temp||m.date_mesure;if(!dt||Date.now()-new Date(dt)>60*864e5)continue;
   return{temp:+(+m.resultat).toFixed(1),date:dt,dist:+x.d.toFixed(1),station:x.s.libelle_station||null}}catch{}
 }
 return null
}
async function HubEau(t,r){
 const k=t.toFixed(2)+","+r.toFixed(2),c=HbC[k];if(c&&Date.now()-c.at<6e5)return c.v;
 const [h,w]=await Promise.all([HbHydro(t,r).catch(()=>null),HbTemp(t,r).catch(()=>null)]);
 const v=h||w?{...(h||{}),tempWater:w?w.temp:null,tempDate:w?w.date:null,tempDist:w?w.dist:null}:null;
 HbC[k]={at:Date.now(),v};return v
}
function WxFish(ix,a){
 let i=ix;const c=a.current;
 if(WxNum(c.cloud)){c.cloud>=70?i+=4:c.cloud<=15&&c.wind<5&&(i-=3)}
 if(WxNum(c.pressureTrend24)&&c.pressureTrend24<-3)i+=4;
 const w=a.water;
 if(w){
  if(WxNum(w.tempWater)){const x=w.tempWater;x<4?i-=10:x<8?i-=4:x<=20?i+=6:x>24&&(i-=10)}
  if(WxNum(w.delta)&&w.delta>=10)i-=8
 }
 return Math.max(5,Math.min(98,Math.round(i)))
}
function WxAlerts(a){
 if(a.nowcast&&a.nowcast.soon)a.alerts.push({level:"warn",text:a.nowcast.text+" — protégez le matériel"});
 if(a.water&&WxNum(a.water.delta)&&a.water.delta>=15)a.alerts.push({level:"warn",text:`Cours d’eau en hausse rapide (+${a.water.delta} cm en 3 h) — prudence sur les berges`})
}
