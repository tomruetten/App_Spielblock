// Phase 10 (Würfelspiel) – Phasen-Definitionen und Punkteberechnung
//
// 10 Würfel (6 "hohe" mit den Zahlen 5–10, 4 "niedrige" mit 1–4 und Wild "W" = 0
// Punkte). Pro Zug bis zu drei Würfe, danach wird geprüft, ob die aktuelle Phase
// gelegt werden kann. Gelingt das, zählt die Summe der dafür benutzten Würfel
// (Wild-Würfel zählen 0) als Punkte für diese Phase, und es geht mit der
// nächsten Phase weiter. Gelingt die Phase nicht, gibt es 0 Punkte und man
// versucht es in der nächsten Runde erneut an derselben Phase.
//
// Sobald ein Spieler Phase 10 abgeschlossen hat, bekommen alle anderen noch
// eine letzte Serie von Versuchen (weiter an ihrer aktuellen Phase), bis sie
// entweder ebenfalls durchkommen oder scheitern. Gewonnen hat am Ende, wer die
// höchste Gesamtpunktzahl erreicht hat.

export const PHASES = [
  { number: 1, label: '2 Drillinge', hint: 'Zwei Dreiergruppen gleicher Zahlen' },
  { number: 2, label: '1 Drilling + Straße zu 4', hint: 'Drei gleiche Zahlen + vier Würfel in Folge' },
  { number: 3, label: '1 Vierling + Straße zu 4', hint: 'Vier gleiche Zahlen + vier Würfel in Folge' },
  { number: 4, label: 'Straße zu 7', hint: 'Sieben Würfel in fortlaufender Reihenfolge' },
  { number: 5, label: 'Straße zu 8', hint: 'Acht Würfel in fortlaufender Reihenfolge' },
  { number: 6, label: 'Straße zu 9', hint: 'Neun Würfel in fortlaufender Reihenfolge' },
  { number: 7, label: '2 Vierlinge', hint: 'Zwei Vierergruppen gleicher Zahlen' },
  { number: 8, label: '7 Würfel einer Farbe', hint: 'Sieben Würfel mit derselben Farbe' },
  { number: 9, label: '1 Fünfling + 1 Zwilling', hint: 'Fünf gleiche Zahlen + zwei gleiche Zahlen' },
  { number: 10, label: '1 Fünfling + 1 Drilling', hint: 'Fünf gleiche Zahlen + drei gleiche Zahlen' }
]

export const PHASE_COUNT = PHASES.length

// Eine Score-Karte ist ein Array der Länge PHASE_COUNT: null = Phase noch
// offen/nicht geschafft, Zahl (inkl. 0) = mit dieser Punktzahl geschafft.
export function createScorecard() {
  return Array(PHASE_COUNT).fill(null)
}

// Index (0-basiert) der aktuell offenen Phase = erste noch leere Stelle.
// -1, wenn alle 10 Phasen geschafft sind.
export function currentPhaseIndex(card) {
  return card.findIndex((v) => v === null)
}

export function isCardComplete(card) {
  return currentPhaseIndex(card) === -1
}

export function grandTotal(card) {
  return card.reduce((sum, v) => sum + (v ?? 0), 0)
}

// Ist mind. ein Spieler bereits mit Phase 10 fertig? Dann sind alle anderen
// in der Schlussrunde: sie dürfen weiterspielen, aber ein Fehlversuch beendet
// ihr Spiel sofort (statt einfach nochmal an derselben Phase zu versuchen).
export function isFinalRound(players) {
  return players.some((p) => isCardComplete(p.card))
}

// Spiel vorbei, sobald jeder Spieler entweder alle 10 Phasen geschafft hat
// oder (in der Schlussrunde) an seiner Phase gescheitert und damit raus ist.
export function isGameOver(players) {
  if (players.length === 0) return false
  return players.every((p) => isCardComplete(p.card) || p.locked)
}
