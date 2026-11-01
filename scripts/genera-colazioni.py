# -*- coding: utf-8 -*-
"""Generatore delle colazioni (Famiglia Dolce).

Uso:  python scripts/genera-colazioni.py
Scrive il menu LIVE (src/data/colazioni.json) e gli snapshot in src/data/_staging/.

Ogni mese si aggiunge/aggiorna una voce in MENU (citta + stagione + frutta per giorno).
REGOLA (CLAUDE.md): ogni preparazione e' una RICETTA VERA e VERIFICATA su fonti reali,
mai una combinazione inventata. Prima di aggiungere frutta/verdure nuove a una ricetta,
verificare che la combinazione esista (ricerca web) e annotare le fonti nel report.
"""
import json, copy, os

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'data') + os.sep
GIORNI = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom']

# ---- helper ingredienti ----
def ig(nome, prodotto, g=None, n=None, ml=None):
    o = {"nome": nome}
    if g is not None: o["g"] = g
    if n is not None: o["n"] = n
    if ml is not None: o["ml"] = ml
    if prodotto: o["prodotto"] = prodotto
    return o

FRUTTO_NOME = {
    'pesche': 'Pesche', 'susine': 'Susine', 'more': 'More', 'uva': 'Uva', 'fichi': 'Fichi',
    'lamponi': 'Lamponi', 'mirtilli': 'Mirtilli', 'banana': 'Banana', 'mele': 'Mele', 'pere': 'Pere',
    'kiwi': 'Kiwi', 'cachi': 'Cachi', 'clementine': 'Clementine',
}
BACCHE = ('more', 'mirtilli', 'lamponi')

def fr(k, g):
    return ig(FRUTTO_NOME[k], k, g=g)

# ---- sicurezza David (anti-soffocamento) ----
def sicurezza_david(frutti, note_extra=None):
    parti = []
    for f in frutti:
        if f == 'uva': parti.append("uva tagliata a metà (o in quattro), mai intera")
        elif f in BACCHE: parti.append(f"{FRUTTO_NOME[f].lower()} schiacciat" + ('e' if f != 'mirtilli' else 'i') + " o tagliati, mai interi")
        elif f == 'mele': parti.append("mela grattugiata o cotta, mai a pezzi crudi")
        elif f == 'cachi': parti.append("cachi ben maturo, a cucchiaio o a pezzetti piccoli")
        elif f == 'clementine': parti.append("clementine pelate a vivo, senza semi né pellicine, a pezzetti piccoli (mai spicchi interi)")
        elif f in ('pesche', 'susine', 'fichi', 'pere', 'kiwi'): parti.append(f"{FRUTTO_NOME[f].lower()} a pezzetti piccoli")
    if note_extra: parti.append(note_extra)
    seen = set(); out = []
    for p in parti:
        if p not in seen: seen.add(p); out.append(p)
    if not out: return None
    s = "; ".join(out)
    return s[0].upper() + s[1:] + "."

def join_it(items):
    items = [x for x in items if x]
    if not items: return ''
    if len(items) == 1: return items[0]
    return ', '.join(items[:-1]) + ' e ' + items[-1]

# ==================== ISTRUZIONI (metodi delle ricette standard) ====================
def frutti_di(ings):
    return [i for i in ings if i.get('prodotto') in FRUTTO_NOME]

def taglio(i, child):
    """Come si serve un frutto (nome + taglio), sicuro per David."""
    k, n = i['prodotto'], i['nome']
    if k == 'uva': return f"{n} (acini tagliati a metà)" if child else n
    if k in BACCHE: return f"{n} schiacciate" if child else n
    if k == 'mele': return f"{n} grattugiata"
    if k == 'cachi': return f"{n} ben maturo, a cucchiaio" if child else f"{n} a pezzetti"
    if k == 'clementine': return f"{n} pelate a vivo (senza semi né pellicine) e tagliate a pezzetti piccoli" if child else f"{n} a spicchi"
    if k == 'pere': return f"{n} a fettine sottili" if not child else f"{n} a pezzetti piccoli"
    return f"{n} a pezzetti piccoli" if child else f"{n} a pezzetti"

