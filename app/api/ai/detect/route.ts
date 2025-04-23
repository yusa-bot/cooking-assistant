export function POST(request: Request) {
    const body = request.json();
    console.log(body);
    // openaiapiを叩いて画像から材料を推定
    return Response.json({
        ingredients: [
            { name: "スパゲッティ", amount: 400, unit: "g" },
            { name: "パンチェッタ", amount: 150, unit: "g" },
            { name: "卵", amount: 3, unit: "個" },
            { name: "パルメザンチーズ", amount: 50, unit: "g" },        
        ]
    });
}
