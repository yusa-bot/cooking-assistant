export async function POST(request: Request) {
    const body = await request.json();
    console.log(body);
    //openaiapiを叩き、質問への回答を生成
    return Response.json({
        response: "スパゲッティ・カルボナーラは、卵、チーズ、パンチェッタと黒胡椒を使った伝統的なイタリアンパスタ料理です。",
        timer:{
            minutes:"10:00"
        }
    })
}
