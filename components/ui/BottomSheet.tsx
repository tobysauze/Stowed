'use client'

import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomSheet({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title?: string
  children: ReactNode
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 mx-auto w-full max-w-3xl rounded-t-2xl bg-white shadow-xl',
          'pb-[env(safe-area-inset-bottom)]'
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="h-1.5 w-12 rounded-full bg-gray-200 absolute left-1/2 top-2 -translate-x-1/2" />
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close sheet"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 py-3">{children}</div>
      </div>
    </div>
  )
}


