import { useState, useEffect } from 'react'
import { GameProvider, useGameState } from '../contexts/GameContext'
import { getGameStateManager } from '../utils/gameState'

interface GameRecord {
  date: string
  time: number
  score: number
  wpm: number // Words Per Minute
  accuracy: number // 正解率
  mode: string // 追加: ゲームモード
  totalPrefectures: number // 追加: 対象都道府県数
}

function GameStatsInner() {
  const { gameState, isClient } = useGameState()
  const [records, setRecords] = useState<GameRecord[]>([])
  const [showStats, setShowStats] = useState(false)
  const [sortBy, setSortBy] = useState<'time' | 'score' | 'wpm'>('time')
  const [filterMode, setFilterMode] = useState<'all' | 'region' | 'full'>('all')

  useEffect(() => {
    const savedRecords = JSON.parse(localStorage.getItem('gameRecords') || '[]')
    setRecords(savedRecords.sort((a: GameRecord, b: GameRecord) => a.time - b.time))
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

  const getTargetInfo = () => {
    const manager = getGameStateManager()
    return manager.getTargetInfo()
  }

  const filteredRecords = records.filter(record => {
    if (filterMode === 'all') return true
    if (filterMode === 'region') return record.totalPrefectures < 47
    if (filterMode === 'full') return record.totalPrefectures === 47
    return true
  })

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    switch (sortBy) {
      case 'time':
        return a.time - b.time
      case 'score':
        return b.score - a.score
      case 'wpm':
        return b.wpm - a.wpm
      default:
        return a.time - b.time
    }
  })

  const getBestRecord = (field: keyof GameRecord) => {
    if (filteredRecords.length === 0) return null
    
    switch (field) {
      case 'time':
        return Math.min(...filteredRecords.map(r => r.time))
      case 'score':
        return Math.max(...filteredRecords.map(r => r.score))
      case 'wpm':
        return Math.max(...filteredRecords.map(r => r.wpm))
      default:
        return null
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
          className="text-blue-500 hover:text-blue-700 underline flex items-center gap-2"
        >
          📊 過去の記録を見る
          {records.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {records.length}件
            </span>
          )}
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

      {/* フィルター選択 */}
      {records.length > 0 && (
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded text-sm ${
                filterMode === 'all' 
                  ? 'bg-gray-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              全記録
            </button>
            <button
              onClick={() => setFilterMode('full')}
              className={`px-3 py-1 rounded text-sm ${
                filterMode === 'full' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              全県モード
            </button>
            <button
              onClick={() => setFilterMode('region')}
              className={`px-3 py-1 rounded text-sm ${
                filterMode === 'region' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              地方モード
            </button>
          </div>
        </div>
      )}

      {/* ベスト記録サマリー */}
      {filteredRecords.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-100 border border-yellow-300 p-3 rounded-lg text-center">
            <div className="text-sm text-yellow-800">最速タイム</div>
            <div className="text-lg font-bold text-yellow-700">
              {formatTime(getBestRecord('time') || 0)}
            </div>
          </div>
          <div className="bg-green-100 border border-green-300 p-3 rounded-lg text-center">
            <div className="text-sm text-green-800">最高スコア</div>
            <div className="text-lg font-bold text-green-700">
              {getBestRecord('score')}点
            </div>
          </div>
          <div className="bg-purple-100 border border-purple-300 p-3 rounded-lg text-center">
            <div className="text-sm text-purple-800">最高速度</div>
            <div className="text-lg font-bold text-purple-700">
              {getBestRecord('wpm')}問/分
            </div>
          </div>
        </div>
      )}

      {/* ソート選択 */}
      {filteredRecords.length > 1 && (
        <div className="mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('time')}
              className={`px-3 py-1 rounded text-sm ${
                sortBy === 'time' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              タイム順
            </button>
            <button
              onClick={() => setSortBy('score')}
              className={`px-3 py-1 rounded text-sm ${
                sortBy === 'score' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              スコア順
            </button>
            <button
              onClick={() => setSortBy('wpm')}
              className={`px-3 py-1 rounded text-sm ${
                sortBy === 'wpm' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              速度順
            </button>
          </div>
        </div>
      )}

      {filteredRecords.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          {filterMode === 'all' 
            ? 'まだ記録がありません。ゲームをプレイして記録を作りましょう！'
            : `${filterMode === 'full' ? '全県モード' : '地方モード'}の記録がありません。`
          }
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedRecords.map((record, index) => {
            const isPersonalBest = {
              time: record.time === getBestRecord('time'),
              score: record.score === getBestRecord('score'),
              wpm: record.wpm === getBestRecord('wpm')
            }
            
            return (
              <div 
                key={index}
                className={`flex justify-between items-center p-3 rounded transition-colors ${
                  index === 0 && sortBy === 'time' 
                    ? 'bg-yellow-100 border-2 border-yellow-300' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`font-bold ${
                    index === 0 && sortBy === 'time' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    #{index + 1}
                  </span>
                  {index === 0 && sortBy === 'time' && <span className="text-yellow-500">👑</span>}
                  <div>
                    <div className="text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-xs text-gray-400">
                      {record.mode || (record.totalPrefectures === 47 ? '全県モード' : '地方モード')}
                      {record.totalPrefectures && record.totalPrefectures < 47 && 
                        ` (${record.totalPrefectures}都道府県)`
                      }
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className={`font-bold ${isPersonalBest.time ? 'text-yellow-600' : 'text-blue-600'}`}>
                      {formatTime(record.time)}
                      {isPersonalBest.time && <span className="ml-1">🏆</span>}
                    </div>
                    <div className="text-xs text-gray-500">タイム</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`font-bold ${isPersonalBest.score ? 'text-green-600' : 'text-gray-700'}`}>
                      {record.score}
                      {isPersonalBest.score && <span className="ml-1">🏆</span>}
                    </div>
                    <div className="text-xs text-gray-500">スコア</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`font-bold ${isPersonalBest.wpm ? 'text-purple-600' : 'text-gray-700'}`}>
                      {record.wpm}
                      {isPersonalBest.wpm && <span className="ml-1">🏆</span>}
                    </div>
                    <div className="text-xs text-gray-500">問/分</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {/* 統計情報 */}
      {filteredRecords.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">プレイ回数:</span>
              <span className="font-semibold ml-2">{filteredRecords.length}回</span>
            </div>
            <div>
              <span className="text-gray-600">平均タイム:</span>
              <span className="font-semibold ml-2">
                {formatTime(filteredRecords.reduce((sum, r) => sum + r.time, 0) / filteredRecords.length)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GameStats() {
  return (
    <GameProvider>
      <GameStatsInner />
    </GameProvider>
  )
}
