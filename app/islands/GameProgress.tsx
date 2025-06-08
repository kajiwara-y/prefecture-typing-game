import { useState, useEffect } from 'react'
import { GameProvider, useGameState } from '../contexts/GameContext'
import { getGameStateManager} from '../utils/gameState'

function GameProgressInner() {
  const { gameState, getProgress, getElapsedTime, isClient } = useGameState()
  const [elapsedTime, setElapsedTime] = useState(0)
  const [wpm, setWpm] = useState(0) // Words Per Minute
  const progress = getProgress()

  const getTargetInfo = () => {
    const manager = getGameStateManager()
    return manager.getTargetInfo()
  }

  const targetInfo = isClient ? getTargetInfo() : { totalCount: 47, regions: [], regionGroups: {} }

  useEffect(() => {
    if (!isClient) return

    const interval = setInterval(() => {
      const elapsed = getElapsedTime()
      setElapsedTime(elapsed)
      
      // WPM計算（1都道府県 = 1 word として計算）
      if (elapsed > 0) {
        const minutes = elapsed / (1000 * 60)
        const wordsPerMinute = Math.round(progress.answered / minutes)
        setWpm(isFinite(wordsPerMinute) ? wordsPerMinute : 0)
      }
    }, 100) // より頻繁に更新

    return () => clearInterval(interval)
  }, [getElapsedTime, isClient, progress.answered])

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const centiseconds = Math.floor((ms % 1000) / 10)
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
    }
    return `${seconds}.${centiseconds.toString().padStart(2, '0')}秒`
  }

  // ペース計算
  const calculatePace = (): string => {
    if (progress.answered === 0 || elapsedTime === 0) return '--'
    const avgTimePerPrefecture = elapsedTime / progress.answered
    return formatTime(avgTimePerPrefecture)
  }

  // 予想完了時間
  const estimatedFinishTime = (): string => {
    if (progress.answered === 0 || elapsedTime === 0) return '--'
    const avgTimePerPrefecture = elapsedTime / progress.answered
    const remainingTime = (progress.total - progress.answered) * avgTimePerPrefecture
    return formatTime(elapsedTime + remainingTime)
  }

  if (!isClient) {
    return (
      <div className="game-progress bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">ゲーム進捗</h3>
          <div className="text-2xl font-mono font-bold text-blue-600">0:00.00</div>
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
 
      {/* 対象地方の表示（47都道府県でない場合のみ） */}
      {targetInfo.totalCount < 47 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2">
            📍 今回の対象地方 ({targetInfo.regions.length}地方)
          </h4>
          <div className="text-xs text-yellow-700">
            {targetInfo.regions.join('・')}
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>進捗: {progress.answered} / {progress.total}</span>
          <span>{progress.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center mb-4">
        <div className="bg-white p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{gameState.score}</div>
          <div className="text-sm text-gray-600">スコア</div>
        </div>
        <div className="bg-white p-3 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{progress.total - progress.answered}</div>
          <div className="text-sm text-gray-600">残り</div>
        </div>
      </div>

      {/* 詳細統計 */}
      {gameState.startTime && (
        <div className="grid grid-cols-2 gap-2 text-center mb-4">
          <div className="bg-white p-2 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{wpm}</div>
            <div className="text-xs text-gray-600">問/分</div>
          </div>
          <div className="bg-white p-2 rounded-lg">
            <div className="text-lg font-bold text-indigo-600">{calculatePace()}</div>
            <div className="text-xs text-gray-600">平均/問</div>
          </div>
        </div>
      )}

      {/* 予想完了時間 */}
      {gameState.startTime && progress.answered > 0 && !gameState.isGameComplete && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
          <div className="text-center">
            <div className="text-sm text-yellow-800 font-semibold">予想完了時間</div>
            <div className="text-lg font-bold text-yellow-700">{estimatedFinishTime()}</div>
          </div>
        </div>
      )}

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
            <div className="text-sm text-green-700">
              平均: {formatTime(gameState.totalTime / 47)}/問
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default function GameProgress() {
  return (
    <GameProvider>
      <GameProgressInner />
    </GameProvider>
  )
}
