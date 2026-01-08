'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Fab({
  children,
  onClick,
  ariaLabel,
  className,
}: {
  children: ReactNode
  onClick: () => void
  ariaLabel: string
  className?: string
}) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        'fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg',
        'hover:bg-red-700 active:scale-[0.98]',
        className
      )}
    >
      {children}
    </button>
  )
}


