"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Volume2, Mic, Timer, Check, X, MicOff } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getSpeechRecognition } from "@/utils/speech-recognition"
import { getAnswerForQuestion } from "@/utils/cooking-ai"
import { getSpeechSynthesis } from "@/utils/speech-synthesis"
import { useAtom } from 'jotai'
import { recipeAtom } from '@/store/recipeAtom'
import { RecipeTypes } from "@/types/recipeTypes"


const RecipeDummy:RecipeTypes = {
  title: "Dummy Recipe",
  ingredients: [
    {name:"米"    , amount: "2", unit: "合"},
    {name:"肉"  , amount: "200", unit: "g"},
  ],
  steps: [
    {instruction: "米を研ぐ", step_number: 1, timer: ""},
    {instruction: "水を入れる", step_number: 2, timer: "05:00"},
    {instruction: "炊飯器で炊く", step_number: 3, timer: "10:00"}
  ],
  is_favorite: false,
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
  const [recipeSource, setRecipeSource] = useState<string>("recipes")
  const [customTimerMinutes, setCustomTimerMinutes] = useState(0)
  const [customTimerSeconds, setCustomTimerSeconds] = useState(0)
  const [recipe, setRecipe] = useAtom(recipeAtom) //jotaiから取得
  // レシピデータ（実際のアプリではAPIから取得）
  if (!recipe) {
    return <p>レシピがありません</p>
  }

  // ログイン
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/user")
      if (!res.ok) {
        router.push("/login")
        return
      }
    }
    fetchUser()

    // 遷移元を取得
    const source = localStorage.getItem("recipeSource")
    if (source) {
      setRecipeSource(source)
    }
  },[router])
  
  // 戻るボタンのリンク先を決定
  const getBackLink = () => {
    switch (recipeSource) {
      case "home":
        return "/"
      case "recipe-book":
        return "/recipe-book"
      case "history":
        return "/history"
      default:
        return "/recipes"
    }
  }

  // 次のステップに進む
  const goToNextStep = () => {
    if (currentStepIndex < recipe.steps.length - 1) {
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
    if (index >= 0 && index < recipe.steps.length) {
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

  // カスタムタイマーの分を増やす
  const increaseMinutes = () => {
    setCustomTimerMinutes((prev) => (prev < 60 ? prev + 1 : prev))
  }

  // カスタムタイマーの分を減らす
  const decreaseMinutes = () => {
    setCustomTimerMinutes((prev) => (prev > 0 ? prev - 1 : prev))
  }

  // カスタムタイマーの秒を増やす
  const increaseSeconds = () => {
    setCustomTimerSeconds((prev) => {
      if (prev >= 55) {
        increaseMinutes()
        return 0
      }
      return prev + 5
    })
  }

  // カスタムタイマーの秒を減らす
  const decreaseSeconds = () => {
    setCustomTimerSeconds((prev) => {
      if (prev <= 0 && customTimerMinutes > 0) {
        decreaseMinutes()
        return 55
      }
      return prev > 0 ? prev - 5 : prev
    })
  }

  // カスタムタイマーを開始
  const startCustomTimer = () => {
    const totalSeconds = customTimerMinutes * 60 + customTimerSeconds
    if (totalSeconds > 0) {
      const currentStepId = recipe.steps[currentStepIndex].id
      setTimerSeconds((prev) => ({ ...prev, [currentStepId]: totalSeconds }))
      setActiveTimers((prev) => ({ ...prev, [currentStepId]: true }))

      timerIntervalsRef.current[currentStepId] = setInterval(() => {
        setTimerSeconds((prev) => {
          const newSeconds = prev[currentStepId] - 1
          if (newSeconds <= 0) {
            stopTimer(currentStepId)
            // タイマー終了時に通知
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("タイマー終了", {
                body: `ステップ ${currentStepId} のタイマーが終了しました。`,
                icon: "/favicon.ico",
              })
            }
            return { ...prev, [currentStepId]: 0 }
          }
          return { ...prev, [currentStepId]: newSeconds }
        })
      }, 1000)
    }
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

  // 現在のステップが変わったときにカスタムタイマーの値を更新
  useEffect(() => {
    const currentStep = recipe.steps[currentStepIndex]
    if (currentStep.timer) {
      setCustomTimerMinutes(Math.floor(currentStep.timer / 60))
      setCustomTimerSeconds(currentStep.timer % 60)
    } else {
      setCustomTimerMinutes(0)
      setCustomTimerSeconds(0)
    }
  }, [currentStepIndex, recipe.steps])

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="w-full max-w-md mx-auto py-4 flex items-center justify-between sticky top-0 bg-gray-50 z-10">
        <Link
          href={getBackLink()}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>戻る</span>
        </Link>
        <h1 className="text-xl font-semibold truncate max-w-[200px]">{recipe.name}</h1>
        <div className="w-16"></div> {/* スペーサー */}
      </header>

      <div className="flex flex-col items-center justify-start flex-1 w-full max-w-md mx-auto">
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
                  <>
                    {recipe.steps[currentStepIndex].timer && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold">タイマー設定</h3>
                          <button
                            onClick={() =>
                              startTimer(recipe.steps[currentStepIndex].id, recipe.steps[currentStepIndex].timer!)
                            }
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold"
                          >
                            推奨: {Math.floor(recipe.steps[currentStepIndex].timer! / 60)}分
                            {recipe.steps[currentStepIndex].timer! % 60 > 0
                              ? `${recipe.steps[currentStepIndex].timer! % 60}秒`
                              : ""}
                          </button>
                        </div>

                        <div className="flex justify-center space-x-8">
                          {/* 分の設定 */}
                          <div className="flex flex-col items-center">
                            <button
                              onClick={increaseMinutes}
                              className="w-6 h-6 flex items-center justify-center hover:opacity-80"
                            >
                              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-black dark:border-b-white" />
                            </button>
                            <div className="my-2 text-2xl font-bold">{customTimerMinutes}</div>
                            <button
                              onClick={decreaseMinutes}
                              className="w-6 h-6 flex items-center justify-center hover:opacity-80"
                              disabled={customTimerMinutes <= 0}
                            >
                              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-black dark:border-t-white" />
                            </button>
                            <div className="mt-1 text-sm text-gray-500">分</div>
                          </div>

                          {/* 秒の設定 */}
                          <div className="flex flex-col items-center">
                            <button
                              onClick={increaseSeconds}
                              className="w-6 h-6 flex items-center justify-center hover:opacity-80"
                            >
                              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-black dark:border-b-white" />
                            </button>
                            <div className="my-2 text-2xl font-bold">{customTimerSeconds}</div>
                            <button
                              onClick={decreaseSeconds}
                              className="w-6 h-6 flex items-center justify-center hover:opacity-80"
                              disabled={customTimerSeconds <= 0 && customTimerMinutes <= 0}
                            >
                              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-black dark:border-t-white" />
                            </button>
                            <div className="mt-1 text-sm text-gray-500">秒</div>
                          </div>
                        </div>

                        <button
                          onClick={startCustomTimer}
                          disabled={customTimerMinutes === 0 && customTimerSeconds === 0}
                          className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-full flex items-center justify-center text-lg font-bold"
                        >
                          <Timer className="h-5 w-5 mr-2" />
                          タイマーをセット
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ナビゲーションボタン */}
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={goToPrevStep}
                  disabled={currentStepIndex === 0}
                  className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-lg font-bold disabled:opacity-50"
                >
                  前へ
                </button>

                <button
                  onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                  className={`flex items-center justify-center px-6 py-4 rounded-full text-lg font-bold ${
                    isListening ? "bg-red-500 text-white" : "bg-white text-gray-800 border-2 border-gray-300"
                  }`}
                  aria-label={isListening ? "音声認識を停止" : "音声で質問"}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-6 w-6 mr-2" />
                      <span>停止</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-6 w-6 mr-2" />
                      <span>質問</span>
                    </>
                  )}
                </button>

                <button
                  onClick={goToNextStep}
                  disabled={currentStepIndex === recipe.steps.length - 1}
                  className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full text-lg font-bold disabled:opacity-50"
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
