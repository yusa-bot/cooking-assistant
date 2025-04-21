"use client"

import type React from "react"
import { Camera, LogIn, ChefHat, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import LoginPromptModal from "@/components/login-prompt-modal"

// interface CookingHistory {
//   id: number
//   date: string
//   recipeName: string
//   imageUrl: string
// }
// hello world

// 料理履歴の型定義
interface CookingHistory {
  id: string         // ← uuid
  userId: string     // ← user_id
  recipeId: string   // ← recipe_id
  photoUrl: string   // ← photo_url
  isFavorite: boolean // ← is_favorite
  cookedAt: string    // ← timestamptz（ISO文字列で受け取る）
  recipeName: string // ← recipe_name
}

export default function Dashboard() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [cookingHistory, setCookingHistory] = useState<CookingHistory[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginFeature, setLoginFeature] = useState("この機能")

  // ログイン状態と履歴を確認
  useEffect(() => {
    // ローカルストレージからユーザー情報を取得
    const user = localStorage.getItem("user")
    if (user) {
      const userData = JSON.parse(user)
      setIsLoggedIn(true)
      setUsername(userData.username || "")

      // ログイン済みの場合、履歴データを取得
      const fetchHistory = async () => {
        try {
          const res = await fetch("/api/recipes", {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          })
          if (!res.ok) throw new Error("履歴取得に失敗")
          const data = await res.json()
          setCookingHistory(data)
        } catch (err) {
          console.error("履歴の取得エラー:", err)
          setCookingHistory([])
        }
      }

      fetchHistory()
    }
  }, [])

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setUsername("")
  }

  // 未ログイン時にログインモーダルを表示
  const handleScanClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isLoggedIn) {
      setLoginFeature("材料スキャン機能")
      setShowLoginModal(true)
    } else {
      router.push("/scan")
    }
  }

  // モーダルを閉じる
  const closeLoginModal = () => {
    setShowLoginModal(false)
  }

  //上記の関数をreturnに反映し、再読み込みして描画する
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gray-50">
      {/* ヘッダー */}
      <header className="w-full max-w-md mx-auto py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ChefHat className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold">AIレシピアシスタント</h1>
        </div>
      </header>


      <div className="text-green-600 text-center text-sm text-gray-500 mt-4">
          <p>材料の写真を撮影してAIがレシピを提案します</p>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto space-y-8 py-4">
        {isLoggedIn && (
          <div className="w-full text-center mb-2">
            <p className="text-gray-600">
              ようこそ、<span className="font-medium">{username}</span> さん
            </p>
          </div>
        )}

        <div className="w-full shadow-lg border rounded-lg overflow-hidden bg-white">
          <div className="p-6">
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleScanClick}
                className="h-16 text-lg justify-start font-medium flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full w-full"
              >
                <Camera className="mr-3 h-6 w-6" />
                材料をスキャンする
              </button>

              {isLoggedIn ? (
                <button
                  className="h-16 text-lg justify-start font-medium flex items-center px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 w-full"
                  onClick={handleLogout}
                >
                  <LogIn className="mr-3 h-6 w-6" />
                  ログアウト
                </button>
              ) : (
                <Link
                  href="/login"
                  className="h-16 text-lg justify-start font-medium flex items-center px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 w-full"
                >
                  <LogIn className="mr-3 h-6 w-6" />
                  ログイン / 新規登録
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 料理履歴セクション */}
        <div className="w-full mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">料理履歴</h2>
            {isLoggedIn && cookingHistory.length > 0 && (
              <Link href="/history" className="text-green-600 flex items-center text-sm">
                もっと見る
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            )}
          </div>

          {isLoggedIn ? (
            cookingHistory.length > 0 ? (
              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-4" style={{ minWidth: "min-content" }}>
                  {cookingHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex-shrink-0 w-40 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                    >
                      <div className="aspect-square w-full overflow-hidden">
                        <img
                          src={item.photoUrl || "/placeholder.svg"}
                          alt={item.recipeName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm truncate">{item.recipeName}</h3>
                        <p className="text-gray-500 text-xs mt-1">{item.cookedAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-600">まだ料理履歴がありません。最初の料理を記録しましょう！</p>
              </div>
            )
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-gray-600 mb-2">ログインすると料理履歴を保存できます</p>
              <Link href="/login" className="text-green-600 hover:text-green-700 text-sm font-medium">
                ログインして履歴を保存する
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ログインプロンプトモーダル */}
      <LoginPromptModal isOpen={showLoginModal} onClose={closeLoginModal} featureName={loginFeature} />
    </main>
  )
}
