// 音声合成イベントのタイプ定義
export type SpeechSynthesisEvent = 'start' | 'end';
export type SpeechSynthesisListener = () => void;

class SpeechSynthesisManager {
  private static instance: SpeechSynthesisManager
  private isSpeaking = false
  private speechQueue: Array<{text: string, lang: string}> = []
  private processing = false
  private listeners: Record<SpeechSynthesisEvent, SpeechSynthesisListener[]> = {
    start: [],
    end: []
  };
  // 発話の長さに応じた待機時間を計算するための係数
  private readonly PAUSE_FACTOR = 100; // ミリ秒/文字

  private constructor() {}

  // イベントリスナー登録
  public addEventListener(event: SpeechSynthesisEvent, listener: SpeechSynthesisListener): void {
    this.listeners[event].push(listener);
  }

  // イベントリスナー削除
  public removeEventListener(event: SpeechSynthesisEvent, listener: SpeechSynthesisListener): void {
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  // イベント発火
  private emitEvent(event: SpeechSynthesisEvent): void {
    this.listeners[event].forEach(listener => listener());
  }

  // シングルトンインスタンスを取得
  public static getInstance(): SpeechSynthesisManager {
    if (!SpeechSynthesisManager.instance) {
      SpeechSynthesisManager.instance = new SpeechSynthesisManager()
    }
    return SpeechSynthesisManager.instance
  }

  // テキストを音声で読み上げるキューに追加
  public speak(text: string, lang = "ja-JP", priority = false): void {
    if (!text) return
    
    // 優先度が高い場合は現在の発話を停止して、キューの先頭に追加
    if (priority) {
      this.stop()
      this.speechQueue.unshift({ text, lang })
    } else {
      // 通常の優先度の場合はキューの末尾に追加
      this.speechQueue.push({ text, lang })
    }
    
    // キュー処理がまだ動いていなければ開始
    this.processQueue()
  }

  // キューを処理する内部関数
  private processQueue(): void {
    // すでに処理中なら何もしない
    if (this.processing) return
    
    this.processing = true
    
    // キューが空になるまで処理
    if (this.speechQueue.length === 0) {
      this.processing = false
      return
    }
    
    if ("speechSynthesis" in window) {
      const nextItem = this.speechQueue.shift()
      if (!nextItem) {
        this.processing = false
        return
      }
      
      const utterance = new SpeechSynthesisUtterance(nextItem.text)
      utterance.lang = nextItem.lang

      // 読み上げ開始前にイベント発火
      this.isSpeaking = true
      this.emitEvent('start');

      // テキストの長さから推定される発話時間（ミリ秒）
      const estimatedDuration = Math.max(1500, nextItem.text.length * this.PAUSE_FACTOR);
      
      // 読み上げ終了時のイベント
      utterance.onend = () => {
        // 実際の再生が完了するまで十分な遅延を設ける
        // テキストの長さに比例した待機時間 + 最低1.5秒
        setTimeout(() => {
          this.isSpeaking = false
          this.emitEvent('end');
          // 次の項目を処理
          setTimeout(() => this.processQueue(), 100)
        }, Math.min(estimatedDuration, 5000)); // 最大5秒まで
      }
      
      // エラーが発生した場合も次へ
      utterance.onerror = () => {
        this.isSpeaking = false
        this.emitEvent('end');
        setTimeout(() => this.processQueue(), 100)
      }

      // 読み上げ開始
      window.speechSynthesis.speak(utterance)
    } else {
      this.processing = false
    }
  }

  // 音声読み上げを停止してキューをクリア
  public stop(): void {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      this.speechQueue = []
      this.isSpeaking = false
      this.processing = false
      this.emitEvent('end');
    }
  }

  // 現在読み上げ中かどうか
  public getIsSpeaking(): boolean {
    return this.isSpeaking
  }
  
  // キューに残っているアイテム数を取得
  public getQueueLength(): number {
    return this.speechQueue.length
  }
  
  // キューをクリアするが現在の発話は継続
  public clearQueue(): void {
    this.speechQueue = []
  }
}

// シングルトンインスタンスを取得する関数
export function getSpeechSynthesis(): SpeechSynthesisManager {
  return SpeechSynthesisManager.getInstance()
}
