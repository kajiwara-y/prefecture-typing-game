import { useState, useEffect } from 'react'
import { GameProvider, useGameState } from '../contexts/GameContext'
import { getGameStateManager} from '../utils/gameState'

function GameProgressInner() {
  const { gameState, getProgress, getElapsedTime, isClient, isExpertMode } = useGameState()
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
    <div className={`game-progress p-6 rounded-xl shadow-lg ${
      isExpertMode 
        ? 'bg-gradient-to-r from-purple-50 to-indigo-50' 
        : 'bg-gradient-to-r from-blue-50 to-indigo-50'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          {isExpertMode ? 'エキスパート進捗' : 'ゲーム進捗'}
        </h3>
        <div className={`text-2xl font-mono font-bold ${
          isExpertMode ? 'text-purple-600' : 'text-blue-600'
        }`}>
          {formatTime(elapsedTime)}
        </div>
      </div>
 
      {/* エキスパートモードでは地方表示をスキップ */}
      {!isExpertMode && targetInfo.totalCount < 47 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2">
            📍 今回の対象地方 ({targetInfo.regions.length}地方)
          </h4>
          <div className="text-xs text-yellow-700 space-y-1">
            {targetInfo.regions.map((region, index) => (
              <div key={region} className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>{region}地方</span>
                {targetInfo.regionGroups[region] && (
                  <span className="text-yellow-600">
                    ({targetInfo.regionGroups[region].length}都道府県)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* エキスパートモード用の説明 */}
      {isExpertMode && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-semibold text-purple-800 mb-2">
            🎓 エキスパートモード
          </h4>
          <div className="text-xs text-purple-700">
            形状認識による都道府県判定チャレンジ
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
            className={`h-3 rounded-full transition-all duration-300 ease-out ${
              isExpertMode 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
            }`}
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

      {gameState.startTime && (
        <div className="grid grid-cols-2 gap-2 text-center mb-4">
          <div className="bg-white p-2 rounded-lg">
            <div className={`text-lg font-bold ${
              isExpertMode ? 'text-purple-600' : 'text-purple-600'
            }`}>{wpm}</div>
            <div className="text-xs text-gray-600">問/分</div>
          </div>
          <div className="bg-white p-2 rounded-lg">
            <div className="text-lg font-bold text-indigo-600">{calculatePace()}</div>
            <div className="text-xs text-gray-600">平均/問</div>
          </div>
        </div>
      )}

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
              {isExpertMode 
                ? "エキスパートモード制覇！" 
                : targetInfo.totalCount < 47 ? "地方制覇！" : "全都道府県制覇！"
              } 
            </div>
            <div className="text-sm text-green-700 mt-1">
              完了時間: {formatTime(gameState.totalTime)}
            </div>
            <div className="text-sm text-green-700">
              平均: {formatTime(gameState.totalTime / targetInfo.totalCount)}/問
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
