// Kniffel-Regeln: Feld-Definitionen und Punkteberechnung

export const UPPER_FIELDS = [
  { key: 'ones', label: 'Einser', hint: 'Summe aller Einser' },
  { key: 'twos', label: 'Zweier', hint: 'Summe aller Zweier' },
  { key: 'threes', label: 'Dreier', hint: 'Summe aller Dreier' },
  { key: 'fours', label: 'Vierer', hint: 'Summe aller Vierer' },
  { key: 'fives', label: 'Fünfer', hint: 'Summe aller Fünfer' },
  { key: 'sixes', label: 'Sechser', hint: 'Summe aller Sechser' }
]

export const LOWER_FIELDS = [
  { key: 'threeKind', label: 'Dreierpasch', hint: 'Summe aller Würfel', fixed: null },
  { key: 'fourKind', label: 'Viererpasch', hint: 'Summe aller Würfel', fixed: null },
  { key: 'fullHouse', label: 'Full House', hint: '25 Punkte', fixed: 25 },
  { key: 'smallStraight', label: 'Kleine Straße', hint: '30 Punkte', fixed: 30 },
  { key: 'largeStraight', label: 'Große Straße', hint: '40 Punkte', fixed: 40 },
  { key: 'kniffel', label: 'Kniffel', hint: '50 Punkte', fixed: 50 },
  { key: 'chance', label: 'Chance', hint: 'Summe aller Würfel', fixed: null }
]

export const BONUS_THRESHOLD = 63
export const BONUS_VALUE = 35

// Ein Score-Eintrag ist entweder null (leer), oder eine Zahl (inkl. 0 = gestrichen)
export function createScorecard() {
  const card = {}
  for (const f of [...UPPER_FIELDS, ...LOWER_FIELDS]) card[f.key] = null
  return card
}

export function upperSum(card) {
  return UPPER_FIELDS.reduce((sum, f) => sum + (card[f.key] ?? 0), 0)
}

export function hasBonus(card) {
  return upperSum(card) >= BONUS_THRESHOLD
}

export function bonusValue(card) {
  return hasBonus(card) ? BONUS_VALUE : 0
}

export function lowerSum(card) {
  return LOWER_FIELDS.reduce((sum, f) => sum + (card[f.key] ?? 0), 0)
}

export function grandTotal(card) {
  return upperSum(card) + bonusValue(card) + lowerSum(card)
}

// Punkte bis zum Bonus (für Fortschrittsanzeige), kann negativ sein
export function bonusRemaining(card) {
  return BONUS_THRESHOLD - upperSum(card)
}
