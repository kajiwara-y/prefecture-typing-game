import { useGameState } from '../hooks/useGameState'

export default function GameControls() {
  const { resetGame, gameState, isClient } = useGameState()

  const handleReset = () => {
    if (isClient && confirm('ゲームをリセットしますか？進捗が失われます。')) {
      resetGame()
      // window.location.reload() を削除してリロードを避ける
    }
  }

  return (
    <div className="game-controls flex flex-col sm:flex-row justify-center items-center gap-3">
      <button
        onClick={handleReset}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
        disabled={!isClient}
      >
        ゲームリセット
      </button>
      
      {isClient && gameState.startTime && (
        <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
          <span>ゲーム開始済み</span>
        </div>
      )}
    </div>
  )
}
