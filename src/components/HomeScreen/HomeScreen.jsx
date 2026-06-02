import GameTile from '../GameTile/GameTile.jsx'
import styles from './HomeScreen.module.css'

const GAMES = [
  {
    id: 'generic',
    name: 'Punkte\nblock',
    displayName: 'Punkteblock',
    color: '#7C3AED',
    bg: 'linear-gradient(145deg, #8B5CF6, #6D28D9)'
  },
  {
    id: 'kniffel',
    name: 'Kniffel',
    displayName: 'Kniffel',
    color: '#DC2626',
    bg: 'linear-gradient(145deg, #EF4444, #B91C1C)'
  },
  {
    id: 'qwixx',
    name: 'Qwixx',
    displayName: 'Qwixx',
    color: '#0284C7',
    bg: null // special multicolor
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
