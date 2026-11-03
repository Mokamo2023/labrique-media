#!/usr/bin/env python3
"""La Brique : rendu d'un visuel Instagram (1080 x 1350) à partir d'une fiche JSON.

Usage : python3 tools/render.py fiche.json sortie.jpg

Formats : verdict, affiche, chiffre, face-a-face, classement, echange.
Chaque format exige au moins une photo libre du joueur concerné (sauf "classement",
qui exige la photo du numéro 1). Les chemins de photos sont relatifs à la fiche.

Dans les textes, *mot* passe le mot en orange (couleur Parquet).
"""
import html, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FONTS = ROOT / "fonts"
W, H = 1080, 1350

PARQUET, OS, ENCRE, BRIQUE, AMBRE = "#E04E22", "#F2EDE4", "#121110", "#7E200E", "#F6A04D"


def esc(t):
    t = html.escape(str(t or ""))
    return re.sub(r"\*(.+?)\*", r'<em class="hl">\1</em>', t)


def img(path, base):
    p = (base / path).resolve()
    if not p.exists():
        sys.exit(f"Photo introuvable : {p}")
    return p.as_uri()


CSS = f"""
@font-face{{font-family:Archivo;src:url({(FONTS/'archivo-latin-wdth-normal.woff2').as_uri()}) format('woff2');font-weight:100 900;font-stretch:62% 125%;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}}
@font-face{{font-family:Archivo;src:url({(FONTS/'archivo-latin-ext-wdth-normal.woff2').as_uri()}) format('woff2');font-weight:100 900;font-stretch:62% 125%;unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}}
@font-face{{font-family:'Instrument Serif';font-style:italic;src:url({(FONTS/'instrument-serif-latin-400-italic.woff2').as_uri()}) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC}}
@font-face{{font-family:'Instrument Serif';font-style:italic;src:url({(FONTS/'instrument-serif-latin-ext-400-italic.woff2').as_uri()}) format('woff2');unicode-range:U+0100-02BA,U+1E00-1E9F}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#000}}
#post{{width:{W}px;height:{H}px;position:relative;overflow:hidden;color:{OS};font-family:Archivo,sans-serif;
 background-color:{PARQUET};
 background-image:radial-gradient(ellipse 80% 55% at 95% 0%,{BRIQUE} 0%,rgba(126,32,14,0) 70%),radial-gradient(ellipse 70% 45% at 0% 60%,{AMBRE} 0%,rgba(246,160,77,0) 70%),radial-gradient(ellipse 90% 40% at 50% 105%,#1A0D08 0%,rgba(26,13,8,0) 75%)}}
#post.sombre{{background:{ENCRE};background-image:radial-gradient(ellipse 70% 50% at 100% 0%,rgba(224,78,34,.55) 0%,rgba(224,78,34,0) 70%),radial-gradient(ellipse 60% 40% at 0% 100%,rgba(246,160,77,.25) 0%,rgba(246,160,77,0) 70%)}}
.abs{{position:absolute}}
.cond{{font-weight:900;font-stretch:62%;text-transform:uppercase;line-height:.86}}
.serif{{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400}}
em.hl{{font-style:normal;color:{PARQUET}}}
.sombre em.hl,.plein em.hl{{color:{PARQUET}}}
.top{{top:48px;left:56px;right:56px;display:flex;justify-content:space-between;align-items:center;z-index:20}}
.logo{{display:flex;align-items:baseline;gap:6px}}
.logo .la{{font-size:64px;line-height:1}}
.logo .b{{font-size:64px;line-height:1}}
.pill{{border-radius:999px;padding:12px 28px;font-size:36px;font-weight:800;letter-spacing:.02em;white-space:nowrap}}
.pill.f{{background:{OS};color:{ENCRE}}}
.pill.o{{box-shadow:inset 0 0 0 3px {OS};color:{OS}}}
.pill.fmt{{background:{ENCRE};color:{OS};font-size:28px;padding:14px 28px;letter-spacing:.06em}}
.sombre .pill.fmt,.plein .pill.fmt{{background:{PARQUET}}}
.kicker{{font-size:30px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;text-align:center}}
.bottom{{left:56px;right:56px;bottom:56px;display:flex;flex-direction:column;gap:22px;z-index:15}}
.pills{{display:flex;gap:14px;flex-wrap:wrap}}
.punch{{font-size:60px;line-height:1.05}}
.photo-plein{{inset:0;width:100%;height:100%;object-fit:cover}}
.grain{{top:0;left:0;mix-blend-mode:overlay;pointer-events:none;z-index:30}}
.credit{{font-size:28px}}
"""

