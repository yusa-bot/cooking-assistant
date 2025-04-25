"use client"

import { X } from "lucide-react"

interface RecipePopupProps {
  recipe: {
    id: string
    title: string
    imageUrl?: string
    description: string
    ingredients?: { name: string; amount: number; unit: string }[]
    steps?: { instruction: string }[]
    date?: string
    difficulty?: string
  }
  onClose: () => void
  onStartCooking: () => void
}

export default function RecipePopup({ recipe, onClose, onStartCooking }: RecipePopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{recipe.title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">{recipe.description}</p>

        {(recipe.date || recipe.difficulty) && (
          <div className="flex items-center mb-4 text-sm text-gray-500">
            {recipe.date && <span className="mr-2">調理時間: {recipe.date}</span>}
            {recipe.difficulty && <span>難易度: {recipe.difficulty}</span>}
          </div>
        )}

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
          onClick={onStartCooking}
          className="w-full py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-full flex items-center justify-center"
        >
          調理を始める
        </button>
      </div>
    </div>
  )
}


// export default function RecipePopup({ recipe, onClose, onStartCooking }: RecipePopupProps) {
//   return (
//     // ポップアップ画面閉開
//     <div onClick={onClose}>
//       <div onClick={(e) => e.stopPropagation()}>

//         <div>
//           <h2>{recipe.name}</h2>
//           <button onClick={onClose}> <X/> </button>
//         </div>

//         <p>{recipe.description}</p>

//         {(recipe.cookingTime || recipe.difficulty) && (
//           <div>
//             {recipe.cookingTime && <span>調理時間: {recipe.cookingTime}</span>}
//             {recipe.difficulty && <span>難易度: {recipe.difficulty}</span>}
//           </div>
//         )}

//         <div>
//           <h3>調理手順</h3>
//           <ol>
//             {recipe.steps?.map((step, index) => (
//               <li key={index}>
//                 {step.instruction}
//               </li>
//             ))}
//           </ol>
//         </div>

//         <button onClick={onStartCooking}>調理を始める</button>

//       </div>
//     </div>
//   )
// }
