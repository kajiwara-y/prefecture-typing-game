import { useState, useRef, useEffect } from "react";
import { GameProvider, useGameState } from '../contexts/GameContext'
import { useScrollPreservation } from "../hooks/useScrollPreservation";
import { registerGlobalResetCallback } from '../utils/gameState'

function TypingInputInner() {
  const {
    gameState,
    resetTrigger,
    startGame,
    answerCorrect,
    getNextPrefecture,
    resetGame,
    isClient,
  } = useGameState();
  const { preserveScrollDuring } = useScrollPreservation();
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hintLevel, setHintLevel] = useState(0); // 0: なし, 1: 地方, 2: 面積, 3: 文字数
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true); // 自動進行設定
  const [correctCount, setCorrectCount] = useState(0); // 連続正解数
  const [isTypingPractice, setIsTypingPractice] = useState(false); // 新しい状態
  const inputRef = useRef<HTMLInputElement>(null);
  const autoMoveCountMsec = 650;

  const targetPrefecture = gameState.currentPrefecture;

  // 問題が変わったときに状態をリセット
  useEffect(() => {
    setHintLevel(0);
    // showAnswer が true の場合はリセットしない
    if (!showAnswer) {
      setIsTypingPractice(false);
      setShowAnswer(false);
    }

    if (isClient && inputRef.current && !isCorrect && !showAnswer) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [targetPrefecture.id, isClient, isCorrect]); // showAnswer を依存配列から除外

  // キーボードショートカット
  useEffect(() => {
    if (!isClient) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 正解後またはタイピング練習完了後のEnterで次の問題へ
      if (
        e.key === "Enter" &&
        (isCorrect ||
          (isTypingPractice === false && feedback.includes("完了"))) &&
        !gameState.isGameComplete
      ) {
        e.preventDefault();
        goToNextQuestion();
      }
      // 他のショートカットは変更なし
      if (e.key === "Escape" && hintLevel > 0) {
        e.preventDefault();
        setHintLevel(0);
      }
      if (
        e.ctrlKey &&
        e.key === "h" &&
        !isCorrect &&
        !showAnswer &&
        !isTypingPractice
      ) {
        e.preventDefault();
        getNextHint();
      }
    };

    

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isCorrect,
    isTypingPractice,
    feedback,
    hintLevel,
    gameState.isGameComplete,
    isClient,
  ]);

  // グローバルリセットコールバックを登録（Context のresetTriggerの代わり）
  useEffect(() => {
    if (!isClient) return

    console.log('TypingInput - Registering global reset callback')
    
    const resetCallback = () => {
      console.log('TypingInput - Global reset callback executed')
      
      setInput('')
      setCorrectCount(0) // これが重要！
      setFeedback('')
      setIsCorrect(false)
      setShowAnswer(false)
      setIsTypingPractice(false)
      setHintLevel(0)
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.value = ''
        }
      }, 100)
    }

    const unregister = registerGlobalResetCallback(resetCallback)
    return unregister
  }, [isClient])

  const goToNextQuestion = () => {
    preserveScrollDuring(() => {
      const next = getNextPrefecture();
      if (next) {
        setInput("");
        setFeedback("");
        setIsCorrect(false);
        setShowAnswer(false);
        setIsTypingPractice(false);
        setTimeout(() => {
          inputRef.current?.focus();
          if (inputRef.current) {
            inputRef.current.value = "";
          }
        }, 10);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isClient) return;

    startGame();

    const userInput = input.trim().toLowerCase();

    // 正解パターンを生成
    const correctAnswers = [
      targetPrefecture.kana.toLowerCase(),
      targetPrefecture.name.toLowerCase(),
      getKanjiShortForm(targetPrefecture.name).toLowerCase(),
      getHiraganaShortForm(targetPrefecture.kana).toLowerCase(),
    ];

    if (correctAnswers.some((answer) => userInput === answer)) {
      if (isTypingPractice) {
        // タイピング練習モードの場合
        setFeedback("✅ タイピング練習完了！");
        setIsCorrect(false); //（スコアに加算しない）
        setIsTypingPractice(false);
        setCorrectCount((prev) => prev + 1);

        // 自動進行が有効な場合のみタイマー設定
        if (autoAdvanceEnabled) {
          setTimeout(() => {
            if (!gameState.isGameComplete) {
              goToNextQuestion();
            }
          }, autoMoveCountMsec);
        }
      } else {
        // 通常の回答モードの場合
        setFeedback("🎉 正解！");
        setIsCorrect(true);
        setCorrectCount((prev) => prev + 1);
        answerCorrect(targetPrefecture.id, hintLevel);

        if (autoAdvanceEnabled) {
          setTimeout(() => {
            if (!gameState.isGameComplete) {
              goToNextQuestion();
            }
          }, autoMoveCountMsec);
        }
      }
    } else {
      if (isTypingPractice) {
        setFeedback("❌ もう一度入力してください");
      } else {
        setFeedback("❌ 不正解");
        setCorrectCount(0);
      }
      setInput("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  // 省略形生成関数
  const getHiraganaShortForm = (kana: string): string => {
    if (kana.endsWith("けん")) return kana.slice(0, -2);
    if (kana.endsWith("ふ")) return kana.slice(0, -1);
    if (kana.endsWith("と")) return kana.slice(0, -1);
    return kana;
  };

  const getKanjiShortForm = (name: string): string => {
    return name.replace(/[県府都]$/, "");
  };

  const getAreaHintMessage = (rank: number): string => {
    if (rank <= 3) return `日本で最も大きな都道府県の一つです（全国${rank}位）`;
    if (rank <= 5) return `面積が非常に大きい都道府県です（全国${rank}位）`;
    if (rank <= 10) return `面積が大きい都道府県です（全国${rank}位）`;
    if (rank <= 20) return `面積は中程度の都道府県です（全国${rank}位）`;
    if (rank <= 35) return `面積は小さめの都道府県です（全国${rank}位）`;
    if (rank >= 45)
      return `日本で最も小さな都道府県の一つです（全国${rank}位）`;
    return `面積が小さい都道府県です（全国${rank}位）`;
  };

  const getCharacterHint = (name: string): string => {
    const shortForm = getKanjiShortForm(name);
    return `漢字${shortForm.length}文字の都道府県です`;
  };

  const handleShowAnswer = () => {
    if (!isClient) return;

    setShowAnswer(true);
    setIsTypingPractice(true);
    setFeedback(`💡 答え: ${targetPrefecture.name} (${targetPrefecture.kana})`);
    setCorrectCount(0); // 連続正解数リセット
    setInput(""); // 入力欄をクリア

    // フォーカスを入力欄に移す
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (feedback && !isCorrect && !isTypingPractice) {
      setFeedback("");
    }
  };

  const getNextHint = () => {
    if (hintLevel < 3) {
      setHintLevel(hintLevel + 1);
    }
  };

  // プレースホルダーテキストを動的に生成
  const getPlaceholder = (): string => {
    if (isTypingPractice) {
      const result = `${targetPrefecture.kana} / (${targetPrefecture.name} と入力してください`;
      return result;
    }
    return "例: とうきょう / 東京";
  };

  // 入力欄の状態に応じたスタイル
  const getInputStyle = (): string => {
    const baseStyle =
      "typing-input w-full p-4 text-lg border-2 rounded-lg mb-4 focus:outline-none transition-colors";

    if (isTypingPractice) {
      return `${baseStyle} border-blue-400 focus:border-blue-600 bg-blue-50`;
    }
    return `${baseStyle} border-gray-300 focus:border-blue-500`;
  };

  if (gameState.isGameComplete) {
    return (
      <div className="typing-container">
        <div className="text-center p-8">
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            🎊 全都道府県制覇！ 🎊
          </h2>
          <p className="text-lg text-gray-700 mb-2">
            素晴らしい！全ての都道府県を覚えましたね！
          </p>
          <p className="text-md text-gray-600 mb-6">
            最終スコア: {gameState.score}点
          </p>
          <button
            onClick={() => {
              if (isClient) {
                const scrollPosition = window.scrollY;
                // localStorage をクリアしてからリセット
                localStorage.removeItem("gameState");

                resetGame(); 
                setCorrectCount(0);
                setTimeout(() => {
                  window.scrollTo(0, scrollPosition);
                }, 100);
              }
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg"
            disabled={!isClient}
          >
            もう一度挑戦する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="typing-container">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {isTypingPractice ? "タイピング練習" : "都道府県名を入力してください"}
        </h2>
        {correctCount > 0 && (
          <div className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
            連続 {correctCount} 問正解！
          </div>
        )}
      </div>

      {/* タイピング練習モードの説明 */}
      {isTypingPractice && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
          <p className="text-blue-800 text-sm">
            📝 答えを確認できました。今度は実際にタイピングして覚えましょう！
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={getPlaceholder()}
          className={getInputStyle()}
          autoComplete="off"
          disabled={!isClient}
        />

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="submit"
            className="submit-btn bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={!input.trim() || !isClient}
          >
            {isTypingPractice ? "タイピング確認" : "回答する"}
          </button>

          {(isCorrect ||
            (isTypingPractice === false && feedback.includes("完了"))) &&
            !gameState.isGameComplete && (
              <button
                type="button"
                onClick={goToNextQuestion}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                次の問題 (Enter)
              </button>
            )}
        </div>
      </form>

      {feedback && (
        <div
          className={`feedback text-lg font-bold mb-4 p-3 rounded-lg transition-all ${
            isCorrect
              ? "text-green-600 bg-green-100"
              : isTypingPractice && feedback.includes("完了")
              ? "text-blue-600 bg-blue-100"
              : showAnswer && !isTypingPractice
              ? "text-blue-600 bg-blue-100"
              : "text-red-600 bg-red-100"
          }`}
        >
          {feedback}
          {(isCorrect || (isTypingPractice && feedback.includes("完了"))) &&
            !gameState.isGameComplete && (
              <div className="text-sm mt-2 text-green-700">
                Enterキーで次の問題へ
              </div>
            )}
        </div>
      )}

      {/* 設定パネル */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={autoAdvanceEnabled}
            onChange={(e) => setAutoAdvanceEnabled(e.target.checked)}
            className="mr-2"
          />
          自動で次の問題に進む（{autoMoveCountMsec}ミリ秒後）
        </label>
      </div>

      {/* ヒントセクション - タイピング練習中は非表示 */}
      {!isTypingPractice && (
        <div className="hint-section bg-gray-50 p-4 rounded-lg">
          <div className="mb-3">
            {hintLevel >= 1 && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-2">
                <p className="text-yellow-800 text-sm">
                  🗾 <span className="font-semibold">地方ヒント:</span>{" "}
                  {targetPrefecture.region}地方
                </p>
              </div>
            )}

            {hintLevel >= 2 && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-2">
                <p className="text-blue-800 text-sm">
                  📏 <span className="font-semibold">面積ヒント:</span>{" "}
                  {getAreaHintMessage(targetPrefecture.areaRank)}
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  面積: {targetPrefecture.area.toLocaleString()} km²
                </p>
              </div>
            )}

            {hintLevel >= 3 && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-2">
                <p className="text-green-800 text-sm">
                  ✏️ <span className="font-semibold">文字数ヒント:</span>{" "}
                  {getCharacterHint(targetPrefecture.name)}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {hintLevel < 3 && (
              <button
                onClick={getNextHint}
                className="hint-btn bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed text-sm transition-colors"
                disabled={isCorrect || showAnswer || !isClient}
                title="Ctrl+H"
              >
                {hintLevel === 0 ? "ヒントを見る" : "もっとヒント"} (Ctrl+H)
              </button>
            )}

            <button
              onClick={handleShowAnswer}
              className="hint-btn bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed text-sm transition-colors"
              disabled={isCorrect || showAnswer || !isClient}
            >
              答えを見る
            </button>

            {hintLevel > 0 && (
              <button
                onClick={() => setHintLevel(0)}
                className="hint-btn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed text-sm transition-colors"
                disabled={isCorrect || showAnswer || !isClient}
                title="Escape"
              >
                ヒントを隠す (Esc)
              </button>
            )}
          </div>

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
      )}

      {/* キーボードショートカット説明 - タイピング練習中は簡略化 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">
          ⌨️ キーボードショートカット
        </h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div>
            • <kbd className="bg-white px-1 rounded">Enter</kbd>:{" "}
            {isTypingPractice ? "タイピング確認" : "回答"} / 次の問題
          </div>
          {!isTypingPractice && (
            <>
              <div>
                • <kbd className="bg-white px-1 rounded">Ctrl+H</kbd>:
                ヒント表示
              </div>
              <div>
                • <kbd className="bg-white px-1 rounded">Esc</kbd>: ヒントを隠す
              </div>
            </>
          )}
        </div>
      </div>

      {/* タイピング練習中の追加ガイド */}
      {isTypingPractice && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-semibold text-green-800 mb-2">
            💡 タイピングのコツ
          </h4>
          <div className="text-xs text-green-700 space-y-1">
            <div>• ひらがなでも漢字でも正解です</div>
            <div>• 「県」「府」「都」は省略してもOKです</div>
            <div>• 落ち着いて、正確に入力しましょう</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TypingInput() {
  return (
    <GameProvider>
      <TypingInputInner />
    </GameProvider>
  )
}