GRAIN = f'<svg class="abs grain" width="{W}" height="{H}" aria-hidden="true"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="{W}" height="{H}" filter="url(#g)" opacity="0.35"/></svg>'

FACE_JS = """
() => {
  const post = document.getElementById('post');
  const P = post.getBoundingClientRect();
  const pos = el => { const s = getComputedStyle(el).objectPosition.split(' '); const f = v => v && v.endsWith('%') ? parseFloat(v) / 100 : 0.5; return [f(s[0]), f(s[1])]; };
  function faces(el) {
    const boxes = JSON.parse(el.dataset.faces || '[]'); if (!boxes.length) return [];
    const R = el.getBoundingClientRect(); const nw = el.naturalWidth, nh = el.naturalHeight;
    let rw, rh, ox, oy;
    if (getComputedStyle(el).objectFit === 'cover') { const k = Math.max(R.width / nw, R.height / nh); rw = nw * k; rh = nh * k; const [px, py] = pos(el); ox = R.left + (R.width - rw) * px; oy = R.top + (R.height - rh) * py; }
    else { rw = R.width; rh = R.height; ox = R.left; oy = R.top; }
    let C = { l: Math.max(R.left, P.left), t: Math.max(R.top, P.top), r: Math.min(R.right, P.right), b: Math.min(R.bottom, P.bottom) };
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      if (getComputedStyle(a).overflow !== 'visible') { const A = a.getBoundingClientRect(); C = { l: Math.max(C.l, A.left), t: Math.max(C.t, A.top), r: Math.min(C.r, A.right), b: Math.min(C.b, A.bottom) }; }
    }
    return boxes.map(b => { const f = { l: ox + b[0] * rw, t: oy + b[1] * rh, r: ox + b[2] * rw, b: oy + b[3] * rh };
      const v = { l: Math.max(f.l, C.l), t: Math.max(f.t, C.t), r: Math.min(f.r, C.r), b: Math.min(f.b, C.b) };
      const A = (f.r - f.l) * (f.b - f.t), V = Math.max(0, v.r - v.l) * Math.max(0, v.b - v.t); return { v, vis: A ? V / A : 0 }; });
  }
  function texts() {
    const out = []; const w = document.createTreeWalker(post, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { if (!n.textContent.trim() || n.parentElement.closest('[data-behind]')) continue;
      const r = document.createRange(); r.selectNodeContents(n); for (const q of r.getClientRects()) out.push({ l: q.left - 8, t: q.top - 8, r: q.right + 8, b: q.bottom + 8, txt: n.textContent.trim().slice(0, 40) }); }
    return out;
  }
  function issues() {
    const T = texts(), out = [];
    for (const im of post.querySelectorAll('img[data-faces]')) for (const f of faces(im)) {
      if (f.vis < 0.6) out.push({ type: 'visage coupé', score: 1e5 * (1 - f.vis) });
      for (const t of T) { const ix = Math.min(t.r, f.v.r) - Math.max(t.l, f.v.l), iy = Math.min(t.b, f.v.b) - Math.max(t.t, f.v.t); if (ix > 0 && iy > 0) out.push({ type: 'texte sur un visage', txt: t.txt, score: ix * iy }); }
    }
    return out;
  }
  const total = () => issues().reduce((a, b) => a + b.score, 0);
  const changes = [];
  for (const im of post.querySelectorAll('img[data-faces]')) {
    if (!JSON.parse(im.dataset.faces).length || !issues().length) continue;
    const st = im.style, abs = getComputedStyle(im).position === 'absolute', cover = getComputedStyle(im).objectFit === 'cover';
    const orig = { op: st.objectPosition, top: st.top, h: st.height, mt: st.marginTop, w: st.width, mask: st.webkitMaskImage };
    const H0 = im.getBoundingClientRect().height, top0 = parseFloat(getComputedStyle(im).top) || 0, W0 = im.getBoundingClientRect().width;
    const cands = [];
    if (cover) {
      const [x0, y0] = pos(im).map(v => Math.round(v * 100));
      const ys = [...new Set([y0, 0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100])].sort((a, b) => Math.abs(a - y0) - Math.abs(b - y0));
      const xs = [...new Set([x0, 50, 35, 65, 20, 80, 10, 90])];
      for (const k of [0, 80, 160, 240, 320, 400, 480]) for (const x of xs) for (const y of ys) cands.push({ x, y, k, cost: k * 10 + Math.abs(x - x0) * 3 + Math.abs(y - y0) });
    } else {
      for (const d of [0, 40, 80, 120, 160, 200, 240, 280, 320, 360]) for (const sc of [1, 0.9, 0.8, 0.7]) cands.push({ d, sc, cost: d + (1 - sc) * 1000 });
    }
    cands.sort((a, b) => a.cost - b.cost);
    let best = null, bestScore = total();
    for (const c of cands) {
      if (cover) { st.objectPosition = c.x + '% ' + c.y + '%';
        if (abs) { st.top = c.k + 'px'; st.height = (H0 - c.k) + 'px'; } else { st.marginTop = c.k + 'px'; st.height = 'calc(100% - ' + c.k + 'px)'; }
        st.webkitMaskImage = c.k ? 'linear-gradient(180deg,transparent 0,#000 140px)' : orig.mask; }
      else { st.top = (top0 + c.d) + 'px'; st.width = (W0 * c.sc) + 'px'; }
      const sc = total();
      if (sc < bestScore) { bestScore = sc; best = c; }
      if (sc === 0) break;
    }
    if (best) {
      const c = best;
      if (cover) { st.objectPosition = c.x + '% ' + c.y + '%'; if (abs) { st.top = c.k + 'px'; st.height = (H0 - c.k) + 'px'; } else { st.marginTop = c.k + 'px'; st.height = 'calc(100% - ' + c.k + 'px)'; } st.webkitMaskImage = c.k ? 'linear-gradient(180deg,transparent 0,#000 140px)' : orig.mask; }
      else { st.top = (top0 + c.d) + 'px'; st.width = (W0 * c.sc) + 'px'; }
      changes.push(c);
    } else { Object.assign(st, { objectPosition: orig.op, top: orig.top, height: orig.h, marginTop: orig.mt, width: orig.w, webkitMaskImage: orig.mask }); }
  }
  return { changes, issues: issues().map(i => i.type + (i.txt ? ' : ' + i.txt : '')) };
}
"""

