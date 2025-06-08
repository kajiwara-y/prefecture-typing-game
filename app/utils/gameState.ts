import { Prefecture, prefectures, getRandomRegions } from '../data/prefectures'

export interface GameState {
  startTime: number | null
  endTime: number | null
  answeredPrefectures: Set<number>
  currentPrefecture: Prefecture
  totalTime: number
  isGameComplete: boolean
  score: number
  targetPrefectures: number[]
}

// グローバルリセットコールバック管理
let globalResetCallbacks: (() => void)[] = []

export function registerGlobalResetCallback(callback: () => void): () => void {
  globalResetCallbacks.push(callback)
  return () => {
    globalResetCallbacks = globalResetCallbacks.filter(cb => cb !== callback)
  }
}

export function triggerGlobalReset() {
  console.log('triggerGlobalReset called, callbacks:', globalResetCallbacks.length)
  globalResetCallbacks.forEach((callback, index) => {
    try {
      console.log(`Executing reset callback ${index}`)
      callback()
    } catch (error) {
      console.error(`Reset callback ${index} error:`, error)
    }
  })
}

class GameStateManager {
  private state: GameState
  private listeners: Set<(state: GameState) => void> = new Set()
  private initialized = false

  constructor() {
    this.state = this.getInitialState()
    this.loadFromStorage()
  }

  private getInitialState(): GameState {
    // サーバーサイドでは全都道府県を対象とする
    const targetPrefectures = Array.from({ length: 47 }, (_, i) => i + 1)

    return {
      startTime: null,
      endTime: null,
      answeredPrefectures: new Set<number>(),
      currentPrefecture: prefectures[Math.floor(Math.random() * prefectures.length)],
      totalTime: 0,
      isGameComplete: false,
      score: 0,
      targetPrefectures
    }
  }

