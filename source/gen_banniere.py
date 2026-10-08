# Bandeau photo de saison (option Profil > Affichage), d'après HeaderBanner : 170/210 px, voile, pastille univers • saison
POS={('printemps','chasse'):'15%',('printemps','peche'):'45%',('ete','chasse'):'30%',('ete','peche'):'35%',('automne','chasse'):'40%',('automne','peche'):'75%',('hiver','chasse'):'85%',('hiver','peche'):'55%'}
NOM={'printemps':'Printemps','ete':'Été','automne':'Automne','hiver':'Hiver'}
css='/* bandeau photo de saison (gen_banniere.py) */\n'
for s in NOM:
    for m,lab in (('chasse','Chasse'),('peche','Pêche')):
        sel=f':root[data-banniere="on"][data-saison="{s}"]'+('[data-season="peche"]' if m=='peche' else ':not([data-season="peche"])')
        css+=f'{sel} {{ --bn-photo: url("img/banniere-{s}-{m}.webp"); --bn-pos: 50% {POS[(s,m)]}; --bn-label: "{lab.upper()} • {NOM[s].upper()}"; }}\n'
C=':root[data-banniere="on"]:not([data-theme="contrast"]):not([data-role="admin"])'
css+=f'''
{C} .page::before {{ content: var(--bn-label, ""); display: flex; align-items: flex-start; height: 200px; margin: 0 0 20px; padding: 14px 16px; box-sizing: border-box; border-radius: 16px; font: 800 11px/1 var(--font, 'Barlow', sans-serif); letter-spacing: .1em; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.6); background: linear-gradient(to top, rgba(0,0,0,.8), rgba(0,0,0,.3) 55%, transparent), var(--bn-photo, none) var(--bn-pos, center) / cover no-repeat, var(--surface-3, #ddd); box-shadow: 0 1px 2px rgba(0,0,0,.08); }}
:root[data-banniere="on"][data-theme="dark"]:not([data-role="admin"]) .page::before {{ filter: brightness(.8); }}
{C} .page:has(> .page-head)::before {{ margin-bottom: -200px; }}
{C} .page-head {{ position: relative; min-height: 200px; padding: 0 16px 16px; margin-bottom: 20px; align-items: flex-end; }}
{C} .page-head h1 {{ color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,.5); font-size: clamp(26px, 3.4vw, 36px); }}
{C} .page-head p {{ color: #E5E7EB; font-size: 15px; margin-top: 6px; text-shadow: 0 1px 3px rgba(0,0,0,.5); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }}
@media (min-width: 900px) {{ {C} .page::before {{ height: 210px; padding: 18px 22px; }} {C} .page:has(> .page-head)::before {{ margin-bottom: -210px; }} {C} .page-head {{ min-height: 210px; padding: 0 22px 20px; }} }}
@media print {{ .page::before {{ display: none !important; }} }}

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
