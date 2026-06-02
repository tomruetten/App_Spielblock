import styles from './GameTile.module.css'

export default function GameTile({ game, index, onClick }) {
  return (
    <button
      className={`${styles.tile} glass`}
      style={{ animationDelay: `${index * 80 + 80}ms` }}
      onClick={onClick}
    >
      <span className={styles.dot} style={{ background: game.color }} />
      <span className={styles.name}>{game.name}</span>
    </button>
  )
}
