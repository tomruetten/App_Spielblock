import GameTile from '../GameTile/GameTile.jsx'
import styles from './HomeScreen.module.css'

const GAMES = [
  {
    id: 'generic',
    name: 'Punkteblock',
    cover: '/App_Spielblock/covers/punkteblock.svg'
  },
  {
    id: 'kniffel',
    name: 'Kniffel',
    cover: '/App_Spielblock/covers/kniffel.svg'
  },
  {
    id: 'qwixx',
    name: 'Qwixx',
    cover: '/App_Spielblock/covers/qwixx.svg'
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
