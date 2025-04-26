"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Volume2, Mic, Timer as TimerIcon, Check, X, MicOff } from "lucide-react"
import TimerUI from "@/components/ui/TimerUI"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getSpeechRecognition } from "@/utils/speech-recognition"
import { getSpeechSynthesis, SpeechSynthesisEvent } from "@/utils/speech-synthesis"
import { useAtom } from 'jotai'
import { recipeAtom } from '@/store/recipeAtom'
import { RecipeTypes } from "@/types/recipeTypes"
import { handleVoiceQuery } from "@/lib/handleVoiceQuery"

const dummyRecipe: RecipeTypes = {
  title: "Dummy Recipe",
  description: "This is a dummy recipe.",
  ingredients: [
    { name: "Dummy Ingredient", amount: "1", unit: "pcs" }
  ],
  steps: [
    { instruction: "まずは野菜を切りましょう", step_number: 1, timer: "" },
    { instruction: "いい感じに来てね", step_number: 2, timer: "02:00" },
    { instruction: "Dummy Step 2", step_number: 3, timer: "10:00" },
  ],
  is_favorite: false,
  created_at: new Date().toISOString(),
  user_id: "dummy_user",
  id: "dummy_id",
  photo_url: "dummy_photo_url"
}
export default function RecipeStepsPage() {
  const params = useParams()
  const router = useRouter()
  //const [recipe] = useAtom(recipeAtom)
  const recipe = dummyRecipe // For testing purposes, using a dummy recipe
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [voiceQuestion, setVoiceQuestion] = useState("")
  const [aiAnswer, setAiAnswer] = useState("")
  const [showAiAnswer, setShowAiAnswer] = useState(false)
  const [isPausedForSpeech, setIsPausedForSpeech] = useState(false)
  const initialLoadRef = useRef(true)

  if (!recipe) return <p>レシピがありません</p>

  const step = recipe.steps[currentStepIndex]

  const goToNextStep = () => setCurrentStepIndex(i => Math.min(i + 1, recipe.steps.length - 1))
  const goToPrevStep = () => setCurrentStepIndex(i => Math.max(i - 1, 0))
  
  // 音声合成と音声認識の調整 - システム音声出力中は音声認識を一時停止する
  useEffect(() => {
    const synth = getSpeechSynthesis()
    const recognition = getSpeechRecognition()
    
    if (!recognition.isSupported()) return
    
    // 音声合成開始時のハンドラー
    const handleSpeechStart = () => {
      recognition.pauseListening()
      setIsPausedForSpeech(true)
    }
    
    // 音声合成終了時のハンドラー
    const handleSpeechEnd = () => {
      // 少し遅延を入れて、音声出力が完全に終わってから認識再開
      setTimeout(() => {
        recognition.resumeListening()
        setIsPausedForSpeech(false)
      }, 300)
    }
    
    // イベントリスナー登録
    synth.addEventListener('start', handleSpeechStart)
    synth.addEventListener('end', handleSpeechEnd)
    
    // クリーンアップ
    return () => {
      synth.removeEventListener('start', handleSpeechStart)
      synth.removeEventListener('end', handleSpeechEnd)
    }
  }, [])
  
  // 初期読み上げとステップ変更時の読み上げを管理
  useEffect(() => {
    const synth = getSpeechSynthesis()
    
    if (step && step.instruction) {
      // 最初のステップでは優先度低く、ステップ変更時は優先度高く
      const isPriority = !initialLoadRef.current
      
      // instructionを読み上げる（初期表示または手動でステップ変更時）
      synth.speak(step.instruction, "ja-JP", isPriority)
      
      // 初期ロードフラグを更新
      if (initialLoadRef.current) {
        initialLoadRef.current = false
      }
    }
  }, [currentStepIndex])

  // AIの返答があった場合は優先して読み上げ
  useEffect(() => {
    if (aiAnswer) {
      const synth = getSpeechSynthesis()
      synth.speak(aiAnswer, "ja-JP", true)
    }
  }, [aiAnswer])

  // 音声認識の初期化・クリーンアップ専用 - 継続的な音声認識を実装
  useEffect(() => {
    const recognition = getSpeechRecognition()
    if (!recognition.isSupported()) return
    let isUnmounted = false
    
    const handleResult = (text: string) => {
      setVoiceQuestion(text)
      handleVoiceQuery({
        text,
        step,
        recipeInformation: recipe,
        goToNextStep,
        goToPrevStep,
        setAiAnswer,
        setShowAiAnswer,
      })
      // 継続モードなので再起動は不要
    }
    
    const handleError = (error: any) => {
      console.error("音声認識エラー:", error)
      // エラー発生時のみ再起動（既に起動している場合は startListening 内部でスキップされる）
      if (!isUnmounted && !recognition.getIsListening()) {
        setTimeout(() => recognition.startListening(handleResult, handleError), 1000)
      }
    }
    
    // 音声認識が終了した場合の処理
    const handleEnd = () => {
      // 終了した場合のみ再起動（すでに起動中でない場合のみ）
      if (!isUnmounted && !recognition.getIsListening()) {
        setTimeout(() => recognition.startListening(handleResult, handleError), 500)
      }
    }
    
    // 初回起動
    recognition.startListening(handleResult, handleError)
    
    // onendイベントハンドラの設定（直接アクセスは本来避けるべきだが、現状の実装に合わせる）
    if ((recognition as any).recognition) {
      (recognition as any).recognition.onend = handleEnd
    }
    
    setIsListening(true)
    
    return () => {
      isUnmounted = true
      recognition.stopListening()
      setIsListening(false)
    }
  }, [step, recipe])

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="flex items-center justify-center sticky top-0 bg-gray-50 p-4 z-10">        
        <h1 className="text-3xl font-semibold text-green-700">{recipe.title}</h1>        
      </header>
      <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full">
        <div className="mb-4 flex items-center">
          
          {recipe.steps.map((_, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <div className="w-6 h-px bg-gray-300 mx-2" />
              )}
              <button
                onClick={() => setCurrentStepIndex(idx)}
                className={`
                  w-10 h-10 flex items-center justify-center rounded-full font-semibold
                  ${idx === currentStepIndex
                    ? "bg-green-600 text-white"
                    : "bg-gray-300 text-gray-700"}
                `}
              >
                {idx + 1}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-300 dark:border-gray-800 w-full mb-24">          
          <section
            aria-labelledby="instruction-section"
            className="mb-6 w-full"
          >
            <div
              id="instruction-section"
              className="
                text-2xl font-bold
                h-[15rem]            /* 固定高さ */
                overflow-y-auto    /* 縦スクロール有効 */
                overflow-x-hidden
                whitespace-normal break-words
                p-4                
                border border-gray-200 dark:border-gray-600
                rounded-lg
                shadow-sm
              "
            >
              {step.instruction}
            </div>
          </section>

          {/* タイマーUI */}
          <section aria-labelledby="timer-section" className="mb-6 w-full h-[10rem]">
            {step.timer && <TimerUI initialTime={step.timer} />}
          </section>
          

          <div className="mt-8 flex items-center justify-between gap-4">
            <button onClick={goToPrevStep} disabled={currentStepIndex===0} className="px-6 py-3 bg-gray-200 rounded-full">
              前へ
            </button>
            <button
              type="button"
              aria-label={isPausedForSpeech ? "マイク停止中" : (isListening ? "録音中（クリックで停止）" : "マイク待機中（クリックで録音開始）")}
              className={`
                px-6 py-3 rounded-full flex items-center justify-center transition
                ${isPausedForSpeech ? "bg-gray-300" : isListening ? "bg-red-600 animate-pulse" : "bg-gray-200"}
                ${isPausedForSpeech ? "cursor-not-allowed" : "cursor-pointer"}
              `}
              disabled={isPausedForSpeech}
              onClick={() => {
                if (isPausedForSpeech) return;
                const recognition = getSpeechRecognition();
                if (isListening) {
                  recognition.stopListening();
                  setIsListening(false);
                } else if (!recognition.getIsListening()) {
                  recognition.startListening(
                    (text: string) => {
                      setVoiceQuestion(text);
                      handleVoiceQuery({
                        text,
                        step,
                        recipeInformation: recipe,
                        goToNextStep,
                        goToPrevStep,
                        setAiAnswer,
                        setShowAiAnswer,
                      });
                    },
                    (error: any) => {
                      console.error("音声認識エラー:", error);
                    }
                  );
                  setIsListening(true);
                }
              }}
            >
              {isPausedForSpeech ? (
                <MicOff className="h-6 w-6 text-gray-400" />
              ) : isListening ? (
                <Mic className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-green-600" />
              )}
            </button>
            <button onClick={goToNextStep} disabled={currentStepIndex===recipe.steps.length-1} className="px-6 py-3 bg-green-600 text-white rounded-full">
              次へ
            </button>
          </div>
        </div>

        {currentStepIndex === recipe.steps.length - 1 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow">
            <button onClick={() => router.push("/cooking/submit-photo")} className="w-full py-4 bg-green-600 text-white rounded-full">
              <Check className="inline mr-2" />調理完了
            </button>
          </div>
        )}
      </div>
      <div>
        {aiAnswer && showAiAnswer && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mt-4">
            <p className="text-gray-800">{aiAnswer}</p>
          </div>
        )}
      </div>
      
      
    </main>
  )
}
