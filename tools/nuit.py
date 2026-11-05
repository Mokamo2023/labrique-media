#!/usr/bin/env python3
"""La Brique : la nuit NBA en un coup d'oeil, depuis l'API publique d'ESPN.

Usage :
  python3 tools/nuit.py                    # la nuit en cours ou la dernière nuit
  python3 tools/nuit.py --date 2026-11-04  # une nuit précise (date américaine des matchs)
  python3 tools/nuit.py --json nuit.json   # écrit aussi les données complètes en JSON

Sortie : les matchs (terminés, en cours, à venir) avec l'heure de Bruxelles, les grosses perfs
des matchs terminés classées par indice, les matchs en cours à surveiller avec leurs leaders,
et les Français et les Belges. La feuille de match ESPN compte comme UNE source : recoupe
chaque chiffre publié avec une seconde source (résumé AP, NBA.com, presse).
"""
import argparse, json, subprocess, sys, datetime
from zoneinfo import ZoneInfo

BXL = ZoneInfo("Europe/Brussels")
BASE = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba"

# Joueurs français et belges (NBA). Liste à compléter quand un nouveau arrive.
NOTRES = {
    "Victor Wembanyama": "FR", "Rudy Gobert": "FR", "Bilal Coulibaly": "FR", "Alex Sarr": "FR",
    "Alexandre Sarr": "FR", "Zaccharie Risacher": "FR", "Tidjane Salaün": "FR", "Tidjane Salaun": "FR",
    "Ousmane Dieng": "FR", "Guerschon Yabusele": "FR", "Nicolas Batum": "FR", "Moussa Diabaté": "FR",
    "Moussa Diabate": "FR", "Noah Penda": "FR", "Maxime Raynaud": "FR", "Mohamed Diawara": "FR",
    "Nolan Traoré": "FR", "Nolan Traore": "FR", "Joan Beringer": "FR", "Sidy Cissoko": "FR",
    "Pacôme Dadiet": "FR", "Pacome Dadiet": "FR", "Evan Fournier": "FR", "Killian Hayes": "FR",
    "Théo Maledon": "FR", "Theo Maledon": "FR", "Frank Ntilikina": "FR", "Narcisse Ngoy": "FR",
    "Toumani Camara": "BE", "Ajay Mitchell": "BE",
}


def get(url):
    out = subprocess.run(["curl", "-s", "--max-time", "25", url], capture_output=True, text=True).stdout
    try:
        return json.loads(out)
    except Exception:
        return {}


def num(v):
    try:
        return int(str(v).split("-")[0])
    except Exception:
        return 0


def ligne(stats):
    """Transforme la ligne ESPN en dictionnaire lisible."""
    g = lambda k: stats.get(k, "0")
    fg, tp, ft = g("fieldGoalsMade-fieldGoalsAttempted"), g("threePointFieldGoalsMade-threePointFieldGoalsAttempted"), g("freeThrowsMade-freeThrowsAttempted")
    return {
        "min": g("minutes"), "pts": num(g("points")), "reb": num(g("rebounds")), "ast": num(g("assists")),
        "stl": num(g("steals")), "blk": num(g("blocks")), "tov": num(g("turnovers")), "pm": g("plusMinus"),
        "fg": fg.replace("-", "/"), "tp": tp.replace("-", "/"), "ft": ft.replace("-", "/"), "tpm": num(tp),
    }


def indice(l):
    s = l["pts"] + 1.2 * l["reb"] + 1.5 * l["ast"] + 2.5 * (l["stl"] + l["blk"]) - l["tov"]
    dbl = sum(1 for v in (l["pts"], l["reb"], l["ast"], l["stl"], l["blk"]) if v >= 10)
    if l["pts"] >= 50: s += 25
    elif l["pts"] >= 40: s += 15
    if dbl >= 3: s += 12
    if l["pts"] >= 20 and l["reb"] >= 20: s += 8
    if l["blk"] >= 7 or l["stl"] >= 6: s += 8
    if l["tpm"] >= 9: s += 8
    if l["ast"] >= 15: s += 6
    return round(s, 1)


def texte(l):
    parts = [f"{l['pts']} pts", f"{l['reb']} reb", f"{l['ast']} pd"]
    if l["stl"]: parts.append(f"{l['stl']} int")
    if l["blk"]: parts.append(f"{l['blk']} contres")
    return ", ".join(parts) + f" · {l['fg']} au tir, {l['tp']} à 3 pts, {l['ft']} LF · {l['min']} min · {l['pm']}"