FIT_JS = """
async () => {
  await document.fonts.ready;
  for (const el of document.querySelectorAll('[data-fit]')) {
    const maxH = parseFloat(el.dataset.fit) || 1e9;
    let s = parseFloat(getComputedStyle(el).fontSize);
    const min = parseFloat(el.dataset.min || 28);
    while (s > min && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > maxH)) {
      s -= 2; el.style.fontSize = s + 'px';
    }
  }
  const small = [...document.querySelectorAll('#post *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 28).map(e => e.textContent.trim().slice(0, 30));
  return {
    fonts: [document.fonts.check('900 64px Archivo'), document.fonts.check('italic 64px "Instrument Serif"')],
    small
  };
}
"""


def top(pastille):
    return f'<div class="abs top"><div class="logo"><span class="la serif">la</span><span class="b cond">BRIQUE</span></div><span class="pill fmt">{esc(pastille)}</span></div>'


def bottom(d):
    pills = "".join(f'<span class="pill {"f" if i == 0 else "o"}">{esc(p)}</span>' for i, p in enumerate(d.get("pastilles", [])[:3]))
    out = '<div class="abs bottom">'
    if d.get("nom"):
        out += f'<span class="cond" data-fit="220" style="font-size:122px;white-space:nowrap;overflow:hidden">{esc(d["nom"])}</span>'
    if pills:
        out += f'<div class="pills">{pills}</div>'
    if d.get("punchline"):
        out += f'<span class="serif punch" data-fit="140" data-min="44">{esc(d["punchline"])}</span>'
    return out + "</div>"


