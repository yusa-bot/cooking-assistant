import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import {GeneratedRecipeTypes,StepTypes,IngredientTypes} from '@/types/recipeTypes'; // Ingredient型をインポート

// レシピ生成用スキーマ定義
const RecipeIngredientSchema = z.object({
    name: z.string().describe("材料の名称"),
    amount: z.string().describe("材料の数量（数値または文字列）"),
    unit: z.string().describe("数量の単位"),
});

const RecipeStepSchema = z.object({
    instruction: z.string().describe("手順の説明"),
    step_number: z.number().describe("手順の番号"),
    timer: z.string().nullable().describe("この手順に必要なタイマー（必ず00:00形式）"),
});

const RecipeSchema = z.object({
    title: z.string().describe("レシピのタイトル"),
    description: z.string().describe("レシピの説明"),
    ingredients: z
        .array(RecipeIngredientSchema)
        .describe("使用する材料のリスト"),
    steps: z
        .array(RecipeStepSchema)
        .describe("調理手順のリスト"),
});

// QA応答用スキーマ定義
const AnswerSchema = z.object({
    response: z.string(),
});

const RecipesResponseSchema = z.object({
    recipes: z
      .array(RecipeSchema)
      .describe("レシピオブジェクトの配列"),
  });

const openaiText = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateRecipesFromIngredients(
    ingredients: IngredientTypes[]
): Promise<Array<GeneratedRecipeTypes>> {
    try {
        console.log(ingredients, "Sending request to OpenAI for recipe generation...");
        // 材料リストをテキストプロンプトに変換
        const promptText = `以下の材料を使って作れるレシピをできるだけ多く提案してください。ただし、材料リストに含まれないものは使用しないようにしなさい:\n${ingredients
            .map((i) => `- ${i.name} (${i.amount} ${i.unit})`)
            .join('\n')}\nレシピはJSON形式で、title, description, ingredients配列, steps配列を含むオブジェクトの配列としてください。`;

        const response = await openaiText.chat.completions.create({
            model: "gpt-4.1-mini-2025-04-14",
            messages: [
                {
                    role: "system",
                    content:
                        "あなたは料理の専門家で、指定された材料から魅力的なレシピをできるだけ多く生成します。ただし、座領リストに含まれていないものは使用しないこと出力は指定されたJSON形式に従ってください。",
                },
                { role: "user", content: promptText },
            ],
            response_format: zodResponseFormat(RecipesResponseSchema, "recipe_generation"),
            max_tokens: 2000,
            temperature: 0.7,
        });

        const message = response.choices[0].message.content;
        if (!message) throw new Error("No recipe content received.");
        const parsed = JSON.parse(message);
        const validation = RecipesResponseSchema.safeParse(parsed);
        if (!validation.success) {
            console.error("Recipe response validation failed:", validation.error.errors);
            throw new Error("Invalid recipe response format.");
        }

        const generatedRecipes: GeneratedRecipeTypes[] = validation.data.recipes.map((r, i) => ({
            key: i, // unique key を振る
            title: r.title,
            ingredients: r.ingredients,
            steps: r.steps.map((s) => ({
                instruction: s.instruction,
                step_number: s.step_number,
                timer: s.timer ?? undefined,
            })),
        }));

        return generatedRecipes;
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}

// --- QA関数 ---
export async function answerQuestion(
    question: string,
    recipe: any,
    cookingStep: any
): Promise<z.infer<typeof AnswerSchema>> {
    if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI API key is not configured.");
    try {
        // レシピ情報と現在の調理段階をプロンプトに追加
        const recipeInfo = JSON.stringify(recipe, null, 2);
        const stepInfo = JSON.stringify(cookingStep, null, 2);
        const userContent = `
以下はレシピ情報です:
${recipeInfo}

現在の調理段階:
${stepInfo}

上記を踏まえて、次の質問に答えてください:
${question}
        `.trim();

        const response = await openaiText.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            messages: [
                {
                    role: "system",
                    content: "あなたは料理の専門家で、食材の特性や調理科学に精通したアシスタントです。ユーザーのレシピ情報と現在の調理段階を正確に把握し、具体的かつ実践的なアドバイスを提供してください。回答はAnswerSchemaに従い、responseフィールドに簡潔かつ正確な答えをJSON形式で出力してください。",
                },
                { role: "user", content: userContent },
            ],
            response_format: zodResponseFormat(AnswerSchema, "qa_answer"),
            max_tokens: 500,
            temperature: 0.5,
        });

        const message = response.choices[0].message.content;
        if (!message) throw new Error("No answer content received.");
        const parsed = JSON.parse(message);
        const validation = AnswerSchema.safeParse(parsed);
        if (!validation.success) {
            console.error("Answer response validation failed:", validation.error.errors);
            throw new Error("Invalid answer response format.");
        }
        return validation.data;
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}