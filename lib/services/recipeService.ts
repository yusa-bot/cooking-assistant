import { createClient } from '@/utils/supabase/server'
import { Recipe } from '@/types/recipeTypes'


export async function getAllRecipes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select(`*, recipe_ingredients (*), recipe_steps (*)`)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getRecipeById(reciepeId: string) { 
    
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select(`*, recipe_ingredients (*), recipe_steps (*)`)
    .eq('id', reciepeId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createRecipe(input: Recipe) {
  const supabase = await createClient()
  
  // レシピ本体を作成
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      title: input.title,
      description: input.description || null,      
      photo_url: input.photo_url || null,
      is_favorite: input.is_favorite || false,
    })
    .select('id')
    .single()

  if (recipeError || !recipe) {
    throw new Error(recipeError?.message || 'Failed to create recipe')
  }

  const recipeId = recipe.id

  // 材料を一括挿入
  if (input.ingredients.length) {
    const ingredients = input.ingredients.map(item => ({
      recipe_id: recipeId,
      name: item.name,
      amount: item.amount,
      unit: item.unit,
    }))
    const { error: ingError } = await supabase
      .from('recipe_ingredients')
      .insert(ingredients)
    if (ingError) throw new Error(ingError.message)
  }

  // 手順を一括挿入
  if (input.steps.length) {
    const steps = input.steps.map(step => ({
      recipe_id: recipeId,
      instruction: step.instruction,
      step_number: step.step_number,
      timer: step.timer || null,
    }))
    const { error: stepError } = await supabase
      .from('recipe_steps')
      .insert(steps)
    if (stepError) throw new Error(stepError.message)
  }

  return { success: true, recipeId }
}