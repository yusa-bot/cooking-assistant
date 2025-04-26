import { atom } from 'jotai'
import { IngredientTypes, RecipeTypes } from '@/types/recipeTypes'  // 👉 [types/recipeTypes.ts](types/recipeTypes.ts)


// 調理中のレシピ情報
export const currentRecipeAtom = atom<RecipeTypes | null>(null)
// 現在のステップ
export const currentStepIndexAtom = atom(0)
// レシピ候補
export const recipeListAtom = atom<RecipeTypes[]>([])
// 材料候補
export const ingredientListAtom = atom<IngredientTypes[]>([])