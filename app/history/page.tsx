"use client"

import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import RecipePopup from "@/components/recipe-popup"

interface User {
  id: string
  email: string
  userName?: string
}


interface Recipe {
  id: string
  title: string
  imageUrl?: string
  description: string
  ingredients?: { name: string; amount: number; unit: string }[]
  steps?: { instruction: string }[]
  date: string
  difficulty?: string
  cookingTime?: string
}

interface ApiResponse {
  recipes: Recipe[]
}

export default function HistoryPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [historyItems, setHistoryItems] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [username, setUsername] = useState("")
  const [user,setUser] = useState<User>()

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
            headers: {
              Authorization: `Bearer ${userData.id}`,
            },
          })
          if (!res.ok) throw new Error("レシピ帳取得に失敗")
            const data: ApiResponse = await res.json()
          setHistoryItems(data.recipes)
        } catch (err) {
          console.error("レシピ帳の取得エラー:", err)
          setHistoryItems([])
        }
      }
      fetchFavorite()
      
    }, [router]);

  // 履歴をクリックしたときの処理
  const handleHistoryClick = (recipe: Recipe) => {
    // 履歴からレシピの詳細情報を設定
    setSelectedRecipe({
      ...recipe,
      steps: recipe.steps || []
    })
  }

  // 調理を開始する
  const startCooking = (recipeId: string) => {
    // 遷移元を記録
    localStorage.setItem("recipeSource", "history")
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
        <h1 className="text-xl font-semibold">料理履歴</h1>
        <div className="w-16"></div> {/* スペーサー */}
      </header>

      <div className="flex flex-col items-center justify-start flex-1 w-full max-w-md mx-auto">
        <div className="w-full space-y-4 mt-4">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm cursor-pointer"
              onClick={() => handleHistoryClick(item)}
            >
              <div className="p-4 flex items-center">
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-medium">{item.title}</h2>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {historyItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">履歴はまだありません</p>
          </div>
        )}
      </div>

      {/* レシピポップアップ */}
      {selectedRecipe && (
        <RecipePopup
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onStartCooking={() => startCooking(selectedRecipe.id)}
        />
      )}
    </main>
  )
}
