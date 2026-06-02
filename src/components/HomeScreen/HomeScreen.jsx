import GameTile from '../GameTile/GameTile.jsx'
import styles from './HomeScreen.module.css'

const GAMES = [
  { id: 'generic', displayName: 'Punkteblock', accent: '#F97316' },
  { id: 'kniffel', displayName: 'Kniffel',     accent: '#EF4444' },
  { id: 'qwixx',   displayName: 'Qwixx',       accent: '#3B82F6' }
]

export default function HomeScreen({ onSelect }) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>Spieleblock</h1>
      </header>

      <div className={styles.grid}>
        {GAMES.map((game, i) => (
          <GameTile
            key={game.id}
            game={game}
            index={i}
            onClick={() => onSelect(game.id)}
          />
        ))}
      </div>
    </div>
  )
}