  // クライアントサイドでURLパラメーターを再チェックして状態を更新する新しいメソッド
  initializeFromURL() {
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    const regionCount = parseInt(urlParams.get('regions') || '0')

    if (regionCount > 0) {
      const targetPrefectures = getRandomRegions(regionCount)
      const availablePrefectures = prefectures.filter(p => targetPrefectures.includes(p.id))

      this.state = {
        ...this.state,
        targetPrefectures,
        currentPrefecture: availablePrefectures[Math.floor(Math.random() * availablePrefectures.length)]
      }

      this.notifyListeners()
    }
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('gameState')
      if (saved) {
        const parsed = JSON.parse(saved)
        
        // URLパラメーターと保存された状態の整合性をチェック
        const urlParams = new URLSearchParams(window.location.search)
        const regionCount = parseInt(urlParams.get('regions') || '0')
        
        let expectedTargetPrefectures: number[]
        if (regionCount > 0) {
          // URLパラメーターがある場合は、保存された状態を使わずに新しく生成
          expectedTargetPrefectures = getRandomRegions(regionCount)
        } else {
          expectedTargetPrefectures = Array.from({ length: 47 }, (_, i) => i + 1)
        }
        
        // URLパラメーターがある場合は保存された状態を無視
        if (regionCount > 0) {
          console.log('loadFromStorage - ignoring saved state due to URL params')
          return
        }
        
        this.state = {
          ...parsed,
          answeredPrefectures: new Set(parsed.answeredPrefectures),
          currentPrefecture: parsed.currentPrefecture || this.getRandomUnansweredPrefecture(new Set(parsed.answeredPrefectures))
        }
      }
    } catch (error) {
      console.error('ゲーム状態の復元に失敗:', error)
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return

    try {
      const stateToSave = {
        ...this.state,
        answeredPrefectures: Array.from(this.state.answeredPrefectures)
      }
      localStorage.setItem('gameState', JSON.stringify(stateToSave))
    } catch (error) {
      console.error('ゲーム状態の保存に失敗:', error)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state))
    this.saveToStorage()
  }

  private getRandomUnansweredPrefecture(answered: Set<number>): Prefecture {
    // 対象都道府県の中から未回答のものを選択
    const availablePrefectures = prefectures.filter(p =>
      this.state.targetPrefectures.includes(p.id) && !answered.has(p.id)
    )

    if (availablePrefectures.length === 0) {
      return prefectures.find(p => this.state.targetPrefectures.includes(p.id)) || prefectures[0]
    }

    return availablePrefectures[Math.floor(Math.random() * availablePrefectures.length)]
  }

  // 修正: voidを返すunsubscribe関数に変更
  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getState(): GameState {
    return { ...this.state, answeredPrefectures: new Set(this.state.answeredPrefectures) }
  }

  startGame() {
    if (!this.state.startTime) {
      this.state = { ...this.state, startTime: Date.now() }
      this.notifyListeners()
    }
  }

  // GameStateManagerクラスに追加
  answerCorrect(prefectureId: number, hintLevel: number = 0) {
    const newAnswered = new Set(this.state.answeredPrefectures)
    newAnswered.add(prefectureId)

    // 完了判定を対象都道府県数で行う
    const isComplete = newAnswered.size === this.state.targetPrefectures.length
    const endTime = isComplete ? Date.now() : null
    const totalTime = endTime && this.state.startTime ? endTime - this.state.startTime : 0

    let scoreIncrement = 10
    if (hintLevel === 1) scoreIncrement = 8
    else if (hintLevel === 2) scoreIncrement = 6
    else if (hintLevel >= 3) scoreIncrement = 4

    this.state = {
      ...this.state,
      answeredPrefectures: newAnswered,
      score: this.state.score + scoreIncrement,
      isGameComplete: isComplete,
      endTime,
      totalTime
    }

    if (isComplete) {
      saveGameRecord(this.state)
    }

    this.notifyListeners()
  }

  getNextPrefecture(): Prefecture | null {
    const remaining = prefectures.filter(p =>
      this.state.targetPrefectures.includes(p.id) && !this.state.answeredPrefectures.has(p.id)
    )

    if (remaining.length === 0) return null

    const next = remaining[Math.floor(Math.random() * remaining.length)]
    this.state = { ...this.state, currentPrefecture: next }
    this.notifyListeners()
    return next
  }

  resetGame() {
    console.log('GameStateManager.resetGame called')
    
    // URLパラメーターを確認して新しい対象都道府県を設定
    let targetPrefectures: number[]
    
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const regionCount = parseInt(urlParams.get('regions') || '0')
      
      if (regionCount > 0) {
        targetPrefectures = getRandomRegions(regionCount)
      } else {
        targetPrefectures = Array.from({ length: 47 }, (_, i) => i + 1)
      }
    } else {
      targetPrefectures = Array.from({ length: 47 }, (_, i) => i + 1)
    }

    // 対象都道府県から最初の問題を選択
    const availablePrefectures = prefectures.filter(p => targetPrefectures.includes(p.id))
    const firstPrefecture = availablePrefectures[Math.floor(Math.random() * availablePrefectures.length)]

    this.state = {
      startTime: null,
      endTime: null,
      answeredPrefectures: new Set<number>(),
      currentPrefecture: firstPrefecture,
      totalTime: 0,
      isGameComplete: false,
      score: 0,
      targetPrefectures
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('gameState')
    }
    
    this.notifyListeners()
    
    // グローバルリセットをトリガー
    triggerGlobalReset()
  }

  getProgress() {
    const answered = this.state.answeredPrefectures.size
    const total = this.state.targetPrefectures.length
    const percentage = Math.round((answered / total) * 100)
    return { answered, total, percentage }
  }
  getTargetInfo() {
    const targetPrefectureObjects = prefectures.filter(p =>
      this.state.targetPrefectures.includes(p.id)
    )

    // 地方別にグループ化
    const regionGroups = targetPrefectureObjects.reduce((groups, pref) => {
      if (!groups[pref.region]) {
        groups[pref.region] = []
      }
      groups[pref.region].push(pref.name)
      return groups
    }, {} as Record<string, string[]>)

    return {
      totalCount: this.state.targetPrefectures.length,
      regions: Object.keys(regionGroups),
      regionGroups
    }
  }
  

  getElapsedTime(): number {
    if (!this.state.startTime) return 0
    if (this.state.endTime) return this.state.totalTime
    return Date.now() - this.state.startTime
  }
}



// シングルトンインスタンス
let gameStateManager: GameStateManager | null = null

export function getGameStateManager(): GameStateManager {
  if (!gameStateManager) {
    gameStateManager = new GameStateManager()
  }
  return gameStateManager
}

export function saveGameRecord(gameState: GameState) {
  if (typeof window === 'undefined' || !gameState.isGameComplete) return

  const totalMinutes = gameState.totalTime / (1000 * 60)
  const wpm = Math.round(47 / totalMinutes)

  const newRecord = {
    date: new Date().toISOString(),
    time: gameState.totalTime,
    score: gameState.score,
    wpm: isFinite(wpm) ? wpm : 0,
    accuracy: 100 // 現在は全問正解前提、将来的に不正解数も追跡可能
  }

  try {
    const existingRecords = JSON.parse(localStorage.getItem('gameRecords') || '[]')
    const updatedRecords = [...existingRecords, newRecord]
      .sort((a, b) => a.time - b.time) // タイム順でソート
      .slice(0, 50) // 最大50件まで保存

    localStorage.setItem('gameRecords', JSON.stringify(updatedRecords))
  } catch (error) {
    console.error('記録の保存に失敗:', error)
  }
}
