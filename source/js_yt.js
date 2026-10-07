/* YouTube Data API v3 : dernières vidéos des chaînes d'ambassadeurs (clé stockée dans le navigateur de l'administrateur) */
var YT={key(){try{return localStorage.getItem("cp360.yt.key")||window.cp360YtKey||""}catch{return window.cp360YtKey||""}},
setKey(k){try{k?localStorage.setItem("cp360.yt.key",k):localStorage.removeItem("cp360.yt.key")}catch{}},
async api(path,params){let key=YT.key();if(!key)throw new Error("Clé API YouTube non configurée.");
let u=new URL("https://www.googleapis.com/youtube/v3/"+path);Object.keys(params).forEach(a=>u.searchParams.set(a,params[a]));u.searchParams.set("key",key);
let r;try{r=await fetch(u.toString())}catch{throw new Error("YouTube est injoignable (réseau ou bloqueur). Cette fonction marche sur la version hébergée en https.")}
let j=await r.json().catch(()=>({}));
if(!r.ok){let er=j.error||{},rs=er.errors&&er.errors[0]&&er.errors[0].reason,m=er.message||("Erreur "+r.status);
throw new Error(rs==="quotaExceeded"?"Quota YouTube du jour épuisé, réessayez demain.":rs==="keyInvalid"?"Clé API invalide.":rs==="accessNotConfigured"||rs==="forbidden"&&/not been used|disabled/i.test(m)?"YouTube Data API v3 n’est pas activée pour cette clé.":/referer/i.test(m)?"Clé refusée depuis cette adresse : vérifiez la restriction de référent.":m)}
return j},
dur(iso){let m=/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso||"");if(!m)return null;let h=+m[1]||0,mi=+m[2]||0,s=+m[3]||0;return h?h+":"+String(mi).padStart(2,"0")+":"+String(s).padStart(2,"0"):mi+":"+String(s).padStart(2,"0")},
ref(a){let u=String(a.channelUrl||""),id=a.channelId||(/youtube\.com\/channel\/(UC[\w-]+)/.exec(u)||[])[1],h=a.handle||(/youtube\.com\/(@[\w.\-]+)/.exec(u)||[])[1];return{id,handle:h}},
async uploads(a){let r=YT.ref(a);if(r.id&&/^UC/.test(r.id))return"UU"+r.id.slice(2);
if(!r.handle)throw new Error("Chaîne introuvable : renseignez un lien en @identifiant ou /channel/UC…");
let j=await YT.api("channels",{part:"contentDetails",forHandle:r.handle});let c=j.items&&j.items[0];
if(!c)throw new Error("Aucune chaîne trouvée pour "+r.handle+".");return c.contentDetails.relatedPlaylists.uploads},
async latest(a,n){n=n||10;let pl=await YT.uploads(a),j=await YT.api("playlistItems",{part:"snippet,contentDetails",playlistId:pl,maxResults:n});
let items=(j.items||[]).filter(i=>i.snippet&&i.snippet.title!=="Private video"&&i.snippet.title!=="Deleted video"),ids=items.map(i=>i.contentDetails.videoId),d={};
if(ids.length){let vj=await YT.api("videos",{part:"contentDetails",id:ids.join(",")});(vj.items||[]).forEach(x=>{d[x.id]=YT.dur(x.contentDetails.duration)})}
return items.map(i=>{let id=i.contentDetails.videoId;return{id,title:i.snippet.title,url:"https://www.youtube.com/watch?v="+id,date:i.contentDetails.videoPublishedAt||i.snippet.publishedAt,duration:d[id]||null}})},
async test(){let j=await YT.api("channels",{part:"snippet",id:"UCWkN-tswUhuJxCAl8z-jwOQ"});return j.items&&j.items[0]?j.items[0].snippet.title:"clé valide"},
async sync(a){let vids=await YT.latest(a,10);let r=await v.post("/admin/ambassadors/"+a.id+"/videos/sync",{videos:vids});return vids.length}};
function YtPanel(list){let inp=e("input",{type:"password",placeholder:"Clé API (AIza…)",value:YT.key(),autocomplete:"off",spellcheck:!1,style:{width:"100%"}}),st=e("div.small.muted",YT.key()?"Clé enregistrée dans ce navigateur.":"Aucune clé : les vidéos se gèrent à la main."),
say=(m,bad)=>{W(st);C(st,m);st.className="small "+(bad?"":"muted");st.style.color=bad?"#B3261E":""},
save=()=>{YT.setKey(inp.value.trim());say(inp.value.trim()?"Clé enregistrée dans ce navigateur.":"Clé retirée.")},
test=async()=>{save();try{say("Test en cours…");let n=await YT.test();say("✓ Clé valide ("+n+" joignable).")}catch(er){say(er.message,!0)}},
all=async()=>{save();let tot=0,bad=[],ok=list.filter(a=>{let r=YT.ref(a);return r.id||r.handle}),skip=list.length-ok.length;
for(let a of ok){try{tot+=await YT.sync(a)}catch(er){bad.push(a.name+" : "+er.message)}}
if(bad.length)A(bad.join(" · "),"err");if(tot||!bad.length)A(tot+" vidéo(s) synchronisée(s)"+(skip?" · "+skip+" ambassadeur(s) fictif(s) ignoré(s)":"")+".");
if(tot)Ie();else if(!bad.length)say("Aucune chaîne réelle à synchroniser.")};
return e("div.stack",YtLinks(list),k({title:"Synchronisation YouTube",sub:"API YouTube Data v3 : récupère les dernières vidéos de chaque chaîne."},e("div.stack",e("label.small",{style:{fontWeight:"600"}},"Clé API YouTube"),inp,st,
e("div.row",{style:{gap:"8px",flexWrap:"wrap"}},x("Enregistrer",{size:"sm",kind:"ghost",onClick:save}),x("Tester la clé",{size:"sm",kind:"ghost",onClick:test}),x("Tout synchroniser",{icon:"play",size:"sm",kind:"primary",onClick:all})),
e("div.tiny.muted","La clé reste dans ce navigateur. Limitez-la à l’API YouTube Data v3 et à l’adresse de votre site (voir YOUTUBE.md)."))))}

