import { GameProvider, useGameState } from '../contexts/GameContext'
import { getGameStateManager } from '../utils/gameState'

function GameControlsInner() {
  const { resetGame, gameState, isClient } = useGameState()

  // 地方ランダムモードかどうかを判定
  const isRegionMode = gameState.targetPrefectures.length < 47

  // 地方情報を取得
  const getTargetInfo = () => {
    const manager = getGameStateManager()
    return manager.getTargetInfo()
  }

  const handleReset = (keepRegionMode: boolean) => {
    const confirmMessage = keepRegionMode 
      ? '別の地方でゲームをリセットしますか？進捗が失われます。'
      : '全47都道府県モードでゲームをリセットしますか？進捗が失われます。'
      
    if (isClient && confirm(confirmMessage)) {
      console.log('GameControls - handleReset called, keepRegionMode:', keepRegionMode)
      
      // スクロール位置を保存
      const scrollPosition = window.scrollY
      
      // LocalStorageをクリア
      localStorage.removeItem('gameState')
      
      if (keepRegionMode) {
        // 地方ランダムモード継続：現在のURLパラメーターを維持してリセット
        resetGame()
      } else {
        // 全県モードに切り替え：URLパラメーターを削除してリセット
        const url = new URL(window.location.href)
        url.searchParams.delete('regions')
        window.history.replaceState({}, '', url.toString())
        
        // GameStateManagerに全県モードを強制設定
        const manager = getGameStateManager()
        manager.forceSetTargetPrefectures(Array.from({length: 47}, (_, i) => i + 1))
        resetGame()
      }
      
      // スクロール位置を復元
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        })
      })
    }
  }

  return (
    <div className="game-controls flex flex-col sm:flex-row justify-center items-center gap-3">
      {/* 地方ランダムモードの場合は2つのボタン */}
      {isRegionMode ? (
        <>
          <button
            onClick={() => handleReset(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
            disabled={!isClient}
          >
            🎲 別の地方でリセット
          </button>
          <button
            onClick={() => handleReset(false)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
            disabled={!isClient}
          >
            🗾 全県モードでリセット
          </button>
        </>
      ) : (
        /* 全県モードの場合は1つのボタン */
        <button
          onClick={() => handleReset(false)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
          disabled={!isClient}
        >
          ゲームリセット
        </button>
      )}
      
      {/* 現在のモード表示 */}
      {isClient && gameState.startTime && (
        <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
          {isRegionMode ? (
            <span>
              🎯 {getTargetInfo().regions.join('・')}地方モード
            </span>
          ) : (
            <span>ゲーム開始済み</span>
          )}
        </div>
      )}
      
      {/* 地方ランダムモードの場合、ゲーム開始前にも現在のモードを表示 */}
      {isClient && !gameState.startTime && isRegionMode && (
        <div className="flex items-center text-xs text-gray-600 bg-yellow-100 px-3 py-1 rounded-lg">
          <span>
            📍 {getTargetInfo().regions.join('・')}地方モード ({gameState.targetPrefectures.length}都道府県)
          </span>
        </div>
      )}
    </div>
  )
}

export default function GameControls() {
  return (
    <GameProvider>
      <GameControlsInner />
    </GameProvider>
  )
}
