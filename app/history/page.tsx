"use client"

import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// 料理履歴の型定義
interface CookingHistory {
  id: number
  date: string
  recipeName: string
  imageUrl: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [historyItems, setHistoryItems] = useState<CookingHistory[]>([])

  // ログイン状態と履歴を確認
  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const { token } = JSON.parse(user)
      setIsLoggedIn(true)
      fetchHistory(token)
    } else {
      router.push("/")
    }
  }, [router])

  const fetchHistory = async (token: string) => {
    try {
      const res = await fetch("/api/recipes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("履歴取得に失敗しました")
      const data = await res.json()
      setHistoryItems(data)
    } catch (err) {
      console.error(err)
      setHistoryItems([])
    }
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="w-full max-w-md mx-auto py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>戻る</span>
        </Link>
        <h1 className="text-xl font-semibold">料理履歴</h1>
        <div className="w-16"></div> {/* スペーサー */}
      </header>

      <div className="flex flex-col items-center justify-start flex-1 w-full max-w-md mx-auto">
        <div className="w-full space-y-4 mt-4">
          {historyItems.map((item) => (
            <div key={item.id} className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 flex items-center">
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.recipeName}
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
                <div>
                  <h2 className="text-lg font-medium">{item.recipeName}</h2>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
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
            <p className="text-gray-500">履歴はまだありません</p>
          </div>
        )}
      </div>
    </main>
  )
}
