# Gabarits La Brique

Préparation (une fois par session) : `bash tools/setup.sh` (détourage et détection des visages).
Rendu : `python3 tools/render.py fiche.json sortie.jpg` (1080 × 1350, JPEG). Le script s'arrête si les polices ne se chargent pas, liste les textes sous 28 px, et vérifie les visages : il déplace la photo automatiquement pour qu'aucun texte ne touche un visage et qu'aucun visage ne soit coupé. S'il n'y arrive pas, il refuse le rendu (fichier `_refuse.png` pour voir le problème) : change alors photo_pos, la photo ou le format. Le mot géant du verdict, placé derrière un joueur détouré, est le seul texte autorisé derrière une tête.
Détourage (option) : `node tools/cutout.mjs photo.jpg photo_detouree.png`.
Dans tous les textes, `*mot*` passe le mot en orange. Les chemins de photos sont relatifs à la fiche.

| Format | Usage | Champs |
| --- | --- | --- |
| `verdict` | SWISH, REBOND, BRIQUE sur une perf, un match, une décision | verdict, photo, photo_mode (`detour` ou `plein`), photo_pos, surtitre, nom, pastilles (3 max), punchline |
| `affiche` | Surtitre et deux mots géants (« SON ÉQUIPE », « IL VEUT PARTIR », « MVP QUI ? »), question nostalgique | surtitre, titre, photo, photo_pos, nom, pastilles, punchline |
| `chiffre` | Un nombre qui raconte tout | chiffre, surtitre, photo, photo_pos, nom, pastilles, punchline |
| `face-a-face` | Deux joueurs ou deux époques comparés | question, haut et bas : photo, photo_pos, noir_et_blanc, etiquette, nom, stats |
| `classement` | Top 5 d'une stat | titre, photo du numéro 1, lignes : nom, equipe, valeur, unite, punchline |
| `echange` | Proposition d'échange | titre, equipes (2) : nom, photo, photo_pos, recoit |

Pastilles de format conseillées : LE VERDICT, LE CHIFFRE, TRANSAT, RUMEUR À LA BARRE, FACE À FACE, LE CLASSEMENT, LES DÉCISIONS, LE VESTIAIRE, LA BRIQUE DE LA SEMAINE, RETOUR DU REBOND.
Les fiches du dossier `exemples/` utilisent des noms fictifs.
