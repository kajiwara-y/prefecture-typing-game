import { useState, useEffect } from 'react'
import { GameProvider, useGameState } from '../contexts/GameContext'
import { PrefectureShape, extractPrefectureShapes, calculateNormalizedTransform } from '../utils/svgExtractor'

function ExpertMapInner() {
  const { gameState, isClient } = useGameState()
  const [shapes, setShapes] = useState<PrefectureShape[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const targetPrefecture = gameState.currentPrefecture

  // 初回のSVG読み込み
  useEffect(() => {
    if (!isClient) return

    const initializeShapes = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const extractedShapes = await extractPrefectureShapes()
        setShapes(extractedShapes)
        setIsLoading(false)
      } catch (err) {
        console.error('エキスパート地図の読み込みエラー:', err)
        setError(err instanceof Error ? err.message : 'エキスパート地図の読み込みに失敗しました')
        setIsLoading(false)
      }
    }

    initializeShapes()
  }, [isClient])

  if (!isClient) {
    return (
      <div className="map-container flex-1 text-center">
        <div className="loading-message flex items-center justify-center h-64">
          <div className="text-gray-600">エキスパート地図を準備中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="map-container flex-1 text-center">
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">エラー</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="map-container flex-1 text-center">
        <div className="loading-message flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-600">エキスパート地図を読み込み中...</span>
        </div>
      </div>
    )
  }

  const currentShape = shapes.find(s => s.id === targetPrefecture.id)

  if (!currentShape) {
    return (
      <div className="map-container flex-1 text-center">
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">エラー</p>
          <p>{targetPrefecture.name}の地図データが見つかりません</p>
        </div>
      </div>
    )
  }

  const normalizedSize = 300
  const viewBox = `0 0 ${normalizedSize} ${normalizedSize}`
  const normalizedTransform = calculateNormalizedTransform(currentShape.transform, normalizedSize)

  return (
    <div className="map-container flex-1 text-center">
      {/* エキスパートモード説明 */}
      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <h3 className="text-sm font-semibold text-purple-800 mb-1">
          🎓 エキスパートモード
        </h3>
        <p className="text-xs text-purple-700">
          都道府県の形だけを見て答えてください
        </p>
      </div>

      {/* SVG地図表示 */}
      <div className="flex justify-center mb-4">
        <svg 
          viewBox={viewBox}
          className="w-full max-w-md h-auto border-2 border-purple-300 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50"
          style={{ 
            aspectRatio: '1/1',
            filter: 'drop-shadow(2px 2px 8px rgba(0,0,0,0.1))'
          }}
        >
          <g
            fill="#6366f1"
            stroke="#1e1b4b"
            strokeWidth="2"
            strokeLinejoin="round"
            transform={normalizedTransform}
            dangerouslySetInnerHTML={{
              __html: currentShape.pathElements.join('')
            }}
          />
        </svg>
      </div>
      
      {/* 地図凡例（エキスパートモード用） */}
      <div className="map-legend mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-center items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-500 rounded"></div>
            <span>対象都道府県</span>
          </div>
          <div className="text-xs text-gray-500">
            💡 形状のみで判断してください
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExpertMap() {
  return (
    <GameProvider expertMode={true}>
      <ExpertMapInner />
    </GameProvider>
  )
}
