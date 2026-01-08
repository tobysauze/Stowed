'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { X, Flashlight, RotateCcw, Settings } from 'lucide-react'
import { TopBar } from '@/components/ui/TopBar'

// Minimal barcode scanning using BarcodeDetector when available (Chrome/Edge/Android).
// iOS Safari support is limited; in that case we fall back to manual entry.

type ScanState = 'idle' | 'running' | 'found' | 'error'

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [state, setState] = useState<ScanState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState<string>('')
  const [manual, setManual] = useState('')
  const [torchOn, setTorchOn] = useState(false)
  const trackRef = useRef<MediaStreamTrack | null>(null)

  const supportsBarcodeDetector = useMemo(() => typeof window !== 'undefined' && 'BarcodeDetector' in window, [])

  useEffect(() => {
    start()
    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const start = async () => {
    setError(null)
    setState('running')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()

      const track = stream.getVideoTracks()[0]
      trackRef.current = track

      if (!supportsBarcodeDetector) {
        setState('error')
        setError('Barcode scanning not supported in this browser. Use manual entry below.')
        return
      }

      // @ts-ignore - BarcodeDetector exists behind runtime check
      const detector = new window.BarcodeDetector({
        formats: [
          'ean_13',
          'ean_8',
          'upc_a',
          'upc_e',
          'code_128',
          'code_39',
          'qr_code',
        ],
      })

      const loop = async () => {
        if (state !== 'running') return
        try {
          if (!videoRef.current) return
          // @ts-ignore
          const barcodes = await detector.detect(videoRef.current)
          if (barcodes?.length) {
            const raw = barcodes[0].rawValue || ''
            setCode(raw)
            setState('found')
            return
          }
        } catch (e: any) {
          setError(e?.message || 'Failed to scan')
          setState('error')
          return
        }
        requestAnimationFrame(loop)
      }

      requestAnimationFrame(loop)
    } catch (e: any) {
      setError(e?.message || 'Camera permission denied')
      setState('error')
    }
  }

  const stop = () => {
    setState('idle')
    const video = videoRef.current
    const stream = video?.srcObject as MediaStream | null
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
    }
    if (video) video.srcObject = null
    trackRef.current = null
    setTorchOn(false)
  }

  const toggleTorch = async () => {
    const track = trackRef.current
    if (!track) return
    // Torch constraint support varies; ignore failures.
    try {
      // @ts-ignore
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] })
      setTorchOn(!torchOn)
    } catch {
      // no-op
    }
  }

  return (
    <div className="-mx-4 -mt-4">
      <div className="relative h-[70vh] bg-black">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />

        {/* Overlay */}
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 p-3">
            <Link
              href="/items"
              className="inline-flex items-center justify-center rounded-full bg-white/90 p-2 text-gray-900"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Link>
          </div>
          <div className="absolute left-3 top-16">
            <button
              onClick={() => alert('Settings coming next')}
              className="inline-flex items-center justify-center rounded-full bg-white/15 p-2 text-white"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute right-3 top-16">
            <button
              onClick={toggleTorch}
              className="inline-flex items-center justify-center rounded-full bg-white/15 p-2 text-white"
              aria-label="Torch"
            >
              <Flashlight className="h-5 w-5" />
            </button>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-64 rounded-2xl border-2 border-white/80" />
          </div>

          <div className="absolute bottom-4 right-4">
            <button
              onClick={() => {
                stop()
                start()
              }}
              className="inline-flex items-center justify-center rounded-xl bg-white/15 p-3 text-white"
              aria-label="Restart"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        {state === 'found' ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-600">Scanned code</div>
            <div className="break-all rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-900">
              {code}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/search?code=${encodeURIComponent(code)}`}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Search items
              </Link>
              <Link
                href={`/items/new?barcode=${encodeURIComponent(code)}`}
                className="flex-1 rounded-xl bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Add new item
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            <div className="text-sm font-semibold text-gray-900">Not your item?</div>
            <div className="text-sm text-gray-600">
              Keep barcode &amp; enter manually:
            </div>
            <div className="flex gap-2">
              <input
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="Enter barcode"
                className="flex-1 rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200"
              />
              <Link
                href={manual ? `/search?code=${encodeURIComponent(manual)}` : '#'}
                className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white"
                aria-disabled={!manual}
              >
                Go
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


