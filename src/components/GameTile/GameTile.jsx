import styles from './GameTile.module.css'

export default function GameTile({ game, index, onClick }) {
  return (
    <button
      className={styles.tile}
      style={{ '--game-accent': game.accent, animationDelay: `${index * 90 + 60}ms` }}
      onClick={onClick}
    >
      <div className={styles.accentBar} />
      <span className={styles.name}>{game.displayName}</span>
    </button>
  )
}
