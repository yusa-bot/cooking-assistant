"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import RecipePopup from "@/components/recipe-popup"
import { RecipeTypes } from "@/types/recipeTypes"

interface User {
    id: string
    email: string
    userName?: string
  }



  

export default function RecipeBookPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeTypes[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeTypes | null>(null)
  const [username, setUsername] = useState("")
  const [user,setUser] = useState<User>()
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
            console.log(data)
            if (data.user) {
                setIsLoggedIn(true)
                setUsername(data.user.userName || "")
            } else {
                setIsLoggedIn(false)
                setUsername("")
                router.push("/login")
            }
        }
        fetchUser()
    },[user])
        

    useEffect(() => {

        if (!user) return
        const userData = user as User
        setIsLoggedIn(true)
        setUsername(userData.userName || "")
  
        // ログイン済みの場合、レシピ帳データを取得
        const fetchFavorite = async () => {
          try {
            const res = await fetch("/api/recipes", {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${userData.id}`,
              },
            })
            if (!res.ok) throw new Error("レシピ帳取得に失敗")
              const data: RecipeTypes[] = await res.json()
            setFavoriteRecipes(data)
          } catch (err) {
            console.error("レシピ帳の取得エラー:", err)
            setFavoriteRecipes([])
          }
        }
        fetchFavorite()
        
      }, [router]);

  // レシピをクリックしたときの処理
  const handleRecipeClick = (recipe: RecipeTypes) => {
    // レシピの詳細情報を設定
    setSelectedRecipe({
      ...recipe,
      steps: recipe.steps || []
    })
  }

  // 調理を開始する
  const startCooking = (recipeId: string) => {
    // 遷移元を記録
    localStorage.setItem("recipeSource", "recipe-book")
    router.push(`/recipes/${recipeId}/steps`)
  }

  if (!isLoggedIn) {
    return null // ログインしていない場合は何も表示せずリダイレクト
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="w-full max-w-md mx-auto py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>戻る</span>
        </Link>
        <h1 className="text-xl font-semibold">レシピ帳</h1>
        
        {/* ハンバーガーメニュー */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="メニューを開く"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
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
                    localStorage.removeItem("user");
                    setIsLoggedIn(false);
                    setUsername("");
                    router.push("/");
                  }} 
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  ログアウト
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-col items-center justify-start flex-1 w-full max-w-md mx-auto">
        <div className="w-full space-y-4 mt-4">
          {favoriteRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm cursor-pointer"
              onClick={() => handleRecipeClick(recipe)}
            >
              <div className="flex">
                <div className="w-1/3">
                  <img
                    src={recipe.photo_url || "/placeholder.svg"}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-2/3 p-4">
                  <h2 className="text-lg font-medium">{recipe.title}</h2>
                  <p className="text-gray-500 text-sm line-clamp-2 mt-1">{recipe.description}</p>                  
                </div>
              </div>
            </div>
          ))}
        </div>

        {favoriteRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">レシピ帳にはまだ何も追加されていません</p>
            <Link href="/recipes" className="text-green-600 hover:text-green-700 mt-2 inline-block">
              レシピを探す
            </Link>
          </div>
        )}
      </div>

      {/* レシピポップアップ */}
      {selectedRecipe && (
        <RecipePopup
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onStartCooking={() => startCooking(selectedRecipe.id!)}
        />
      )}
    </main>
  )
}
