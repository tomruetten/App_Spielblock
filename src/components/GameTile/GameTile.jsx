import styles from './GameTile.module.css'

export default function GameTile({ game, index, onClick }) {
  return (
    <button
      className={`${styles.tile} glass`}
      style={{ animationDelay: `${index * 90 + 60}ms` }}
      onClick={onClick}
    >
      <div className={styles.coverWrap}>
        <img src={game.cover} alt={game.name} className={styles.cover} draggable={false} />
      </div>
      <span className={styles.name}>{game.name}</span>
    </button>
  )
}
