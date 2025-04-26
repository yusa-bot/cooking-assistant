type RecognitionCallback = (text: string) => void

// 音声認識の状態を管理するクラス
export class SpeechRecognitionManager {
  private recognition: SpeechRecognition | null = null
  private isListening = false

  constructor() {
    // ブラウザがSpeechRecognitionをサポートしているか確認
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      // ブラウザに応じたSpeechRecognitionを使用
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      this.recognition = new SpeechRecognition()

      // 設定
      if (this.recognition) {
        this.recognition.lang = "ja-JP"
        this.recognition.continuous = false
        this.recognition.interimResults = false
      }
    }
  }

  // 音声認識をサポートしているかどうか
  public isSupported(): boolean {
    return this.recognition !== null
  }

  // 音声認識を開始
  public startListening(onResult: RecognitionCallback, onError?: (error: any) => void): void {
    if (!this.recognition) {
      if (onError) onError(new Error("音声認識がサポートされていません"))
      return
    }

    if (this.isListening) {
      this.stopListening()
    }

    this.isListening = true

    // 結果イベントのハンドラ
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
    }

    // エラーイベントのハンドラ
    this.recognition.onerror = (event) => {
      this.isListening = false
      if (onError) onError(event.error)
    }

    // 終了イベントのハンドラ
    this.recognition.onend = () => {
      this.isListening = false
    }

    // 音声認識開始
    try {
      this.recognition.start()
    } catch (error) {
      this.isListening = false
      if (onError) onError(error)
    }
  }

  // 音声認識を停止
  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop()
      } catch (error) {
        console.error("音声認識の停止に失敗しました:", error)
      }
      this.isListening = false
    }
  }

  // 現在リスニング中かどうか
  public getIsListening(): boolean {
    return this.isListening
  }
}

// シングルトンインスタンス
let instance: SpeechRecognitionManager | null = null

// シングルトンインスタンスを取得
export function getSpeechRecognition(): SpeechRecognitionManager {
  if (!instance) {
    instance = new SpeechRecognitionManager()
  }
  return instance
}
