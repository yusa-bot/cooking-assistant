"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Camera, ImageIcon, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import LoginPromptModal from "@/components/login-prompt-modal"
import { useAtom } from 'jotai'
import { ingredientListAtom } from '@/lib/atoms' // <IngredientTypes[]>
import Loading from "@/components/Loading";

export default function ScanPage() {  
  const [isCameraActive, setIsCameraActive] = useState(false)
  // <HTMLVideoElement> で「参照したいのは <video> タグですよ」
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentIngredient,setCurrentIngredient] = useAtom(ingredientListAtom) // <IngredientTypes[]>
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ログインチェック
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/user")
      if (!res.ok) {
        setIsLoggedIn(false)
        return
      }
      
      const data = await res.json()
      if (data.user) {
        setIsLoggedIn(true)
        startCamera()
      } else {
        setIsLoggedIn(false)
        setShowLoginModal(true)
      }
    }
    fetchUser()
  },[])

  // マウント時に自動でカメラ起動
  useEffect(() => {
    if (!photoUrl) startCamera()
  // クリーンアップ
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

  // キャプチャ
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

  const retakePhoto = () => {
    setPhotoUrl(null)
    startCamera()
  }

  // ファイル選択ダイアログを開く関数　見える
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // 選択されたファイルを処理する関数　見えない
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => { //非同期
        const result = e.target?.result as string        
        setPhotoUrl(result)   
        stopCamera()
      }
      reader.readAsDataURL(file) //Base64に変換
    }
  }

  //材料を推定 jotaiへ
  const fetchIngredients = async () => {
    setIsLoading(true)
    try {
      console.log("キャプチャした画像:", photoUrl)
      const res = await fetch("/api/ai/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ imageUrl: photoUrl }) // 画像URLをオブジェクトに格納して送信
      })
      if (!res.ok) throw new Error("食材取得に失敗")

      const data = await res.json()
      console.log("取得した食材:", data)
      setCurrentIngredient(data) // <IngredientTypes[]>
      console.log("jotaiに保存した食材:",currentIngredient)
      router.push("/ingredients")
    } catch (err) {
      console.error("食材の取得エラー:", err)
      setCurrentIngredient([])
      setIsLoading(false)
    }
  }

  // モーダルを閉じる
  const closeLoginModal = () => {
    setShowLoginModal(false)
    router.push("/")
  }

  if (!isLoggedIn && !showLoginModal) {
    return null // ログインモーダルが表示される前は何も表示しない
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loading />
        <p className="mt-4 text-lg font-bold text-green-700 dark:text-green-700">材料を推定中...</p>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="w-full max-w-md mx-auto py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>戻る</span>
        </Link>
        <h1 className="text-xl font-semibold">材料をスキャン</h1>
        <div className="w-16"></div> {/* スペーサー */}
      </header>

      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto">
        <div className="w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative mb-4">
          {photoUrl ? (
            // 撮影した写真のプレビュー
            <img src={photoUrl} alt="撮影した材料" className="w-full h-full object-cover" />
          ) : (
            // カメラのプレビュー
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )}

          {/* 非表示のキャンバス要素 */}
          <canvas ref={canvasRef} className="hidden" />

          {/* 非表示のファイル入力 */}
          <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>

        <div className="w-full flex flex-col space-y-4">
          {!photoUrl ? (
            <>
              <button
                onClick={capturePhoto}
                className="h-16 text-lg font-medium flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full w-full"
                disabled={!isCameraActive}
              >
                <Camera className="mr-3 h-6 w-6" />
                写真を撮影
              </button>

              <button
                onClick={openFileSelector}
                className="h-16 text-lg font-medium flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 w-full dark:text-white"
              >
                <ImageIcon className="mr-3 h-6 w-6" />
                画像をアップロード
              </button>
            </>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="h-16 text-lg font-medium flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 w-full dark:text-white"
              >
                <RefreshCw className="mr-3 h-6 w-6" />
                撮り直す
              </button>

              <button
                onClick={fetchIngredients}
                className="h-16 text-lg font-medium flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full w-full"
              >
                材料を確認
              </button>
            </>
          )}
        </div>
      </div>

      {/* ログインプロンプトモーダル */}
      <LoginPromptModal isOpen={showLoginModal} onClose={closeLoginModal} featureName="材料スキャン機能" />
    </main>
  )
}
