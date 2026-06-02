import { useMemo, useState, useEffect } from 'react'
import GameHeader from '../../GameHeader/GameHeader.jsx'
import GameOver from '../../GameOver/GameOver.jsx'
import { useLocalStorage } from '../../../hooks/useLocalStorage.js'
import { PLAYER_COLORS } from '../../../utils/playerColors.js'
import styles from './GenericScoreGame.module.css'

const STORAGE_KEY = 'spieleblock_generic'

function emptyState() {
  return { players: [], rounds: 0, winMode: 'high', targetScore: null }
}

let nextId = Date.now()
const makeId = () => `p${nextId++}`

export default function GenericScoreGame({ config, onBack, onRestart }) {
  const [state, setState] = useLocalStorage(STORAGE_KEY, emptyState())
  const [dismissed, setDismissed] = useState(false)

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
        targetScore: config.targetScore ?? null
      })
    }
  }, [])

  const players = state.players
  const rounds = state.rounds

  const totals = useMemo(
    () => players.map((p) => p.scores.reduce((a, b) => a + (b || 0), 0)),
    [players]
  )
  const leaderTotal = totals.length ? Math.max(...totals) : null

  const isGameOver = useMemo(() => {
    if (!state.targetScore || players.length === 0) return false
    return totals.some((t) => t >= state.targetScore)
  }, [state.targetScore, totals, players.length])

  const winner = useMemo(() => {
    if (!isGameOver) return null
    const isLow = state.winMode === 'low'
    const best = isLow ? Math.min(...totals) : Math.max(...totals)
    const winners = players.filter((_, i) => totals[i] === best)
    if (winners.length > 1) {
      return { name: winners.map((w) => w.name).join(' & '), color: '#FBBF24', score: best, tie: true }
    }
    return { name: winners[0].name, color: winners[0].color, score: best }
  }, [isGameOver, players, totals, state.winMode])

  const removePlayer = (id) =>
    setState((s) => ({ ...s, players: s.players.filter((p) => p.id !== id) }))

  const addRound = () =>
    setState((s) => ({
      ...s,
      rounds: s.rounds + 1,
      players: s.players.map((p) => ({ ...p, scores: [...p.scores, 0] }))
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

  const setScore = (playerId, roundIdx, value) => {
    const num = value === '' || value === '-' ? 0 : parseInt(value, 10)
    const safe = Number.isNaN(num) ? 0 : num
    setState((s) => ({
      ...s,
      players: s.players.map((p) =>
        p.id === playerId
          ? { ...p, scores: p.scores.map((v, i) => (i === roundIdx ? safe : v)) }
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
              {players.map((p, i) => (
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
                    style={{
                      color:
                        leaderTotal !== null && totals[i] === leaderTotal && totals[i] !== 0
                          ? p.color
                          : 'var(--text)'
                    }}
                  >
                    {totals[i]}
                  </span>
                  {leaderTotal !== null && totals[i] === leaderTotal && totals[i] !== 0 && (
                    <span className={styles.crown}>👑</span>
                  )}
                </div>
              ))}
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
                      value={p.scores[r] === 0 ? '' : p.scores[r]}
                      placeholder="0"
                      onChange={(e) => setScore(p.id, r, e.target.value)}
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
          onRestart={onRestart}
          onDismiss={() => setDismissed(true)}
        />
      )}
    </div>
  )
}
