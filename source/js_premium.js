/* ===== badges « Premium » (couronne, couleur du thème) ===== */
const PREM_FEAT={"map.hd":["chasse","peche","combo"],"map.bathy":["peche","combo"],"weather.detail":["chasse","peche","combo"],"wind.overlay":"chasse peche combo".split(" "),"tags.personal":["chasse","combo"],"logbook.unlimited":["peche","combo"],"harvests.unlimited":["chasse","combo"],"logbook.stats":["peche","combo"],"spots.private":["peche","combo"],"map.offline":"chasse peche combo".split(" ")};
const PREM_PATH={"/carte":["map.hd","wind.overlay","map.bathy","map.offline"],"/meteo":["weather.detail"],"/prelevements":["tags.personal"],"/carnet":["logbook.unlimited","logbook.stats"],"/spots":["spots.private"]};
function PremHas(f){let u=w.user;if(!u)return!1;return u.role==="admin"||(PREM_FEAT[f]||[]).includes(u.plan||"free")}
function PremEl(){return e("span.prem",{title:"Fonction Premium","aria-label":"Premium"},b("crown"),"Premium")}
function PremBadge(path){let f=PREM_PATH[path];if(!f||f.every(PremHas))return null;return PremEl()}

const FREE_SPOTS=5,FREE_HARVESTS=20;
function FreeBox(label,n,max,txt){return k({title:"Offre gratuite"},e("div.row.between.small",e("span",label),e("b.mono-num",n+" / "+max)),dt(n,max,n>=max?"":"ok"),e("p.tiny.muted",{style:{marginBottom:0}},txt,PremEl()))}
function SpLimit(scope,list){let u=w.user;if(!u||u.role==="admin"||u.plan!=="free"||scope!=="mine")return null;return FreeBox("Spots enregistrés",list.length,FREE_SPOTS,"Spots illimités : ")}
function HarvLimit(scope,list){let u=w.user;if(!u||u.role==="admin"||PremHas("harvests.unlimited")||scope!=="mine")return null;return FreeBox("Prélèvements enregistrés",list.length,FREE_HARVESTS,"Prélèvements illimités : ")}
function BagFull(){let u=w.user;return!!u&&u.role!=="admin"&&!PremHas("harvests.unlimited")&&BagLoad().length>=FREE_HARVESTS}
function BagLimit(n){let u=w.user;if(!u||u.role==="admin"||PremHas("harvests.unlimited"))return null;return FreeBox("Prélèvements enregistrés",n,FREE_HARVESTS,"Prélèvements illimités : ")}
