"use client"

import { useState, useEffect } from "react"
import { Home, BookOpen, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAtom } from "jotai"
import { currentRecipeAtom } from "@/lib/atoms"

interface User {
  id: string
  email: string
  userName?: string
}

export default function SubmissionCompletePage() {
  const params = useParams()
  const recipeId = Number(params.id)
  const router = useRouter()
  const [,setUser] = useState<User>()
  const [currentRecipe,setCurrentRecipe] = useAtom(currentRecipeAtom)
  const [addedToRecipeBook, setAddedToRecipeBook] = useState(false)
  const [showAddConfirm, setShowAddConfirm] = useState(false)

  // ログイン
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/user")
      if (!res.ok) {
        router.push("/login")
        return
      }

      const data = await res.json()
      console.log(data)
      setUser(data.user)
    }
    fetchUser()
  },[router])

  
  // レシピ情報（実際のアプリではAPIから取得）


  // レシピ帳に追加/削除
  const toggleRecipeBook = () => {
    // 実際のアプリではAPIを呼び出してレシピ帳の状態を更新
    setAddedToRecipeBook(!addedToRecipeBook)
    if (currentRecipe && currentRecipe.id) {
      setCurrentRecipe({
        ...currentRecipe,
        is_favorite: !addedToRecipeBook,
        
      })
    }

    // レシピ帳に追加した場合、確認メッセージを表示
    if (!addedToRecipeBook) {
      setShowAddConfirm(true)

      // 3秒後に確認メッセージを非表示
      setTimeout(() => {
        setShowAddConfirm(false)
      }, 3000)
    }
  }
  const saveDatabase = async () => {
    try {
      const body = currentRecipe
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error("Failed to save recipe:", errorData)
        throw new Error(errorData.message || "レシピの保存に失敗しました")
      }
    } catch (err) {
      console.error("Error saving recipe:", err)
      // 必要に応じてユーザーへの通知やリトライ処理を追加
    }
  }
  // ホームに戻る
  const goToHome = async () => {
    await saveDatabase()
    router.push("/")
  }

  // レシピ一覧に戻る
  const goToRecipes = async () => {
    await saveDatabase()
    router.push("/recipes")
  }
  useEffect(() => {
    console.log(currentRecipe)
  }
  , [])

  // アニメーション用のクラス
  const [animateClass, setAnimateClass] = useState("opacity-0 translate-y-4")

  // コンポーネントがマウントされたときにアニメーションを開始
  useEffect(() => {
    setTimeout(() => {
      setAnimateClass("opacity-100 translate-y-0")
    }, 100)
  }, [])

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="w-full max-w-md mx-auto py-4 flex items-center justify-between">
        <Link
          href={`/cooking/submit-photo`}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>戻る</span>
        </Link>
        <h1 className="text-xl font-semibold">投稿完了</h1>
        <div className="w-16"></div> {/* スペーサー */}
      </header>

      <div className="flex flex-col items-center justify-start flex-1 w-full max-w-md mx-auto">
        <div
          className={`w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md mb-6 transition-all duration-500 ${animateClass}`}
        >
          {/* 完了メッセージ */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 flex items-center">
            <div className="bg-green-100 dark:bg-green-800 rounded-full p-1 mr-3">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-green-800 dark:text-green-400">料理履歴に保存しました！</p>
          </div>

          {/* レシピ画像 */}
          <div className="aspect-[16/9] w-full overflow-hidden">
            <img src={currentRecipe?.photo_url } alt={currentRecipe?.title || "レシピ画像"} className="w-full h-full object-cover" />
          </div>
          

          {/* レシピ情報 */}
          <div className="p-4">
            <h2 className="text-xl font-medium mb-2">{currentRecipe?.title ?? ""}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{currentRecipe?.description ?? ""}</p>

            {/* ボタン */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={toggleRecipeBook}
                className={`w-full py-2 flex items-center justify-center rounded-full ${
                  addedToRecipeBook
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <BookOpen className={`h-5 w-5 mr-2 ${addedToRecipeBook ? "text-blue-600 dark:text-blue-400" : ""}`} />
                {addedToRecipeBook ? "レシピ帳に追加済み" : "レシピ帳に追加"}
              </button>

              <button
                onClick={goToHome}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center"
              >
                <Home className="h-5 w-5 mr-2" />
                ホームに戻る
              </button>

              <button
                onClick={goToRecipes}
                className="w-full py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                他のレシピを見る
              </button>
            </div>
          </div>
        </div>

        {/* レシピ帳追加確認メッセージ */}
        {showAddConfirm && (
          <div className="fixed bottom-6 left-0 right-0 mx-auto w-full max-w-sm bg-green-600 text-white px-4 py-3 rounded-md shadow-lg flex items-center justify-center transition-all duration-300 animate-in fade-in slide-in-from-bottom">
            <Check className="h-5 w-5 mr-2" />
            <span>レシピ帳に追加しました</span>
          </div>
        )}
      </div>
    </main>
  )
}
