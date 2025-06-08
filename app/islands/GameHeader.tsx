import { GameProvider, useGameState } from '../contexts/GameContext'
import { useState, useEffect } from 'react'
import RegionSelector from './RegionSelector'

function GameHeaderInner() {
  const { gameState, isClient} = useGameState()
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

// 現在のモードを判定
const getCurrentMode = () => {
  // クライアントサイドでのURL判定
  let currentPath = ''
  if (typeof window !== 'undefined') {
    currentPath = window.location.pathname
  }

  // エキスパートモードの判定
  if (currentPath === '/expert') {
    return {
      label: '🎓 エキスパートモード',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800'
    }
  }

  // 地方ランダムモードの判定
  if (gameState.targetPrefectures.length < 47) {
    const regionMatch = currentPath.match(/^\/region\/(\d+)$/)
    const regionCount = regionMatch ? parseInt(regionMatch[1]) : Math.ceil(gameState.targetPrefectures.length / 7)
    
    return {
      label: `🎯 ${regionCount}地方ランダムモード`,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    }
  }
  
  // デフォルト：全47都道府県モード
  return {
    label: '🗾 全47都道府県モード',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  }
}

  if (!shouldRender) {
    return null
  }

  const currentMode = getCurrentMode()

  return (
    <div 
      className={`transition-all duration-500 ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'
      }`}
    >
      {/* メインタイトル */}
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        都道府県タイピングゲーム
      </h1>

      {/* モード表示とセレクター */}
      <div className="mb-6 text-center">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {/* 現在のモード表示 */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${currentMode.bgColor} ${currentMode.textColor}`}>
            {currentMode.label}
          </div>

          {/* モード選択 */}
          <RegionSelector />
        </div>

        {/* 地方モードの詳細情報 */}
        {gameState.targetPrefectures.length < 47 && isClient && (
          <div className="mt-2 text-xs text-gray-600 bg-yellow-100 px-3 py-1 rounded-lg inline-block">
            📍 対象: {gameState.targetPrefectures.length}都道府県
          </div>
        )}
      </div>
    </div>
  )
}

export default function GameHeader() {
  return (
    <GameProvider>
      <GameHeaderInner />
    </GameProvider>
  )
}
