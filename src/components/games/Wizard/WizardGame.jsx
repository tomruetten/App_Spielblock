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

  const updateRound = (playerId, roundIdx, patch) => {
    setState((s) => ({
      ...s,
      players: s.players.map((p) =>
        p.id === playerId
          ? { ...p, rounds: p.rounds.map((r, i) => (i === roundIdx ? { ...r, ...patch } : r)) }
          : p
      )
    }))
    setEditing(null)
  }

  const saveBid = (playerId, roundIdx, bid) => updateRound(playerId, roundIdx, { bid })
  const saveTricks = (playerId, roundIdx, tricks) => updateRound(playerId, roundIdx, { tricks })

  const clearRound = (playerId, roundIdx) => {
    setState((s) => ({
      ...s,
      players: s.players.map((p) =>
        p.id === playerId
          ? { ...p, rounds: p.rounds.map((r, i) => (i === roundIdx ? createEmptyRound() : r)) }
          : p
      )
    }))
    setEditing(null)
  }

  const editingPlayer = editing
    ? players.find((p) => p.id === editing.playerId)
    : null

  // Wie viele Stiche in dieser Runde von den ANDEREN Spielern bereits vergeben
  // wurden – begrenzt, wie viele diesem Spieler maximal noch bleiben können.
  let sheetData = null
  if (editing && editingPlayer) {
    const round = editingPlayer.rounds[editing.roundIdx]
    const cardsMax = cardsInRound(editing.roundIdx)
    const otherTricksSum = players
      .filter((p) => p.id !== editing.playerId)
      .reduce((sum, p) => sum + (p.rounds[editing.roundIdx].tricks ?? 0), 0)
    const maxTricks = Math.max(0, cardsMax - otherTricksSum)
    sheetData = { round, cardsMax, maxTricks }
  }

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
                    const pending = round.bid !== null && round.tricks === null
                    const hit = entered && round.bid === round.tricks
                    return (
                      <button
                        key={p.id}
                        className={`${styles.cell} ${
                          entered
                            ? (hit ? styles.cellHit : styles.cellMiss)
                            : pending ? styles.cellPending : ''
                        }`}
                        onClick={() => setEditing({ playerId: p.id, roundIdx: r })}
                      >
                        {entered ? (
                          <>
                            <span className={styles.cellScore}>
                              {score > 0 ? `+${score}` : score}
                            </span>
                            <span className={styles.cellSub}>{round.bid}/{round.tricks}</span>
                          </>
                        ) : pending ? (
                          <>
                            <span className={styles.cellPendingValue}>{round.bid}</span>
                            <span className={styles.cellSub}>Ansage</span>
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

      {editing && editingPlayer && sheetData && (
        <RoundSheet
          roundIdx={editing.roundIdx}
          round={sheetData.round}
          cardsMax={sheetData.cardsMax}
          maxTricks={sheetData.maxTricks}
          onSaveBid={(bid) => saveBid(editing.playerId, editing.roundIdx, bid)}
          onSaveTricks={(tricks) => saveTricks(editing.playerId, editing.roundIdx, tricks)}
          onClear={() => clearRound(editing.playerId, editing.roundIdx)}
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

function SheetShell({ title, hint, onClose, children }) {
  // Body-Scroll sperren, solange das Sheet offen ist
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [])

  return (
    <div className={styles.sheetBackdrop} onClick={onClose}>
      <div className={`${styles.sheet} glass`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.sheetHandle} />
        <h3 className={styles.sheetTitle}>{title}</h3>
        {hint && <p className={styles.sheetHint}>{hint}</p>}
        {children}
      </div>
    </div>
  )
}

function RoundSheet({ roundIdx, round, cardsMax, maxTricks, onSaveBid, onSaveTricks, onClear, onClose }) {
  // Ablauf wie im echten Spiel: zuerst alle Ansagen, danach die Stiche.
  const initialStage = round.bid === null ? 'bid' : (round.tricks === null ? 'tricks' : 'summary')
  const [stage, setStage] = useState(initialStage)
  const [bid, setBid] = useState(round.bid)
  const [tricks, setTricks] = useState(round.tricks)

  const cardLabel = `${cardsMax} ${cardsMax === 1 ? 'Karte' : 'Karten'}`
  const title = `Runde ${roundIdx + 1}`

  if (stage === 'bid') {
    return (
      <SheetShell title={title} hint={cardLabel} onClose={onClose}>
        <NumberPicker label="Ansage" value={bid} max={cardsMax} onChange={setBid} />
        <button
          className={styles.saveBtn}
          disabled={bid === null}
          onClick={() => onSaveBid(bid)}
        >
          Ansage speichern
        </button>
        {round.bid !== null && (
          <button className={styles.clearBtn} onClick={onClear}>
            Eintrag löschen
          </button>
        )}
      </SheetShell>
    )
  }

  if (stage === 'tricks') {
    return (
      <SheetShell title={title} hint={cardLabel} onClose={onClose}>
        <div className={styles.bidSummary}>
          <span className={styles.bidSummaryLabel}>Ansage</span>
          <strong className={styles.bidSummaryValue}>{round.bid}</strong>
          <button className={styles.editLink} onClick={() => setStage('bid')}>
            ändern
          </button>
        </div>

        <NumberPicker label="Stiche" value={tricks} max={maxTricks} onChange={setTricks} />
        {maxTricks < cardsMax && (
          <p className={styles.capHint}>
            Noch max. {maxTricks} {maxTricks === 1 ? 'Stich' : 'Stiche'} möglich – der Rest ist
            bereits an andere Spieler vergeben.
          </p>
        )}

        <button
          className={styles.saveBtn}
          disabled={tricks === null}
          onClick={() => onSaveTricks(tricks)}
        >
          Stiche speichern
        </button>
      </SheetShell>
    )
  }

  // stage === 'summary'
  const score = roundScore(round)
  return (
    <SheetShell title={title} hint={cardLabel} onClose={onClose}>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Ansage</span>
          <span className={styles.summaryValue}>{round.bid}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Stiche</span>
          <span className={styles.summaryValue}>{round.tricks}</span>
        </div>
      </div>

      <p
        className={`${styles.previewScore} ${
          score >= 0 ? styles.previewPositive : styles.previewNegative
        }`}
      >
        {score >= 0 ? `+${score}` : score} Punkte
      </p>

      <div className={styles.summaryActions}>
        <button className={styles.stageBtn} onClick={() => setStage('bid')}>
          Ansage ändern
        </button>
        <button className={styles.stageBtn} onClick={() => setStage('tricks')}>
          Stiche ändern
        </button>
      </div>

      <button className={styles.clearBtn} onClick={onClear}>
        Eintrag löschen
      </button>
    </SheetShell>
  )
}
