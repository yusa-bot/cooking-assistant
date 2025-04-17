// 音声読み上げ機能を管理するユーティリティ

// シングルトンパターンで音声読み上げの状態を管理
class SpeechSynthesisManager {
  private static instance: SpeechSynthesisManager
  private isSpeaking = false

  private constructor() {}

  public static getInstance(): SpeechSynthesisManager {
    if (!SpeechSynthesisManager.instance) {
      SpeechSynthesisManager.instance = new SpeechSynthesisManager()
    }
    return SpeechSynthesisManager.instance
  }

  // テキストを音声で読み上げる
  public speak(text: string, lang = "ja-JP"): void {
    // 既に読み上げ中なら一度停止
    this.stop()

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang

      // 読み上げ終了時のイベント
      utterance.onend = () => {
        this.isSpeaking = false
      }

      // 読み上げ開始
      this.isSpeaking = true
      window.speechSynthesis.speak(utterance)
    }
  }

  // 音声読み上げを停止
  public stop(): void {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      this.isSpeaking = false
    }
  }

  // 現在読み上げ中かどうか
  public getIsSpeaking(): boolean {
    return this.isSpeaking
  }
}

// シングルトンインスタンスを取得する関数
export function getSpeechSynthesis(): SpeechSynthesisManager {
  return SpeechSynthesisManager.getInstance()
}
