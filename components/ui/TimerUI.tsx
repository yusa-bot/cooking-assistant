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
  const timerRef = useRef<TimerLogic>()

  useEffect(() => {
    timerRef.current?.stop()
    const t = `${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`
    setDisplay(t)
    timerRef.current = new TimerLogic(
      t,
      rem => setDisplay(rem),
      () => setRunning(false)
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
      <div className="text-5xl font-bold tracking-widest flex items-center">
        <span>{display.split(":")[0]}</span>
        <span className="mx-11">:</span>
        <span>{display.split(":")[1]}</span>
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
