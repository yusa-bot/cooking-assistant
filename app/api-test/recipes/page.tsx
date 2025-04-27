'use client'

import { useState } from 'react'

export default function ApiRecipesTest() {
  const [allRecipes, setAllRecipes] = useState<any>(null)
  const [recipeId, setRecipeId] = useState('')
  const [singleRecipe, setSingleRecipe] = useState<any>(null)
  const [newRecipeJson, setNewRecipeJson] = useState(`{
  "title": "テストレシピ",
  "description": "説明",
  "creator_id": null,
  "ingredients": [
    { "name": "塩", "amount": 1, "unit": "g" }
  ],
  "steps": [
    { "instruction": "混ぜる", "step_number": 1, "timer": null }
  ],
  "photo_url": null,
  "is_favorite": false
}`)
  const [createResult, setCreateResult] = useState<any>(null)

  async function fetchAll() {
    try {
      const res = await fetch('/api/recipes')
      setAllRecipes(await res.json())
    } catch (err) {
      setAllRecipes({ error: String(err) })
    }
  }

  async function fetchOne() {
    try {
      const res = await fetch(`/api/recipes/${recipeId}`)
      setSingleRecipe(await res.json())
    } catch (err) {
      setSingleRecipe({ error: String(err) })
    }
  }

  async function createRecipe() {
    try {
      const body = JSON.parse(newRecipeJson)
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setCreateResult(await res.json())
    } catch (err) {
      setCreateResult({ error: String(err) })
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Recipe API 手動テスト</h1>

      <section style={{ marginBottom: 20 }}>
        <h2>1. 全レシピ取得</h2>
        <button onClick={fetchAll}>Fetch All</button>
        <pre>{JSON.stringify(allRecipes, null, 2)}</pre>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>2. 単一レシピ取得</h2>
        <input
          type="text"
          placeholder="Recipe ID"
          value={recipeId}
          onChange={e => setRecipeId(e.target.value)}
          style={{ width: '60%' }}
        />
        <button onClick={fetchOne} style={{ marginLeft: 8 }}>Fetch One</button>
        <pre>{JSON.stringify(singleRecipe, null, 2)}</pre>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>3. レシピ作成</h2>
        <textarea
          rows={8}
          value={newRecipeJson}
          onChange={e => setNewRecipeJson(e.target.value)}
          style={{ width: '60%' }}
        />
        <button onClick={createRecipe} style={{ marginLeft: 8 }}>
          Create
        </button>
        <pre>{JSON.stringify(createResult, null, 2)}</pre>
      </section>
    </div>
  )
}
