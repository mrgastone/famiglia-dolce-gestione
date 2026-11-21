# -*- coding: utf-8 -*-
"""Controllo delle REGOLE delle colazioni (Famiglia Dolce) — vedi CLAUDE.md.

Uso:
  python scripts/controlla-colazioni.py                  # menù in corso + mese dopo (se pronto)
  python scripts/controlla-colazioni.py --elenco         # idem, con l'elenco delle colazioni
  python scripts/controlla-colazioni.py <colazioni.json> <stagione.json>

Esce con codice 1 se trova ERRORI (gli AVVISI non bloccano). Lo lancia anche il generatore.
"""
import json, os, re, sys
from datetime import date

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'data')
GIORNI = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom']
SETTIMANE = ['1', '2', '3', '4']


def leggi(p):
    with open(p, encoding='utf-8') as fh:
        return json.load(fh)


PRODOTTI = leggi(os.path.join(DATA, 'prodotti.json'))

# Zuccheri aggiunti / ultra-processati: parole vietate nei nomi di ingredienti e prodotti
VIETATI = ('zucchero', 'miele', 'marmellata', 'confettura', 'biscott', 'cioccolat', 'nutella',
           'sciroppo', 'merendin', 'cornflakes', 'soffiat', 'dolcificante', 'crema spalmabile')
LATTICINI = ('yogurt_intero', 'yogurt_greco', 'latte_intero', 'ricotta')
# Flavio: frutta a IG basso; IG medio = avviso (ammessa solo se non c'è alternativa)
IG_BASSO = {'mele', 'pere', 'kiwi', 'arance', 'clementine', 'mandarini', 'more', 'mirtilli', 'lamponi',
            'fragole', 'ribes', 'pesche', 'susine', 'ciliegie', 'albicocche'}
IG_MEDIO = {'uva', 'fichi', 'cachi', 'melone'}
FRUTTA = IG_BASSO | IG_MEDIO | {'banana'}
# David: cibi che richiedono l'avviso di sicurezza anti-soffocamento
A_RISCHIO = FRUTTA - {'banana'} | {'pomodoro', 'crema_arachidi', 'spinaci', 'avocado'}
AGRUMI = {'arance', 'clementine', 'mandarini'}
# Fuori stagione ma imposti da regole FISSE del menù di David
ECCEZIONI_STAGIONE = {'banana': 'banana: regola fissa (frittelle del sabato e toast della domenica di David)'}


def preps(c):
    return c.get('preparazioni') or []


def ings(c):
    return [i for p in preps(c) for i in (p.get('ingredienti') or [])]


def prod(c):
    return {i['prodotto'] for i in ings(c) if i.get('prodotto')}


def testo(c):
    parti = [c.get('titolo', '')]
    for p in preps(c):
        parti.append(p.get('etichetta', ''))
        parti += [i.get('nome', '') for i in p.get('ingredienti') or []]
        parti += p.get('istruzioni') or []
    return ' '.join(parti).lower()


def senza_negazioni(s):
    # "senza zucchero", "non zuccherata", "senza zuccheri aggiunti" non sono zuccheri aggiunti
    return re.sub(r'(senza|non|zero)\s+zucc\w*(\s+aggiunt\w*)?', '', s.lower())


def tutte(M):
    for w in SETTIMANE:
        for g in GIORNI:
            yield w, g, M.get(w, {}).get(g, {})


class Controllo:
    def __init__(self, nome_menu):
        self.nome = nome_menu
        self.errori = 0
        self.avvisi = 0

    def esito(self, titolo, errori, avvisi=()):
        errori, avvisi = list(errori), list(avvisi)
        if errori:
            self.errori += len(errori)
            print(f"  ERRORE  {titolo}")
            for e in errori[:12]:
                print(f"            - {e}")
            if len(errori) > 12:
                print(f"            … e altri {len(errori) - 12}")
        else:
            print(f"  OK      {titolo}")
        for a in avvisi:
            self.avvisi += 1
            print(f"  avviso  {a}")


