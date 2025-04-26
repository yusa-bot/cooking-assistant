"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Camera, X, Save } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAtom } from 'jotai'
import { currentRecipeAtom } from '@/lib/atoms'

interface User {
  id: string
  email: string
  userName?: string
}

export default function SubmitPhotoPage() {
  const params = useParams()
  const recipeId = Number(params.id)
  const router = useRouter()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [note, setNote] = useState<string>("")
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [, setToken] = useState<string | null>(null)
  const [,setUser] = useState<User>()
  const [currentRecipe, setCurrentRecipe] = useAtom(currentRecipeAtom)

  // ログイン
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/user")
      if (!res.ok) {
        router.push("/login")
        return
      }

      const data = await res.json()
      console.log(data)
      setToken(data.token)
      setUser(data.user)
    }
    fetchUser()
  },[router])

  useEffect(() => {
    if (!photoUrl) {
      startCamera()
    }
    return () => stopCamera()
  }, [])

  // カメラ起動／停止
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsCameraActive(true)
      }
    } catch (err) {
      console.error(err)
      alert('カメラへのアクセスに失敗しました')
    }
  }
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
      setIsCameraActive(false)
    }
  }

    // 撮影
    const capturePhoto = () => {
      if (!videoRef.current || !canvasRef.current) return
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/png')
      setPhotoUrl(dataUrl)
      stopCamera()
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

  // dataURL → Blob
  function dataURLtoBlob(dataUrl: string): Blob {
    const [header, base64] = dataUrl.split(',')
    const mime = header.match(/:(.*?);/)?.[1] || ''
    const binary = atob(base64)
    const array = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i)
    }
    return new Blob([array], { type: mime })
  }

  // アップロード
  async function handleUpload() {
    if (!photoUrl) return
    const blob = dataURLtoBlob(photoUrl)
    const formData = new FormData()
    formData.append('file', blob, 'capture.png')

    try {  //imageをDBへ
      const res = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData,
      })
      const data = await res.json()
      console.log('Uploaded image URL:', data)
      if (currentRecipe) {
        setCurrentRecipe({
          ...currentRecipe,
          photo_url: data.imageUrl,


 
        })
      }
      console.log('Current recipe:', currentRecipe)
    } catch (err) {
      console.error(err)
      alert('写真の保存に失敗しました')
    }

    

    router.push(`/cooking/submission-complete`)
  }  
  

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
          <p className="text-gray-600 dark:text-gray-300 mb-4">完成した「{currentRecipe?.title}」の写真を撮りましょう</p>

          <div className="mb-6">
            <div className="w-full aspect-[4/3] bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden mb-2 relative">
              {photoUrl ? (
                // 撮影した写真のプレビュー
                <>
                  <img src={photoUrl || "/placeholder.svg"} alt="完成した料理" className="w-full h-full object-cover" />
                </>
              ) : (
                // カメラのプレビュー
                <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
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
                onClick={handleUpload}
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
