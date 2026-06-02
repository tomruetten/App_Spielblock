import { useState, useEffect } from 'react'
import GameHeader from '../../GameHeader/GameHeader.jsx'
import ScoreSheet from './ScoreSheet.jsx'
import { useLocalStorage } from '../../../hooks/useLocalStorage.js'
import { UPPER_FIELDS, createScorecard } from '../../../utils/kniffelRules.js'
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

  useEffect(() => {
    if (config?.players?.length && state.players.length === 0) {
      setState({
        players: config.players.map((name) => ({
          id: makeId(),
          name,
          card: createScorecard()
        }))
      })
    }
  }, [])

  const players = state.players

  const removePlayer = (id) =>
    setState((s) => ({ ...s, players: s.players.filter((p) => p.id !== id) }))

  const setValue = (playerId, fieldKey, value) => {
    setState((s) => ({
      ...s,
      players: s.players.map((p) =>
        p.id === playerId
          ? { ...p, card: { ...p.card, [fieldKey]: value } }
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
          onPick={(val) => setValue(editing.playerId, editing.field.key, val)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

/* ---------- Eingabe-Sheet ---------- */

function ValueSheet({ field, current, onPick, onClose }) {
  const [manual, setManual] = useState(
    current !== null && current !== undefined ? String(current) : ''
  )

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

  return (
    <div className={styles.sheetBackdrop} onClick={onClose}>
      <div
        className={`${styles.sheet} glass`}
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

        {current !== null && current !== undefined && (
          <button className={styles.clearBtn} onClick={() => onPick(null)}>
            Eintrag löschen
          </button>
        )}
      </div>
    </div>
  )
}

