import { useState, useEffect, useMemo } from 'react'
import GameHeader from '../../GameHeader/GameHeader.jsx'
import GameOver from '../../GameOver/GameOver.jsx'
import ScoreSheet from './ScoreSheet.jsx'
import { useLocalStorage } from '../../../hooks/useLocalStorage.js'
import {
  PHASES,
  PHASE_COUNT,
  createScorecard,
  currentPhaseIndex,
  isCardComplete,
  grandTotal,
  isFinalRound,
  isGameOver as computeGameOver
} from '../../../utils/phase10Rules.js'
import { buildRanking } from '../../../utils/ranking.js'
import { PLAYER_COLORS } from '../../../utils/playerColors.js'
import styles from './Phase10Game.module.css'

const STORAGE_KEY = 'spieleblock_phase10'

let nextId = Date.now()
const makeId = () => `p10_${nextId++}`

function emptyState() {
  return { players: [] }
}

export default function Phase10Game({ config, onBack, onRestart }) {
  const [state, setState] = useLocalStorage(STORAGE_KEY, emptyState())
  const [editing, setEditing] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (config?.players?.length && state.players.length === 0) {
      setState({
        players: config.players.map((name, idx) => ({
          id: makeId(),
          name,
          color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
          card: createScorecard(),
          locked: false
        }))
      })
    }
  }, [])

  const players = state.players

  const finalRound = useMemo(() => isFinalRound(players), [players])
  const isGameOver = useMemo(() => computeGameOver(players), [players])

  const ranking = useMemo(
    () => buildRanking(
      players.map((p) => ({ name: p.name, color: p.color, score: grandTotal(p.card) }))
    ),
    [players]
  )

  const winner = useMemo(() => {
    if (!isGameOver) return null
    const scores = players.map((p) => grandTotal(p.card))
    const best = Math.max(...scores)
    const winners = players.filter((_, i) => scores[i] === best)
    if (winners.length > 1) {
      return { name: winners.map((w) => w.name).join(' & '), color: '#FBBF24', score: best, tie: true }
    }
    return { name: winners[0].name, color: winners[0].color, score: best }
  }, [isGameOver, players])

  const removePlayer = (id) =>
    setState((s) => ({ ...s, players: s.players.filter((p) => p.id !== id) }))

  const setPhaseValue = (playerId, phaseIdx, value) => {
    setState((s) => ({
      ...s,
      players: s.players.map((p) => {
        if (p.id !== playerId) return p
        const card = [...p.card]
        card[phaseIdx] = value
        return { ...p, card }
      })
    }))
    setEditing(null)
  }

  const clearPhaseValue = (playerId, phaseIdx) => setPhaseValue(playerId, phaseIdx, null)

  const setLocked = (playerId, locked) => {
    setState((s) => ({
      ...s,
      players: s.players.map((p) => (p.id === playerId ? { ...p, locked } : p))
    }))
    setEditing(null)
  }

  const editingPlayer = editing ? players.find((p) => p.id === editing.playerId) : null

  return (
    <div className={styles.screen}>
      <GameHeader title="Phase 10" onBack={onBack} onRestart={onRestart} />

      <div className={styles.body}>
        {players.length === 0 ? (
          <div className={styles.empty}>
            <p>Kein Spiel aktiv.</p>
          </div>
        ) : (
          <>
            {finalRound && !isGameOver && (
              <div className={`${styles.banner} glass`}>
                🏁 Ein Spieler hat Phase 10 geschafft! Die anderen haben noch eine
                letzte Chance, ihre Phasen fertigzuspielen.
              </div>
            )}
            <ScoreSheet
              players={players}
              onCellTap={(playerId, phaseIdx) => setEditing({ playerId, phaseIdx })}
              onRemovePlayer={removePlayer}
            />
          </>
        )}
      </div>

      {editing && editingPlayer && (
        <ValueSheet
          player={editingPlayer}
          phaseIdx={editing.phaseIdx}
          finalRound={finalRound}
          onSave={(val) => setPhaseValue(editing.playerId, editing.phaseIdx, val)}
          onClear={() => clearPhaseValue(editing.playerId, editing.phaseIdx)}
          onGiveUp={() => setLocked(editing.playerId, true)}
          onUndoGiveUp={() => setLocked(editing.playerId, false)}
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

/* ---------- Eingabe-Sheet ---------- */

function ValueSheet({ player, phaseIdx, finalRound, onSave, onClear, onGiveUp, onUndoGiveUp, onClose }) {
  const phase = PHASES[phaseIdx]
  const current = player.card[phaseIdx]
  const active = currentPhaseIndex(player.card)
  const isOpenCell = current === null && !player.locked && phaseIdx === active
  const isGaveUpCell = current === null && player.locked && phaseIdx === active
  const isLastFilled = current !== null && (
    isCardComplete(player.card) ? phaseIdx === PHASE_COUNT - 1 : phaseIdx === active - 1
  )

  const [manual, setManual] = useState(current !== null ? String(current) : '')
  const [keyboardInset, setKeyboardInset] = useState(0)

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [])

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      setKeyboardInset(Math.max(0, window.innerHeight - vv.height - vv.offsetTop))
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  const submitManual = () => {
    const num = parseInt(manual, 10)
    onSave(Number.isNaN(num) ? 0 : Math.max(0, num))
  }

  return (
    <div className={styles.sheetBackdrop} onClick={onClose}>
      <div
        className={`${styles.sheet} glass`}
        style={{ marginBottom: keyboardInset }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.sheetHandle} />
        <h3 className={styles.sheetTitle}>Phase {phase.number} · {phase.label}</h3>
        <p className={styles.sheetHint}>{phase.hint}</p>

        {isGaveUpCell ? (
          <>
            <p className={styles.giveUpInfo}>
              {player.name} hat diese Phase in der Schlussrunde nicht geschafft –
              das Spiel ist für {player.name} beendet.
            </p>
            <button className={styles.strikeBtn} onClick={onUndoGiveUp}>
              ↺ Aufgabe rückgängig machen
            </button>
          </>
        ) : (
          <>
            <div className={styles.manualRow}>
              <input
                className={styles.manualInput}
                type="number"
                inputMode="numeric"
                autoFocus
                value={manual}
                placeholder="Punkte"
                onChange={(e) => setManual(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitManual()}
              />
              <button className="btn-primary" onClick={submitManual}>
                {isOpenCell ? 'Phase geschafft' : 'Speichern'}
              </button>
            </div>

            {isOpenCell && (
              <p className={styles.sheetFootnote}>
                Nicht geschafft? Einfach schließen – dann geht's in der nächsten
                Runde mit derselben Phase weiter.
              </p>
            )}

            {isOpenCell && finalRound && (
              <button className={styles.giveUpBtn} onClick={onGiveUp}>
                🚫 Nicht geschafft – Schlussrunde beenden
              </button>
            )}

            {isLastFilled && (
              <button className={styles.clearBtn} onClick={onClear}>
                Eintrag löschen
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
