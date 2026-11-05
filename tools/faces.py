#!/usr/bin/env python3
"""Repère les visages d'une photo pour que render.py n'y pose jamais de texte.

Retourne des boîtes normalisées [x0, y0, x1, y1] (0 à 1), élargies pour couvrir
les cheveux et le menton. Méthode : détecteurs OpenCV (face et profil), filtrés
par la silhouette du joueur ; à défaut, la tête est estimée en haut de la silhouette.
"""
import json, subprocess, sys
from pathlib import Path

import cv2
import numpy as np

TOOLS = Path(__file__).resolve().parent
CASCADES = ["haarcascade_frontalface_default.xml", "haarcascade_frontalface_alt2.xml", "haarcascade_profileface.xml"]


def person_mask(path: Path):
    """Masque de la silhouette (alpha d'une photo détourée, sinon détourage local en cache)."""
    img = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
    if img is not None and img.ndim == 3 and img.shape[2] == 4:
        return img[:, :, 3] > 128
    cache = path.with_name(path.stem + ".masque.png")
    if not cache.exists():
        try:
            subprocess.run(["node", str(TOOLS / "cutout.mjs"), str(path), str(cache)], check=True, capture_output=True, timeout=300)
        except Exception:
            return None
    m = cv2.imread(str(cache), cv2.IMREAD_UNCHANGED)
    if m is None or m.ndim != 3 or m.shape[2] != 4:
        return None
    return m[:, :, 3] > 128


def detect(path: Path):
    img = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
    if img is None:
        raise SystemExit(f"Photo illisible : {path}")
    if img.ndim == 3 and img.shape[2] == 4:
        a = img[:, :, 3:4] / 255.0
        img = (img[:, :, :3] * a + 128 * (1 - a)).astype(np.uint8)
    h, w = img.shape[:2]
    gray = cv2.equalizeHist(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
    mask = person_mask(path)
    if mask is not None and mask.shape != (h, w):
        mask = cv2.resize(mask.astype(np.uint8), (w, h), interpolation=cv2.INTER_NEAREST) > 0
    minside = int(0.06 * min(w, h))
    raw = []
    for name in CASCADES:
        try:
            local = TOOLS / "cascades" / name
            c = cv2.CascadeClassifier(str(local) if local.exists() else cv2.data.haarcascades + name)
        except Exception:
            continue
        if c.empty():
            continue  # OpenCV 5 sans cascades : repli sur la silhouette
        for flip in (False, True) if "profile" in name else (False,):
            g = cv2.flip(gray, 1) if flip else gray
            for (x, y, bw, bh) in c.detectMultiScale(g, 1.08, 6, minSize=(minside, minside)):
                if flip:
                    x = w - x - bw
                raw.append((x, y, bw, bh))
    faces = []
    for (x, y, bw, bh) in raw:
        cx, cy = x + bw // 2, y + bh // 2
        if mask is not None:
            if not mask[min(cy, h - 1), min(cx, w - 1)]:
                continue
            ys, _ = np.nonzero(mask)
            top, bottom = ys.min(), ys.max()
            if cy > top + 0.45 * (bottom - top):
                continue
        faces.append((x, y, bw, bh))
    # fusion des doublons
    merged = []
    for f in sorted(faces, key=lambda r: -r[2] * r[3]):
        x, y, bw, bh = f
        if any(abs((x + bw / 2) - (m[0] + m[2] / 2)) < m[2] * 0.6 and abs((y + bh / 2) - (m[1] + m[3] / 2)) < m[3] * 0.6 for m in merged):
            continue
        merged.append(f)
    method = "détecteur"
    if not merged and mask is not None:
        # tête estimée : haut de chaque silhouette importante
        n, lab, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8))
        for i in range(1, n):
            x, y, bw, bh, area = stats[i]
            if area < 0.03 * w * h:
                continue
            head_h = int(0.2 * bh)
            cols = np.nonzero((lab[y:y + head_h, :] == i).any(axis=0))[0]
            if len(cols):
                merged.append((int(cols.min()), int(y), int(cols.max() - cols.min()), head_h))
        method = "silhouette"
    boxes = []
    for (x, y, bw, bh) in merged:
        x0, x1 = x - 0.25 * bw, x + bw * 1.25
        y0, y1 = y - 0.5 * bh, y + bh * 1.2
        boxes.append([round(max(0, x0) / w, 4), round(max(0, y0) / h, 4), round(min(w, x1) / w, 4), round(min(h, y1) / h, 4)])
    if not boxes:
        method = "aucun"
    return {"boites": boxes, "methode": method}


if __name__ == "__main__":
    print(json.dumps(detect(Path(sys.argv[1]).resolve()), ensure_ascii=False))
