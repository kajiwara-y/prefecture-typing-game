import { useState, useEffect } from 'react'

interface GameRecord {
  date: string
  time: number
  score: number
}

export default function GameStats() {
  const [records, setRecords] = useState<GameRecord[]>([])
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    const savedRecords = JSON.parse(localStorage.getItem('gameRecords') || '[]')
    setRecords(savedRecords)
  }, [])

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    const remainingMs = Math.floor((ms % 1000) / 10)
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMs.toString().padStart(2, '0')}`
    } else {
      return `${remainingSeconds}.${remainingMs.toString().padStart(2, '0')}秒`
    }
  }

  const clearRecords = () => {
    localStorage.removeItem('gameRecords')
    setRecords([])
  }

  if (!showStats) {
    return (
      <div className="mt-6">
        <button
          onClick={() => setShowStats(true)}
          className="text-blue-500 hover:text-blue-700 underline"
        >
          📊 過去の記録を見る
        </button>
      </div>
    )
  }

  return (
    <div className="mt-6 bg-gray-50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">🏆 ベスト記録</h3>
        <div className="space-x-2">
          <button
            onClick={() => setShowStats(false)}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            閉じる
          </button>
          {records.length > 0 && (
            <button
              onClick={clearRecords}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              記録をクリア
            </button>
          )}
        </div>
      </div>
      
      {records.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          まだ記録がありません。ゲームをプレイして記録を作りましょう！
        </p>
      ) : (
        <div className="space-y-2">
          {records.map((record, index) => (
            <div 
              key={index}
              className={`flex justify-between items-center p-3 rounded ${
                index === 0 ? 'bg-yellow-100 border-2 border-yellow-300' : 'bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`font-bold ${
                  index === 0 ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  #{index + 1}
                </span>
                {index === 0 && <span className="text-yellow-500">👑</span>}
                <span className="text-sm text-gray-500">
                  {new Date(record.date).toLocaleDateString()}
                </span>
              </div>
              <div className="font-bold text-blue-600">
                {formatTime(record.time)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
