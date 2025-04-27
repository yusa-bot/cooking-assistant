"use client"

import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import RecipePopup from "@/components/recipe-popup"
import { RecipeTypes } from "@/types/recipeTypes"
import { set } from "zod"
import { useAtom } from "jotai"
import { currentRecipeAtom } from "@/lib/atoms"

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
  const [, setUsername] = useState("")
  const [,setUser] = useState<User>()
  const [showMenu, setShowMenu] = useState(false)
  const [currentRecipe, setCurrentRecipe] = useAtom(currentRecipeAtom)
  // ログイン状態と履歴を確認・取得
  useEffect(() => {
    const fetchUserAndHistory = async () => {
      const res = await fetch("/api/auth/user")
      if (!res.ok) {
        setIsLoggedIn(false)
        setUsername("")
        setHistoryItems([])
        router.push("/login")
        return
      }

      const data = await res.json()
      if (data.user) {
        setIsLoggedIn(true)
        setUsername(data.user.userName || "")
        setUser(data.user)

        // ログイン済みの場合、履歴データを取得
        try {
          const resRecipes = await fetch("/api/recipes", { method: 'GET' })
          if (!resRecipes.ok) throw new Error("レシピ帳取得に失敗")
          const recipes: RecipeTypes[] = await resRecipes.json()
          setHistoryItems(recipes)
        } catch (err) {
          console.error("レシピ帳の取得エラー:", err)
          setHistoryItems([])
        }
      } else {
        setIsLoggedIn(false)
        setUsername("")
        setHistoryItems([])
        router.push("/login")
      }
    }
    fetchUserAndHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 履歴をクリックしたときの処理
  const handleHistoryClick = (recipe: RecipeTypes) => {
    // 履歴からレシピの詳細情報を設定
    setSelectedRecipe({
      ...recipe,
      steps: recipe.steps || []
    })
  }

  // 調理を開始する
  const startCooking = () => {
    setCurrentRecipe(selectedRecipe)
    //TODO:履歴から調理する場合は、調理スタート時にjotaiに保存する
    router.push(`/cooking/steps`)
  }

  if (!isLoggedIn) {
    return null // ログインしていない場合は何も表示せずリダイレクト
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="w-full max-w-md mx-auto py-4 flex items-center justify-between relative">
        <Link
          href="/"
          className="flex items-center text-gray-600 hover:text-gray-900 absolute left-0"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>戻る</span>
        </Link>
        <h1 className="text-xl font-semibold mx-auto text-center w-full pointer-events-none">
          料理履歴
        </h1>
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
                    <span>
                      {item.created_at
                      ? new Date(item.created_at).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        })
                      : ""}
                    </span>
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
          onStartCooking={() => startCooking()}
        />
      )}
    </main>
  )
}
