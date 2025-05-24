import { useState, useEffect } from 'react'
import { useGameState } from '../hooks/useGameState'

export default function GameProgress() {
  const { gameState, getProgress, getElapsedTime, isClient } = useGameState()
  const [elapsedTime, setElapsedTime] = useState(0)
  const progress = getProgress()

  useEffect(() => {
    if (!isClient) return

    const interval = setInterval(() => {
      setElapsedTime(getElapsedTime())
    }, 1000)

    return () => clearInterval(interval)
  }, [getElapsedTime, isClient])

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  if (!isClient) {
    return (
      <div className="game-progress bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">ゲーム進捗</h3>
          <div className="text-2xl font-mono font-bold text-blue-600">0:00</div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>進捗: 0 / 47</span>
            <span>0%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full w-0" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">スコア</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">47</div>
            <div className="text-sm text-gray-600">残り</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="game-progress bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">ゲーム進捗</h3>
        <div className="text-2xl font-mono font-bold text-blue-600">
          {formatTime(elapsedTime)}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>進捗: {progress.answered} / {progress.total}</span>
          <span>{progress.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-white p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{gameState.score}</div>
          <div className="text-sm text-gray-600">スコア</div>
        </div>
        <div className="bg-white p-3 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{progress.total - progress.answered}</div>
          <div className="text-sm text-gray-600">残り</div>
        </div>
      </div>

      {gameState.isGameComplete && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded-lg">
          <div className="text-center">
            <div className="text-2xl mb-2">🎉 おめでとうございます！</div>
            <div className="text-lg font-bold text-green-800">
              全都道府県制覇！
            </div>
            <div className="text-sm text-green-700 mt-1">
              完了時間: {formatTime(gameState.totalTime)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
