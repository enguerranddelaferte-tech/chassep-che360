# Fond photo chasse (option Profil > Affichage)
css='/* fond photo (gen_banniere.py) : chasse = cerf au brame, pêche = aucun pour l instant ; thèmes par saison mis de côté */\n'
def fond(univ,photo,pos,top,mid,low):
    sel=f':root[data-banniere="on"]'+(':not([data-season="peche"])' if univ=='chasse' else '[data-season="peche"]')+':not([data-theme="contrast"]):not([data-role="admin"])'
    out=f'''{sel} body::before {{ content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: linear-gradient(to bottom, rgba(243,240,232,{top}) 0%, rgba(243,240,232,{mid}) 32%, rgba(243,240,232,{low}) 66%, var(--bg) 100%), url("img/{photo}") {pos} / cover no-repeat; }}
{sel.replace('[data-theme="contrast"]','[data-theme="dark"]').replace(':not([data-theme="dark"])','[data-theme="dark"]')} body::before {{ background: linear-gradient(to bottom, rgba(19,27,25,{top+0.2:.2f}) 0%, rgba(19,27,25,{mid+0.2:.2f}) 32%, rgba(19,27,25,.93) 66%, var(--bg) 100%), url("img/{photo}") {pos} / cover no-repeat; }}
'''
    return out
css+=':root[data-saison] body { background: var(--pattern, none), var(--bg); }\n'
css+=fond('chasse','fond-chasse.webp','62% 55%',.12,.40,.86)
css+=fond('peche','fond-peche.webp','30% 55%',.50,.62,.90)
css+='@media print { body::before { display: none !important; } }\n'
css+=f'''
/* design system 360 : jetons, SOS en pastille */
:root {{ --brick: #A82312; }}
:root[data-theme="dark"] {{ --surface: #1E2826; --surface-2: #283431; --line: #2A3633; --text-2: #D1D5DB; --muted: #9CA3AF; --brick: #C23A28; }}
:root[data-theme="contrast"] {{ --surface: #121212; --muted: #E5E7EB; --brick: #FF4D3A; }}
.sos-fab {{ width: auto; height: auto; min-width: 48px; min-height: 48px; padding: 12px 20px 12px 16px; border: 2px solid rgba(255,255,255,.25); border-radius: 999px; align-items: center; gap: 8px; font: 800 15px/1 var(--font, 'Barlow', sans-serif); letter-spacing: .1em; box-shadow: 0 18px 38px rgba(168,35,18,.45); transition: transform .12s, background .15s; }}
@media (min-width: 761px) {{ .sos-fab {{ display: inline-flex; }} }}
.sos-fab:hover {{ background: #8F1D0E; }}
.sos-fab:active {{ transform: scale(.95); }}
.sos-fab::before {{ content: ""; width: 22px; height: 22px; background: currentColor; -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3'/%3E%3Cpath d='M12 9v4'/%3E%3Cpath d='M12 17h.01'/%3E%3C/svg%3E") center / contain no-repeat; mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3'/%3E%3Cpath d='M12 9v4'/%3E%3Cpath d='M12 17h.01'/%3E%3C/svg%3E") center / contain no-repeat; }}
@media (prefers-reduced-motion: no-preference) {{ .sos-fab::before {{ animation: sosPulse 2s cubic-bezier(.4,0,.6,1) infinite; }} }}
@keyframes sosPulse {{ 50% {{ opacity: .45; }} }}
'''
open('banniere.css','w',encoding='utf-8').write(css)
