"use client"

import React, { useEffect, useState, useRef } from "react"
import { Plus, Minus, Play, Square } from "lucide-react"
import { TimerLogic } from "@/utils/timerLogic"

interface TimerUIProps {
  initialTime?: string
}

export default function TimerUI({ initialTime }: TimerUIProps) {
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

  // よりアラーム感の強いビープ音
  const playBeep = () => {
    const ctx = new AudioContext()
    // 連続した高低音を交互に鳴らす
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

  const adjustMinutes = (delta: number) =>
    setMinutes(m => Math.min(59, Math.max(0, m + delta)))

  const adjustSeconds = (delta: number) =>
    setSeconds(s => {
      const total = Math.min(59, Math.max(0, s + delta))
      return total
    })

  return (
    <div className="bg-white dark:bg-gray-800 px-5 rounded-xl  flex flex-col items-center space-y-2 w-full">
      {/* ±ボタンを常にレンダリングしてレイアウトを維持。実行中は visibility を off に */}
      <div className={`flex gap-10 w-full ${running ? "invisible" : ""}`}>
        <button
          onClick={() => adjustMinutes(1)}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full flex items-center justify-center"
        >
          <Plus />
        </button>
        <button
          onClick={() => adjustSeconds(5)}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full flex items-center justify-center"
        >
          <Plus />
        </button>
      </div>

      {/* 時間表示 */}
      <div className="flex flex-1 items-center justify-center w-full">
        <div className="mx-auto text-5xl font-bold tracking-widest flex items-center font-mono tabular-nums">
          <span className=" text-center flex justify-center">
        {display.split(":")[0].padStart(2, "0")}
          </span>
          <span className="px-12 flex justify-center">:</span>
          <span className="w-[2ch] text-center flex justify-center">
        {display.split(":")[1].padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ±ボタン */}
      <div className={`flex gap-10 w-full ${running ? "invisible" : ""}`}>
        <button
          onClick={() => adjustMinutes(-1)}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full flex items-center justify-center"
        >
          <Minus />
        </button>
        <button
          onClick={() => adjustSeconds(-5)}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full flex items-center justify-center"
        >
          <Minus />
        </button>
      </div>

      {/* 開始/停止 */}
      <div className="flex-1 flex items-center justify-center w-full py-2">
        {running ? (
          <button
            onClick={stop}
            className="px-8 py-1 bg-green-700 hover:bg-green-800 text-white rounded-full flex items-center justify-center w-full"
          >
            <Square />
          </button>
        ) : (
          <button
            onClick={start}
            className="px-8 py-1 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center w-full"
          >
            <Play />
          </button>
        )}
      </div>
    </div>
  )
}
