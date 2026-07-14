import { useState, useEffect, useMemo } from 'react'
import GameHeader from '../../GameHeader/GameHeader.jsx'
import GameOver from '../../GameOver/GameOver.jsx'
import ScoreSheet from './ScoreSheet.jsx'
import { useLocalStorage } from '../../../hooks/useLocalStorage.js'
import {
  UPPER_FIELDS,
  ALL_FIELDS,
  createScorecard,
  grandTotal,
  KNIFFEL_VALUE,
  kniffelBonusCount
} from '../../../utils/kniffelRules.js'
import { buildRanking } from '../../../utils/ranking.js'
import { PLAYER_COLORS } from '../../../utils/playerColors.js'
import styles from './KniffelGame.module.css'

const STORAGE_KEY = 'spieleblock_kniffel'

let nextId = Date.now()
const makeId = () => `k${nextId++}`

function emptyState() {
  return { players: [] }
}

export default function KniffelGame({ config, onBack, onRestart }) {
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
          card: createScorecard()
        }))
      })
    }
  }, [])

  const players = state.players

  const isGameOver = useMemo(() => {
    if (players.length === 0) return false
    return players.every((p) => ALL_FIELDS.every((f) => p.card[f.key] !== null))
  }, [players])

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

  const setValue = (playerId, fieldKey, value) => {
    setState((s) => ({
      ...s,
      players: s.players.map((p) => {
        if (p.id !== playerId) return p
        const card = { ...p.card, [fieldKey]: value }
        // Wird der Kniffel gestrichen/gelöscht, entfallen auch die Bonus-Kniffel
        if (fieldKey === 'kniffel' && value !== KNIFFEL_VALUE) card.kniffelBonus = 0
        return { ...p, card }
      })
    }))
    setEditing(null)
  }

  const changeKniffelBonus = (playerId, delta) => {
    setState((s) => ({
      ...s,
      players: s.players.map((p) =>
        p.id === playerId
          ? { ...p, card: { ...p.card, kniffelBonus: Math.max(0, (p.card.kniffelBonus ?? 0) + delta) } }
          : p
      )
    }))
    // Popup schließen wie bei jeder anderen Eingabe
    setEditing(null)
  }

  const editingPlayer = editing
    ? players.find((p) => p.id === editing.playerId)
    : null

  return (
    <div className={styles.screen}>
      <GameHeader title="Kniffel" onBack={onBack} onRestart={onRestart} />

      <div className={styles.body}>
        {players.length === 0 ? (
          <div className={styles.empty}>
            <p>Kein Spiel aktiv.</p>
          </div>
        ) : (
          <ScoreSheet
            players={players}
            onCellTap={(playerId, field) => setEditing({ playerId, field })}
            onRemovePlayer={removePlayer}
          />
        )}
      </div>

      {editing && editingPlayer && (
        <ValueSheet
          field={editing.field}
          current={editingPlayer.card[editing.field.key]}
          bonusCount={kniffelBonusCount(editingPlayer.card)}
          onPick={(val) => setValue(editing.playerId, editing.field.key, val)}
          onBonusChange={(delta) => changeKniffelBonus(editing.playerId, delta)}
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

function ValueSheet({ field, current, bonusCount = 0, onPick, onBonusChange, onClose }) {
  const [manual, setManual] = useState(
    current !== null && current !== undefined ? String(current) : ''
  )
  const [keyboardInset, setKeyboardInset] = useState(0)

  // Body-Scroll sperren, solange das Sheet offen ist
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [])

  // Sheet über die eingeblendete Tastatur anheben (visualViewport-Höhe ändert sich)
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

  // Optionen je Feldtyp
  let options = null
  const upper = UPPER_FIELDS.find((f) => f.key === field.key)
  if (upper) {
    const face = UPPER_FIELDS.indexOf(upper) + 1
    options = Array.from({ length: 6 }, (_, i) => i * face) // 0..5 Würfel
  } else if (field.fixed != null) {
    options = [field.fixed, 0] // erreicht oder gestrichen
  }

  const submitManual = () => {
    const num = parseInt(manual, 10)
    onPick(Number.isNaN(num) ? 0 : Math.max(0, num))
  }

  // Mehrfach-Kniffel: nur anbieten, wenn bereits ein gültiger Kniffel (50) steht
  const isKniffelField = field.key === 'kniffel'
  const showBonus = isKniffelField && current === KNIFFEL_VALUE
  const bonusTotal = KNIFFEL_VALUE + bonusCount * 100

  return (
    <div className={styles.sheetBackdrop} onClick={onClose}>
      <div
        className={`${styles.sheet} glass`}
        style={{ marginBottom: keyboardInset }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.sheetHandle} />
        <h3 className={styles.sheetTitle}>{field.label}</h3>
        <p className={styles.sheetHint}>{field.hint}</p>

        {options ? (
          <div className={styles.chipGrid}>
            {options.map((opt) => (
              <button
                key={opt}
                className={`${styles.chip} ${current === opt ? styles.chipActive : ''}`}
                onClick={() => onPick(opt)}
              >
                {opt === 0 ? '✕ Streichen' : opt}
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.manualRow}>
            <input
              className={styles.manualInput}
              type="number"
              inputMode="numeric"
              autoFocus
              value={manual}
              placeholder="Summe"
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitManual()}
            />
            <button className="btn-primary" onClick={submitManual}>OK</button>
            <button className={styles.strikeBtn} onClick={() => onPick(0)}>
              ✕ Streichen
            </button>
          </div>
        )}

        {showBonus && (
          <div className={styles.bonusBox}>
            <div className={styles.bonusInfo}>
              <span className={styles.bonusTitle}>Weiterer Kniffel</span>
              <span className={styles.bonusHint}>
                {bonusCount > 0
                  ? `${bonusCount}× Bonus · Kniffel gesamt ${bonusTotal} Punkte`
                  : 'Nochmal Kniffel geworfen? +100 Punkte'}
              </span>
            </div>
            <div className={styles.bonusControls}>
              {bonusCount > 0 && (
                <button
                  className={styles.bonusMinus}
                  onClick={() => onBonusChange(-1)}
                  aria-label="Bonus-Kniffel entfernen"
                >
                  −
                </button>
              )}
              <button className={styles.bonusAdd} onClick={() => onBonusChange(1)}>
                ＋100 Punkte
              </button>
            </div>
          </div>
        )}

        {current !== null && current !== undefined && (
          <button className={styles.clearBtn} onClick={() => onPick(null)}>
            Eintrag löschen
          </button>
        )}
      </div>
    </div>
  )
}

