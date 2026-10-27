/* ----- Météo : « Comment s’habiller » (3.0) -----
   Carte ajoutée à la page Météo terrain : à partir du ressenti, de la pluie et du vent des prochaines heures,
   elle propose une tenue en couches, adaptée au mode chasse ou pêche.
   Un partenaire peut la parrainer (emplacement « tenue » dans Admin › Emplacements). */
function S3WearPlan(wx,season){
  let c=wx&&wx.current||{},h=(wx&&wx.hourly||[]).slice(0,8),now=+c.feels;
  if(!isFinite(now))now=+c.temp;
  let temps=h.map(x2=>+x2.temp).filter(isFinite),lo=Math.min(now,...temps),hi=Math.max(+c.temp||now,...temps);
  let rainP=Math.max(0,...h.map(x2=>+x2.rain||0)),code=+c.code||0,wet=(+c.precipitation||0)>0||[51,53,55,61,63,65,80,81,82,95,96].includes(code)||rainP>=50;
  let snow=[71,73,75].includes(code),wind=Math.max(+c.wind||0,...h.map(x2=>+x2.wind||0)),gust=+c.gusts||0,windy=wind>=30||gust>=45;
  let feel=Math.min(now,lo),lvl,title;
  if(feel<=0){lvl=0;title="Grand froid"}else if(feel<=7){lvl=1;title="Froid"}else if(feel<=13){lvl=2;title="Frais"}else if(feel<=20){lvl=3;title="Doux"}else{lvl=4;title="Chaud"}
  let L=[];
  L.push(["Sous-couche",["Sous-couche thermique chaude (laine mérinos)","Sous-couche thermique (mérinos ou synthétique)","Sous-couche respirante légère","T-shirt technique respirant","T-shirt léger respirant"][lvl]]);
  if(lvl<=3)L.push(["Couche intermédiaire",["Polaire épaisse ou doudoune fine","Polaire épaisse","Polaire légère ou pull en laine","Softshell ou chemise épaisse"][lvl]]);
  L.push(["Couche extérieure",wet?"Veste imperméable et respirante":windy?"Veste coupe-vent":["Veste chaude, déperlante","Veste chaude","Veste de saison","Veste légère, à retirer en journée","Pas de veste, ou une veste très légère"][lvl]]);
  L.push(["Bas",wet?"Pantalon imperméable ou guêtres":lvl<=1?"Pantalon chaud doublé":"Pantalon de terrain résistant aux ronces"]);
  L.push(["Pieds",wet||snow?"Bottes imperméables, chaussettes en laine":lvl<=1?"Chaussures montantes chaudes, chaussettes en laine":lvl>=4?"Chaussures légères et respirantes":"Chaussures de marche montantes"]);
  let acc=[];
  if(lvl<=1)acc.push("bonnet","gants");else if(lvl===2)acc.push("gants fins");
  if(lvl>=4)acc.push("casquette","eau en quantité");
  if(windy)acc.push("cache-cou");
  if(season==="peche"){acc.push(lvl>=3&&!wet?"lunettes polarisantes":"lunettes polarisantes (même par temps gris)");if(lvl<=2)acc.push("waders néoprène");else acc.push("waders respirants")}
  if(acc.length)L.push(["Accessoires",acc.join(", ").replace(/^./,m=>m.toUpperCase())]);
  let tips=[];
  if(isFinite(hi)&&isFinite(lo)&&hi-lo>=8)tips.push(`Écart de ${Math.round(hi-lo)}° dans les prochaines heures : misez sur les couches pour en retirer ou en remettre.`);
  if(wet)tips.push(rainP?`Pluie probable (jusqu’à ${Math.round(rainP)} %) : prévoyez aussi des vêtements de rechange dans la voiture.`:"Pluie en cours : prévoyez des vêtements de rechange dans la voiture.");
  if(windy)tips.push(`Vent jusqu’à ${Math.round(Math.max(wind,gust))} km/h : le ressenti sera plus froid que la température.`);
  if(season!=="peche"){tips.push("En battue, gilet ou veste orange fluo obligatoire, et casquette fluo conseillée.");if(lvl<=2)tips.push("À l’affût, préférez des tissus silencieux (laine, polaire) et une couche de plus : on se refroidit vite sans bouger.")}
  else if(lvl<=2)tips.push("Au bord de l’eau, l’humidité fait baisser le ressenti : une couche de plus que prévu.");
  return {title,feel:Math.round(now),lo:Math.round(lo),hi:Math.round(hi),layers:L,tips};
}
async function S3WearCard(){
  let wx=null;try{let r=w.position;wx=await v.get(`/weather?lat=${r.lat}&lng=${r.lng}`)}catch{}
  if(!wx||!wx.current)return null;
  let p=S3WearPlan(wx,w.season),pl=null;
  try{pl=(await S3PartList()).find(x2=>x2.module==="tenue")||null}catch{}
  let hit=k2=>{if(!pl)return;try{S3Sb("POST","rpc/placement_hit",{p_id:pl.id,p_kind:k2},{Prefer:"return=minimal"}).catch(()=>{})}catch{}};
  let card=e("section.panel.wear-card",{"aria-label":"Comment s’habiller"},
    e("div.wear-head",e("div",e("div.eyebrow","Comment s’habiller"),e("h3",`${p.title} · ressenti ${p.feel}°`),e("div.small.muted",`Entre ${p.lo}° et ${p.hi}° dans les prochaines heures`))),
    e("ul.wear-list",p.layers.map(([k2,t2])=>e("li",e("span.wear-k",k2),e("span.wear-v",t2)))),
    p.tips.length?e("ul.wear-tips",p.tips.map(t2=>e("li",t2))):null,
    pl?e(pl.url?"a.wear-by":"div.wear-by",pl.url?{href:pl.url,target:"_blank",rel:"noopener sponsored",onclick:()=>hit("click")}:{},pl.logo?e("img",{src:pl.logo,alt:""}):null,e("span",(pl.text||"Conseils tenue proposés par")+" ",e("b",pl.brand)),e("span.part-tag","Partenaire")):null);
  if(pl&&!S3Part.seen.has(pl.id+"|tenue")){S3Part.seen.add(pl.id+"|tenue");hit("view")}
  return card;
}
function S3WearInject(p){
  if(p!=="/meteo"||!Mt)return;
  let tries=0,go=async()=>{
    if(location.hash.split("?")[0]!=="#/meteo")return;
    let pg=Mt.querySelector(".page"),hero=pg&&pg.querySelector(".hero-weather");
    if(!hero){if(++tries<40)setTimeout(go,250);return}
    if(pg.querySelector(".wear-card")||pg.__wear)return;pg.__wear=1;
    let card=await S3WearCard();if(!card||!pg.isConnected)return;
    let panel=hero.closest(".panel")||hero;panel.after(card);
  };
  go();
}
