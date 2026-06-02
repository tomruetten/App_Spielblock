import { LOCK_INDEX } from '../../../utils/qwixxRules.js'
import styles from './QwixxGame.module.css'

export default function QwixxRow({ row, rowArr, locked, canCheck, onToggle }) {
  return (
    <div
      className={`${styles.qrow} ${locked ? styles.qrowLocked : ''}`}
      style={{ '--row-color': row.color }}
    >
      <div className={styles.rowTag}>{row.label}</div>

      <div className={styles.cells}>
        {row.numbers.map((num, idx) => {
          const isLock = idx === LOCK_INDEX
          const checked = rowArr[idx]
          const allowed = canCheck(idx)
          const disabled = !checked && !allowed

          return (
            <button
              key={idx}
              className={`${styles.qcell} ${checked ? styles.qcellChecked : ''} ${
                disabled ? styles.qcellDisabled : ''
              } ${isLock ? styles.qcellLock : ''}`}
              onClick={() => onToggle(idx)}
              disabled={disabled && !checked}
            >
              {isLock ? (checked ? '🔒' : '🔓') : num}
              {checked && !isLock && <span className={styles.mark}>✕</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
