/* ===== partage de territoire entre amis (lecture seule) : côté carte ===== */
function ShareColors(){return{f:"#1F7A8C",s:"#145A6B",d:"10 7"}}
let ShareTok=0;
async function ShareLoad(group){
 let tok=++ShareTok,list=[];
 try{list=await v.get("/territory-shares/received")}catch{return}
 if(ShareTok!==tok)return;
 window.__shares=list;
 list.forEach(s=>{
  let lay=[],pop=e("div",{style:{minWidth:"210px"}},e("b",s.name),e("div.small",`Territoire partagé par ${s.owner.name}`),e("div.tiny.muted",`${s.surface?s.surface+" ha":""}${s.city?(s.surface?" · ":"")+s.city:""}`),e("div",{style:{marginTop:"8px"}},x("Retirer de ma carte",{kind:"ghost",size:"sm",onClick:async()=>{try{await v.del("/territory-shares/"+s.shareId);lay.forEach(z=>group.removeLayer(z));l.closePopup();A("Territoire retiré de votre carte.")}catch(er){A(er.message,"err")}}})));
  let g=TerrShape(Ve(),s.boundary,pop,ShareColors());g.addTo(group);lay.push(g);
  (s.places||[]).forEach(p=>{let mk=Ve().marker([p.lat,p.lng],{icon:PlaceIcon(Ve(),p)}).bindPopup("<b>"+Esc(p.name)+"</b>"+(p.type?"<br>"+Esc(p.type):"")+"<br><span class='tiny'>Partagé par "+Esc(s.owner.name)+"</span>");mk.addTo(group);lay.push(mk)})
 })
}
async function ShareReceived(){
 let ls=[];try{ls=await v.get("/territory-shares/received")}catch(er){A(er.message,"err");return}
 let m=Le({title:"Territoires partagés avec moi",body:ls.length?e("div.stack",e("p.small.muted",{style:{margin:0}},"Territoires que vos amis ont partagés avec vous : vous pouvez les consulter sur la carte pour les étudier. Ils s’affichent en bleu-vert."),ls.map(s=>e("div.row",{style:{gap:"8px",alignItems:"center",flexWrap:"wrap"}},oe(s.owner,36),e("div.grow",e("b",s.name),e("div.tiny.muted",`Par ${s.owner.name}${s.surface?" · "+s.surface+" ha":""}${s.city?" · "+s.city:""}`)),x("Voir",{kind:"ghost",size:"sm",onClick:()=>{m.close();try{r.data.includes("territories")||(r.data.push("territories"),n(),F())}catch{}TerrFit(l,[s],!0)}}),Rn("trash","Retirer de ma carte",async()=>{if(await ve({title:"Retirer ce territoire de votre carte ?",text:`${s.name} (${s.owner.name}) ne s’affichera plus. Votre ami pourra le repartager.`,confirm:"Retirer"})){try{await v.del("/territory-shares/"+s.shareId);m.close();A("Territoire retiré de votre carte.");T()}catch(er){A(er.message,"err")}}})))):e("p.small.muted",{style:{margin:0}},"Aucun territoire partagé pour l’instant. Quand un ami partage le sien, il apparaît ici et sur votre carte.")})
}
async function ShareDialog(q){
 let fr=[],sh=[];
 try{[fr,sh]=await Promise.all([v.get("/friends").then(z=>z.friends||[]),v.get("/territory-shares/mine/"+q.id)])}catch(er){A(er.message,"err");return}
 let withP="1",body=e("div.stack"),m=Le({title:"Partager « "+q.name+" »",body}),draw=()=>{
  W(body);
  C(body,e("p.small.muted",{style:{margin:0}},"Les amis que vous choisissez peuvent voir ce territoire sur leur carte pour l’étudier. Ils ne peuvent pas le modifier, et cela ne leur donne aucun droit de chasser ou de pêcher dessus. Pas de lien public : uniquement vos amis, un par un."),
   ke([["1","Avec mes lieux"],["0","Contour seulement"]],withP,d=>{withP=d}));
  if(!fr.length){C(body,e("p.small",{style:{margin:0}},"Vous n’avez pas encore d’amis dans l’application."),x("Trouver des amis",{icon:"users",kind:"primary",size:"block",onClick:()=>{m.close();location.hash="#/amis"}}));return}
  fr.forEach(f=>{let s=sh.find(z=>z.friendId===f.user.id);C(body,e("div.row",{style:{gap:"10px",alignItems:"center"}},oe(f.user,36),e("div.grow",e("b",f.user.name),e("div.tiny.muted",s?(s.withPlaces?"Partagé avec les lieux":"Partagé, contour seulement"):"Non partagé")),
   s?x("Retirer",{kind:"ghost",size:"sm",onClick:async()=>{try{await v.del("/territory-shares/"+s.id);sh=sh.filter(z=>z.id!==s.id);A("Partage retiré.");draw()}catch(er){A(er.message,"err")}}}):x("Partager",{kind:"primary",size:"sm",onClick:async()=>{try{let z=await v.post("/territory-shares",{territoryId:q.id,friendId:f.user.id,withPlaces:withP==="1"});sh.push(z);A("Territoire partagé avec "+f.user.name+".","ok");draw()}catch(er){A(er.message,"err")}}})))})
 };
 draw()
}
