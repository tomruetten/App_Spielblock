import { useState } from 'react'
import styles from './SetupModal.module.css'

export default function SetupModal({
  gameType,
  onConfirm,
  onCancel
}) {
  const [players, setPlayers] = useState(['', ''])
  const [winMode, setWinMode] = useState('high')
  const [targetScore, setTargetScore] = useState('')

  const updatePlayer = (idx, name) => {
    const newPlayers = [...players]
    newPlayers[idx] = name
    setPlayers(newPlayers)
  }

  const addPlayer = () => {
    setPlayers([...players, ''])
  }

  const removePlayer = (idx) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== idx))
    }
  }

  const handleConfirm = () => {
    const config = {
      players: players.filter(p => p.trim()),
      ...(gameType === 'generic' && {
        winMode,
        targetScore: targetScore ? parseInt(targetScore) : null
      })
    }
    onConfirm(config)
  }

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} glass`}>
        <h2 className={styles.title}>Spieler eingeben</h2>

        <div className={styles.players}>
          {players.map((name, idx) => (
            <div key={idx} className={styles.playerRow}>
              <input
                type="text"
                value={name}
                onChange={(e) => updatePlayer(idx, e.target.value)}
                placeholder={`Spieler ${idx + 1}`}
                className={styles.playerInput}
              />
              <button
                onClick={() => removePlayer(idx)}
                disabled={players.length === 1}
                className={styles.removeBtn}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button onClick={addPlayer} className={styles.addBtn}>
          + Spieler hinzufügen
        </button>

        {gameType === 'generic' && (
          <div className={styles.options}>
            <div className={styles.optionGroup}>
              <label className={styles.label}>Gewinnmodus</label>
              <div className={styles.toggleGroup}>
                <button
                  className={`${styles.toggle} ${winMode === 'high' ? styles.active : ''}`}
                  onClick={() => setWinMode('high')}
                >
                  Höchste Punkte
                </button>
                <button
                  className={`${styles.toggle} ${winMode === 'low' ? styles.active : ''}`}
                  onClick={() => setWinMode('low')}
                >
                  Niedrigste Punkte
                </button>
              </div>
            </div>

            <div className={styles.optionGroup}>
              <label className={styles.label}>Spielendstand (optional)</label>
              <input
                type="number"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                placeholder="z.B. 100"
                className={styles.numberInput}
              />
            </div>
          </div>
        )}

        <div className={styles.buttons}>
          <button onClick={onCancel} className="btn-ghost">
            Abbrechen
          </button>
          <button onClick={handleConfirm} className="btn-primary">
            Spiel starten
          </button>
        </div>
      </div>
    </div>
  )
}
