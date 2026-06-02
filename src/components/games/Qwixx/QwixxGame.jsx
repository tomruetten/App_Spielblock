import { useState, useEffect } from 'react'
import GameHeader from '../../GameHeader/GameHeader.jsx'
import QwixxRow from './QwixxRow.jsx'
import { useLocalStorage } from '../../../hooks/useLocalStorage.js'
import {
  ROWS,
  LOCK_INDEX,
  MAX_MISSES,
  createPlayerRows,
  canCheck,
  playerScore
} from '../../../utils/qwixxRules.js'
import styles from './QwixxGame.module.css'

const STORAGE_KEY = 'spieleblock_qwixx'

let nextId = Date.now()
const makeId = () => `q${nextId++}`

function emptyState() {
  return {
    players: [],
    lockedRows: { red: false, yellow: false, green: false, blue: false }
  }
}

export default function QwixxGame({ config, onBack }) {
  const [state, setState] = useLocalStorage(STORAGE_KEY, emptyState())
  const [newName, setNewName] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const [hideAddRow, setHideAddRow] = useState(() => !!(config?.players?.length))

  const players = state.players
  const lockedRows = state.lockedRows

  useEffect(() => {
    if (config?.players && config.players.length > 0 && state.players.length === 0) {
      setState({
        players: config.players.map((name) => ({
          id: makeId(),
          name,
          rows: createPlayerRows(),
          misses: 0
        })),
        lockedRows: { red: false, yellow: false, green: false, blue: false }
      })
    }
  }, [])

  // Aktiven Index in Grenzen halten
  useEffect(() => {
    if (activeIdx >= players.length && players.length > 0) {
      setActiveIdx(players.length - 1)
    }
  }, [players.length, activeIdx])

  const active = players[activeIdx]

  const addPlayer = () => {
    const name = newName.trim()
    if (!name) return
    setState((s) => ({
      ...s,
      players: [...s.players, { id: makeId(), name, rows: createPlayerRows(), misses: 0 }]
    }))
    setNewName('')
    setActiveIdx(players.length)
  }

  const removePlayer = (id) => {
    setState((s) => ({ ...s, players: s.players.filter((p) => p.id !== id) }))
  }

  const toggleCell = (rowKey, index) => {
    if (!active) return
    const rowArr = active.rows[rowKey]
    if (!canCheck(rowArr, index, lockedRows[rowKey])) return

    const willCheck = !rowArr[index]

    setState((s) => {
      const players = s.players.map((p) => {
        if (p.id !== active.id) return p
        const newRow = p.rows[rowKey].map((v, i) => (i === index ? !v : v))
        return { ...p, rows: { ...p.rows, [rowKey]: newRow } }
      })

      let lockedRows = s.lockedRows
      if (index === LOCK_INDEX && willCheck) {
        lockedRows = { ...s.lockedRows, [rowKey]: true }
      }
      return { ...s, players, lockedRows }
    })
  }

  const changeMisses = (delta) => {
    if (!active) return
    setState((s) => ({
      ...s,
      players: s.players.map((p) =>
        p.id === active.id
          ? { ...p, misses: Math.max(0, Math.min(MAX_MISSES, p.misses + delta)) }
          : p
      )
    }))
  }

  const reset = () => {
    if (window.confirm('Neues Spiel starten? Alle Kreuze werden gelöscht.')) {
      setState(emptyState())
      setActiveIdx(0)
      setHideAddRow(false)
    }
  }

  return (
    <div className={styles.screen}>
      <GameHeader title="Qwixx" onBack={onBack} onReset={reset} />

      <div className={styles.body}>
        {players.length === 0 ? (
          <>
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
            <div className={styles.empty}>
              <span className={styles.emptyEmoji}>🎯</span>
              <p>Füge Spieler hinzu, um zu starten.</p>
            </div>
          </>
        ) : (
          <>
            {/* Spieler-Tabs */}
            <div className={`${styles.tabs} no-scrollbar`}>
              {players.map((p, i) => (
                <button
                  key={p.id}
                  className={`${styles.tab} ${i === activeIdx ? styles.tabActive : ''}`}
                  onClick={() => setActiveIdx(i)}
                >
                  <span className={styles.tabName}>{p.name}</span>
                  <span className={styles.tabScore}>{playerScore(p)}</span>
                </button>
              ))}
              <button className={styles.addTab} onClick={() => setActiveIdx(-1)}>＋</button>
            </div>

            {activeIdx === -1 ? (
              <div className={`${styles.addRow} glass`}>
                <input
                  className={styles.input}
                  value={newName}
                  autoFocus
                  placeholder="Neuer Spieler"
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                />
                <button className="btn-primary" onClick={addPlayer}>＋</button>
              </div>
            ) : active ? (
              <>
                {ROWS.map((row) => (
                  <QwixxRow
                    key={row.key}
                    row={row}
                    rowArr={active.rows[row.key]}
                    locked={lockedRows[row.key]}
                    canCheck={(idx) => canCheck(active.rows[row.key], idx, lockedRows[row.key])}
                    onToggle={(idx) => toggleCell(row.key, idx)}
                  />
                ))}

                {/* Fehlwürfe + Score */}
                <div className={`${styles.footer} glass`}>
                  <div className={styles.missesBlock}>
                    <span className={styles.missesLabel}>Fehlwürfe</span>
                    <div className={styles.missDots}>
                      {Array.from({ length: MAX_MISSES }).map((_, i) => (
                        <button
                          key={i}
                          className={`${styles.missDot} ${i < active.misses ? styles.missActive : ''}`}
                          onClick={() => changeMisses(i < active.misses ? -1 : 1)}
                          aria-label={`Fehlwurf ${i + 1}`}
                        >
                          ✕
                        </button>
                      ))}
                    </div>
                    <span className={styles.missPenalty}>−{active.misses * 5}</span>
                  </div>

                  <div className={styles.scoreBlock}>
                    <span className={styles.scoreLabel}>Punkte</span>
                    <span className={styles.scoreValue}>{playerScore(active)}</span>
                  </div>
                </div>

                <button
                  className={styles.removePlayer}
                  onClick={() => removePlayer(active.id)}
                >
                  {active.name} entfernen
                </button>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

