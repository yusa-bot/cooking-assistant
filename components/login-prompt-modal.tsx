"use client"

import { useState, useEffect } from "react"
import { LogIn, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface LoginPromptModalProps {
  isOpen: boolean
  onClose: () => void
  featureName?: string
}

export default function LoginPromptModal({ isOpen, onClose, featureName = "この機能" }: LoginPromptModalProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300) // アニメーション時間に合わせる
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen && !isVisible) return null

  const handleLogin = () => {
    router.push("/login")
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 transform transition-transform duration-300 ${
          isOpen ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">ログインが必要です</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {featureName}を利用するには、ログインが必要です。ログインすると以下の機能が利用できます：
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
            <li>料理の履歴を保存</li>
            <li>お気に入りレシピの登録</li>
            <li>パーソナライズされたレシピ提案</li>
            <li>調理データの複数デバイス間での同期</li>
          </ul>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={handleLogin}
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center"
          >
            <LogIn className="h-5 w-5 mr-2" />
            ログインする
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            後で行う
          </button>
        </div>
      </div>
    </div>
  )
}
