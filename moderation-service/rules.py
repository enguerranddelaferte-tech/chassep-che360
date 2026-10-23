"""Ce que le service recherche dans les photos, décrit en phrases (analyse « zéro exemple » avec CLIP).

Chaque catégorie : (libellé français, type, seuil, descriptions en anglais pour le modèle).
Types : « p » espèce protégée en France, « s » image choquante, « n » nudité ou tenue légère,
« d » geste dangereux, « g » simple repère sans action.
Le modèle répartit 100 % de probabilité entre toutes les descriptions ; une catégorie est retenue
quand la somme de ses descriptions atteint le seuil. Les repères « g » servent aussi à absorber
les photos normales de chasse et de pêche, pour éviter les fausses alertes.

Pour ajouter une espèce ou ajuster un seuil : modifier cette liste puis redémarrer le service.
"""
CATEGORIES = [
    # --- espèces protégées en France ---
    ("Loup", "p", .5, ["a grey wolf", "a wolf in the wild"]),
    ("Lynx", "p", .5, ["a eurasian lynx"]),
    ("Ours brun", "p", .5, ["a brown bear"]),
    ("Loutre", "p", .5, ["a eurasian otter"]),
    ("Castor", "p", .5, ["a beaver"]),
    ("Bouquetin", "p", .6, ["an alpine ibex with long curved horns"]),
    ("Grand tétras", "p", .55, ["a capercaillie, a large black forest grouse"]),
    ("Chat forestier", "p", .6, ["a european wildcat in the forest"]),
    ("Écureuil roux", "p", .5, ["a red squirrel"]),
    ("Hérisson", "p", .5, ["a hedgehog"]),
    ("Rapace", "p", .5, ["an eagle", "a red kite, a bird of prey", "a buzzard", "a falcon", "a vulture", "a hawk"]),
    ("Chouette ou hibou", "p", .5, ["an owl"]),
    ("Cigogne", "p", .5, ["a white stork", "a black stork"]),
    ("Héron ou aigrette", "p", .5, ["a grey heron", "an egret"]),
    ("Grue cendrée", "p", .5, ["a common crane bird"]),
    ("Petit oiseau protégé", "p", .55, ["a goldfinch", "a robin", "a bee-eater", "a kingfisher", "a tit bird"]),
    ("Amphibien protégé", "p", .5, ["a fire salamander", "a newt", "a tree frog"]),
    ("Tortue", "p", .5, ["a turtle", "a tortoise"]),
    ("Esturgeon", "p", .6, ["a sturgeon fish"]),
    # --- contenus à vérifier ---
    ("Image choquante", "s", .55, ["a gruesome photo of bloody guts", "a close-up of a bloody open wound", "a mutilated animal"]),
    ("Nudité ou tenue légère", "n", .5, ["a naked person", "a person in underwear or lingerie", "a person in a bikini"]),
    ("Geste dangereux", "d", .55, ["a person pointing a gun at another person"]),
    # --- repères ordinaires (aucune action) ---
    ("Cervidé", "g", .3, ["a red deer stag", "a roe deer", "a deer", "a fallow deer"]),
    ("Sanglier", "g", .3, ["a wild boar"]),
    ("Chamois ou mouflon", "g", .3, ["a chamois", "a mouflon"]),
    ("Petit gibier", "g", .3, ["a hare", "a rabbit", "a red fox", "a badger"]),
    ("Gibier à plumes", "g", .3, ["a pheasant", "a partridge", "a mallard duck", "a woodcock", "a wood pigeon", "a goose"]),
    ("Gibier abattu", "g", .3, ["a hunter posing with a dead deer", "a dead wild boar after a hunt", "game laid out after a hunt"]),
    ("Poisson", "g", .3, ["a trout", "a pike", "a carp", "a perch", "a zander", "a salmon", "a catfish", "a fisherman holding a fish"]),
    ("Chien", "g", .3, ["a hunting dog", "a dog"]),
    ("Chasseur", "g", .3, ["a hunter in orange with a rifle", "hunters in a field"]),
    ("Pêcheur", "g", .3, ["a fisherman with a fishing rod", "a fishing reel and tackle"]),
    ("Paysage", "g", .3, ["a forest landscape", "a river", "a lake", "a field at sunrise", "mountains"]),
    ("Cuisine", "g", .3, ["a plate of food", "a cooked meal"]),
    ("Autre", "g", 1.1, ["a group of people", "a car", "a screenshot with text", "a selfie"]),
]

PROMPTS, OWNER = [], []
for idx, (_, _, _, descs) in enumerate(CATEGORIES):
    for d in descs:
        PROMPTS.append("a photo of " + d)
        OWNER.append(idx)

FLAG_ORDER = {"p": "espece-protegee", "s": "image-choquante", "n": "tenue", "d": "geste-dangereux"}


def evaluate(probs) -> dict:
    """probs : probabilités pour chaque description de PROMPTS (somme = 1)."""
    sums = [0.0] * len(CATEGORIES)
    for p, o in zip(probs, OWNER):
        sums[o] += float(p)
    found = []
    for (label, kind, th, _), s in zip(CATEGORIES, sums):
        if s >= th:
            found.append({"label": label, "kind": kind, "p": round(s, 2)})
    found.sort(key=lambda f: -f["p"])
    flagged = [f for f in found if f["kind"] in FLAG_ORDER]
    best = max(range(len(sums)), key=lambda i: sums[i])
    return {
        "found": found[:4],
        "flag": FLAG_ORDER[flagged[0]["kind"]] if flagged else None,
        "flagLabel": flagged[0]["label"] if flagged else None,
        "top": [[CATEGORIES[best][0], round(sums[best], 3)]],
    }
