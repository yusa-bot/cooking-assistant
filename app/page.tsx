"use client"

import type React from "react"
import { Camera, LogIn, ChefHat, ChevronRight, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import LoginPromptModal from "@/components/login-prompt-modal"
import RecipePopup from "@/components/recipe-popup"
import { RecipeTypes, IngredientTypes, StepTypes } from "@/types/recipeTypes"

interface User {
  id: string
  email: string
  userName?: string
}

interface ApiResponse {
  recipes: RecipeTypes[]
}

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [cookingHistory, setCookingHistory] = useState<RecipeTypes[]>([])
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeTypes[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginFeature, setLoginFeature] = useState("この機能")
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeTypes | null>(null)
  const [user, setUser] = useState<User>()
  const [showMenu, setShowMenu] = useState(false)

  // ログイン状態と履歴を確認
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/user")
      if (!res.ok) {
        setIsLoggedIn(false)
        setUsername("")
        return
      }
      
      const data = await res.json()      
      if (data.user) {
        setUser(data.user)
        setIsLoggedIn(true)
        setUsername(data.user.userName || "")
      } else {
        setIsLoggedIn(false)
        setUsername("")
      }
    }
    fetchUser()
  }, [])
      
  useEffect(() => {
    if (!user) return
    
    const userData = user as User
    
    // ログイン済みの場合、履歴データを取得
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/recipes", {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userData.id}`,
          },
        })
        if (!res.ok) throw new Error(`Error fetching recipes: ${res.status}`);

        const data = await res.json()
        console.log("履歴データ:", data)
        setCookingHistory(data || [])
      } catch (err) {
        console.error("履歴の取得エラー:", err)
        setCookingHistory([])
      }
    }

    // ログイン済みの場合、レシピ帳データを取得
    const fetchFavorite = async () => {
      try {
        const res = await fetch("/api/recipes/favorite", {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userData.id}`,
          },
        })
        if (!res.ok) throw new Error("レシピ帳取得に失敗")
        const data = await res.json()
        console.log("レシピ帳データ:", data)
        setFavoriteRecipes(data || [])
      } catch (err) {
        console.error("レシピ帳の取得エラー:", err)
        setFavoriteRecipes([])
      }
    }
    
    fetchHistory()
    fetchFavorite()
  }, [user]);
  
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

  // お気にレシピをクリックしたときの処理
  const handleRecipeClick = (recipe: RecipeTypes) => {
    setSelectedRecipe({
      ...recipe,
      steps: recipe.steps || [],
      ingredients: recipe.ingredients || []
    })
  }

  // 履歴をクリックしたときの処理
  const handleHistoryClick = (recipe: RecipeTypes) => {
    setSelectedRecipe({
      ...recipe,
      steps: recipe.steps || [],
      ingredients: recipe.ingredients || []      
    })
  }

  // 調理を開始する
  const startCooking = (recipeId: string, source: string) => {
    // 遷移元を記録
    localStorage.setItem("recipeSource", source)
    router.push(`/recipes/${recipeId}/steps`)
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* ヘッダー */}
      <header className="w-full px-4 py-2 flex items-center justify-between border-b">
        <div className="flex items-center">
          <ChefHat className="h-5 w-5 text-green-600 mr-1" />
          <h1 className="text-lg font-bold">AIレシピアシスタント</h1>
        </div>
        
        {/* ハンバーガーメニュー */}
        {isLoggedIn && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <Link 
                    href="/recipe-book" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    <BookOpen className="inline-block h-4 w-4 mr-2" />
                    レシピ帳
                  </Link>
                  <Link 
                    href="/history" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2">
                      <path d="M12 8v4l3 3"></path>
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    履歴
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setShowMenu(false);
                    }} 
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <LogIn className="inline-block h-4 w-4 mr-2" />
                    ログアウト
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="p-4 pb-0 w-full">
        <p className="text-center text-xs text-gray-500 mb-1">
          材料の写真を撮影してAIがレシピを提案します
        </p>

        {isLoggedIn && (
          <p className="text-center text-sm text-gray-600">
            ようこそ、<span className="font-medium">{username}</span> さん
          </p>
        )}

        <div className="mt-3">
          <button
            onClick={handleScanClick}
            className="h-12 text-md font-medium flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full w-full shadow-sm"
          >
            <Camera className="mr-2 h-5 w-5" />
            材料をスキャンする
          </button>
        </div>
      </div>

      {/* 料理履歴セクション */}
      <div className="px-4 pt-3 pb-16 w-full">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">料理履歴</h2>
          {isLoggedIn && cookingHistory.length > 0 && (
            <Link href="/history" className="text-green-600 flex items-center text-xs">
              もっと見る
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          )}
        </div>

        {isLoggedIn ? (
          cookingHistory.length > 0 ? (
            <div className="overflow-x-auto -mx-4 px-4">
              <div className="flex space-x-2 pb-2" style={{ minWidth: "min-content" }}>
                {cookingHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex-shrink-0 w-36 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                    onClick={() => handleHistoryClick(item)}
                  >
                    <div className="aspect-square w-full overflow-hidden">
                      <img
                        src={item.photo_url || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <h3 className="font-medium text-sm truncate">{item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200 mt-1">
              <p className="text-gray-600 text-sm">まだ料理履歴がありません。最初の料理を記録しましょう！</p>
            </div>
          )
        ) : (
          <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200 mt-1">
            <p className="text-gray-600 mb-1 text-sm">ログインすると料理履歴を保存できます</p>
            <Link href="/login" className="text-green-600 hover:text-green-700 text-xs font-medium">
              ログインして履歴を保存する
            </Link>
          </div>
        )}
      </div>

      {/* レシピポップアップ */}
      {selectedRecipe && (
        <RecipePopup
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onStartCooking={() => startCooking(selectedRecipe.id!, "home")}
        />
      )}

      {/* ログインプロンプトモーダル */}
      <LoginPromptModal isOpen={showLoginModal} onClose={closeLoginModal} featureName={loginFeature} />
    </main>
  )
}

