"use client"

import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import RecipePopup from "@/components/recipe-popup"
import { RecipeTypes } from "@/types/recipeTypes"

interface User {
  id: string
  email: string
  userName?: string
}



export default function HistoryPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [historyItems, setHistoryItems] = useState<RecipeTypes[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeTypes | null>(null)
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
            method: 'GET',
            headers: {
              Authorization: `Bearer ${userData.id}`,
            },
          })
<<<<<<< HEAD
          if (!res.ok) throw new Error(`Error fetching recipes: ${res.status}`);
            const data: ApiResponse = await res.json()
          setHistoryItems(data.recipes)
=======
          if (!res.ok) throw new Error("レシピ帳取得に失敗")
            const data: RecipeTypes[] = await res.json()
          setHistoryItems(data)
>>>>>>> 5822a5a603a2786f9463eeee4ed23e30dc67c9f7
        } catch (err) {
          console.error("レシピ帳の取得エラー:", err)
          setHistoryItems([])
        }
      }
      fetchFavorite()
      
    }, [router]);

  // 履歴をクリックしたときの処理
  const handleHistoryClick = (recipe: RecipeTypes) => {
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
    //TODO:履歴から調理する場合は、調理スタート時にjotaiに保存する
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
                  src={item.photo_url || "/placeholder.svg"}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-medium">{item.title}</h2>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{item.created_at}</span>
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
          onStartCooking={() => startCooking(selectedRecipe.id!)}
        />
      )}
    </main>
  )
}
