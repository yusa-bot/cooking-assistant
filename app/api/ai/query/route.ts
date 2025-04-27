import { answerQuestion } from "@/lib/services/openai/textToService";
export async function POST(request: Request) {
    const body = await request.json();
    console.log(body);
    const { question ,recipeInformation,cookingStep} = body;
    try {
        const answer = await answerQuestion(question,recipeInformation,cookingStep);
        return new Response(JSON.stringify(answer), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error answering question:", error);
        return new Response(JSON.stringify({ error: "Question answering failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }  
}
