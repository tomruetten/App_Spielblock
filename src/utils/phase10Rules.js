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
// höchste Gesamtpunktzahl (inkl. Boni) erreicht hat.
//
// maxPoints = die mit dieser Würfelzusammenstellung höchstmögliche Punktzahl
// für die jeweilige Phase (offizieller Referenzwert vom gedruckten Spieleblock).
export const PHASES = [
  { number: 1, label: '2 Drillinge', maxPoints: 60 },
  { number: 2, label: '1 Drilling + Straße zu 4', maxPoints: 57 },
  { number: 3, label: '1 Vierling + Straße zu 4', maxPoints: 59 },
  { number: 4, label: 'Straße zu 7', maxPoints: 49 },
  { number: 5, label: 'Straße zu 8', maxPoints: 52 },
  { number: 6, label: 'Straße zu 9', maxPoints: 54 },
  { number: 7, label: '2 Vierlinge', maxPoints: 60 },
  { number: 8, label: '7 Würfel einer Farbe', maxPoints: 56 },
  { number: 9, label: '1 Fünfling + 1 Zwilling', maxPoints: 60 },
  { number: 10, label: '1 Fünfling + 1 Drilling', maxPoints: 62 }
]

export const PHASE_COUNT = PHASES.length

// 5-Phasen-Bonus: wer nach Phase 5 mindestens 221 Punkte hat, bekommt +40.
export const PHASE5_BONUS_THRESHOLD = 221
export const PHASE5_BONUS_VALUE = 40

// 10-Phasen-Bonus: wer alle 10 Phasen abschließt, bekommt +40.
export const PHASE10_BONUS_VALUE = 40

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

export function isPhase5Done(card) {
  return card[4] !== null
}

export function isPhase10Done(card) {
  return card[9] !== null
}

// Zwischensumme der ersten 5 Phasen (nur eingetragene Werte)
export function subtotalThroughPhase5(card) {
  return card.slice(0, 5).reduce((sum, v) => sum + (v ?? 0), 0)
}

// 'pending' solange Phase 5 noch offen ist, sonst 'earned'/'missed'
export function phase5BonusStatus(card) {
  if (!isPhase5Done(card)) return 'pending'
  return subtotalThroughPhase5(card) >= PHASE5_BONUS_THRESHOLD ? 'earned' : 'missed'
}

export function phase5Bonus(card) {
  return phase5BonusStatus(card) === 'earned' ? PHASE5_BONUS_VALUE : 0
}

// 'earned' bei abgeschlossener Phase 10, 'missed' wenn der Spieler ohne
// Abschluss ausgeschieden ist, sonst noch 'pending'
export function phase10BonusStatus(player) {
  if (isPhase10Done(player.card)) return 'earned'
  if (player.locked) return 'missed'
  return 'pending'
}

export function phase10Bonus(player) {
  return phase10BonusStatus(player) === 'earned' ? PHASE10_BONUS_VALUE : 0
}

// player = { card, locked } – Gesamtpunktzahl inkl. beider Boni
export function grandTotal(player) {
  const base = player.card.reduce((sum, v) => sum + (v ?? 0), 0)
  return base + phase5Bonus(player.card) + phase10Bonus(player)
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
