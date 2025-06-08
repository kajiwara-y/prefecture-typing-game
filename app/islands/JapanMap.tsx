import { useState, useEffect, useRef } from 'react'
import { useGameState } from '../contexts/GameContext'

// SVGキャッシュ用のグローバル変数
let svgCache: string | null = null
let svgLoadPromise: Promise<string> | null = null

export default function JapanMap() {
  const { gameState, isClient } = useGameState()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [svgLoaded, setSvgLoaded] = useState(false)

  const targetPrefecture = gameState.currentPrefecture

  // SVGを一度だけ読み込む関数
  const loadSvgOnce = async (): Promise<string> => {
    if (svgCache) {
      return svgCache
    }

    if (svgLoadPromise) {
      return svgLoadPromise
    }

    svgLoadPromise = fetch('./map-full.svg')
      .then(res => {
        if (!res.ok) {
          throw new Error('SVGファイルの読み込みに失敗しました')
        }
        return res.text()
      })
      .then(svg => {
        svgCache = svg
        return svg
      })
      .catch(error => {
        svgLoadPromise = null // エラー時はPromiseをリセット
        throw error
      })

    return svgLoadPromise
  }

  // 初回のSVG読み込み
  useEffect(() => {
    if (!isClient) return

    const initializeMap = async () => {
      if (!mapContainerRef.current) return

      try {
        setIsLoading(true)
        setError(null)

        const svg = await loadSvgOnce()
        mapContainerRef.current.innerHTML = svg
        setSvgLoaded(true)
        setIsLoading(false)
      } catch (err) {
        console.error('地図の読み込みエラー:', err)
        setError(err instanceof Error ? err.message : '地図の読み込みに失敗しました')
        setIsLoading(false)
      }
    }

    initializeMap()
  }, [isClient])

  // 都道府県の色を更新する関数
  const updatePrefectureColors = () => {
    if (!mapContainerRef.current || !svgLoaded) return

    const prefs = mapContainerRef.current.querySelectorAll('.geolonia-svg-map .prefecture')
    
    if (prefs.length === 0) {
      console.warn('都道府県要素が見つかりませんでした')
      return
    }

    prefs.forEach((pref) => {
      const prefElement = pref as HTMLElement
      const prefCode = parseInt(prefElement.dataset.code || '0')
      
      // スタイルをリセット
      prefElement.style.animation = ''
      
      if (gameState.answeredPrefectures.has(prefCode)) {
        // 回答済み（緑）
        prefElement.style.fill = '#10b981'
        prefElement.style.stroke = '#059669'
      } else if (prefCode === targetPrefecture.id) {
        // 現在の問題（赤・点滅）
        prefElement.style.fill = '#ef4444'
        prefElement.style.stroke = '#dc2626'
        prefElement.style.animation = 'pulse 2s infinite'
      } else {
        // 未回答（グレー）
        prefElement.style.fill = '#e5e7eb'
        prefElement.style.stroke = '#6b7280'
      }
      
      prefElement.style.strokeWidth = '1'
      prefElement.style.cursor = 'pointer'
      prefElement.style.transition = 'fill 0.3s ease'
    })
  }

  // ホバー効果を設定する関数
  const setupHoverEffects = () => {
    if (!mapContainerRef.current || !svgLoaded) return

    const prefs = mapContainerRef.current.querySelectorAll('.geolonia-svg-map .prefecture')
    
    prefs.forEach((pref) => {
      const prefElement = pref as HTMLElement
      const prefCode = parseInt(prefElement.dataset.code || '0')
      
      // 既存のイベントリスナーを削除
      prefElement.replaceWith(prefElement.cloneNode(true))
    })

    // 新しいイベントリスナーを追加
    const newPrefs = mapContainerRef.current.querySelectorAll('.geolonia-svg-map .prefecture')
    newPrefs.forEach((pref) => {
      const prefElement = pref as HTMLElement
      const prefCode = parseInt(prefElement.dataset.code || '0')
      
      prefElement.addEventListener('mouseover', (event) => {
        const target = event.currentTarget as HTMLElement
        if (!gameState.answeredPrefectures.has(prefCode) && prefCode !== targetPrefecture.id) {
          target.style.fill = '#d1d5db'
        }
      })

      prefElement.addEventListener('mouseleave', (event) => {
        const target = event.currentTarget as HTMLElement
        if (!gameState.answeredPrefectures.has(prefCode) && prefCode !== targetPrefecture.id) {
          target.style.fill = '#e5e7eb'
        }
      })
    })
  }

  // 都道府県の状態が変わったときに色を更新
  useEffect(() => {
    if (svgLoaded && isClient) {
      updatePrefectureColors()
      setupHoverEffects()
    }
  }, [targetPrefecture.id, gameState.answeredPrefectures, svgLoaded, isClient])

  // CSSアニメーションの設定（一度だけ）
  useEffect(() => {
    if (!isClient) return

    const style = document.createElement('style')
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }
    `
    document.head.appendChild(style)

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [isClient])

  if (!isClient) {
    return (
      <div className="map-container flex-1 text-center">
        <div className="loading-message flex items-center justify-center h-64">
          <div className="text-gray-600">地図を準備中...</div>
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
        <div className="fallback-map mt-4 p-8 bg-gray-100 rounded-lg">
          <div className="w-32 h-24 bg-red-400 mx-auto rounded flex items-center justify-center text-white font-bold">
            {targetPrefecture.name}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="map-container flex-1 text-center">
      {isLoading && (
        <div className="loading-message flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">地図を読み込み中...</span>
        </div>
      )}
      <div 
        ref={mapContainerRef}
        id="map"
        className={`svg-map-container ${isLoading ? 'hidden' : ''}`}
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      
      {!isLoading && (
        <div className="map-legend mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-center items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>現在の問題</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>回答済み</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span>未回答</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
