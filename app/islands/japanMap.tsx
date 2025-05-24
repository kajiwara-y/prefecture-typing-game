import { useState, useEffect, useRef } from 'react'
import { Prefecture } from '../data/prefectures'

interface JapanMapProps {
  targetPrefecture: Prefecture
}

export default function JapanMap({ targetPrefecture }: JapanMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMap = async () => {
      if (!mapContainerRef.current) return

      try {
        setIsLoading(true)
        setError(null)

        // SVGファイルを読み込み
        const res = await fetch('./map-full.svg')
        
        if (!res.ok) {
          throw new Error('SVGファイルの読み込みに失敗しました')
        }

        const svg = await res.text()
        mapContainerRef.current.innerHTML = svg

        // 都道府県要素を取得
        const prefs = mapContainerRef.current.querySelectorAll('.geolonia-svg-map .prefecture')
        
        if (prefs.length === 0) {
          console.warn('都道府県要素が見つかりませんでした')
        }

        // 全ての都道府県を初期状態（グレー）に設定
        prefs.forEach((pref) => {
          const prefElement = pref as HTMLElement
          prefElement.style.fill = '#e0e0e0'
          prefElement.style.stroke = '#333'
          prefElement.style.strokeWidth = '1'
          prefElement.style.cursor = 'pointer'
          prefElement.style.transition = 'fill 0.3s ease'
        })

        // ターゲットの都道府県をハイライト
        const targetPrefElement = mapContainerRef.current.querySelector(
          `.prefecture[data-code="${targetPrefecture.id.toString()}"]`
        ) as HTMLElement

        if (targetPrefElement) {
          targetPrefElement.style.fill = '#ff6b6b'
          targetPrefElement.style.stroke = '#fff'
          targetPrefElement.style.strokeWidth = '2'
          
          // アニメーション効果を追加
          targetPrefElement.style.animation = 'pulse 2s infinite'
        }

        // イベントリスナーを追加
        prefs.forEach((pref) => {
          const prefElement = pref as HTMLElement
          const prefCode = prefElement.dataset.code
          
          // マウスオーバーイベント（ターゲット以外）
          prefElement.addEventListener('mouseover', (event) => {
            const target = event.currentTarget as HTMLElement
            if (target.dataset.code !== targetPrefecture.id.toString().padStart(2, '0')) {
              target.style.fill = '#ccc'
            }
          })

          // マウスリーブイベント（ターゲット以外）
          prefElement.addEventListener('mouseleave', (event) => {
            const target = event.currentTarget as HTMLElement
            if (target.dataset.code !== targetPrefecture.id.toString().padStart(2, '0')) {
              target.style.fill = '#e0e0e0'
            }
          })

          // クリックイベント（デバッグ用）
          prefElement.addEventListener('click', (event) => {
            const target = event.currentTarget as HTMLElement
            const prefName = target.getAttribute('title') || target.dataset.name || '不明'
            console.log(`クリックされた都道府県: ${prefName} (コード: ${prefCode})`)
          })
        })

        setIsLoading(false)
      } catch (err) {
        console.error('地図の読み込みエラー:', err)
        setError(err instanceof Error ? err.message : '地図の読み込みに失敗しました')
        setIsLoading(false)
      }
    }

    loadMap()
  }, [targetPrefecture])

  // CSSアニメーションを動的に追加
  useEffect(() => {
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
      document.head.removeChild(style)
    }
  }, [])

  if (error) {
    return (
      <div className="map-container flex-1 text-center">
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">エラー</p>
          <p>{error}</p>
        </div>
        {/* フォールバック用の簡単な地図 */}
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
        <div className="map-info mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-blue-700 font-semibold">
            🎯 赤くハイライトされた都道府県名を入力してください
          </p>
          <p className="text-sm text-gray-600 mt-1">
            ヒント: {targetPrefecture.region}地方
          </p>
        </div>
      )}
    </div>
  )
}
