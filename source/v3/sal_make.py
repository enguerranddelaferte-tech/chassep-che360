import sys
B=sys.argv[1]
d=open(B+'sal_read.js').read()
def seg(a,b): i=d.index(a); j=d.index(b,i); return d[i:j]
css_v=seg('var SalCss=','function SalCalc(')
css_v=css_v.replace('.sal-prose p{margin:0 0 10px;max-width:68ch}`','.sal-prose p{margin:0 0 10px;max-width:68ch}.sal-sub{margin:0 0 0 24px;padding-left:12px;border-left:2px solid var(--line)}.sal-sub .sal-g{font-size:22px}.sal-chk{margin-top:10px;padding:10px 12px;border-radius:var(--r-sm);font-size:14px;background:var(--surface-2)}.sal-chk.ok{background:color-mix(in srgb,var(--ok) 14%,transparent)}.sal-chk.mid{background:color-mix(in srgb,var(--warn) 16%,transparent)}.sal-chk.bad{background:color-mix(in srgb,var(--brick) 14%,transparent)}`',1)
assert '.sal-chk' in css_v
rest=d[d.index('function SalMeth(){'):]
R=[
('Dissolvez 80 à 100 g de sel par litre d’eau froide (saumure à 8–10 %), avec un peu de sucre si vous le souhaitez.','Dissolvez 80 à 100 g de sel par litre d’eau froide (saumure à 8–10 %), avec 20 à 25 g de sucre si vous le souhaitez. Le calculateur donne les grammes.'),
('Immergez les filets : 1 à 3 h selon l’épaisseur, au réfrigérateur.','Immergez les filets au réfrigérateur : 1 à 2 h pour une truite, 2 à 3 h pour un filet épais.'),
('Pour une saumure longue sur une viande, préférez une saumure à l’équilibre calculée sur le poids total eau + viande.','Pour une saumure longue sur une viande, préférez une saumure à l’équilibre : 2,5 à 3 % de sel sur le poids total eau + viande (onglet Calculateur).'),
('Pesez la pièce parée, puis le sel, le sucre et les épices au pourcentage voulu (le calculateur s’en charge).','Pesez la pièce parée, puis le sel (2,5 à 3 %), le sucre (0,5 à 1 %) et les épices (0,2 à 0,5 %). Le calculateur s’en charge, sel nitrité compris.'),
('Salez à dose fixe (3 % de sel, 1 % de sucre) sous vide, ou enfouissez 12 à 24 h dans le gros sel.','Salez à dose fixe (2,5 à 3 % de sel, 1 % de sucre, 0,5 % de poivre) sous vide, ou enfouissez 12 à 24 h dans le gros sel.'),
('Mélangez sel (3 %), sucre (1,5 %), poivre, genièvre écrasé, laurier et thym ; frottez et mettez sous vide.','Mélangez sel (2,8 %, dont 20 g de sel nitrité par kilo au plus), sucre (1 %), poivre (0,3 %), genièvre écrasé, laurier et thym ; frottez et mettez sous vide.'),
('Salez, puis laissez reposer 2 à 3 semaines au froid pour que le sel atteigne le cœur.','Salez à 3 % (dont 20 g de sel nitrité par kilo au plus) pour une noix, ou au gros sel pour un jambon entier, puis laissez reposer 2 à 3 semaines au froid pour que le sel atteigne le cœur.'),
('Hachez gros, ajoutez 26 à 28 g de sel par kilo (de préférence sel nitrité), un peu de sucre, poivre, ail, et un ferment si vous en avez.','Hachez gros et ajoutez par kilo de mêlée : 26 g de sel dont 20 g de sel nitrité au plus, 3 à 5 g de dextrose ou de sucre, 3 g de poivre, 1 à 2 g d’ail, et un ferment si vous en avez.'),
('Mélangez à parts égales sel et sucre, environ 40 g de chaque pour 500 g de filet, avec poivre et aneth.','Mélangez à parts égales sel et sucre, environ 40 g de chaque pour 500 g de filet (8 %), avec poivre concassé et aneth.'),
('Plongez-les 1 à 2 h dans une saumure à 8–10 % (80 à 100 g de sel par litre).','Plongez-les 1 à 2 h dans une saumure à 8–10 % (80 à 100 g de sel par litre, 2 litres pour une ou deux truites).'),
('Respectez la dose indiquée sur le paquet et ne le mélangez pas à du nitrite pur.','En France, il contient en général 0,6 % de nitrite de sodium : vérifiez le paquet. Depuis le 9 octobre 2025, la charcuterie ne doit pas recevoir plus de 80 mg de nitrite par kilo (en ion nitrite), soit environ 20 g de sel nitrité à 0,6 % par kilo. Complétez le reste du sel avec du sel fin, et ne le mélangez jamais à du nitrite pur.'),
]
for a,b in R:
    assert rest.count(a)==1,a
    rest=rest.replace(a,b)
rest=rest.replace('e("li",e("a",{href:"https://draaf','e("li",e("a",{href:"https://eur-lex.europa.eu/eli/reg/2023/2108/oj",target:"_blank",rel:"noopener"},"Règlement (UE) 2023/2108 : nitrites et nitrates")),   e("li",e("a",{href:"https://draaf',1)
new=open(B+'v3/sal_calc3.js').read()
i=new.index('var SalNitMax');pres=new[:i];calc=new[i:]
out=pres+css_v+calc+'\n'+rest
open(B+'v3/sal3.js','w').write(out)
print(len(out))
