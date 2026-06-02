import GameTile from '../GameTile/GameTile.jsx'
import styles from './HomeScreen.module.css'

const GAMES = [
  {
    id: 'generic',
    name: 'Punkteblock',
    subtitle: 'Für jedes Spiel',
    emoji: '📝',
    gradient: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)'
  },
  {
    id: 'kniffel',
    name: 'Kniffel',
    subtitle: 'Würfelspiel',
    emoji: '🎲',
    gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E53)'
  },
  {
    id: 'qwixx',
    name: 'Qwixx',
    subtitle: 'Zahlen abkreuzen',
    emoji: '🎯',
    gradient: 'linear-gradient(135deg, #0A84FF, #30D158)'
  }
]

export default function HomeScreen({ onSelect }) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>Spieleblock</h1>
        <p className={styles.subtitle}>Wähle ein Spiel</p>
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
