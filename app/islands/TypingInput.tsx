import { useState, useRef, useEffect } from 'react'
import { useGameState } from '../hooks/useGameState'
import { useScrollPreservation } from '../hooks/useScrollPreservation'

export default function TypingInput() {
  const { gameState, startGame, answerCorrect, getNextPrefecture, resetGame, isClient } = useGameState()
  const { preserveScrollDuring } = useScrollPreservation()
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [hintLevel, setHintLevel] = useState(0) // 0: なし, 1: 地方, 2: 面積, 3: 文字数
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true) // 自動進行設定
  const [correctCount, setCorrectCount] = useState(0) // 連続正解数
  const inputRef = useRef<HTMLInputElement>(null)

  const targetPrefecture = gameState.currentPrefecture

  // キーボードショートカット
  useEffect(() => {
    if (!isClient) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // 正解後のEnterで即座に次の問題へ
      if (e.key === 'Enter' && isCorrect && !gameState.isGameComplete) {
        e.preventDefault()
        goToNextQuestion()
      }
      // Escapeでヒントリセット
      if (e.key === 'Escape' && hintLevel > 0) {
        e.preventDefault()
        setHintLevel(0)
      }
      // Ctrl+Hでヒント表示
      if (e.ctrlKey && e.key === 'h' && !isCorrect && !showAnswer) {
        e.preventDefault()
        getNextHint()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isCorrect, hintLevel, gameState.isGameComplete, isClient])

  const goToNextQuestion = () => {
    preserveScrollDuring(() => {
      const next = getNextPrefecture()
      if (next) {
        setInput('')
        setFeedback('')
        setIsCorrect(false)
        setShowAnswer(false)
        // 即座にフォーカス
        setTimeout(() => {
          inputRef.current?.focus()
        }, 10)
      }
    })
  }



  // ひらがなの省略形を生成する関数
  const getHiraganaShortForm = (kana: string): string => {
    if (kana.endsWith('けん')) {
      return kana.slice(0, -2) // 末尾の「けん」を削除
    } else if (kana.endsWith('ふ')) {
      return kana.slice(0, -1) // 末尾の「ふ」を削除
    } else if (kana.endsWith('と')) {
      return kana.slice(0, -1) // 末尾の「と」を削除
    } return kana // 該当しない場合はそのまま
  }

  // 漢字の省略形を生成する関数
  const getKanjiShortForm = (name: string): string => {
    return name.replace(/[県府都]$/, '') // 末尾の都府県文字を削除
  }

  // 面積ランクに基づくヒントメッセージを生成
  const getAreaHintMessage = (rank: number): string => {
    if (rank <= 3) {
      return `日本で最も大きな都道府県の一つです（全国${rank}位）`
    } else if (rank <= 5) {
      return `面積が非常に大きい都道府県です（全国${rank}位）`
    } else if (rank <= 10) {
      return `面積が大きい都道府県です（全国${rank}位）`
    } else if (rank <= 20) {
      return `面積は中程度の都道府県です（全国${rank}位）`
    } else if (rank <= 35) {
      return `面積は小さめの都道府県です（全国${rank}位）`
    } else if (rank >= 45) {
      return `日本で最も小さな都道府県の一つです（全国${rank}位）`
    } else {
      return `面積が小さい都道府県です（全国${rank}位）`
    }
  }

  // 文字数ヒントを生成
  const getCharacterHint = (name: string): string => {
    const shortForm = getKanjiShortForm(name)
    return `漢字${shortForm.length}文字の都道府県です`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isClient || isCorrect) return
    
    startGame()
    
    const userInput = input.trim().toLowerCase()
    
    // 正解パターンを生成（既存のロジック）
    const correctAnswers = [
      targetPrefecture.kana.toLowerCase(),
      targetPrefecture.name.toLowerCase(),
      getKanjiShortForm(targetPrefecture.name).toLowerCase(),
      getHiraganaShortForm(targetPrefecture.kana).toLowerCase()
    ]

    if (correctAnswers.some(answer => userInput === answer)) {
      setFeedback('🎉 正解！')
      setIsCorrect(true)
      setCorrectCount(prev => prev + 1)
      answerCorrect(targetPrefecture.id, hintLevel)
      
      // 自動進行が有効な場合のみタイマー設定
      if (autoAdvanceEnabled) {
        setTimeout(() => {
          if (!gameState.isGameComplete) {
            goToNextQuestion()
          }
        }, 800) // 時間を短縮
      }
    } else {
      setFeedback('❌ 不正解')
      setInput('')
      setCorrectCount(0) // 連続正解数リセット
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }

  const handleShowAnswer = () => {
    if (!isClient) return
    
    setShowAnswer(true)
    setFeedback(`💡 答え: ${targetPrefecture.name} (${targetPrefecture.kana})`)
    
    // スクロール位置を保持したまま次の問題へ
    setTimeout(() => {
      if (!gameState.isGameComplete) {
        const next = getNextPrefecture()
        if (next) {
          setInput('')
          setFeedback('')
          setIsCorrect(false)
          setShowAnswer(false)
        }
      }
    }, 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (feedback && !isCorrect) {
      setFeedback('')
    }
  }

  const getNextHint = () => {
    if (hintLevel < 3) {
      setHintLevel(hintLevel + 1)
    }
  }

  if (gameState.isGameComplete) {
    return (
      <div className="typing-container">
        <div className="text-center p-8">
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            🎊 全都道府県制覇！ 🎊
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            素晴らしい！全ての都道府県を覚えましたね！
          </p>
          <button 
            onClick={() => {
              if (isClient) {
                // スクロール位置を保存
                const scrollPosition = window.scrollY
                // 状態をリセット（リロードの代わりに）
                resetGame()
                // リロード後にスクロール位置を復元
                setTimeout(() => {
                  window.scrollTo(0, scrollPosition)
                }, 100)
              }
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg"
            disabled={!isClient}
          >
            もう一度挑戦する
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="typing-container">
      <h2 className="text-xl font-bold mb-4">都道府県名を入力してください</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="例: とうきょう / 東京"
          className="typing-input w-full p-4 text-lg border-2 border-gray-300 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
          autoComplete="off"
          disabled={isCorrect || showAnswer || !isClient}
        />
        <button 
          type="submit" 
          className="submit-btn bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold mr-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!input.trim() || isCorrect || showAnswer || !isClient}
        >
          回答する
        </button>
      </form>

      {feedback && (
        <div className={`feedback text-lg font-bold mb-4 p-3 rounded-lg ${
          isCorrect 
            ? 'text-green-600 bg-green-100' 
            : showAnswer 
              ? 'text-blue-600 bg-blue-100'
              : 'text-red-600 bg-red-100'
        }`}>
          {feedback}
        </div>
      )}

      <div className="hint-section bg-gray-50 p-4 rounded-lg">
        <div className="mb-3">
          {/* ヒント段階表示 */}
          {hintLevel >= 1 && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-2">
              <p className="text-yellow-800 text-sm">
                🗾 <span className="font-semibold">地方ヒント:</span> {targetPrefecture.region}地方
              </p>
            </div>
          )}
          
          {hintLevel >= 2 && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-2">
              <p className="text-blue-800 text-sm">
                📏 <span className="font-semibold">面積ヒント:</span> {getAreaHintMessage(targetPrefecture.areaRank)}
              </p>
              <p className="text-blue-600 text-xs mt-1">
                面積: {targetPrefecture.area.toLocaleString()} km²
              </p>
            </div>
          )}
          
          {hintLevel >= 3 && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-2">
              <p className="text-green-800 text-sm">
                ✏️ <span className="font-semibold">文字数ヒント:</span> {getCharacterHint(targetPrefecture.name)}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {hintLevel < 3 && (
            <button 
              onClick={getNextHint}
              className="hint-btn bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              disabled={isCorrect || showAnswer || !isClient}
            >
              {hintLevel === 0 ? 'ヒントを見る' : 'もっとヒント'}
            </button>
          )}
          
          <button 
            onClick={handleShowAnswer}
            className="hint-btn bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
            disabled={isCorrect || showAnswer || !isClient}
          >
            答えを見る
          </button>
          
          {hintLevel > 0 && (
            <button 
              onClick={() => setHintLevel(0)}
              className="hint-btn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              disabled={isCorrect || showAnswer || !isClient}
            >
              ヒントを隠す
            </button>
          )}
        </div>
        
        {/* ヒント進捗表示 */}
        {hintLevel > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>ヒント進捗</span>
              <span>{hintLevel}/3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div 
                className="bg-yellow-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(hintLevel / 3) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
      {/* キーボードショートカット説明 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">⌨️ キーボードショートカット</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div>• <kbd className="bg-white px-1 rounded">Enter</kbd>: 回答 / 正解後に次の問題</div>
          <div>• <kbd className="bg-white px-1 rounded">Ctrl+H</kbd>: ヒント表示</div>
          <div>• <kbd className="bg-white px-1 rounded">Esc</kbd>: ヒントを隠す</div>
        </div>
      </div>
    </div>
  )
}