def istr(profilo, et, ings):
    et = et.lower()
    child = profilo == 'david'
    fr_ = frutti_di(ings)
    ha = lambda p: any(i.get('prodotto') == p for i in ings)
    if 'burro di arachidi' in et and 'banana' in et:
        lato = [taglio(i, child) for i in fr_ if i['prodotto'] != 'banana']
        s = ["Tosta leggermente le fette di pane integrale (tostapane, padella o forno).",
             "Spalma il burro di arachidi 100% sul pane in uno strato sottile.",
             "Taglia la banana a rondelle e disponile sopra il burro di arachidi."]
        if lato: s.append(f"Servi con {join_it(lato)} a lato.")
        if child: s.append("Per David: burro di arachidi spalmato sottile, mai a cucchiaiate; banana a fettine sottili.")
        return s
    if 'hummus' in et:
        s = ["Tosta leggermente il pane integrale.",
             "Spalma l'hummus di ceci sul pane (opzionale: se manca, va bene anche solo la verdura con un filo d'olio)."]
        if ha('spinaci'):
            s.append("Lava e asciuga gli spinaci novelli e disponili crudi sull'hummus; completa con un filo d'olio extravergine.")
        else:
            s.append("Aggiungi il pomodoro a fette, un filo d'olio extravergine e il basilico spezzettato.")
        s.append("Hummus 100% ceci senza additivi, o fatto in casa (ceci lessati frullati con limone e un filo d'olio).")
        return s
    if 'avocado' in et:
        s = ["Tosta leggermente le fette di pane integrale.",
             "Spalma la ricotta sul pane (dà le proteine, visto che qui non c'è l'uovo).",
             "Schiaccia l'avocado con una forchetta e distribuiscilo sopra la ricotta."]
        if ha('pomodoro'): s.append("Completa con il pomodoro a fettine sottili.")
        if child: s.append("Per David: avocado ben schiacciato, ricotta liscia, pane" + (" e pomodoro" if ha('pomodoro') else "") + " a pezzetti piccoli. NON mettere MAI uovo e avocado insieme (l'uovo è un altro giorno).")
        return s
    if 'frittelle' in et:
        altra = [taglio(i, child) for i in fr_ if i['prodotto'] != 'banana']
        return ["Schiaccia la banana con una forchetta in una ciotola.",
                "Unisci l'uovo, i fiocchi d'avena e il latte; mescola fino a un impasto morbido.",
                "Scalda un filo d'olio in padella antiaderente e cuoci piccole frittelle, 1–2 minuti per lato.",
                f"Servi con {join_it(altra)}." if altra else "Servi tiepide."]
    if 'toast' in et and 'ricotta' in et:
        return ["Tosta leggermente il pane integrale.",
                "Spalma la ricotta sul pane.",
                f"Completa con {join_it([taglio(i, child) for i in fr_])}." if fr_ else "Servi."]
    if 'frullato' in et:
        liq = "il latte" if ha('latte_intero') else ("la bevanda di soia" if ha('soia') else "un po' d'acqua")
        yog = ", lo yogurt" if any(i.get('prodotto', '').startswith('yogurt') for i in ings) else ""
        nomi = join_it([i['nome'] for i in fr_])
        if ha('avena'):
            return ["La sera prima ammolla i fiocchi d'avena in un po' di latte, in frigo.",
                    f"Al mattino sbuccia e taglia a pezzi {nomi}; mettili nel frullatore con i fiocchi ammollati{yog} e {liq}.",
                    "Frulla fino a una bevanda liscia e omogenea; servi subito."]
        semi = " e i semi di chia" if ha('chia') else ""
        return [f"Sbuccia e taglia a pezzi {nomi}.",
                f"Mettili nel frullatore con {liq}{semi}.",
                "Frulla fino a una bevanda liscia e omogenea; servi subito."]
    if 'overnight' in et or 'ammollata' in et:
        liq = 'la bevanda di soia' if ha('soia') else ('lo yogurt intero' if ha('yogurt_intero') else 'lo yogurt')
        mele = [i for i in fr_ if i['prodotto'] == 'mele']
        altri = [taglio(i, child) for i in fr_ if i['prodotto'] != 'mele']
        sera = f"La sera prima: in un barattolo mescola i fiocchi d'avena con {liq}" + (" e i semi di chia" if ha('chia') else "")
        if mele: sera += " e la mela grattugiata"
        s = [sera + ".", "Chiudi e lascia in frigorifero tutta la notte (almeno 8 ore)."]
        fin = list(altri)
        if ha('crema_arachidi'): fin.append("il burro di arachidi")
        s.append("Al mattino mescola" + (f" e completa con {join_it(fin)}." if fin else " e servi."))
        return s
    if 'porridge' in et or ('crema' in et and 'latte' in et):
        latte = 'crema' in et and 'latte' in et
        mele = [i for i in fr_ if i['prodotto'] == 'mele']
        altri = [taglio(i, child) for i in fr_ if i['prodotto'] != 'mele']
        s = ["Scalda il latte in un pentolino senza farlo bollire." if latte else "Versa i fiocchi d'avena nel pentolino con l'acqua indicata."]
        if latte: s.append("Unisci i fiocchi d'avena.")
        if mele: s.append("Grattugia la mela e uniscila all'avena, così cuoce insieme.")
        s.append("Cuoci a fuoco basso 4–5 minuti mescolando, fino a una crema.")
        fin = list(altri)
        semi = [i['nome'] for i in ings if i.get('prodotto') in ('lino', 'chia', 'mandorle', 'noci')]
        if semi: fin.append(join_it(semi))
        if ha('crema_arachidi') or ha('crema_mandorle'): fin.append("il burro di arachidi (mescolato, liscio)")
        if fin: s.append("Fuori dal fuoco completa con " + join_it(fin) + ".")
        return s
    if 'albumi sodi' in et:
        return ["Rassoda le uova in acqua bollente per circa 9 minuti.",
                "Raffredda sotto acqua fredda, sguscia e tieni solo gli albumi."]
    if 'albumi strapazzati' in et:
        if ha('spinaci'):
            return ["Lava gli spinaci, falli appassire in padella 2–3 minuti, strizzali e tritali.",
                    "Separa gli albumi dai tuorli (tieni solo gli albumi).",
                    "Scalda l'olio in padella antiaderente, versa gli albumi e mescola a fuoco medio finché rappresi ma morbidi.",
                    "Unisci gli spinaci, mescola e servi caldo."]
        s = ["Separa gli albumi dai tuorli (tieni solo gli albumi).",
             "Scalda un filo d'olio in padella antiaderente.",
             "Versa gli albumi e mescola a fuoco medio finché rappresi ma morbidi."]
        verd = [i['nome'] for i in ings if i.get('prodotto') in ('pomodoro', 'cetriolo', 'zucchine')]
        if verd: s.append(f"Unisci {join_it(verd)} a pezzetti e insaporisci con basilico/origano.")
        return s
    if 'uovo strapazzato' in et:
        if ha('spinaci'):
            s = ["Lava gli spinaci e falli appassire 2–3 minuti in padella con il filo d'olio" + (", poi tritali finemente." if child else "."),
                 "Sbatti l'uovo intero in una ciotola e versalo sugli spinaci.",
                 "Mescola a fuoco medio fino a ottenere un uovo cremoso e ben cotto.",
                 "Servi con il pane integrale" + (" a pezzetti piccoli." if child else ".")]
            return s
        acc = [i['nome'] for i in ings if i.get('prodotto') in ('pomodoro', 'pane_integrale')]
        s = ["Sbatti l'uovo intero in una ciotola.",
             "Scalda un filo d'olio in padella e versa l'uovo, mescolando a fuoco medio fino a cremoso."]
        if acc: s.append(f"Servi con {join_it(acc)}" + (" a pezzetti piccoli." if child else " a pezzetti."))
        return s
    if 'piatto' in et:
        return [f"Disponi {join_it([taglio(i, child) for i in fr_])} in una ciotola.",
                "Completa con le noci tritate grossolanamente."]
    return ["Prepara unendo tutti gli ingredienti indicati."]

