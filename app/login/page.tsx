"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, LogIn, UserPlus, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)

  // ログインフォーム
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // 新規登録フォーム
  const [registerUsername, setRegisterUsername] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)

  // ログイン処理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setIsLoggingIn(true)

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || "ログインに失敗しました")

      localStorage.setItem("user", JSON.stringify({
        email: data.email,
        username: data.username,
        token: data.token,
      }))
      router.push("/")
    } catch (err: any) {
      setLoginError("ログイン失敗: " + err.message)
    } finally {
      setIsLoggingIn(false)
    }
  }

  // 新規登録処理
  const handleRegister = async (e: React.FormEvent) => {
    const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault()
      setRegisterError("")
      setIsRegistering(true)
  
      if (registerPassword !== registerConfirmPassword) {
        setRegisterError("パスワードが一致しません")
        setIsRegistering(false)
        return
      }
  
      try {
        const res = await fetch("/api/auth", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: registerEmail,
            password: registerPassword,
            username: registerUsername,
          })
        })
        const data = await res.json()
  
        if (!res.ok) throw new Error(data.message || "登録に失敗しました")
  
        localStorage.setItem("user", JSON.stringify({
          email: data.email,
          username: data.username,
          token: data.token,
        }))
        router.push("/")
      } catch (err: any) {
        setRegisterError("登録失敗: " + err.message)
      } finally {
        setIsRegistering(false)
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="w-full max-w-md mx-auto py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>戻る</span>
        </Link>
        <h1 className="text-xl font-semibold">アカウント</h1>
        <div className="w-16"></div> {/* スペーサー */}
      </header>

      <div className="flex flex-col items-center justify-start flex-1 w-full max-w-md mx-auto">
        {/* タブ切り替え */}
        <div className="w-full flex mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-3 font-medium text-center ${
              activeTab === "login" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"
            }`}
          >
            ログイン
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-3 font-medium text-center ${
              activeTab === "register" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"
            }`}
          >
            新規登録
          </button>
        </div>

        {/* ログインフォーム */}
        {activeTab === "login" && (
          <div className="w-full bg-white border border-gray-200 rounded-lg p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  id="login-email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="login-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {loginError && <div className="text-red-500 text-sm">{loginError}</div>}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md flex items-center justify-center"
              >
                {isLoggingIn ? (
                  "ログイン中..."
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    ログイン
                  </>
                )}
              </button>

              <div className="text-center text-sm text-gray-500">
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="text-green-600 hover:text-green-700"
                >
                  アカウントをお持ちでない方はこちら
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 新規登録フォーム */}
        {activeTab === "register" && (
          <div className="w-full bg-white border border-gray-200 rounded-lg p-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-1">
                  ユーザー名
                </label>
                <input
                  type="text"
                  id="register-username"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                  placeholder="ユーザー名"
                  required
                />
              </div>

              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  id="register-email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="register-password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">6文字以上で入力してください</p>
              </div>

              <div>
                <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード（確認）
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="register-confirm-password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                  placeholder="••••••••"
                  required
                />
              </div>

              {registerError && <div className="text-red-500 text-sm">{registerError}</div>}

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md flex items-center justify-center"
              >
                {isRegistering ? (
                  "登録中..."
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    アカウント作成
                  </>
                )}
              </button>

              <div className="text-center text-sm text-gray-500">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-green-600 hover:text-green-700"
                >
                  既にアカウントをお持ちの方はこちら
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
