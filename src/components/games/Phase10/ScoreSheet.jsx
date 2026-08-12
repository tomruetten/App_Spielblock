import { Fragment } from 'react'
import {
  PHASES,
  PHASE5_BONUS_THRESHOLD,
  PHASE5_BONUS_VALUE,
  PHASE10_BONUS_VALUE,
  currentPhaseIndex,
  isCardComplete,
  phase5BonusStatus,
  phase10BonusStatus,
  grandTotal
} from '../../../utils/phase10Rules.js'
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

function BonusCell({ status, value }) {
  const label = status === 'earned' ? `+${value}` : status === 'missed' ? '0' : '–'
  return (
    <div
      className={`${styles.cell} ${styles.summaryCell} ${status === 'earned' ? styles.bonusEarned : ''}`}
    >
      {label}
    </div>
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
        <Fragment key={phase.number}>
          <div className={styles.row} style={gridStyle}>
            <div className={styles.rowLabel}>
              <span className={styles.phaseBadge}>{phase.number}</span>
              <div className={styles.rowText}>
                <span className={styles.rowName}>{phase.label}</span>
                <span className={styles.rowMax}>max. {phase.maxPoints}</span>
              </div>
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

          {phase.number === 5 && (
            <div className={`${styles.row} ${styles.bonusRow}`} style={gridStyle}>
              <div className={styles.rowLabel}>
                <span className={styles.bonusIcon}>🎁</span>
                <div className={styles.rowText}>
                  <span className={styles.rowName}>Bonus ab {PHASE5_BONUS_THRESHOLD} Punkten</span>
                  <span className={styles.rowMax}>nach Phase 5 · +{PHASE5_BONUS_VALUE}</span>
                </div>
              </div>
              {players.map((p) => (
                <BonusCell key={p.id} status={phase5BonusStatus(p.card)} value={PHASE5_BONUS_VALUE} />
              ))}
            </div>
          )}

          {phase.number === 10 && (
            <div className={`${styles.row} ${styles.bonusRow}`} style={gridStyle}>
              <div className={styles.rowLabel}>
                <span className={styles.bonusIcon}>🏆</span>
                <div className={styles.rowText}>
                  <span className={styles.rowName}>Bonus: alle 10 Phasen</span>
                  <span className={styles.rowMax}>bei Abschluss · +{PHASE10_BONUS_VALUE}</span>
                </div>
              </div>
              {players.map((p) => (
                <BonusCell key={p.id} status={phase10BonusStatus(p)} value={PHASE10_BONUS_VALUE} />
              ))}
            </div>
          )}
        </Fragment>
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
            {grandTotal(p)}
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
