import colazioniBase from '../data/colazioni.json'
import stagioneBase from '../data/stagione.json'
import colazioniProssimo from '../data/prossimo/colazioni.json'
import stagioneProssimo from '../data/prossimo/stagione.json'
import { scegliMenu } from './sceltaMenu.js'

// Unico punto da cui l'app legge colazioni e stagione: NON importare più direttamente
// data/colazioni.json o data/stagione.json nelle viste.
// Quando non c'è un mese successivo pronto, i file in data/prossimo/ contengono `{}`.
const BASE = { colazioni: colazioniBase, stagione: stagioneBase }
const PROSSIMO = { colazioni: colazioniProssimo, stagione: stagioneProssimo }

// Calcolato a ogni chiamata (non al caricamento del modulo): se l'app resta aperta a
// cavallo della mezzanotte del cambio mese, alla prima schermata nuova passa al mese dopo.
export function menuAttivo(oggi = new Date()) {
  return scegliMenu(oggi, BASE, PROSSIMO)
}
