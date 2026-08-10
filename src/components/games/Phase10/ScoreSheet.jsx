import { PHASES, currentPhaseIndex, isCardComplete, grandTotal } from '../../../utils/phase10Rules.js'
import styles from './Phase10Game.module.css'

function Cell({ state, value, onTap, color }) {
  const filled = state === 'filled'
  const style = filled && color ? { background: `${color}22`, color } : {}
  return (
    <button
      className={`${styles.cell} ${styles[`cell_${state}`]}`}
      style={style}
      onClick={onTap}
      disabled={state === 'locked'}
    >
      {state === 'filled' && value}
      {state === 'open' && '🎲'}
      {state === 'locked' && '🔒'}
      {state === 'gaveUp' && '🚫'}
    </button>
  )
}

export default function ScoreSheet({ players, onCellTap, onRemovePlayer }) {
  const gridStyle = { '--players': players.length }

  const cellStateFor = (player, phaseIdx) => {
    const active = currentPhaseIndex(player.card)
    if (player.card[phaseIdx] !== null) return 'filled'
    if (player.locked && phaseIdx === active) return 'gaveUp'
    if (phaseIdx === active) return 'open'
    return 'locked'
  }

  return (
    <div className={`${styles.sheet2} glass`}>
      <div className={`${styles.row} ${styles.headerRow}`} style={gridStyle}>
        <div className={styles.rowLabel} />
        {players.map((p) => (
          <div key={p.id} className={styles.playerHead}>
            <span className={styles.playerDot} style={{ background: p.color }} />
            <span className={styles.playerName} style={{ color: p.color }}>{p.name}</span>
            <button
              className={styles.playerRemove}
              onClick={() => onRemovePlayer(p.id)}
              aria-label={`${p.name} entfernen`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {PHASES.map((phase, idx) => (
        <div className={styles.row} key={phase.number} style={gridStyle}>
          <div className={styles.rowLabel}>
            <span className={styles.rowName}>Phase {phase.number} · {phase.label}</span>
            <span className={styles.rowHint}>{phase.hint}</span>
          </div>
          {players.map((p) => (
            <Cell
              key={p.id}
              state={cellStateFor(p, idx)}
              value={p.card[idx]}
              onTap={() => onCellTap(p.id, idx)}
              color={p.color}
            />
          ))}
        </div>
      ))}

      <div className={`${styles.row} ${styles.summaryRow}`} style={gridStyle}>
        <div className={styles.rowLabel}>
          <span className={styles.rowName}>Gesamt</span>
        </div>
        {players.map((p) => (
          <div
            key={p.id}
            className={`${styles.cell} ${styles.summaryCell} ${styles.summaryAccent}`}
          >
            {grandTotal(p.card)}
          </div>
        ))}
      </div>

      <div className={`${styles.row} ${styles.summaryRow}`} style={gridStyle}>
        <div className={styles.rowLabel}>
          <span className={styles.rowName}>Status</span>
        </div>
        {players.map((p) => {
          const done = isCardComplete(p.card)
          const label = done ? 'Fertig 🏁' : p.locked ? 'Raus' : `Phase ${currentPhaseIndex(p.card) + 1}`
          return (
            <div key={p.id} className={`${styles.cell} ${styles.summaryCell}`}>
              {label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
