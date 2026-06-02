import styles from './GameTile.module.css'

// Qwixx-specific: 4 colored stripes at bottom of tile
function QwixxStripes() {
  return (
    <div className={styles.stripes}>
      <span style={{ background: '#E8251E' }} />
      <span style={{ background: '#F5C800' }} />
      <span style={{ background: '#2DA44E' }} />
      <span style={{ background: '#0E6EC4' }} />
    </div>
  )
}

export default function GameTile({ game, index, onClick }) {
  const bg = game.bg || 'linear-gradient(145deg, #0284C7, #0369A1)'

  return (
    <button
      className={styles.tile}
      style={{ background: bg, animationDelay: `${index * 90 + 60}ms` }}
      onClick={onClick}
    >
      {game.id === 'qwixx' && <QwixxStripes />}
      <span className={styles.name}>{game.displayName}</span>
    </button>
  )
}
