"""Règles de modération appliquées aux probabilités ImageNet de YOLOv8n-cls.

Chaque groupe : (indices ImageNet, libellé français, type, seuil).
Type « p » = espèce protégée en France, « t » = tenue légère, « g » = simple repère (aucune action).
Un groupe est retenu quand la somme des probabilités de ses indices atteint le seuil.
"""
import numpy as np

GROUPS = [
    ([269, 270, 271], "Loup", "p", .45), ([287], "Lynx", "p", .45), ([294], "Ours brun", "p", .5),
    ([360], "Loutre", "p", .5), ([337], "Castor", "p", .5), ([350], "Bouquetin", "p", .85),
    ([21], "Milan (rapace)", "p", .5), ([22], "Aigle", "p", .5), ([23], "Vautour", "p", .5),
    ([24], "Chouette ou hibou", "p", .5), ([127], "Cigogne blanche", "p", .5), ([128], "Cigogne noire", "p", .5),
    ([129], "Spatule", "p", .5), ([130], "Flamant rose", "p", .5), ([131, 132], "Héron ou aigrette", "p", .5),
    ([133], "Butor", "p", .5), ([134], "Grue cendrée", "p", .5), ([138], "Outarde", "p", .5),
    ([92], "Guêpier", "p", .5), ([10, 11], "Petit passereau protégé", "p", .6), ([25], "Salamandre", "p", .5),
    ([26, 27], "Triton", "p", .5), ([31], "Rainette", "p", .5), ([33, 34], "Tortue marine", "p", .5),
    ([394], "Esturgeon", "p", .6),
    ([445, 459, 639, 842, 655], "Tenue légère", "t", .5),
    ([351, 352, 353], "Cervidé", "g", .3), ([342, 343], "Sanglier", "g", .3), ([330, 331, 332], "Lièvre ou lapin", "g", .3),
    ([277, 278, 279, 280], "Renard", "g", .3), ([362], "Blaireau", "g", .3), ([97, 98, 99], "Canard ou oie", "g", .3),
    ([80, 81, 82, 83, 85, 86], "Gibier à plumes", "g", .3), ([0, 1, 390, 391, 395], "Poisson", "g", .3),
    ([758], "Moulinet", "g", .3), ([764, 413], "Arme", "g", .3), (list(range(151, 269)), "Chien", "g", .35),
]


def evaluate(probs: np.ndarray) -> dict:
    found = []
    for ids, label, kind, th in GROUPS:
        s = float(np.sum(probs[ids]))
        if s >= th:
            found.append({"label": label, "kind": kind, "p": round(s, 2)})
    found.sort(key=lambda f: -f["p"])
    prot = next((f for f in found if f["kind"] == "p"), None)
    ten = next((f for f in found if f["kind"] == "t"), None)
    flag, flag_label = (("espece-protegee", prot["label"]) if prot else ("tenue", ten["label"]) if ten else (None, None))
    return {"found": found[:4], "flag": flag, "flagLabel": flag_label}
