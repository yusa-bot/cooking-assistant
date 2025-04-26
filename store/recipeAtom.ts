import { atom } from 'jotai'
import { RecipeTypes, GeneratedRecipeTypes, IngredientTypes } from '@/types/recipe'

export const recipeAtom = atom<RecipeTypes | null>(null)
export const ingredientAtom = atom<IngredientTypes | null>(null)