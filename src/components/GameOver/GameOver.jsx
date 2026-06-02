import styles from './GameOver.module.css'

const CONF_COLORS = [
  '#10B981', '#38BDF8', '#F472B6', '#FBBF24',
  '#FB923C', '#4ADE80', '#60A5FA', '#E879F9',
  '#F43F5E', '#34D399', '#93C5FD', '#FDE68A',
]

export default function GameOver({ winner, onRestart, onDismiss }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.confetti} aria-hidden="true">
        {Array.from({ length: 48 }).map((_, i) => (
          <span
            key={i}
            className={styles.piece}
            style={{
              '--color': CONF_COLORS[i % CONF_COLORS.length],
              '--left': `${((i * 2.1 + i % 7) % 100).toFixed(1)}%`,
              '--delay': `${((i * 0.09) % 1.6).toFixed(2)}s`,
              '--dur': `${(1.2 + (i % 8) * 0.12).toFixed(2)}s`,
              '--w': i % 3 === 0 ? '10px' : i % 3 === 1 ? '7px' : '5px',
              '--h': i % 3 === 0 ? '16px' : i % 3 === 1 ? '10px' : '8px',
              '--shape': i % 4 === 0 ? '50%' : '2px',
            }}
          />
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.icon} style={{ color: winner.color }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.7"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H2V4h4m12 5h4V4h-4" />
            <path d="M6 4h12v7a6 6 0 0 1-12 0V4z" />
            <path d="M12 17v4M8 21h8" />
          </svg>
        </div>

        <p className={styles.label}>{winner.tie ? 'Unentschieden' : 'Gewinner'}</p>
        <h2 className={styles.name} style={{ color: winner.color }}>{winner.name}</h2>
        <p className={styles.score}>{winner.score} Punkte</p>

        <div className={styles.actions}>
          <button className="btn-primary" onClick={onRestart}>Neues Spiel</button>
          <button className={styles.dismissBtn} onClick={onDismiss}>Schließen</button>
        </div>
      </div>
    </div>
  )
}
