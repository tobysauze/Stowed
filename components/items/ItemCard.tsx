'use client'

import Link from 'next/link'
import { MoreHorizontal, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StockBadge } from '@/components/ui/StockBadge'

export type ItemListRow = {
  id: number
  name: string
  sku: string | null
  unit: string
  total_on_hand: number
  min_required?: number | null
  updated_at?: string
  thumb_url?: string | null
  tags?: string[]
}

export function ItemCard({
  item,
  onOpenMenu,
}: {
  item: ItemListRow
  onOpenMenu: (item: ItemListRow) => void
}) {
  return (
    <div className="flex gap-3 border-b border-gray-100 py-3">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {item.thumb_url ? (
          <img src={item.thumb_url} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <Package className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/items/${item.id}`} className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">{item.name}</div>
            <div className="mt-1 flex items-center gap-2">
              <StockBadge
                qty={item.total_on_hand}
                unit={item.unit}
                minRequired={item.min_required}
              />
              {item.sku ? (
                <span className="truncate text-xs text-gray-500">{item.sku}</span>
              ) : null}
            </div>
          </Link>

          <button
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Item actions"
            onClick={() => onOpenMenu(item)}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {item.tags?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {item.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-medium',
                  'bg-gray-100 text-gray-600'
                )}
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}


