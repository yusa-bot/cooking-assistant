'use client'

import { useState, useRef } from 'react'
import type { IngredientTypes } from '@/types/recipeTypes'

export default function ApiAiTest() {
  // 初期値も IngredientTypes[] の JSON 文字列に変更しておくとテストしやすいです
  const [ingredients, setIngredients] = useState<string>(
    JSON.stringify([{ name: 'tomato', amount: '1', unit: 'pc' }], null, 2)
  )
  const [generateResult, setGenerateResult] = useState<any>(null)

  const [query, setQuery] = useState('レシピ教えて')
  const [queryResult, setQueryResult] = useState<any>(null)

  const [base64, setBase64] = useState<string>('')
  const [detectResult, setDetectResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // カメラ起動 → base64 に変換
  function handleCapture() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setBase64(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleDetect() {
    try {
      const res = await fetch('/api/ai/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: base64 }),
      })
      const data = await res.json()
      setDetectResult(data)
    } catch (err) {
      setDetectResult({ error: String(err) })
    }
  }

  // 2. Generate Recipes
  async function handleGenerate() {
    let ingArr: IngredientTypes[] = []
    try {
      const parsed = JSON.parse(ingredients)
      if (Array.isArray(parsed)) {
        // 文字列アイテムならオブジェクト化、それ以外はそのまま
        ingArr = parsed.map((item) =>
          typeof item === 'string'
            ? { name: item, amount: '', unit: '' }
            : item as IngredientTypes
        )
      } else {
        throw new Error('not array')
      }
    } catch {
      // フォールバックで文字列を１件のオブジェクトに
      ingArr = [{ name: ingredients, amount: '', unit: '' }]
    }

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: ingArr }),
      })
      const data = await res.json()
      setGenerateResult(data)
    } catch (err: any) {
      setGenerateResult({ error: err.message || String(err) })
    }
  }

  async function handleQuery() {
    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      setQueryResult(await res.json())
    } catch (err) {
      setQueryResult({ error: String(err) })
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>AI API 手動テスト</h1>

      <section style={{ marginBottom: 20 }}>
        <h2>1. カメラで撮影 → Detect Ingredients</h2>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button onClick={handleCapture}>カメラ起動</button>
        {base64 && <img src={base64} alt="preview" style={{ maxWidth: 200, display: 'block', margin: '8px 0' }} />}
        <button onClick={handleDetect}>Detect</button>
        <pre>{JSON.stringify(detectResult, null, 2)}</pre>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>2. Generate Recipes</h2>
        <textarea
          rows={4}
          value={ingredients}
          onChange={e => setIngredients(e.target.value)}
          style={{ width: '60%', fontFamily: 'monospace' }}
        />
        <button onClick={handleGenerate} style={{ marginLeft: 8 }}>
          Generate
        </button>
        <pre>{JSON.stringify(generateResult, null, 2)}</pre>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>3. AI Query</h2>
        <input
          type="text"
          placeholder="Query text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ width: '60%' }}
        />
        <button onClick={handleQuery} style={{ marginLeft: 8 }}>
          Query
        </button>
        <pre>{JSON.stringify(queryResult, null, 2)}</pre>
      </section>
    </div>
  )
}
