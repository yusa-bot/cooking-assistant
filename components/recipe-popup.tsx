"use client"

import { X } from "lucide-react"
import { useRouter } from "next/navigation"

interface RecipePopupProps {
  recipe: {
    id: number
    name: string
    description: string
    cookingTime: string
    difficulty: string
    imageUrl: string
    steps?: { instruction: string }[]
  }
  onClose: () => void
}

export default function RecipePopup({ recipe, onClose }: RecipePopupProps) {
  const router = useRouter()

  // 調理を開始する
  const startCooking = (recipeId: number) => {
    router.push(`/recipes/${recipeId}/steps`)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{recipe.name}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">{recipe.description}</p>

        <div className="mb-6">
          <h3 className="font-bold mb-2">調理手順</h3>
          <ol className="list-decimal pl-5 space-y-2">
            {recipe.steps?.map((step, index) => (
              <li key={index} className="text-gray-600 dark:text-gray-300 mb-2">
                {step.instruction}
              </li>
            ))}
          </ol>
        </div>

        <button
          onClick={() => startCooking(recipe.id)}
          className="w-full py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-full flex items-center justify-center"
        >
          調理を始める
        </button>
      </div>
    </div>
  )
}
