'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function TopBar({
  title,
  left,
  right,
  className,
}: {
  title: string
  left?: ReactNode
  right?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('sticky top-0 z-30 -mx-4 mb-4 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {left}
          <div className="text-base font-semibold text-gray-900">{title}</div>
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </div>
  )
}

export function BrandLink() {
  return (
    <Link href="/items" className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-600 text-xs font-bold text-white">
        S
      </span>
      <span className="text-base font-bold tracking-tight text-gray-900">Stowed</span>
    </Link>
  )
}


