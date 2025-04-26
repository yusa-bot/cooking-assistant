// filepath: /app/api-test/images/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'

export default function ApiImagesTest() {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null)
    const [uploadResult, setUploadResult] = useState<any>(null)
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

    // 撮影
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

    const retakePhoto = () => {
        setPhotoUrl(null)
        startCamera()
    }

    // dataURL → Blob
    function dataURLtoBlob(dataUrl: string): Blob {
        const [header, base64] = dataUrl.split(',')
        const mime = header.match(/:(.*?);/)?.[1] || ''
        const binary = atob(base64)
        const array = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i)
        }
        return new Blob([array], { type: mime })
    }

    // アップロード
    async function handleUpload() {
        if (!photoUrl) return
        const blob = dataURLtoBlob(photoUrl)
        const formData = new FormData()
        formData.append('file', blob, 'capture.png')

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

    useEffect(() => {
        startCamera()
        return () => stopCamera()
    }, [])

    return (
        <div style={{ padding: 20 }}>
            <h1>Image Upload API 手動テスト</h1>
            <section style={{ marginBottom: 20 }}>
                <h2>1. カメラ起動 → プレビュー</h2>
                <div
                    style={{
                        position: 'relative',
                        width: 300,
                        paddingBottom: '56.25%',
                        background: '#eee',
                        marginBottom: 8,
                    }}
                >
                    {!photoUrl ? (
                        <video
                            ref={videoRef}
                            muted
                            playsInline
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <img
                            src={photoUrl}
                            alt="preview"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    )}
                </div>

                {!photoUrl && (
                    <button
                        onClick={capturePhoto}
                        disabled={!isCameraActive}
                        style={{
                            padding: '8px 16px',
                            background: '#4caf50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                        }}
                    >
                        撮影
                    </button>
                )}

                {photoUrl && (
                    <button
                        onClick={retakePhoto}
                        style={{
                            padding: '8px 16px',
                            background: '#f57c00',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            marginRight: 8,
                        }}
                    >
                        再撮影
                    </button>
                )}

                {photoUrl && (
                    <button
                        onClick={handleUpload}
                        style={{
                            padding: '8px 16px',
                            background: '#2196f3',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                        }}
                    >
                        Upload
                    </button>
                )}

                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </section>

            <section>
                <h2>2. レスポンス</h2>
                <pre style={{ background: '#f7f7f7', padding: 8 }}>
                    {JSON.stringify(uploadResult, null, 2)}
                </pre>
            </section>
        </div>
    )
}
