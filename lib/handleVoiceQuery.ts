// 音声認識テキストの分岐・AI問い合わせ処理
// step, goToNextStep, goToPrevStep, setAiAnswer, setShowAiAnswer などを引数で受け取る

export type HandleVoiceQueryParams = {
  text: string;
  step: any;
  recipeInformation: any; // 追加
  goToNextStep: () => void;
  goToPrevStep: () => void;
  setAiAnswer: (answer: string) => void;
  setShowAiAnswer: (show: boolean) => void;
  startTimer?: () => void; // タイマー開始用の関数
  stopTimer?: () => void; // タイマー停止用の関数
};
export async function handleVoiceQuery({
    text,
    step,
    recipeInformation,
    goToNextStep,
    goToPrevStep,
    setAiAnswer,
    setShowAiAnswer,
    startTimer,
    stopTimer,
}: HandleVoiceQueryParams) {
    // 空文字の場合は何もしない
    if (!text || text.trim() === "") {
        return;
    }

    // 1. キーワードマッチング
    if (text.includes("次へ") || text.includes("進む")|| text.includes("次")) {
        goToNextStep();
        return;
    }
    if (text.includes("戻る")) {
        goToPrevStep();
        return;
    }

    // タイマー関連のコマンド
    if ((text.includes("タイマー") || text.includes("タイム")) && 
        (text.includes("スタート") || text.includes("開始") || text.includes("始める"))) {
        if (startTimer) {
            startTimer();
            setAiAnswer("タイマーをスタートしました");
            setShowAiAnswer(true);
            return;
        }
    }
    
    if ((text.includes("タイマー") || text.includes("タイム")) && 
        (text.includes("ストップ") || text.includes("停止") || text.includes("止める"))) {
        if (stopTimer) {
            stopTimer();
            setAiAnswer("タイマーを停止しました");
            setShowAiAnswer(true);
            return;
        }
    }
    // ...他のキーワードがあればここに追加...

    // 2. AI問い合わせ
    try {
        const res = await fetch("/api/ai/query", {
            method: "POST",
            body: JSON.stringify({ question: text, recipeInformation, cookingStep: step }),
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        setAiAnswer(data.response || "回答が取得できませんでした");
        setShowAiAnswer(true);
    } catch (e) {
        setAiAnswer("AI応答の取得に失敗しました");
        setShowAiAnswer(true);
    }
}
