import { GameProvider, useGameState } from '../contexts/GameContext'
import { useState, useEffect } from 'react'

function GameHeaderInner() {
  const { gameState, isClient } = useGameState()
  const [isVisible, setIsVisible] = useState(true)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    if (isClient && gameState.startTime) {
      // フェードアウト開始
      setIsVisible(false)
      // アニメーション完了後に要素を完全に削除
      setTimeout(() => {
        setShouldRender(false)
      }, 500) // transition duration と合わせる
    } else if (isClient && !gameState.startTime) {
      // ゲームリセット時に再表示
      setShouldRender(true)
      setIsVisible(true)
    }
  }, [gameState.startTime, isClient])

  if (!shouldRender) {
    return null
  }

  return (
    <h1 
      className={`text-3xl font-bold text-center text-gray-800 mb-8 transition-all duration-500 ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'
      }`}
    >
      都道府県タイピングゲーム
    </h1>
  )
}


export default function GameHeader() {
  return (
    <GameProvider>
      <GameHeaderInner />
    </GameProvider>
  )
}
