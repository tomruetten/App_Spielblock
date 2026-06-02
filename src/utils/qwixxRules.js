// Qwixx-Regeln: Reihen, Validierung, Sperr-Logik, Punkteberechnung

// Reihenfolge der Zahlen je Reihe. Rot/Gelb aufsteigend (2→12),
// Grün/Blau absteigend (12→2). Index 10 = Sperr-Feld.
export const ROWS = [
  { key: 'red', label: 'Rot', color: 'var(--qwixx-red)', numbers: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { key: 'yellow', label: 'Gelb', color: 'var(--qwixx-yellow)', numbers: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { key: 'green', label: 'Grün', color: 'var(--qwixx-green)', numbers: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2] },
  { key: 'blue', label: 'Blau', color: 'var(--qwixx-blue)', numbers: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2] }
]

export const LOCK_INDEX = 10 // letztes Feld jeder Reihe (Schloss)
export const MIN_FOR_LOCK = 5 // mind. 5 Kreuze nötig, um Schloss anzukreuzen
export const MAX_MISSES = 4
export const MISS_PENALTY = 5

export function createPlayerRows() {
  const rows = {}
  for (const r of ROWS) rows[r.key] = Array(11).fill(false)
  return rows
}

function lastCheckedIndex(rowArr) {
  for (let i = rowArr.length - 1; i >= 0; i--) {
    if (rowArr[i]) return i
  }
  return -1
}

export function countChecks(rowArr) {
  return rowArr.reduce((n, c) => n + (c ? 1 : 0), 0)
}

/**
 * Darf das Feld an `index` in dieser Reihe angekreuzt werden?
 * Regeln:
 *  - Reihe darf nicht gesperrt sein.
 *  - Nur Felder rechts vom letzten Kreuz (größerer Index).
 *  - Das Sperr-Feld (Index 10) nur, wenn bereits ≥ 5 Kreuze gesetzt sind.
 */
export function canCheck(rowArr, index, rowLocked) {
  if (rowLocked) return false
  if (rowArr[index]) return true // bereits angekreuzt → erlaubt (zum Abwählen)
  if (index <= lastCheckedIndex(rowArr)) return false
  if (index === LOCK_INDEX && countChecks(rowArr) < MIN_FOR_LOCK) return false
  return true
}

// Punkte für n Kreuze in einer Reihe: Dreieckszahl n*(n+1)/2
export function rowPoints(checks) {
  return (checks * (checks + 1)) / 2
}

// Gesamtpunkte eines Spielers
export function playerScore(player) {
  let total = 0
  for (const r of ROWS) {
    let checks = countChecks(player.rows[r.key])
    // Wer das Schloss ankreuzt, bekommt ein zusätzliches Kreuz gewertet
    if (player.rows[r.key][LOCK_INDEX]) checks += 1
    total += rowPoints(checks)
  }
  total -= player.misses * MISS_PENALTY
  return total
}

export function rowSubScore(rowArr) {
  let checks = countChecks(rowArr)
  if (rowArr[LOCK_INDEX]) checks += 1
  return rowPoints(checks)
}
