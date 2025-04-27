"use client"

import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react"
import { Plus, Minus, Play, Square } from "lucide-react"
import { TimerLogic } from "@/utils/timerLogic"

interface TimerUIProps {
  initialTime?: string
}

export interface TimerUIRef {
  start: () => void;
  stop: () => void;
}

const TimerUI = forwardRef<TimerUIRef, TimerUIProps>(function TimerUI({ initialTime }, ref) {
  if (!initialTime) return null

  const [minutes, setMinutes] = useState<number>(() => {
    const [m] = initialTime.split(":").map(Number)
    return isNaN(m) ? 0 : m
  })
  const [seconds, setSeconds] = useState<number>(() => {
    const [, s] = initialTime.split(":").map(Number)
    return isNaN(s) ? 0 : s
  })
  const [display, setDisplay] = useState<string>(initialTime)
  const [running, setRunning] = useState<boolean>(false)

  // アラーム音
  const playBeep = () => {
    const ctx = new AudioContext()
    const pattern = [
      { freq: 1500, dur: 0.18 },
      { freq: 900, dur: 0.18 },
      { freq: 1500, dur: 0.18 },
      { freq: 900, dur: 0.18 },
      { freq: 1500, dur: 0.18 },
      { freq: 900, dur: 0.18 },
    ]
    let t = ctx.currentTime
    for (const { freq, dur } of pattern) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "square"
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(1, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + dur)
      t += dur
    }
  }

  const timerRef = useRef<TimerLogic>()

  useEffect(() => {
    const [m, s] = initialTime.split(":").map(Number)
    setMinutes(isNaN(m) ? 0 : m)
    setSeconds(isNaN(s) ? 0 : s)
  }, [initialTime])

  useEffect(() => {
    timerRef.current?.stop()
    const t = `${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`
    setDisplay(t)
    timerRef.current = new TimerLogic(
      t,
      rem => setDisplay(rem),
      () => { playBeep(); setRunning(false) }
    )
  }, [minutes, seconds])

  useEffect(() => {
    return () => { timerRef.current?.stop() }
  }, [])

  const start = () => { timerRef.current?.start(); setRunning(true) }
  const stop = () => { timerRef.current?.stop(); setRunning(false) }

  useImperativeHandle(ref, () => ({
    start,
    stop
  }));

  const adjustMinutes = (delta: number) =>
    setMinutes(m => Math.min(59, Math.max(0, m + delta)))

  const adjustSeconds = (delta: number) =>
    setSeconds(s => Math.min(59, Math.max(0, s + delta)))

  return (
    <div className="bg-white dark:bg-gray-800 px-3 sm:px-5 rounded-xl flex flex-col items-center space-y-2 w-full">
      {/* ±ボタン上部 */}
      <div className={`flex gap-4 sm:gap-10 w-full ${running ? "invisible" : ""}`}>
        <button
          onClick={() => adjustMinutes(1)}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full h-9 flex items-center justify-center"
        >
          <Plus className="h-5 w-5" />
        </button>
        <button
          onClick={() => adjustSeconds(5)}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full h-9 flex items-center justify-center"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* 時間表示 */}
      <div className="flex flex-1 items-center justify-center w-full">
        <div className="mx-auto text-4xl sm:text-5xl font-bold tracking-widest flex items-center font-mono tabular-nums">
          <span className="text-center flex justify-center w-[2.5ch]">
            {display.split(":")[0].padStart(2, "0")}
          </span>
          <span className="px-2 sm:px-4 flex justify-center">:</span>
          <span className="text-center flex justify-center w-[2.5ch]">
            {display.split(":")[1].padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ±ボタン下部 */}
      <div className={`flex gap-4 sm:gap-10 w-full ${running ? "invisible" : ""}`}>
        <button
          onClick={() => adjustMinutes(-1)}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full h-9 flex items-center justify-center"
        >
          <Minus className="h-5 w-5" />
        </button>
        <button
          onClick={() => adjustSeconds(-5)}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full h-9 flex items-center justify-center"
        >
          <Minus className="h-5 w-5" />
        </button>
      </div>

      {/* 開始/停止 */}
      <div className="flex-1 flex items-center justify-center w-full py-2">
        {running ? (
          <button
            onClick={stop}
            className="px-8 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center w-full gap-2"
            aria-label="タイマー停止"
          >
            <Square className="h-5 w-5" />
            <span>停止</span>
          </button>
        ) : (
          <button
            onClick={start}
            className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center w-full gap-2"
            aria-label="タイマー開始"
          >
            <Play className="h-5 w-5" />
            <span>開始</span>
          </button>
        )}
      </div>
    </div>
  )
})

export default TimerUI
