"use client"

import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"

export default function HistoryPage() {
  const historyItems = [
    {
      id: 1,
      date: "2023年4月15日",
      recipe: "野菜炒め",
      image: "/colorful-fruit-display.png",
    },
    {
      id: 2,
      date: "2023年4月10日",
      recipe: "トマトパスタ",
      image: "/colorful-pasta-arrangement.png",
    },
    {
      id: 3,
      date: "2023年4月5日",
      recipe: "野菜スープ",
      image: "/bowl-of-comfort.png",
    },
  ]

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="w-full max-w-md mx-auto py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>戻る</span>
        </Link>
        <h1 className="text-xl font-semibold">料理履歴</h1>
        <div className="w-16"></div> {/* スペーサー */}
      </header>

      <div className="flex flex-col items-center justify-start flex-1 w-full max-w-md mx-auto">
        <div className="w-full space-y-4 mt-4">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm"
            >
              <div className="p-4 flex items-center">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.recipe}
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
                <div>
                  <h2 className="text-lg font-medium">{item.recipe}</h2>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {historyItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">履歴はまだありません</p>
          </div>
        )}
      </div>
    </main>
  )
}
