# Photo de fond de saison (option Profil > Affichage) : photo plein écran fixe, voilée, qui s'efface vers le fond crème/sombre
POS={('printemps','chasse'):'15%',('printemps','peche'):'45%',('ete','chasse'):'30%',('ete','peche'):'35%',('automne','chasse'):'40%',('automne','peche'):'75%',('hiver','chasse'):'85%',('hiver','peche'):'55%'}
NOM={'printemps':'Printemps','ete':'Été','automne':'Automne','hiver':'Hiver'}
css='/* bandeau photo de saison (gen_banniere.py) */\n'
for s in NOM:
    for m,lab in (('chasse','Chasse'),('peche','Pêche')):
        sel=f':root[data-banniere="on"][data-saison="{s}"]'+('[data-season="peche"]' if m=='peche' else ':not([data-season="peche"])')
        css+=f'{sel} {{ --bn-photo: url("img/banniere-{s}-{m}.webp"); --bn-pos: {'62% 55%' if (s,m)==('automne','chasse') else '50% '+POS[(s,m)]}; --bn-label: "{lab.upper()} • {NOM[s].upper()}"; }}\n'
C=':root[data-banniere="on"]:not([data-theme="contrast"]):not([data-role="admin"])'
css+=f'''
{C} body {{ background: var(--bg); }}
{C} body::before {{ content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: linear-gradient(to bottom, rgba(243,240,232,.12) 0%, rgba(243,240,232,.40) 32%, rgba(243,240,232,.86) 66%, var(--bg) 100%), var(--bn-photo, none) var(--bn-pos, center) / cover no-repeat; }}
:root[data-banniere="on"][data-theme="dark"]:not([data-role="admin"]) body::before {{ background: linear-gradient(to bottom, rgba(19,27,25,.35) 0%, rgba(19,27,25,.62) 32%, rgba(19,27,25,.93) 66%, var(--bg) 100%), var(--bn-photo, none) var(--bn-pos, center) / cover no-repeat; }}
@media print {{ body::before {{ display: none !important; }} }}

'''
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
