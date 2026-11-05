# Gabarits La Brique (design system, style A « Affiche de match »)

Préparation (une fois par session) : `bash tools/setup.sh` (détourage, détection des visages, Playwright).
Rendu : `python3 tools/render_ds.py fiche.json sortie.jpg` (1080 × 1350, JPEG). Les composants viennent du design system (`tools/ds/`, copie du design system publié dans Claude).
Détourage : `node tools/cutout.mjs photo.jpg joueur_detoure.png`, puis regarde le résultat. Fantôme halftone (montage Lumière) : `"fantome": "auto"` dans la fiche, ou `python3 tools/trame.py joueur_detoure.png fantome.png`.
L'ancien `tools/render.py` reste pour mémoire. Ne l'utilise plus.

## Veille de la nuit

`python3 tools/nuit.py` lit l'API publique d'ESPN (le site de la NBA bloque le conteneur) : matchs terminés, en cours et à venir avec l'heure de Bruxelles, grosses perfs classées par indice, leaders des matchs en cours avec une heure de fin estimée, Français et Belges. `--date AAAA-MM-JJ` pour une nuit précise (date américaine), `--json fichier` pour les données complètes. La feuille de match ESPN compte comme une seule source : recoupe chaque chiffre avec le résumé AP (apnews.com), NBA.com ou la presse. ESPN retire les accents : écris les noms avec leur orthographe exacte.

## Contrôles automatiques

Le rendu est refusé (fichier `_refuse.png` pour voir le problème) si : les polices ne se chargent pas, un texte fait moins de 28 px, un texte, une pastille, un tableau ou un sceau touche un visage, un visage est coupé par le bord, la brique de l'Éclat touche le visage, ou l'Éclat sert hors de son cas. Le mot héros placé derrière le joueur est le seul texte permis derrière une tête. Corrige `cadre` (position du joueur), raccourcis le surtitre, ou change de montage, puis relance.

## Code couleur

Le fond suit le verdict : SWISH sur Os (crème), REBOND sur Parquet (orange), BRIQUE sur Encre (noir). Sans verdict : Parquet pour Le Chiffre et L'Affiche, Encre pour Face à face, Classement et Échange. Ne force jamais `theme` à la main.

## Composants

| Ancien format | Composant | Champs principaux |
| --- | --- | --- |
| verdict | `PostVerdict` | verdict, montage, photo, cadre, surtitre, prenom, nom, pastilles (3 max), punchline, score, format |
| chiffre | `PostChiffre` | chiffre, montage, photo, cadre, surtitre, score, verdict (facultatif), prenom, nom, pastilles, punchline |
| affiche | `PostAffiche` | titre (deux ou trois mots géants), montage, photo, surtitre, format (LE VESTIAIRE par défaut), prenom, nom, pastilles, punchline |
| face-a-face | `PostFaceAFace` | question, haut et bas : photo ou photoPlein, cadre, cadrage, noirEtBlanc, etiquette, prenom, nom, stats |
| classement | `PostClassement` | titre, photo du numéro 1, lignes : nom, equipe, valeur, unite ; punchline |
| echange | `PostEchange` | titre, equipes (2) : nom, photo ou photoPlein, cadrage, recoit |

Champs communs : `meta` (ligne du bas à gauche, ex. « LB · VERDICT / NBA »), `signature` (à droite), `format` (pastille du bandeau : LE VERDICT, LE CHIFFRE, TRANSAT, RUMEUR À LA BARRE, FACE À FACE, LE CLASSEMENT, LES DÉCISIONS, LE VESTIAIRE, LA BRIQUE DE LA SEMAINE, RETOUR DU REBOND), `alt`. Dans les textes, `*mot*` passe le mot en accent.
`cadre` place le joueur détouré : `{x, y, l}` = gauche, haut, largeur en px dans le visuel 1080. Par défaut `{270, 470, 900}`. Garde la tête sous le bandeau (y ≥ 120) et hors du surtitre (bande y 176 à 212 à gauche).

## Les six montages (`montage`)

| Montage | Quand | Réglages utiles |
| --- | --- | --- |
| `lumiere` | perf, match, record | `fantome: "auto"` ; joueur avec halo ambre, fantôme tramé derrière |
| `grosplan` | portrait, déclaration, contrat | `grosPlan` (photo pour le fond bichromie, sinon la même) |
| `echo` | action, série, dunk | rayons et deux silhouettes décalées |
| `replay` | arbitrage, action contestée, rumeur | `etiquette`, `timecode`, `progression` (0 à 1), `cible {x, y, t}` sur la tête |
| `carte` | fiche joueur, rookie, contrat, Transat | `carte {equipe, numero, serie, bande}`, `carteCadre {x, y, l, h, angle}` ; mot héros vertical à gauche ; `bande: false` si le joueur cache la bande |
| `eclat` | verdict BRIQUE, record battu, rupture | le mot ou le chiffre imprimé sur la brique cassée ; `brique {cx, cy, l, h, angle}` ; hors BRIQUE, la fiche déclare `"rupture": "raison"` |

Rotation : jamais deux fois le même montage d'affilée (lis la colonne J du journal). Lumière, Gros plan, Écho, Replay et Carte tournent, chacun au moins une fois sur 6 posts. Éclat garde son sens : il ne sort que quand quelque chose casse.

## Exemples

Les fiches de `gabarits/ds/` montrent chaque montage avec des noms fictifs. Les posts publiés du 5 novembre 2026 (contrat en Carte, 52 points en Éclat) se refont à l'identique avec `verdict_carte.json` et `chiffre_eclat.json` et la photo détourée de Wembanyama.
