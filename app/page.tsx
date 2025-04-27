"use client"

import React, { useState, useEffect } from "react"
import { Camera, BookOpen, History, ChevronRight, Star, Clock, ChefHat } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import LoginPromptModal from "@/components/login-prompt-modal"
import RecipePopup from "@/components/recipe-popup"
import { RecipeTypes } from "@/types/recipeTypes"
import dynamic from "next/dynamic"
const Lottie = dynamic(() => import("lottie-react"), { ssr: false })
import { createClient } from "@/utils/supabase/client"
import { useAtom } from "jotai"
import { currentRecipeAtom } from "@/lib/atoms"
import { set } from "zod"


interface User {
  id: string
  email: string
  userName?: string
}

export default function Home() {
  const supabase = createClient()
  const router = useRouter()
  const [animationData, setAnimationData] = React.useState<any>(null)
  React.useEffect(() => {
    fetch("/animation/homeAnimation.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
  }, [])

  // ユーザー状態
  const [user, setUser] = useState<User|null>()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  

  // UI状態
  const [activeTab, setActiveTab] = useState<'recent' | 'favorite'>('recent')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginFeature, setLoginFeature] = useState("この機能")
  const [curentRecipe, setCurentRecipe] = useAtom(currentRecipeAtom)

  // レシピデータ
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeTypes | null>(null)
  const [cookingHistory, setCookingHistory] = useState<RecipeTypes[]>([])
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeTypes[]>([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
		const getUser = async () => {
      try{
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
        setIsLoggedIn(false)
        setUser(null)
        return
      }
      setIsLoggedIn(true)
			setUser({
        id: user.id,
        email: user.email ?? '',
        userName: user?.user_metadata?.user_name ?? '',				
			});
    }catch (error) {
      console.error("ユーザー情報の取得に失敗しました", error)
      setIsLoggedIn(false)
      setUser(null)
    }finally{
      setIsLoading(false)      
    }
    
  

		};

		// userがnullの場合のみgetUserを呼び出す
		if (!user) {
			getUser();
		}
	}, []);
  // ユーザー情報の取得

  // ユーザーデータの取得
  const fetchUserData = async (userData: User) => {
    try {
      // 履歴の取得
      const historyRes = await fetch("/api/recipes", {
        method: 'GET',
        headers: { Authorization: `Bearer ${userData.id}` },
      })

      if (historyRes.ok) {
        const data = await historyRes.json()
        setCookingHistory(data || [])
      }

      // お気に入りの取得
      const favoriteRes = await fetch("/api/recipes/favorite", {
        method: 'GET',
        headers: { Authorization: `Bearer ${userData.id}` },
      })

      if (favoriteRes.ok) {
        const data = await favoriteRes.json()
        setFavoriteRecipes(data || [])
      }
    } catch (err) {
      console.error("データ取得エラー:", err)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserData(user)
    }
  }, [user])

  // ログアウト処理
  const handleLogout = () => {
    supabase.auth.signOut()
    setIsLoggedIn(false)
    setUser(null)
    router.push("/login")
  }

  // スキャン開始
  const handleScanClick = () => {
    if (!isLoggedIn) {
      setLoginFeature("材料スキャン機能")
      setShowLoginModal(true)
    } else {
      router.push("/scan")
    }
  }

  // モーダルを閉じる
  const closeLoginModal = () => {
    setShowLoginModal(false)
  }

  // レシピ選択
  const handleRecipeClick = (recipe: RecipeTypes) => {
    setSelectedRecipe({
      ...recipe,
      ingredients: recipe.ingredients || [],
      steps: recipe.steps || []
    })
  }

  // 調理開始
  const startCooking = (recipeId: string, source: string) => {
    setCurentRecipe(selectedRecipe)
    router.push(`/cooking/steps`)
  }

  // 表示するレシピリスト
  const displayRecipes = activeTab === 'recent' ? cookingHistory : favoriteRecipes

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      
      <div className="relative bg-white shadow-md">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <header className="relative flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 rounded-lg p-1.5">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <h1
              className="text-2xl font-extrabold tracking-tighter text-green-600 select-none"
              style={{
                fontFamily: "'BIZ UDPGothic', 'M PLUS Rounded 1c', 'Noto Sans JP', sans-serif",
                letterSpacing: '-0.08em',
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              <span style={{ fontSize: '1.3em', letterSpacing: '-0.12em' }}>AI</span>
              <span style={{ fontSize: '1em', marginLeft: '0.1em' }}>Chef</span>
            </h1>
          </div>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-green-800 hidden md:inline-block">
                {user?.userName} さん
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={() => router.push('/recipe-book')}
                  className="p-2 rounded-full hover:bg-green-50 transition-colors"
                  aria-label="レシピ帳"
                >
                  <BookOpen className="h-5 w-5 text-green-700" />
                </button>
                <button
                  onClick={() => router.push('/history')}
                  className="p-2 rounded-full hover:bg-green-50 transition-colors"
                  aria-label="履歴"
                >
                  <History className="h-5 w-5 text-green-700" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-red-50 transition-colors"
                  aria-label="ログアウト"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
            >
              ログイン
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </header>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-5xl mx-auto px-4 pb-0">
        {/* ヒーローセクション */}
        <section className="py-6 md:py-10 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          
          <div className="md:w-1/2 space-y-4 z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
              お持ちの材料から<br />
              <span className="text-green-600">AI</span>が最適なレシピを提案
            </h2>
            <p className="text-gray-600">
              写真を撮るだけで、あなたに合ったレシピを自動提案。
              無駄なく、おいしく、簡単に。
            </p>

            <div className="pt-3">
              <button
                onClick={handleScanClick}
                className="group flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition duration-150 font-medium shadow-md shadow-green-200"
              >
                <Camera className="h-5 w-5 group-hover:scale-110 transition-transform" />
                材料をスキャンする
              </button>
            </div>
          </div>
        </section>

        {isLoggedIn && (
          <div className="my-6">
            <div className="flex space-x-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('recent')}
                className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                  activeTab === 'recent'
                    ? 'text-green-700'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                最近の料理
                {activeTab === 'recent' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('favorite')}
                className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                  activeTab === 'favorite'
                    ? 'text-green-700'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                お気に入り
                {activeTab === 'favorite' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* レシピグリッド */}
        {isLoggedIn ? (
          isLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">読み込み中...</p>
            </div>
          ) : displayRecipes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => handleRecipeClick(recipe)}
                  className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-green-200 hover:-translate-y-0.5"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={recipe.photo_url || "/placeholder.svg"}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {recipe.is_favorite && (
                      <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 line-clamp-1">{recipe.title}</h3>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{recipe.created_at?.split('T')[0] || '最近'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-100">
              <div className="inline-block p-3 bg-green-50 rounded-full mb-3">
                {activeTab === 'recent' ? (
                  <History className="h-6 w-6 text-green-600" />
                ) : (
                  <Star className="h-6 w-6 text-green-600" />
                )}
              </div>
              <h3 className="text-lg font-medium mb-2">
                {activeTab === 'recent' ? '料理履歴がありません' : 'お気に入りがありません'}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {activeTab === 'recent'
                  ? '材料をスキャンして最初の料理を記録しましょう！'
                  : 'お気に入りのレシピを追加して、いつでも簡単にアクセスできます'}
              </p>
              <button
                onClick={handleScanClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors font-medium"
              >
                <Camera className="h-4 w-4" />
                材料をスキャン
              </button>
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-100 mt-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                <path d="M12 8v4"></path>
                <path d="M12 16h.01"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">ログインして全機能を活用</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              ログインすると料理履歴の保存、お気に入りレシピの登録、パーソナライズされた提案など、すべての機能が利用できます。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="px-6 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
              >
                ログインする
              </Link>
              <button
                onClick={handleScanClick}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-1.5"
              >
                <Camera className="h-4 w-4" />
                お試しスキャン
              </button>
            </div>
          </div>
        )}

        {/* フィーチャー紹介 */}
        <section className="pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-center mb-8">アプリの機能</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="inline-block p-3 bg-blue-50 rounded-full mb-3">
                <Camera className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-lg mb-2">材料スキャン</h3>
              <p className="text-gray-600 text-sm">
                手持ちの材料を撮影するだけで、AIが自動で材料を認識し、最適なレシピを提案します。
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="inline-block p-3 bg-amber-50 rounded-full mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                  <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 3z"></path>
                  <path d="M8 9h8"></path>
                  <path d="M8 13h6"></path>
                  <path d="M8 17h4"></path>
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2">音声ガイド</h3>
              <p className="text-gray-600 text-sm">
                調理中は手が汚れていても大丈夫。音声で次のステップを案内し、質問にも答えます。
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="inline-block p-3 bg-purple-50 rounded-full mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <path d="m9 14 2 2 4-4"></path>
                </svg>
              </div>
              <h3 className="font-medium text-lg ">料理記録</h3>
              <p className="text-gray-600 text-sm">
                完成した料理を記録して、お気に入りに登録。あとで簡単に見返すことができます。
              </p>
            </div>
          </div>
        </section>

        {/* パターン4: フッター直上 */}
        <div className="flex justify-center items-center mt-0 mb-0">
          <div className="relative w-30 h-30">
            {animationData && (
              <Lottie
                animationData={animationData}
                loop={true}
                style={{ width: '100%', height: '100%' }}
              />
            )}
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2025 AI Chef - AIレシピアシスタント</p>
        </div>
      </footer>

      {/* レシピポップアップ */}
      {selectedRecipe && (
        <RecipePopup
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onStartCooking={() => startCooking(selectedRecipe.id!, "home")}
        />
      )}

      {/* ログインプロンプト */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={closeLoginModal}
        featureName={loginFeature}
      />
    </main>
  )
}
