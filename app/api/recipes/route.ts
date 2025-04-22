export async function GET(request: Request) {
    return Response.json({
        recipes: [
            {
                id: "1",
                title: "スパゲッティ・カルボナーラ",
                description: "卵、チーズ、パンチェッタと黒胡椒を使った伝統的なイタリアンパスタ料理。",
                ingredients: [
                    { name: "スパゲッティ", amount: 400, unit: "g" },
                    { name: "パンチェッタ", amount: 150, unit: "g" },
                    { name: "卵", amount: 3, unit: "個" },
                    { name: "パルメザンチーズ", amount: 50, unit: "g" },
                    { name: "黒胡椒", amount: 2, unit: "小さじ" }
                ],
                steps: [
                    { instruction: "パッケージの指示に従いスパゲッティを茹でる", step_number: 1, timer: "10:00" },
                    { instruction: "パンチェッタをカリカリになるまでフライパンで炒める", step_number: 2, timer: "5:00" },
                    { instruction: "ボウルに卵とチーズを混ぜる", step_number: 3 },
                    { instruction: "すべての材料を合わせて混ぜる", step_number: 4 }
                ]
            },
            {
                id: "2",
                title: "アボカドトースト",
                description: "シンプルで栄養価の高い朝食オプション。",
                ingredients: [
                    { name: "パン", amount: 2, unit: "枚" },
                    { name: "アボカド", amount: 1, unit: "個" },
                    { name: "塩", amount: 1, unit: "つまみ" },
                    { name: "レモン汁", amount: 1, unit: "小さじ" }
                ],
                steps: [
                    { instruction: "パンを金色になるまでトーストする", step_number: 1, timer: "3:00" },
                    { instruction: "ボウルでアボカドをつぶす", step_number: 2 },
                    { instruction: "アボカドに塩とレモン汁を加える", step_number: 3 },
                    { instruction: "アボカドミックスをトーストに広げる", step_number: 4 }
                ]
            }
        ]
    })
}

)