def photo_layer(d, base, top_shade=True):
    mode = d.get("photo_mode", "plein")
    src = img(d["photo"], base)
    pos = d.get("photo_pos", "center 25%")
    if mode == "detour":
        return f'<img class="abs" src="{src}" style="top:{d.get("photo_top", 200)}px;left:50%;transform:translateX(-50%);width:{d.get("photo_largeur", 880)}px;height:auto;z-index:5">' \
               '<div class="abs" style="top:800px;left:0;width:1080px;height:550px;z-index:6;background:linear-gradient(180deg,rgba(20,12,9,0) 0%,rgba(20,12,9,.78) 45%,rgba(20,12,9,.94) 100%)"></div>'
    shade_top = 'linear-gradient(180deg,rgba(18,17,16,.88) 0%,rgba(18,17,16,.35) 30%,rgba(18,17,16,0) 45%),' if top_shade else ''
    return f'<img class="abs photo-plein" src="{src}" style="object-position:{pos};filter:contrast(1.06) saturate(.92)">' \
           f'<div class="abs" style="inset:0;z-index:6;background:{shade_top}linear-gradient(180deg,rgba(18,17,16,0) 52%,rgba(18,17,16,.82) 72%,rgba(18,17,16,.96) 100%),radial-gradient(ellipse 80% 50% at 100% 0%,rgba(224,78,34,.45) 0%,rgba(224,78,34,0) 70%)"></div>'


def verdict(d, base):
    v = d.get("verdict", "SWISH").upper()
    color = {"SWISH": OS, "REBOND": "#FFD08A", "BRIQUE": OS}.get(v, OS)
    mode = d.get("photo_mode", "detour")
    body = ""
    if d.get("surtitre"):
        body += f'<div class="abs kicker" style="top:150px;left:56px;right:56px;z-index:12">{esc(d["surtitre"])}</div>'
    if mode == "detour":
        body += f'<span class="abs cond" data-behind="1" data-fit="380" style="top:290px;left:0;width:1080px;text-align:center;font-size:430px;line-height:.82;letter-spacing:-.01em;color:{color};z-index:2;white-space:nowrap;overflow:hidden">{v}</span>'
        body += photo_layer(d, base)
    else:
        body += photo_layer(d, base)
        body += f'<span class="abs cond" data-fit="300" style="top:200px;left:0;width:1080px;text-align:center;font-size:330px;line-height:.82;color:{color};z-index:8;text-shadow:0 8px 40px rgba(0,0,0,.35);white-space:nowrap;overflow:hidden">{v}</span>'
    return body + bottom(d), ""


def affiche(d, base):
    body = photo_layer(d, base)
    body += '<div class="abs" style="top:150px;left:56px;right:56px;z-index:12;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">'
    if d.get("surtitre"):
        body += f'<div class="kicker">{esc(d["surtitre"])}</div>'
    body += f'<div class="cond" data-fit="420" style="font-size:250px;width:968px;line-height:.84">{esc(d.get("titre", ""))}</div></div>'
    return body + bottom(d), "plein"


def chiffre(d, base):
    body = photo_layer(d, base, top_shade=False)
    body += '<div class="abs" style="inset:0;z-index:7;background:linear-gradient(90deg,rgba(18,17,16,.82) 0%,rgba(18,17,16,.35) 55%,rgba(18,17,16,0) 75%)"></div>'
    body += f'<div class="abs cond" style="top:150px;left:40px;z-index:12;font-size:560px;line-height:.8;background:linear-gradient(180deg,{AMBRE} 0%,{PARQUET} 70%,{BRIQUE} 100%);-webkit-background-clip:text;background-clip:text;color:transparent">{esc(d.get("chiffre", ""))}</div>'
    if d.get("surtitre"):
        body += f'<div class="abs kicker" style="top:150px;right:56px;left:auto;text-align:right;z-index:12;max-width:420px">{esc(d["surtitre"])}</div>'
    return body + bottom(d), "plein"


