"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import RecipePopup from "@/components/recipe-popup"
import { RecipeTypes } from "@/types/recipeTypes"
import { useAtom } from "jotai"
import { currentRecipeAtom } from "@/lib/atoms"

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
  const [currentRecipe, setCurrentRecipe] = useAtom(currentRecipeAtom)

    // ログイン状態と履歴を確認
    useEffect(() => {
      const fetchUserAndFavorites = async () => {
        try {
          const res = await fetch("/api/auth/user")
          if (!res.ok) {
            setIsLoggedIn(false)
            setUsername("")
            setFavoriteRecipes([])
            router.push("/login")
            return
          }

          const data = await res.json()
          if (data.user) {
            setIsLoggedIn(true)
            setUsername(data.user.userName || "")
            setUser(data.user)

            // ログイン済みの場合、レシピ帳データを取得
            try {
              const recipesRes = await fetch("/api/recipes/favorite", {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${data.user.id}`,
                },
              })
              if (!recipesRes.ok) throw new Error("レシピ帳取得に失敗")
              const recipesData: RecipeTypes[] = await recipesRes.json()
              setFavoriteRecipes(recipesData)
            } catch (err) {
              console.error("レシピ帳の取得エラー:", err)
              setFavoriteRecipes([])
            }
          } else {
            setIsLoggedIn(false)
            setUsername("")
            setFavoriteRecipes([])
            router.push("/login")
          }
        } catch (err) {
          setIsLoggedIn(false)
          setUsername("")
          setFavoriteRecipes([])
          router.push("/login")
        }
      }

      fetchUserAndFavorites()
    }, [])

  // レシピをクリックしたときの処理
  const handleRecipeClick = (recipe: RecipeTypes) => {
    // レシピの詳細情報を設定
    setSelectedRecipe({
      ...recipe,
      steps: recipe.steps || []
    })
  }

  // 調理を開始する
  const startCooking = () => {
    // 遷移元を記録
    setCurrentRecipe(selectedRecipe)
    
    router.push(`/cooking/steps`)
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
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-semibold text-center">レシピ帳</h1>
        </div>
        <div className="w-16" /> {/* 右側のスペース確保用 */}
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
          onStartCooking={() => startCooking()}
        />
      )}
    </main>
  )
}
