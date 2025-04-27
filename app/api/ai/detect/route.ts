import { detectIngredients } from '@/lib/services/openai/visionToService'
import { IngredientTypes } from '@/types/recipeTypes'
export async function POST(request: Request) {
    const body = await request.json()
    const imageUrl = body.imageUrl

    const detectResult = await detectIngredients(imageUrl)
    if ('error' in detectResult) {
        console.error("Error in detectIngredients:", detectResult.error)
        return new Response(JSON.stringify({ error: detectResult.error }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
    const ingredients: IngredientTypes[] = detectResult
    return new Response(JSON.stringify(ingredients), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    })
}
