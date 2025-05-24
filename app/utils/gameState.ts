import { Prefecture, prefectures } from '../data/prefectures'

export interface GameState {
  startTime: number | null
  endTime: number | null
  answeredPrefectures: Set<number>
  currentPrefecture: Prefecture
  totalTime: number
  isGameComplete: boolean
  score: number
}

class GameStateManager {
  private state: GameState
  private listeners: Set<(state: GameState) => void> = new Set()

  constructor() {
    this.state = this.getInitialState()
    this.loadFromStorage()
  }

  private getInitialState(): GameState {
    return {
      startTime: null,
      endTime: null,
      answeredPrefectures: new Set<number>(),
      currentPrefecture: prefectures[Math.floor(Math.random() * prefectures.length)],
      totalTime: 0,
      isGameComplete: false,
      score: 0
    }
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('gameState')
      if (saved) {
        const parsed = JSON.parse(saved)
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
    const remaining = prefectures.filter(p => !answered.has(p.id))
    if (remaining.length === 0) return prefectures[0]
    return remaining[Math.floor(Math.random() * remaining.length)]
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

  answerCorrect(prefectureId: number) {
    const newAnswered = new Set(this.state.answeredPrefectures)
    newAnswered.add(prefectureId)
    
    const isComplete = newAnswered.size === prefectures.length
    const endTime = isComplete ? Date.now() : null
    const totalTime = endTime && this.state.startTime ? endTime - this.state.startTime : 0

    this.state = {
      ...this.state,
      answeredPrefectures: newAnswered,
      score: this.state.score + 10,
      isGameComplete: isComplete,
      endTime,
      totalTime
    }
    this.notifyListeners()
  }

  getNextPrefecture(): Prefecture | null {
    const remaining = prefectures.filter(p => !this.state.answeredPrefectures.has(p.id))
    if (remaining.length === 0) return null
    
    const next = remaining[Math.floor(Math.random() * remaining.length)]
    this.state = { ...this.state, currentPrefecture: next }
    this.notifyListeners()
    return next
  }

  resetGame() {
    this.state = this.getInitialState()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gameState')
    }
    this.notifyListeners()
  }

  getProgress() {
    const answered = this.state.answeredPrefectures.size
    const total = prefectures.length
    const percentage = Math.round((answered / total) * 100)
    return { answered, total, percentage }
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