def prep(et, ings, plurale=False):
    p = {"etichetta": et}
    if plurale: p["plurale"] = True
    p["ingredienti"] = ings
    p["istruzioni"] = None
    return p

# ==================== DAVID (dosi per la crescita) ====================
def david_giorno(day, f, stagione):
    if day == 'lun':
        c = prep("la crema d'avena nel latte", [ig("Fiocchi d'avena", "avena", g=35), ig("Latte intero", "latte_intero", ml=140), fr(f['lun'], 60), ig("Burro di arachidi", "crema_arachidi", g=10)])
        return {"titolo": f"Crema d'avena nel latte con {FRUTTO_NOME[f['lun']].lower()}", "preparazioni": [c],
                "bevanda": "Acqua naturale (1/2 bicchiere)", "sicurezza": sicurezza_david([f['lun']], "burro di arachidi liscio, mai a pezzi")}
    if day == 'mar':
        if stagione == 'estate':
            c = prep("il pane integrale con avocado, ricotta e pomodoro", [ig("Pane integrale", "pane_integrale", g=40), ig("Ricotta", "ricotta", g=40), ig("Avocado", "avocado", g=45), ig("Pomodoro", "pomodoro", g=30)])
            return {"titolo": "Avocado toast con ricotta e pomodoro", "preparazioni": [c], "bevanda": "Latte intero (1 bicchiere)",
                    "sicurezza": "Avocado ben schiacciato o a fettine sottili; ricotta liscia; pane e pomodoro a pezzetti piccoli. Mai uovo e avocado insieme."}
        c = prep("il pane integrale con avocado e ricotta", [ig("Pane integrale", "pane_integrale", g=40), ig("Ricotta", "ricotta", g=40), ig("Avocado", "avocado", g=45)])
        return {"titolo": "Avocado toast con ricotta", "preparazioni": [c], "bevanda": "Latte intero (1 bicchiere)",
                "sicurezza": "Avocado ben schiacciato o a fettine sottili; ricotta liscia; pane a pezzetti piccoli. Mai uovo e avocado insieme."}
    if day == 'mer':
        c = prep("lo yogurt intero con avena ammollata (overnight)", [ig("Yogurt intero", "yogurt_intero", g=130), ig("Fiocchi d'avena (ammollati)", "avena", g=25), fr(f['mer'], 60), ig("Burro di arachidi", "crema_arachidi", g=10)])
        return {"titolo": f"Yogurt intero overnight con {FRUTTO_NOME[f['mer']].lower()}", "preparazioni": [c],
                "bevanda": "Acqua naturale (1/2 bicchiere)", "sicurezza": sicurezza_david([f['mer']], "burro di arachidi liscio, mai a pezzi")}
    if day == 'gio':
        a, b = f['gio']
        c1 = prep("il frullato di yogurt e avena", [ig("Yogurt intero", "yogurt_intero", g=120), ig("Fiocchi d'avena (ammollati)", "avena", g=20), fr(a, 80), ig("Latte intero", "latte_intero", ml=40)])
        c2 = prep("il toast di ricotta e frutta", [ig("Pane integrale", "pane_integrale", g=30), ig("Ricotta", "ricotta", g=40), fr(b, 40)])
        return {"titolo": "Frullato di yogurt e avena + toast di ricotta", "preparazioni": [c1, c2],
                "bevanda": "Acqua naturale (1/2 bicchiere)", "sicurezza": sicurezza_david([a, b])}
    if day == 'ven':
        if stagione == 'estate':
            c = prep("l'uovo strapazzato", [ig("Uovo intero", "uovo", n=1), ig("Pomodoro", "pomodoro", g=40), ig("Pane integrale", "pane_integrale", g=35), ig("Olio extravergine d'oliva (per cuocere)", "olio_evo", ml=5)])
            return {"titolo": "Uovo strapazzato con pomodoro e pane", "preparazioni": [c], "bevanda": "Latte intero (1 bicchiere)",
                    "sicurezza": "Pomodoro e pane a pezzetti piccoli."}
        c = prep("l'uovo strapazzato con spinaci", [ig("Uovo intero", "uovo", n=1), ig("Spinaci", "spinaci", g=30), ig("Pane integrale", "pane_integrale", g=35), ig("Olio extravergine d'oliva (per cuocere)", "olio_evo", ml=5)])
        return {"titolo": "Uovo strapazzato con spinaci e pane", "preparazioni": [c], "bevanda": "Latte intero (1 bicchiere)",
                "sicurezza": "Spinaci ben cotti e tritati finemente; uovo ben cotto; pane a pezzetti piccoli."}
    if day == 'sab':
        c = prep("le frittelle di avena e banana", [ig("Fiocchi d'avena", "avena", g=35), ig("Uovo intero", "uovo", n=1), ig("Banana", "banana", g=60), fr(f['sab'], 50), ig("Latte intero (per l'impasto)", "latte_intero", ml=30), ig("Olio extravergine d'oliva (per cuocere)", "olio_evo", ml=5)], plurale=True)
        return {"titolo": "Frittelle di avena e banana", "preparazioni": [c], "bevanda": "Latte intero (1 bicchiere)",
                "sicurezza": sicurezza_david([f['sab']])}
    if day == 'dom':
        c = prep("il toast con burro di arachidi e banana", [ig("Pane integrale", "pane_integrale", g=40), ig("Burro di arachidi 100%", "crema_arachidi", g=15), ig("Banana", "banana", g=60), fr(f['dom'], 50)])
        return {"titolo": "Toast con burro di arachidi e banana", "preparazioni": [c], "bevanda": "Latte intero (1 bicchiere)",
                "sicurezza": sicurezza_david([f['dom']], "burro di arachidi spalmato in strato sottile (mai a cucchiaiate); banana a fettine sottili")}

