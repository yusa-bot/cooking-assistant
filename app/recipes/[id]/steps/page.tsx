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
  const [showCompletionButton, setShowCompletionButton] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const lastStepRef = useRef<HTMLDivElement>(null)

  // レシピデータ（実際のアプリではAPIから取得）
  const [recipe] = useState<Recipe>({
    id: recipeId,
    name: "野菜たっぷり豚肉炒め",
    steps: [
      {
        id: 1,
        instruction:
          "材料を準備します。キャベツは一口大に切り、にんじんは細切りに、玉ねぎは薄切りにします。豚肉は一口大に切ります。",
        imageUrl: "/step-preparation.jpg",
      },
      {
        id: 2,
        instruction: "フライパンに油を熱し、豚肉を中火で炒めます。肉の色が変わったら一旦取り出します。",
        imageUrl: "/step-cook-meat.jpg",
      },
      {
        id: 3,
        instruction: "同じフライパンに玉ねぎを入れて炒め、透き通ってきたらにんじんを加えます。",
        imageUrl: "/step-cook-onion-carrot.jpg",
      },
      {
        id: 4,
        instruction: "野菜がしんなりしてきたらキャベツを加え、全体が軽くしんなりするまで炒めます。",
        imageUrl: "/step-cook-cabbage.jpg",
        timer: 180, // 3分
      },
      {
        id: 5,
        instruction: "豚肉を戻し入れ、塩、こしょう、醤油で味付けします。全体を混ぜ合わせて完成です。",
        imageUrl: "/step-final.jpg",
      },
    ],
  })

  // スクロール位置を監視して完了ボタンの表示を制御
  useEffect(() => {
    const handleScroll = () => {
      if (!lastStepRef.current || !contentRef.current) return

      const lastStepRect = lastStepRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // 最後のステップが画面内に表示されたら完了ボタンを表示
      if (lastStepRect.bottom <= windowHeight + 100) {
        setShowCompletionButton(true)
      } else {
        setShowCompletionButton(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    // 初期表示時にもチェック
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

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

      <div className="flex flex-col items-center justify-start flex-1 w-full max-w-md mx-auto" ref={contentRef}>
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

        {/* 調理手順 - 縦スクロール */}
        <div className="w-full space-y-8 mb-24">
          {recipe.steps.map((step, index) => (
            <div
              key={step.id}
              className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md"
              ref={index === recipe.steps.length - 1 ? lastStepRef : undefined}
            >
              {step.imageUrl && (
                <div className="aspect-[16/9] w-full overflow-hidden">
                  <img
                    src={step.imageUrl || "/placeholder.svg"}
                    alt={`ステップ ${step.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-medium">
                    ステップ {step.id}/{recipe.steps.length}
                  </span>
                  <button
                    onClick={() => speakInstruction(step.instruction)}
                    className={`p-3 rounded-full ${
                      isSpeaking ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    aria-label={isSpeaking ? "音声読み上げを停止" : "音声読み上げ"}
                  >
                    <Volume2 className="h-6 w-6" />
                  </button>
                </div>

                <p className="text-gray-800 text-lg mb-4">{step.instruction}</p>

                {/* タイマー */}
                {step.timer && (
                  <div className="mt-2">
                    {activeTimers[step.id] ? (
                      <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">{formatTime(timerSeconds[step.id] || 0)}</div>
                        <button
                          onClick={() => stopTimer(step.id)}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-lg font-medium"
                        >
                          タイマー停止
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startTimer(step.id, step.timer)}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center text-lg font-medium"
                      >
                        <Timer className="h-6 w-6 mr-2" />
                        {Math.floor(step.timer / 60)}分{step.timer % 60 > 0 ? `${step.timer % 60}秒` : ""}
                        のタイマーをセット
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 完了ボタン - 最後までスクロールしたときのみ表示 */}
        {showCompletionButton && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 animate-in fade-in slide-in-from-bottom">
            <div className="max-w-md mx-auto">
              <button
                onClick={finishCooking}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center text-xl font-medium"
              >
                <Check className="h-6 w-6 mr-2" />
                調理完了
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
