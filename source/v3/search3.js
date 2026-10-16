/* ----- Recherche globale : pages, actions, personnes, amis, ambassadeurs, contenus ----- */
var S3Idx={at:0,p:null,data:null};
function S3Safe(p){return p.catch(()=>null)}
function S3LoadIdx(){
  if(S3Idx.data&&S3Idx.uid===(w.user&&w.user.id)&&Date.now()-S3Idx.at<60000)return Promise.resolve(S3Idx.data);
  return S3Idx.p||(S3Idx.p=(async()=>{
    let[fr,amb,art,rec,qa,grp,spm,spp,lst,dir]=await Promise.all([S3Safe(v.get("/friends")),S3Safe(v.get("/ambassadors")),S3Safe(v.get("/articles")),S3Safe(v.get("/recipes")),S3Safe(v.get("/questions")),S3Safe(v.get("/groups")),S3Safe(v.get("/spots?scope=mine")),S3Safe(v.get("/spots?scope=public")),S3Safe(v.get("/listings")),S3Safe(v.get("/directory"))]);
    let out=[],seenSp=new Set,friendIds=new Set;
    (fr&&fr.friends||[]).forEach(f=>{let u=f.user;if(!u)return;friendIds.add(u.id);out.push({sec:"Amis",kind:"person",user:u,label:u.name,hint:"Ami"+(u.city?" · "+u.city:"")+(f.status?" · en sortie":""),keys:[u.city,"ami amis"],run:()=>ge("/profil/"+u.id)})});
    (fr&&fr.received||[]).forEach(f=>{let u=f.user;u&&out.push({sec:"Amis",kind:"person",user:u,label:u.name,hint:"Demande d’ami reçue",keys:["demande ami"],run:()=>ge("/amis")})});
    let ambs=amb&&(amb.ambassadors||amb)||[];Array.isArray(ambs)&&ambs.forEach(a=>out.push({sec:"Ambassadeurs",icon:"crown",label:a.name,hint:[a.handle,a.speciality].filter(Boolean).join(" · "),keys:[(a.tags||[]).join(" "),"ambassadeur youtube chaine"],run:()=>ge("/ambassadeurs/"+a.id)}));
    (amb&&amb.latest||[]).forEach(d=>d&&d.title&&out.push({sec:"Vidéos",icon:"play",label:d.title,hint:"Vidéo · "+(d.ambassadorName||""),keys:[d.ambassadorName,"video"],run:()=>ge("/ambassadeurs/"+d.ambassadorId)}));
    (Array.isArray(art)?art:[]).forEach(a=>out.push({sec:"Articles",icon:"book",label:a.title,hint:[a.topic,a.author&&a.author.name].filter(Boolean).join(" · "),keys:[a.summary,a.author&&a.author.name,a.activity,"article"],run:()=>ge("/articles/"+a.id)}));
    let recs=rec&&(rec.items||rec.recipes||rec);Array.isArray(recs)&&recs.forEach(r=>out.push({sec:"Recettes",icon:"chef",label:r.title,hint:[r.species,r.category].filter(Boolean).join(" · "),keys:[(r.ingredients||[]).map(i=>Array.isArray(i)?i[2]:i).join(" "),"recette"],run:()=>ge("/recettes/"+r.id)}));
    (Array.isArray(qa)?qa:[]).forEach(z=>out.push({sec:"Entraide",icon:"chat",label:z.title,hint:"Question"+(z.answers?" · "+M.plural(Array.isArray(z.answers)?z.answers.length:z.answers,"réponse","réponses"):""),keys:[z.body,z.activity,"question"],run:()=>{Pe.set("qa:tab","q"),ge("/questions")}}));
    (Array.isArray(grp)?grp:[]).forEach(g=>out.push({sec:"Entraide",icon:"users",label:g.name,hint:"Groupe local · "+g.department+" · "+M.plural(g.members||0,"membre","membres"),keys:[g.description,"groupe"],run:()=>{Pe.set("qa:tab","g"),ge("/groupes")}}));
    [...(spm||[]),...(spp||[])].forEach(s=>{if(!s||seenSp.has(s.id))return;seenSp.add(s.id);out.push({sec:"Spots",icon:"pin",label:s.name,hint:(s.userId===(w.user&&w.user.id)?"Mon spot":"Spot partagé")+(s.species?" · "+(Array.isArray(s.species)?s.species.join(", "):s.species):""),keys:[s.notes,s.type,"spot peche"],run:()=>{w.season!=="peche"&&an("peche"),ge("/spots")}})});
    (Array.isArray(lst)?lst:[]).forEach(l=>out.push({sec:"Bourse",icon:"swap",label:l.title,hint:"Annonce"+(l.city?" · "+l.city:""),keys:[l.description,l.category,"bourse annonce"],run:()=>ge("/bourse")}));
    (Array.isArray(dir)?dir:[]).forEach(d=>out.push({sec:"Annuaire",icon:"store",label:d.name,hint:[d.category,d.city].filter(Boolean).join(" · "),keys:[d.address,d.offer,"professionnel annuaire"],run:()=>ge("/annuaire")}));
    out.forEach(it=>it.hay=S3Norm([it.label,it.hint,...(it.keys||[])].filter(Boolean).join(" ")));
    S3Idx.data={items:out,friendIds},S3Idx.uid=w.user&&w.user.id,S3Idx.at=Date.now(),S3Idx.p=null;return S3Idx.data
  })().catch(()=>(S3Idx.p=null,{items:[],friendIds:new Set})))
}
var S3Order=["Actions","Amis","Personnes","Ambassadeurs","Vidéos","Articles","Entraide","Recettes","Spots","Bourse","Annuaire"];
function S3Palette(){
  if(S3.palette)return;let base=S3Items(),idx=null,people=[],peopleQ="",sel=0,shown=[],tm=null,reqN=0;
  let inp=e("input",{type:"search",placeholder:"Personne, ami, ambassadeur, article, page…","aria-label":"Rechercher",autocomplete:"off",spellcheck:!1}),
    list=e("div.palette-list",{role:"listbox"}),
    status=e("span.palette-status"),
    close=()=>{clearTimeout(tm),back.remove(),S3.palette=null,document.removeEventListener("keydown",key,!0)},
    pick=it=>{close(),setTimeout(()=>it.run(),0)},
    score=(it,q)=>{let l=S3Norm(it.label);return(l.startsWith(q[0])?4:0)+(l.split(/\s+/).some(wd=>wd.startsWith(q[0]))?2:0)+(it.sec==="Amis"?1:0)},
    icon=it=>it.kind==="person"?e("span.ic.pic",oe(it.user,34)):e("span.ic",b(it.icon||"search")),
    row=(it,i,q)=>e("button.palette-item",{type:"button",role:"option","aria-selected":String(i===sel),onclick:()=>pick(it),onmousemove:()=>{sel!==i&&(sel=i,mark())}},icon(it),e("div.grow",e("b",it.label),e("span",it.hint||(q?it.sec:""))),it.kind==="person"&&it.isFriend?L("Ami","ok"):null),
    draw=()=>{
      let raw=inp.value.trim(),q=S3Norm(raw).split(/\s+/).filter(Boolean);W(list);
      if(!q.length){shown=base;let last=null;
        base.forEach((it,i)=>{it.sec!==last&&(last=it.sec,list.append(e("div.palette-sec",it.sec))),list.append(row(it,i))});
        idx&&idx.items.some(x=>x.sec==="Amis")&&(list.prepend(e("div.palette-sec","Mes amis"),e("div.palette-chips",idx.items.filter(x=>x.sec==="Amis").slice(0,8).map(x=>e("button.palette-chip",{type:"button",onclick:()=>pick(x)},oe(x.user,24),x.label.split(" ")[0])))));
        status.textContent="";return}
      let pool=[...base,...(idx?idx.items:[]),...people.filter(p=>!(idx&&idx.friendIds.has(p.user.id)))];
      let hit=pool.filter(it=>{let h=it.hay||S3Norm(it.label+" "+it.sec+" "+(it.hint||""));return q.every(t=>h.includes(t))});
      let groups=new Map;hit.forEach(it=>{let s=S3Order.includes(it.sec)?it.sec:"Pages";groups.has(s)||groups.set(s,[]),groups.get(s).push(it)});
      let order=["Amis","Personnes","Pages","Actions","Ambassadeurs","Vidéos","Articles","Entraide","Recettes","Spots","Bourse","Annuaire"];
      shown=[];order.forEach(s=>{let g=groups.get(s);if(!g)return;g.sort((a,b2)=>score(b2,q)-score(a,q));let lim=s==="Pages"?6:5;g.slice(0,lim).forEach(it=>{it._sec=s,shown.push(it)})});
      sel=Math.min(sel,Math.max(0,shown.length-1));
      if(!shown.length){status.textContent="";list.append(e("div.palette-empty",idx?"Aucun résultat pour « "+raw+" ».":"Recherche en cours…"));return}
      let last=null;shown.forEach((it,i)=>{it._sec!==last&&(last=it._sec,list.append(e("div.palette-sec",it._sec))),list.append(row(it,i,!0))});
      status.textContent=hit.length>shown.length?"Meilleurs résultats":M.plural(shown.length,"résultat","résultats")
    },
    mark=()=>{list.querySelectorAll(".palette-item").forEach((x2,i)=>x2.setAttribute("aria-selected",String(i===sel)));let c=list.querySelectorAll(".palette-item")[sel];c&&c.scrollIntoView({block:"nearest"})},
    findPeople=()=>{let raw=inp.value.trim();if(raw.length<2){people=[],peopleQ="";return}if(raw===peopleQ)return;peopleQ=raw;let n=++reqN;
      v.get("/auth/users?q="+encodeURIComponent(raw)).then(us=>{if(n!==reqN)return;people=(us||[]).map(u=>{let f=idx&&idx.friendIds.has(u.id);return{sec:"Personnes",kind:"person",user:u,isFriend:f,label:u.name,hint:[{chasseur:"Chasseur",pecheur:"Pêcheur",mixte:"Chasseur & pêcheur",usager:"Usager de la nature"}[u.profile],u.city].filter(Boolean).join(" · "),hay:S3Norm(u.name+" "+(u.city||"")),run:()=>ge("/profil/"+u.id)}}),draw()}).catch(()=>{})},
    key=ev=>{if(ev.key==="Escape"){ev.preventDefault(),close()}else if(ev.key==="ArrowDown"){ev.preventDefault(),sel=Math.min(shown.length-1,sel+1),mark()}else if(ev.key==="ArrowUp"){ev.preventDefault(),sel=Math.max(0,sel-1),mark()}else if(ev.key==="Enter"&&document.activeElement===inp){ev.preventDefault(),shown[sel]&&pick(shown[sel])}};
  inp.addEventListener("input",()=>{sel=0,draw(),clearTimeout(tm),tm=setTimeout(findPeople,180)});
  let back=e("div.palette-back",{role:"dialog","aria-modal":"true","aria-label":"Recherche","onmousedown":ev=>{ev.target===back&&close()}},
    e("div.palette",e("label.palette-in",b("search"),inp,e("kbd","Échap")),list,e("div.palette-foot",e("span","↑ ↓ pour choisir"),e("span","Entrée pour ouvrir"),status)));
  document.body.append(back),S3.palette=back,document.addEventListener("keydown",key,!0),draw(),setTimeout(()=>inp.focus(),20);
  S3LoadIdx().then(d=>{idx=d,people.forEach(p=>p.isFriend=d.friendIds.has(p.user.id)),S3.palette&&draw()})
}
