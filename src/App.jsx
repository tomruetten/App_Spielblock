import { useState } from 'react'
import HomeScreen from './components/HomeScreen/HomeScreen.jsx'
import GenericScoreGame from './components/games/GenericScore/GenericScoreGame.jsx'
import KniffelGame from './components/games/Kniffel/KniffelGame.jsx'
import QwixxGame from './components/games/Qwixx/QwixxGame.jsx'

const GAMES = {
  generic: GenericScoreGame,
  kniffel: KniffelGame,
  qwixx: QwixxGame
}

export default function App() {
  const [screen, setScreen] = useState('home')

  const goHome = () => setScreen('home')

  if (screen === 'home') {
    return <HomeScreen onSelect={setScreen} />
  }

  const GameComponent = GAMES[screen]
  return <GameComponent onBack={goHome} />
}
