"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Camera, ImageIcon, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import LoginPromptModal from "@/components/login-prompt-modal"
import { useAtom } from 'jotai'
import { ingredientListAtom } from '@/lib/atoms' // <IngredientTypes[]>

export default function ScanPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  // <HTMLVideoElement> で「参照したいのは <video> タグですよ」
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [ingredient, setIngredient] = useAtom(ingredientListAtom) // <IngredientTypes[]>


  // ログインチェック
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/user")
      if (!res.ok) {
        setIsLoggedIn(false)
        return
      }
      
      const data = await res.json()
      console.log(data)
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

      // videoをcanvas(静止画)に描画
      context?.drawImage(video, 0, 0, canvas.width, canvas.height)

      // キャンバスの内容を画像URLとして取得
      const imageUrl = canvas.toDataURL("image/jpeg") //Base64形式に変換
      setCapturedImage(imageUrl)

      // カメラを停止
      stopCamera()
    }
  }

  // 写真を再撮影する関数
  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  // ファイル選択ダイアログを開く関数
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // 選択されたファイルを処理する関数
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => { //非同期
        setCapturedImage(e.target?.result as string) //
        stopCamera()
      }
      reader.readAsDataURL(file) //Base64に変換
    }
  }

  //材料を推定 jotaiへ
  const fetchIngredients = async () => {
    try {
      const res = await fetch("/api/ai/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(capturedImage)
      })
      if (!res.ok) throw new Error("食材取得に失敗")

      const data = await res.json()
      setIngredient(data) // <IngredientTypes[]>
    } catch (err) {
      console.error("食材の取得エラー:", err)
      setIngredient([])
    }
  }

  // モーダルを閉じる
  const closeLoginModal = () => {
    setShowLoginModal(false)
    router.push("/")
  }

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  if (!isLoggedIn && !showLoginModal) {
    return null // ログインモーダルが表示される前は何も表示しない
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
          {capturedImage ? (
            // 撮影した写真のプレビュー
            <img src={capturedImage || "/placeholder.svg"} alt="撮影した材料" className="w-full h-full object-cover" />
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
          {!capturedImage ? (
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