# ==================== FLAVIO (niente yogurt, albumi max 2 e solo lun/mer/sab) ====================
def flavio_giorno(day, f, stagione):
    a, b = f.get(day, (None, None))
    if day == 'lun':
        c1 = prep("gli albumi strapazzati", [ig("Albumi", "albume", n=2), ig("Olio extravergine d'oliva (per cuocere)", "olio_evo", ml=5)], plurale=True)
        c2 = prep("il porridge d'avena", [ig("Fiocchi d'avena (cotti in acqua)", "avena", g=40), ig("Acqua (per cuocere l'avena)", None, ml=120), fr(a, 100), ig("Mandorle", "mandorle", g=15)])
        return {"titolo": f"Albumi strapazzati e porridge con {FRUTTO_NOME[a].lower()}", "preparazioni": [c1, c2], "bevanda": "Acqua naturale (1 bicchiere) · caffè d'orzo (1 tazzina)"}
    if day == 'mar':
        c1 = prep(f"il frullato di {FRUTTO_NOME[a].lower()} e {FRUTTO_NOME[b].lower()} con soia", [fr(a, 80), fr(b, 70), ig("Bevanda di soia non zuccherata", "soia", ml=150), ig("Semi di chia", "chia", g=10)])
        return {"titolo": f"Frullato {FRUTTO_NOME[a].lower()}-{FRUTTO_NOME[b].lower()} con soia", "preparazioni": [c1], "bevanda": "Acqua naturale (1 bicchiere)"}
    if day == 'mer':
        if stagione == 'estate':
            c = prep("gli albumi strapazzati", [ig("Albumi", "albume", n=2), ig("Pomodoro", "pomodoro", g=100), ig("Cetriolo", "cetriolo", g=80), ig("Olio extravergine d'oliva", "olio_evo", ml=10), ig("Basilico", "basilico", g=2)], plurale=True)
            return {"titolo": "Albumi con pomodoro e basilico", "preparazioni": [c], "bevanda": "Acqua naturale (1 bicchiere) · tè verde (1 tazza)"}
        c = prep("gli albumi strapazzati con spinaci", [ig("Albumi", "albume", n=2), ig("Spinaci", "spinaci", g=100), ig("Olio extravergine d'oliva", "olio_evo", ml=10)], plurale=True)
        return {"titolo": "Albumi strapazzati con spinaci", "preparazioni": [c], "bevanda": "Acqua naturale (1 bicchiere) · tè verde (1 tazza)"}
    if day == 'gio':
        c = prep("il porridge d'avena", [ig("Fiocchi d'avena", "avena", g=40), ig("Acqua (per cuocere l'avena)", None, ml=120), fr(a, 100), ig("Semi di lino macinati", "lino", g=10)])
        return {"titolo": f"Porridge d'avena con {FRUTTO_NOME[a].lower()}", "preparazioni": [c], "bevanda": "Soia non zuccherata (1 bicchiere)"}
    if day == 'ven':
        if stagione == 'estate':
            c = prep("il pane integrale con pomodoro e hummus", [ig("Pane integrale", "pane_integrale", g=60), ig("Pomodoro", "pomodoro", g=100), ig("Hummus di ceci (opzionale)", "hummus", g=40), ig("Olio extravergine d'oliva", "olio_evo", ml=5), ig("Basilico", "basilico", g=2)])
            return {"titolo": "Pane integrale con pomodoro e hummus", "preparazioni": [c], "bevanda": "Acqua naturale (1 bicchiere) · tè verde (1 tazza)"}
        c = prep("il toast con hummus e spinaci", [ig("Pane integrale", "pane_integrale", g=60), ig("Hummus di ceci (opzionale)", "hummus", g=40), ig("Spinaci novelli (crudi)", "spinaci", g=30), ig("Olio extravergine d'oliva", "olio_evo", ml=5)])
        return {"titolo": "Toast con hummus e spinaci", "preparazioni": [c], "bevanda": "Acqua naturale (1 bicchiere) · tè verde (1 tazza)"}
    if day == 'sab':
        c1 = prep("gli albumi strapazzati", [ig("Albumi", "albume", n=2), ig("Olio extravergine d'oliva (per cuocere)", "olio_evo", ml=5)], plurale=True)
        c2 = prep(f"il piatto di {FRUTTO_NOME[a].lower()} e noci", [fr(a, 80), ig("Noci", "noci", g=20)])
        return {"titolo": f"Albumi strapazzati con {FRUTTO_NOME[a].lower()} e noci", "preparazioni": [c1, c2], "bevanda": "Acqua naturale (1 bicchiere)"}
    if day == 'dom':
        c1 = prep("l'avena ammollata con soia e chia (overnight oats)", [ig("Fiocchi d'avena (ammollati)", "avena", g=40), ig("Bevanda di soia non zuccherata (per ammollare)", "soia", ml=120), ig("Semi di chia", "chia", g=10), fr(a, 100)])
        c2 = prep("il frullato di frutta con soia", [fr(a, 60), fr(b, 40), ig("Bevanda di soia non zuccherata", "soia", ml=100)])
        return {"titolo": f"Avena overnight con soia e {FRUTTO_NOME[a].lower()} + frullato", "preparazioni": [c1, c2], "bevanda": "Acqua naturale (1 bicchiere)"}

