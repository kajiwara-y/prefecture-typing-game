import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getGameStateManager, GameState } from '../utils/gameState'

interface GameContextType {
  gameState: GameState
  isClient: boolean
  resetTrigger: number
  startGame: () => void
  answerCorrect: (id: number, hintLevel: number) => void
  getNextPrefecture: () => any
  resetGame: () => void
  getProgress: () => any
  getElapsedTime: () => number
  getTargetInfo: () => any
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  const [gameState, setGameState] = useState<GameState>(() => getGameStateManager().getState())
  const [resetTrigger, setResetTrigger] = useState(0)

  useEffect(() => {
    setIsClient(true)
    const manager = getGameStateManager()
    
    // パスベースでのモード初期化
    manager.initializeFromPath()
    setGameState(manager.getState())
    
    const unsubscribe = manager.subscribe((newState) => {
      setGameState(newState)
    })

    return unsubscribe
  }, [])

  const manager = getGameStateManager()

  const handleResetGame = () => {
    console.log('GameProvider - handleResetGame called')
    manager.resetGame()
    setResetTrigger(prev => {
      const newValue = prev + 1
      console.log('GameProvider - resetTrigger updated to:', newValue)
      return newValue
    })
  }

  const value: GameContextType = {
    gameState,
    isClient,
    resetTrigger,
    startGame: () => manager.startGame(),
    answerCorrect: (id: number, hintLevel: number) => manager.answerCorrect(id, hintLevel),
    getNextPrefecture: () => manager.getNextPrefecture(),
    resetGame: handleResetGame,
    getProgress: () => manager.getProgress(),
    getElapsedTime: () => manager.getElapsedTime(),
    getTargetInfo: () => manager.getTargetInfo()
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGameState() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGameState must be used within a GameProvider')
  }
  return context
}
