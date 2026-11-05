#!/usr/bin/env python3
"""La Brique : rendu d'un visuel avec le design system (style A, « Affiche de match »).

Usage : python3 tools/render_ds.py fiche.json sortie.jpg

La fiche choisit un composant du design system (tools/ds/bundle.js) et ses props :
  {"composant": "PostVerdict", "props": {...}, "rupture": "record en carrière"}
Composants : PostVerdict, PostChiffre, PostAffiche, PostFaceAFace, PostClassement, PostEchange.
Les chemins d'images (photo, photoPlein, fantome, grosPlan, haut.photo, equipes[0].photo...)
sont relatifs à la fiche. "fantome": "auto" fabrique le fantôme halftone depuis "photo".
Dans les textes, *mot* passe le mot en accent.

Contrôles (le rendu est refusé si l'un échoue, avec un fichier _refuse.png) :
  polices chargées ; aucun texte sous 28 px ; aucun texte, pastille, tableau ou sceau
  sur un visage (le mot héros placé derrière le joueur est permis) ; aucun visage coupé
  par le bord ; en Éclat, la brique ne touche pas le visage ; Éclat réservé à un verdict
  BRIQUE ou à une fiche qui déclare une "rupture" (record battu, rupture, fin de série).
"""
import json, sys
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
DS = TOOLS / "ds"
sys.path.insert(0, str(TOOLS))
W, H = 1080, 1350
IMAGES = (".png", ".jpg", ".jpeg", ".webp")
COMPOSANTS = {"PostVerdict", "PostChiffre", "PostAffiche", "PostFaceAFace", "PostClassement", "PostEchange"}
MONTAGES = {"lumiere", "grosplan", "echo", "replay", "carte", "eclat"}


def resoudre(v, base, chemins):
    """Remplace chaque chemin d'image par une URI file:// et note les fichiers utilisés."""
    if isinstance(v, dict):
        return {k: resoudre(x, base, chemins) for k, x in v.items()}
    if isinstance(v, list):
        return [resoudre(x, base, chemins) for x in v]
    if isinstance(v, str) and v.lower().endswith(IMAGES) and not v.startswith(("http:", "https:", "data:")):
        p = (base / v).resolve()
        if not p.exists():
            sys.exit(f"Image introuvable : {p}")
        chemins.append(p)
        return p.as_uri()
    return v


def page(composant, props):
    css = (DS / "tokens.css").read_text(encoding="utf-8").replace('url("fonts/', f'url("{(DS / "fonts").as_uri()}/')
    css += (DS / "bundle.css").read_text(encoding="utf-8")
    js = lambda n: f'<script src="{(DS / n).as_uri()}"></script>'
    return f"""<!doctype html><html lang="fr" data-theme="affiche"><head><meta charset="utf-8">
<style>{css}
body{{margin:0;background:#000}}</style>
{js('lib/react.production.min.js')}{js('lib/react-dom.production.min.js')}{js('bundle.js')}
</head><body><div id="root"></div>
<script>
var L = window.LaBrique;
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(L[{json.dumps(composant)}], {json.dumps(props, ensure_ascii=False)}));
</script></body></html>"""