# ==================== MENU per citta' / stagione ====================
# David: lun/mer/sab/dom = un frutto; gio = (frutto del frullato, frutto del toast di ricotta)
# Flavio: (a, b) per giorno — lun/gio/sab usano solo a
MENU = {
    'longostagno': {'stagione': 'estate',
        'david': {'1': {'lun': 'pesche', 'mer': 'mirtilli', 'gio': ('pesche', 'more'), 'sab': 'more', 'dom': 'uva'},
                  '3': {'lun': 'more', 'mer': 'lamponi', 'gio': ('fichi', 'mirtilli'), 'sab': 'mirtilli', 'dom': 'pesche'}},
        'flavio': {'1': {'lun': ('susine', None), 'mar': ('more', 'lamponi'), 'gio': ('fichi', None), 'sab': ('lamponi', None), 'dom': ('uva', 'lamponi')},
                   '3': {'lun': ('more', None), 'mar': ('pesche', 'uva'), 'gio': ('susine', None), 'sab': ('mirtilli', None), 'dom': ('pesche', 'more')}}},
    'roma-settembre': {'stagione': 'estate',
        'david': {'1': {'lun': 'pere', 'mer': 'more', 'gio': ('pere', 'more'), 'sab': 'more', 'dom': 'uva'},
                  '3': {'lun': 'pesche', 'mer': 'lamponi', 'gio': ('fichi', 'pere'), 'sab': 'lamponi', 'dom': 'pere'}},
        'flavio': {'1': {'lun': ('susine', None), 'mar': ('more', 'lamponi'), 'gio': ('fichi', None), 'sab': ('lamponi', None), 'dom': ('uva', 'lamponi')},
                   '3': {'lun': ('pere', None), 'mar': ('pesche', 'uva'), 'gio': ('pere', None), 'sab': ('more', None), 'dom': ('pere', 'more')}}},
    # Ottobre 2026 (05/10 -> 08/11) — ricette verificate il 05/10/2026:
    # porridge alla mela grattugiata / alle pere, overnight oats mela / pere, frullato kiwi-mela
    # con soia, toast ricotta e pere, avocado toast con ricotta, uova e albumi con spinaci,
    # toast hummus e spinaci. Niente pomodoro/basilico (fuori stagione). Niente banana per
    # Flavio (IG medio, ci sono alternative a IG basso).
    'roma-ottobre': {'stagione': 'autunno',
        'david': {'1': {'lun': 'pere', 'mer': 'mele', 'gio': ('kiwi', 'pere'), 'sab': 'uva', 'dom': 'cachi'},
                  '3': {'lun': 'mele', 'mer': 'pere', 'gio': ('kiwi', 'pere'), 'sab': 'cachi', 'dom': 'uva'}},
        'flavio': {'1': {'lun': ('pere', None), 'mar': ('kiwi', 'mele'), 'gio': ('mele', None), 'sab': ('uva', None), 'dom': ('mele', 'kiwi')},
                   '3': {'lun': ('mele', None), 'mar': ('kiwi', 'mele'), 'gio': ('pere', None), 'sab': ('cachi', None), 'dom': ('mele', 'kiwi')}}},
    # Novembre 2026 (02/11 -> 30/11) — stagione verificata l'01/11/2026 (Altroconsumo, Eataly,
    # Panierebio, Viversano): mele, pere, kiwi, cachi, clementine/mandarini (pieni nella 2a metà),
    # arance, melagrana, castagne. Uva esclusa (disponibilità variabile a novembre).
    # Ricette verificate in piu' rispetto a ottobre: porridge con kiwi (Migusto, Enjoy Dolcefrutta,
    # Fidelity Cucina). Scartato: frullato kiwi-arancia con soia (nessun riscontro esatto).
    # Clementine a David: pelate a vivo, senza semi/pellicine, a pezzetti (fonti pediatriche).
    'roma-novembre': {'stagione': 'autunno',
        'david': {'1': {'lun': 'mele', 'mer': 'pere', 'gio': ('kiwi', 'pere'), 'sab': 'cachi', 'dom': 'kiwi'},
                  '3': {'lun': 'pere', 'mer': 'mele', 'gio': ('kiwi', 'pere'), 'sab': 'clementine', 'dom': 'cachi'}},
        'flavio': {'1': {'lun': ('mele', None), 'mar': ('kiwi', 'mele'), 'gio': ('kiwi', None), 'sab': ('pere', None), 'dom': ('mele', 'kiwi')},
                   '3': {'lun': ('pere', None), 'mar': ('kiwi', 'mele'), 'gio': ('mele', None), 'sab': ('clementine', None), 'dom': ('mele', 'kiwi')}}},
}

