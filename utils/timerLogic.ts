export type TickCallback = (remaining: string) => void;
export type FinishCallback = () => void;

export class TimerLogic {
  private totalSeconds: number;
  private remainingSeconds: number;
  private intervalId?: number;
  private onTick: TickCallback;
  private onFinish: FinishCallback;

  constructor(initialTime: string, onTick: TickCallback, onFinish: FinishCallback) {
    this.totalSeconds = TimerLogic.parseTime(initialTime);
    this.remainingSeconds = this.totalSeconds;
    this.onTick = onTick;
    this.onFinish = onFinish;
  }

  static parseTime(timeStr: string): number {
    const [mm, ss] = timeStr.split(':').map((v) => parseInt(v, 10));
    return (mm || 0) * 60 + (ss || 0);
  }

  static formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  start() {
    if (this.intervalId != null) return;
    this.intervalId = window.setInterval(() => {
      this.remainingSeconds = this.remainingSeconds - 1;
      if (this.remainingSeconds <= 0) {
        this.stop();
        this.onTick(TimerLogic.formatTime(0));
        this.onFinish();
      } else {
        this.onTick(TimerLogic.formatTime(this.remainingSeconds));
      }
    }, 1000);
  }

  stop() {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  reset() {
    this.stop();
    this.remainingSeconds = this.totalSeconds;
    this.onTick(TimerLogic.formatTime(this.remainingSeconds));
  }
}
