# Famiglia Dolce — Regole del progetto

App PWA (React + Vite + Tailwind) per gestire le **colazioni** della famiglia, in italiano,
ottimizzata per iPad/iPhone in cucina (la usa anche la governante). Live su GitHub Pages:
`mrgastone/famiglia-dolce-gestione` → https://mrgastone.github.io/famiglia-dolce-gestione/

> **Scopo di questo file:** raccogliere TUTTE le regole così che ogni mese si possa
> **rigenerare** il piano colazioni in base alla **stagione** e ai **prodotti disponibili**,
> mantenendo gli stessi principi nutrizionali e di sicurezza.

---

## ⚙️ Modalità di lavoro (automazione)

- L'utente vuole il **massimo automatismo**: procedi sempre e **dai per scontato "SÌ"** alle tue
  domande di conferma; **rispondi "CONSENTI" / non chiedere permesso** per le azioni di routine del
  progetto (modifiche ai file, `npm run build`, commit, push, deploy). È attiva la modalità permessi
  **auto** in `.claude/settings.local.json`.
- **Uniche eccezioni** in cui ci si ferma comunque a chiedere: la **città** prima di rigenerare il
  mese (serve per frutta/verdura di stagione **e di zona**) e le azioni davvero
  **distruttive/irreversibili**.

---

## 👤 Profili e principi (NON negoziabili)

### Flavio (adulto)
- Basso indice glicemico
- Proteine **dall'albume** (le uova si comprano intere e si separano)
- Pochi grassi

