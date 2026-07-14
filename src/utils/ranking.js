// Erzeugt eine sortierte Rangliste mit Platzierungen (inkl. gleicher Ränge bei
// Gleichstand). `entries` = [{ name, color, score }], `isLow` = niedrigste
// Punktzahl gewinnt.
export function buildRanking(entries, isLow = false) {
  const sorted = [...entries].sort((a, b) =>
    isLow ? a.score - b.score : b.score - a.score
  )
  let rank = 0
  let prevScore = null
  return sorted.map((e, i) => {
    if (prevScore === null || e.score !== prevScore) {
      rank = i + 1
      prevScore = e.score
    }
    return { ...e, rank }
  })
}