def face_a_face(d, base):
    body = ""
    for i, side in enumerate([d["haut"], d["bas"]]):
        y = 0 if i == 0 else 675
        src = img(side["photo"], base)
        body += f'<div class="abs" style="top:{y}px;left:0;width:1080px;height:675px;overflow:hidden;background:{ENCRE}">'
        body += f'<img src="{src}" style="width:100%;height:100%;object-fit:cover;object-position:{side.get("photo_pos", "center 25%")};filter:{"grayscale(1) contrast(1.1)" if side.get("noir_et_blanc") else "contrast(1.05)"}">'
        body += '<div class="abs" style="inset:0;background:linear-gradient(180deg,rgba(18,17,16,0) 35%,rgba(18,17,16,.9) 100%)"></div>'
        stats = "".join(f'<span class="pill {"f" if j == 0 else "o"}">{esc(s)}</span>' for j, s in enumerate(side.get("stats", [])[:3]))
        body += f'<div class="abs" style="left:56px;right:56px;bottom:{40 if i else 70}px;display:flex;flex-direction:column;gap:12px;z-index:10">'
        body += f'<span class="kicker" style="text-align:left">{esc(side.get("etiquette", ""))}</span>'
        body += f'<span class="cond" data-fit="120" style="font-size:110px;white-space:nowrap">{esc(side["nom"])}</span>'
        if stats:
            body += f'<div class="pills">{stats}</div>'
        body += "</div></div>"
    body += f'<div class="abs cond" style="top:615px;left:50%;transform:translateX(-50%);width:120px;height:120px;border-radius:50%;background:{PARQUET};display:flex;align-items:center;justify-content:center;font-size:64px;z-index:15;box-shadow:0 0 0 8px {ENCRE}">VS</div>'
    if d.get("question"):
        body += f'<div class="abs serif" style="top:140px;left:56px;right:56px;font-size:56px;z-index:12;text-shadow:0 4px 24px rgba(0,0,0,.6)">{esc(d["question"])}</div>'
    return body, "plein"


def classement(d, base):
    body = ""
    if d.get("photo"):
        src = img(d["photo"], base)
        body += f'<img class="abs" src="{src}" style="top:0;right:0;width:560px;height:1350px;object-fit:cover;object-position:{d.get("photo_pos", "center 20%")}">'
        body += '<div class="abs" style="top:0;right:0;width:560px;height:1350px;background:linear-gradient(90deg,#121110 0%,rgba(18,17,16,.55) 35%,rgba(18,17,16,0) 70%)"></div>'
    body += f'<div class="abs cond" data-fit="300" style="top:150px;left:56px;width:700px;font-size:120px;z-index:12">{esc(d.get("titre", ""))}</div>'
    rows = ""
    for i, r in enumerate(d.get("lignes", [])[:5]):
        bg = PARQUET if i == 0 else "rgba(242,237,228,.08)"
        rows += f'<div style="display:flex;align-items:center;gap:22px;background:{bg};padding:18px 26px;border-radius:18px">' \
                f'<span class="cond" style="font-size:64px;width:44px">{i + 1}</span>' \
                f'<div style="display:flex;flex-direction:column;flex:1;min-width:0"><span class="cond" data-fit="60" style="font-size:58px;white-space:nowrap;overflow:hidden">{esc(r["nom"])}</span><span style="font-size:28px;font-weight:700;opacity:.8">{esc(r.get("equipe", ""))}</span></div>' \
                f'<span class="cond" style="font-size:72px">{esc(r["valeur"])}</span><span style="font-size:28px;font-weight:800">{esc(r.get("unite", ""))}</span></div>'
    body += f'<div class="abs" style="top:470px;left:56px;width:640px;display:flex;flex-direction:column;gap:14px;z-index:12">{rows}</div>'
    if d.get("punchline"):
        body += f'<div class="abs serif punch" data-fit="140" data-min="44" style="left:56px;width:700px;bottom:56px;z-index:12">{esc(d["punchline"])}</div>'
    return body, "sombre"


