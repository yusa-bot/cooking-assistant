"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Plus, X, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import LoginPromptModal from "@/components/login-prompt-modal"
import dynamic from "next/dynamic"
const Loading = dynamic(() => import("@/components/Loading"), { ssr: false })
import { useAtom } from 'jotai'
import { ingredientListAtom,generatedRecipesAtom } from '@/lib/atoms'
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
  const [ingredientList, setIngredientList] = useState<IngredientTypes[]>([])
  const [currentIngredient, setcurrentIngredient] = useAtom(ingredientListAtom) // <IngredientTypes[]>
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const [showSuggestions, setShowSuggestions] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  const [, setGeneratedRecipes] = useAtom(generatedRecipesAtom) // <RecipeTypes[]>
  const [isLoading, setIsLoading] = useState(false)

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
    setIngredientList(currentIngredient)
    fetchUser()
  },[])

  // 材料を追加する関数
  const addIngredient = (addIngredient: IngredientTypes) => {
    if (addIngredient && addIngredient.name) {
      if (editingIndex !== null) {
        // 既存の材料を編集する場合
        const updatedIngredients = [...ingredientList];
        updatedIngredients[editingIndex] = addIngredient;
        setIngredientList(updatedIngredients);
        setcurrentIngredient(updatedIngredients);
        setEditingIndex(null);
      } else if (!ingredientList.some(i => i.name === addIngredient.name)) {
        // 新しい材料を追加する場合
        const updatedIngredients = [...ingredientList, addIngredient];
        setIngredientList(updatedIngredients);
        setcurrentIngredient(updatedIngredients);
      }
      setNewIngredient({ name: '', amount: '', unit: '' });
      setShowSuggestions(false);
    }
  }

  // 材料を削除する関数
  const removeIngredient = (index: number) => {
    const updatedIngredients = [...ingredientList];
    updatedIngredients.splice(index, 1);
    setIngredientList(updatedIngredients);
    setcurrentIngredient(updatedIngredients);
    if (editingIndex === index) {
      setEditingIndex(null);
      setNewIngredient({ name: '', amount: '', unit: '' });
    }
  }

  // 材料を編集モードにする関数
  const editIngredient = (index: number) => {
    setEditingIndex(index);
    setNewIngredient({ ...ingredientList[index] });
  }

  // 材料の特定フィールドを直接編集する関数
  const updateIngredient = (index: number, field: keyof IngredientTypes, value: string) => {
    const updatedIngredients = [...ingredientList];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };
    setIngredientList(updatedIngredients);
    setcurrentIngredient(updatedIngredients);
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
    setIsLoading(true)
    try {
      setcurrentIngredient(ingredientList) // <IngredientTypes[]>
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentIngredient: ingredientList }),
      });
      if (!res.ok) throw new Error(`Error generating recipes: ${res.status}`);

      const data = await res.json()
      setGeneratedRecipes(data)
      router.push("/recipes")
    } finally {
      
    }
  }


  // モーダルを閉じる
  const closeLoginModal = () => {
    setShowLoginModal(false)
    router.push("/")
  }

  if (!isLoggedIn && !showLoginModal) {
    return null // ログインモーダルが表示される前は何も表示しない
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loading />
        <p className="mt-4 text-lg font-bold text-green-700 dark:text-green-700">レシピを生成中...</p>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
      <header className="w-full max-w-xl mx-auto py-4 flex items-center justify-between mb-4">
        <Link
          href="/scan"
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1.5" />
          <span className="font-medium">戻る</span>
        </Link>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100">材料の確認</h1>
        <div className="w-16"></div> {/* スペーサー */}
      </header>

      <div className="flex flex-col items-center justify-start flex-1 w-full max-w-xl mx-auto">
        <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 md:p-6 mb-6 shadow-md">
          <h2 className="text-xl font-bold mb-5 text-green-700 dark:text-green-400 tracking-wide flex items-center">
            材料リスト
          </h2>
          {ingredientList.length > 0 ? (
          <ul className="mb-6 space-y-3 max-h-[336px] overflow-y-auto pr-1">
            <li className="flex items-center bg-transparent px-1 text-xs text-gray-500 dark:text-gray-400 font-semibold space-x-3 mb-0 pb-0" style={{ marginBottom: '-0.25rem' }}>
              <span className="flex-1 min-w-0">材料名</span>
              <span className="w-8 text-center">量</span>
              <span className="w-8 text-center">単位</span>
              <span className="w-8"></span>
            </li>
            {ingredientList.map((item, index) => (
            <li
            key={index}
            className="flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl  py-1 shadow-sm space-x-3"
            >
            <input
            type="text"
            value={item.name}
            onChange={(e) => updateIngredient(index, 'name', e.target.value)}
            className="flex-1 min-w-0 bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100 text-sm md:text-base"
            placeholder="材料名"
            />
            <input
            type="text"
            value={item.amount || ''}
            onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
            className="w-8 bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100 text-sm md:text-base"
            placeholder="量"
            />
            <input
            type="text"
            value={item.unit || ''}
            onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
            className="w-8 bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100 text-sm md:text-base"
            placeholder="単位"
            />
            <button
            onClick={() => removeIngredient(index)}
            className="rounded-full p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center"
            aria-label={`${item.name}を削除`}
            >
            <X className="h-4 w-4" />
            </button>
            </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 mb-6 text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm md:text-base flex flex-col items-center space-y-2">
              <span>材料が登録されていません</span>
              <span className="text-sm text-gray-400 dark:text-gray-500">下のフォームから追加してください</span>
            </div>
          )}
          <div className="mt-6 bg-gray-50 dark:bg-gray-700/40  rounded-xl shadow-sm">
            <h3 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-200">新しい材料を追加</h3>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={newIngredient.name}
                  onChange={(e) => handleInputChange(e, 'name')}
                  placeholder="材料名"
                  className="flex-1 min-w-0 bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100 text-sm md:text-base"
                />
                <input
                  type="text"
                  value={newIngredient.amount || ''}
                  onChange={(e) => handleInputChange(e, 'amount')}
                  placeholder="量"
                  className="w-8 bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100 text-sm md:text-base"
                />
                <input
                  type="text"
                  value={newIngredient.unit || ''}
                  onChange={(e) => handleInputChange(e, 'unit')}
                  placeholder="単位"
                  className="w-8 bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100 text-sm md:text-base"
                />
                <button
                  onClick={() => {
                    if (newIngredient && newIngredient.name) {
                      addIngredient(newIngredient);
                    }
                  }}
                  className="rounded-full p-1.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
                  disabled={!newIngredient.name}
                  aria-label="材料を追加"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <button
            onClick={goToRecipes}
            disabled={ingredientList.length === 0}
            className="h-14 text-lg font-medium flex items-center justify-center px-4 py-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white rounded-full w-full  transition-all duration-200"
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
