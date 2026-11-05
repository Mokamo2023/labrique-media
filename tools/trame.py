#!/usr/bin/env python3
"""Fantôme halftone d'un joueur détouré, pour le montage Lumière.

Usage : python3 tools/trame.py joueur_detoure.png fantome.png

Recette du design system : cellule de 8 px, un point Encre par cellule,
rayon = (1 − luminosité)^0,8 × 0,62 × cellule, rendu à 2× sur fond transparent.
"""
import sys
from PIL import Image, ImageDraw
import numpy as np


def trame(src, out, cell=8, echelle=2):
    im = Image.open(src).convert("RGBA")
    g = np.asarray(im.convert("L"), dtype=float) / 255.0
    a = np.asarray(im.split()[-1], dtype=float) / 255.0
    h, w = g.shape
    res = Image.new("RGBA", (w * echelle, h * echelle), (0, 0, 0, 0))
    d = ImageDraw.Draw(res)
    for y in range(0, h, cell):
        for x in range(0, w, cell):
            if a[y:y + cell, x:x + cell].mean() < 0.5:
                continue
            r = ((1 - g[y:y + cell, x:x + cell].mean()) ** 0.8) * 0.62 * cell * echelle
            if r < 0.6:
                continue
            cx, cy = (x + cell / 2) * echelle, (y + cell / 2) * echelle
            d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(18, 17, 16, 255))
    res.save(out)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    trame(sys.argv[1], sys.argv[2])
    print("ok", sys.argv[2])
