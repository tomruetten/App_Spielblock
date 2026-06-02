import styles from './GameHeader.module.css'

export default function GameHeader({ title, onBack, onRestart }) {
  return (
    <header className={styles.header}>
      <button className={styles.iconBtn} onClick={onBack} aria-label="Zurück">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <h1 className={styles.title}>{title}</h1>

      {onRestart ? (
        <button className={styles.iconBtn} onClick={onRestart} aria-label="Neues Spiel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5"
              stroke="currentColor" strokeWidth="2.3"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <span className={styles.iconBtn} aria-hidden="true" />
      )}
    </header>
  )
}
