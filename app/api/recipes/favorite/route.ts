import { getAllFavoriteRecipes } from '@/lib/services/recipeService'
import { RecipeTypes } from '@/types/recipeTypes'
export async function GET() {
  try {
    const recipes:RecipeTypes[] = await getAllFavoriteRecipes()
    return new Response(JSON.stringify(recipes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
