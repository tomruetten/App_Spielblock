import { useState, useMemo, useEffect } from 'react'
import GameHeader from '../../GameHeader/GameHeader.jsx'
import { useLocalStorage } from '../../../hooks/useLocalStorage.js'
import styles from './GenericScoreGame.module.css'

const STORAGE_KEY = 'spieleblock_generic'

const PLAYER_COLORS = [
  '#6C3CE1', '#FF6B6B', '#0A84FF', '#30D158',
  '#FF9F0A', '#FF2D92', '#5E5CE6', '#64D2FF'
]

function emptyState() {
  return { players: [], rounds: 0 }
}

let nextId = Date.now()
const makeId = () => `p${nextId++}`

export default function GenericScoreGame({ config, onBack }) {
  const [state, setState] = useLocalStorage(STORAGE_KEY, emptyState())
  const [newName, setNewName] = useState('')
  const [hideAddRow, setHideAddRow] = useState(() => !!(config?.players?.length))

  useEffect(() => {
    if (config?.players && config.players.length > 0 && state.players.length === 0) {
      setState({
        players: config.players.map((name, idx) => ({
          id: makeId(),
          name,
          color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
          scores: []
        })),
        rounds: 0
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

  const addPlayer = () => {
    const name = newName.trim()
    if (!name) return
    setState((s) => ({
      ...s,
      players: [
        ...s.players,
        {
          id: makeId(),
          name,
          color: PLAYER_COLORS[s.players.length % PLAYER_COLORS.length],
          scores: Array(s.rounds).fill(0)
        }
      ]
    }))
    setNewName('')
  }

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

  const reset = () => {
    if (window.confirm('Neues Spiel starten? Alle Punkte werden gelöscht.')) {
      setState(emptyState())
      setHideAddRow(false)
    }
  }

  return (
    <div className={styles.screen}>
      <GameHeader title="Punkteblock" onBack={onBack} onReset={reset} />

      <div className={styles.body}>
        {/* Spieler hinzufügen */}
        {!hideAddRow && (
          <div className={`${styles.addRow} glass`}>
            <input
              className={styles.input}
              value={newName}
              placeholder="Spielername"
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
            />
            <button className="btn-primary" onClick={addPlayer}>＋</button>
          </div>
        )}

        {players.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyEmoji}>📝</span>
            <p>Füge Spieler hinzu, um zu starten.</p>
          </div>
        ) : (
          <>
            {/* Gesamtsummen */}
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

            {/* Rundentabelle */}
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
    </div>
  )
}

