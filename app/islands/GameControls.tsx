import { useGameState } from '../hooks/useGameState'

export default function GameControls() {
  const { resetGame, gameState, isClient } = useGameState()

  const handleReset = () => {
    if (isClient && confirm('ゲームをリセットしますか？進捗が失われます。')) {
      resetGame()
      window.location.reload()
    }
  }

  return (
    <div className="game-controls flex justify-center gap-4 mb-6">
      <button
        onClick={handleReset}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
        disabled={!isClient}
      >
        ゲームリセット
      </button>
      
      {isClient && gameState.startTime && (
        <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
          <span>ゲーム開始済み</span>
        </div>
      )}
    </div>
  )
}
