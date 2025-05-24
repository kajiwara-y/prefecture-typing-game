import { useState, useRef, useEffect } from 'react'
import { useGameState } from '../hooks/useGameState'
import { useScrollPreservation } from '../hooks/useScrollPreservation'

export default function TypingInput() {
  const { gameState, startGame, answerCorrect, getNextPrefecture, isClient } = useGameState()
  const { preserveScrollDuring } = useScrollPreservation()
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const targetPrefecture = gameState.currentPrefecture

  // 問題が変わったときにフォーカスを戻す
  useEffect(() => {
    if (isClient && inputRef.current && !isCorrect && !showAnswer) {
      // 少し遅延させてフォーカス
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [targetPrefecture.id, isClient, isCorrect, showAnswer])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isClient) return
    
    startGame()
    
    const userInput = input.trim().toLowerCase()
    
    // 正解パターンを生成
    const correctAnswers = [
      // 完全な名前（ひらがな）
      targetPrefecture.kana.toLowerCase(),
      // 完全な名前（漢字）
      targetPrefecture.name.toLowerCase(),
      // 省略形（漢字）
      getKanjiShortForm(targetPrefecture.name).toLowerCase(),
      // 省略形（ひらがな）
      getHiraganaShortForm(targetPrefecture.kana).toLowerCase()
    ]

    if (correctAnswers.some(answer => userInput === answer)) {
      setFeedback('🎉 正解！')
      setIsCorrect(true)
      answerCorrect(targetPrefecture.id)
      
      // スクロール位置を保持したまま次の問題へ
      setTimeout(() => {
        if (!gameState.isGameComplete) {
          preserveScrollDuring(() => {
            const next = getNextPrefecture()
            if (next) {
              setInput('')
              setFeedback('')
              setIsCorrect(false)
              setShowAnswer(false)
            }
          })
        }
      }, 1500)
    } else {
      setFeedback('❌ 間違いです。もう一度挑戦してください！')
      setInput('')
      // 入力フィールドにフォーカスを戻す
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
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
                window.location.reload()
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
        <p className="text-gray-700 mb-3">
          <span className="font-semibold">ヒント:</span> {targetPrefecture.region}地方
        </p>
        <button 
          onClick={handleShowAnswer}
          className="hint-btn bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={isCorrect || showAnswer || !isClient}
        >
          答えを見る
        </button>
      </div>
    </div>
  )
}
