import {getRecipeById} from '@/lib/services/recipeService'
import { RecipeTypes } from '@/types/recipeTypes';

export async function GET(_req: Request, { params }: { params: { id: string } }) {    
    const recipeId = params.id
    try {
        const  data:RecipeTypes = await getRecipeById(recipeId);
        return new Response(JSON.stringify(data), {
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