CONTROLES_JS = r"""
async (visages) => {
  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 400));
  const polices = [
    document.fonts.check('900 100px "Archivo Extra Condensed"'),
    document.fonts.check('800 30px Archivo'),
    document.fonts.check('italic 400 60px "Instrument Serif"')];
  const post = document.querySelector('.lb-post');
  const P = post.getBoundingClientRect();
  const issues = [], petits = [];
  // 1. tailles de texte
  const marcheur = document.createTreeWalker(post, NodeFilter.SHOW_TEXT);
  const textes = [];
  while (marcheur.nextNode()) {
    const n = marcheur.currentNode;
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (el.closest('svg') || el.closest('[aria-hidden="true"]')) continue;
    const st = getComputedStyle(el);
    if (st.visibility === 'hidden' || st.display === 'none') continue;
    if (parseFloat(st.fontSize) < 27.5) petits.push(n.textContent.trim().slice(0, 40) + ' (' + st.fontSize + ')');
    textes.push(n);
  }
  // 2. visages en coordonnées du visuel
  const boites = [];
  document.querySelectorAll('img.lb-photo').forEach(img => {
    const f = visages[decodeURIComponent(new URL(img.src).pathname)];
    if (!f || img.classList.contains('lb-fantome')) return;
    const fond = img.classList.contains('lb-photo-fond');
    const st = getComputedStyle(img);
    if (st.visibility === 'hidden' || (st.clipPath && st.clipPath !== 'none')) return;
    let r = img.getBoundingClientRect(), x = r.left, y = r.top, w = r.width, hh = r.height;
    if (st.objectFit === 'cover' && img.naturalWidth) {
      const k = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
      w = img.naturalWidth * k; hh = img.naturalHeight * k;
      const pos = st.objectPosition.split(' ').map(v => parseFloat(v) / 100);
      x = r.left + (r.width - w) * pos[0]; y = r.top + (r.height - hh) * (pos[1] == null ? 0.5 : pos[1]);
    }
    f.forEach(b => boites.push({fond, x0: x + b[0] * w - P.left, y0: y + b[1] * hh - P.top, x1: x + b[2] * w - P.left, y1: y + b[3] * hh - P.top}));
  });
  const coupe = (a, b, m) => a.x0 < b.x1 + m && a.x1 > b.x0 - m && a.y0 < b.y1 + m && a.y1 > b.y0 - m;
  boites.forEach(b => {
    if (b.fond) return;
    if (b.x0 < -4 || b.y0 < -4 || b.x1 > W + 4 || b.y1 > H + 4) issues.push('visage coupé par le bord');
  });
  // 3. textes sur un visage (le mot héros derrière le joueur est permis, pas celui imprimé sur la brique)
  textes.forEach(n => {
    const el = n.parentElement;
    const derriere = el.closest('.lb-heros') && !el.closest('.lb-moitie');
    const rg = document.createRange(); rg.selectNodeContents(n);
    Array.from(rg.getClientRects()).forEach(r => {
      const t = {x0: r.left - P.left, y0: r.top - P.top, x1: r.right - P.left, y1: r.bottom - P.top};
      boites.forEach(b => { if ((b.fond || !derriere) && coupe(t, b, 6)) issues.push('texte sur un visage : « ' + n.textContent.trim().slice(0, 30) + ' »'); });
    });
  });
  // 4. modules et sceaux sur un visage
  document.querySelectorAll('.lb-score, .lb-pastille, .lb-sceau-verdict, .lb-replay-bandeau, .lb-carte-numero').forEach(el => {
    const r = el.getBoundingClientRect();
    const t = {x0: r.left - P.left, y0: r.top - P.top, x1: r.right - P.left, y1: r.bottom - P.top};
    boites.forEach(b => { if (coupe(t, b, 4)) issues.push('module sur un visage : ' + el.className); });
  });
  // 5. Éclat : la brique (et ses éclats) ne touche pas le visage
  if (document.querySelector('.lb-moitie')) {
    const s = document.createElement('style');
    s.textContent = '*{pointer-events:none!important} .lb-moitie rect, .lb-moitie path, svg polygon{pointer-events:all!important}';
    document.head.appendChild(s);
    boites.forEach(b => {
      for (let i = 0; i <= 10; i++) for (let j = 0; j <= 10; j++) {
        const x = P.left + b.x0 + (b.x1 - b.x0) * i / 10, y = P.top + b.y0 + (b.y1 - b.y0 + 12) * j / 10;
        const e = document.elementFromPoint(x, y);
        if (e && (e.closest('.lb-moitie') || e.tagName === 'polygon')) { issues.push('la brique touche le visage'); return; }
      }
    });
    s.remove();
  }
  return {polices, petits, issues: Array.from(new Set(issues)), visages: boites.length};
}
""".replace("W + 4", str(W) + " + 4").replace("H + 4", str(H) + " + 4")


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    fiche, out = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
    d = json.loads(fiche.read_text(encoding="utf-8"))
    comp, props = d.get("composant"), dict(d.get("props") or {})
    if comp not in COMPOSANTS:
        sys.exit(f"Composant inconnu : {comp}. Choix : {', '.join(sorted(COMPOSANTS))}")
    m = props.get("montage")
    if m and m not in MONTAGES:
        sys.exit(f"Montage inconnu : {m}. Choix : {', '.join(sorted(MONTAGES))}")
    if m == "eclat" and str(props.get("verdict", "")).upper() != "BRIQUE" and not d.get("rupture"):
        sys.exit("ERREUR : Éclat est réservé à un verdict BRIQUE ou à une rupture (record battu, fin de série). Ajoute \"rupture\": \"raison\" à la fiche ou change de montage.")
    base = fiche.parent
    if props.get("fantome") == "auto":
        if not props.get("photo"):
            sys.exit("ERREUR : \"fantome\": \"auto\" demande une \"photo\" détourée.")
        from trame import trame
        f = base / (Path(props["photo"]).stem + "_fantome.png")
        trame(base / props["photo"], f)
        props["fantome"] = f.name
    chemins = []
    props = resoudre(props, base, chemins)
    if not chemins:
        sys.exit("ERREUR : aucune photo dans la fiche. Chaque post montre une photo libre du joueur.")
    visages, note = {}, []
    try:
        from faces import detect
        for p in chemins:
            if "_fantome" in p.stem:
                continue
            r = detect(p)
            visages[str(p)] = r["boites"]
            note.append(f"{p.name}: {len(r['boites'])} visage(s), {r['methode']}")
    except Exception as e:
        note.append(f"visages non vérifiés ({e})")
    html_path = out.with_suffix(".html")
    html_path.write_text(page(comp, props), encoding="utf-8")
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        b = pw.chromium.launch(args=["--allow-file-access-from-files"])
        pg = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        erreurs = []
        pg.on("pageerror", lambda e: erreurs.append(str(e)))
        pg.goto(html_path.as_uri())
        pg.wait_for_selector(".lb-post", timeout=15000)
        res = pg.evaluate(CONTROLES_JS, visages)
        probs = []
        if erreurs:
            probs.append("erreur JavaScript : " + erreurs[0])
        if not all(res["polices"]):
            probs.append("polices non chargées")
        if res["petits"]:
            probs.append("textes sous 28 px : " + " ; ".join(res["petits"][:5]))
        probs += res["issues"]
        png = out.with_suffix(".png")
        if probs:
            pg.locator(".lb-post").screenshot(path=str(out.with_name(out.stem + "_refuse.png")))
            b.close()
            sys.exit("ERREUR : " + " | ".join(probs) + ". Corrige la fiche (cadre, photo, textes) puis relance. Ne publie pas.")
        pg.locator(".lb-post").screenshot(path=str(png))
        b.close()
    from PIL import Image
    Image.open(png).convert("RGB").save(out, "JPEG", quality=92, optimize=True, progressive=True)
    png.unlink()
    html_path.unlink()
    print(json.dumps({"ok": True, "sortie": str(out), "composant": comp, "montage": m or "lumiere", "visages": "; ".join(note)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
