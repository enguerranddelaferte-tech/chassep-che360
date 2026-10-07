var pmBtn,pcUse,pinf2=e("div.tiny.muted",{style:{marginTop:"4px"}});
function PcInfo(){let n=sel.size;if(!n){pinf2.textContent=pm?"Touchez une parcelle sur la carte pour l’ajouter (zoom 15 minimum). Touchez-la de nouveau pour la retirer.":"";pcUse.hidden=!0;return}
let ha=0,com=new Set();sel.forEach(s=>{ha+=(s.f.properties.contenance||0)/1e4;s.f.properties.nom_com&&com.add(s.f.properties.nom_com)});pinf2.textContent=`${n} parcelle${n>1?"s":""} · environ ${Math.round(ha*10)/10} ha${com.size?" · "+[...com].slice(0,2).join(", "):""}`;pcUse.hidden=!1}
function PcMode(v_){pm=!!v_;if(pm){if(!cad){cad=L_.tileLayer(on("CADASTRALPARCELS.PARCELLAIRE_EXPRESS"),{maxZoom:19,opacity:.9,attribution:qn}).addTo(l)}pmBtn.textContent="Revenir aux sommets";l.getContainer().style.cursor="crosshair"}else{cad&&(cad.remove(),cad=null);pmBtn.textContent="Choisir des parcelles";l.getContainer().style.cursor="";pcg.clearLayers();sel.clear()}PcInfo()}
async function PcClick(ev){if(l.getZoom()<15){A("Rapprochez-vous : zoomez sur la carte pour désigner une parcelle.","warn");return}
try{let f=await PcFetch(ev.latlng.lat,ev.latlng.lng);if(!f){A("Aucune parcelle trouvée à cet endroit.","warn");return}
let p=f.properties||{},id=p.idu||[p.code_insee,p.section,p.numero].join("");
if(sel.has(id)){sel.get(id).layer.remove();sel.delete(id)}else{let ly=L_.layerGroup();PcRings(f).forEach(r=>L_.polygon(r,{color:"#E3B04B",weight:2.5,fillColor:"#E3B04B",fillOpacity:.35,interactive:!1}).addTo(ly));ly.addTo(pcg);sel.set(id,{f,layer:ly})}PcInfo()}
catch(er){A(er.message||"Cadastre indisponible.","err")}}
async function PcApply(){let rings=[];sel.forEach(s=>PcRings(s.f).forEach(r=>rings.push(r)));if(!rings.length)return;
let u=PcUnion(rings),ring=u[0];
if(!ring||u.length>1){let ok=await ve({title:"Parcelles non contiguës",text:"Les parcelles choisies ne forment pas une seule zone. Un territoire est un contour unique : voulez-vous englober l’ensemble dans un seul contour ?",confirm:"Englober l’ensemble"});if(!ok)return;ring=PcHull(rings.flat())}
ring=PcSimplify(ring,180);let com=[...sel.values()].map(s=>s.f.properties.nom_com).find(Boolean);
pts.splice(0,pts.length,...ring);if(com&&!meta.city)meta.city=com;PcMode(!1);redraw();
try{l.fitBounds(L_.latLngBounds(pts),{padding:[40,40],maxZoom:18})}catch{}
note.textContent=`Contour issu de ${rings.length>1?"vos parcelles":"la parcelle"}. Ajustez les sommets si besoin, puis terminez.`;A("Contour créé à partir des parcelles.")}
pmBtn=x("Choisir des parcelles",{kind:"ghost",size:"sm",icon:"map",onClick:()=>PcMode(!pm)});
pcUse=x("Utiliser ces parcelles",{kind:"primary",size:"sm",icon:"check",onClick:PcApply});pcUse.hidden=!0;
