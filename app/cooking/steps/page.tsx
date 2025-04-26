"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Volume2, Mic, Timer as TimerIcon, Check, X, MicOff } from "lucide-react"
import TimerUI from "@/components/ui/TimerUI"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getSpeechRecognition } from "@/utils/speech-recognition"
import { getAnswerForQuestion } from "@/utils/cooking-ai"
import { getSpeechSynthesis } from "@/utils/speech-synthesis"
import { useAtom } from 'jotai'
import { recipeAtom } from '@/store/recipeAtom'
import { RecipeTypes } from "@/types/recipeTypes"

const dummyRecipe: RecipeTypes = {
  title: "Dummy Recipe",
  description: "This is a dummy recipe.",
  ingredients: [
    { name: "Dummy Ingredient", amount: "1", unit: "pcs" }
  ],
  steps: [
    { instruction: "まずは野菜を切りましょう", step_number: 1, timer: "" },
    { instruction: "Dummy Step 2stertrtretewrtergtretereroiterjtioeroierbgerhjriwabfierhgierhrjebvdfjrretrtewtrwegregfrfdsfgrebrejddvdfgerkweivn", step_number: 2, timer: "02:00" },
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
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceQuestion, setVoiceQuestion] = useState("")
  const [aiAnswer, setAiAnswer] = useState("")
  const [showAiAnswer, setShowAiAnswer] = useState(false)

  if (!recipe) return <p>レシピがありません</p>

  const step = recipe.steps[currentStepIndex]

  const speakInstruction = (instruction: string) => {
    const synth = getSpeechSynthesis()
    if (synth.getIsSpeaking()) {
      synth.stop(); setIsSpeaking(false)
    } else {
      synth.speak(instruction); setIsSpeaking(true)
      const iv = setInterval(() => {
        if (!synth.getIsSpeaking()) {
          setIsSpeaking(false); clearInterval(iv)
        }
      }, 100)
    }
  }

  const goToNextStep = () => setCurrentStepIndex(i => Math.min(i + 1, recipe.steps.length - 1))
  const goToPrevStep = () => setCurrentStepIndex(i => Math.max(i - 1, 0))

  useEffect(() => {
    if (step && step.instruction) {
      const synth = getSpeechSynthesis()
      if (synth.getIsSpeaking()) {
        synth.stop()
      }
      speakInstruction(step.instruction)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex])

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="flex items-center justify-center sticky top-0 bg-gray-50 p-4 z-10">        
        <h1 className="text-3xl font-semibold text-green-700">{recipe.title}</h1>        
      </header>
      <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full">
        <div className="mb-4 flex items-center">
          {recipe.steps.map((_, idx) => (
        <>
          {idx > 0 && (
            <div className="w-6 h-px bg-gray-300 mx-2" />
          )}
          <button
            key={idx}
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
        </>
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
          

          <div className="mt-8 flex justify-between">
            <button onClick={goToPrevStep} disabled={currentStepIndex===0} className="px-6 py-3 bg-gray-200 rounded-full">
              前へ
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
    </main>
  )
}
