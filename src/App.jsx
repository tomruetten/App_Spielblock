import { useState } from 'react'
import HomeScreen from './components/HomeScreen/HomeScreen.jsx'
import SetupModal from './components/SetupModal/SetupModal.jsx'
import GenericScoreGame from './components/games/GenericScore/GenericScoreGame.jsx'
import KniffelGame from './components/games/Kniffel/KniffelGame.jsx'
import QwixxGame from './components/games/Qwixx/QwixxGame.jsx'

const GAMES = {
  generic: GenericScoreGame,
  kniffel: KniffelGame,
  qwixx: QwixxGame
}

const STORAGE_KEYS = {
  generic: 'spieleblock_generic',
  kniffel: 'spieleblock_kniffel',
  qwixx: 'spieleblock_qwixx'
}

function hasExistingGame(gameType) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[gameType])
    if (!raw) return false
    const data = JSON.parse(raw)
    return Array.isArray(data?.players) && data.players.length > 0
  } catch {
    return false
  }
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [setupForGame, setSetupForGame] = useState(null)
  const [gameConfig, setGameConfig] = useState(null)
  const [gameKey, setGameKey] = useState(0)

  const goHome = () => {
    setScreen('home')
    setGameConfig(null)
  }

  const handleGameSelect = (gameType) => {
    if (hasExistingGame(gameType)) {
      setGameConfig(null)
      setScreen(gameType)
    } else {
      setSetupForGame(gameType)
    }
  }

  // Called from within a game to restart with new player setup
  const handleRestart = () => {
    setSetupForGame(screen)
  }

  const handleSetupConfirm = (config) => {
    const game = setupForGame
    // Clear old data so the game component initializes fresh from config
    localStorage.removeItem(STORAGE_KEYS[game])
    setGameConfig(config)
    setSetupForGame(null)
    setScreen(game)
    setGameKey(k => k + 1)
  }

  const handleSetupCancel = () => {
    setSetupForGame(null)
    // screen remains unchanged: if in a game → stay there; if home → stay home
  }

  if (setupForGame) {
    return (
      <>
        <HomeScreen onSelect={handleGameSelect} />
        <SetupModal
          gameType={setupForGame}
          onConfirm={handleSetupConfirm}
          onCancel={handleSetupCancel}
        />
      </>
    )
  }

  if (screen === 'home') {
    return <HomeScreen onSelect={handleGameSelect} />
  }

  const GameComponent = GAMES[screen]
  return (
    <GameComponent
      key={gameKey}
      config={gameConfig}
      onBack={goHome}
      onRestart={handleRestart}
    />
  )
}
