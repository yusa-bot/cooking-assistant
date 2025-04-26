"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Plus, X, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import LoginPromptModal from "@/components/login-prompt-modal"
import { useAtom } from 'jotai'
import { ingredientListAtom, recipeListAtom } from '@/lib/atoms'
import { IngredientTypes } from '@/types/recipeTypes' // <IngredientTypes[]>

interface User {
  id: string
  email: string
  userName?: string
}

interface Props {
  capturedImage: string
}

export default function IngredientsPage({ capturedImage }: Props) {

  // 新しい材料の入力用
  const [newIngredient, setNewIngredient] = useState<IngredientTypes | null>(null)
  const [ingredient, setIngredient] = useAtom(ingredientListAtom) // <IngredientTypes[]>

  const [showSuggestions, setShowSuggestions] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  const [recipes, setRecipes] = useAtom(recipeListAtom) // <RecipeTypes[]>

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

  // 材料を追加する関数
  const addIngredient = (addIngredient: IngredientTypes) => {
    if (addIngredient && !ingredient.some(i => i.name === addIngredient.name)) { // ingredient == <IngredientTypes[]>
      setIngredient([...ingredient, addIngredient])
      setNewIngredient(null)
      setShowSuggestions(false)
    }
  }

  // 材料を削除する関数
  const removeIngredient = (index: number) => {
    const updatedIngredients = [...ingredient]
    updatedIngredients.splice(index, 1)
    setIngredient(updatedIngredients)
  }

  // 入力値が変更されたときの処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewIngredient(prev => ({
      ...prev,
      name: value
    }))
  }

  // 候補をクリックしたときの処理
  const handleSuggestionClick = (suggestion: IngredientTypes) => {
    addIngredient(suggestion)
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
  const goToRecipes = async () => {

    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredient }),
    });
    if (!res.ok) throw new Error(`Error generating recipes: ${res.status}`);

    const data = await res.json()
    setRecipes(data)
    router.push("/recipes")
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

          {ingredient.length > 0 ? (
            <div className="space-y-2 mb-4">
              {ingredient.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md"
                >
                  <span>{ingredient.name}</span>
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
                value={newIngredient?.name ?? ""}
                onChange={handleInputChange}
                placeholder="材料を追加..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={() => {
                  if (newIngredient) {
                    addIngredient(newIngredient)
                  }
                }}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-r-full flex items-center"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

          </div>
        </div>

        <div className="w-full">
          <button
            onClick={goToRecipes}
            disabled={ingredient.length === 0}
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
