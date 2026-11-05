/* @ds-bundle: {"format":4,"namespace":"LaBrique","components":[{"name":"Post"},{"name":"Logo"},{"name":"IconeBrique"},{"name":"Sceau"},{"name":"SceauVerdict"},{"name":"Pastille"},{"name":"Surtitre"},{"name":"NomJoueur"},{"name":"Punchline"},{"name":"MotHeros"},{"name":"TableauScore"},{"name":"TagVertical"},{"name":"Reperes"},{"name":"Grain"},{"name":"Bandeau"},{"name":"BlocBas"},{"name":"Montage"},{"name":"PostVerdict"},{"name":"PostChiffre"},{"name":"PostAffiche"},{"name":"PostFaceAFace"},{"name":"PostClassement"},{"name":"PostEchange"},{"name":"StoryUne"}]} */
(function () {
  var R = window.React;
  var h = R.createElement;
  var F = R.Fragment;
  var W = 1080;

  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function px(n) { return typeof n === 'number' ? n + 'px' : n; }

  /* « *mot* » passe le mot en accent */
  function accent(t) {
    if (typeof t !== 'string') return t;
    var parts = t.split(/\*(.+?)\*/g);
    if (parts.length === 1) return t;
    return parts.map(function (p, i) { return i % 2 ? h('span', { key: i, className: 'lb-accent' }, p) : p; });
  }

  /* Réduit la taille de police jusqu'à ce que le texte tienne dans sa boîte */
  function useFit(ref, min, start, deps) {
    R.useLayoutEffect(function () {
      var el = ref.current; if (!el) return;
      function fit() {
        var s = start;
        el.style.fontSize = s + 'px';
        var guard = 0;
        while (s > min && el.scrollWidth > el.clientWidth + 1 && guard < 200) { s -= 2; el.style.fontSize = s + 'px'; guard++; }
      }
      fit();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    }, deps || []);
  }

  var COUTURES = 'M105 3 L105 97 M3 50 L207 50 M58 3 C 80 30, 80 70, 58 97 M152 3 C 130 30, 130 70, 152 97';
  var ANNEAU = 'M200,200 m-166,0 a166,166 0 1,1 332,0 a166,166 0 1,1 -332,0';
  var uid = 0;
  function useId(prefix) { var r = R.useRef(null); if (r.current === null) { uid += 1; r.current = prefix + uid; } return r.current; }

  /* ---------- Cadre du visuel ---------- */
  function Post(p) {
    var theme = p.theme || 'affiche';
    var hauteur = p.hauteur || 1350;
    var e = p.echelle || 1;
    var inner = h('div', {
      className: cx('lb-post', 'lb-fond-' + theme, p.className),
      'data-theme': theme,
      style: Object.assign({ height: hauteur + 'px' }, e !== 1 ? { transform: 'scale(' + e + ')' } : null, p.style)
    },
      h('svg', { width: 0, height: 0, style: { position: 'absolute' }, 'aria-hidden': true },
        h('filter', { id: 'lb-bichromie', colorInterpolationFilters: 'sRGB' },
          h('feColorMatrix', { type: 'matrix', values: '.33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0' }),
          h('feComponentTransfer', null,
            h('feFuncR', { type: 'table', tableValues: '0.07 0.49 0.88 0.97' }),
            h('feFuncG', { type: 'table', tableValues: '0.067 0.125 0.31 0.66' }),
            h('feFuncB', { type: 'table', tableValues: '0.063 0.055 0.13 0.34' }))),
        h('filter', { id: 'lb-bichromie-claire', colorInterpolationFilters: 'sRGB' },
          h('feColorMatrix', { type: 'matrix', values: '.33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0' }),
          h('feComponentTransfer', null,
            h('feFuncR', { type: 'table', tableValues: '0.494 0.878 0.965 0.949' }),
            h('feFuncG', { type: 'table', tableValues: '0.125 0.306 0.627 0.929' }),
            h('feFuncB', { type: 'table', tableValues: '0.055 0.133 0.302 0.894' })))),
      p.motif !== false && theme !== 'os' ? h(Motif, null) : null,
      p.children,
      p.reperes !== false ? h(Reperes, { hauteur: hauteur }) : null,
      p.grain !== false ? h(Grain, { hauteur: hauteur }) : null);
    if (e === 1) return inner;
    return h('div', { className: 'lb-echelle', style: { width: W * e + 'px', height: hauteur * e + 'px' } }, inner);
  }

  function Motif() {
    return h('svg', { className: 'lb-abs', style: { left: '-260px', bottom: '120px', opacity: 'var(--opacite-motif)', zIndex: 1 }, width: 1300, height: 620, viewBox: '0 0 210 100', 'aria-hidden': true },
      h('rect', { x: 3, y: 3, width: 204, height: 94, rx: 10, fill: 'none', stroke: 'var(--os)', strokeWidth: 3 }),
      h('path', { d: COUTURES, fill: 'none', stroke: 'var(--os)', strokeWidth: 3 }));
  }

  /* ---------- Identité ---------- */
  function Logo(p) {
    var t = p.taille || 64;
    var style = Object.assign({ color: p.couleur || 'inherit' }, p.style);
    if (p.variante === 'empile') {
      return h('span', { className: cx('lb-logo', 'lb-logo-empile', p.className), style: style },
        h('span', { className: 'lb-serif', style: { fontSize: t * 230 / 380 + 'px', lineHeight: .7, marginLeft: t * 8 / 380 + 'px', position: 'relative', zIndex: 1 } }, 'la'),
        h('span', { className: 'lb-cond', style: { fontSize: t + 'px', lineHeight: .82, letterSpacing: '-.015em' } }, 'BRIQUE'));
    }
    return h('span', { className: cx('lb-logo', p.className), style: Object.assign({ gap: t * 6 / 64 + 'px' }, style) },
      h('span', { className: 'lb-serif', style: { fontSize: t + 'px', lineHeight: 1 } }, 'la'),
      h('span', { className: 'lb-cond', style: { fontSize: t + 'px', lineHeight: 1 } }, 'BRIQUE'));
  }

  function IconeBrique(p) {
    var l = p.largeur || 210;
    var c = p.couleur || 'currentColor';
    var e = p.epaisseur || 7;
    return h('svg', { width: l, height: l * 100 / 210, viewBox: '0 0 210 100', role: 'img', 'aria-label': 'Icône brique-ballon', className: p.className, style: p.style },
      h('rect', { x: 3, y: 3, width: 204, height: 94, rx: 10, fill: 'none', stroke: c, strokeWidth: e }),
      h('path', { d: COUTURES, fill: 'none', stroke: c, strokeWidth: e }));
  }

  var SCEAUX = {
    os: { fond: 'var(--os)', anneau: 'var(--encre)', anneauE: 4, texte: 'var(--encre)', icone: 'var(--parquet)' },
    encre: { fond: 'var(--encre)', anneau: 'var(--os)', anneauE: 3, texte: 'var(--os)', icone: 'var(--parquet)' },
    orange: { fond: 'var(--parquet)', anneau: 'var(--encre)', anneauE: 5, texte: 'var(--encre)', icone: 'var(--encre)' }
  };

  function Sceau(p) {
    var v = SCEAUX[p.variante] || SCEAUX.os;
    var t = p.taille || 400;
    var id = useId('lb-anneau-');
    return h('svg', { width: t, height: t, viewBox: '0 0 400 400', role: 'img', 'aria-label': 'Sceau La Brique', className: p.className, style: p.style },
      h('circle', { cx: 200, cy: 200, r: 198, fill: v.fond }),
      h('circle', { cx: 200, cy: 200, r: 136, fill: 'none', stroke: v.anneau, strokeWidth: v.anneauE }),
      h('path', { id: id, d: ANNEAU, fill: 'none' }),
      h('text', { fill: v.texte, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 30, letterSpacing: 4 },
        h('textPath', { href: '#' + id, textLength: 1035, lengthAdjust: 'spacing' }, p.texte || 'ÇA RENTRE OU ÇA BRIQUE · LA BRIQUE ·')),
      h('g', { transform: 'translate(116,158) scale(0.8)' },
        h('rect', { x: 3, y: 3, width: 204, height: 94, rx: 10, fill: 'none', stroke: v.icone, strokeWidth: 10 }),
        h('path', { d: COUTURES, fill: 'none', stroke: v.icone, strokeWidth: 10 })));
  }

  /* Code couleur : chaque verdict a son thème. SWISH sur Os, REBOND sur Parquet, BRIQUE sur Encre. */
  var VERDICTS = {
    SWISH: { theme: 'os', fond: 'var(--os)', texte: 'var(--encre)', anneau: 'var(--encre)', heros: 'var(--encre)' },
    REBOND: { theme: 'affiche', fond: 'var(--encre)', texte: 'var(--parquet)', anneau: 'var(--parquet)', heros: 'var(--rebond)' },
    BRIQUE: { theme: 'sombre', fond: 'var(--encre)', texte: 'var(--os)', anneau: 'var(--os)', heros: 'var(--parquet)' }
  };
  function themeVerdict(p) { if (p.theme) return p.theme; var v = p.verdict && VERDICTS[String(p.verdict).toUpperCase()]; return v ? v.theme : 'affiche'; }

  function SceauVerdict(p) {
    var nom = (p.verdict || 'SWISH').toUpperCase();
    var v = VERDICTS[nom] || VERDICTS.SWISH;
    var t = p.taille || 260;
    var id = useId('lb-verdict-');
    var svg = h('svg', { width: t, height: t, viewBox: '0 0 400 400', role: 'img', 'aria-label': 'Verdict ' + nom, style: { overflow: 'visible' } },
      h('circle', { cx: 200, cy: 200, r: 198, fill: v.fond, stroke: 'var(--contour)', strokeWidth: 8 }),
      h('circle', { cx: 200, cy: 200, r: 138, fill: 'none', stroke: v.anneau, strokeWidth: 5 }),
      h('path', { id: id, d: ANNEAU, fill: 'none' }),
      h('text', { fill: v.texte, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 30, letterSpacing: 5 },
        h('textPath', { href: '#' + id, textLength: 1035, lengthAdjust: 'spacing' }, 'VERDICT · LA BRIQUE · VERDICT · LA BRIQUE ·')),
      h('text', { x: 200, y: 238, textAnchor: 'middle', fill: v.texte, fontFamily: '"Archivo Extra Condensed", Archivo, sans-serif', fontWeight: 900, fontSize: nom.length > 5 ? 100 : 116 }, nom));
    if (p.libre) return h('span', { style: { display: 'inline-block', transform: 'rotate(' + (p.rotation == null ? -14 : p.rotation) + 'deg)', filter: 'drop-shadow(var(--ombre-sceau))' } }, svg);
    return h('div', { className: 'lb-sceau-verdict', style: Object.assign({ transform: 'rotate(' + (p.rotation == null ? -14 : p.rotation) + 'deg)', zIndex: 24 }, p.style) }, svg);
  }

  /* ---------- Éléments typographiques ---------- */
  function Pastille(p) {
    return h('span', { className: cx('lb-pastille', 'lb-pastille-' + (p.variante || 'pleine'), p.className), style: p.style }, p.children);
  }

  function Surtitre(p) {
    return h('div', { className: cx('lb-surtitre', p.className), style: p.style },
      p.filet !== false ? h('i', { className: 'lb-surtitre-filet' }) : null,
      h('span', null, accent(p.children)));
  }

  function NomJoueur(p) {
    var ref = R.useRef(null);
    var t = p.taille || 118;
    useFit(ref, p.min || 64, t, [p.prenom, p.nom, t]);
    return h('span', { ref: ref, className: cx('lb-nom', p.className), style: Object.assign({ fontSize: t + 'px' }, p.style) },
      p.prenom ? h('span', { className: 'lb-nom-prenom', style: { fontSize: '0.95em' } }, p.prenom) : null,
      h('span', { className: cx('lb-nom-famille', p.accent !== false && p.prenom ? 'lb-accent' : null) }, p.nom));
  }

  function Punchline(p) {
    return h('span', { className: cx('lb-punchline', p.className), style: p.style }, accent(p.children));
  }

  function relief(t) {
    var d = Math.max(8, Math.round(t * 0.028));
    var s = [];
    for (var i = 1; i <= d; i++) s.push(i + 'px ' + i + 'px 0 var(--relief)');
    s.push((d + 1) + 'px ' + (d + 1) + 'px 0 var(--encre)');
    s.push((d + 3) + 'px ' + (d + 5) + 'px 30px rgba(18,17,16,.45)');
    return s.join(',');
  }

  function MotHeros(p) {
    var t = p.taille || 760;
    var ref = R.useRef(null), eref = R.useRef(null);
    R.useLayoutEffect(function () {
      if (!p.ajuster) return;
      var el = ref.current; if (!el) return;
      function fit() {
        var s = t, g = 0;
        el.style.fontSize = s + 'px';
        var trop = function () { return p.vertical ? el.scrollHeight > el.clientHeight + 1 : el.scrollWidth > el.clientWidth + 1; };
        while (s > (p.min || 120) && trop() && g < 300) { s -= 4; el.style.fontSize = s + 'px'; g++; }
        if (eref.current) eref.current.style.fontSize = s + 'px';
      }
      fit();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    }, [p.texte, t, p.ajuster]);
    var base = Object.assign({ fontSize: t + 'px', lineHeight: p.interligne || 0.8, letterSpacing: p.approche || '-0.02em', textAlign: p.align || 'left' }, p.vertical ? { writingMode: 'vertical-rl', transform: 'rotate(180deg)' } : null, p.position);
    var txt = accent(p.texte);
    return h(F, null,
      p.echo !== false ? h('div', { ref: eref, className: 'lb-heros lb-heros-echo', 'aria-hidden': true, style: Object.assign({}, base, { transform: p.vertical ? 'rotate(180deg) translate(-16px, -30px)' : 'translate(16px, 30px)', zIndex: (p.z || 4) - 1 }) }, txt) : null,
      h('div', { ref: ref, className: 'lb-heros', style: Object.assign({}, base, { color: p.couleur || 'var(--heros)', textShadow: p.relief === false ? 'none' : relief(t), zIndex: p.z || 4 }) }, txt));
  }

  function TableauScore(p) {
    var eq = p.equipes || [];
    return h('div', { className: cx('lb-score', p.className), style: p.style },
      eq.map(function (e, i) { return h('span', { key: 'n' + i, className: 'lb-score-equipe' }, e.nom); }),
      eq.map(function (e, i) { return h('span', { key: 's' + i, className: cx('lb-score-valeur', e.gagnant ? 'lb-score-gagnant' : null) }, e.score); }),
      p.statut !== null ? h('span', { className: 'lb-score-statut' }, p.statut || 'FINAL') : null);
  }

  function TagVertical(p) {
    return h('div', { className: cx('lb-abs', 'lb-tag-vertical', p.className), style: Object.assign({ top: '50%', right: p.cote === 'gauche' ? 'auto' : '22px', left: p.cote === 'gauche' ? '22px' : 'auto', transform: 'translateY(-50%) rotate(180deg)', zIndex: 45 }, p.style) }, p.children || 'LA BRIQUE · ÇA RENTRE OU ÇA BRIQUE');
  }

  function Reperes(p) {
    var r = 'var(--repere)';
    return h(F, null,
      h('div', { className: 'lb-repere', style: { top: r, left: r, borderTopWidth: '3px', borderLeftWidth: '3px' } }),
      h('div', { className: 'lb-repere', style: { top: r, right: r, borderTopWidth: '3px', borderRightWidth: '3px' } }),
      h('div', { className: 'lb-repere', style: { bottom: r, left: r, borderBottomWidth: '3px', borderLeftWidth: '3px' } }),
      h('div', { className: 'lb-repere', style: { bottom: r, right: r, borderBottomWidth: '3px', borderRightWidth: '3px' } }));
  }

  function Grain(p) {
    var id = useId('lb-grain-');
    var H = p.hauteur || 1350;
    return h('svg', { className: 'lb-grain', width: W, height: H, 'aria-hidden': true },
      h('filter', { id: id }, h('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.8, numOctaves: 3, stitchTiles: 'stitch' }), h('feColorMatrix', { type: 'saturate', values: 0 })),
      h('rect', { width: W, height: H, filter: 'url(#' + id + ')', opacity: p.opacite || 'var(--opacite-grain)', style: { opacity: p.opacite || 'var(--opacite-grain)' } }));
  }

  /* ---------- Blocs ---------- */
  function Bandeau(p) {
    return h('div', { className: 'lb-bandeau' }, h(Logo, { taille: 64 }), p.format ? h(Pastille, { variante: 'format' }, p.format) : null);
  }

  function BlocBas(p) {
    var pills = (p.pastilles || []).slice(0, 3);
    return h('div', { className: 'lb-bloc-bas', style: p.style },
      p.nom ? h(NomJoueur, { prenom: p.prenom, nom: p.nom, taille: p.tailleNom || 118 }) : null,
      pills.length ? h('div', { className: 'lb-pastilles' }, pills.map(function (x, i) { return h(Pastille, { key: i, variante: i === 0 ? 'pleine' : 'contour' }, x); })) : null,
      p.punchline ? h(Punchline, null, p.punchline) : null,
      p.meta !== false ? h('div', { className: 'lb-meta' }, h('span', null, h('i', { className: 'lb-mire' }), p.meta || 'LA BRIQUE'), h('span', null, p.signature || 'ÇA RENTRE OU ÇA BRIQUE')) : null);
  }

  /* ---------- Montages photo ---------- */
  /* cadre : position du joueur détouré dans le visuel 1080, { x, y, l } = gauche, haut, largeur. */
  var CADRE = { x: 270, y: 470, l: 900 };

  function silhouette(src, c, couleur, dx, dy, op, z) {
    return h('div', { className: 'lb-silhouette', 'aria-hidden': true, style: { left: c.x + dx + 'px', top: c.y + dy + 'px', width: c.l + 'px', background: couleur, WebkitMaskImage: 'url(' + src + ')', maskImage: 'url(' + src + ')', opacity: op, zIndex: z } },
      h('img', { src: src, alt: '', style: { display: 'block', width: '100%', visibility: 'hidden' } }));
  }

  function Montage(p) {
    var type = p.type || 'lumiere';
    var c = Object.assign({}, CADRE, p.cadre);
    var src = p.photo;
    var couche = p.couche || 'fond';
    var img = function (cls, extra) { return h('img', { className: cx('lb-photo', cls), src: src, alt: p.alt || '', style: Object.assign({ left: c.x + 'px', top: c.y + 'px', width: c.l + 'px', zIndex: 10 }, extra) }); };

    if (type === 'lumiere') {
      if (couche === 'fond') return h(F, null,
        p.fantome ? h('img', { className: 'lb-photo lb-fantome', src: p.fantome, alt: '', style: { right: '-330px', top: '-60px', width: '1150px', transform: 'rotate(-4deg)', zIndex: 2 } }) : null,
        src ? [0.12, 0.2, 0.3, 0.45].map(function (o, i) { return h(F, { key: i }, silhouette(src, c, 'var(--halo-ambre)', -40 * (4 - i), 0, o, 8)); }) : null);
      return src ? img('lb-photo-lumiere') : null;
    }

    if (type === 'grosplan') {
      var g = p.grosPlan || src;
      if (couche === 'fond') return h(F, null,
        g ? h('img', { className: 'lb-photo lb-photo-fond', src: g, alt: '', style: Object.assign({ left: '-380px', top: '-120px', width: '1720px', filter: 'var(--filtre-grosplan)', zIndex: 2 }, p.styleGrosPlan) }) : null,
        h('div', { className: 'lb-trame', style: { zIndex: 3, WebkitMaskImage: 'linear-gradient(200deg, transparent 35%, #000 100%)', maskImage: 'linear-gradient(200deg, transparent 35%, #000 100%)' } }));
      return src ? img('lb-photo-liseree', { left: c.x + 160 + 'px', top: c.y + 230 + 'px', width: c.l * 0.68 + 'px' }) : null;
    }

    if (type === 'echo') {
      if (couche === 'fond') {
        var cxp = c.x + c.l * 0.55, cyp = c.y + c.l * 0.35;
        var rays = [];
        for (var i = 0; i < 18; i++) {
          var a0 = (i / 18) * Math.PI * 2, a1 = a0 + Math.PI / 36;
          rays.push(h('path', { key: i, d: 'M' + cxp + ' ' + cyp + ' L' + (cxp + 2400 * Math.cos(a0)) + ' ' + (cyp + 2400 * Math.sin(a0)) + ' L' + (cxp + 2400 * Math.cos(a1)) + ' ' + (cyp + 2400 * Math.sin(a1)) + ' Z', fill: 'var(--halo-brique)', opacity: 0.38 }));
        }
        return h(F, null,
          h('svg', { className: 'lb-abs', width: W, height: 1350, style: { top: 0, left: 0, zIndex: 2 }, 'aria-hidden': true }, rays),
          src ? silhouette(src, c, 'var(--halo-ambre)', -150, 40, 1, 7) : null,
          src ? silhouette(src, c, 'var(--halo-brique)', -75, 20, 1, 8) : null);
      }
      return src ? img('lb-photo-liseree') : null;
    }

    if (type === 'eclat' || type === 'conteneur') {
      /* Éclat : l'icône brique-ballon en géant, cassée en deux le long de la couture centrale.
         Le joueur traverse la brique par la cassure, tête au-dessus du bord, en couleurs naturelles.
         Le mot héros est imprimé sur la brique et casse avec elle. « conteneur » reste un alias. */
      var B = Object.assign({ cx: 540, cy: 680, l: 920, h: 438, angle: -6, ecart: 54, bascule: 3 }, p.brique);
      var plein2 = p.photoPlein;
      var pc = Object.assign({}, c, p.cadrePlein);
      var zoom = Object.assign({ x: c.x - c.l * 0.3, y: c.y - c.l * 0.1, l: c.l * 1.6 }, p.cadreZoom);
      if (couche === 'fond') {
        var sx = B.l / 210, sy = B.h / 100, a = B.angle * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
        var X = function (u, v) { var x = (u - 105) * sx, y = (v - 50) * sy; return [B.cx + x * ca - y * sa, B.cy + x * sa + y * ca]; };
        var P = function (cmds, close) { return cmds.map(function (k) { var out = []; for (var i = 1; i < k.length; i += 2) out.push(X(k[i], k[i + 1]).map(function (n) { return n.toFixed(1); }).join(' ')); return k[0] + out.join(' '); }).join(' ') + (close === false ? '' : ' Z'); };
        /* la cassure : une ligne brisée le long de la couture centrale */
        var dents = [[105, 0], [101, 9], [108, 18], [102, 28], [109, 37], [103, 47], [110, 57], [102, 67], [108, 77], [101, 87], [106, 100]];
        var cassure = function (sensInverse) { var d = sensInverse ? dents.slice().reverse() : dents; return d.map(function (q) { return ['L', q[0], q[1]]; }); };
        var moities = [
          { bord: P([['M', 0, 10], ['Q', 0, 0, 10, 0]].concat(cassure(false), [['L', 10, 100], ['Q', 0, 100, 0, 90]])),
            coutures: P([['M', 58, 0], ['C', 80, 30, 80, 70, 58, 100], ['M', 0, 50], ['L', 103, 50]], false), sens: -1, trame: true },
          { bord: P([['M', 105, 0], ['L', 200, 0], ['Q', 210, 0, 210, 10], ['L', 210, 90], ['Q', 210, 100, 200, 100]].concat(cassure(true))),
            coutures: P([['M', 152, 0], ['C', 130, 30, 130, 70, 152, 100], ['M', 104, 50], ['L', 210, 50]], false), sens: 1, trame: false }
        ];
        var bc = X(105, 50);
        var ux = ca, uy = sa; /* axe long de la brique */
        var img2 = function (t) {
          var f = 'url(#lb-bichromie) contrast(1.1)';
          if (plein2) return h('image', { href: plein2, x: pc.x, y: pc.y, width: pc.l, preserveAspectRatio: 'xMinYMin meet', filter: f, style: { filter: f } });
          if (!src) return null;
          return h('image', { href: src, x: zoom.x, y: zoom.y, width: zoom.l, preserveAspectRatio: 'xMinYMin meet', style: { filter: f } });
        };
        var rayons = [];
        for (var i = 0; i < 16; i++) {
          var a0 = (i / 16) * Math.PI * 2 + 0.1, a1 = a0 + Math.PI / 28;
          rayons.push(h('path', { key: i, d: 'M' + bc[0] + ' ' + bc[1] + ' L' + (bc[0] + 2200 * Math.cos(a0)) + ' ' + (bc[1] + 2200 * Math.sin(a0)) + ' L' + (bc[0] + 2200 * Math.cos(a1)) + ' ' + (bc[1] + 2200 * Math.sin(a1)) + ' Z', fill: 'var(--rayons)', opacity: 0.13 }));
        }
        /* éclats projetés depuis la cassure, en coordonnées de la brique : [points], déplacement, rotation, couleur */
        /* éclats de brique : polygone en coordonnées de la brique, déplacement en px, rotation, couleur.
           Ils partent de la cassure vers l'extérieur, jamais vers la tête du joueur. */
        var grossir = function (pts, k) { var gx = 0, gy = 0; pts.forEach(function (q) { gx += q[0]; gy += q[1]; }); gx /= pts.length; gy /= pts.length; return pts.map(function (q) { return [gx + (q[0] - gx) * k, gy + (q[1] - gy) * k]; }); };
        var debris = [
          [grossir([[100, -2], [111, -8], [109, 2], [104, 6]], 1.7), [-170, -40], -16, 'var(--encre)'],
          [grossir([[95, 3], [103, 1], [100, 10]], 1.7), [-110, -120], 28, 'var(--encre)'],
          [grossir([[102, 96], [112, 94], [110, 104], [104, 107]], 1.7), [70, 96], 22, 'var(--encre)'],
          [grossir([[107, 89], [115, 91], [109, 98]], 1.7), [150, 52], -24, 'var(--encre)']
        ];
        return h('div', { className: 'lb-abs', style: { inset: 0, zIndex: 3 }, 'aria-hidden': true },
          h('svg', { className: 'lb-abs', width: W, height: 1350, style: { left: 0, top: 0, mixBlendMode: 'screen' } }, rayons),
          h('div', { className: 'lb-abs', style: { left: bc[0] - 600 + 'px', top: bc[1] - 420 + 'px', width: '1200px', height: '840px', background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(246,160,77,.85) 0%, rgba(246,160,77,0) 68%)', mixBlendMode: 'screen' } }),
          src ? img('lb-photo-liseree', { zIndex: 'auto' }) : null,
          moities.map(function (mo, i) {
            var id = 'lb-moitie-' + i + '-' + Math.round(B.cx) + '-' + Math.round(B.cy);
            var tx = (mo.sens * B.ecart * ux).toFixed(1), ty = (mo.sens * B.ecart * uy + mo.sens * 14).toFixed(1);
            var bordCoupe = (i === 0 ? [[105, -500]].concat(dents, [[106, 600], [-600, 600], [-600, -500]]) : [[105, -500]].concat(dents, [[106, 600], [800, 600], [800, -500]]))
              .map(function (q) { var r = X(q[0], q[1]); return r[0].toFixed(1) + 'px ' + r[1].toFixed(1) + 'px'; }).join(', ');
            return h('div', { key: i, className: 'lb-abs lb-moitie', style: { inset: 0, transform: 'translate(' + tx + 'px,' + ty + 'px) rotate(' + (mo.sens * B.bascule) + 'deg)', transformOrigin: bc[0].toFixed(1) + 'px ' + bc[1].toFixed(1) + 'px' } },
              h('svg', { className: 'lb-abs', width: W, height: 1350, style: { left: 0, top: 0, overflow: 'visible' } },
                h('defs', null,
                  h('clipPath', { id: id }, h('path', { d: mo.bord })),
                  h('pattern', { id: id + '-t', width: 14, height: 14, patternUnits: 'userSpaceOnUse' }, h('circle', { cx: 7, cy: 7, r: 3, fill: plein2 ? 'rgba(18,17,16,.35)' : 'rgba(224,78,34,.5)' })),
                  h('linearGradient', { id: id + '-l', x1: 0, y1: 0, x2: 1, y2: 1 }, h('stop', { offset: 0, stopColor: '#f6a04d', stopOpacity: .55 }), h('stop', { offset: .5, stopColor: '#f6a04d', stopOpacity: 0 }), h('stop', { offset: 1, stopColor: '#7e200e', stopOpacity: .7 }))),
                h('g', { clipPath: 'url(#' + id + ')' },
                  h('rect', { x: 0, y: 0, width: W, height: 1350, fill: 'var(--encre)' }),
                  plein2 ? img2() : null,
                  h('rect', { x: 0, y: 0, width: W, height: 1350, fill: 'url(#' + id + '-l)', style: { mixBlendMode: plein2 ? 'soft-light' : 'screen', opacity: plein2 ? 1 : 0.35 } }),
                  (mo.trame || !plein2) ? h('rect', { x: 0, y: 0, width: W, height: 1350, fill: 'url(#' + id + '-t)', opacity: plein2 ? 1 : 0.5 }) : null),
                h('path', { d: mo.coutures, fill: 'none', stroke: 'var(--parquet)', strokeWidth: 14, strokeLinecap: 'round' }),
                h('path', { d: mo.bord, fill: 'none', stroke: 'var(--os)', strokeWidth: 12, strokeLinejoin: 'round' })),
              p.heros ? h('div', { className: 'lb-abs', style: { inset: 0, clipPath: 'polygon(' + bordCoupe + ')' } },
                h(MotHeros, Object.assign({ taille: 560, align: 'center', interligne: 0.8 }, p.heros, { position: { top: (bc[1] - (p.heros.taille || 560) * (p.heros.lignes || 1) * (p.heros.interligne || 0.8) / 2).toFixed(1) + 'px', left: 0, width: W + 'px', whiteSpace: 'pre-line' } }))) : null);
          }),
          debris.map(function (d, i) {
            var pts = d[0].map(function (q) { return X(q[0], q[1]); });
            var cxd = pts.reduce(function (a, q) { return a + q[0]; }, 0) / pts.length, cyd = pts.reduce(function (a, q) { return a + q[1]; }, 0) / pts.length;
            return h('svg', { key: 'd' + i, className: 'lb-abs', width: W, height: 1350, style: { left: 0, top: 0, overflow: 'visible', transform: 'translate(' + d[1][0] + 'px,' + d[1][1] + 'px) rotate(' + d[2] + 'deg)', transformOrigin: cxd.toFixed(1) + 'px ' + cyd.toFixed(1) + 'px', filter: 'drop-shadow(8px 10px 0 rgba(18,17,16,.6))' } },
              h('polygon', { points: pts.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '), fill: d[3], stroke: 'var(--os)', strokeWidth: 6, strokeLinejoin: 'round' }));
          }));
      }
      return null;
    }

    if (type === 'replay') {
      /* Replay : l'action revue à la vidéo. Décalage vidéo, tranches glitchées, lignes de balayage,
         viseur sur la cible, bandeau REPLAY et barre de lecture. */
      var cible = Object.assign({ x: c.x + c.l * 0.6, y: c.y + c.l * 0.15, t: 270 }, p.cible);
      if (couche === 'fond') return src ? h(F, null,
        silhouette(src, c, 'var(--contour)', -22, 0, 0.5, 7),
        silhouette(src, c, 'var(--parquet)', 22, 0, 0.9, 8)) : null;
      var tranches = [[0.2, 0.245, 34], [0.47, 0.5, -28], [0.69, 0.71, 20]];
      var coin = function (k) {
        var s1 = 64, e = 8, d = cible.t / 2;
        var st = { position: 'absolute', width: s1 + 'px', height: s1 + 'px', borderColor: 'var(--contour)', borderStyle: 'solid', borderWidth: 0 };
        if (k < 2) st.top = cible.y - d + 'px'; else st.top = cible.y + d - s1 + 'px';
        if (k % 2 === 0) st.left = cible.x - d + 'px'; else st.left = cible.x + d - s1 + 'px';
        st[k < 2 ? 'borderTopWidth' : 'borderBottomWidth'] = e + 'px';
        st[k % 2 === 0 ? 'borderLeftWidth' : 'borderRightWidth'] = e + 'px';
        return h('div', { key: 'c' + k, style: st });
      };
      return h(F, null,
        src ? img('', { filter: 'contrast(1.12) saturate(.9)' }) : null,
        src ? tranches.map(function (tr, i) { return h(F, { key: 't' + i }, img('', { zIndex: 11, filter: 'contrast(1.12) saturate(.9)', clipPath: 'inset(' + tr[0] * 100 + '% 0 ' + (100 - tr[1] * 100) + '% 0)', transform: 'translateX(' + tr[2] + 'px)' })); }) : null,
        h('div', { className: 'lb-balayage' }),
        h('div', { className: 'lb-abs', style: { inset: 0, zIndex: 13, pointerEvents: 'none' } },
          [0, 1, 2, 3].map(coin),
          h('span', { className: 'lb-pastille lb-pastille-contour', style: { position: 'absolute', fontSize: '28px', padding: '10px 22px', left: cible.x - cible.t / 2 + 'px', top: cible.y + cible.t / 2 + 18 + 'px', background: 'var(--module-fond)', color: 'var(--module-texte)', boxShadow: 'none' } }, p.etiquette || 'REVU À LA VIDÉO')),
        h('div', { className: 'lb-abs lb-replay-bandeau', style: { top: '166px', right: 'var(--marge)', zIndex: 41 } }, h('i', { className: 'lb-rec' }), p.timecode || 'REPLAY · 4E QT 00:47'),
        h('div', { className: 'lb-abs lb-lecture', style: { zIndex: 21 } },
          h('div', { className: 'lb-lecture-fait', style: { width: (p.progression || 0.72) * 100 + '%' } }),
          h('div', { className: 'lb-lecture-tete', style: { left: (p.progression || 0.72) * 100 + '%' } })));
    }

    if (type === 'carte') {
      /* Carte : le joueur en carte à collectionner, la tête qui sort du cadre, une seconde carte au dos derrière. */
      var K = Object.assign({ x: 380, y: 190, l: 600, h: 780, angle: 5 }, p.carteCadre);
      var info = Object.assign({ equipe: 'LA BRIQUE', numero: '01', serie: 'SÉRIE 26-27' }, p.carte);
      if (couche === 'fond') return h(F, null,
        h('div', { className: 'lb-carte lb-carte-dos', style: { left: K.x + 70 + 'px', top: K.y - 30 + 'px', width: K.l + 'px', height: K.h + 'px', transform: 'rotate(' + (K.angle + 7) + 'deg)', zIndex: 5 } },
          h(IconeBrique, { largeur: K.l * 0.55, couleur: 'var(--parquet)', epaisseur: 7, style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' } })),
        h('div', { className: 'lb-carte', style: { left: K.x + 'px', top: K.y + 'px', width: K.l + 'px', height: K.h + 'px', transform: 'rotate(' + K.angle + 'deg)', zIndex: 6 } },
          h('div', { className: 'lb-carte-holo' }),
          p.photoPlein ? h('img', { src: p.photoPlein, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.cadrage || 'center 20%', mixBlendMode: 'multiply', filter: 'contrast(1.1)' } }) : null,
          h('div', { className: 'lb-trame', style: { opacity: .45 } }),
          h('div', { className: 'lb-carte-reflet' }),
          h('span', { className: 'lb-carte-numero' }, 'N° ' + info.numero),
          info.bande !== false ? h('div', { className: 'lb-carte-bande' }, h('span', { className: 'lb-cond' }, info.equipe), h('span', null, info.serie)) : null));
      return src ? img('lb-photo-liseree', { zIndex: 10 }) : null;
    }
    return null;
  }

  /* ---------- Formats ---------- */
  function couches(p, heros) {
    var m = { type: p.montage || 'lumiere', photo: p.photo, photoPlein: p.photoPlein, fantome: p.fantome, grosPlan: p.grosPlan, styleGrosPlan: p.styleGrosPlan, cadre: p.cadre, cadrePlein: p.cadrePlein, brique: p.brique, cible: p.cible, etiquette: p.etiquette, timecode: p.timecode, progression: p.progression, carte: p.carte, carteCadre: p.carteCadre, alt: p.alt, heros: heros };
    return { fond: h(Montage, Object.assign({ couche: 'fond' }, m)), avant: h(Montage, Object.assign({ couche: 'avant' }, m)) };
  }

  function estCarte(p) { return p.montage === 'carte'; }
  var HEROS_CARTE = { position: { left: '40px', top: '240px', height: '720px', width: 'auto' }, vertical: true, ajuster: true, align: 'center' };
  function estEclat(p) { return p.montage === 'eclat' || p.montage === 'conteneur'; }
  function motif(p) { return estEclat(p) ? false : undefined; }
  function avecBrique(p, defaut) { return estEclat(p) ? Object.assign({}, p, { brique: Object.assign({}, defaut, p.brique) }) : p; }

  function PostChiffre(p) {
    var t = p.tailleChiffre || (String(p.chiffre).length > 2 ? 560 : 760);
    var e = estEclat(p);
    var m = couches(avecBrique(p, {}), e ? { texte: String(p.chiffre), taille: p.tailleChiffre || (String(p.chiffre).length > 2 ? 360 : 500) } : null);
    return h(Post, { theme: themeVerdict(p), echelle: p.echelle, motif: motif(p) },
      m.fond,
      e ? null : h(MotHeros, Object.assign({ texte: String(p.chiffre), taille: t, ajuster: true, min: 300, position: { top: '206px', left: '-36px', width: '1116px' } }, estCarte(p) ? Object.assign({}, HEROS_CARTE, { taille: 420, min: 200 }) : null)),
      m.avant,
      h('div', { className: 'lb-voile-bas' }),
      h(Bandeau, { format: p.format || 'LE CHIFFRE' }),
      p.surtitre ? h(Surtitre, { className: 'lb-abs', style: { top: 'var(--zone-surtitre)', left: 'var(--marge)', zIndex: 22, maxWidth: p.score ? '600px' : '968px' } }, p.surtitre) : null,
      p.score ? h(TableauScore, { equipes: p.score, statut: p.statut, className: 'lb-abs', style: { top: '178px', right: 'var(--marge)', zIndex: 20 } }) : null,
      p.verdict ? h(SceauVerdict, { verdict: p.verdict, style: Object.assign({ top: '690px', left: '400px' }, p.styleSceau) }) : null,
      h(BlocBas, { prenom: p.prenom, nom: p.nom, pastilles: p.pastilles, punchline: p.punchline, meta: p.meta, signature: p.signature }));
  }

  function PostVerdict(p) {
    var v = (p.verdict || 'SWISH').toUpperCase();
    var e = estEclat(p);
    var m = couches(avecBrique(p, {}), e ? { texte: v, taille: v.length > 5 ? 290 : 330, interligne: 0.82, approche: '-0.01em', couleur: (VERDICTS[v] || VERDICTS.SWISH).heros } : null);
    return h(Post, { theme: themeVerdict(Object.assign({}, p, { verdict: v })), echelle: p.echelle, motif: motif(p) },
      m.fond,
      e ? null : h(MotHeros, Object.assign({ texte: v, taille: 430, ajuster: true, interligne: 0.82, approche: '-0.01em', align: 'center', couleur: (VERDICTS[v] || VERDICTS.SWISH).heros, position: { top: '290px', left: 0, width: W + 'px' } }, estCarte(p) ? Object.assign({}, HEROS_CARTE, { taille: 300, min: 160 }) : null)),
      m.avant,
      h('div', { className: 'lb-voile-bas' }),
      h(Bandeau, { format: p.format || 'LE VERDICT' }),
      p.surtitre ? h(Surtitre, { className: 'lb-abs', style: { top: 'var(--zone-surtitre)', left: 'var(--marge)', right: 'var(--marge)', zIndex: 22 } }, p.surtitre) : null,
      p.score ? h(TableauScore, { equipes: p.score, statut: p.statut, className: 'lb-abs', style: { top: '178px', right: 'var(--marge)', zIndex: 20 } }) : null,
      h(BlocBas, { prenom: p.prenom, nom: p.nom, pastilles: p.pastilles, punchline: p.punchline, meta: p.meta, signature: p.signature }));
  }

  function PostAffiche(p) {
    /* Éclat n'existe pas en Affiche : le titre sur deux lignes ne casse pas proprement. Repli sur Gros plan. */
    if (estEclat(p)) p = Object.assign({}, p, { montage: 'grosplan' });
    var m = couches(p);
    return h(Post, { theme: themeVerdict(p), echelle: p.echelle, motif: motif(p) },
      m.fond,
      h(MotHeros, { texte: p.titre, taille: p.tailleTitre || 250, interligne: 0.84, approche: '0', align: 'center', position: { top: '250px', left: 'var(--marge)', right: 'var(--marge)', whiteSpace: 'normal' } }),
      m.avant,
      h('div', { className: 'lb-voile-bas' }),
      h(Bandeau, { format: p.format || 'LE VESTIAIRE' }),
      p.surtitre ? h(Surtitre, { className: 'lb-abs', style: { top: 'var(--zone-surtitre)', left: 'var(--marge)', right: 'var(--marge)', zIndex: 22 } }, p.surtitre) : null,
      p.verdict ? h(SceauVerdict, { verdict: p.verdict, style: Object.assign({ top: '640px', left: '56px' }, p.styleSceau) }) : null,
      h(BlocBas, { prenom: p.prenom, nom: p.nom, pastilles: p.pastilles, punchline: p.punchline, meta: p.meta, signature: p.signature }));
  }

  function Moitie(s, i) {
    var y = i === 0 ? 0 : 675;
    var c = Object.assign({ x: 300, y: 40, l: 760 }, s.cadre);
    return h('div', { key: i, className: 'lb-abs', style: { top: y + 'px', left: 0, width: W + 'px', height: '675px', overflow: 'hidden', background: i === 0 ? 'var(--parquet)' : 'var(--encre)' } },
      i === 0 ? h('div', { className: 'lb-abs lb-fond-affiche', style: { inset: 0 } }) : null,
      s.photoPlein ? h('img', { className: 'lb-photo', src: s.photoPlein, alt: s.alt || '', style: { inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: s.cadrage || 'center 20%', filter: s.noirEtBlanc ? 'url(#lb-bichromie)' : 'contrast(1.05)' } }) : null,
      !s.photoPlein && s.photo ? h('img', { className: cx('lb-photo', i === 0 ? 'lb-photo-lumiere' : null), src: s.photo, alt: s.alt || '', style: { left: c.x + 'px', top: c.y + 'px', width: c.l + 'px', filter: s.noirEtBlanc ? 'url(#lb-bichromie)' : undefined } }) : null,
      s.noirEtBlanc ? h('div', { className: 'lb-trame', style: { opacity: .7 } }) : null,
      h('div', { className: 'lb-abs', style: { inset: 0, background: 'linear-gradient(180deg, rgba(18,17,16,0) 35%, rgba(18,17,16,.9) 100%)' } }),
      h('div', { className: 'lb-abs', style: { left: 'var(--marge)', right: 'var(--marge)', bottom: i ? '52px' : '80px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 10 } },
        h(Surtitre, { filet: true }, s.etiquette),
        h(NomJoueur, { prenom: s.prenom, nom: s.nom, taille: 104 }),
        s.stats ? h('div', { className: 'lb-pastilles' }, s.stats.slice(0, 3).map(function (x, j) { return h(Pastille, { key: j, variante: j === 0 ? 'pleine' : 'contour' }, x); })) : null));
  }

  function PostFaceAFace(p) {
    return h(Post, { theme: p.theme || 'sombre', echelle: p.echelle, motif: false },
      Moitie(p.haut || {}, 0),
      Moitie(p.bas || {}, 1),
      h('div', { className: 'lb-vs', style: { top: '615px', left: '480px' } }, 'VS'),
      h(Bandeau, { format: p.format || 'FACE À FACE' }),
      p.question ? h('div', { className: 'lb-abs lb-serif', style: { top: '150px', left: 'var(--marge)', right: 'var(--marge)', fontSize: '56px', lineHeight: 1.05, zIndex: 22, textShadow: '0 4px 24px rgba(0,0,0,.6)' } }, accent(p.question)) : null);
  }

  function PostClassement(p) {
    var lignes = (p.lignes || []).slice(0, 5);
    return h(Post, { theme: p.theme || 'sombre', echelle: p.echelle },
      p.photo ? h('img', { className: 'lb-photo lb-photo-lumiere', src: p.photo, alt: p.alt || '', style: { right: '-200px', top: '330px', width: '760px', zIndex: 5 } }) : null,
      h('div', { className: 'lb-abs', style: { top: 0, right: 0, width: '700px', height: '1350px', zIndex: 6, background: 'linear-gradient(90deg, #121110 0%, rgba(18,17,16,.55) 35%, rgba(18,17,16,0) 70%)' } }),
      h(Bandeau, { format: p.format || 'LE CLASSEMENT' }),
      h(MotHeros, { texte: p.titre, taille: 120, interligne: 0.86, approche: '0', echo: false, z: 12, position: { top: '160px', left: 'var(--marge)', width: '720px', whiteSpace: 'normal' } }),
      h('div', { className: 'lb-abs', style: { top: '470px', left: 'var(--marge)', width: '640px', display: 'flex', flexDirection: 'column', gap: 'var(--pastilles-ecart)', zIndex: 12 } },
        lignes.map(function (r, i) {
          return h('div', { key: i, className: cx('lb-ligne', i === 0 ? 'lb-ligne-une' : null) },
            h('span', { className: 'lb-cond', style: { fontSize: '64px', width: '44px' } }, i + 1),
            h('div', { style: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 } },
              h('span', { className: 'lb-cond lb-nowrap', style: { fontSize: '58px', overflow: 'hidden' } }, r.nom),
              h('span', { style: { fontSize: '28px', fontWeight: 700, opacity: .8 } }, r.equipe)),
            h('span', { className: 'lb-cond', style: { fontSize: '72px' } }, r.valeur),
            h('span', { style: { fontSize: '28px', fontWeight: 800 } }, r.unite));
        })),
      p.punchline ? h(Punchline, { className: 'lb-abs', style: { left: 'var(--marge)', width: '700px', bottom: '110px', zIndex: 12 } }, p.punchline) : null,
      h('div', { className: 'lb-abs lb-meta', style: { left: 'var(--marge)', right: 'var(--marge)', bottom: '52px', zIndex: 12 } }, h('span', null, h('i', { className: 'lb-mire' }), p.meta || 'LA BRIQUE'), h('span', null, p.signature || 'ÇA RENTRE OU ÇA BRIQUE')));
  }

  function PostEchange(p) {
    var eq = (p.equipes || []).slice(0, 2);
    return h(Post, { theme: p.theme || 'sombre', echelle: p.echelle, motif: false },
      eq.map(function (e, i) {
        var x = i === 0 ? 0 : 540;
        return h('div', { key: i, className: 'lb-abs', style: { top: 0, left: x + 'px', width: '540px', height: '1350px', overflow: 'hidden', background: i === 0 ? 'var(--parquet)' : 'var(--encre)' } },
          i === 0 ? h('div', { className: 'lb-abs lb-fond-affiche', style: { inset: 0 } }) : null,
          e.photoPlein ? h('img', { className: 'lb-photo', src: e.photoPlein, alt: e.alt || '', style: { inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: e.cadrage || 'center 20%' } }) : null,
          !e.photoPlein && e.photo ? h('img', { className: 'lb-photo lb-photo-liseree', src: e.photo, alt: e.alt || '', style: Object.assign({ left: '-140px', top: '420px', width: '760px', filter: i === 1 ? 'url(#lb-bichromie)' : undefined }, e.stylePhoto) }) : null,
          h('div', { className: 'lb-abs', style: { inset: 0, background: 'linear-gradient(180deg, rgba(18,17,16,.85) 0%, rgba(18,17,16,.1) 30%, rgba(18,17,16,.2) 50%, rgba(18,17,16,.95) 78%)' } }),
          h('div', { className: 'lb-abs', style: { left: '40px', right: '30px', bottom: '110px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 } },
            h('span', { className: 'lb-cond lb-nowrap', style: { fontSize: '84px' } }, e.nom),
            h('span', { className: 'lb-cond', style: { fontSize: '48px', color: 'var(--halo-ambre)' } }, 'REÇOIT :'),
            (e.recoit || []).map(function (r, j) { return h('span', { key: j, style: { fontSize: '36px', fontWeight: 800, lineHeight: 1.15 } }, r); })));
      }),
      h('div', { className: 'lb-abs', style: { top: '420px', left: '538px', width: '4px', height: '930px', background: 'var(--parquet)', zIndex: 9 } }),
      h(Bandeau, { format: p.format || 'LES DÉCISIONS' }),
      h(MotHeros, { texte: p.titre || 'PROPOSITION D’*ÉCHANGE*', taille: 150, interligne: 0.86, approche: '0', align: 'center', echo: false, z: 12, position: { top: '160px', left: 'var(--marge)', right: 'var(--marge)', whiteSpace: 'normal' } }),
      h('div', { className: 'lb-abs lb-meta', style: { left: 'var(--marge)', right: 'var(--marge)', bottom: '52px', zIndex: 12 } }, h('span', null, h('i', { className: 'lb-mire' }), p.meta || 'LA BRIQUE'), h('span', null, p.signature || 'ÇA RENTRE OU ÇA BRIQUE')));
  }

  function StoryUne(p) {
    return h(Post, { theme: p.theme || 'affiche', echelle: p.echelle, hauteur: 1920, reperes: false, motif: false },
      h('div', { className: 'lb-abs', style: { top: '700px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', zIndex: 10 } },
        h(IconeBrique, { largeur: 420, couleur: 'var(--os)' }),
        h('span', { className: 'lb-cond', style: { fontSize: '190px', lineHeight: .86 } }, p.titre || 'VERDICTS')));
  }

  window.LaBrique = Object.assign(window.LaBrique || {}, {
    Post: Post, Logo: Logo, IconeBrique: IconeBrique, Sceau: Sceau, SceauVerdict: SceauVerdict,
    Pastille: Pastille, Surtitre: Surtitre, NomJoueur: NomJoueur, Punchline: Punchline, MotHeros: MotHeros,
    TableauScore: TableauScore, TagVertical: TagVertical, Reperes: Reperes, Grain: Grain, Bandeau: Bandeau, BlocBas: BlocBas,
    Montage: Montage, PostVerdict: PostVerdict, PostChiffre: PostChiffre, PostAffiche: PostAffiche,
    PostFaceAFace: PostFaceAFace, PostClassement: PostClassement, PostEchange: PostEchange, StoryUne: StoryUne,
    accent: accent
  });
})();
