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
  const [newIngredient, setNewIngredient] = useState<IngredientTypes>({
    name: '',
    amount: '',
    unit: ''
  })
  const [ingredient, setIngredient] = useAtom(ingredientListAtom) // <IngredientTypes[]>
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

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
    if (addIngredient && addIngredient.name) {
      if (editingIndex !== null) {
        // 既存の材料を編集する場合
        const updatedIngredients = [...ingredient];
        updatedIngredients[editingIndex] = addIngredient;
        setIngredient(updatedIngredients);
        setEditingIndex(null);
      } else if (!ingredient.some(i => i.name === addIngredient.name)) {
        // 新しい材料を追加する場合
        setIngredient([...ingredient, addIngredient]);
      }
      setNewIngredient({ name: '', amount: '', unit: '' });
      setShowSuggestions(false);
    }
  }

  // 材料を削除する関数
  const removeIngredient = (index: number) => {
    const updatedIngredients = [...ingredient];
    updatedIngredients.splice(index, 1);
    setIngredient(updatedIngredients);
    if (editingIndex === index) {
      setEditingIndex(null);
      setNewIngredient({ name: '', amount: '', unit: '' });
    }
  }

  // 材料を編集モードにする関数
  const editIngredient = (index: number) => {
    setEditingIndex(index);
    setNewIngredient({ ...ingredient[index] });
  }

  // 材料の特定フィールドを直接編集する関数
  const updateIngredient = (index: number, field: keyof IngredientTypes, value: string) => {
    const updatedIngredients = [...ingredient];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };
    setIngredient(updatedIngredients);
  }

  // 入力値が変更されたときの処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof IngredientTypes) => {
    const value = e.target.value;
    setNewIngredient(prev => ({
      ...prev,
      [field]: value
    }));
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
        <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="text-lg font-medium mb-3">材料リスト</h2>

          {ingredient.length > 0 ? (
            <div className="overflow-x-auto w-full mb-4">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">名前</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">量</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">単位</th>
                    <th className="w-12 px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {ingredient.map((item, index) => (
                    <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-3 py-3 text-sm">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                          className="w-full bg-transparent p-1 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <input
                          type="text"
                          value={item.amount || ''}
                          onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                          className="w-full bg-transparent p-1 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <input
                          type="text"
                          value={item.unit || ''}
                          onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                          className="w-full bg-transparent p-1 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <div className="flex items-center justify-center h-full">
                          <button
                            onClick={() => removeIngredient(index)}
                            className="rounded-full p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            aria-label={`${item.name}を削除`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-center py-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              材料が登録されていません。下のフォームから追加してください。
            </p>
          )}

          <div className="mt-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md">
            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">新しい材料を追加</h3>
            <div className="flex flex-col space-y-2">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <input
                    type="text"
                    value={newIngredient.name}
                    onChange={(e) => handleInputChange(e, 'name')}
                    placeholder="材料名"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="text"
                    value={newIngredient.amount || ''}
                    onChange={(e) => handleInputChange(e, 'amount')}
                    placeholder="量"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="text"
                    value={newIngredient.unit || ''}
                    onChange={(e) => handleInputChange(e, 'unit')}
                    placeholder="単位"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    onClick={() => {
                      if (newIngredient && newIngredient.name) {
                        addIngredient(newIngredient);
                      }
                    }}
                    className="w-full h-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md flex items-center justify-center transition-colors"
                    disabled={!newIngredient.name}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <button
            onClick={goToRecipes}
            disabled={ingredient.length === 0}
            className="h-14 text-lg font-medium flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-full w-full shadow-md transition-all duration-200"
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
