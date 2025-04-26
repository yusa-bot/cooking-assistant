'use client'

import { useState, useRef } from 'react'

export default function ApiImagesTest() {
  const [preview, setPreview] = useState<string>('')
  const [uploadResult, setUploadResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleCapture() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleUpload() {
    if (!fileInputRef.current?.files?.[0]) return
    const file = fileInputRef.current.files[0]
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      setUploadResult(data)
    } catch (err) {
      setUploadResult({ error: String(err) })
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Image Upload API 手動テスト</h1>
      <section style={{ marginBottom: 20 }}>
        <h2>1. カメラ起動 → プレビュー</h2>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button onClick={handleCapture}>カメラ起動</button>
        {preview && (
          <div>
            <img src={preview} alt="preview" style={{ maxWidth: 200, margin: '8px 0' }} />
            <button onClick={handleUpload}>Upload</button>
          </div>
        )}
      </section>
      <section>
        <h2>2. レスポンス</h2>
        <pre>{JSON.stringify(uploadResult, null, 2)}</pre>
      </section>
    </div>
  )
}
