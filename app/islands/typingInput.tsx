import { useState, useEffect } from 'react'
import { Prefecture } from '../data/prefectures'

interface TypingInputProps {
  targetPrefecture: Prefecture
}

export default function TypingInput({ targetPrefecture }: TypingInputProps) {
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [score, setScore] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  // スコアをローカルストレージから読み込み
  useEffect(() => {
    const savedScore = localStorage.getItem('score')
    if (savedScore) {
      setScore(parseInt(savedScore))
    }
  }, [])

  // スコアをローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('score', score.toString())
  }, [score])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const userInput = input.trim().toLowerCase()
    const correctAnswers = [
      targetPrefecture.kana.toLowerCase(),
      targetPrefecture.name.toLowerCase(),
      targetPrefecture.name.replace('県', '').replace('府', '').replace('都', '').replace('道', '').toLowerCase()
    ]

    if (correctAnswers.some(answer => userInput === answer)) {
      setFeedback('🎉 正解！')
      setIsCorrect(true)
      setScore(prevScore => prevScore + 10)
      
      // 2秒後に次の問題へ
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } else {
      setFeedback('❌ 間違いです。もう一度挑戦してください！')
      setInput('')
    }
  }

  const handleShowAnswer = () => {
    setShowAnswer(true)
    setFeedback(`💡 答え: ${targetPrefecture.name} (${targetPrefecture.kana})`)
    
    // 3秒後に次の問題へ
    setTimeout(() => {
      window.location.reload()
    }, 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    // 入力時にフィードバックをクリア
    if (feedback && !isCorrect) {
      setFeedback('')
    }
  }

  return (
    <div className="typing-container">
      <h2 className="text-xl font-bold mb-4">都道府県名を入力してください</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="例: とうきょうと"
          className="typing-input w-full p-4 text-lg border-2 border-gray-300 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
          autoComplete="off"
          autoFocus
          disabled={isCorrect || showAnswer}
        />
        <button 
          type="submit" 
          className="submit-btn bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold mr-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!input.trim() || isCorrect || showAnswer}
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
          disabled={isCorrect || showAnswer}
        >
          答えを見る
        </button>
      </div>

      <div className="score-display text-center mt-6">
        <p className="text-2xl font-bold text-gray-800">
          スコア: <span className="text-blue-600">{score}</span>
        </p>
      </div>
    </div>
  )
}