def build_week(chiave, variant):
    cfg = MENU[chiave]
    return {day: {'flavio': flavio_giorno(day, cfg['flavio'][variant], cfg['stagione']),
                  'david': david_giorno(day, cfg['david'][variant], cfg['stagione'])} for day in GIORNI}

def genera_mese(chiave):
    m = {'1': build_week(chiave, '1'), '3': build_week(chiave, '3')}
    for w in m.values():
        for d in w.values():
            for prof, cz in d.items():
                for p in cz['preparazioni']:
                    p['istruzioni'] = istr(prof, p['etichetta'], p['ingredienti'])
    m['2'] = copy.deepcopy(m['1'])   # Settimana 2 = Settimana 1
    m['4'] = copy.deepcopy(m['3'])   # Settimana 4 = Settimana 3
    return {k: m[k] for k in ('1', '2', '3', '4')}

def scrivi(path, obj):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(obj, fh, ensure_ascii=False, indent=2)

LIVE = 'roma-novembre'         # menu attivo
if __name__ == '__main__':
    os.makedirs(BASE + '_staging', exist_ok=True)
    live = genera_mese(LIVE)
    scrivi(BASE + 'colazioni.json', live)
    scrivi(BASE + '_staging/roma-colazioni.json', live)
    scrivi(BASE + '_staging/longostagno-renon-bz-colazioni.json', genera_mese('longostagno'))

    # ---- controlli delle regole ----
    w1 = live['1']
    yog = sum(1 for d in GIORNI if any(any(i.get('prodotto') in ('yogurt_intero', 'yogurt_greco') for i in p['ingredienti']) for p in w1[d]['david']['preparazioni']))
    flav_yog = any(i.get('prodotto', '').startswith('yogurt') for w in live.values() for d in w.values() for p in d['flavio']['preparazioni'] for i in p['ingredienti'])
    alb = sum(1 for d in GIORNI if any(any(i.get('prodotto') == 'albume' for i in p['ingredienti']) for p in w1[d]['flavio']['preparazioni']))
    alb_max = max(i['n'] for w in live.values() for d in w.values() for p in d['flavio']['preparazioni'] for i in p['ingredienti'] if i.get('prodotto') == 'albume')
    mar_uovo = any(i.get('prodotto') == 'uovo' for i in w1['mar']['david']['preparazioni'][0]['ingredienti'])
    no_istr = sum(1 for w in live.values() for d in w.values() for prof in d.values() for p in prof['preparazioni'] if not p.get('istruzioni'))
    banana_flavio = any(i.get('prodotto') == 'banana' for w in live.values() for d in w.values() for p in d['flavio']['preparazioni'] for i in p['ingredienti'])
    print(f"[{LIVE}] David yogurt giorni/sett: {yog} (max 2) | Flavio yogurt: {flav_yog} | albumi giorni: {alb} (max 3), max per pasto: {alb_max}")
    print(f"[{LIVE}] avocado+uovo martedi: {mar_uovo} | prep senza istruzioni: {no_istr} | banana per Flavio: {banana_flavio} | 2==1 {live['2']==live['1']} 4==3 {live['4']==live['3']}")
