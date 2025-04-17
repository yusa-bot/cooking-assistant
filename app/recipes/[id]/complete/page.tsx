"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Star, Home, Camera, X } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getSpeechSynthesis } from "@/utils/speech-synthesis"

export default function RecipeCompletePage() {
  const params = useParams()
  const recipeId = Number(params.id)
  const router = useRouter()

  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState<string>("")
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<boolean>(false)

  // レシピ情報（実際のアプリではAPIから取得）
  const recipeName = "野菜たっぷり豚肉炒め"

  // 写真を撮影/アップロード
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 評価を送信
  const submitRating = () => {
    // 実際のアプリではAPIに送信
    console.log({
      recipeId,
      rating,
      comment,
      photoUrl,
    })

    // 送信完了状態に
    setSubmitted(true)
  }

  // ホームに戻る
  const goToHome = () => {
    router.push("/")
  }

  useEffect(() => {
    return () => {
      // 音声読み上げを停止
      const speechSynthesis = getSpeechSynthesis()
      speechSynthesis.stop()
    }
  }, [])

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="w-full max-w-md mx-auto py-4 flex items-center justify-between">
        <Link
          href={`/recipes/${recipeId}/steps`}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>戻る</span>
        </Link>
        <h1 className="text-xl font-semibold">調理完了</h1>
        <div className="w-16"></div> {/* スペーサー */}
      </header>

      <div className="flex flex-col items-center justify-start flex-1 w-full max-w-md mx-auto">
        {!submitted ? (
          <>
            <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md mb-6 p-4">
              <h2 className="text-xl font-medium mb-2">おめでとうございます！</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                「{recipeName}」の調理が完了しました。料理の評価をお願いします。
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">評価</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} className="text-2xl focus:outline-none">
                      <Star
                        className={`h-8 w-8 ${
                          rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  コメント（任意）
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  placeholder="料理の感想や改善点などを書いてください"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  完成した料理の写真（任意）
                </label>

                {photoUrl ? (
                  <div className="relative w-full aspect-[4/3] mb-2">
                    <img
                      src={photoUrl || "/placeholder.svg"}
                      alt="完成した料理"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <button
                      onClick={() => setPhotoUrl(null)}
                      className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <label className="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 py-2 px-4 rounded-md flex items-center">
                      <Camera className="h-5 w-5 mr-2" />
                      写真を追加
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                )}
              </div>

              <button
                onClick={submitRating}
                disabled={rating === 0}
                className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md"
              >
                評価を送信
              </button>
            </div>
          </>
        ) : (
          <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md mb-6 p-4 text-center">
            <h2 className="text-xl font-medium mb-4">ありがとうございます！</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">評価が送信されました。次回の料理もお楽しみに！</p>

            <button
              onClick={goToHome}
              className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center mx-auto"
            >
              <Home className="h-5 w-5 mr-2" />
              ホームに戻る
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