def lire_match(e):
    c = e["competitions"][0]
    st = e["status"]["type"]
    tip = datetime.datetime.fromisoformat(e["date"].replace("Z", "+00:00")).astimezone(BXL)
    eq = {x["homeAway"]: x for x in c["competitors"]}
    m = {
        "id": e["id"], "etat": st["state"], "detail": st.get("shortDetail") or st.get("detail"),
        "debut_bxl": tip.strftime("%H:%M"), "periode": e["status"].get("period", 0),
        "horloge": e["status"].get("displayClock", ""),
        "ext": eq["away"]["team"]["abbreviation"], "dom": eq["home"]["team"]["abbreviation"],
        "ext_nom": eq["away"]["team"]["displayName"], "dom_nom": eq["home"]["team"]["displayName"],
        "score_ext": num(eq["away"].get("score", 0)), "score_dom": num(eq["home"].get("score", 0)),
        "joueurs": [],
    }
    m["prolong"] = max(0, m["periode"] - 4)
    if m["etat"] == "in":
        try:
            mm, ss = (m["horloge"] or "0:00").split(":") if ":" in (m["horloge"] or "") else (m["horloge"] or "0", "0")
            reste_q = float(mm) + float(ss) / 60
        except Exception:
            reste_q = 6.0
        p = max(1, m["periode"])
        reste = reste_q + (max(0, 4 - p) * 12 if p <= 4 else 0)
        mur = reste * 3.0 + (15 if p <= 2 else 0) + 5
        m["fin_estimee_bxl"] = (datetime.datetime.now(BXL) + datetime.timedelta(minutes=mur)).strftime("%H:%M")
    m["ecart"] = abs(m["score_ext"] - m["score_dom"])
    if m["etat"] in ("in", "post"):
        s = get(f"{BASE}/summary?event={e['id']}")
        for team in s.get("boxscore", {}).get("players", []):
            ab = team["team"]["abbreviation"]
            for bloc in team.get("statistics", []):
                keys = bloc.get("keys", [])
                for a in bloc.get("athletes", []):
                    if not a.get("stats"):
                        continue
                    l = ligne(dict(zip(keys, a["stats"])))
                    nom = a["athlete"]["displayName"]
                    m["joueurs"].append({"nom": nom, "equipe": ab, "ligne": l, "indice": indice(l), "notre": NOTRES.get(nom)})
    return m


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", help="date américaine des matchs, AAAA-MM-JJ (par défaut : la nuit en cours ou la dernière)")
    ap.add_argument("--json", help="écrit les données complètes dans ce fichier")
    ap.add_argument("--top", type=int, default=12)
    a = ap.parse_args()
    maintenant = datetime.datetime.now(BXL)
    jour = datetime.date.fromisoformat(a.date) if a.date else (maintenant - datetime.timedelta(hours=12)).date()
    sb = get(f"{BASE}/scoreboard?dates={jour:%Y%m%d}")
    if not sb:
        sys.exit("ERREUR : l'API ESPN ne répond pas. Fais la veille à la main (ESPN, NBA.com, AP).")
    matchs = [lire_match(e) for e in sb.get("events", [])]

    fini = [m for m in matchs if m["etat"] == "post"]
    cours = [m for m in matchs if m["etat"] == "in"]
    avenir = [m for m in matchs if m["etat"] == "pre"]
    perfs = sorted(((j, m) for m in fini for j in m["joueurs"]), key=lambda x: -x[0]["indice"])

    out = [f"# Nuit NBA du {jour:%d/%m/%Y} (matchs américains), lue à {maintenant:%H:%M} heure de Bruxelles",
           f"{len(matchs)} matchs : {len(fini)} terminés, {len(cours)} en cours, {len(avenir)} à venir.", "", "## Matchs"]
    for m in sorted(matchs, key=lambda m: m["debut_bxl"]):
        tag = {"post": "FIN", "in": "EN COURS", "pre": "À VENIR"}[m["etat"]]
        extra = []
        if m["prolong"]: extra.append(f"{m['prolong']} prolongation(s)")
        if m["etat"] != "pre" and m["ecart"] <= 3: extra.append("serré")
        out.append(f"- {tag} · {m['ext']} {m['score_ext']} à {m['dom']} {m['score_dom']} · {m['detail']} · début {m['debut_bxl']}" + (f" · {', '.join(extra)}" if extra else ""))
    out += ["", "## Grosses perfs des matchs terminés (indice décroissant)"]
    for j, m in perfs[: a.top]:
        adv = m["dom"] if j["equipe"] == m["ext"] else m["ext"]
        gagne = (m["score_ext"] > m["score_dom"]) == (j["equipe"] == m["ext"])
        drap = f" [{j['notre']}]" if j["notre"] else ""
        out.append(f"- {j['nom']}{drap} ({j['equipe']} contre {adv}, {'gagné' if gagne else 'perdu'} {max(m['score_ext'], m['score_dom'])}-{min(m['score_ext'], m['score_dom'])}) · {texte(j['ligne'])} · indice {j['indice']}")
    if cours:
        out += ["", "## Matchs en cours à surveiller"]
        for m in cours:
            lead = sorted(m["joueurs"], key=lambda j: -j["indice"])[:3]
            out.append(f"- {m['ext']} {m['score_ext']} à {m['dom']} {m['score_dom']} · {m['detail']} · fin estimée vers {m.get('fin_estimee_bxl', '?')}")
            for j in lead:
                out.append(f"  - {j['nom']} ({j['equipe']}) · {texte(j['ligne'])} · indice {j['indice']}")
    notres = [(j, m) for m in fini + cours for j in m["joueurs"] if j["notre"]]
    if notres:
        out += ["", "## Les nôtres (Français et Belges)"]
        for j, m in sorted(notres, key=lambda x: -x[0]["indice"]):
            etat = "terminé" if m["etat"] == "post" else f"en cours, {m['detail']}"
            out.append(f"- {j['nom']} [{j['notre']}] ({j['equipe']}, {m['ext']} à {m['dom']}, {etat}) · {texte(j['ligne'])}")
    if avenir:
        dernier = max(m["debut_bxl"] for m in avenir)
        out += ["", f"Dernier coup d'envoi à venir : {dernier} (un match dure environ 2 h 30 à 2 h 55, prolongations en plus)."]
    out += ["", "Source : feuilles de match ESPN. Une seule source : recoupe chaque chiffre publié (résumé AP, NBA.com, presse).",
            "ESPN retire les accents : écris les noms avec leur orthographe exacte (Jokić, Dončić, Porziņģis, Salaün)."]
    print("\n".join(out))
    if a.json:
        json.dump({"jour": str(jour), "lu_a": maintenant.isoformat(), "matchs": matchs}, open(a.json, "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
