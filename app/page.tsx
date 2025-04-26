"use client"

import type React from "react"
import { Camera, LogIn, ChefHat, ChevronRight, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import LoginPromptModal from "@/components/login-prompt-modal"
import RecipePopup from "@/components/recipe-popup"
import { RecipeTypes,IngredientTypes,StepTypes } from "@/types/recipeTypes"

interface User {
  id: string
  email: string
  userName?: string
}



interface ApiResponse {
  recipes: RecipeTypes[]
}


export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [cookingHistory, setCookingHistory] = useState<RecipeTypes[]>([]) //配列
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeTypes[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginFeature, setLoginFeature] = useState("この機能")
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeTypes | null>(null)
  const [user,setUser] = useState<User>()

  // ログイン状態と履歴を確認
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/user")
      if (!res.ok) {
        setIsLoggedIn(false)
        setUsername("")
        return
      }
      
      const data = await res.json()
      console.log(data)
      if (data.user) {
        setIsLoggedIn(true)
        setUsername(data.user.userName || "")
      } else {
        setIsLoggedIn(false)
        setUsername("")
      }
    }
    fetchUser()
  },[])
      
  useEffect(() => {
    if (!user) return
      const userData = user as User
      setIsLoggedIn(true)
      setUsername(userData.userName || "")

      // ログイン済みの場合、履歴データを取得
      const fetchHistory = async () => {
        try {
          const res = await fetch("/api/recipes", {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${userData.id}`,
            },
          })
          if (!res.ok) throw new Error(`Error fetching recipes: ${res.status}`);

          const data: ApiResponse = await res.json()
          setCookingHistory(data.recipes)
        } catch (err) {
          console.error("履歴の取得エラー:", err)
          setCookingHistory([])
        }
      }
      fetchHistory()

    //レシピ帳用に変える
    // ログイン済みの場合、レシピ帳データを取得
    const fetchFavorite = async () => {
      try {
        const res = await fetch("/api/recipes", {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userData.id}`,
          },
        })
        if (!res.ok) throw new Error("レシピ帳取得に失敗")
        const data: ApiResponse = await res.json()
        setFavoriteRecipes(data.recipes)
      } catch (err) {
        console.error("レシピ帳の取得エラー:", err)
        setFavoriteRecipes([])
      }
    }
    fetchFavorite()
      
  }, [user]);
  


  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setUsername("")
  }

  // 未ログイン時にログインモーダルを表示
  const handleScanClick = (e: React.MouseEvent) => {
    e.preventDefault()
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

  // お気にレシピをクリックしたときの処理
  const handleRecipeClick = (recipe: RecipeTypes) => {
    // レシピの詳細情報を設定
    setSelectedRecipe({
      ...recipe,
      steps: recipe.steps || [],
      ingredients: recipe.ingredients || []
    })
  }

  // 履歴をクリックしたときの処理
  const handleHistoryClick = (recipe: RecipeTypes) => {
    // 履歴からレシピの詳細情報を設定
    setSelectedRecipe({
      ...recipe,
      steps: recipe.steps || [],
      ingredients: recipe.ingredients || []      
    })
  }

  // 調理を開始する
  const startCooking = (recipeId: string, source: string) => {
    // 遷移元を記録
    //TODO:履歴から調理する場合は、調理スタート時にjotaiに保存する
    localStorage.setItem("recipeSource", source)
    router.push(`/recipes/${recipeId}/steps`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gray-50">
      {/* ヘッダー */}
      <header className="w-full max-w-md mx-auto py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ChefHat className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold">AIレシピアシスタント</h1>
        </div>
      </header>

      <div className="text-center text-sm text-gray-500 mt-4">
        <p>材料の写真を撮影してAIがレシピを提案します</p>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto space-y-8 py-4">
        {isLoggedIn && (
          <div className="w-full text-center mb-2">
            <p className="text-gray-600">
              ようこそ、<span className="font-medium">{username}</span> さん
            </p>
          </div>
        )}

        <div className="w-full shadow-lg border rounded-lg overflow-hidden bg-white">
          <div className="p-6">
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleScanClick}
                className="h-16 text-lg justify-start font-medium flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full w-full"
              >
                <Camera className="mr-3 h-6 w-6" />
                材料をスキャンする
              </button>

              {isLoggedIn ? (
                <button
                  className="h-16 text-lg justify-start font-medium flex items-center px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 w-full"
                  onClick={handleLogout}
                >
                  <LogIn className="mr-3 h-6 w-6" />
                  ログアウト
                </button>
              ) : (
                <Link
                  href="/login"
                  className="h-16 text-lg justify-start font-medium flex items-center px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 w-full"
                >
                  <LogIn className="mr-3 h-6 w-6" />
                  ログイン / 新規登録
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* レシピ帳セクション */}
        {isLoggedIn && (
          <div className="w-full mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">レシピ帳</h2>
              {favoriteRecipes.length > 0 && (
                <Link href="/recipe-book" className="text-green-600 flex items-center text-sm">
                  もっと見る
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              )}
            </div>

            {favoriteRecipes.length > 0 ? (
              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-4" style={{ minWidth: "min-content" }}>
                  {favoriteRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex-shrink-0 w-40 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                      onClick={() => handleRecipeClick(recipe)}
                    >
                      <div className="aspect-square w-full overflow-hidden">
                        <img
                          src={recipe.photo_url || "/placeholder.svg"}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm truncate">{recipe.title}</h3>
                        <div className="flex items-center mt-1">
                          <BookOpen className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600">レシピ帳</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : isLoggedIn ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-600 mb-2">レシピ帳にはまだ何も追加されていません</p>
                <Link href="/recipes" className="text-green-600 hover:text-green-700 text-sm font-medium">
                  レシピを探す
                </Link>
              </div>
            ) : null}
          </div>
        )}

        {/* 料理履歴セクション */}
        <div className="w-full mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">料理履歴</h2>
            {isLoggedIn && cookingHistory.length > 0 && (
              <Link href="/history" className="text-green-600 flex items-center text-sm">
                もっと見る
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            )}
          </div>

          {isLoggedIn ? (
            cookingHistory.length > 0 ? (
              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-4" style={{ minWidth: "min-content" }}>
                  {cookingHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex-shrink-0 w-40 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                      onClick={() => handleHistoryClick(item)}
                    >
                      <div className="aspect-square w-full overflow-hidden">
                        <img
                          src={item.photo_url || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm truncate">{item.title}</h3>
                        <p className="text-gray-500 text-xs mt-1">{item.created_at}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-600">まだ料理履歴がありません。最初の料理を記録しましょう！</p>
              </div>
            )
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-gray-600 mb-2">ログインすると料理履歴を保存できます</p>
              <Link href="/login" className="text-green-600 hover:text-green-700 text-sm font-medium">
                ログインして履歴を保存する
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* レシピポップアップ */}
      {selectedRecipe && (
        <RecipePopup
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onStartCooking={() => startCooking(selectedRecipe.id!, "home")}
        />
      )}

      {/* ログインプロンプトモーダル */}
      <LoginPromptModal isOpen={showLoginModal} onClose={closeLoginModal} featureName={loginFeature} />
    </main>
  )
}




// return (
//   <main>
//     <header>
//       <div>
//         <ChefHat/> <h1>AIレシピアシスタント</h1>
//       </div>
//     </header>

//     <div> <p>材料の写真を撮影してAIがレシピを提案します</p> </div>

//     <div >
//       isLoggedInがtrueの時のみ表示
//       {isLoggedIn && (<div> <p>ようこそ、<span>{username}</span> さん</p> </div>)}

//       <div >
//         <div>
//           <div>
//           ログイン : /scan, 未ログイン : setShowLoginModal
//             <button onClick={handleScanClick}> <Camera/>材料をスキャンする </button>

//           白い方のボタン
//             {
//               isLoggedIn ? (<button onClick={handleLogout}> <LogIn/>ログアウト </button>) 
//               : 
//               (<Link href="/login"> <LogIn/>ログイン / 新規登録 </Link>)
//             }

//           </div>
//         </div>
//       </div>

//       <div>


//         {/* レシピ帳セクション */}
//         {isLoggedIn && (
//           <div>

//             <div>
//               <h2>レシピ帳</h2>
//               {favoriteRecipes.length > 0 && ( <Link href="/recipe-book"> もっと見る<ChevronRight/> </Link> )}
//             </div>

//             {favoriteRecipes.length > 0 ? (
//               <div>
//                 <div>
//                   {favoriteRecipes.map((recipe) => (        set(今このレシピだよと状態を持っておく)
//                     <div key={recipe.id} onClick={() => handleRecipeClick(recipe)}>
//                       <div> <img src={recipe.imageUrl} alt={recipe.name}/> </div>
//                       <div> 
//                         <h3>{recipe.name}</h3> 
//                         <BookOpen/><span>レシピ帳</span>
//                       <div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
              
//             ) : isLoggedIn ? (
//               <div>
//                 <p>レシピ帳にはまだ何も追加されていません</p>
//                 <Link href="/recipes">
//                   レシピを探す
//                 </Link>
//               </div>
//             ) : null}
//           </div>
//         )}


//         {/* 料理履歴セクション */}
//         <div>
//           <h2 >料理履歴</h2>
//           {isLoggedIn && cookingHistory.length > 0 && (<Link href="/history"> もっと見る<ChevronRight/> </Link>) }
//         </div>

//         {isLoggedIn ? (cookingHistory.length > 0 ? (

//             <div>
//               <div>
//                 {cookingHistory.map((item) => (
//                   <div key={item.id}>
//                     <div> <img src={item.photoUrl} alt={item.recipeName} /> </div>
//                     <div> <h3>{item.recipeName}</h3> <p>{item.cookedAt}</p> </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div> <p>まだ料理履歴がありません。最初の料理を記録しましょう！</p> </div>
//           )

//         ) : (
//           <div>
//             <p>ログインすると料理履歴を保存できます</p>
//             <Link href="/login">ログインして履歴を保存する</Link>
//           </div>
//         )}
//       </div>
//     </div>

//           {/* レシピポップアップ */}
//        {selectedRecipe && (
//         <RecipePopup
//           recipe={selectedRecipe}
//           onClose={() => setSelectedRecipe(null)}
//           onStartCooking={() => startCooking(selectedRecipe.id, "home")}
//         />
//       )}

// component/login-prompt-modal.tsx
// 常にtsxにあるけど、login-prompt-modal.tsx内で、isOpenの値によって表示有無が変わる
//     {/* ログインプロンプトモーダル */}
//     <LoginPromptModal isOpen={showLoginModal} onClose={closeLoginModal} featureName={loginFeature} />
//   </main>