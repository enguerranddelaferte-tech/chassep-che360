/* ===== badges « Premium » (couronne, couleur du thème) ===== */
const PREM_FEAT={"map.hd":["chasse","peche","combo"],"map.bathy":["peche","combo"],"weather.detail":["chasse","peche","combo"],"wind.overlay":"chasse peche combo".split(" "),"tags.personal":["chasse","combo"],"logbook.unlimited":["peche","combo"],"logbook.stats":["peche","combo"],"spots.private":["peche","combo"],"map.offline":"chasse peche combo".split(" ")};
const PREM_PATH={"/carte":["map.hd","wind.overlay","map.bathy","map.offline"],"/meteo":["weather.detail"],"/prelevements":["tags.personal"],"/carnet":["logbook.unlimited","logbook.stats"],"/spots":["spots.private"]};
function PremHas(f){let u=w.user;if(!u)return!1;return u.role==="admin"||(PREM_FEAT[f]||[]).includes(u.plan||"free")}
function PremEl(){return e("span.prem",{title:"Fonction Premium","aria-label":"Premium"},b("crown"),"Premium")}
function PremBadge(path){let f=PREM_PATH[path];if(!f||f.every(PremHas))return null;return PremEl()}
