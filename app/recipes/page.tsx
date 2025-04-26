"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import RecipePopup from "@/components/recipe-popup"
import { useAtom } from 'jotai'
import { generatedRecipesAtom, currentRecipeAtom } from '@/lib/atoms'
import { RecipeTypes, GeneratedRecipeTypes, IngredientTypes } from '@/types/recipeTypes'

interface User {
  id: string
  email: string
  userName?: string
}


export default function RecipesPage() {
  const router = useRouter()
  const [, setToken] = useState<string | null>(null)
  const [,setUser] = useState<User>()
  const [currentRecipe, setCurrentRecipe] = useAtom(currentRecipeAtom)
  const [, setIsRecipePopupOpen] = useState(false)
  const [generatedRecipes, setGeneratedRecipes] = useAtom(generatedRecipesAtom)

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

  // 選んだタイミング→jotai
  // history→jotai 写真のurl
  // memo,isFavorite→jotai
  // 保存ボタンでDB保存

  //idの割り当てのためにtypesのidの?消しちゃった
  const startCooking = (recipeId: string) => {    
    router.push(`/recipes/steps`)
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="w-full max-w-md mx-auto py-4 flex items-center justify-between">
        <Link
          href="/ingredients"
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>戻る</span>
        </Link>
        <h1 className="text-xl font-semibold">おすすめレシピ</h1>
        <div className="w-16"></div> {/* スペーサー */}
      </header>

      <div className="flex flex-col items-center justify-start flex-1 w-full max-w-md mx-auto">
        <p className="text-center mb-6 text-gray-600 dark:text-gray-300">あなたの材料から作れるレシピです</p>

        <div className="w-full space-y-4">
          {generatedRecipes.map((recipe) => (
            <div
              key={recipe.key}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setCurrentRecipe({
              id: "",
              title: recipe.title,
              description: "", // GeneratedRecipeTypesにはdescriptionがないため空文字
              ingredients: recipe.ingredients,
              steps: recipe.steps,
              is_favorite: false, // デフォルト値
              photo_url: "", // デフォルト値
              user_id: undefined,
              created_at: undefined,
              })}
            >
              <div className="p-4">
                <h2 className="text-xl font-medium">{recipe.title}</h2>
                
                
              </div>
            </div>
          ))}
        </div>

        {generatedRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              レシピが見つかりませんでした。別の材料を試してみてください。
            </p>
          </div>
        )}
      </div>
      {currentRecipe && (
        <RecipePopup
        recipe={{
          ...currentRecipe,
        }}
        onClose={() => setIsRecipePopupOpen(false)}
        onStartCooking={() => startCooking(currentRecipe.id)}
      />
    )}
    </main>
  )
}