def controlla(nome, M, S, elenco=False):
    C = Controllo(nome)
    print(f"\n=== {nome} — {S.get('etichetta', '?')} (inizioCiclo {S.get('inizioCiclo', '?')}) ===")

    # ---------- stagione.json ----------
    err = []
    try:
        if date.fromisoformat(S['inizioCiclo']).weekday() != 0:
            err.append(f"inizioCiclo {S['inizioCiclo']} non è un lunedì")
    except Exception:
        err.append("inizioCiclo mancante o non valido")
    if not re.match(r'^[A-ZÀ-Ü][a-zà-ü]+ \d{4} · .+$', S.get('etichetta', '')):
        err.append(f"etichetta «{S.get('etichetta')}» non è nel formato «Mese Anno · Città»")
    C.esito("stagione.json: inizioCiclo di lunedì, etichetta «Mese Anno · Città»", err)

    # ---------- struttura ----------
    err = []
    for w, g, d in tutte(M):
        for pid in ('flavio', 'david'):
            if pid not in d:
                err.append(f"sett.{w} {g}: manca {pid}")
    C.esito("Struttura: 4 settimane × 7 giorni × Flavio e David", err)
    C.esito("Settimana 2 = Settimana 1 e Settimana 4 = Settimana 3",
            [] if (M.get('2') == M.get('1') and M.get('4') == M.get('3')) else ["le coppie di settimane non coincidono"])
    distinte = [w for w in ('1', '3') if M.get(w)]
    if M.get('1') == M.get('3'):
        C.esito("Due menù distinti (sett. 1 e 3)", ["sett. 1 e sett. 3 sono identiche"])

    err = []
    for w, g, d in tutte(M):
        for pid, c in d.items():
            if not c.get('titolo'): err.append(f"sett.{w} {g} {pid}: titolo mancante")
            if not preps(c): err.append(f"sett.{w} {g} {pid}: nessuna preparazione")
            if not c.get('bevanda'): err.append(f"sett.{w} {g} {pid}: bevanda mancante")
            elif 'acqua' in c['bevanda'].lower() and 'naturale' not in c['bevanda'].lower():
                err.append(f"sett.{w} {g} {pid}: l'acqua da bere va indicata come «naturale»")
            elif '(' not in c['bevanda']:
                err.append(f"sett.{w} {g} {pid}: bevanda senza dose ({c['bevanda']})")
    C.esito("Ogni colazione ha titolo, preparazioni e bevanda con dose (acqua naturale)", err)

    err = []
    for w, g, d in tutte(M):
        for pid, c in d.items():
            for p in preps(c):
                ist = p.get('istruzioni') or []
                if not p.get('etichetta'): err.append(f"sett.{w} {g} {pid}: preparazione senza etichetta")
                if not p.get('ingredienti'): err.append(f"sett.{w} {g} {pid}: «{p.get('etichetta')}» senza ingredienti")
                if len(ist) < 2 or any('unendo tutti gli ingredienti' in s for s in ist):
                    err.append(f"sett.{w} {g} {pid}: «{p.get('etichetta')}» senza istruzioni dettagliate")
    C.esito("Ogni preparazione ha etichetta, ingredienti e istruzioni passo per passo", err)

    # ---------- ingredienti, misure, prodotti ----------
    err_mis, err_prod, err_zucc = [], [], []
    for w, g, d in tutte(M):
        if w not in distinte: continue
        for pid, c in d.items():
            for i in ings(c):
                dove = f"sett.{w} {g} {pid}: {i.get('nome')}"
                misure = [k for k in ('g', 'ml', 'n') if k in i]
                if len(misure) != 1 or not (isinstance(i[misure[0]], (int, float)) and i[misure[0]] > 0):
                    err_mis.append(f"{dove} → serve UNA misura positiva (g, ml o n)")
                    continue
                k = i.get('prodotto')
                if k is None:
                    if misure[0] != 'ml' or not i.get('nome', '').lower().startswith('acqua'):
                        err_mis.append(f"{dove} → senza prodotto è ammessa solo l'acqua di rubinetto, in ml")
                    continue
                if k not in PRODOTTI:
                    err_prod.append(f"{dove} → prodotto «{k}» assente da prodotti.json")
                    continue
                atteso = {'ml': 'ml', 'uova': 'n', 'pezzi': 'n'}.get(PRODOTTI[k].get('unita'), 'g')
                if misure[0] != atteso:
                    err_mis.append(f"{dove} → va in {atteso} (unità del prodotto «{PRODOTTI[k].get('unita')}»)")
                nomi = senza_negazioni(i.get('nome', '') + ' ' + PRODOTTI[k].get('nome', ''))
                if any(v in nomi for v in VIETATI):
                    err_zucc.append(f"{dove} → zuccheri aggiunti / ultra-processato")
    C.esito("Una misura per ingrediente: liquidi in ml, uova a numero, il resto in grammi", err_mis)
    C.esito("Ogni prodotto esiste in prodotti.json (entra nella spesa)", err_prod)
    C.esito("Niente zuccheri aggiunti né ultra-processati", err_zucc)

    # ---------- DAVID ----------
    D = {(w, g): d.get('david', {}) for w, g, d in tutte(M) if w in distinte}
    err = []
    for w in distinte:
        giorni_yog = [g for g in GIORNI if prod(D[(w, g)]) & {'yogurt_intero', 'yogurt_greco'}]
        if len(giorni_yog) > 2: err.append(f"sett.{w}: yogurt {len(giorni_yog)} giorni ({', '.join(giorni_yog)}), max 2")
        for g in giorni_yog:
            if 'yogurt_greco' in prod(D[(w, g)]): err.append(f"sett.{w} {g}: yogurt greco, per David solo INTERO")
    C.esito("David: yogurt solo intero, al massimo 2 giorni a settimana", err)

    err = []
    for (w, g), c in D.items():
        for p in preps(c):
            pp = {i.get('prodotto') for i in p.get('ingredienti') or []}
            if 'avena' in pp and pp & {'yogurt_intero', 'yogurt_greco'}:
                av = [i for i in p['ingredienti'] if i.get('prodotto') == 'avena']
                if not all('ammollat' in i.get('nome', '').lower() for i in av) or \
                   not any('sera prima' in s.lower() for s in p.get('istruzioni') or []):
                    err.append(f"sett.{w} {g}: avena con lo yogurt non ammollata la sera prima")
        if any(k.startswith('latte') and k != 'latte_intero' for k in prod(c)):
            err.append(f"sett.{w} {g}: latte non intero")
        if any(k.startswith('yogurt') and k != 'yogurt_intero' for k in prod(c)):
            err.append(f"sett.{w} {g}: yogurt non intero")
    C.esito("David: avena nello yogurt sempre ammollata overnight; latte e yogurt INTERI", err)

    err = []
    for (w, g), c in D.items():
        if 'avocado' in prod(c):
            if 'uovo' in prod(c): err.append(f"sett.{w} {g}: avocado e uovo lo stesso giorno")
            for p in preps(c):
                pp = {i.get('prodotto') for i in p.get('ingredienti') or []}
                if 'avocado' in pp and 'ricotta' not in pp: err.append(f"sett.{w} {g}: avocado toast senza ricotta")
                if 'avocado' in pp and not any('mai' in s.lower() and 'uovo' in s.lower() for s in p.get('istruzioni') or []):
                    err.append(f"sett.{w} {g}: le istruzioni dell'avocado toast non ricordano «mai uovo e avocado»")
        if g == 'mar' and 'avocado' not in prod(c):
            err.append(f"sett.{w} mar: manca l'avocado toast")
    C.esito("David: avocado toast il martedì, sempre con ricotta, MAI con l'uovo", err)

    err = []
    attesi = {
        'lun': ('crema d\'avena o porridge', lambda c: 'avena' in prod(c) and ('crema' in testo(c) or 'porridge' in testo(c))),
        'mer': ('overnight nello yogurt intero', lambda c: 'overnight' in testo(c) and 'yogurt_intero' in prod(c)),
        'gio': ('frullato + toast di ricotta (riserva)', lambda c: len(preps(c)) >= 2 and 'frullato' in testo(c) and 'ricotta' in prod(c)),
        'ven': ('uovo (intero)', lambda c: 'uovo' in prod(c)),
        'sab': ('frittelle di avena e banana', lambda c: 'frittelle' in testo(c) and {'avena', 'banana'} <= prod(c)),
        'dom': ('toast con burro di arachidi e banana', lambda c: {'crema_arachidi', 'banana', 'pane_integrale'} <= prod(c)),
    }
    for (w, g), c in D.items():
        if g in attesi and not attesi[g][1](c):
            err.append(f"sett.{w} {g}: atteso {attesi[g][0]}, trovato «{c.get('titolo')}»")
    C.esito("David: struttura settimanale (lun avena · mar avocado · mer overnight · gio frullato+toast · ven uovo · sab frittelle · dom toast burro di arachidi e banana)", err)

    err = []
    for (w, g), c in D.items():
        pr = prod(c)
        sic = (c.get('sicurezza') or '').lower()
        if pr & A_RISCHIO and not sic:
            err.append(f"sett.{w} {g}: cibi a rischio ({', '.join(sorted(pr & A_RISCHIO))}) senza avviso di sicurezza")
        if 'mele' in pr:
            if 'grattugiat' not in sic and 'cott' not in sic: err.append(f"sett.{w} {g}: mela senza «grattugiata o cotta» nell'avviso")
            for p in preps(c):
                if any(i.get('prodotto') == 'mele' for i in p.get('ingredienti') or []) and \
                   not any('grattugi' in s.lower() for s in p.get('istruzioni') or []):
                    err.append(f"sett.{w} {g}: le istruzioni non dicono di grattugiare la mela")
        if pr & AGRUMI and not ('pelat' in sic and 'semi' in sic):
            err.append(f"sett.{w} {g}: agrumi senza «pelati a vivo, senza semi» nell'avviso")
        if 'uva' in pr and 'metà' not in sic:
            err.append(f"sett.{w} {g}: uva senza «tagliata a metà» nell'avviso")
        if 'crema_arachidi' in pr and 'arachidi' not in sic:
            err.append(f"sett.{w} {g}: burro di arachidi senza avviso (liscio, strato sottile)")
    C.esito("David: avviso anti-soffocamento nei giorni a rischio (mela grattugiata, agrumi pelati a vivo, uva a metà, burro di arachidi sottile)", err)

    # ---------- FLAVIO ----------
    F = {(w, g): d.get('flavio', {}) for w, g, d in tutte(M) if w in distinte}
    C.esito("Flavio: niente yogurt né latticini (al loro posto la soia)",
            [f"sett.{w} {g}: {', '.join(sorted(prod(c) & set(LATTICINI)))}" for (w, g), c in F.items() if prod(c) & set(LATTICINI)])
    C.esito("Flavio: niente banana (IG medio)",
            [f"sett.{w} {g}" for (w, g), c in F.items() if 'banana' in prod(c)])

    err = []
    for w in distinte:
        giorni_alb = []
        for g in GIORNI:
            c = F[(w, g)]
            if 'uovo' in prod(c): err.append(f"sett.{w} {g}: uovo intero (per Flavio solo albumi)")
            n = sum(i.get('n', 0) for i in ings(c) if i.get('prodotto') == 'albume')
            if n:
                giorni_alb.append(g)
                if n > 2: err.append(f"sett.{w} {g}: {n} albumi, max 2")
        if not set(giorni_alb) <= {'lun', 'mer', 'sab'}:
            err.append(f"sett.{w}: albumi anche fuori da lun/mer/sab ({', '.join(giorni_alb)})")
    C.esito("Flavio: albumi max 2 a pasto, solo lunedì, mercoledì e sabato", err)

    err = []
    attesi_f = {
        'mar': ('frullato con soia, senza albumi', lambda c: 'frullato' in testo(c) and 'soia' in prod(c) and 'albume' not in prod(c)),
        'gio': ('porridge', lambda c: 'porridge' in testo(c) and 'avena' in prod(c)),
        'ven': ('toast con hummus, senza albumi', lambda c: 'hummus' in prod(c) and 'albume' not in prod(c)),
        'dom': ('avena overnight con soia e chia + frullato', lambda c: 'overnight' in testo(c) and {'soia', 'chia'} <= prod(c)),
    }
    for (w, g), c in F.items():
        if g in attesi_f and not attesi_f[g][1](c):
            err.append(f"sett.{w} {g}: atteso {attesi_f[g][0]}, trovato «{c.get('titolo')}»")
    C.esito("Flavio: struttura (mar frullato con soia · gio porridge · ven toast con hummus · dom overnight con soia)", err)

    err, avv = [], []
    for (w, g), c in F.items():
        for k in sorted(prod(c) & FRUTTA):
            if k in IG_MEDIO: avv.append(f"Flavio sett.{w} {g}: {k} è a IG medio (ammesso solo senza alternative)")
            elif k not in IG_BASSO: err.append(f"sett.{w} {g}: {k} non è a basso indice glicemico")
    C.esito("Flavio: frutta a basso indice glicemico", err, avv)

    # ---------- stagionalità ----------
    stag = {s.lower() for s in (S.get('fruttaDiStagione') or []) + (S.get('verduraDiStagione') or [])}
    usati = set()
    for w, g, d in tutte(M):
        for c in d.values():
            usati |= {k for k in prod(c) if PRODOTTI.get(k, {}).get('fornitore') == 'montagnola'}
    err, avv = [], []
    for k in sorted(usati):
        nome = PRODOTTI[k].get('nome', k).lower()
        if nome in stag or k in stag:
            continue
        if k in ECCEZIONI_STAGIONE:
            avv.append(f"fuori stagione per regola fissa — {ECCEZIONI_STAGIONE[k]}")
        else:
            err.append(f"{PRODOTTI[k].get('nome', k)} non è fra frutta/verdura di stagione di {S.get('etichetta')}")
    C.esito("Frutta e verdura fresche tutte di stagione (stagione.json)", err, avv)
    print(f"  frutta e verdura usate: {', '.join(sorted(PRODOTTI[k]['nome'] for k in usati))}")

    if elenco:
        for w in distinte:
            print(f"\n  — Settimana {w} (= {'2' if w == '1' else '4'}) —")
            for g in GIORNI:
                d = M[w][g]
                print(f"  {g}  Flavio: {d['flavio']['titolo']}")
                print(f"       David:  {d['david']['titolo']}")

    print(f"  → {C.errori} errori, {C.avvisi} avvisi")
    return C.errori


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    elenco = '--elenco' in sys.argv
    if len(args) == 2:
        tot = controlla(os.path.basename(args[0]), leggi(args[0]), leggi(args[1]), elenco)
    else:
        tot = controlla('MENÙ IN CORSO', leggi(os.path.join(DATA, 'colazioni.json')),
                        leggi(os.path.join(DATA, 'stagione.json')), elenco)
        pc = os.path.join(DATA, 'prossimo', 'colazioni.json')
        ps = os.path.join(DATA, 'prossimo', 'stagione.json')
        col_p = leggi(pc) if os.path.exists(pc) else {}
        stag_p = leggi(ps) if os.path.exists(ps) else {}
        if col_p and stag_p:
            tot += controlla('MESE DOPO (parte da solo)', col_p, stag_p, elenco)
        elif col_p or stag_p:
            tot += 1
            print("\n  ERRORE  src/data/prossimo/: c'è " + ("colazioni.json ma manca stagione.json" if col_p else
                  "stagione.json ma manca colazioni.json") + " → l'app ignorerebbe il mese dopo")
        else:
            print("\n(nessun mese dopo in src/data/prossimo/)")
    print(f"\nTOTALE ERRORI: {tot}")
    sys.exit(1 if tot else 0)