def echange(d, base):
    body = ""
    eq = d["equipes"][:2]
    for i, e in enumerate(eq):
        x = 0 if i == 0 else 540
        src = img(e["photo"], base)
        body += f'<div class="abs" style="top:0;left:{x}px;width:540px;height:1350px;overflow:hidden;background:{ENCRE}">'
        body += f'<img src="{src}" style="width:100%;height:100%;object-fit:cover;object-position:{e.get("photo_pos", "center 20%")}">'
        body += '<div class="abs" style="inset:0;background:linear-gradient(180deg,rgba(18,17,16,.85) 0%,rgba(18,17,16,.1) 30%,rgba(18,17,16,.2) 50%,rgba(18,17,16,.95) 78%)"></div>'
        items = "".join(f'<span style="font-size:36px;font-weight:800;line-height:1.15">{esc(x_)}</span>' for x_ in e.get("recoit", []))
        body += f'<div class="abs" style="left:40px;right:30px;bottom:56px;display:flex;flex-direction:column;gap:8px;z-index:10"><span class="cond" data-fit="100" style="font-size:84px;white-space:nowrap">{esc(e["nom"])}</span><span class="cond" style="font-size:48px;color:{PARQUET}">REÇOIT :</span>{items}</div></div>'
    body += f'<div class="abs" style="top:420px;left:538px;width:4px;height:930px;background:{PARQUET};z-index:9"></div>'
    body += f'<div class="abs cond" data-fit="200" style="top:150px;left:56px;right:56px;text-align:center;font-size:150px;z-index:12">{esc(d.get("titre", "PROPOSITION D’ÉCHANGE"))}</div>'
    return body, "plein"


FORMATS = {"verdict": verdict, "affiche": affiche, "chiffre": chiffre, "face-a-face": face_a_face, "classement": classement, "echange": echange}


def build(d, base):
    fn = FORMATS[d["format"]]
    body, cls = fn(d, base)
    if d.get("format") == "verdict" and d.get("photo_mode", "detour") != "detour":
        cls = "plein"
    return f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>{CSS}</style></head><body><div id="post" class="{cls}">{top(d.get("pastille", "LE VERDICT"))}{body}{GRAIN}</div></body></html>'


def annotate_faces(page_html):
    try:
        from faces import detect
    except Exception as e:
        return page_html, f"visages non vérifiés ({e})"
    from urllib.parse import unquote, urlparse
    notes = []
    def repl(m):
        uri = m.group(1)
        path = Path(unquote(urlparse(uri).path))
        r = detect(path)
        notes.append(f"{path.name}: {len(r['boites'])} visage(s), {r['methode']}")
        return f'src="{uri}" data-faces=\'{json.dumps(r["boites"])}\''
    page_html = re.sub(r'src="(file://[^"]+)"', repl, page_html)
    return page_html, "; ".join(notes)


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    fiche, out = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
    d = json.loads(fiche.read_text(encoding="utf-8"))
    if d["format"] not in FORMATS:
        sys.exit(f"Format inconnu : {d['format']}")
    html_path = out.with_suffix(".html")
    page, face_note = annotate_faces(build(d, fiche.parent))
    html_path.write_text(page, encoding="utf-8")
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        pg.goto(html_path.as_uri())
        res = pg.evaluate(FIT_JS)
        if not all(res["fonts"]):
            b.close()
            sys.exit("ERREUR : les polices ne se chargent pas. Ne publie pas.")
        fx = pg.evaluate(FACE_JS)
        if fx["issues"]:
            pg.locator("#post").screenshot(path=str(out.with_name(out.stem + "_refuse.png")))
            b.close()
            sys.exit("ERREUR : " + " | ".join(sorted(set(fx["issues"]))) + ". Change photo_pos, la photo ou le format.")
        png = out.with_suffix(".png")
        pg.locator("#post").screenshot(path=str(png))
        b.close()
    from PIL import Image
    Image.open(png).convert("RGB").save(out, "JPEG", quality=93)
    png.unlink()
    print(json.dumps({"ok": True, "sortie": str(out), "textes_sous_28px": res["small"], "visages": face_note, "ajustements_photo": fx["changes"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
