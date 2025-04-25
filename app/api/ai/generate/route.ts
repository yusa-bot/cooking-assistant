import { generateRecipesFromIngredients } from "@/lib/services/openai/textToService";
import { GeneratedRecipeTypes} from "@/types/recipeTypes";
export async function POST(request: Request) {
    const body = await request.json();
    const ingredients = body.ingredients;
    try {
        const generatedRecipes:GeneratedRecipeTypes[] = await generateRecipesFromIngredients(ingredients);
        return new Response(JSON.stringify(generatedRecipes), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error generating recipes:", error);
        return new Response(JSON.stringify({ error: "Recipe generation failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
    