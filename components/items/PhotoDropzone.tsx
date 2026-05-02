'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, X, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PhotoDropzone({
  files,
  onChange,
  label = 'Photos',
  hint = 'Drag photos here, or tap to choose from your device',
}: {
  files: File[]
  onChange: (files: File[]) => void
  label?: string
  hint?: string
}) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [files])

  const handleFiles = (incoming: FileList | File[] | null) => {
    if (!incoming) return
    const arr = Array.from(incoming).filter((f) => f.type.startsWith('image/'))
    if (arr.length === 0) return
    onChange([...files, ...arr])
  }

  const removeAt = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors',
          dragOver
            ? 'border-red-400 bg-red-50/60 text-red-700'
            : 'border-gray-300 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50/30'
        )}
      >
        <div className={cn('rounded-2xl p-3', dragOver ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500')}>
          <Upload className="h-6 w-6" />
        </div>
        <div className="text-sm font-semibold">
          {dragOver ? 'Drop to upload' : 'Click or drop photos here'}
        </div>
        <div className="text-xs text-gray-500">{hint}</div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {previews.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {previews.map((src, idx) => (
            <div key={src} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
              <img src={src} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={(e) => {
                  e.stopPropagation()
                  removeAt(idx)
                }}
                className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-90 transition hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-red-300 hover:text-red-500"
            aria-label="Add more photos"
          >
            <ImagePlus className="h-6 w-6" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
