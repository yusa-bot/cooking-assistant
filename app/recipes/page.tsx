"use client"

import { useState } from "react"
import { ArrowLeft, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// レシピの型定義
interface Recipe {
  id: number
  name: string
  description: string
  cookingTime: string
  difficulty: string
  imageUrl: string
}

export default function RecipesPage() {
  const router = useRouter()

  // AIが生成したレシピのリスト（実際のアプリではAPIから取得）
  const [recipes] = useState<Recipe[]>([
    {
      id: 1,
      name: "野菜たっぷり豚肉炒め",
      description: "キャベツ、にんじん、玉ねぎを使った栄養満点の一品。甘辛い味付けで食欲アップ！",
      cookingTime: "20分",
      difficulty: "簡単",
      imageUrl: "/stir-fry-vegetables.jpg",
    },
    {
      id: 2,
      name: "具沢山野菜スープ",
      description: "たっぷりの野菜を使ったヘルシーなスープ。体に優しい味わいです。",
      cookingTime: "30分",
      difficulty: "簡単",
      imageUrl: "/vegetable-soup.jpg",
    },
    {
      id: 3,
      name: "豚肉と野菜の蒸し料理",
      description: "素材の旨味を活かした蒸し料理。ヘルシーながらも満足感のある一皿。",
      cookingTime: "25分",
      difficulty: "普通",
      imageUrl: "/steamed-pork-vegetables.jpg",
    },
    {
      id: 4,
      name: "野菜たっぷりオムレツ",
      description: "彩り豊かな野菜を卵で包んだ栄養満点の朝食やブランチにぴったりの一品。",
      cookingTime: "15分",
      difficulty: "簡単",
      imageUrl: "/vegetable-omelette.jpg",
    },
  ])

  // 調理を開始する
  const startCooking = (recipeId: number) => {
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
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[16/9] w-full overflow-hidden">
                <img
                  src={recipe.imageUrl || "/placeholder.svg"}
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-medium">{recipe.name}</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{recipe.description}</p>
                <div className="flex items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{recipe.cookingTime}</span>
                  <span className="mx-2">•</span>
                  <span>{recipe.difficulty}</span>
                </div>
                <button
                  onClick={() => startCooking(recipe.id)}
                  className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center"
                >
                  調理を始める
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
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
    </main>
  )
}
