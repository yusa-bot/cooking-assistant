'use client'

import { useState, useRef } from 'react'

export default function FullApiTest() {
  const [base64, setBase64] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [recipeResult, setRecipeResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // capture -> base64 preview
  function handleCapture() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setBase64(dataUrl)
      setPreviewUrl(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  // upload to /api/images/upload
  async function handleUpload() {
    if (!fileInputRef.current?.files?.[0]) return
    const file = fileInputRef.current.files[0]
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/images/upload', { method: 'POST', body: form })
    const json = await res.json()
    setUploadResult(json)
  }

  // create recipe using uploaded image URL
  async function handleCreateRecipe() {
    if (!uploadResult?.imageUrl) return
    const body = {
      title: '写真付きテストレシピ',
      ingredients: [{ name: '塩', amount: 2, unit: 'g' }],
      steps: [{ instruction: '味見', step_number: 1, timer: null }],
      photo_url: uploadResult.imageUrl,
      is_favorite: false,
    }
    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    setRecipeResult(json)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>統合フルフロー手動テスト</h1>

      <section style={{ marginBottom: 20 }}>
        <h2>1. カメラ起動 → プレビュー</h2>
        <input type="file" accept="image/*" capture="environment" ref={fileInputRef}
          onChange={handleFileChange} style={{ display: 'none' }} />
        <button onClick={handleCapture}>カメラ起動</button>
        {previewUrl && <img src={previewUrl} alt="preview" style={{ maxWidth: 200, margin: 8 }} />}
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>2. 画像アップロード</h2>
        <button onClick={handleUpload}>Upload Image</button>
        <pre>{JSON.stringify(uploadResult, null, 2)}</pre>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>3. レシピ作成 (DB テスト)</h2>
        <button onClick={handleCreateRecipe}>Create Recipe</button>
        <pre>{JSON.stringify(recipeResult, null, 2)}</pre>
      </section>

      <section>
        <h2>4. 全レシピ取得</h2>
        <button onClick={() => fetch('/api/recipes').then(r => r.json()).then(setRecipeResult)}>
          Fetch All Recipes
        </button>
        <pre>{JSON.stringify(recipeResult, null, 2)}</pre>
      </section>
    </div>
  )
}
