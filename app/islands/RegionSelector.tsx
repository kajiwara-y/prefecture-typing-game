import { useState } from 'react'

export default function RegionSelector() {
  const [isOpen, setIsOpen] = useState(false)

  const regionOptions = [
    { count: 1, label: '1地方ランダム', emoji: '🎯' },
    { count: 2, label: '2地方ランダム', emoji: '🎲' },
    { count: 3, label: '3地方ランダム', emoji: '🎪' },
    { count: 4, label: '4地方ランダム', emoji: '🎨' },
    { count: 5, label: '5地方ランダム', emoji: '🎭' },
    { count: 6, label: '6地方ランダム', emoji: '🎪' },
    { count: 7, label: '7地方ランダム', emoji: '🎊' },
  ]

  const handleRegionSelect = (count: number) => {
    window.location.href = `/region/${count}`
    setIsOpen(false)
  }

  const handleAllPrefectures = () => {
    window.location.href = '/'
    setIsOpen(false)
  }

  const handleExpertMode = () => {
    window.location.href = '/expert'
    setIsOpen(false)
  }

  return (
    <div className="region-selector relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
      >
        🎯 モード選択
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <>
          {/* オーバーレイ */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* ドロップダウンメニュー */}
          <div className="absolute z-20 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-64">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                ゲームモードを選択
              </div>
              
              <button
                onClick={handleAllPrefectures}
                className="block w-full text-left px-3 py-2 hover:bg-green-50 rounded transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>🗾</span>
                  <span className="font-medium">全47都道府県モード</span>
                </span>
                <span className="text-xs text-gray-500 ml-6">すべての都道府県で挑戦</span>
              </button>
              
              <hr className="my-2" />
              
              <div className="text-xs font-semibold text-gray-600 mb-2">地方ランダムモード</div>
              
              {regionOptions.map(option => (
                <button
                  key={option.count}
                  onClick={() => handleRegionSelect(option.count)}
                  className="block w-full text-left px-3 py-2 hover:bg-blue-50 rounded transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>{option.emoji}</span>
                    <span>{option.label}</span>
                  </span>
                  <span className="text-xs text-gray-500 ml-6">
                    ランダムに{option.count}地方を選択
                  </span>
                </button>
              ))}

              <hr className="my-2" />
              
              {/* エキスパートモード追加 */}
              <div className="text-xs font-semibold text-gray-600 mb-2">上級者向け</div>
              
              <button
                onClick={handleExpertMode}
                className="block w-full text-left px-3 py-2 hover:bg-purple-50 rounded transition-colors border border-purple-200"
              >
                <span className="flex items-center gap-2">
                  <span>🎓</span>
                  <span className="font-medium text-purple-700">エキスパートモード</span>
                </span>
                <span className="text-xs text-purple-600 ml-6">
                  形状認識による高難度チャレンジ
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
