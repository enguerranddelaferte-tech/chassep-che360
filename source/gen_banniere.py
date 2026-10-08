# Bandeau photo de saison (option Profil > Affichage), d'après HeaderBanner : 170/210 px, voile, pastille univers • saison
POS={('printemps','chasse'):'15%',('printemps','peche'):'45%',('ete','chasse'):'30%',('ete','peche'):'35%',('automne','chasse'):'40%',('automne','peche'):'75%',('hiver','chasse'):'85%',('hiver','peche'):'55%'}
NOM={'printemps':'Printemps','ete':'Été','automne':'Automne','hiver':'Hiver'}
css='/* bandeau photo de saison (gen_banniere.py) */\n'
for s in NOM:
    for m,lab in (('chasse','Chasse'),('peche','Pêche')):
        sel=f':root[data-banniere="on"][data-saison="{s}"]'+('[data-season="peche"]' if m=='peche' else ':not([data-season="peche"])')
        css+=f'{sel} {{ --bn-photo: url("img/banniere-{s}-{m}.webp"); --bn-pos: 50% {POS[(s,m)]}; --bn-label: "{lab.upper()} • {NOM[s].upper()}"; }}\n'
css+='''
:root[data-banniere="on"] .page::before { content: var(--bn-label, ""); display: flex; align-items: flex-end; height: 170px; margin: 0 0 20px; padding: 14px 16px; box-sizing: border-box; border-radius: 16px; font: 800 12px/1 var(--font, 'Barlow', sans-serif); letter-spacing: .1em; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.6); background: linear-gradient(to top, rgba(0,0,0,.62), rgba(0,0,0,.12) 55%, transparent), var(--bn-photo, none) var(--bn-pos, center) / cover no-repeat, var(--surface-3, #ddd); box-shadow: 0 1px 2px rgba(0,0,0,.08); }
:root[data-banniere="on"][data-theme="dark"] .page::before { background-blend-mode: normal; filter: brightness(.8); }
@media (min-width: 900px) { :root[data-banniere="on"] .page::before { height: 210px; padding: 18px 22px; } }
:root[data-banniere="on"][data-theme="contrast"] .page::before, :root[data-banniere="on"][data-role="admin"] .page::before { display: none; }
@media print { .page::before { display: none !important; } }
'''
open('banniere.css','w',encoding='utf-8').write(css)
