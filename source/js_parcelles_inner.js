var pcUse,undoBtn,topBar,segHost=e("div",{style:{flex:"1 1 auto",minWidth:0}}),pinf2=e("div.small",{style:{fontWeight:600}});
function PcInfo(){let n=sel.size;inf.hidden=pm;pinf2.hidden=!pm;pcUse.hidden=!pm;fin.hidden=pm;undoBtn&&(undoBtn.hidden=pm);if(!pm)return;
if(!n){pinf2.textContent="Touchez les parcelles de votre territoire";note.textContent="Zoomez sur vos parcelles (niveau 15 minimum), puis touchez-les une à une."}
else{let ha=0,com=new Set();sel.forEach(s=>{ha+=(s.f.properties.contenance||0)/1e4;s.f.properties.nom_com&&com.add(s.f.properties.nom_com)});pinf2.textContent=`${n} parcelle${n>1?"s":""} · environ ${Math.round(ha*10)/10} ha${com.size?" · "+[...com].slice(0,2).join(", "):""}`;note.textContent="Touchez une parcelle choisie pour la retirer."}
pcUse.disabled=!n}
function PcMode(v_){if(v_&&!HasF("territory.parcels")){j.emit("premium",{error:"Le choix des parcelles cadastrales pour créer son territoire fait partie des offres Premium (Chasse, Pêche ou Combo). Le tracé à la main reste gratuit."});segSet("trace");return}pm=!!v_;if(pm){if(!cad){cad=L_.tileLayer(on("CADASTRALPARCELS.PARCELLAIRE_EXPRESS"),{maxZoom:19,opacity:.9,attribution:qn}).addTo(l)}l.getContainer().style.cursor="crosshair"}else{cad&&(cad.remove(),cad=null);l.getContainer().style.cursor="";pcg.clearLayers();sel.clear();note.textContent=""}PcInfo()}
function segSet(m){W(segHost);C(segHost,ke([["parcelles","Parcelles"],["trace","Tracé"]],m,v_=>{PcMode(v_==="parcelles")}));PcMode(m==="parcelles")}
async function PcClick(ev){if(l.getZoom()<15){A("Rapprochez-vous : zoomez sur la carte pour désigner une parcelle.","warn");return}
pinf2.textContent="Recherche de la parcelle…";
try{let f=await PcFetch(ev.latlng.lat,ev.latlng.lng);if(!f){A("Aucune parcelle trouvée à cet endroit.","warn");PcInfo();return}
let p=f.properties||{},id=p.idu||[p.code_insee,p.section,p.numero].join("");
if(sel.has(id)){sel.get(id).layer.remove();sel.delete(id)}else{let ly=L_.layerGroup();PcRings(f).forEach(r=>L_.polygon(r,{color:"#E3B04B",weight:2.5,fillColor:"#E3B04B",fillOpacity:.35,interactive:!1}).addTo(ly));ly.addTo(pcg);sel.set(id,{f,layer:ly})}PcInfo()}
catch(er){A(er.message||"Cadastre indisponible.","err");PcInfo()}}
function PcApply(){let rings=[];sel.forEach(s=>PcRings(s.f).forEach(r=>rings.push(r)));if(!rings.length)return;
let u=PcUnion(rings);if(!u.length||PcArea2(u[0])<=0){A("Contour impossible à calculer : retirez la dernière parcelle et réessayez.","err");return}
let ring=PcJoin(u),parts=u.filter(r=>PcArea2(r)>0).length;if(ring.length>2500)ring=PcSimplify(ring,2500);
let com=[...sel.values()].map(s=>s.f.properties.nom_com).find(Boolean);
pts.splice(0,pts.length,...ring);if(com&&!meta.city)meta.city=com;segSet("trace");redraw();
try{l.fitBounds(L_.latLngBounds(pts),{padding:[40,60],maxZoom:18})}catch{}
note.textContent=parts>1?`Contour exact de vos ${sel.size||rings.length} parcelles (${parts} zones reliées). Touchez « Terminer ».`:"Contour exact de vos parcelles. Touchez « Terminer ».";A("Contour créé à partir des parcelles.")}
pcUse=x("Utiliser ces parcelles",{kind:"primary",size:"block",icon:"check",onClick:PcApply});pcUse.hidden=!0;
