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

export default function App() {
  const [screen, setScreen] = useState('home')
  const [showSetup, setShowSetup] = useState(false)
  const [setupGameType, setSetupGameType] = useState(null)
  const [gameConfig, setGameConfig] = useState(null)

  const goHome = () => {
    setScreen('home')
    setGameConfig(null)
  }

  const handleGameSelect = (gameType) => {
    setSetupGameType(gameType)
    setShowSetup(true)
  }

  const handleSetupConfirm = (config) => {
    setGameConfig(config)
    setShowSetup(false)
    setScreen(setupGameType)
  }

  const handleSetupCancel = () => {
    setShowSetup(false)
    setSetupGameType(null)
  }

  if (screen === 'home') {
    return <HomeScreen onSelect={handleGameSelect} />
  }

  if (showSetup && setupGameType) {
    return (
      <>
        <SetupModal
          gameType={setupGameType}
          onConfirm={handleSetupConfirm}
          onCancel={handleSetupCancel}
        />
      </>
    )
  }

  const GameComponent = GAMES[screen]
  return <GameComponent config={gameConfig} onBack={goHome} />
}

