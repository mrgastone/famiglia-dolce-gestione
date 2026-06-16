# Famiglia Dolce — Regole del progetto

App PWA (React + Vite + Tailwind) per gestire le **colazioni** della famiglia, in italiano,
ottimizzata per iPad/iPhone in cucina (la usa anche la governante). Live su GitHub Pages:
`mrgastone/famiglia-dolce-gestione` → https://mrgastone.github.io/famiglia-dolce-gestione/

> **Scopo di questo file:** raccogliere TUTTE le regole così che ogni mese si possa
> **rigenerare** il piano colazioni in base alla **stagione** e ai **prodotti disponibili**,
> mantenendo gli stessi principi nutrizionali e di sicurezza.

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
- **Ogni cosa da preparare = un oggetto in `preparazioni`** con i SUOI `ingredienti`
  (frullato + albumi = 2 preparazioni → 2 riquadri → 2 video).
- `etichetta` con articolo; `plurale: true` se plurale. Genera "Guarda come si
  prepara/preparano {etichetta}" (un video **alla fine di ogni** preparazione, allineato a sinistra).
- **Uova e albumi → a NUMERO** (`"n"`), NON in grammi. Tutto il resto **in grammi** (`"g"`).
- `prodotto` = chiave di `prodotti.json` (serve per la spesa).
- **Bevande/liquidi**: indica la quantità nel testo (es. `Acqua (1 bicchiere)`, David
  `(1/2 bicchiere)`, `tè verde (1 tazza)`, `caffè d'orzo (1 tazzina)`).
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
- **Albumi**: si comprano come **uova intere da Specialità di Parma** e si separano dal tuorlo.
- **Regole FISSE** (in `spesa.json`, campo `fissi`, a prescindere dalle colazioni):
  - **Forno Mezza Rosetta**: SEMPRE `1 filone di pane integrale` + `1 filone di pane ai cereali`
    + `1 pizzetta integrale rotonda (se disponibile)`.
  - **Specialità di Parma**: oltre alle uova, sempre `Latte Alta Qualità` e
    `Mozzarella di bufala (solo al bisogno)`.
- **Olio EVO**: NON si compra, è **già in cantina** (lo compriamo tutto l'anno) →
  `giaDisponibile: true` in `prodotti.json`.
- **Link prodotto**: Amazon `amazon.it/s?k=`; Esselunga via ricerca mirata
  `google.com/search?q=… site:esselunga.it` (la ricerca interna di Esselunga porta a una pagina generica).
- **Copia WhatsApp**: solo la lista del **mercato (Montagnola)**, posizionata **sotto** quella lista.
  Online / Specialità di Parma / Mezza Rosetta NON hanno copia.
- Riquadro **"Consigli per la spesa online"** (verde diverso) sotto il giro unico: tempi medi
  (Amazon Fresh ~1 giorno, Esselunga ~2–3 giorni) → ordinare prima i prodotti a scadenza lunga.

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

## 🔁 Come rigenerare il piano il mese prossimo (checklist)

1. **Aggiorna `stagione.json`**: `etichetta` (mese · Roma), `inizioCiclo` (un lunedì), `scadenza`,
   e frutta/verdura **di stagione** di quel mese a Roma.
2. **Ricalcola l'età di David** dalla data di nascita (2022-11-30), aggiorna `profili.json` `eta`,
   e adatta porzioni/consistenze alla crescita.
3. **Riscrivi `colazioni.json`** (4 settimane × 7 giorni × 2 profili) seguendo i principi sopra:
   titoli in italiano, uova/albumi a numero, resto in grammi, `prodotto` valido, `preparazioni`
   per ogni cosa da preparare, `sicurezza` per David solo nei giorni a rischio.
   Niente ultra-processati, niente zuccheri aggiunti.
4. **Aggiorna `prodotti.json`** se compaiono nuovi ingredienti (con fornitore e scadenza).
5. `npm run build` per verificare, poi commit + push (deploy automatico).
6. La **spesa** (liste Martedì/Venerdì, +20%, quantità) si aggiorna **da sola** dai dati.
