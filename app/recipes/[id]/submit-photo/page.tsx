"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Camera, X, Save } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

export default function SubmitPhotoPage() {
  const params = useParams()
  const recipeId = Number(params.id)
  const router = useRouter()

  // ログインチェックを追加
  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
    }
  }, [router])

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [note, setNote] = useState<string>("")
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // レシピ情報
  const [recipeName, setRecipeName] = useState<string>("")

  useEffect(() => {
    const fetchRecipe = async () => {
      const user = localStorage.getItem("user")
      if (!user) {
        router.push("/login")
        return
      }
  
      const { token } = JSON.parse(user)
  
      try {
        const res = await fetch(`/api/recipes/${recipeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("レシピ情報の取得に失敗")
        const data = await res.json()
        setRecipeName(data.name || "レシピ名不明")
      } catch (err) {
        console.error("レシピ取得エラー:", err)
        setRecipeName("レシピ名取得失敗")
      }
    }
  
    fetchRecipe()
  }, [recipeId, router])
  

  // カメラを起動する関数
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (err) {
      console.error("カメラへのアクセスに失敗しました:", err)
      alert("カメラへのアクセスに失敗しました。デバイスの設定を確認してください。")
    }
  }

  // カメラを停止する関数
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsCameraActive(false)
    }
  }

  // 写真を撮影する関数
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      // キャンバスのサイズをビデオのサイズに合わせる
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // ビデオフレームをキャンバスに描画
      context?.drawImage(video, 0, 0, canvas.width, canvas.height)

      // キャンバスの内容を画像URLとして取得
      const imageUrl = canvas.toDataURL("image/jpeg")
      setPhotoUrl(imageUrl)

      // カメラを停止
      stopCamera()
    }
  }

  // 写真を削除
  const removePhoto = () => {
    setPhotoUrl(null)
  }

  // 撮り直す
  const retakePhoto = () => {
    setPhotoUrl(null)
    startCamera()
  }

  // 提出確認を表示
  const showSubmitConfirmation = () => {
    setShowConfirmation(true)
  }

  // 提出確認をキャンセル
  const cancelSubmit = () => {
    setShowConfirmation(false)
  }

  // 写真を提出して履歴に保存
  const submitAndSaveToHistory = async () => {
    const user = localStorage.getItem("user")
    if (!user) {
      alert("ログインしてください")
      return
    }
  
    const { token } = JSON.parse(user)
    //写真をアップロードするだけにする
    //他の情報はレシピテーブルに保存する
    try {
      const res = await fetch(`/api/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipeId,
          photoUrl,
          note,
          date: new Date().toISOString(),
        }),
      })
  
      if (!res.ok) throw new Error("送信失敗")
  
      router.push(`/recipes/${recipeId}/submission-complete`)
    } catch (err) {
      console.error("送信エラー:", err)
      alert("送信に失敗しました")
    }
  }
  

  // コンポーネントがマウントされたときにカメラを自動起動
  useEffect(() => {
    // ページ読み込み時にカメラを自動起動
    if (!photoUrl) {
      startCamera()
    }

    // コンポーネントがアンマウントされるときにカメラを停止
    return () => {
      stopCamera()
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
        <h1 className="text-xl font-semibold">料理の写真</h1>
        <div className="w-16"></div> {/* スペーサー */}
      </header>

      <div className="flex flex-col items-center justify-start flex-1 w-full max-w-md mx-auto">
        <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md mb-6 p-4">
          <h2 className="text-xl font-medium mb-2">料理完成おめでとう！</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">完成した「{recipeName}」の写真を撮りましょう</p>

          <div className="mb-6">
            <div className="w-full aspect-[4/3] bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden mb-2 relative">
              {photoUrl ? (
                // 撮影した写真のプレビュー
                <>
                  <img src={photoUrl || "/placeholder.svg"} alt="完成した料理" className="w-full h-full object-cover" />
                  <button
                    onClick={removePhoto}
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-2 rounded-full"
                    aria-label="写真を削除"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              ) : (
                // カメラのプレビュー
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              )}

              {/* 非表示のキャンバス要素 */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* カメラ操作ボタン */}
            {!photoUrl && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={capturePhoto}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center text-lg font-medium"
                  disabled={!isCameraActive}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  撮影する
                </button>
              </div>
            )}

            {/* 撮り直しボタン */}
            {photoUrl && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={retakePhoto}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-100 rounded-full flex items-center justify-center text-lg font-medium"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  撮り直す
                </button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={3}
              placeholder="メモを書く（任意）"
            />
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={showSubmitConfirmation}
              disabled={!photoUrl}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-full flex items-center justify-center text-lg font-medium"
            >
              <Save className="h-5 w-5 mr-2" />
              履歴へ保存
            </button>
          </div>
        </div>
      </div>

      {/* 提出確認モーダル */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">履歴に保存しますか？</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">この写真とメモを料理履歴として保存しますか？</p>

            <div className="flex space-x-3">
              <button
                onClick={cancelSubmit}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                キャンセル
              </button>
              <button
                onClick={submitAndSaveToHistory}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