function YtId(u){let s=String(u||"").trim(),m=/(?:[?&]v=|youtu\.be\/|\/shorts\/|\/embed\/)([\w-]{11})/.exec(s);return m?m[1]:(/^[\w-]{11}$/.test(s)?s:null)}
function YtThumb(u){let id=YtId(u);if(!id)return null;let im=e("img",{src:"https://img.youtube.com/vi/"+id+"/hqdefault.jpg",alt:"",loading:"lazy",referrerpolicy:"no-referrer"});im.onerror=()=>im.remove();return im}
function YtLinks(list){let real=(list||[]).filter(a=>a.real||a.channelUrl&&/youtube\.com\/(@|channel)/.test(a.channelUrl)),sel=e("select.input",(real.length?real:list||[]).map(a=>e("option",{value:a.id,selected:a.id==="amb_feliew"},a.name))),ta=e("textarea.input",{rows:5,placeholder:"https://www.youtube.com/watch?v=…\nhttps://youtu.be/…\n(un lien par ligne)",style:{width:"100%"}}),st=e("div.small.muted","");
let go=async()=>{let ids=[...new Set(ta.value.split(/\s+/).map(YtId).filter(Boolean))];if(!ids.length){W(st);C(st,"Aucun lien YouTube reconnu.");return}
W(st);C(st,"Import de "+ids.length+" vidéo(s)…");let vids=[],noTitle=0;
for(let id of ids){let url="https://www.youtube.com/watch?v="+id,title=null;try{let r=await fetch("https://www.youtube.com/oembed?format=json&url="+encodeURIComponent(url));if(r.ok){let j=await r.json();title=j.title}}catch{}
if(!title){noTitle++;title="Vidéo YouTube ("+id+")"}vids.push({url,title})}
try{await v.post("/admin/ambassadors/"+sel.value+"/videos/sync",{videos:vids});A(vids.length+" vidéo(s) ajoutée(s)"+(noTitle?" · "+noTitle+" sans titre (YouTube injoignable depuis ce navigateur)":"")+".");ta.value="";Ie()}catch(er){W(st);C(st,er.message);st.style.color="#B3261E"}};
return k({title:"Importer des liens de vidéos",sub:"Sans clé API : collez les liens, les vignettes viennent de YouTube."},e("div.stack",e("label.small",{style:{fontWeight:"600"}},"Ambassadeur"),sel,ta,st,x("Importer les vidéos",{icon:"play",size:"sm",kind:"primary",onClick:go}),e("div.tiny.muted","Les titres sont lus via YouTube (oEmbed). La date n’est pas fournie : elle correspond au jour de l’import. Pour les vraies dates, utilisez la clé API.")))}
