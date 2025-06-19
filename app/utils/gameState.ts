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

  // パスベースでの初期化（URLパラメータ方式から変更）
  initializeFromPath() {
    if (typeof window === 'undefined') return

    const path = window.location.pathname
    console.log('initializeFromPath - current path:', path)

    // パスから地方数を抽出
    let regionCount = 0
    const regionMatch = path.match(/^\/region\/(\d+)$/)
    
    if (regionMatch) {
      regionCount = parseInt(regionMatch[1])
      console.log('initializeFromPath - detected region count:', regionCount)
    }

    if (regionCount > 0 && regionCount <= 7) {
      // 地方ランダムモード
      const targetPrefectures = getRandomRegions(regionCount)
      const availablePrefectures = prefectures.filter(p => targetPrefectures.includes(p.id))

      this.state = {
        ...this.state,
        targetPrefectures,
        currentPrefecture: availablePrefectures[Math.floor(Math.random() * availablePrefectures.length)]
      }

      console.log('initializeFromPath - set region mode:', {
        regionCount,
        targetPrefectures: targetPrefectures.length,
        currentPrefecture: this.state.currentPrefecture.name
      })

      this.notifyListeners()
    } else {
      // 全県モード（デフォルト）
      console.log('initializeFromPath - using all prefectures mode')
    }
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('gameState')
      if (saved) {
        const parsed = JSON.parse(saved)
        
        // パスから現在のモードを判定
        const path = window.location.pathname
        const regionMatch = path.match(/^\/region\/(\d+)$/)
        const currentRegionCount = regionMatch ? parseInt(regionMatch[1]) : 0
        
        // 保存された状態のモードを判定
        const savedRegionCount = parsed.targetPrefectures?.length < 47 ? 
          this.getRegionCountFromTargetPrefectures(parsed.targetPrefectures || []) : 0
        
        console.log('loadFromStorage - mode comparison:', {
          currentPath: path,
          currentRegionCount,
          savedRegionCount,
          savedTargetCount: parsed.targetPrefectures?.length || 47
        })

        // モードが一致する場合のみ復元
        if (currentRegionCount === savedRegionCount) {
          this.state = {
            ...parsed,
            answeredPrefectures: new Set(parsed.answeredPrefectures),
            currentPrefecture: parsed.currentPrefecture || this.getRandomUnansweredPrefecture(new Set(parsed.answeredPrefectures))
          }
          console.log('loadFromStorage - restored saved state')
        } else {
          console.log('loadFromStorage - mode mismatch, ignoring saved state')
        }
      }
    } catch (error) {
      console.error('ゲーム状態の復元に失敗:', error)
      // LocalStorageの読み取りに失敗した場合、データをクリアしてページを再読み込み
      this.clearStorageAndReload()
    }
  }

  // LocalStorageをクリアしてページを再読み込みする
  private clearStorageAndReload() {
    if (typeof window === 'undefined') return
    
    try {
      console.log('データ形式の不一致を検出。LocalStorageをクリアして再読み込みします')
      localStorage.removeItem('gameState')
      window.location.reload()
    } catch (error) {
      console.error('LocalStorageのクリアに失敗:', error)
    }
  }

  // 対象都道府県数から地方数を推定
  private getRegionCountFromTargetPrefectures(targetPrefectures: number[]): number {
    if (targetPrefectures.length === 47) return 0 // 全県モード
    
    // 地方数を推定（完全ではないが、大体の判定用）
    if (targetPrefectures.length <= 7) return 1
    if (targetPrefectures.length <= 14) return 2
    if (targetPrefectures.length <= 21) return 3
    if (targetPrefectures.length <= 28) return 4
    if (targetPrefectures.length <= 35) return 5
    if (targetPrefectures.length <= 42) return 6
    return 7
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
    const availablePrefectures = prefectures.filter(p =>
      this.state.targetPrefectures.includes(p.id) && !answered.has(p.id)
    )

    if (availablePrefectures.length === 0) {
      return prefectures.find(p => this.state.targetPrefectures.includes(p.id)) || prefectures[0]
    }

    return availablePrefectures[Math.floor(Math.random() * availablePrefectures.length)]
  }

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

  answerCorrect(prefectureId: number, hintLevel: number = 0) {
    const newAnswered = new Set(this.state.answeredPrefectures)
    newAnswered.add(prefectureId)

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
    
    // パスから現在のモードを判定して新しい対象都道府県を設定
    let targetPrefectures: number[]
    
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const regionMatch = path.match(/^\/region\/(\d+)$/)
      const regionCount = regionMatch ? parseInt(regionMatch[1]) : 0
      
      if (regionCount > 0 && regionCount <= 7) {
        targetPrefectures = getRandomRegions(regionCount)
        console.log('resetGame - new region mode:', regionCount, 'prefectures:', targetPrefectures.length)
      } else {
        targetPrefectures = Array.from({ length: 47 }, (_, i) => i + 1)
        console.log('resetGame - all prefectures mode')
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
  const wpm = Math.round(gameState.targetPrefectures.length / totalMinutes)

  // 地方情報を取得
  const manager = getGameStateManager()
  const targetInfo = manager.getTargetInfo()
  
  const modeDescription = gameState.targetPrefectures.length === 47 
    ? '全県モード' 
    : `${targetInfo.regions.join('・')}地方モード`

  const newRecord = {
    date: new Date().toISOString(),
    time: gameState.totalTime,
    score: gameState.score,
    wpm: isFinite(wpm) ? wpm : 0,
    accuracy: 100,
    mode: modeDescription, // 追加
    totalPrefectures: gameState.targetPrefectures.length // 追加
  }

  try {
    const existingRecords = JSON.parse(localStorage.getItem('gameRecords') || '[]')
    const updatedRecords = [...existingRecords, newRecord]
      .sort((a, b) => a.time - b.time)
      .slice(0, 50) // 最大50件まで保存

    localStorage.setItem('gameRecords', JSON.stringify(updatedRecords))
  } catch (error) {
    console.error('記録の保存に失敗:', error)
    // 記録の保存に失敗した場合はLocalStorageをクリア
    try {
      localStorage.removeItem('gameRecords')
    } catch (e) {
      console.error('LocalStorageのクリアに失敗:', e)
    }
  }
}