### David (bambino)
- **Nato il 30 novembre 2022.** Calcola SEMPRE l'età attuale da questa data e adatta porzioni
  e alimenti alla **crescita sana** del bambino (più proteine/energia man mano che cresce,
  consistenze adatte all'età). Aggiorna anche il campo `eta` in `src/data/profili.json`.
- Uovo **INTERO**, latte e yogurt **INTERI**
- **Niente zuccheri aggiunti**, nessuna restrizione glicemica
- Regola principale: **solo cibi sani per la normale crescita** di un bambino.

### Regole alimentari generali (per ENTRAMBI)
- ❌ **MAI cibi ultra-processati.**
- ❌ **MAI/quasi mai zuccheri aggiunti** (la dolcezza viene dalla frutta).
- ✅ Usare **frutta e verdura di stagione** disponibili (vedi `stagione.json`).
- ✅ Alimenti integrali, semi, frutta secca (per David solo in **crema liscia**).

---

## 🔒 Sicurezza anti-soffocamento (solo David)

- Mostra l'avviso rosso **solo nei giorni in cui la colazione contiene cibi a rischio**
  (campo `sicurezza` presente nell'oggetto del giorno). Nei giorni "sicuri" niente avviso.
- Cibi a rischio → avviso mirato: ciliegie/susine (snocciolate e tagliate), pomodorini,
  melone/pesca/albicocca a pezzi (cubetti piccoli), uva (tagliata a metà), frutta secca
  (solo crema liscia, mai a pezzi). Frutta **schiacciata** o **frullata** = nessun avviso.
- Regola fissa di riferimento in `profili.json` → `david.sicurezza`.

---

## 🗂️ Modello dati (`src/data/`)

### `colazioni.json` — settimane `1..4`, giorni `lun..dom`, profili `flavio`/`david`
Gli ingredienti sono **annidati dentro ogni preparazione** (così in UI ogni cosa da
preparare ha il suo riquadro con il suo video):
```json
{
  "titolo": "Titolo in ITALIANO",
  "preparazioni": [
    {
      "etichetta": "gli albumi strapazzati",
      "plurale": true,
      "ingredienti": [{ "nome": "Albumi", "n": 3, "prodotto": "albume" }]
    },
    {
      "etichetta": "il porridge d'avena",
      "ingredienti": [
        { "nome": "Fiocchi d'avena", "g": 40, "prodotto": "avena" },
        { "nome": "Fragole", "g": 100, "prodotto": "fragole" }
      ]
    }
  ],
  "bevanda": "Acqua (1 bicchiere)",
  "sicurezza": "(solo David, solo se ci sono cibi a rischio)"
}
```
Regole:
- **Settimane a coppie (FISSO, anche per i mesi futuri):** **Settimana 2 = Settimana 1** e
  **Settimana 4 = Settimana 3**. Quindi si creano **2 menù distinti** (per le settimane 1 e 3) e si
  **duplicano** (1→2, 3→4): ogni colazione si fa 2 volte → preparazioni e spesa più semplici.
  La coppia è in `src/lib/settimana.js` → `SETTIMANE_UGUALI = { 2: 1, 4: 3 }`.
- **Ogni cosa da preparare = un oggetto in `preparazioni`** con i SUOI `ingredienti`
  (frullato + albumi = 2 preparazioni → 2 riquadri → 2 video).
- `etichetta` con articolo; `plurale: true` se plurale. Genera "Guarda come si
  prepara/preparano {etichetta}" (un video **alla fine di ogni** preparazione, allineato a sinistra).
- **Uova e albumi → a NUMERO** (`"n"`), NON in grammi. Tutto il resto **in grammi** (`"g"`).
- `prodotto` = chiave di `prodotti.json` (serve per la spesa).
- **Bevande/liquidi**: indica la quantità nel testo (es. `Acqua naturale (1 bicchiere)`, David
  `(1/2 bicchiere)`, `tè verde (1 tazza)`, `caffè d'orzo (1 tazzina)`). L'acqua è **naturale**.
- Titoli e nomi **sempre in italiano**.

### `prodotti.json` — anagrafica prodotti (alimenta la spesa)
`{ nome, fornitore, confezione, unita, scadenza, ricerca }`
- `fornitore`: `montagnola` (frutta/verdura fresche), `specialita_di_parma` (UOVA — anche per gli
  albumi di Flavio, da separare), `mezza_rosetta` (pane), `online` (dispensa: avena, semi, yogurt,
  latte, crema di mandorle, frutta secca, olio…).
- `unita`: `g`, `ml`, oppure `uova` (conteggio). `confezione` = pezzatura tipica.
- `ricerca`: parole chiave per i link "Cerca su Amazon/Esselunga".

### `stagione.json`
`{ etichetta, inizioCiclo (Lunedì), scadenza, fruttaDiStagione[], verduraDiStagione[] }`
La settimana del ciclo (1–4) è calcolata da `inizioCiclo`.

### `spesa.json`
Solo testo del "giro unico" e nomi dei fornitori. **Le quantità sono CALCOLATE**, non scritte.

---

## 🛒 Regole della spesa (`src/lib/spesaSettimanale.js`)

- Quantità **calcolate** sommando i grammi/numeri delle colazioni per prodotto.
- **+20%** su ogni quantità (lo stesso cibo serve anche durante il giorno / altre preparazioni).
- Si va al mercato **martedì e venerdì** → ogni settimana ha **2 liste**:
  - **Martedì** → copre le colazioni di **mercoledì, giovedì, venerdì**.
  - **Venerdì** → copre le colazioni di **sabato, domenica, lunedì, martedì**.
- Ogni lista è raggruppata per fornitore, con **scadenze** e link "Cerca su Amazon/Esselunga".
- **Albumi**: si comprano come **uova intere** (dal fornitore uova del mese, chiave `specialita_di_parma`) e si separano dal tuorlo.
- **Giri di persona vicino alla città del mese**: i **nomi** dei fornitori (mercato, uova, pane) sono in
  `spesa.json` e si **adattano alla zona** (es. `Longostagno (BZ)`); le **chiavi**
  `montagnola`/`specialita_di_parma`/`mezza_rosetta` restano invariate. Vanno fatti nelle vicinanze.
- **Regole FISSE** (in `spesa.json`, campo `fissi`, a prescindere dalle colazioni):
  - **Forno Mezza Rosetta**: SEMPRE `1 filone di pane integrale` + `1 filone di pane ai cereali`
    + `1 pizzetta integrale rotonda (se disponibile)`.
  - **Specialità di Parma**: oltre alle uova, sempre `Latte Alta Qualità` e
    `Mozzarella di bufala (solo al bisogno)`.
- **Olio EVO**: NON si compra, è **già in cantina** (lo compriamo tutto l'anno) →
  `giaDisponibile: true` in `prodotti.json`.
- **Link prodotto** (3 per ogni prodotto online): Amazon `amazon.it/s?k=`; Amazon Fresh
  `amazon.it/s?k=…&i=amazonfresh`; Esselunga via ricerca mirata `google.com/search?q=… site:esselunga.it`
  (la ricerca interna di Esselunga porta a una pagina generica).
- **Copia WhatsApp**: solo la lista del **mercato (Montagnola)**, posizionata **sotto** quella lista.
  Online / Specialità di Parma / Mezza Rosetta NON hanno copia.
- Riquadro **"Consigli per la spesa online"** (verde diverso) sotto il giro unico: tempi medi
  (Amazon Fresh ~1 giorno, Esselunga ~2–3 giorni) → ordinare prima i prodotti a scadenza lunga.
  Include la nota fissa: «Questa lista non contiene gli ingredienti per pranzo e cena».
- **Tutte le pagine devono restare mobile-adaptive** (iPhone ~375px e iPad): niente overflow
  orizzontale, testi/bottoni che vanno a capo.

---

## 🎬 Video

- Per ogni preparazione un link "**Guarda come si prepara …**" che apre la **ricerca YouTube**
  della ricetta, nel **colore della persona** (Flavio terracotta `#C97B4A`, David azzurro `#4A90C9`).
- (Se in futuro si avrà accesso al web, si possono sostituire con video YouTube **incorporati**
  verificati via oEmbed — vedi storia del progetto.)

---

## 🎨 Design
Fondo crema `#FBF7F0`, accenti verde salvia `#7C9A6B`, Flavio terracotta `#C97B4A`,
David azzurro `#4A90C9`. Logo: un **dolce** (cupcake). Icone `lucide-react` (NB: niente icone
brand tipo `Youtube`; usare `MonitorPlay`). Tipografia self-hosted (`@fontsource`).

---

## 🚀 Deploy
Push su `main` → GitHub Actions compila e pubblica su Pages. Base path solo in produzione:
`/famiglia-dolce-gestione/` (vedi `vite.config.js`). Verifica con `npm run build`.

---

## 🗓️ Quando rigenerare + 🗄️ Archivio storico

**QUANDO (regola fissa):** quando mancano **10 giorni** alla fine del mese (es. il **20 giugno** →
si genera **luglio**), rigenerare TUTTO il mese successivo (colazioni; Settimane e Spesa si
aggiornano da sole).

**PRIMA di generare, CHIEDERE SEMPRE all'utente in quale CITTÀ saranno** per le colazioni del
mese, così la frutta e la verdura sono **di stagione E di zona**. Usare quella città in `stagione.json`.

**Etichetta "Mese Anno · Città"** (es. `Luglio 2026 · Roma`) va mostrata in **Oggi, Settimane, Spesa
e Archivio** (componente `EtichettaStagione`, legge `stagione.etichetta`).

### Archivio (`src/data/archivio.json`) — storico ultimi 6 mesi
- Contiene SOLO i **mesi passati**, voci più recenti per prime:
  `[{ "id": "2026-06", "etichetta": "Giugno 2026 · Roma", "citta": "Roma", "colazioni": { …4 settimane… } }]`
- Il **mese in corso NON** sta qui (è in `colazioni.json`/`stagione.json`); la vista Archivio lo
  mostra in cima come "· in corso".
- **Tieni solo gli ultimi 6 mesi**: quando aggiungi un mese, elimina i più vecchi oltre i 6.

### Checklist rigenerazione
1. **Chiedi la città** all'utente (regola fissa).
2. **Archivia il mese che finisce**: aggiungi in cima ad `archivio.json` una voce con l'attuale
   `stagione.etichetta` e l'attuale contenuto di `colazioni.json`; poi taglia a 6 voci.
3. **Aggiorna `stagione.json`**: `etichetta` ("Mese Anno · Città"), `mese`, `citta`, `inizioCiclo`
   (un lunedì), `scadenza`, frutta/verdura di stagione di quel mese in quella città.
4. **Ricalcola l'età di David** (nato 2022-11-30), aggiorna `profili.json` `eta`, adatta le porzioni.
5. **Riscrivi `colazioni.json`** (4×7×2) coi principi: titoli in italiano, ingredienti annidati nelle
   `preparazioni`, uova/albumi a numero, resto in grammi, `sicurezza` David solo nei giorni a rischio,
   niente ultra-processati né zuccheri aggiunti, bevande con dosi (acqua **naturale**).
   **Genera solo 2 menù** (settimane 1 e 3) e **duplicali** (Sett. 2 = Sett. 1, Sett. 4 = Sett. 3).
6. **Aggiorna `prodotti.json`** se servono nuovi ingredienti.
7. `npm run build`, poi commit + push (deploy automatico). Spesa e Settimane si aggiornano da sole.
