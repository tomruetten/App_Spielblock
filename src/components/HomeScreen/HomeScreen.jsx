import GameTile from '../GameTile/GameTile.jsx'
import styles from './HomeScreen.module.css'

const GAMES = [
  {
    id: 'generic',
    name: 'Punkteblock',
    color: '#6C3CE1'
  },
  {
    id: 'kniffel',
    name: 'Kniffel',
    color: '#FF6B6B'
  },
  {
    id: 'qwixx',
    name: 'Qwixx',
    color: '#0A84FF'
  }
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
