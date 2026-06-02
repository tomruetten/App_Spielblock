import {
  UPPER_FIELDS,
  LOWER_FIELDS,
  upperSum,
  bonusValue,
  bonusRemaining,
  lowerSum,
  grandTotal,
  BONUS_THRESHOLD
} from '../../../utils/kniffelRules.js'
import styles from './KniffelGame.module.css'

function Cell({ value, onTap, color }) {
  const filled = value !== null && value !== undefined
  const struck = filled && value === 0
  const filledStyle = filled && !struck && color
    ? { background: `${color}22`, color }
    : {}
  return (
    <button
      className={`${styles.cell} ${filled ? styles.cellFilled : ''} ${struck ? styles.cellStruck : ''}`}
      style={filledStyle}
      onClick={onTap}
    >
      {filled ? (struck ? '–' : value) : ''}
    </button>
  )
}

function SummaryCell({ value, accent, color }) {
  const style = accent && color ? { background: color, color: '#fff' } : {}
  return (
    <div className={`${styles.cell} ${styles.summaryCell} ${accent ? styles.summaryAccent : ''}`} style={style}>
      {value}
    </div>
  )
}

export default function ScoreSheet({ players, onCellTap, onRemovePlayer }) {
  const gridStyle = { '--players': players.length }

  const renderFieldRow = (field) => (
    <div className={styles.row} key={field.key} style={gridStyle}>
      <div className={styles.rowLabel}>
        <span className={styles.rowName}>{field.label}</span>
        <span className={styles.rowHint}>{field.hint}</span>
      </div>
      {players.map((p) => (
        <Cell
          key={p.id}
          value={p.card[field.key]}
          onTap={() => onCellTap(p.id, field)}
          color={p.color}
        />
      ))}
    </div>
  )

  const renderSummaryRow = (label, fn, accent) => (
    <div className={`${styles.row} ${styles.summaryRow}`} style={gridStyle}>
      <div className={styles.rowLabel}>
        <span className={styles.rowName}>{label}</span>
      </div>
      {players.map((p) => (
        <SummaryCell key={p.id} value={fn(p.card)} accent={accent} color={p.color} />
      ))}
    </div>
  )

  return (
    <div className={`${styles.sheet2} glass`}>
      {/* Spielernamen-Kopf */}
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

      <div className={styles.sectionLabel}>Oberer Block</div>
      {UPPER_FIELDS.map(renderFieldRow)}

      {renderSummaryRow('Zwischensumme', upperSum)}
      <div className={`${styles.row} ${styles.summaryRow}`} style={gridStyle}>
        <div className={styles.rowLabel}>
          <span className={styles.rowName}>Bonus</span>
          <span className={styles.rowHint}>bei ≥ {BONUS_THRESHOLD} → +35</span>
        </div>
        {players.map((p) => {
          const bonus = bonusValue(p.card)
          const remaining = bonusRemaining(p.card)
          return (
            <div
              key={p.id}
              className={`${styles.cell} ${styles.summaryCell} ${bonus ? styles.summaryAccent : ''}`}
              style={bonus && p.color ? { background: p.color, color: '#fff' } : {}}
            >
              {bonus ? '+35' : remaining > 0 ? `−${remaining}` : '0'}
            </div>
          )
        })}
      </div>

      <div className={styles.sectionLabel}>Unterer Block</div>
      {LOWER_FIELDS.map(renderFieldRow)}

      {renderSummaryRow('Gesamt', grandTotal, true)}
    </div>
  )
}
