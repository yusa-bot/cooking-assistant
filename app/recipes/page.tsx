"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import RecipePopup from "@/components/recipe-popup"

interface RecipeStep {
  instruction: string
}

// レシピの型定義
interface Recipe {
  id: number
  name: string
  description: string
  cookingTime: string
  difficulty: string
  imageUrl: string
  steps: RecipeStep[]
}

export default function RecipesPage() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }
    const { token } = JSON.parse(user)

    const fetchRecipes = async () => {
      const res = await fetch("/api/recipes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      setRecipes(data)
    }
    fetchRecipes()
  }, [router])

  useEffect(() => {
    if (selectedRecipeId === null) return
    const user = localStorage.getItem("user")
    if (!user) return
    const { token } = JSON.parse(user)

    const fetchRecipe = async () => {
      const res = await fetch(`/api/recipes/${selectedRecipeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      setSelectedRecipe(data)
    }
    fetchRecipe()
  }, [selectedRecipeId])

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
                <h2 className="text-xl font-medium">{recipe.name}</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{recipe.description}</p>
                <div className="flex items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{recipe.cookingTime}</span>
                  <span className="mx-2">•</span>
                  <span>{recipe.difficulty}</span>
                </div>
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
        recipe={selectedRecipe}
        onClose={() => {
          setSelectedRecipe(null)
          setSelectedRecipeId(null)
        }}
      />
    )}
    </main>
  )
}
