import { useState, useEffect, useMemo } from 'react'
import GameHeader from '../../GameHeader/GameHeader.jsx'
import GameOver from '../../GameOver/GameOver.jsx'
import { useLocalStorage } from '../../../hooks/useLocalStorage.js'
import { buildRanking } from '../../../utils/ranking.js'
import { PLAYER_COLORS } from '../../../utils/playerColors.js'
import {
  totalRounds,
  cardsInRound,
  createEmptyRound,
  isRoundEntered,
  roundScore,
  playerTotal
} from '../../../utils/wizardRules.js'
import styles from './WizardGame.module.css'

const STORAGE_KEY = 'spieleblock_wizard'

let nextId = Date.now()
const makeId = () => `w${nextId++}`

function emptyState() {
  return { players: [], rounds: 0 }
}

export default function WizardGame({ config, onBack, onRestart }) {
  const [state, setState] = useLocalStorage(STORAGE_KEY, emptyState())
  const [editing, setEditing] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (config?.players?.length && state.players.length === 0) {
      const rounds = totalRounds(config.players.length)
      setState({
        players: config.players.map((name, idx) => ({
          id: makeId(),
          name,
          color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
          rounds: Array.from({ length: rounds }, createEmptyRound)
        })),
        rounds
      })
    }
  }, [])

  const players = state.players
  const rounds = state.rounds

  const totals = useMemo(() => players.map((p) => playerTotal(p.rounds)), [players])
  const leaderTotal = totals.length ? Math.max(...totals) : null

  // Spieler nach Platzierung sortiert (bester zuerst) für die oberen Blöcke
  const rankedPlayers = useMemo(() => {
    const withTotals = players.map((p, i) => ({ player: p, total: totals[i] }))
    return withTotals.sort((a, b) => b.total - a.total)
  }, [players, totals])

  const isGameOver = useMemo(() => {
    if (players.length === 0 || rounds === 0) return false
    return players.every((p) => isRoundEntered(p.rounds[rounds - 1]))
  }, [players, rounds])

  const winner = useMemo(() => {
    if (!isGameOver) return null
    const best = Math.max(...totals)
    const winners = players.filter((_, i) => totals[i] === best)
    if (winners.length > 1) {
      return { name: winners.map((w) => w.name).join(' & '), color: '#FBBF24', score: best, tie: true }
    }
    return { name: winners[0].name, color: winners[0].color, score: best }
  }, [isGameOver, players, totals])

  const ranking = useMemo(
    () => buildRanking(players.map((p, i) => ({ name: p.name, color: p.color, score: totals[i] }))),
    [players, totals]
  )

  const removePlayer = (id) =>
    setState((s) => ({ ...s, players: s.players.filter((p) => p.id !== id) }))

  const setRound = (playerId, roundIdx, round) => {
    setState((s) => ({
      ...s,
      players: s.players.map((p) =>
        p.id === playerId
          ? { ...p, rounds: p.rounds.map((r, i) => (i === roundIdx ? round : r)) }
          : p
      )
    }))
    setEditing(null)
  }

  const editingPlayer = editing
    ? players.find((p) => p.id === editing.playerId)
    : null

  return (
    <div className={styles.screen}>
      <GameHeader title="Wizard" onBack={onBack} onRestart={onRestart} />

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
                  leaderTotal !== null && total === leaderTotal && totals.some((t) => t !== 0)
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

            <div className={`${styles.table} glass`} style={{ '--cols': players.length }}>
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
                  <span className={styles.roundNum}>{r + 1}</span>
                  {players.map((p) => {
                    const round = p.rounds[r]
                    const score = roundScore(round)
                    const entered = isRoundEntered(round)
                    const hit = entered && round.bid === round.tricks
                    return (
                      <button
                        key={p.id}
                        className={`${styles.cell} ${entered ? (hit ? styles.cellHit : styles.cellMiss) : ''}`}
                        onClick={() => setEditing({ playerId: p.id, roundIdx: r })}
                      >
                        {entered ? (
                          <>
                            <span className={styles.cellScore}>
                              {score > 0 ? `+${score}` : score}
                            </span>
                            <span className={styles.cellSub}>{round.bid}/{round.tricks}</span>
                          </>
                        ) : (
                          <span className={styles.cellEmpty}>–</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {editing && editingPlayer && (
        <RoundSheet
          roundIdx={editing.roundIdx}
          current={editingPlayer.rounds[editing.roundIdx]}
          onSave={(round) => setRound(editing.playerId, editing.roundIdx, round)}
          onClear={() => setRound(editing.playerId, editing.roundIdx, createEmptyRound())}
          onClose={() => setEditing(null)}
        />
      )}

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

/* ---------- Ansage-/Stiche-Sheet ---------- */

function NumberPicker({ label, value, max, onChange }) {
  const useChips = max <= 8
  return (
    <div className={styles.pickerBlock}>
      <span className={styles.pickerLabel}>{label}</span>
      {useChips ? (
        <div className={styles.chipGrid}>
          {Array.from({ length: max + 1 }, (_, n) => n).map((n) => (
            <button
              key={n}
              className={`${styles.chip} ${value === n ? styles.chipActive : ''}`}
              onClick={() => onChange(n)}
            >
              {n}
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.stepperRow}>
          <button
            className={styles.stepperBtn}
            onClick={() => onChange(Math.max(0, (value ?? 0) - 1))}
            aria-label={`${label} verringern`}
          >
            −
          </button>
          <span className={styles.stepperValue}>{value ?? 0}</span>
          <button
            className={styles.stepperBtn}
            onClick={() => onChange(Math.min(max, (value ?? 0) + 1))}
            aria-label={`${label} erhöhen`}
          >
            ＋
          </button>
        </div>
      )}
    </div>
  )
}

function RoundSheet({ roundIdx, current, onSave, onClear, onClose }) {
  const max = cardsInRound(roundIdx)
  const [bid, setBid] = useState(current?.bid ?? null)
  const [tricks, setTricks] = useState(current?.tricks ?? null)

  // Body-Scroll sperren, solange das Sheet offen ist
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [])

  const previewScore =
    bid !== null && tricks !== null
      ? (bid === tricks ? 20 + 10 * tricks : -10 * Math.abs(bid - tricks))
      : null

  const canSave = bid !== null && tricks !== null
  const hasEntry = current !== null && current !== undefined && current.bid !== null

  return (
    <div className={styles.sheetBackdrop} onClick={onClose}>
      <div className={`${styles.sheet} glass`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.sheetHandle} />
        <h3 className={styles.sheetTitle}>Runde {roundIdx + 1}</h3>
        <p className={styles.sheetHint}>{max} {max === 1 ? 'Karte' : 'Karten'}</p>

        <NumberPicker label="Ansage" value={bid} max={max} onChange={setBid} />
        <NumberPicker label="Stiche" value={tricks} max={max} onChange={setTricks} />

        {previewScore !== null && (
          <p
            className={`${styles.previewScore} ${
              previewScore >= 0 ? styles.previewPositive : styles.previewNegative
            }`}
          >
            {previewScore >= 0 ? `+${previewScore}` : previewScore} Punkte
          </p>
        )}

        <button
          className={styles.saveBtn}
          disabled={!canSave}
          onClick={() => onSave({ bid, tricks })}
        >
          Speichern
        </button>

        {hasEntry && (
          <button className={styles.clearBtn} onClick={onClear}>
            Eintrag löschen
          </button>
        )}
      </div>
    </div>
  )
}
