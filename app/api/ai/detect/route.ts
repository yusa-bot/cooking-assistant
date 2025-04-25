import { detectIngredients } from '@/lib/services/openai/visionToService'
export async function POST(request: Request) {
  const body = await request.json()
  const imageUrl = body.imageUrl
  try {
    const ingredients = await detectIngredients(imageUrl)
    return new Response(JSON.stringify(ingredients), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        })
    }
catch (error) {
    console.error("Error detecting ingredients:", error)
    return new Response(JSON.stringify({ error: "Ingredient detection failed" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        })
    }
}
