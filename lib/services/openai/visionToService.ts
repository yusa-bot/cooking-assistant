import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { IngredientTypes } from '@/types/recipeTypes'; 

const IngredientSchema = z.object({
  name: z.string().describe("検出された材料の名前 (例: 'トマト', '小麦粉', '鶏むね肉')"),
  amount: z.string().describe("推定される量や数量 (例: '1', '2', 'ひとつかみ', 不明な場合は'N/A')"),
  unit: z.string().describe("量の単位 (例: '個', 'g', 'ml', 'カップ', 不明または単位がない場合は'N/A')"),
});

const IngredientsResponseSchema = z.object({
  ingredients: z.array(IngredientSchema).describe("画像から検出された材料のリスト"),
}).strict();

type DetectIngredientsSuccess = { ingredients: IngredientTypes[] };
type DetectIngredientsError = { error: string; refusal?: string };
export type DetectIngredientsResult = DetectIngredientsSuccess | DetectIngredientsError;


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



/**
 * 画像(Base64データURI)を受け取り、OpenAI APIを使用して材料情報を抽出する関数
 * @param base64Image Base64エンコードされた画像データURI (例: "data:image/jpeg;base64,...")
 * @returns 成功時は{ ingredients: IngredientInfo[] }、失敗時は{ error: string, refusal?: string }
 */
export async function detectIngredients(base64Image: string): Promise<DetectIngredientsResult> {
  // APIキー設定チェック
  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key is not configured in environment variables.");
    return { error: "OpenAI API key is not configured." };
  }

  // 入力データ形式チェック (簡易)
  if (!base64Image || typeof base64Image !== 'string' || !base64Image.startsWith('data:image')) {
    console.error("Invalid image data provided.");
    return { error: "Invalid image data provided. Expected a Base64 data URI." };
  }

  console.log("Sending request to OpenAI for ingredient detection...");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini-2025-04-14", // Vision対応モデル
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              
              text: `提供された画像から食品・食材を特定し、それぞれの「材料名(name)」、「量(amount)」、「単位(unit)」を抽出してください。量や単位が不明確な場合や該当しない場合は 'N/A' としてください。必ず指定されたJSONスキーマの形式で出力してください。`,
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              
              },
            },
          ],
        },
      ],

      response_format: zodResponseFormat(IngredientsResponseSchema, "ingredient_extraction"), // 第2引数はスキーマの名前(任意)
      max_tokens: 1500, 
      
    });

    console.log("Received response from OpenAI.");
    const message = response.choices[0].message;

    // 応答拒否(Refusal)のチェック
    if (message.refusal) {
      console.warn("OpenAI request refused:", message.refusal);
      return { error: "Request refused by the model.", refusal: message.refusal };
    }

    // contentがない場合 (通常はrefusalで処理されるはずだが念のため)
    if (!message.content) {
      console.error("OpenAI response missing content and refusal message.");
      return { error: "No content received from OpenAI model." };
    }

    
    try {
      const parsedOutput = JSON.parse(message.content);

      // (念のため) パース結果をZodスキーマで再度検証
      const validationResult = IngredientsResponseSchema.safeParse(parsedOutput);
      if (!validationResult.success) {
        console.error("OpenAI response failed Zod validation after parsing:", validationResult.error.errors);
        return { error: `OpenAI response format validation failed: ${validationResult.error.message}` };
      }

      console.log("Successfully detected ingredients:", validationResult.data.ingredients);
      
      // Return with correct Ingredient type
      return { ingredients: validationResult.data.ingredients };

    } catch (parseError) {
      console.error("Failed to parse OpenAI JSON response:", parseError);
      console.error("Raw content from OpenAI:", message.content); // デバッグ用
      return { error: "Failed to parse the structured response from OpenAI." };
    }

  } catch (error: any) {
    console.error("Error calling OpenAI API:", error);
    const errorMessage = error.response?.data?.error?.message || error.message || "An unexpected error occurred during OpenAI API call.";
    return { error: `OpenAI API Error: ${errorMessage}` };
  }
}

