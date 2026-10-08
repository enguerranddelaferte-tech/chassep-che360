function WxSub(n){const p=["Open-Meteo"];n.model==="AROME"?p.push("Météo-France AROME 1,5 km"):p.push("modèle standard");n.elevation!=null&&p.push("alt. "+n.elevation+" m");return p.join(" · ")}
function WxNowEl(n){if(!n.nowcast)return null;const w=n.nowcast;return e("div.row",{style:{gap:"6px",fontWeight:600,color:w.raining||w.soon?"var(--info,#1B5E9B)":"inherit"}},b(w.raining||w.soon?"drop":"weather"),e("span",w.text),w.fine&&w.mm2h?e("span.muted",{style:{fontWeight:400}},`(${M.num(w.mm2h,1)} mm)`):null)}
function WxPT(i){const f=v=>(v>0?"+":"")+M.num(v,1);return i.pressureTrend6!=null?` · 6 h : ${f(i.pressureTrend6)} · 24 h : ${f(i.pressureTrend24)}`:""}
function WxRain(m){return m.mm!=null&&m.mm>=.1?`${m.rain} % · ${M.num(m.mm,1)} mm`:`${m.rain} %`}
function WxWind(m){return`${m.windLabel} ${m.wind} km/h`+(m.gusts!=null&&m.gusts>m.wind+8?` (raf. ${Math.round(m.gusts)})`:"")}
function WxConf(m){if(!m.conf)return"";const T=m.maxHi-m.maxLo,R=m.rainHi!=null?m.rainHi-m.rainLo:0;return m.conf==="haute"?" · prévision fiable":m.conf==="moyenne"?` · fiabilité moyenne (écart ${M.num(T,0)}°)`:` · incertaine (modèles divergent : ${M.num(m.maxLo,0)}° à ${M.num(m.maxHi,0)}°${R>=3?`, ${M.num(m.rainLo,0)} à ${M.num(m.rainHi,0)} mm`:""})`}
function WxWater(n){const w=n.water;if(!w)return null;const rows=[];
 if(w.level!=null)rows.push(["Niveau",`${M.num(w.level,2)} m`+(w.trend==="up"?` · en hausse (+${w.delta} cm / 3 h)`:w.trend==="down"?` · en baisse (${w.delta} cm / 3 h)`:w.trend==="flat"?" · stable":"")]);
 if(w.flow!=null)rows.push(["Débit",`${M.num(w.flow,w.flow>=100?0:1)} m³/s`]);
 if(w.tempWater!=null)rows.push(["Température de l’eau",`${M.num(w.tempWater,1)} °C`+(w.tempDate?` (mesure du ${new Date(w.tempDate).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})})`:"")]);
 if(!rows.length)return null;
 return k({title:"Cours d’eau proche",sub:w.station?`${w.river?w.river+" · ":""}station de ${w.station}, à ${M.num(w.dist,1)} km`:"Mesures Hub’Eau"},rt(rows))}
