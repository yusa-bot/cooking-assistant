// filepath: /app/api-test/ai/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X, Save, ArrowLeft } from 'lucide-react'
import type { IngredientTypes } from '@/types/recipeTypes'

export default function ApiAiTest() {
  const [ingredients, setIngredients] = useState<IngredientTypes[]>([])
  const [detectResult, setDetectResult] = useState<{ ingredients?: IngredientTypes[]; error?: string }>()
  const [generateResult, setGenerateResult] = useState<any>(null)

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // カメラ起動／停止
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsCameraActive(true)
      }
    } catch (err) {
      console.error(err)
      alert('カメラへのアクセスに失敗しました')
    }
  }
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
      setIsCameraActive(false)
    }
  }

  // キャプチャ
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/png')
    setPhotoUrl(dataUrl)
    stopCamera()
  }

  const removePhoto = () => {
    setPhotoUrl(null)
  }
  const retakePhoto = () => {
    setPhotoUrl(null)
    startCamera()
  }

  // モーダル等はなし。AI呼び出し
  const handleDetect = async () => {
    if (!photoUrl) return
    try {
      const res = await fetch('/api/ai/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: photoUrl }),
      })
      const data = await res.json()
      setDetectResult(data)
      if (data.ingredients) {
        setIngredients(data.ingredients)
      }
    } catch (err: any) {
      setDetectResult({ error: err.message })
    }
  }

  const handleGenerate = async () => { 
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients:        detectResult}),
      })
      setGenerateResult(await res.json())
    } catch (err: any) {
      setGenerateResult({ error: err.message })
    }
  }

  // マウント時に自動でカメラ起動
  useEffect(() => {
    if (!photoUrl) startCamera()
    return () => stopCamera()
  }, [])

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: 'auto' }}>
      <h1>AI API 手動テスト</h1>

      <section style={{ margin: '20px 0' }}>
        <h2>1. カメラで撮影 → Detect Ingredients</h2>

        <div style={{ position: 'relative', width: '100%', paddingBottom: '75%', background: '#eee', marginBottom: 10 }}>
          {photoUrl ? (
            <>
              <img
                src={photoUrl}
                alt="preview"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={removePhoto}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '50%',
                  padding: 4,
                  color: '#fff',
                }}
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <video
              ref={videoRef}
              muted
              playsInline
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {!photoUrl && (
          <button
            onClick={capturePhoto}
            disabled={!isCameraActive}
            style={{ padding: '8px 16px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 4 }}
          >
            <Camera size={16} style={{ marginRight: 4 }} />
            Capture
          </button>
        )}

        {photoUrl && (
          <button
            onClick={retakePhoto}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              background: '#fff',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Camera size={16} style={{ marginRight: 4 }} />
            Retake
          </button>
        )}

        <button
          onClick={handleDetect}
          disabled={!photoUrl}
          style={{
            marginLeft: 8,
            padding: '8px 16px',
            background: '#2196f3',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
          }}
        >
          <Save size={16} style={{ marginRight: 4 }} />
          Detect
        </button>

        <pre style={{ background: '#f7f7f7', padding: 8, marginTop: 10 }}>
          {JSON.stringify(detectResult, null, 2)}
        </pre>
      </section>

      <section style={{ margin: '20px 0' }}>
        <h2>2. Generate Recipes</h2>
        <div style={{ marginBottom: 10 }}>
          {ingredients.map((ingredient, index) => (
            <div key={index} style={{ padding: 8, background: '#eee', borderRadius: 4, marginBottom: 4 }}>
              {ingredient.name}
              {ingredient.amount}
              {ingredient.unit}
            </div>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          style={{
            marginTop: 8,
            padding: '8px 16px',
            background: '#f57c00',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ArrowLeft size={16} style={{ marginRight: 4 }} />
          Generate
        </button>
        <pre style={{ background: '#f7f7f7', padding: 8, marginTop: 10 }}>
          {JSON.stringify(generateResult, null, 2)}
        </pre>
      </section>
    </div>
  )
}
