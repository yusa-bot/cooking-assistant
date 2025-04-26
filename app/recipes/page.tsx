"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import RecipePopup from "@/components/recipe-popup"
import { useAtom } from 'jotai'
import { recipeAtom } from '@/store/recipeAtom'
import { ingredientAtom } from '@/store/recipeAtom'
import { RecipeTypes, GeneratedRecipeTypes, IngredientTypes } from '@/types/recipe'

interface User {
  id: string
  email: string
  userName?: string
}


export default function RecipesPage() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<RecipeTypes[]>([])
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeTypes | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [user,setUser] = useState<User>()
  const [recipe, setRecipe] = useAtom(recipeAtom)
  const [ingredient, setIngredient] = useAtom(ingredientAtom)

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

  useEffect(() => {
    if (!token) return

    //レシピ候補配列ganerate
    const generateRecipes = async (ingredient: any) => {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient }),
      });
      if (!res.ok) throw new Error(`Error generating recipes: ${res.status}`);
      const data: RecipeTypes[] = await res.json()
      setRecipes(data || [])
    }
    generateRecipes(ingredient)
  }, [])

  // 選んだタイミング→jotai
  // history→jotai 写真のurl
  // memo,isFavorite→jotai
  // 保存ボタンでDB保存

  useEffect(() => {
    if (selectedRecipeId === null) return

    const fetchRecipe = () => {
      setSelectedRecipe(recipes[selectedRecipeId])
    }
    fetchRecipe()
  }, [selectedRecipeId])

  const startCooking = (recipeId: string) => {
    // 遷移元を記録

    setRecipe(selectedRecipe) //jotai

    localStorage.setItem("recipeSource", "recipes")
    router.push(`/recipes/${recipeId}/steps`)
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
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedRecipe(recipe)}
            >
              <div className="p-4">
                <h2 className="text-xl font-medium">{recipe.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{recipe.description}</p>
                
              </div>
            </div>
          ))}
        </div>

        {recipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              レシピが見つかりませんでした。別の材料を試してみてください。
            </p>
          </div>
        )}
      </div>
      {selectedRecipe && (
        <RecipePopup
        recipe={{
          ...selectedRecipe,
        }}
        onClose={() => setSelectedRecipe(null)}
        onStartCooking={() => startCooking(selectedRecipe.id)}
      />
    )}
    </main>
  )
}
