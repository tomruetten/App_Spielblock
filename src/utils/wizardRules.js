// Wizard-Regeln: Rundenzahl, Punkteberechnung
// Quelle: 60 Karten (52 Werte + 4 Zauberer + 4 Narren), 3–6 Spieler.
// Runde r verteilt r Karten je Spieler. Rundenzahl = 60 / Spieleranzahl (abgerundet).

export const DECK_SIZE = 60
export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 6

export function totalRounds(playerCount) {
  if (!playerCount || playerCount < 1) return 0
  return Math.max(1, Math.floor(DECK_SIZE / playerCount))
}

// Karten (und damit maximale Ansage/Stiche) in Runde `roundIdx` (0-basiert)
export function cardsInRound(roundIdx) {
  return roundIdx + 1
}

export function createEmptyRound() {
  return { bid: null, tricks: null }
}

export function isRoundEntered(round) {
  return !!round && round.bid !== null && round.tricks !== null
}

// Punkte für eine einzelne Runde, oder null falls noch nicht eingetragen
export function roundScore(round) {
  if (!isRoundEntered(round)) return null
  if (round.bid === round.tricks) return 20 + 10 * round.tricks
  return -10 * Math.abs(round.bid - round.tricks)
}

export function playerTotal(rounds) {
  return rounds.reduce((sum, r) => sum + (roundScore(r) ?? 0), 0)
}
