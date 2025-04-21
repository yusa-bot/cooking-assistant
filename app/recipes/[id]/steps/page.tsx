"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Volume2, Mic, Timer, Check, X, MicOff } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getSpeechRecognition } from "@/utils/speech-recognition"
import { getAnswerForQuestion } from "@/utils/cooking-ai"
import { getSpeechSynthesis } from "@/utils/speech-synthesis"

// レシピの手順の型定義
interface RecipeStep {
  id: number
  instruction: string
  imageUrl?: string
  timer?: number // タイマー（秒）
}

// レシピの型定義
interface Recipe {
  id: number
  name: string
  steps: RecipeStep[]
}

export default function RecipeStepsPage() {
  const params = useParams()
  const recipeId = Number(params.id)
  const router = useRouter()

  const [isListening, setIsListening] = useState(false)
  const [voiceQuestion, setVoiceQuestion] = useState("")
  const [aiAnswer, setAiAnswer] = useState("")
  const [showAiAnswer, setShowAiAnswer] = useState(false)
  const [activeTimers, setActiveTimers] = useState<Record<number, boolean>>({})
  const [timerSeconds, setTimerSeconds] = useState<Record<number, number>>({})
  const timerIntervalsRef = useRef<Record<number, NodeJS.Timeout>>({})
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)

  // ログインチェックを追加
  useEffect(() => {
    const fetchRecipe = async () => {
      const user = localStorage.getItem("user")
      if (!user) {
        router.push("/login")
        return
      }
  
      const { token } = JSON.parse(user)
  
      try {
        const res = await fetch(`/api/ai}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("レシピ取得に失敗")
        const data = await res.json()
        setRecipe(data)
      } catch (err) {
        console.error("レシピ取得エラー:", err)
        router.push("/recipes")
      } finally {
        setLoading(false)
      }
    }
  
    fetchRecipe()
  }, [recipeId, router])

  // 次のステップに進む
  const goToNextStep = () => {
    if (recipe && currentStepIndex < recipe.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  // 前のステップに戻る
  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  // 特定のステップに移動
  const goToStep = (index: number) => {
    if (recipe && index >= 0 && index < recipe.steps.length) {
      setCurrentStepIndex(index)
    }
  }

  // 音声読み上げ
  const speakInstruction = (instruction: string) => {
    const speechSynthesis = getSpeechSynthesis()

    if (speechSynthesis.getIsSpeaking()) {
      // 既に読み上げ中なら停止
      speechSynthesis.stop()
      setIsSpeaking(false)
    } else {
      // 読み上げ開始
      speechSynthesis.speak(instruction)
      setIsSpeaking(true)

      // 読み上げ状態を監視するインターバル
      const checkInterval = setInterval(() => {
        if (!speechSynthesis.getIsSpeaking()) {
          setIsSpeaking(false)
          clearInterval(checkInterval)
        }
      }, 100)
    }
  }

  // 音声認識の開始
  const startVoiceRecognition = () => {
    const speechRecognition = getSpeechRecognition()

    if (!speechRecognition.isSupported()) {
      alert("お使いのブラウザは音声認識に対応していません。")
      return
    }

    setIsListening(true)
    setVoiceQuestion("")
    setAiAnswer("")
    setShowAiAnswer(false)

    speechRecognition.startListening(
      (text) => {
        setVoiceQuestion(text)
        const answer = getAnswerForQuestion(text)
        setAiAnswer(answer)
        setShowAiAnswer(true)
        setIsListening(false)

        // 回答を音声で読み上げる
        const speechSynthesis = getSpeechSynthesis()
        speechSynthesis.speak(answer)
        setIsSpeaking(true)
      },
      (error) => {
        console.error("音声認識エラー:", error)
        setIsListening(false)
        alert("音声認識に失敗しました。もう一度お試しください。")
      },
    )
  }

  // 音声認識の停止
  const stopVoiceRecognition = () => {
    const speechRecognition = getSpeechRecognition()
    speechRecognition.stopListening()
    setIsListening(false)
  }

  // AIの回答を閉じる
  const closeAiAnswer = () => {
    setShowAiAnswer(false)
  }

  // タイマーを開始
  const startTimer = (stepId: number, duration: number) => {
    if (!activeTimers[stepId]) {
      setTimerSeconds((prev) => ({ ...prev, [stepId]: duration }))
      setActiveTimers((prev) => ({ ...prev, [stepId]: true }))

      timerIntervalsRef.current[stepId] = setInterval(() => {
        setTimerSeconds((prev) => {
          const newSeconds = prev[stepId] - 1
          if (newSeconds <= 0) {
            stopTimer(stepId)
            // タイマー終了時に通知
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("タイマー終了", {
                body: `ステップ ${stepId} のタイマーが終了しました。`,
                icon: "/favicon.ico",
              })
            }
            return { ...prev, [stepId]: 0 }
          }
          return { ...prev, [stepId]: newSeconds }
        })
      }, 1000)
    }
  }

  // タイマーを停止
  const stopTimer = (stepId: number) => {
    if (timerIntervalsRef.current[stepId]) {
      clearInterval(timerIntervalsRef.current[stepId])
      delete timerIntervalsRef.current[stepId]
    }
    setActiveTimers((prev) => ({ ...prev, [stepId]: false }))
  }

  // タイマーの表示形式を整える
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // 調理完了
  const finishCooking = () => {
    // 写真提出画面に遷移
    router.push(`/recipes/${recipeId}/submit-photo`)
  }

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      // 音声認識を停止
      const speechRecognition = getSpeechRecognition()
      speechRecognition.stopListening()

      // 音声読み上げを停止
      const speechSynthesis = getSpeechSynthesis()
      speechSynthesis.stop()

      // タイマーをクリア
      Object.values(timerIntervalsRef.current).forEach(clearInterval)
    }
  }, [])

  // 通知の許可を要求
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  if (loading) return <p className="text-center">読み込み中...</p>
  if (!recipe) return <p className="text-center">レシピが見つかりません</p>

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="w-full max-w-md mx-auto py-4 flex items-center justify-between sticky top-0 bg-gray-50 z-10">
        <Link
          href="/recipes"
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>レシピ一覧</span>
        </Link>
        <h1 className="text-xl font-semibold truncate max-w-[200px]">{recipe.name}</h1>
        <div className="w-16"></div> {/* スペーサー */}
      </header>

      <div className="flex flex-col items-center justify-start flex-1 w-full max-w-md mx-auto">
        {/* 音声質問ボタン - 常に画面上部に固定 */}
        <div className="sticky top-16 z-10 w-full flex justify-center my-4">
          <button
            onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
            className={`flex items-center justify-center px-6 py-3 rounded-full shadow-lg ${
              isListening ? "bg-red-500 text-white" : "bg-white text-gray-800 border border-gray-300"
            }`}
            aria-label={isListening ? "音声認識を停止" : "音声で質問"}
          >
            {isListening ? (
              <>
                <MicOff className="h-6 w-6 mr-2" />
                <span className="font-medium">停止する</span>
              </>
            ) : (
              <>
                <Mic className="h-6 w-6 mr-2" />
                <span className="font-medium">音声で質問</span>
              </>
            )}
          </button>
        </div>

        {/* 音声質問と回答 */}
        {showAiAnswer && (
          <div className="w-full bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-md relative">
            <button onClick={closeAiAnswer} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
            {voiceQuestion && <p className="text-sm text-gray-500 mb-2">質問: {voiceQuestion}</p>}
            <p className="text-gray-800">{aiAnswer}</p>
          </div>
        )}

        {/* ステップインジケーター */}
        <div className="w-full flex justify-center mb-4">
          <div className="flex items-center space-x-2">
            {recipe.steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-4 h-4 rounded-full ${
                  index === currentStepIndex
                    ? "bg-green-600"
                    : index < currentStepIndex
                      ? "bg-green-300"
                      : "bg-gray-300 dark:bg-gray-600"
                }`}
                aria-label={`ステップ ${index + 1} へ移動`}
              />
            ))}
          </div>
        </div>

        {/* 調理手順 - 1ステップずつ表示 */}
        <div className="w-full mb-24">
          <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">
                  ステップ {currentStepIndex + 1}/{recipe.steps.length}
                </span>
                <button
                  onClick={() => speakInstruction(recipe.steps[currentStepIndex].instruction)}
                  className={`p-4 rounded-full ${
                    isSpeaking ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  aria-label={isSpeaking ? "音声読み上げを停止" : "音声読み上げ"}
                >
                  <Volume2 className="h-7 w-7" />
                </button>
              </div>

              <p className="text-gray-800 dark:text-gray-200 text-2xl font-bold mb-6 leading-relaxed">
                {recipe.steps[currentStepIndex].instruction}
              </p>

              {/* タイマー */}
              {recipe.steps[currentStepIndex].timer && (
                <div className="mt-4 mb-6">
                  {activeTimers[recipe.steps[currentStepIndex].id] ? (
                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                      <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                        {formatTime(timerSeconds[recipe.steps[currentStepIndex].id] || 0)}
                      </div>
                      <button
                        onClick={() => stopTimer(recipe.steps[currentStepIndex].id)}
                        className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full text-xl font-bold"
                      >
                        タイマー停止
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        startTimer(recipe.steps[currentStepIndex].id, recipe.steps[currentStepIndex].timer!)
                      }
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-xl font-bold"
                    >
                      <Timer className="h-7 w-7 mr-2" />
                      {Math.floor(recipe.steps[currentStepIndex].timer! / 60)}分
                      {recipe.steps[currentStepIndex].timer! % 60 > 0
                        ? `${recipe.steps[currentStepIndex].timer! % 60}秒`
                        : ""}
                      のタイマーをセット
                    </button>
                  )}
                </div>
              )}

              {/* ナビゲーションボタン */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={goToPrevStep}
                  disabled={currentStepIndex === 0}
                  className="px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xl font-bold disabled:opacity-50"
                >
                  前へ
                </button>
                <button
                  onClick={goToNextStep}
                  disabled={currentStepIndex === recipe.steps.length - 1}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full text-xl font-bold disabled:opacity-50"
                >
                  次へ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 完了ボタン - 最後のステップを表示しているときのみ表示 */}
        {currentStepIndex === recipe.steps.length - 1 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 animate-in fade-in slide-in-from-bottom">
            <div className="max-w-md mx-auto">
              <button
                onClick={finishCooking}
                className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center text-2xl font-bold"
              >
                <Check className="h-7 w-7 mr-2" />
                調理完了
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
