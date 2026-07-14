import { useMemo, useState, useEffect } from 'react'
import GameHeader from '../../GameHeader/GameHeader.jsx'
import GameOver from '../../GameOver/GameOver.jsx'
import { useLocalStorage } from '../../../hooks/useLocalStorage.js'
import { buildRanking } from '../../../utils/ranking.js'
import { PLAYER_COLORS } from '../../../utils/playerColors.js'
import styles from './GenericScoreGame.module.css'

const STORAGE_KEY = 'spieleblock_generic'

function emptyState() {
  return { players: [], rounds: 0, winMode: 'high', targetScore: null, maxRounds: null }
}

let nextId = Date.now()
const makeId = () => `p${nextId++}`

export default function GenericScoreGame({ config, onBack, onRestart }) {
  const [state, setState] = useLocalStorage(STORAGE_KEY, emptyState())
  const [dismissed, setDismissed] = useState(false)
  const [focusedCell, setFocusedCell] = useState(null)

  useEffect(() => {
    if (config?.players?.length && state.players.length === 0) {
      setState({
        players: config.players.map((name, idx) => ({
          id: makeId(),
          name,
          color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
          scores: []
        })),
        rounds: 0,
        winMode: config.winMode || 'high',
        targetScore: config.targetScore ?? null,
        maxRounds: config.maxRounds ?? null
      })
    }
  }, [])

  const players = state.players
  const rounds = state.rounds

  const isLow = state.winMode === 'low'

  const totals = useMemo(
    () => players.map((p) => p.scores.reduce((a, b) => a + (b || 0), 0)),
    [players]
  )
  // Führender je nach Gewinnmodus (niedrigste bzw. höchste Punktzahl)
  const leaderTotal = totals.length
    ? (isLow ? Math.min(...totals) : Math.max(...totals))
    : null

  // Spieler nach Platzierung sortiert (bester zuerst) für die oberen Blöcke
  const rankedPlayers = useMemo(() => {
    const withTotals = players.map((p, i) => ({ player: p, total: totals[i] }))
    return withTotals.sort((a, b) => (isLow ? a.total - b.total : b.total - a.total))
  }, [players, totals, isLow])

  const isGameOver = useMemo(() => {
    if (players.length === 0 || rounds === 0) return false
    if (focusedCell && focusedCell.roundIdx === rounds - 1) return false
    const allEntered = players.every((p) => p.scores[rounds - 1] !== null)
    if (!allEntered) return false
    const reachedTarget = state.targetScore && totals.some((t) => t >= state.targetScore)
    const reachedMaxRounds = state.maxRounds && rounds >= state.maxRounds
    return Boolean(reachedTarget || reachedMaxRounds)
  }, [state.targetScore, state.maxRounds, totals, players, rounds, focusedCell])

  const winner = useMemo(() => {
    if (!isGameOver) return null
    const best = isLow ? Math.min(...totals) : Math.max(...totals)
    const winners = players.filter((_, i) => totals[i] === best)
    if (winners.length > 1) {
      return { name: winners.map((w) => w.name).join(' & '), color: '#FBBF24', score: best, tie: true }
    }
    return { name: winners[0].name, color: winners[0].color, score: best }
  }, [isGameOver, players, totals, isLow])

  const ranking = useMemo(
    () => buildRanking(
      players.map((p, i) => ({ name: p.name, color: p.color, score: totals[i] })),
      isLow
    ),
    [players, totals, isLow]
  )

  const removePlayer = (id) =>
    setState((s) => ({ ...s, players: s.players.filter((p) => p.id !== id) }))

  const addRound = () =>
    setState((s) => ({
      ...s,
      rounds: s.rounds + 1,
      players: s.players.map((p) => ({ ...p, scores: [...p.scores, null] }))
    }))

  const removeRound = (roundIdx) =>
    setState((s) => ({
      ...s,
      rounds: s.rounds - 1,
      players: s.players.map((p) => ({
        ...p,
        scores: p.scores.filter((_, i) => i !== roundIdx)
      }))
    }))

  const setScore = (playerId, roundIdx, raw) => {
    // Leeres Feld = kein Eintrag (null); eine explizit getippte 0 bleibt 0
    let value
    if (raw === '' || raw === '-') {
      value = null
    } else {
      const num = parseInt(raw, 10)
      value = Number.isNaN(num) ? null : num
    }
    setState((s) => ({
      ...s,
      players: s.players.map((p) =>
        p.id === playerId
          ? { ...p, scores: p.scores.map((v, i) => (i === roundIdx ? value : v)) }
          : p
      )
    }))
  }

  return (
    <div className={styles.screen}>
      <GameHeader title="Punkteblock" onBack={onBack} onRestart={onRestart} />

      <div className={styles.body}>
        {players.length === 0 ? (
          <div className={styles.empty}>
            <p>Kein Spiel aktiv.</p>
          </div>
        ) : (
          <>
            <div className={styles.totalsRow}>
              {rankedPlayers.map(({ player: p, total }) => {
                const isLeader =
                  leaderTotal !== null &&
                  total === leaderTotal &&
                  totals.some((t) => t !== 0)
                return (
                  <div key={p.id} className={`${styles.totalCard} glass`}>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removePlayer(p.id)}
                      aria-label={`${p.name} entfernen`}
                    >
                      ✕
                    </button>
                    <span className={styles.dot} style={{ background: p.color }} />
                    <span className={styles.totalName}>{p.name}</span>
                    <span
                      className={styles.totalValue}
                      style={{ color: isLeader ? p.color : 'var(--text)' }}
                    >
                      {total}
                    </span>
                    {isLeader && <span className={styles.crown}>👑</span>}
                  </div>
                )
              })}
            </div>

            <div
              className={`${styles.table} glass`}
              style={{ '--cols': players.length }}
            >
              <div className={styles.tableHead}>
                <span className={styles.roundLabel}>#</span>
                {players.map((p) => (
                  <span key={p.id} className={styles.headName} style={{ color: p.color }}>
                    {p.name}
                  </span>
                ))}
              </div>

              {Array.from({ length: rounds }).map((_, r) => (
                <div key={r} className={styles.tableRow}>
                  <button
                    className={styles.roundNum}
                    onClick={() => removeRound(r)}
                    title="Runde löschen"
                  >
                    {r + 1}
                  </button>
                  {players.map((p) => (
                    <input
                      key={p.id}
                      className={styles.cell}
                      type="number"
                      inputMode="numeric"
                      value={p.scores[r] == null ? '' : p.scores[r]}
                      placeholder="0"
                      onChange={(e) => setScore(p.id, r, e.target.value)}
                      onFocus={() => setFocusedCell({ playerId: p.id, roundIdx: r })}
                      onBlur={() => setFocusedCell(null)}
                    />
                  ))}
                </div>
              ))}

              <button className={styles.addRound} onClick={addRound}>
                ＋ Runde {rounds + 1}
              </button>
            </div>
          </>
        )}
      </div>

      {isGameOver && !dismissed && winner && (
        <GameOver
          winner={winner}
          ranking={ranking}
          onRestart={onRestart}
          onDismiss={() => setDismissed(true)}
        />
      )}
    </div>
  )
}
