type RecognitionCallback = (text: string) => void

// 音声認識の状態を管理するクラス
export class SpeechRecognitionManager {
  private recognition: SpeechRecognition | null = null
  private isListening = false
  private isPaused = false
  private savedCallbacks: { onResult?: RecognitionCallback, onError?: (error: any) => void } = {}

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
        this.recognition.continuous = true  // 継続的な音声認識を有効化
        this.recognition.interimResults = true  // 中間結果も取得するように変更
      }
    }
  }

  // 音声認識をサポートしているかどうか
  public isSupported(): boolean {
    return this.recognition !== null
  }

  // 音声認識を一時停止（システム音声出力中に使用）
  public pauseListening(): void {
    if (this.recognition && this.isListening && !this.isPaused) {
      try {
        this.isPaused = true
        this.recognition.stop()
        // isListeningはfalseになるが、isPausedがtrueなので再開可能
      } catch (error) {
        console.error("音声認識の一時停止に失敗しました:", error)
      }
    }
  }

  // 一時停止した音声認識を再開
  public resumeListening(): void {
    if (this.recognition && this.isPaused && this.savedCallbacks.onResult) {
      this.isPaused = false
      this.startListening(this.savedCallbacks.onResult, this.savedCallbacks.onError)
    }
  }

  // 音声認識を開始
  public startListening(onResult: RecognitionCallback, onError?: (error: any) => void): void {
    if (!this.recognition) {
      if (onError) onError(new Error("音声認識がサポートされていません"))
      return
    }

    // コールバックを保存（一時停止からの復帰に使用）
    this.savedCallbacks = { onResult, onError }
    
    // 既にリスニング中なら再起動しない（エラー防止）
    if (this.isListening) {
      return
    }

    this.isListening = true

    // 結果イベントのハンドラ
    this.recognition.onresult = (event) => {
      // 継続的な認識では複数の結果がある可能性があるため、最新の結果を使用
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript;
      
      // 中間結果ではなく、確定した結果のみを処理
      if (event.results[lastResultIndex].isFinal) {
        const wakeWord = "シェフ";
        const index = transcript.indexOf(wakeWord);
        if (index !== -1) {
          const text = transcript.slice(index + wakeWord.length).trim();
          if (text.length > 0) {
            onResult(text);
          }
        }
      }
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
      if (
        error instanceof DOMException &&
        error.name === "InvalidStateError"
      ) {
        // 状態がずれている場合は少し待って再試行
        setTimeout(() => {
          this.startListening(onResult, onError)
        }, 300)
        return
      }
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
      this.isPaused = false
    }
  }

  // 現在リスニング中かどうか
  public getIsListening(): boolean {
    return this.isListening && !this.isPaused
  }
  
  // 一時停止中かどうか
  public getIsPaused(): boolean {
    return this.isPaused
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
