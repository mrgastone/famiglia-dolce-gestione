# 🌿 Famiglia Dolce · Colazioni

Cruscotto per gestire le **colazioni della famiglia**, pensato per essere consultato
su **iPad/iPhone** in cucina (anche dalla governante).

- **Oggi** — la colazione del giorno per Flavio e David, con riquadro di sicurezza
  anti-soffocamento per il bambino.
- **Settimane** — il piano completo delle 4 settimane a rotazione.
- **Spesa** — fornitori, giro unico in zona Montagnola, prodotti online.

Interfaccia interamente in **italiano**. È una **PWA**: si può «Aggiungere a schermata
Home» e si apre a schermo intero come un'app.

> **App live:** https://mrgastone.github.io/famiglia-dolce-gestione/
> _(disponibile dopo il primo deploy — vedi sotto)_

---

## 🧩 Stack

- **React + Vite** — interfaccia veloce e modulare
- **Tailwind CSS** — design minimalista e «sano»
- **lucide-react** — icone
- **vite-plugin-pwa** — manifest + service worker per l'uso offline e a schermo intero
- **GitHub Pages + GitHub Actions** — deploy automatico ad ogni push su `main`

---

## ▶️ Avvio in locale

Serve [Node.js](https://nodejs.org/) 18+ installato.

```bash
npm install          # installa le dipendenze
npm run dev          # avvia in sviluppo (http://localhost:5173/)
npm run build        # crea la versione di produzione in dist/
npm run preview      # anteprima della build di produzione
npm run genera-icone # rigenera le icone PNG della PWA (dal motivo a foglia)
```

> Nota: in **produzione** il base path è `/famiglia-dolce-gestione/` (necessario per
> GitHub Pages); in **sviluppo** l'app gira comodamente sulla root `http://localhost:5173/`.

---

## ✏️ Dove modificare i contenuti

**Tutti i contenuti sono nei file JSON in [`src/data/`](src/data/)** — non serve toccare i
componenti:

| File | Contenuto |
|------|-----------|
| [`profili.json`](src/data/profili.json) | Flavio e David: nome, principi nutrizionali, colore, note di sicurezza |
| [`colazioni.json`](src/data/colazioni.json) | Le 4 settimane × 7 giorni × 2 profili. Ogni ingrediente ha **nome, grammi (`g`) e `prodotto`**; per David il campo `sicurezza` compare solo nei giorni con cibi a rischio |
| [`prodotti.json`](src/data/prodotti.json) | Anagrafica prodotti: fornitore, confezione, scadenza, parole chiave di ricerca. Alimenta la **spesa settimanale** (somma dei grammi +10%, arrotondata alle confezioni) |
| [`stagione.json`](src/data/stagione.json) | Etichetta stagione, frutta/verdura di stagione, **`inizioCiclo`** (data da cui parte la rotazione 1→4) |
| [`spesa.json`](src/data/spesa.json) | Testo del «giro unico» e nomi dei fornitori. Le quantità della spesa sono **calcolate** dai grammi delle colazioni |

La **settimana del ciclo (1–4)** viene calcolata automaticamente a rotazione a partire da
`inizioCiclo` in `stagione.json`.

---

## 🧱 Architettura modulare

La navigazione è generata da un array di **moduli** in
[`src/config/moduli.js`](src/config/moduli.js). Per ora è attivo solo **Colazioni**.

Per aggiungere in futuro un nuovo modulo (es. **Cassa**, **Pulizie**) **senza
rifattorizzare**: porta il modulo a `attivo: true`, definisci le sue `viste` con i path, e
aggiungi le rotte corrispondenti in [`src/App.jsx`](src/App.jsx).

---

## 🚀 Creare il repo su GitHub e fare il primo deploy su Pages

### Opzione A — con GitHub CLI (`gh`)

```bash
# dalla cartella del progetto
git init
git add .
git commit -m "Primo commit: Famiglia Dolce - Colazioni"
git branch -M main

# crea il repo (pubblico) e fa il push
gh repo create famiglia-dolce-gestione --public --source=. --remote=origin --push

# abilita GitHub Pages con sorgente "GitHub Actions"
gh api -X POST repos/<TUO-UTENTE>/famiglia-dolce-gestione/pages \
  -f build_type=workflow
```

### Opzione B — dal sito GitHub

1. Crea un nuovo repository chiamato **`famiglia-dolce-gestione`** su
   https://github.com/new (pubblico).
2. Collega e carica il progetto:
   ```bash
   git init
   git add .
   git commit -m "Primo commit: Famiglia Dolce - Colazioni"
   git branch -M main
   git remote add origin https://github.com/<TUO-UTENTE>/famiglia-dolce-gestione.git
   git push -u origin main
   ```
3. Vai su **Settings → Pages** del repo e imposta **Source = GitHub Actions**.

### Risultato

Ad ogni `push` su `main`, il workflow
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) compila l'app e la pubblica
su Pages. Dopo 1–2 minuti l'app è online su:

```
https://<TUO-UTENTE>.github.io/famiglia-dolce-gestione/
```

> ⚠️ **Importante:** il `base` in [`vite.config.js`](vite.config.js) deve combaciare con il
> nome del repo. Se cambi nome al repository, aggiorna `base: '/nuovo-nome/'`.

---

## 📲 Aggiungere a schermata Home (iPad / iPhone)

1. Apri l'URL dell'app in **Safari**.
2. Tocca **Condividi** → **Aggiungi a Home**.
3. Apri l'icona «Colazioni»: si avvia a **schermo intero**, senza barre del browser.

---

## 🔒 Prossimo passo: messa in sicurezza con login

Al momento l'app è pubblica (di sola lettura). Il passo successivo sarà aggiungere un
**login** per limitarne l'accesso. Trattandosi di un sito statico su GitHub Pages, le
opzioni tipiche sono: protezione tramite un servizio di accesso (es. Cloudflare Access),
oppure spostare l'hosting su una piattaforma con autenticazione integrata.

---

_Progetto privato della famiglia. Buone colazioni! 🥣_
