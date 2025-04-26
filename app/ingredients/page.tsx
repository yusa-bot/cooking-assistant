"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Plus, X, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import LoginPromptModal from "@/components/login-prompt-modal"
import { useAtom } from 'jotai'
import { ingredientAtom } from '@/store/recipeAtom'

interface User {
  id: string
  email: string
  userName?: string
}

interface Props {
  capturedImage: string
}

export default function IngredientsPage({ capturedImage }: Props) {
  // 検出された材料のリスト（実際のアプリではAIからの結果を使用）
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([])
  // 新しい材料の入力用
  const [newIngredient, setNewIngredient] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const [ingredient, setIngredient] = useAtom(ingredientAtom)

  // ログイン
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/user")
      if (!res.ok) {
        setIsLoggedIn(false)
        return
      }
      
      const data = await res.json()
      console.log(data)
      if (data.user) {
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
        setShowLoginModal(true)
      }
    }
    fetchUser()
  },[])

  //材料を推定
  useEffect(() => {
    const fetchIngredients = async (base64Image: string) => {
      try {
        const res = await fetch("/api/ai/detect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ image: base64Image })
        })
        if (!res.ok) throw new Error("食材取得に失敗")

        const data = await res.json()
        setDetectedIngredients(data)
      } catch (err) {
        console.error("食材の取得エラー:", err)
        setDetectedIngredients([])
      }
    }
    fetchIngredients(capturedImage)
}, [capturedImage]);

  // 食材の候補リスト（実際のアプリではもっと多くの候補を用意）
  const ingredientSuggestions = [
    "キャベツ",
    "にんじん",
    "玉ねぎ",
    "豚肉",
    "鶏肉",
    "牛肉",
    "じゃがいも",
    "トマト",
    "なす",
    "ピーマン",
    "しいたけ",
    "えのき",
    "しめじ",
    "まいたけ",
    "ブロッコリー",
    "カリフラワー",
    "ほうれん草",
    "小松菜",
    "白菜",
    "大根",
    "かぼちゃ",
    "さつまいも",
    "レタス",
    "きゅうり",
    "セロリ",
    "パプリカ",
    "アスパラガス",
    "もやし",
    "ねぎ",
    "にら",
    "しょうが",
    "にんにく",
    "とうもろこし",
    "れんこん",
    "ごぼう",
    "さやいんげん",
    "オクラ",
    "みょうが",
    "わかめ",
    "のり",
    "こんぶ",
    "ひじき",
    "豆腐",
    "油揚げ",
    "厚揚げ",
    "納豆",
    "卵",
    "牛乳",
    "チーズ",
    "バター",
    "マーガリン",
    "ヨーグルト",
    "生クリーム",
    "サラダ油",
    "ごま油",
    "オリーブオイル",
    "米",
    "パン",
    "うどん",
    "そば",
    "パスタ",
    "小麦粉",
    "片栗粉",
    "砂糖",
    "塩",
    "こしょう",
    "醤油",
    "みりん",
    "酒",
    "酢",
    "ケチャップ",
    "マヨネーズ",
    "わさび",
    "からし",
    "ソース",
    "ドレッシング",
  ]

  // 材料を追加する関数
  const addIngredient = (ingredient: string) => {
    if (ingredient && !detectedIngredients.includes(ingredient)) {
      setDetectedIngredients([...detectedIngredients, ingredient])
      setNewIngredient("")
      setShowSuggestions(false)
    }
  }

  // 材料を削除する関数
  const removeIngredient = (index: number) => {
    const updatedIngredients = [...detectedIngredients]
    updatedIngredients.splice(index, 1)
    setDetectedIngredients(updatedIngredients)
  }

  // 入力値が変更されたときの処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewIngredient(value)

    if (value.trim()) {
      // 入力値に基づいて候補をフィルタリング
      const filtered = ingredientSuggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase()),
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  // 候補をクリックしたときの処理
  const handleSuggestionClick = (suggestion: string) => {
    addIngredient(suggestion)
  }

  // Enterキーで候補から選択
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (filteredSuggestions.length > 0) {
        addIngredient(filteredSuggestions[0])
      }
    }
  }

  // 画面のどこかをクリックしたときに候補を非表示にする
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])


  // レシピ提案ページに進む
  const goToRecipes = async (newIngredient: any) => {
    setIngredient(newIngredient)
  }


  // モーダルを閉じる
  const closeLoginModal = () => {
    setShowLoginModal(false)
    router.push("/")
  }

  if (!isLoggedIn && !showLoginModal) {
    return null // ログインモーダルが表示される前は何も表示しない
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="w-full max-w-md mx-auto py-4 flex items-center justify-between">
        <Link
          href="/scan"
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>戻る</span>
        </Link>
        <h1 className="text-xl font-semibold">材料の確認</h1>
        <div className="w-16"></div> {/* スペーサー */}
      </header>

      <div className="flex flex-col items-center justify-start flex-1 w-full max-w-md mx-auto">
        <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium mb-3">検出された材料</h2>

          {detectedIngredients.length > 0 ? (
            <div className="space-y-2 mb-4">
              {detectedIngredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md"
                >
                  <span>{ingredient}</span>
                  <button
                    onClick={() => removeIngredient(index)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label={`${ingredient}を削除`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              材料が検出されませんでした。手動で追加してください。
            </p>
          )}

          <div className="relative" ref={inputRef}>
            <div className="flex items-center">
              <input
                type="text"
                value={newIngredient}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="材料を追加..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={() => filteredSuggestions.length > 0 && addIngredient(filteredSuggestions[0])}
                disabled={filteredSuggestions.length === 0}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-r-full flex items-center"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* 候補リスト */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
                {filteredSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="w-full">
          <button
            onClick={goToRecipes}
            disabled={detectedIngredients.length === 0}
            className="h-14 text-lg font-medium flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-full w-full"
          >
            レシピ提案へ進む
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ログインプロンプトモーダル */}
      <LoginPromptModal isOpen={showLoginModal} onClose={closeLoginModal} featureName="材料確認機能" />
    </main>
  )
}
