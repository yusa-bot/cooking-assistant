import { getAllRecipes, createRecipe } from '@/lib/services/recipeService'
import { RecipeTypes } from '@/types/recipeTypes'

export async function GET() {
  try {
    const recipes:RecipeTypes[] = await getAllRecipes()
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

export async function POST(req: Request) {
  try {
    const input:RecipeTypes = await req.json()
    const result = await createRecipe(input)
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}