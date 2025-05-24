import { useState, useEffect } from 'react'
import { getGameStateManager, GameState } from '../utils/gameState'

export function useGameState() {
  const [isClient, setIsClient] = useState(false)
  const [gameState, setGameState] = useState<GameState>(() => getGameStateManager().getState())

  useEffect(() => {
    setIsClient(true)
    const manager = getGameStateManager()
    
    // 初期状態を設定
    setGameState(manager.getState())
    
    // 状態変更を監視
    const unsubscribe = manager.subscribe((newState) => {
      setGameState(newState)
    })

    return unsubscribe
  }, [])

  const manager = getGameStateManager()

  return {
    gameState,
    isClient,
    startGame: () => manager.startGame(),
    answerCorrect: (id: number) => manager.answerCorrect(id),
    getNextPrefecture: () => manager.getNextPrefecture(),
    resetGame: () => manager.resetGame(),
    getProgress: () => manager.getProgress(),
    getElapsedTime: () => manager.getElapsedTime()
  }
}
