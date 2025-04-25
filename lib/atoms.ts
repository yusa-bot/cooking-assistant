import { atom } from 'jotai'
import { RecipeTypes } from '@/types/recipeTypes'  // 👉 [types/recipeTypes.ts](types/recipeTypes.ts)


// 調理中のレシピ情報
export const currentRecipeAtom = atom<RecipeTypes | null>(null)
// 現在のステップ
export const currentStepIndexAtom = atom(0)
// 調理中フラグ
export const isCookingAtom = atom(false)